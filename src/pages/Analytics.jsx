import { useState, useEffect } from 'react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'

function Analytics() {
  const [sales, setSales] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('7days')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    const [salesRes, productsRes] = await Promise.all([
      window.api.getSales(),
      window.api.getProducts(),
    ])
    if (salesRes.success) setSales(salesRes.data)
    if (productsRes.success) setProducts(productsRes.data)
    setLoading(false)
  }

  // Filter sales by period
  const getFilteredSales = () => {
    const now = new Date()
    const days = period === '7days' ? 7 : period === '30days' ? 30 : 90
    const cutoff = new Date(now.setDate(now.getDate() - days))
    return sales.filter(
      (s) =>
        new Date(s.created_at) >= cutoff &&
        s.payment_status !== 'voided' &&
        s.sale_type === 'sale'
    )
  }

  const filteredSales = getFilteredSales()

  // Revenue by day
  const revenueByDay = () => {
    const days = period === '7days' ? 7 : period === '30days' ? 30 : 90
    const result = []
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
      })
      const daySales = sales.filter((s) => {
        const saleDate = new Date(s.created_at)
        return (
          saleDate.toDateString() === date.toDateString() &&
          s.payment_status !== 'voided' &&
          s.sale_type === 'sale'
        )
      })
      result.push({
        date: dateStr,
        revenue: daySales.reduce((sum, s) => sum + s.total, 0),
        transactions: daySales.length,
      })
    }
    return result
  }

  // Top selling products
  const topProducts = () => {
    const productSales = {}
    filteredSales.forEach((sale) => {
      sale.items?.forEach((item) => {
        if (!productSales[item.product_name]) {
          productSales[item.product_name] = {
            name: item.product_name,
            quantity: 0,
            revenue: 0,
          }
        }
        productSales[item.product_name].quantity += item.quantity
        productSales[item.product_name].revenue += item.final_price
      })
    })
    return Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)
  }

  // Sales by payment status for pie chart
  const salesByStatus = () => {
    const paid = sales.filter(
      (s) => s.payment_status === 'paid' && s.sale_type === 'sale'
    ).length
    const pending = sales.filter((s) => s.payment_status === 'pending').length
    const voided = sales.filter((s) => s.payment_status === 'voided').length
    const internal = sales.filter((s) => s.sale_type === 'internal').length
    return [
      { name: 'Paid', value: paid, color: '#22c55e' },
      { name: 'Pay Later', value: pending, color: '#f59e0b' },
      { name: 'Voided', value: voided, color: '#ef4444' },
      { name: 'Internal', value: internal, color: '#f97316' },
    ].filter((item) => item.value > 0)
  }

  // Summary stats
  const totalRevenue = filteredSales
    .filter((s) => s.payment_status === 'paid')
    .reduce((sum, s) => sum + s.total, 0)

  const pendingRevenue = filteredSales
    .filter((s) => s.payment_status === 'pending')
    .reduce((sum, s) => sum + s.total, 0)

  const avgSaleValue =
    filteredSales.length > 0
      ? totalRevenue /
        filteredSales.filter((s) => s.payment_status === 'paid').length
      : 0

  const dailyData = revenueByDay()
  const topProductsData = topProducts()
  const statusData = salesByStatus()

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 text-xs">
          <p className="text-gray-400 mb-1">{label}</p>
          {payload.map((entry, i) => (
            <p key={i} style={{ color: entry.color }}>
              {entry.name}:{' '}
              {entry.name === 'revenue'
                ? `${entry.value.toFixed(2)} den`
                : entry.value}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400">Loading analytics...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Analytics</h2>
          <p className="text-gray-400 mt-1">Business performance overview</p>
        </div>
        {/* Period Selector */}
        <div className="flex bg-gray-800 border border-gray-700 rounded-lg p-1">
          {[
            { value: '7days', label: '7 Days' },
            { value: '30days', label: '30 Days' },
            { value: '90days', label: '90 Days' },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setPeriod(option.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                period === option.value
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
          <p className="text-gray-400 text-sm">Total Revenue</p>
          <p className="text-green-400 text-2xl font-bold mt-1">
            {totalRevenue.toFixed(2)} den
          </p>
          <p className="text-gray-500 text-xs mt-1">Paid sales only</p>
        </div>
        <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
          <p className="text-gray-400 text-sm">Pending Revenue</p>
          <p className="text-yellow-400 text-2xl font-bold mt-1">
            {pendingRevenue.toFixed(2)} den
          </p>
          <p className="text-gray-500 text-xs mt-1">Pay later sales</p>
        </div>
        <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
          <p className="text-gray-400 text-sm">Total Transactions</p>
          <p className="text-blue-400 text-2xl font-bold mt-1">
            {filteredSales.length}
          </p>
          <p className="text-gray-500 text-xs mt-1">In selected period</p>
        </div>
        <div className="bg-gray-800 rounded-xl p-5 border border-gray-700">
          <p className="text-gray-400 text-sm">Avg Sale Value</p>
          <p className="text-purple-400 text-2xl font-bold mt-1">
            {isNaN(avgSaleValue) ? '0.00' : avgSaleValue.toFixed(2)} den
          </p>
          <p className="text-gray-500 text-xs mt-1">Per transaction</p>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
        <h3 className="text-white font-semibold mb-6">Revenue Over Time</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={dailyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="date"
              tick={{ fill: '#9ca3af', fontSize: 11 }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#9ca3af', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${v} den`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: '#3b82f6', r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom Row — Top Products + Transactions + Pie */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Top Products */}
        <div className="xl:col-span-2 bg-gray-800 rounded-xl border border-gray-700 p-6">
          <h3 className="text-white font-semibold mb-6">
            Top Products by Revenue
          </h3>
          {topProductsData.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-4xl mb-2">📊</p>
              <p className="text-gray-400">No sales data yet</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={topProductsData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  type="number"
                  tick={{ fill: '#9ca3af', fontSize: 11 }}
                  tickLine={false}
                  tickFormatter={(v) => `${v} den`}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fill: '#9ca3af', fontSize: 11 }}
                  tickLine={false}
                  width={100}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Sales Breakdown Pie */}
        <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
          <h3 className="text-white font-semibold mb-6">Sales Breakdown</h3>
          {statusData.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-4xl mb-2">🥧</p>
              <p className="text-gray-400">No data yet</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [value, name]}
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Legend
                  formatter={(value) => (
                    <span style={{ color: '#9ca3af', fontSize: '12px' }}>
                      {value}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Transactions Per Day */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
        <h3 className="text-white font-semibold mb-6">Transactions Per Day</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={dailyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="date"
              tick={{ fill: '#9ca3af', fontSize: 11 }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: '#9ca3af', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="transactions" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

export default Analytics
