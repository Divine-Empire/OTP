import { useState, useMemo } from "react"
import { Search, Filter } from "lucide-react"

interface Order {
  orderNo: string
  company: string
  amount: number | string
  status: string
  date: string
}

interface RecentOrdersTableProps {
  orders: Order[]
}

export function RecentOrdersTable({ orders }: RecentOrdersTableProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  // Function to normalize status for display and filtering
  const normalizeStatus = (status: string) => {
    if (!status) return "pending"
    const normalizedStatus = status.toLowerCase().trim()
    
    if (normalizedStatus === "complete" || normalizedStatus === "completed") {
      return "complete"
    } else if (normalizedStatus === "cancel" || normalizedStatus === "cancelled" || normalizedStatus === "order cancel") {
      return "cancelled"
    } else {
      return "pending"
    }
  }

  // Function to get badge styles based on status
  const getBadgeStyles = (status: string) => {
    const normalized = normalizeStatus(status)
    switch (normalized) {
      case "complete":
        return "bg-green-100 text-green-800 border-green-200"
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  // Function to get display text for status
  const getStatusDisplay = (status: string) => {
    const normalized = normalizeStatus(status)
    switch (normalized) {
      case "complete":
        return "Completed"
      case "cancelled":
        return "Cancelled"
      default:
        return "Pending"
    }
  }

  // Filtered and searched orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Search filter
      const matchesSearch = searchTerm === "" || 
        order.orderNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.amount.toString().toLowerCase().includes(searchTerm.toLowerCase())

      // Status filter
      const orderStatus = normalizeStatus(order.status)
      const matchesStatus = statusFilter === "all" || orderStatus === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [orders, searchTerm, statusFilter])

  // Format amount
  const formatAmount = (amount: number | string) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount.replace(/[^0-9.-]/g, '')) : amount
    return isNaN(numAmount) ? '0' : numAmount.toLocaleString()
  }

  // Format date
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr)
      return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleDateString()
    } catch {
      return 'Invalid Date'
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
        <p className="text-sm text-gray-600 mt-1">
          Latest order activities ({filteredOrders.length} of {orders.length} orders)
        </p>
        
        {/* Search and Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search by order number, company, or amount..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="complete">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Order No.
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Company
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  {orders.length === 0 ? "No orders found" : "No orders match your search criteria"}
                </td>
              </tr>
            ) : (
              filteredOrders.map((order, index) => (
                <tr key={`${order.orderNo}-${index}`} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {order.orderNo}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.company}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₹{formatAmount(order.amount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getBadgeStyles(order.status)}`}>
                      {getStatusDisplay(order.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(order.date)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Results summary */}
      {(searchTerm || statusFilter !== "all") && (
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Showing {filteredOrders.length} of {orders.length} orders
            {searchTerm && ` matching "${searchTerm}"`}
            {statusFilter !== "all" && ` with status "${statusFilter}"`}
          </p>
        </div>
      )}
    </div>
  )
}