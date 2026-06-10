import { useState, useEffect } from 'react'

function Restock() {
  const [products, setProducts] = useState([])
  const [restockLog, setRestockLog] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({
    product_id: '',
    quantity: '',
    note: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    const [productsRes, restockRes] = await Promise.all([
      window.api.getProducts(),
      window.api.getRestockLog(),
    ])
    if (productsRes.success) setProducts(productsRes.data)
    if (restockRes.success) setRestockLog(restockRes.data)
    setLoading(false)
  }

  const handleSubmit = async () => {
    if (!form.product_id || !form.quantity) {
      setError('Please select a product and enter a quantity')
      return
    }
    if (parseInt(form.quantity) <= 0) {
      setError('Quantity must be greater than 0')
      return
    }

    const result = await window.api.restockProduct({
      product_id: parseInt(form.product_id),
      quantity: parseInt(form.quantity),
      note: form.note || null,
    })

    if (result.success) {
      setSuccess('Stock updated successfully!')
      setForm({ product_id: '', quantity: '', note: '' })
      setError('')
      setShowModal(false)
      loadData()
      setTimeout(() => setSuccess(''), 3000)
    } else {
      setError(result.message)
    }
  }

  const selectedProduct = products.find(
    (p) => p.id === parseInt(form.product_id)
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400">Loading...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Restock</h2>
          <p className="text-gray-400 mt-1">
            Log incoming deliveries and update stock
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2
                     rounded-lg text-sm font-medium transition-colors"
        >
          + Log Delivery
        </button>
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

      {/* Low Stock Products */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
        <h3 className="text-white font-semibold mb-4">
          Products Needing Restock
          <span className="ml-2 text-sm text-gray-400 font-normal">
            (at or below threshold)
          </span>
        </h3>
        {products.filter((p) => p.stock <= p.low_stock_threshold).length ===
        0 ? (
          <div className="text-center py-6">
            <p className="text-4xl mb-2">✅</p>
            <p className="text-gray-400">All products are well stocked!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 xl:grid-cols-3 gap-3">
            {products
              .filter((p) => p.stock <= p.low_stock_threshold)
              .map((product) => (
                <div
                  key={product.id}
                  className="bg-gray-700 rounded-lg p-4 border border-gray-600"
                >
                  <p className="text-white font-medium text-sm">
                    {product.name}
                  </p>
                  <p className="text-gray-400 text-xs mt-1">
                    {product.category_name || 'Uncategorized'}
                  </p>
                  <div className="flex items-center justify-between mt-3">
                    <span
                      className={`font-bold text-sm ${
                        product.stock === 0 ? 'text-red-400' : 'text-yellow-400'
                      }`}
                    >
                      {product.stock} {product.unit} left
                    </span>
                    <button
                      onClick={() => {
                        setForm({
                          product_id: product.id.toString(),
                          quantity: '',
                          note: '',
                        })
                        setShowModal(true)
                      }}
                      className="bg-blue-600/20 hover:bg-blue-600 text-blue-400
                                 hover:text-white px-3 py-1 rounded-lg text-xs
                                 font-medium transition-colors"
                    >
                      Restock
                    </button>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Restock Log Table */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-700">
          <h3 className="text-white font-semibold">Delivery History</h3>
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">
                Date & Time
              </th>
              <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">
                Product
              </th>
              <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">
                Quantity Added
              </th>
              <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">
                Note
              </th>
            </tr>
          </thead>
          <tbody>
            {restockLog.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center text-gray-400 py-12">
                  No deliveries logged yet
                </td>
              </tr>
            ) : (
              restockLog.map((log) => (
                <tr
                  key={log.id}
                  className="border-b border-gray-700 last:border-0
                             hover:bg-gray-750 transition-colors"
                >
                  <td className="px-6 py-4 text-white text-sm">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-white text-sm font-medium">
                    {log.product_name}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-green-400 font-semibold">
                      +{log.quantity}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-400 text-sm">
                    {log.note || '—'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Restock Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center
                        justify-center z-50"
        >
          <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-white font-bold text-xl mb-6">Log Delivery</h3>

            {error && (
              <div
                className="bg-red-500/20 border border-red-500 text-red-400
                              rounded-lg p-3 mb-4 text-sm"
              >
                {error}
              </div>
            )}

            <div className="space-y-4">
              {/* Product Select */}
              <div>
                <label className="text-gray-400 text-sm mb-1 block">
                  Product *
                </label>
                <select
                  value={form.product_id}
                  onChange={(e) =>
                    setForm({ ...form, product_id: e.target.value })
                  }
                  className="w-full bg-gray-700 text-white rounded-lg px-4 py-2.5
                             outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a product...</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (current stock: {p.stock} {p.unit})
                    </option>
                  ))}
                </select>
              </div>

              {/* Current Stock Info */}
              {selectedProduct && (
                <div className="bg-gray-700 rounded-lg p-3 flex justify-between">
                  <span className="text-gray-400 text-sm">Current Stock</span>
                  <span
                    className={`font-semibold text-sm ${
                      selectedProduct.stock === 0
                        ? 'text-red-400'
                        : selectedProduct.stock <=
                            selectedProduct.low_stock_threshold
                          ? 'text-yellow-400'
                          : 'text-white'
                    }`}
                  >
                    {selectedProduct.stock} {selectedProduct.unit}
                  </span>
                </div>
              )}

              {/* Quantity */}
              <div>
                <label className="text-gray-400 text-sm mb-1 block">
                  Quantity to Add *
                </label>
                <input
                  type="number"
                  min="1"
                  value={form.quantity}
                  onChange={(e) =>
                    setForm({ ...form, quantity: e.target.value })
                  }
                  placeholder="e.g. 50"
                  className="w-full bg-gray-700 text-white rounded-lg px-4 py-2.5
                             outline-none focus:ring-2 focus:ring-blue-500
                             placeholder-gray-500"
                />
                {selectedProduct && form.quantity && (
                  <p className="text-green-400 text-xs mt-1">
                    New stock will be:{' '}
                    {selectedProduct.stock + parseInt(form.quantity || 0)}{' '}
                    {selectedProduct.unit}
                  </p>
                )}
              </div>

              {/* Note */}
              <div>
                <label className="text-gray-400 text-sm mb-1 block">
                  Note (optional)
                </label>
                <input
                  value={form.note}
                  onChange={(e) => setForm({ ...form, note: e.target.value })}
                  placeholder="e.g. Delivery from supplier ABC"
                  className="w-full bg-gray-700 text-white rounded-lg px-4 py-2.5
                             outline-none focus:ring-2 focus:ring-blue-500
                             placeholder-gray-500"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowModal(false)
                  setError('')
                  setForm({ product_id: '', quantity: '', note: '' })
                }}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white
                           rounded-lg py-2.5 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white
                           rounded-lg py-2.5 font-medium transition-colors"
              >
                Log Delivery
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Restock
