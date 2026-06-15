import { useState, useEffect } from 'react'
import { useLanguage } from '../context/languageContext'

function StockOverview() {
  const { t } = useLanguage()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [sortBy, setSortBy] = useState('name')
  const [showRestockModal, setShowRestockModal] = useState(false)
  const [restockProduct, setRestockProduct] = useState(null)
  const [restockForm, setRestockForm] = useState({ quantity: '', buying_price: '', note: '' })
  const [restockError, setRestockError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    const [productsRes, categoriesRes] = await Promise.all([
      window.api.getProducts(),
      window.api.getCategories(),
    ])
    if (productsRes.success) setProducts(productsRes.data)
    if (categoriesRes.success) setCategories(categoriesRes.data)
    setLoading(false)
  }

  const getStockStatus = (product) => {
    if (product.stock === 0) return 'out'
    if (product.stock <= product.low_stock_threshold) return 'low'
    return 'ok'
  }

  const getStockColor = (product) => {
    const status = getStockStatus(product)
    if (status === 'out') return 'text-red-400'
    if (status === 'low') return 'text-yellow-400'
    return 'text-green-400'
  }

  const getProgressColor = (product) => {
    const status = getStockStatus(product)
    if (status === 'out') return 'bg-red-500'
    if (status === 'low') return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const getProgressWidth = (product) => {
    const max = Math.max(product.stock, product.low_stock_threshold * 3)
    return Math.min((product.stock / max) * 100, 100)
  }

  const filteredProducts = products
    .filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.barcode?.includes(search)
      const matchesCategory =
        !selectedCategory || p.category_id === parseInt(selectedCategory)
      const matchesStatus =
        filterStatus === 'all' || getStockStatus(p) === filterStatus
      return matchesSearch && matchesCategory && matchesStatus
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      if (sortBy === 'stock_asc') return a.stock - b.stock
      if (sortBy === 'stock_desc') return b.stock - a.stock
      if (sortBy === 'category')
        return (a.category_name || '').localeCompare(b.category_name || '')
      return 0
    })

  const totalProducts = products.length
  const totalStock = products.reduce((sum, p) => sum + p.stock, 0)
  const lowStockCount = products.filter(
    (p) => getStockStatus(p) === 'low'
  ).length
  const outOfStockCount = products.filter(
    (p) => getStockStatus(p) === 'out'
  ).length

  const handleRestock = (product) => {
    setRestockProduct(product)
    setRestockForm({ quantity: '', buying_price: '', note: '' })
    setRestockError('')
    setShowRestockModal(true)
  }

  const handleRestockSubmit = async () => {
    if (!restockForm.quantity || parseInt(restockForm.quantity) <= 0) {
      setRestockError(t.enterValidQuantity)
      return
    }

    const result = await window.api.restockProduct({
      product_id: restockProduct.id,
      quantity: parseInt(restockForm.quantity),
      buying_price: restockForm.buying_price
        ? parseFloat(restockForm.buying_price)
        : null,
      note: restockForm.note || null,
    })

    if (result.success) {
      setShowRestockModal(false)
      setRestockProduct(null)
      setSuccess(`${restockProduct.name} restocked successfully!`)
      loadData()
      setTimeout(() => setSuccess(''), 3000)
    } else {
      setRestockError(result.message)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400">Loading stock...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">{t.stockOverview}</h2>
        <p className="text-gray-400 mt-1">{t.stockOverviewDesc}</p>
      </div>

      {/* Success Message */}
      {success && (
        <div
          className="bg-green-500/20 border border-green-500 text-green-400
                        rounded-lg p-3 text-sm"
        >
          ✅ {success}
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <p className="text-gray-400 text-sm">{t.totalProducts}</p>
          <p className="text-white text-3xl font-bold mt-1">{totalProducts}</p>
        </div>
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <p className="text-gray-400 text-sm">{t.totalItemsInStock}</p>
          <p className="text-blue-400 text-3xl font-bold mt-1">{totalStock}</p>
        </div>
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <p className="text-gray-400 text-sm">{t.lowStock}</p>
          <p className="text-yellow-400 text-3xl font-bold mt-1">
            {lowStockCount}
          </p>
        </div>
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <p className="text-gray-400 text-sm">{t.outOfStockCount}</p>
          <p className="text-red-400 text-3xl font-bold mt-1">
            {outOfStockCount}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={`${t.search}...`}
          className="flex-1 min-w-48 bg-gray-800 border border-gray-700 text-white
                     rounded-lg px-4 py-2.5 outline-none focus:ring-2
                     focus:ring-blue-500 placeholder-gray-500 text-sm"
        />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="bg-gray-800 border border-gray-700 text-white rounded-lg
                     px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-gray-800 border border-gray-700 text-white rounded-lg
                     px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        >
          <option value="all">{t.allStatus}</option>
          <option value="ok">✅ {t.inStock}</option>
          <option value="low">⚠️ {t.lowStock}</option>
          <option value="out">❌ {t.outOfStockCount}</option>
        </select>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="bg-gray-800 border border-gray-700 text-white rounded-lg
                     px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        >
          <option value="name">{t.sortName}</option>
          <option value="stock_asc">{t.sortStockLow}</option>
          <option value="stock_desc">{t.sortStockHigh}</option>
          <option value="category">{t.sortCategory}</option>
        </select>
      </div>

      {/* Stock Table */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">
                Product
              </th>
              <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">
                {t.category}
              </th>
              <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">
                {t.stock}
              </th>
              <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">
                {t.threshold}
              </th>
              <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">
                {t.price}
              </th>
              <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">
                {t.status}
              </th>
              <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center text-gray-400 py-12">
                  No products match your filters
                </td>
              </tr>
            ) : (
              filteredProducts.map((product) => (
                <tr
                  key={product.id}
                  className="border-b border-gray-700 last:border-0
                             hover:bg-gray-750 transition-colors"
                >
                  {/* Product Name */}
                  <td className="px-6 py-4">
                    <p className="text-white font-medium">{product.name}</p>
                    {product.barcode && (
                      <p className="text-gray-500 text-xs mt-0.5">
                        #{product.barcode}
                      </p>
                    )}
                  </td>

                  {/* Category */}
                  <td className="px-6 py-4">
                    <span
                      className="bg-gray-700 text-gray-300 text-xs
                                     px-2 py-1 rounded-full"
                    >
                      {product.category_name || t.uncategorized}
                    </span>
                  </td>

                  {/* Stock Level with Progress Bar */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-gray-700 rounded-full h-2 w-24">
                        <div
                          className={`h-2 rounded-full transition-all ${getProgressColor(product)}`}
                          style={{ width: `${getProgressWidth(product)}%` }}
                        />
                      </div>
                      <span
                        className={`font-semibold text-sm ${getStockColor(product)}`}
                      >
                        {product.stock} {product.unit}
                      </span>
                    </div>
                  </td>

                  {/* Threshold */}
                  <td className="px-6 py-4 text-gray-400 text-sm">
                    {product.low_stock_threshold} {product.unit}
                  </td>

                  {/* Price */}
                  <td className="px-6 py-4 text-green-400 font-semibold text-sm">
                    {product.price.toFixed(2)} den
                  </td>

                  {/* Status Badge */}
                  <td className="px-6 py-4">
                    {getStockStatus(product) === 'out' && (
                      <span
                        className="bg-red-500/20 text-red-400 text-xs
                                       font-medium px-2 py-1 rounded-full"
                      >
                        ❌ {t.outOfStockCount}
                      </span>
                    )}
                    {getStockStatus(product) === 'low' && (
                      <span
                        className="bg-yellow-500/20 text-yellow-400 text-xs
                                       font-medium px-2 py-1 rounded-full"
                      >
                        ⚠️ {t.lowStock}
                      </span>
                    )}
                    {getStockStatus(product) === 'ok' && (
                      <span
                        className="bg-green-500/20 text-green-400 text-xs
                                       font-medium px-2 py-1 rounded-full"
                      >
                        ✅ {t.inStock}
                      </span>
                    )}
                  </td>

                  {/* Restock Button */}
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleRestock(product)}
                      className="bg-blue-600/20 hover:bg-blue-600 text-blue-400
                                 hover:text-white px-3 py-1.5 rounded-lg text-xs
                                 font-medium transition-colors"
                    >
                      {t.quickRestock}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Restock Modal */}
      {showRestockModal && restockProduct && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center
                        justify-center z-50"
        >
          <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-white font-bold text-xl mb-2">
              {t.restockProduct}
            </h3>
            <p className="text-gray-400 text-sm mb-6">
              {t.addingStockTo}{' '}
              <span className="text-white font-medium">
                {restockProduct.name}
              </span>
            </p>

            {restockError && (
              <div
                className="bg-red-500/20 border border-red-500 text-red-400
                              rounded-lg p-3 mb-4 text-sm"
              >
                {restockError}
              </div>
            )}

            <div className="space-y-4">
              {/* Current Stock */}
              <div className="bg-gray-700 rounded-lg p-3 flex justify-between">
                <span className="text-gray-400 text-sm">{t.currentStock}</span>
                <span
                  className={`font-semibold text-sm ${getStockColor(restockProduct)}`}
                >
                  {restockProduct.stock} {restockProduct.unit}
                </span>
              </div>

              {/* Quantity */}
              <div>
                <label className="text-gray-400 text-sm mb-1 block">
                  {t.quantityToAdd}
                </label>
                <input
                  type="number"
                  min="1"
                  value={restockForm.quantity}
                  onChange={(e) =>
                    setRestockForm({ ...restockForm, quantity: e.target.value })
                  }
                  placeholder="e.g. 50"
                  className="w-full bg-gray-700 text-white rounded-lg px-4 py-2.5
                             outline-none focus:ring-2 focus:ring-blue-500
                             placeholder-gray-500"
                  autoFocus
                />
                {restockForm.quantity && parseInt(restockForm.quantity) > 0 && (
                  <p className="text-green-400 text-xs mt-1">
                    {t.newStockWillBe}{' '}
                    {restockProduct.stock + parseInt(restockForm.quantity)}{' '}
                    {restockProduct.unit}
                  </p>
                )}
              </div>

              {/* Buying Price */}
              <div>
                <label className="text-gray-400 text-sm mb-1 block">
                  {t.buyingPriceOptional}
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={restockForm.buying_price || ''}
                  onChange={(e) =>
                    setRestockForm({
                      ...restockForm,
                      buying_price: e.target.value,
                    })
                  }
                  placeholder="e.g. 850.00"
                  className="w-full bg-gray-700 text-white rounded-lg px-4 py-2.5
               outline-none focus:ring-2 focus:ring-blue-500
               placeholder-gray-500"
                />
              </div>

              {/* Note */}
              <div>
                <label className="text-gray-400 text-sm mb-1 block">
                  {t.noteOptional}
                </label>
                <input
                  value={restockForm.note}
                  onChange={(e) =>
                    setRestockForm({ ...restockForm, note: e.target.value })
                  }
                  placeholder={t.deliveryFromSupplier}
                  className="w-full bg-gray-700 text-white rounded-lg px-4 py-2.5
                             outline-none focus:ring-2 focus:ring-blue-500
                             placeholder-gray-500"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowRestockModal(false)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white
                           rounded-lg py-2.5 font-medium transition-colors"
              >
                {t.cancel}
              </button>
              <button
                onClick={handleRestockSubmit}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white
                           rounded-lg py-2.5 font-medium transition-colors"
              >
                {t.confirmRestock}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default StockOverview
