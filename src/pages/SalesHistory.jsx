import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useLanguage } from '../context/languageContext'

function Receipt({ sale, businessName, receiptFooter, onClose }) {
  const { t } = useLanguage()

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
          </style>
        </head>
        <body>
          <h2>${businessName}</h2>
          <p>Receipt #${sale.id}</p>
          <p>${new Date(sale.created_at + 'Z').toLocaleString([], { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</p>
          <p>Cashier: ${sale.cashier_name}</p>
          ${sale.customer_name ? `<p>Customer: ${sale.customer_name}</p>` : ''}
          <div class="divider"></div>
          ${sale.items
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
            <p style="font-size: 11px; font-style: italic;">📝 Note: ${sale.note}</p>
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
          <h3 className="text-white font-bold text-xl">Receipt #{sale.id}</h3>
          <p className="text-gray-400 text-sm mt-1">
            {new Date(sale.created_at + 'Z').toLocaleString([], {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>

        {/* Receipt Preview */}
        <div
          className="bg-white text-black rounded-lg p-4 font-mono text-xs mb-4
                        max-h-64 overflow-y-auto"
        >
          <p className="text-center font-bold text-sm">{businessName}</p>
          <p className="text-center text-xs text-gray-600">
            {new Date(sale.created_at + 'Z').toLocaleString([], {
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
          {sale.items.map((item, i) => (
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
              <div className="flex justify-between">
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

function SalesHistory() {
  const { t } = useLanguage()
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedSale, setSelectedSale] = useState(null)
  const [settings, setSettings] = useState({})
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterType, setFilterType] = useState('all')
  const [search, setSearch] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [voidConfirm, setVoidConfirm] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    const [salesRes, settingsRes] = await Promise.all([
      window.api.getSales(),
      window.api.getSettings(),
    ])
    if (salesRes.success) setSales(salesRes.data)
    if (settingsRes.success) setSettings(settingsRes.data)
    setLoading(false)
  }

  const handleVoid = async (id) => {
    await window.api.voidSale(id)
    setVoidConfirm(null)
    setSales(
      sales.map((sale) =>
        sale.id === id ? { ...sale, payment_status: 'voided' } : sale
      )
    )
  }

  const handleDelete = async (id) => {
    await window.api.deleteSale(id)
    setDeleteConfirm(null)
    setSales(sales.filter((sale) => sale.id !== id))
  }

  const handleMarkPaid = async (id) => {
    await window.api.markSalePaid(id)
    setSales(
      sales.map((sale) =>
        sale.id === id ? { ...sale, payment_status: 'paid' } : sale
      )
    )
  }

  const filteredSales = sales.filter((sale) => {
    const matchesStatus =
      filterStatus === 'all' || sale.payment_status === filterStatus
    const matchesType = filterType === 'all' || sale.sale_type === filterType
    const matchesSearch =
      !search ||
      sale.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
      sale.cashier_name?.toLowerCase().includes(search.toLowerCase()) ||
      sale.id.toString().includes(search)
    const matchesDateFrom =
      !dateFrom || new Date(sale.created_at + 'Z') >= new Date(dateFrom)
    const matchesDateTo =
      !dateTo || new Date(sale.created_at + 'Z') <= new Date(dateTo + 'T23:59:59')
    return (
      matchesStatus &&
      matchesType &&
      matchesSearch &&
      matchesDateFrom &&
      matchesDateTo
    )
  })

  const StatusBadge = ({ status }) => {
    const styles = {
      paid: 'bg-green-500/20 text-green-400',
      pending: 'bg-yellow-500/20 text-yellow-400',
      voided: 'bg-red-500/20 text-red-400',
    }
    const labels = {
      paid: '✓ Paid',
      pending: '⏳ Pay Later',
      voided: '✕ Voided',
    }
    return (
      <span
        className={`text-xs font-medium px-2 py-1 rounded-full ${styles[status]}`}
      >
        {labels[status]}
      </span>
    )
  }

  const TypeBadge = ({ type }) => {
    if (type === 'internal') {
      return (
        <span
          className="text-xs font-medium px-2 py-1 rounded-full
                         bg-orange-500/20 text-orange-400"
        >
          🔧 Internal
        </span>
      )
    }
    return (
      <span
        className="text-xs font-medium px-2 py-1 rounded-full
                       bg-blue-500/20 text-blue-400"
      >
        🛒 Sale
      </span>
    )
  }

  const totalRevenue = filteredSales
    .filter((s) => s.payment_status === 'paid' && s.sale_type === 'sale')
    .reduce((sum, s) => sum + s.total, 0)

  const pendingRevenue = filteredSales
    .filter((s) => s.payment_status === 'pending')
    .reduce((sum, s) => sum + s.total, 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400">Loading sales...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-white">{t.salesHistory}</h2>
        <p className="text-gray-400 mt-1">
          {filteredSales.length} {t.salesHistoryDesc}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <p className="text-gray-400 text-sm">{t.totalRevenue}</p>
          <p className="text-green-400 text-2xl font-bold mt-1">
            {totalRevenue.toFixed(2)} den
          </p>
          <p className="text-gray-500 text-xs mt-1">{t.paidSalesOnly}</p>
        </div>
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <p className="text-gray-400 text-sm">{t.pendingPayment}</p>
          <p className="text-yellow-400 text-2xl font-bold mt-1">
            {pendingRevenue.toFixed(2)} den
          </p>
          <p className="text-gray-500 text-xs mt-1">{t.payLaterSales}</p>
        </div>
        <div className="bg-gray-800 rounded-xl p-4 border border-gray-700">
          <p className="text-gray-400 text-sm">{t.totalTransactions}</p>
          <p className="text-blue-400 text-2xl font-bold mt-1">
            {filteredSales.filter((s) => s.payment_status !== 'voided').length}
          </p>
          <p className="text-gray-500 text-xs mt-1">{t.inSelectedPeriod}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by customer, cashier, or ID..."
          className="flex-1 min-w-48 bg-gray-800 border border-gray-700 text-white
                     rounded-lg px-4 py-2.5 outline-none focus:ring-2
                     focus:ring-blue-500 placeholder-gray-500 text-sm"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-gray-800 border border-gray-700 text-white rounded-lg
                     px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        >
          <option value="all">{t.allStatuses}</option>
          <option value="paid">Paid</option>
          <option value="pending">Pay Later</option>
          <option value="voided">Voided</option>
        </select>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="bg-gray-800 border border-gray-700 text-white rounded-lg
                     px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        >
          <option value="all">{t.allTypes}</option>
          <option value="sale">{t.salesOnly}</option>
          <option value="internal">{t.internalOnly}</option>
        </select>
        <input
          type="date"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
          className="bg-gray-800 border border-gray-700 text-white rounded-lg
                     px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        />
        <input
          type="date"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
          className="bg-gray-800 border border-gray-700 text-white rounded-lg
                     px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        />
      </div>

      {/* Sales Table */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">
                ID
              </th>
              <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">
                {t.dateTime}
              </th>
              <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">
                {t.cashier}
              </th>
              <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">
                {t.customer}
              </th>
              <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">
                {t.type}
              </th>
              <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">
                {t.status}
              </th>
              <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">
                {t.total}
              </th>
              <th className="text-left text-gray-400 text-sm font-medium px-6 py-4">
                {t.actions}
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredSales.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center text-gray-400 py-12">
                  {t.noSalesFound}
                </td>
              </tr>
            ) : (
              filteredSales.map((sale) => (
                <tr
                  key={sale.id}
                  className={`border-b border-gray-700 last:border-0
                              hover:bg-gray-750 transition-colors
                              ${sale.payment_status === 'voided' ? 'opacity-50' : ''}`}
                >
                  <td className="px-6 py-4 text-gray-400 text-sm">
                    #{sale.id}
                  </td>
                  <td className="px-6 py-4 text-white text-sm">
                    {new Date(sale.created_at + 'Z').toLocaleString([], {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="px-6 py-4 text-white text-sm">
                    {sale.cashier_name}
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-white text-sm">
                      {sale.customer_name || (
                        <span className="text-gray-500">—</span>
                      )}
                    </p>
                    {sale.note && (
                      <p className="text-gray-400 text-xs mt-0.5">
                        📝 {sale.note}
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <TypeBadge type={sale.sale_type} />
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={sale.payment_status} />
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`font-semibold ${
                        sale.payment_status === 'voided'
                          ? 'text-gray-500 line-through'
                          : 'text-green-400'
                      }`}
                    >
                      {sale.total.toFixed(2)} den
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      {/* View Receipt */}
                      <button
                        onClick={() => setSelectedSale(sale)}
                        className="bg-blue-600/20 hover:bg-blue-600 text-blue-400
                                   hover:text-white px-3 py-1.5 rounded-lg text-xs
                                   font-medium transition-colors"
                      >
                        {t.view}
                      </button>

                      {/* Mark as Paid */}
                      {sale.payment_status === 'pending' && (
                        <button
                          onClick={() => handleMarkPaid(sale.id)}
                          className="bg-green-600/20 hover:bg-green-600 text-green-400
                                     hover:text-white px-3 py-1.5 rounded-lg text-xs
                                     font-medium transition-colors"
                        >
                          {t.markPaid}
                        </button>
                      )}

                      {/* Void Sale */}
                      {sale.payment_status !== 'voided' && (
                        <button
                          onClick={() => setVoidConfirm(sale)}
                          className="bg-red-600/20 hover:bg-red-600 text-red-400
               hover:text-white px-3 py-1.5 rounded-lg text-xs
               font-medium transition-colors"
                        >
                          {t.void}
                        </button>
                      )}
                      <button
                        onClick={() => setDeleteConfirm(sale)}
                        className="bg-gray-600/20 hover:bg-gray-600 text-gray-400
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

      {/* Receipt Modal */}
      {selectedSale && (
        <Receipt
          sale={selectedSale}
          businessName={settings.business_name || 'F2A Plastering'}
          receiptFooter={settings.receipt_footer || 'Thank you!'}
          onClose={() => setSelectedSale(null)}
        />
      )}

      {/* Void Confirmation */}
      {voidConfirm && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center
                        justify-center z-50"
        >
          <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-white font-bold text-xl mb-2">{t.voidSale}</h3>
            <p className="text-gray-400 mb-2">
              {t.voidSaleConfirm}{' '}
              <span className="text-white font-medium">
                Sale #{voidConfirm.id}
              </span>
              ?
            </p>
            <p className="text-yellow-400 text-sm mb-6">
              {t.voidSaleWarning}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setVoidConfirm(null)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white
                           rounded-lg py-2.5 font-medium transition-colors"
              >
                {t.cancel}
              </button>
              <button
                onClick={() => handleVoid(voidConfirm.id)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white
                           rounded-lg py-2.5 font-medium transition-colors"
              >
                {t.voidSaleBtn}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center
                  justify-center z-50"
        >
          <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-white font-bold text-xl mb-2">
              {t.deleteSalePermanently}
            </h3>
            <p className="text-gray-400 mb-2">
              {t.deleteSaleConfirm}{' '}
              <span className="text-white font-medium">
                Sale #{deleteConfirm.id}
              </span>
              ?
            </p>
            <p className="text-red-400 text-sm mb-6">
              {t.deleteSaleWarning}
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
                onClick={() => handleDelete(deleteConfirm.id)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white
                     rounded-lg py-2.5 font-medium transition-colors"
              >
                {t.deletePermanently}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SalesHistory
