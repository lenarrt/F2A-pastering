import { useState, useEffect, useRef } from 'react'
import { useSelector } from 'react-redux'
import { useLanguage } from '../context/languageContext'

// Receipt component — this is what gets printed
function Receipt({ sale, items, businessName, receiptFooter, onClose }) {
  const { t } = useLanguage()
  const receiptRef = useRef()

  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt</title>
          <style>
            body { font-family: monospace; font-size: 12px; width: 300px; margin: 0 auto; }
            h2 { text-align: center; margin: 0; font-size: 16px; }
            p { text-align: center; margin: 4px 0; }
            .divider { border-top: 1px dashed #000; margin: 8px 0; }
            .row { display: flex; justify-content: space-between; margin: 4px 0; }
            .total { font-weight: bold; font-size: 14px; }
            .footer { text-align: center; margin-top: 12px; font-size: 11px; }
            .discount { color: #f97316; font-size: 11px; }
            .note { font-size: 11px; font-style: italic; }
          </style>
        </head>
        <body>
          <h2>${businessName}</h2>
          <p>Receipt #${sale.id}</p>
          <p>${new Date(sale.created_at).toLocaleString([], { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</p>
          <p>Cashier: ${sale.cashier_name}</p>
          ${sale.customer_name ? `<p>Customer: ${sale.customer_name}</p>` : ''}
          <div class="divider"></div>
          ${items
            .map(
              (item) => `
            <div class="row">
              <span>${item.product_name}</span>
              <span>${item.quantity} x ${item.price.toFixed(2)} den</span>
            </div>
            ${
              item.discount_type && item.discount_value > 0
                ? `
              <div class="row discount">
                <span>Discount (${
                  item.discount_type === 'percent'
                    ? `-${item.discount_value}%`
                    : `-${item.discount_value} den`
                })</span>
                <span>-${(item.price * item.quantity - item.final_price).toFixed(2)} den</span>
              </div>
            `
                : ''
            }
            <div class="row">
              <span></span>
              <span>${item.final_price.toFixed(2)} den</span>
            </div>
          `
            )
            .join('')}
          <div class="divider"></div>
          <div class="row total">
            <span>TOTAL</span>
            <span>${sale.total.toFixed(2)} den</span>
          </div>
          ${
            sale.payment_status === 'pending'
              ? `
          <div class="row" style="color: #f59e0b;">
            <span>PAYMENT STATUS</span>
            <span>PAY LATER</span>
          </div>
          `
              : ''
          }
          ${
            sale.note
              ? `
            <div class="divider"></div>
            <p class="note">📝 Note: ${sale.note}</p>
          `
              : ''
          }
          <div class="divider"></div>
          <div class="footer">${receiptFooter}</div>
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
    printWindow.close()
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <div className="text-center mb-4">
          <div className="text-4xl mb-2">🧾</div>
          <h3 className="text-white font-bold text-xl">{t.saleComplete}</h3>
          <p className="text-gray-400 text-sm mt-1">Receipt #{sale.id}</p>
        </div>

        {/* Receipt Preview */}
        <div
          ref={receiptRef}
          className="bg-white text-black rounded-lg p-4 font-mono text-xs mb-4"
        >
          <p className="text-center font-bold text-sm">{businessName}</p>
          <p className="text-center text-xs text-gray-600">
            {new Date(sale.created_at).toLocaleString([], {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
          <p className="text-center text-xs">Cashier: {sale.cashier_name}</p>
          {sale.customer_name && (
            <p className="text-center text-xs">
              Customer: {sale.customer_name}
            </p>
          )}
          <div className="border-t border-dashed border-gray-400 my-2" />
          {items.map((item, i) => (
            <div key={i}>
              <div className="flex justify-between">
                <span className="flex-1">{item.product_name}</span>
                <span>
                  {item.quantity}x {item.price.toFixed(2)} den
                </span>
              </div>
              {item.discount_type && item.discount_value > 0 && (
                <div className="flex justify-between text-orange-500">
                  <span>
                    Discount (
                    {item.discount_type === 'percent'
                      ? `-${item.discount_value}%`
                      : `-${item.discount_value} den`}
                    )
                  </span>
                  <span>
                    -
                    {(item.price * item.quantity - item.final_price).toFixed(2)}{' '}
                    den
                  </span>
                </div>
              )}
              <div className="flex justify-between font-medium">
                <span></span>
                <span>{item.final_price.toFixed(2)} den</span>
              </div>
            </div>
          ))}
          <div className="border-t border-dashed border-gray-400 my-2" />
          <div className="flex justify-between font-bold">
            <span>TOTAL</span>
            <span>{sale.total.toFixed(2)} den</span>
          </div>
          {sale.payment_status === 'pending' && (
            <p className="text-center text-yellow-600 font-bold text-xs mt-1">
              {t.paymentPending}
            </p>
          )}
          {sale.note && (
            <>
              <div className="border-t border-dashed border-gray-400 my-2" />
              <p className="text-xs text-gray-600 italic">
                📝 Note: {sale.note}
              </p>
            </>
          )}
          <p className="text-center text-xs text-gray-500 mt-2">
            {receiptFooter}
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white
                       rounded-lg py-2.5 font-medium transition-colors"
          >
            {t.close}
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white
                       rounded-lg py-2.5 font-medium transition-colors"
          >
            🖨️ {t.print}
          </button>
        </div>
      </div>
    </div>
  )
}

// Main POS Page
function POS() {
  const { user } = useSelector((state) => state.auth)
  const { t } = useLanguage()
  const [products, setProducts] = useState([])
  const [cart, setCart] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [completedSale, setCompletedSale] = useState(null)
  const [settings, setSettings] = useState({})
  const [checkingOut, setCheckingOut] = useState(false)
  const [isInternalUse, setIsInternalUse] = useState(false)
  const [payLater, setPayLater] = useState(false)
  const [customerMode, setCustomerMode] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [manualCustomerName, setManualCustomerName] = useState('')
  const [saleNote, setSaleNote] = useState('')
  const [customers, setCustomers] = useState([])
  const searchRef = useRef()

  const calculateItemTotal = (item) => {
    if (!item.discount_type || !item.discount_value) {
      return item.price * item.quantity
    }
    if (item.discount_type === 'percent') {
      return item.price * item.quantity * (1 - item.discount_value / 100)
    }
    if (item.discount_type === 'fixed') {
      return Math.max(0, item.price * item.quantity - item.discount_value)
    }
    return item.price * item.quantity
  }

  useEffect(() => {
    loadData()
    setTimeout(() => searchRef.current?.focus(), 100)
  }, [])

  const loadData = async () => {
    const [productsRes, settingsRes, customersRes] = await Promise.all([
      window.api.getProducts(),
      window.api.getSettings(),
      window.api.getCustomers(),
    ])
    if (productsRes.success) setProducts(productsRes.data)
    if (settingsRes.success) setSettings(settingsRes.data)
    if (customersRes.success) setCustomers(customersRes.data)
    setLoading(false)
  }

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.barcode?.includes(search)
  )

  const addToCart = (product) => {
    const existing = cart.find((item) => item.product_id === product.id)
    if (existing) {
      if (existing.quantity >= product.stock) return
      setCart(
        cart.map((item) =>
          item.product_id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      )
    } else {
      setCart([
        ...cart,
        {
          product_id: product.id,
          product_name: product.name,
          price: product.price,
          quantity: 1,
          max_stock: product.stock,
          unit: product.unit,
          discount_type: null,
          discount_value: 0,
        },
      ])
    }
    setSearch('')
    searchRef.current?.focus()
  }

  const updateQuantity = (product_id, quantity) => {
    if (quantity <= 0) {
      removeFromCart(product_id)
      return
    }
    setCart(
      cart.map((item) =>
        item.product_id === product_id
          ? { ...item, quantity: Math.min(quantity, item.max_stock) }
          : item
      )
    )
  }

  const updateDiscount = (product_id, discount_type, discount_value) => {
    setCart(
      cart.map((item) =>
        item.product_id === product_id
          ? {
              ...item,
              discount_type,
              discount_value: parseFloat(discount_value) || 0,
            }
          : item
      )
    )
  }

  const removeFromCart = (product_id) => {
    setCart(cart.filter((item) => item.product_id !== product_id))
  }

  const total = cart.reduce((sum, item) => sum + calculateItemTotal(item), 0)

  const handleCheckout = async () => {
    if (cart.length === 0) return
    setCheckingOut(true)

    try {
      const items = cart.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price,
        discount_type: item.discount_type || null,
        discount_value: item.discount_value || 0,
        final_price: calculateItemTotal(item),
      }))

      const discount_total = cart.reduce((sum, item) => {
        const original = item.price * item.quantity
        const final = calculateItemTotal(item)
        return sum + (original - final)
      }, 0)

      const result = await window.api.createSale({
        user_id: user.id,
        customer_id: customerMode ? selectedCustomer?.id : null,
        customer_name: manualCustomerName || selectedCustomer?.name || null,
        total,
        discount_total,
        items,
        sale_type: isInternalUse ? 'internal' : 'sale',
        payment_status: payLater ? 'pending' : 'paid',
        note: saleNote || null,
      })

      if (result.success) {
        const salesRes = await window.api.getSales()
        if (salesRes.success) {
          const sale = salesRes.data.find((s) => s.id === result.id)
          if (!isInternalUse) {
            setCompletedSale(sale)
          } else {
            alert(t.internalUseSuccess)
          }
          setCart([])
          setPayLater(false)
          setCustomerMode(false)
          setSelectedCustomer(null)
          setManualCustomerName('')
          setSaleNote('')
          setIsInternalUse(false)
          loadData()
        }
      }
    } catch (error) {
      console.error('Checkout failed:', error)
    } finally {
      setCheckingOut(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400">Loading...</p>
      </div>
    )
  }

  return (
    <div className="flex gap-6 h-[calc(100vh-140px)]">
      {/* Left — Product Search */}
      <div className="flex-1 flex flex-col gap-4">
        <div>
          <input
            ref={searchRef}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.searchProductOrBarcode}
            className="w-full bg-gray-800 border border-gray-700 text-white
                       rounded-xl px-4 py-3 text-lg outline-none
                       focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
          />
        </div>

        <div className="flex-1 overflow-y-auto">
          {search === '' ? (
            <div className="text-center py-16">
              <p className="text-5xl mb-4">🔍</p>
              <p className="text-gray-400">{t.searchForProduct}</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-5xl mb-4">😕</p>
              <p className="text-gray-400">{t.noProductsFound}</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 xl:grid-cols-3 gap-3">
              {filteredProducts.map((product) => (
                <button
                  key={product.id}
                  onClick={() => product.stock > 0 && addToCart(product)}
                  disabled={product.stock === 0}
                  className={`border rounded-xl p-4 text-left transition-all w-full
                    ${
                      product.stock === 0
                        ? 'bg-gray-800/50 border-gray-700 cursor-not-allowed opacity-60'
                        : 'bg-gray-800 border-gray-700 hover:border-blue-500 hover:bg-gray-750 cursor-pointer'
                    }`}
                >
                  <div className="flex items-start justify-between mb-1">
                    <p
                      className={`font-medium text-sm ${
                        product.stock === 0 ? 'text-gray-500' : 'text-white'
                      }`}
                    >
                      {product.name}
                    </p>
                    {product.stock === 0 && (
                      <span
                        className="bg-red-500/20 text-red-400 text-xs px-2 py-0.5
                                       rounded-full ml-2 shrink-0"
                      >
                        {t.outOfStock}
                      </span>
                    )}
                  </div>
                  <p className="text-gray-400 text-xs mt-1">
                    {product.category_name || t.uncategorized}
                  </p>
                  <div className="flex items-center justify-between mt-3">
                    <span
                      className={`font-bold text-sm ${
                        product.stock === 0 ? 'text-gray-500' : 'text-green-400'
                      }`}
                    >
                      {product.price.toFixed(2)} den
                    </span>
                    <span
                      className={`text-xs ${
                        product.stock === 0 ? 'text-red-400' : 'text-gray-500'
                      }`}
                    >
                      {product.stock === 0
                        ? t.noStock
                        : `${product.stock} ${product.unit}`}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right — Cart */}
      <div className="w-80 flex flex-col bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        {/* Cart Header */}
        <div className="p-4 border-b border-gray-700">
          <h3 className="text-white font-semibold">
            {t.currentSale}
            {cart.length > 0 && (
              <span className="ml-2 bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                {cart.length}
              </span>
            )}
          </h3>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-3xl mb-2">🛒</p>
              <p className="text-gray-400 text-sm">{t.cartIsEmpty}</p>
              <p className="text-gray-600 text-xs mt-1">
                {t.searchAndAddProducts}
              </p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.product_id} className="bg-gray-700 rounded-lg p-3">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-white text-sm font-medium flex-1 pr-2">
                    {item.product_name}
                  </p>
                  <button
                    onClick={() => removeFromCart(item.product_id)}
                    className="text-gray-500 hover:text-red-400 transition-colors"
                  >
                    ✕
                  </button>
                </div>

                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        updateQuantity(item.product_id, item.quantity - 1)
                      }
                      className="w-6 h-6 rounded-full bg-gray-600 hover:bg-gray-500
                                 text-white text-sm flex items-center justify-center transition-colors"
                    >
                      −
                    </button>
                    <span className="text-white text-sm w-6 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateQuantity(item.product_id, item.quantity + 1)
                      }
                      className="w-6 h-6 rounded-full bg-gray-600 hover:bg-gray-500
                                 text-white text-sm flex items-center justify-center transition-colors"
                    >
                      +
                    </button>
                  </div>
                  <div className="text-right">
                    {item.discount_type && item.discount_value > 0 && (
                      <p className="text-gray-500 text-xs line-through">
                        {(item.price * item.quantity).toFixed(2)} den
                      </p>
                    )}
                    <span className="text-green-400 font-semibold text-sm">
                      {calculateItemTotal(item).toFixed(2)} den
                    </span>
                    {item.discount_type && item.discount_value > 0 && (
                      <p className="text-orange-400 text-xs">
                        -
                        {item.discount_type === 'percent'
                          ? `${item.discount_value}%`
                          : `${item.discount_value} den`}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 mt-1">
                  <select
                    value={item.discount_type || ''}
                    onChange={(e) =>
                      updateDiscount(
                        item.product_id,
                        e.target.value || null,
                        item.discount_value
                      )
                    }
                    className="bg-gray-600 text-gray-300 text-xs rounded px-2 py-1
                               outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">{t.noDiscount}</option>
                    <option value="percent">{t.percentDiscount}</option>
                    <option value="fixed">{t.fixedDiscount}</option>
                  </select>
                  {item.discount_type && (
                    <input
                      type="number"
                      min="0"
                      value={item.discount_value || ''}
                      onChange={(e) =>
                        updateDiscount(
                          item.product_id,
                          item.discount_type,
                          e.target.value
                        )
                      }
                      placeholder="0"
                      className="w-16 bg-gray-600 text-white text-xs rounded px-2 py-1
                                 outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Cart Footer */}
        <div className="p-4 border-t border-gray-700 space-y-3">
          {/* Internal Use Toggle */}
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm">{t.internalUse}</span>
            <button
              onClick={() => setIsInternalUse(!isInternalUse)}
              className={`w-10 h-5 rounded-full transition-colors ${
                isInternalUse ? 'bg-orange-500' : 'bg-gray-600'
              }`}
            >
              <div
                className={`w-4 h-4 bg-white rounded-full mx-auto transition-transform ${
                  isInternalUse ? 'translate-x-2.5' : '-translate-x-2.5'
                }`}
              />
            </button>
          </div>

          {/* Pay Later Toggle */}
          {!isInternalUse && (
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">{t.payLater}</span>
              <button
                onClick={() => {
                  setPayLater(!payLater)
                  setCustomerMode(!payLater)
                }}
                className={`w-10 h-5 rounded-full transition-colors ${
                  payLater ? 'bg-yellow-500' : 'bg-gray-600'
                }`}
              >
                <div
                  className={`w-4 h-4 bg-white rounded-full mx-auto transition-transform ${
                    payLater ? 'translate-x-2.5' : '-translate-x-2.5'
                  }`}
                />
              </button>
            </div>
          )}

          {/* Customer Name */}
          {!isInternalUse && (
            <input
              value={manualCustomerName}
              onChange={(e) => setManualCustomerName(e.target.value)}
              placeholder={t.customerNameOptional}
              className={`w-full bg-gray-700 text-white rounded-lg px-3 py-2
                         text-sm outline-none placeholder-gray-500
                         ${
                           payLater
                             ? 'focus:ring-2 focus:ring-yellow-500'
                             : 'focus:ring-2 focus:ring-blue-500'
                         }`}
            />
          )}

          {/* Note */}
          <input
            value={saleNote}
            onChange={(e) => setSaleNote(e.target.value)}
            placeholder={t.addNoteOptional}
            className="w-full bg-gray-700 text-white rounded-lg px-3 py-2
                       text-sm outline-none focus:ring-2 focus:ring-blue-500
                       placeholder-gray-500"
          />

          {/* Total */}
          <div className="flex justify-between items-center">
            <span className="text-gray-400">{t.total}</span>
            <span className="text-white text-2xl font-bold">
              {total.toFixed(2)} den
            </span>
          </div>

          {/* Status Badges */}
          {isInternalUse && (
            <div
              className="bg-orange-500/20 text-orange-400 text-xs text-center
                            rounded-lg py-1.5 font-medium"
            >
              {t.internalUseNote}
            </div>
          )}
          {payLater && (
            <div
              className="bg-yellow-500/20 text-yellow-400 text-xs text-center
                            rounded-lg py-1.5 font-medium"
            >
              {t.payLaterNote}
            </div>
          )}

          {/* Complete Button */}
          <button
            onClick={handleCheckout}
            disabled={cart.length === 0 || checkingOut}
            className={`w-full disabled:bg-gray-600 disabled:cursor-not-allowed
                        text-white font-bold py-3 rounded-xl transition-colors text-lg
                        ${
                          isInternalUse
                            ? 'bg-orange-600 hover:bg-orange-700'
                            : payLater
                              ? 'bg-yellow-600 hover:bg-yellow-700'
                              : 'bg-green-600 hover:bg-green-700'
                        }`}
          >
            {checkingOut
              ? t.processing
              : isInternalUse
                ? t.recordInternalUse
                : payLater
                  ? t.saveAsPayLater
                  : `✓ ${t.completeSale}`}
          </button>

          {cart.length > 0 && (
            <button
              onClick={() => setCart([])}
              className="w-full bg-gray-700 hover:bg-gray-600 text-gray-400
                         hover:text-white py-2 rounded-xl transition-colors text-sm"
            >
              {t.clearCart}
            </button>
          )}
        </div>
      </div>

      {/* Receipt Modal */}
      {completedSale && (
        <Receipt
          sale={completedSale}
          items={completedSale.items}
          businessName={settings.business_name || 'F2A Plastering'}
          receiptFooter={settings.receipt_footer || 'Thank you!'}
          onClose={() => setCompletedSale(null)}
        />
      )}
    </div>
  )
}

export default POS
