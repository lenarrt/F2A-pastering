import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useLanguage } from '../context/languageContext'
function StatCard({ title, value, subtitle, color, icon }) {
  return (
    <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <p className="text-gray-400 text-sm font-medium">{title}</p>
        <span className={`text-2xl`}>{icon}</span>
      </div>
      <p className={`text-3xl font-bold ${color}`}>{value}</p>
      {subtitle && <p className="text-gray-500 text-sm mt-1">{subtitle}</p>}
    </div>
  )
}

function LowStockCard({ product }) {
  const { t } = useLanguage()
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-700 last:border-0">
      <div>
        <p className="text-white text-sm font-medium">{product.name}</p>
        <p className="text-gray-400 text-xs">
          {product.category_name || t.noCategory}
        </p>
      </div>
      <div className="text-right">
        <span
          className={`text-sm font-bold ${
            product.stock === 0 ? 'text-red-400' : 'text-yellow-400'
          }`}
        >
          {product.stock} {product.unit}
        </span>
        <p className="text-gray-500 text-xs">
          Min: {product.low_stock_threshold}
        </p>
      </div>
    </div>
  )
}

function Dashboard() {
  const { user } = useSelector((state) => state.auth)
  const { t, language } = useLanguage()
  const [products, setProducts] = useState([])
  const [sales, setSales] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [productsRes, salesRes] = await Promise.all([
        window.api.getProducts(),
        window.api.getSales(),
      ])
      if (productsRes.success) setProducts(productsRes.data)
      if (salesRes.success) setSales(salesRes.data)
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const today = new Date().toDateString()

  const todaySales = sales.filter(
    (sale) => new Date(sale.created_at + 'Z').toDateString() === today
  )

  const todayRevenue = todaySales.reduce((sum, sale) => sum + sale.total, 0)

  const lowStockProducts = products.filter(
    (product) => product.stock <= product.low_stock_threshold
  )

  const outOfStockProducts = products.filter((product) => product.stock === 0)

  const hour = new Date().getHours()
  const greeting =
    hour < 12 ? t.goodMorning : hour < 17 ? t.goodAfternoon : t.goodEvening

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400">Loading dashboard...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Message */}
      <div>
        <h2 className="text-2xl font-bold text-white">
          {greeting}, {user?.name}! 👋
        </h2>
        <p className="text-gray-400 mt-1">
          {language === 'al'
            ? (() => {
                const d = new Date()
                const days = [
                  'E Diel',
                  'E Hënë',
                  'E Martë',
                  'E Mërkurë',
                  'E Enjte',
                  'E Premte',
                  'E Shtunë',
                ]
                const months = [
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
                return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`
              })()
            : new Date().toLocaleDateString('en-GB', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={t.todaySales}
          value={todaySales.length}
          subtitle={t.transactionsToday}
          color="text-blue-400"
          icon="🛒"
        />
        <StatCard
          title={t.todayRevenue}
          value={`${todayRevenue.toFixed(2)} den`}
          subtitle={t.totalEarnedToday}
          color="text-green-400"
          icon="💰"
        />
        <StatCard
          title={t.totalProducts}
          value={products.length}
          subtitle={t.productsInCatalogDash}
          color="text-purple-400"
          icon="📦"
        />
        <StatCard
          title={t.lowStockAlerts}
          value={lowStockProducts.length}
          subtitle={`${outOfStockProducts.length} ${t.outOfStockCount2}`}
          color={
            lowStockProducts.length > 0 ? 'text-yellow-400' : 'text-green-400'
          }
          icon="⚠️"
        />
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Products */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">{t.lowStockAlerts}</h3>
            <span
              className="bg-yellow-400/20 text-yellow-400 text-xs
                             font-medium px-2 py-1 rounded-full"
            >
              {lowStockProducts.length} {t.items}
            </span>
          </div>
          {lowStockProducts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-4xl mb-2">✅</p>
              <p className="text-gray-400 text-sm">{t.allProductsStocked}</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-700">
              {lowStockProducts.map((product) => (
                <LowStockCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>

        {/* Recent Sales */}
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">{t.recentSales}</h3>
            <span
              className="bg-blue-400/20 text-blue-400 text-xs
                             font-medium px-2 py-1 rounded-full"
            >
              {t.today}
            </span>
          </div>
          {todaySales.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-4xl mb-2">🛒</p>
              <p className="text-gray-400 text-sm">{t.noSalesToday}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todaySales.slice(0, 6).map((sale) => (
                <div
                  key={sale.id}
                  className="flex items-center justify-between py-2
                             border-b border-gray-700 last:border-0"
                >
                  <div>
                    <p className="text-white text-sm font-medium">
                      Sale #{sale.id}
                    </p>
                    <p className="text-gray-400 text-xs">
                      {t.by} {sale.cashier_name} · {sale.items?.length}{' '}
                      {t.items}
                    </p>
                  </div>
                  <span className="text-green-400 font-semibold text-sm">
                    den {sale.total.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
