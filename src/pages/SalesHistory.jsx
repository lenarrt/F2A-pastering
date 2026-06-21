import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useLanguage } from '../context/languageContext'

function Receipt({ sale, businessName, receiptFooter, onClose }) {
  const { t, language } = useLanguage()
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

function ReportModal({ sales, settings, language, t, onClose }) {
  const [period, setPeriod] = useState('month')
  const [customFrom, setCustomFrom] = useState('')
  const [customTo, setCustomTo] = useState('')

  const getDateRange = () => {
    const now = new Date()
    if (period === 'month') {
      const from = new Date(now.getFullYear(), now.getMonth(), 1)
      const to = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
      return { from, to }
    }
    if (period === 'year') {
      const from = new Date(now.getFullYear(), 0, 1)
      const to = new Date(now.getFullYear(), 11, 31, 23, 59, 59)
      return { from, to }
    }
    // custom
    const from = customFrom ? new Date(customFrom) : null
    const to = customTo ? new Date(customTo + 'T23:59:59') : null
    return { from, to }
  }

  const handleGenerate = () => {
    const now = new Date()
    const { from, to } = getDateRange()
    if (period === 'custom' && (!from || !to)) {
      alert(
        language === 'al'
          ? 'Ju lutemi zgjidhni të dy datat'
          : 'Please select both dates'
      )
      return
    }

    const filtered = sales.filter((s) => {
      const saleDate = new Date(s.created_at + 'Z')
      return saleDate >= from && saleDate <= to
    })

    const paidSales = filtered.filter(
      (s) => s.payment_status === 'paid' && s.sale_type === 'sale'
    )
    const pendingSales = filtered.filter((s) => s.payment_status === 'pending')
    const internalSales = filtered.filter((s) => s.sale_type === 'internal')
    const voidedSales = filtered.filter((s) => s.payment_status === 'voided')

    const totalRevenue = paidSales.reduce((sum, s) => sum + s.total, 0)
    const pendingTotal = pendingSales.reduce((sum, s) => sum + s.total, 0)

    const isAl = language === 'al'
    const labels = {
      title: isAl ? 'Raporti i Shitjeve' : 'Sales Report',
      period: isAl ? 'Periudha' : 'Period',
      totalRevenue: isAl ? 'Qarkullimi Total' : 'Total Revenue',
      pendingPayment: isAl ? 'Pagesa Në Pritje' : 'Pending Payment',
      totalTransactions: isAl ? 'Gjithsej Shitje' : 'Total Transactions',
      internalUse: isAl ? 'Përdorim i Brendshëm' : 'Internal Use',
      voided: isAl ? 'Anuluar' : 'Voided',
      id: 'ID',
      date: isAl ? 'Data' : 'Date',
      cashier: isAl ? 'Shitësi' : 'Cashier',
      customer: isAl ? 'Klienti' : 'Customer',
      type: isAl ? 'Lloji' : 'Type',
      status: isAl ? 'Statusi' : 'Status',
      total: isAl ? 'Totali' : 'Total',
      generatedOn: isAl ? 'Gjeneruar më' : 'Generated on',
      paid: isAl ? 'E Paguar' : 'Paid',
      pending: isAl ? 'Paguaj Më Vonë' : 'Pay Later',
      internal: isAl ? 'I Brendshëm' : 'Internal',
      sale: isAl ? 'Shitje' : 'Sale',
    }

    const monthNamesEn = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ]
    const monthNamesAl = [
      'Janar',
      'Shkurt',
      'Mars',
      'Prill',
      'Maj',
      'Qershor',
      'Korrik',
      'Gusht',
      'Shtator',
      'Tetor',
      'Nëntor',
      'Dhjetor',
    ]

    const periodLabel =
      period === 'month'
        ? `${isAl ? monthNamesAl[now.getMonth()] : monthNamesEn[now.getMonth()]} ${now.getFullYear()}`
        : period === 'year'
          ? `${now.getFullYear()}`
          : `${from.toLocaleDateString()} - ${to.toLocaleDateString()}`

    const printWindow = window.open('', '_blank')
    printWindow.document.write(`
      <html>
        <head>
          <title>${labels.title}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 30px; color: #111; }
            h1 { text-align: center; margin-bottom: 4px; }
            .subtitle { text-align: center; color: #666; margin-bottom: 24px; }
            .summary { display: flex; gap: 16px; margin-bottom: 24px; }
            .card { flex: 1; border: 1px solid #ddd; border-radius: 8px; padding: 12px; text-align: center; }
            .card .label { font-size: 12px; color: #666; }
            .card .value { font-size: 20px; font-weight: bold; margin-top: 4px; }
            table { width: 100%; border-collapse: collapse; margin-top: 8px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
            th { background: #f3f3f3; }
            .footer { text-align: center; margin-top: 24px; font-size: 11px; color: #999; }
            .voided { text-decoration: line-through; color: #999; }
          </style>
        </head>
        <body>
          <h1>${settings.business_name || 'F2A Plastering'}</h1>
          <p class="subtitle">${labels.title} — ${periodLabel}</p>

          <div class="summary">
            <div class="card">
              <div class="label">${labels.totalRevenue}</div>
              <div class="value">${totalRevenue.toFixed(2)} den</div>
            </div>
            <div class="card">
              <div class="label">${labels.pendingPayment}</div>
              <div class="value">${pendingTotal.toFixed(2)} den</div>
            </div>
            <div class="card">
              <div class="label">${labels.totalTransactions}</div>
              <div class="value">${filtered.length}</div>
            </div>
            <div class="card">
              <div class="label">${labels.internalUse}</div>
              <div class="value">${internalSales.length}</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>${labels.id}</th>
                <th>${labels.date}</th>
                <th>${labels.cashier}</th>
                <th>${labels.customer}</th>
                <th>${labels.type}</th>
                <th>${labels.status}</th>
                <th>${labels.total}</th>
              </tr>
            </thead>
            <tbody>
              ${filtered
                .map(
                  (s) => `
                <tr class="${s.payment_status === 'voided' ? 'voided' : ''}">
                  <td>#${s.id}</td>
                  <td>${new Date(s.created_at + 'Z').toLocaleString([], { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</td>
                  <td>${s.cashier_name}</td>
                  <td>${s.customer_name || '—'}</td>
                  <td>${s.sale_type === 'internal' ? labels.internal : labels.sale}</td>
                  <td>${s.payment_status === 'paid' ? labels.paid : s.payment_status === 'pending' ? labels.pending : labels.voided}</td>
                  <td>${s.total.toFixed(2)} den</td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>

          <div class="footer">${labels.generatedOn}: ${new Date().toLocaleString()}</div>
        </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <h3 className="text-white font-bold text-xl mb-4">
          {language === 'al' ? 'Printo Raportin' : 'Print Report'}
        </h3>

        <div className="space-y-2 mb-4">
          <button
            onClick={() => setPeriod('month')}
            className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition-colors ${
              period === 'month'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {language === 'al' ? 'Këtë Muaj' : 'This Month'}
          </button>
          <button
            onClick={() => setPeriod('year')}
            className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition-colors ${
              period === 'year'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {language === 'al' ? 'Këtë Vit' : 'This Year'}
          </button>
          <button
            onClick={() => setPeriod('custom')}
            className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition-colors ${
              period === 'custom'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {language === 'al' ? 'Periudhë e Personalizuar' : 'Custom Range'}
          </button>
        </div>

        {period === 'custom' && (
          <div className="flex gap-2 mb-4">
            <input
              type="date"
              value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
              className="flex-1 bg-gray-700 border border-gray-600 text-white rounded-lg
                         px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="date"
              value={customTo}
              onChange={(e) => setCustomTo(e.target.value)}
              className="flex-1 bg-gray-700 border border-gray-600 text-white rounded-lg
                         px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white
                       rounded-lg py-2.5 font-medium transition-colors"
          >
            {t.cancel}
          </button>
          <button
            onClick={handleGenerate}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white
                       rounded-lg py-2.5 font-medium transition-colors"
          >
            🖨️ {language === 'al' ? 'Gjenero' : 'Generate'}
          </button>
        </div>
      </div>
    </div>
  )
}
function SalesHistory() {
  const { t, language } = useLanguage()
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
  const [showReportModal, setShowReportModal] = useState(false)

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
      !dateTo ||
      new Date(sale.created_at + 'Z') <= new Date(dateTo + 'T23:59:59')
    return (
      matchesStatus &&
      matchesType &&
      matchesSearch &&
      matchesDateFrom &&
      matchesDateTo
    )
  })

  const StatusBadge = ({ status }) => {
    const { t, language } = useLanguage()
    const styles = {
      paid: 'bg-green-500/20 text-green-400',
      pending: 'bg-yellow-500/20 text-yellow-400',
      voided: 'bg-red-500/20 text-red-400',
    }
    const labels = {
      paid: language === 'al' ? '✓ E Paguar' : '✓ Paid',
      pending: language === 'al' ? '⏳ Paguaj Më Vonë' : '⏳ Pay Later',
      voided: language === 'al' ? '✕ Anuluar' : '✕ Voided',
    }
    return (
      <span
        className={`text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap ${styles[status]}`}
      >
        {labels[status]}
      </span>
    )
  }

  const TypeBadge = ({ type }) => {
    const { language } = useLanguage()
    if (type === 'internal') {
      return (
        <span
          className="text-xs font-medium px-2 py-1 rounded-full
                       bg-orange-500/20 text-orange-400 whitespace-nowrap"
        >
          🔧 {language === 'al' ? 'Përdorim të Brendshëm' : 'Internal'}
        </span>
      )
    }
    return (
      <span
        className="text-xs font-medium px-2 py-1 rounded-full
                     bg-blue-500/20 text-blue-400 whitespace-nowrap"
      >
        🛒 {language === 'al' ? 'Shitje' : 'Sale'}
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">{t.salesHistory}</h2>
          <p className="text-gray-400 mt-1">
            {filteredSales.length} {t.salesHistoryDesc}
          </p>
        </div>
        <button
          onClick={() => setShowReportModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5
               rounded-lg text-sm font-medium transition-colors"
        >
          🖨️ {language === 'al' ? 'Printo Raport' : 'Print Report'}
        </button>
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
            <p className="text-yellow-400 text-sm mb-6">{t.voidSaleWarning}</p>
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
            <p className="text-red-400 text-sm mb-6">{t.deleteSaleWarning}</p>
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
      {/* Report Modal */}
      {showReportModal && (
        <ReportModal
          sales={sales}
          settings={settings}
          language={language}
          t={t}
          onClose={() => setShowReportModal(false)}
        />
      )}
    </div>
  )
}

export default SalesHistory
