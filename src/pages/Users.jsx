import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'

function UserModal({ user, onSave, onClose }) {
  const [form, setForm] = useState({
    name: user?.name || '',
    username: user?.username || '',
    password: '',
    role: user?.role || 'cashier',
  })
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!form.name || !form.username) {
      setError('Name and username are required')
      return
    }
    if (!user && !form.password) {
      setError('Password is required for new users')
      return
    }
    if (form.password && form.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    await onSave({ ...form, id: user?.id })
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <h3 className="text-white font-bold text-xl mb-6">
          {user ? 'Edit User' : 'Add New User'}
        </h3>

        {error && (
          <div
            className="bg-red-500/20 border border-red-500 text-red-400
                          rounded-lg p-3 mb-4 text-sm"
          >
            {error}
          </div>
        )}

        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="text-gray-400 text-sm mb-1 block">
              Full Name *
            </label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. John Smith"
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-2.5
                         outline-none focus:ring-2 focus:ring-blue-500
                         placeholder-gray-500"
            />
          </div>

          {/* Username */}
          <div>
            <label className="text-gray-400 text-sm mb-1 block">
              Username *
            </label>
            <input
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              placeholder="e.g. john"
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-2.5
                         outline-none focus:ring-2 focus:ring-blue-500
                         placeholder-gray-500"
            />
          </div>

          {/* Password */}
          <div>
            <label className="text-gray-400 text-sm mb-1 block">
              {user
                ? 'New Password (leave blank to keep current)'
                : 'Password *'}
            </label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder={
                user ? 'Leave blank to keep current' : 'Min 6 characters'
              }
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-2.5
                         outline-none focus:ring-2 focus:ring-blue-500
                         placeholder-gray-500"
            />
          </div>

          {/* Role */}
          <div>
            <label className="text-gray-400 text-sm mb-1 block">Role *</label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="w-full bg-gray-700 text-white rounded-lg px-4 py-2.5
                         outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="cashier">Cashier</option>
              <option value="owner">Owner</option>
            </select>
            <p className="text-gray-500 text-xs mt-1">
              Owners have full access. Cashiers can only process sales.
            </p>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
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
            {user ? 'Save Changes' : 'Add User'}
          </button>
        </div>
      </div>
    </div>
  )
}

function Users() {
  const { user: currentUser } = useSelector((state) => state.auth)
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [success, setSuccess] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    const result = await window.api.getUsers()
    if (result.success) setUsers(result.data)
    setLoading(false)
  }

  const handleSave = async (data) => {
    let result
    if (data.id) {
      result = await window.api.updateUser(data)
    } else {
      result = await window.api.createUser(data)
    }

    if (result.success) {
      setShowModal(false)
      setEditingUser(null)
      setSuccess(
        data.id ? 'User updated successfully!' : 'User added successfully!'
      )
      loadData()
      setTimeout(() => setSuccess(''), 3000)
    }
  }

  const handleDelete = async (id) => {
    await window.api.deleteUser(id)
    setDeleteConfirm(null)
    setSuccess('User deleted successfully!')
    loadData()
    setTimeout(() => setSuccess(''), 3000)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400">Loading users...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Users</h2>
          <p className="text-gray-400 mt-1">{users.length} users registered</p>
        </div>
        <button
          onClick={() => {
            setEditingUser(null)
            setShowModal(true)
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2
                     rounded-lg text-sm font-medium transition-colors"
        >
          + Add User
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

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {users.map((user) => (
          <div
            key={user.id}
            className="bg-gray-800 rounded-xl border border-gray-700 p-5"
          >
            {/* Avatar + Info */}
            <div className="flex items-center gap-4 mb-4">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center
                              text-lg font-bold ${
                                user.role === 'owner'
                                  ? 'bg-blue-600'
                                  : 'bg-gray-600'
                              }`}
              >
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-white font-semibold">{user.name}</p>
                <p className="text-gray-400 text-sm">@{user.username}</p>
              </div>
              {user.id === currentUser.id && (
                <span
                  className="ml-auto text-xs bg-blue-600/20 text-blue-400
                                 px-2 py-1 rounded-full"
                >
                  You
                </span>
              )}
            </div>

            {/* Role Badge */}
            <div className="flex items-center justify-between mb-4">
              <span
                className={`text-xs font-medium px-3 py-1 rounded-full capitalize ${
                  user.role === 'owner'
                    ? 'bg-blue-500/20 text-blue-400'
                    : 'bg-gray-600/50 text-gray-300'
                }`}
              >
                {user.role === 'owner' ? '👑 Owner' : '💼 Cashier'}
              </span>
              <p className="text-gray-500 text-xs">
                Since {new Date(user.created_at).toLocaleDateString()}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setEditingUser(user)
                  setShowModal(true)
                }}
                className="flex-1 bg-blue-600/20 hover:bg-blue-600 text-blue-400
                           hover:text-white py-2 rounded-lg text-xs font-medium
                           transition-colors"
              >
                Edit
              </button>
              {user.id !== currentUser.id && (
                <button
                  onClick={() => setDeleteConfirm(user)}
                  className="flex-1 bg-red-600/20 hover:bg-red-600 text-red-400
                             hover:text-white py-2 rounded-lg text-xs font-medium
                             transition-colors"
                >
                  Delete
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* User Modal */}
      {showModal && (
        <UserModal
          user={editingUser}
          onSave={handleSave}
          onClose={() => {
            setShowModal(false)
            setEditingUser(null)
          }}
        />
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center
                        justify-center z-50"
        >
          <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-white font-bold text-xl mb-2">Delete User?</h3>
            <p className="text-gray-400 mb-6">
              Are you sure you want to delete{' '}
              <span className="text-white font-medium">
                {deleteConfirm.name}
              </span>
              ? This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white
                           rounded-lg py-2.5 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm.id)}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white
                           rounded-lg py-2.5 font-medium transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Users
