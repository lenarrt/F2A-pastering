import { useState, useEffect } from 'react'
import { useLanguage } from '../context/languageContext'

// Modal for adding/editing a product
function ProductModal({ product, categories, onSave, onClose }) {
  const { t } = useLanguage()
  const [form, setForm] = useState({
    name: product?.name || '',
    barcode: product?.barcode || '',
    category_id: product?.category_id || '',
    price: product?.price || '',
    stock: product?.stock || 0,
    low_stock_threshold: product?.low_stock_threshold || 10,
    unit: product?.unit || 'unit',
  })
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    if (!form.name || !form.price) {
      setError(t.nameAndPriceRequired)
      return
    }
    await onSave({
      ...form,
      id: product?.id,
      price: parseFloat(form.price),
      stock: parseInt(form.stock),
      low_stock_threshold: parseInt(form.low_stock_threshold),
      category_id: form.category_id || null,
    })
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl">
        <h3 className="text-white font-bold text-xl mb-6">
          {product ? t.editProduct : t.addProduct}
        </h3>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-400
                          rounded-lg p-3 mb-4 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="text-gray-400 text-sm mb-1 block">
              {t.productName} *
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. White Plaster 25kg"
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-2.5
                         outline-none focus:ring-2 focus:ring-blue-500
                         placeholder-gray-500"
            />
          </div>

          {/* Barcode */}
          <div>
            <label className="text-gray-400 text-sm mb-1 block">
              {t.barcode} (optional)
            </label>
            <input
              name="barcode"
              value={form.barcode}
              onChange={handleChange}
              placeholder="e.g. 1234567890"
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-2.5
                         outline-none focus:ring-2 focus:ring-blue-500
                         placeholder-gray-500"
            />
          </div>

          {/* Category + Unit in a row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-gray-400 text-sm mb-1 block">{t.category}</label>
              <select
                name="category_id"
                value={form.category_id}
                onChange={handleChange}
                className="w-full bg-gray-700 text-white rounded-lg px-4 py-2.5
                           outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">{t.noCategory}</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-gray-400 text-sm mb-1 block">{t.unit}</label>
              <select
                name="unit"
                value={form.unit}
                onChange={handleChange}
                className="w-full bg-gray-700 text-white rounded-lg px-4 py-2.5
                           outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="unit">Unit</option>
                <option value="bag">Bag</option>
                <option value="kg">KG</option>
                <option value="liter">Liter</option>
                <option value="box">Box</option>
                <option value="roll">Roll</option>
                <option value="pallet">Pallet</option>
              </select>
            </div>
          </div>

          {/* Price + Stock in a row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-gray-400 text-sm mb-1 block">{t.price} (den) *</label>
              <input
                name="price"
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={handleChange}
                placeholder="0.00"
                className="w-full bg-gray-700 text-white rounded-lg px-4 py-2.5
                           outline-none focus:ring-2 focus:ring-blue-500
                           placeholder-gray-500"
              />
            </div>
            <div>
              <label className="text-gray-400 text-sm mb-1 block">
                {t.initialStock}
              </label>
              <input
                name="stock"
                type="number"
                min="0"
                value={form.stock}
                onChange={handleChange}
                className="w-full bg-gray-700 text-white rounded-lg px-4 py-2.5
                           outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Low Stock Threshold */}
          <div>
            <label className="text-gray-400 text-sm mb-1 block">
              {t.lowStockThreshold}
            </label>
            <input
              name="low_stock_threshold"
              type="number"
              min="0"
              value={form.low_stock_threshold}
              onChange={handleChange}
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-2.5
                         outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-gray-500 text-xs mt-1">{t.lowStockNote}</p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white
                       rounded-lg py-2.5 font-medium transition-colors"
          >
            {t.cancel}
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white
                       rounded-lg py-2.5 font-medium transition-colors"
          >
            {product ? t.saveChanges : t.addProduct}
          </button>
        </div>
      </div>
    </div>
  )
}

// Category Modal
function CategoryModal({ onSave, onClose }) {
  const { t } = useLanguage()
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!name) {
      setError(t.categoryRequired)
      return
    }
    await onSave(name)
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <h3 className="text-white font-bold text-xl mb-6">{t.addCategory}</h3>

        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-400
                          rounded-lg p-3 mb-4 text-sm">
            {error}
          </div>
        )}

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Adhesives"
          className="w-full bg-gray-700 text-white rounded-lg px-4 py-2.5
                     outline-none focus:ring-2 focus:ring-blue-500
                     placeholder-gray-500 mb-4"
        />

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white
                       rounded-lg py-2.5 font-medium transition-colors"
          >
            {t.cancel}
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white
                       rounded-lg py-2.5 font-medium transition-colors"
          >
            {t.addCategory}
          </button>
        </div>
      </div>
    </div>
  )
}

// Main Products Page
function Products() {
  const { t } = useLanguage()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [showProductModal, setShowProductModal] = useState(false)
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

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

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.barcode?.includes(search)
    const matchesCategory = !selectedCategory ||
      p.category_id === parseInt(selectedCategory)
    return matchesSearch && matchesCategory
  })

  const handleSaveProduct = async (data) => {
    if (data.id) {
      await window.api.updateProduct(data)
    } else {
      await window.api.createProduct(data)
    }
    setShowProductModal(false)
    setEditingProduct(null)
    loadData()
  }

  const handleDeleteProduct = async (id) => {
    await window.api.deleteProduct(id)
    setDeleteConfirm(null)
    loadData()
  }

  const handleSaveCategory = async (name) => {
    await window.api.createCategory({ name })
    setShowCategoryModal(false)
    loadData()
  }

  const handleEdit = (product) => {
    setEditingProduct(product)
    setShowProductModal(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400">Loading products...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">{t.products}</h2>
          <p className="text-gray-400 mt-1">{products.length} {t.productsInCatalog}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowCategoryModal(true)}
            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2
                       rounded-lg text-sm font-medium transition-colors"
          >
            + {t.addCategory}
          </button>
          <button
            onClick={() => { setEditingProduct(null); setShowProductModal(true) }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2
                       rounded-lg text-sm font-medium transition-colors"
          >
            + {t.addProduct}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or barcode..."
          className="flex-1 bg-gray-800 border border-gray-700 text-white
                     rounded-lg px-4 py-2.5 outline-none focus:ring-2
                     focus:ring-blue-500 placeholder-gray-500"
        />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="bg-gray-800 border border-gray-700 text-white rounded-lg
                     px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Categories</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

      {/* Products Table */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700 bg-gray-750">
              <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">
                Product
              </th>
              <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">
                {t.category}
              </th>
              <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">
                {t.price}
              </th>
              <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">
                {t.stock}
              </th>
              <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">
                {t.actions}
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center text-gray-400 py-12">
                  {search ? 'No products match your search' : t.noProductsYet}
                </td>
              </tr>
            ) : (
              filteredProducts.map(product => (
                <tr key={product.id}
                  className="border-b border-gray-700 last:border-0
                             hover:bg-gray-750 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-white font-medium">{product.name}</p>
                    {product.barcode && (
                      <p className="text-gray-500 text-xs mt-0.5">
                        #{product.barcode}
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="bg-gray-700 text-gray-300 text-xs
                                     px-2 py-1 rounded-full">
                      {product.category_name || t.uncategorized}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-green-400 font-semibold">
                      den {product.price.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`font-semibold ${
                      product.stock === 0
                        ? 'text-red-400'
                        : product.stock <= product.low_stock_threshold
                        ? 'text-yellow-400'
                        : 'text-white'
                    }`}>
                      {product.stock} {product.unit}
                    </span>
                    {product.stock <= product.low_stock_threshold &&
                     product.stock > 0 && (
                      <span className="ml-2 text-yellow-400 text-xs">⚠️ Low</span>
                    )}
                    {product.stock === 0 && (
                      <span className="ml-2 text-red-400 text-xs">❌ Out</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(product)}
                        className="bg-blue-600/20 hover:bg-blue-600 text-blue-400
                                   hover:text-white px-3 py-1.5 rounded-lg text-xs
                                   font-medium transition-colors"
                      >
                        {t.edit}
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(product)}
                        className="bg-red-600/20 hover:bg-red-600 text-red-400
                                   hover:text-white px-3 py-1.5 rounded-lg text-xs
                                   font-medium transition-colors"
                      >
                        {t.delete}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Product Modal */}
      {showProductModal && (
        <ProductModal
          product={editingProduct}
          categories={categories}
          onSave={handleSaveProduct}
          onClose={() => { setShowProductModal(false); setEditingProduct(null) }}
        />
      )}

      {/* Category Modal */}
      {showCategoryModal && (
        <CategoryModal
          onSave={handleSaveCategory}
          onClose={() => setShowCategoryModal(false)}
        />
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center
                        justify-center z-50">
          <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-white font-bold text-xl mb-2">{t.deleteProduct}</h3>
            <p className="text-gray-400 mb-6">
              {t.deleteProductConfirm}{' '}
              <span className="text-white font-medium">{deleteConfirm.name}</span>?{' '}
              {t.cannotBeUndone}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white
                           rounded-lg py-2.5 font-medium transition-colors"
              >
                {t.cancel}
              </button>
              <button
                onClick={() => handleDeleteProduct(deleteConfirm.id)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white
                           rounded-lg py-2.5 font-medium transition-colors"
              >
                {t.delete}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Products
