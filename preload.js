const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('api', {
  // Auth
  login: (credentials) => ipcRenderer.invoke('auth:login', credentials),

  // Users
  getUsers: () => ipcRenderer.invoke('users:getAll'),
  createUser: (user) => ipcRenderer.invoke('users:create', user),
  updateUser: (user) => ipcRenderer.invoke('users:update', user),
  deleteUser: (id) => ipcRenderer.invoke('users:delete', id),

  // Customers
  getCustomers: () => ipcRenderer.invoke('customers:getAll'),
  createCustomer: (customer) => ipcRenderer.invoke('customers:create', customer),

  // Products
  getProducts: () => ipcRenderer.invoke('products:getAll'),
  createProduct: (product) => ipcRenderer.invoke('products:create', product),
  updateProduct: (product) => ipcRenderer.invoke('products:update', product),
  deleteProduct: (id) => ipcRenderer.invoke('products:delete', id),

  // Categories
  getCategories: () => ipcRenderer.invoke('categories:getAll'),
  createCategory: (category) => ipcRenderer.invoke('categories:create', category),

  // Sales
  createSale: (sale) => ipcRenderer.invoke('sales:create', sale),
  getSales: () => ipcRenderer.invoke('sales:getAll'),
  voidSale: (id) => ipcRenderer.invoke('sales:void', id),
  deleteSale: (id) => ipcRenderer.invoke('sales:delete', id),
  markSalePaid: (id) => ipcRenderer.invoke('sales:markPaid', id),

  // Internal Use
  createInternalUse: (data) => ipcRenderer.invoke('internal:create', data),
  getInternalUse: () => ipcRenderer.invoke('internal:getAll'),

  // Restock
  restockProduct: (data) => ipcRenderer.invoke('restock:create', data),
  getRestockLog: () => ipcRenderer.invoke('restock:getAll'),

  // Settings
  getSettings: () => ipcRenderer.invoke('settings:getAll'),
  updateSetting: (data) => ipcRenderer.invoke('settings:update', data),
  
  // Backup & Restore
  exportBackup: () => ipcRenderer.invoke('backup:export'),
  importBackup: () => ipcRenderer.invoke('backup:import'),
})