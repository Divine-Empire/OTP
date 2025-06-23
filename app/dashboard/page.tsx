"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { ShoppingCart, Clock, CheckCircle, Truck, DollarSign, CreditCard, AlertCircle, Users, Star, RefreshCw, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

const SHEET_ID = '1yEsh4yzyvglPXHxo-5PT70VpwVJbxV7wwH8rpU1RFJA'
const ORDER_DISPATCH_SHEET = 'ORDER-DISPATCH'
const DISPATCH_DELIVERY_SHEET = 'DISPATCH-DELIVERY'

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    cancelOrders: 0,
    deliveredOrders: 0,
    totalRevenue: 0,
    completedRevenue: 0,
    pendingRevenue: 0,
    monthlyData: [],
    topCustomers: [],
    loading: true,
    error: null
  })

  // Fetch data from ORDER-DISPATCH sheet
  const fetchOrderDispatchData = async () => {
    try {
      const sheetUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${ORDER_DISPATCH_SHEET}`
      const response = await fetch(sheetUrl)
      const text = await response.text()
      
      const jsonStart = text.indexOf('{')
      const jsonEnd = text.lastIndexOf('}') + 1
      const jsonData = text.substring(jsonStart, jsonEnd)
      
      const data = JSON.parse(jsonData)
      
      if (data && data.table && data.table.rows) {
        let totalCount = 0
        let pendingCount = 0
        let completedCount = 0
        let cancelCount = 0
        let completedRevenue = 0
        let pendingRevenue = 0
        const monthlyOrdersMap = {}

        // Process data rows (skip header rows)
        data.table.rows.slice(6).forEach((row) => {
          if (row.c && row.c[1] && row.c[1].v) { // Column B has order data
            totalCount++
            
            // Column BD (index 55) - check status
            const bdValue = row.c[55] && row.c[55].v ? row.c[55].v.toString().toLowerCase().trim() : ""
            
            // Column AW (index 48) - for revenue status
            const awValue = row.c[48] && row.c[48].v ? row.c[48].v.toString().toLowerCase().trim() : ""
            
            // Column BT (index 71) - revenue amount
            const btValue = row.c[71] && row.c[71].v
            let revenueAmount = 0
            if (btValue && typeof btValue === 'number') {
              revenueAmount = btValue
            } else if (btValue && typeof btValue === 'string') {
              const numericValue = parseFloat(btValue.replace(/[^0-9.-]/g, ''))
              if (!isNaN(numericValue)) {
                revenueAmount = numericValue
              }
            }
            
            // Categorize orders based on BD column
            if (!bdValue || bdValue === "") {
              pendingCount++
            } else if (bdValue === "yes") {
              completedCount++
              
              // Column BB (index 53) - date for monthly analytics
              const dateValue = row.c[53] && row.c[53].v
              if (dateValue) {
                const month = extractMonthFromDate(dateValue)
                if (month) {
                  monthlyOrdersMap[month] = (monthlyOrdersMap[month] || 0) + 1
                }
              }
            } else if (bdValue === "order cancel") {
              cancelCount++
            }
            
            // Revenue categorization based on AW column
            if (awValue === "completed") {
              completedRevenue += revenueAmount
            } else if (awValue === "pending" || awValue === "") {
              pendingRevenue += revenueAmount
            }
          }
        })

        return {
          totalOrders: totalCount,
          pendingOrders: pendingCount,
          completedOrders: completedCount,
          cancelOrders: cancelCount,
          completedRevenue: completedRevenue,
          pendingRevenue: pendingRevenue,
          monthlyOrdersMap
        }
      }
      return { 
        totalOrders: 0, 
        pendingOrders: 0, 
        completedOrders: 0, 
        cancelOrders: 0,
        completedRevenue: 0,
        pendingRevenue: 0,
        monthlyOrdersMap: {} 
      }
    } catch (err) {
      console.error("Error fetching ORDER-DISPATCH data:", err)
      throw err
    }
  }

  // Fetch data from DISPATCH-DELIVERY sheet
  const fetchDispatchDeliveryData = async () => {
    try {
      const sheetUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${DISPATCH_DELIVERY_SHEET}`
      const response = await fetch(sheetUrl)
      const text = await response.text()
      
      const jsonStart = text.indexOf('{')
      const jsonEnd = text.lastIndexOf('}') + 1
      const jsonData = text.substring(jsonStart, jsonEnd)
      
      const data = JSON.parse(jsonData)
      
      if (data && data.table && data.table.rows) {
        let deliveredCount = 0
        let totalRevenue = 0
        const customerData = {}

        // Process data rows (skip header rows)
        data.table.rows.slice(6).forEach((row) => {
          if (row.c) {
            // Column CU (index 98) and CV (index 99) - both should not be null for delivered
            const cuValue = row.c[98] && row.c[98].v
            const cvValue = row.c[99] && row.c[99].v
            
            if (cuValue && cvValue && cuValue !== null && cvValue !== null && cuValue !== "" && cvValue !== "") {
              deliveredCount++
            }

            // Column BR (index 69) - revenue data for total revenue
            const brValue = row.c[69] && row.c[69].v
            if (brValue && typeof brValue === 'number') {
              totalRevenue += brValue
            } else if (brValue && typeof brValue === 'string') {
              const numericValue = parseFloat(brValue.replace(/[^0-9.-]/g, ''))
              if (!isNaN(numericValue)) {
                totalRevenue += numericValue
              }
            }

            // Column D (index 3) - company name for top customers
            const companyName = row.c[3] && row.c[3].v ? row.c[3].v.toString().trim() : ""
            
            if (companyName && companyName !== "") {
              if (!customerData[companyName]) {
                customerData[companyName] = {
                  name: companyName,
                  orders: 0,
                  revenue: 0
                }
              }
              
              customerData[companyName].orders += 1
              
              // Add BR column revenue to customer
              if (brValue && typeof brValue === 'number') {
                customerData[companyName].revenue += brValue
              } else if (brValue && typeof brValue === 'string') {
                const numericValue = parseFloat(brValue.replace(/[^0-9.-]/g, ''))
                if (!isNaN(numericValue)) {
                  customerData[companyName].revenue += numericValue
                }
              }
            }
          }
        })

        // Convert customer data to sorted array and get top 5
        const topCustomers = Object.values(customerData)
          .filter(customer => customer.orders > 0)
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 5)

        return {
          deliveredOrders: deliveredCount,
          totalRevenue: totalRevenue,
          topCustomers: topCustomers
        }
      }
      return { deliveredOrders: 0, totalRevenue: 0, topCustomers: [] }
    } catch (err) {
      console.error("Error fetching DISPATCH-DELIVERY data:", err)
      throw err
    }
  }

  // Helper function to extract month from date
  const extractMonthFromDate = (dateValue) => {
    if (!dateValue) return null
    
    try {
      let date
      
      // Handle Google Sheets date format
      if (typeof dateValue === 'string' && dateValue.includes('Date(')) {
        const match = dateValue.match(/Date\((\d+),(\d+),(\d+)\)/)
        if (match) {
          const year = parseInt(match[1])
          const month = parseInt(match[2])
          const day = parseInt(match[3])
          date = new Date(year, month, day)
        }
      } else {
        date = new Date(dateValue)
      }
      
      if (date && !isNaN(date.getTime())) {
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", 
                           "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        return monthNames[date.getMonth()]
      }
    } catch (e) {
      console.error('Error parsing date:', e)
    }
    
    return null
  }

  // Convert monthly orders map to chart data
  const convertToChartData = (monthlyOrdersMap) => {
    const monthOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", 
                       "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    
    return monthOrder.map(month => ({
      month,
      orders: monthlyOrdersMap[month] || 0
    }))
  }

  // Fetch all data
  const fetchAllData = async () => {
    setDashboardData(prev => ({ ...prev, loading: true, error: null }))
    
    try {
      const [orderDispatchData, dispatchDeliveryData] = await Promise.all([
        fetchOrderDispatchData(),
        fetchDispatchDeliveryData()
      ])

      const monthlyData = convertToChartData(orderDispatchData.monthlyOrdersMap)

      setDashboardData({
        totalOrders: orderDispatchData.totalOrders,
        pendingOrders: orderDispatchData.pendingOrders,
        completedOrders: orderDispatchData.completedOrders,
        cancelOrders: orderDispatchData.cancelOrders,
        deliveredOrders: dispatchDeliveryData.deliveredOrders,
        totalRevenue: dispatchDeliveryData.totalRevenue,
        completedRevenue: orderDispatchData.completedRevenue,
        pendingRevenue: orderDispatchData.pendingRevenue,
        topCustomers: dispatchDeliveryData.topCustomers,
        monthlyData,
        loading: false,
        error: null
      })
    } catch (err) {
      setDashboardData(prev => ({
        ...prev,
        loading: false,
        error: err.message
      }))
    }
  }

  useEffect(() => {
    fetchAllData()
  }, [])

  // Revenue distribution for pie chart based on AW column
  const revenueData = [
    { name: "Completed", value: dashboardData.completedRevenue, color: "#10b981" },
    { name: "Pending", value: dashboardData.pendingRevenue, color: "#f59e0b" },
  ]

  if (dashboardData.loading) {
    return (
      <div className="space-y-6 bg-gradient-to-b from-blue-50 to-purple-50 p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-purple-600" />
          <span className="ml-2 text-purple-700">Loading dashboard data from Google Sheets...</span>
        </div>
      </div>
    )
  }

  if (dashboardData.error) {
    return (
      <div className="space-y-6 bg-gradient-to-b from-blue-50 to-purple-50 p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Error Loading Dashboard</h1>
          <p className="text-muted-foreground mt-2">{dashboardData.error}</p>
          <Button onClick={fetchAllData} className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
<MainLayout>
    <div className="space-y-6 bg-gradient-to-b from-blue-50 to-purple-50 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">Dashboard</h1>
          <p className="text-muted-foreground">Real-time overview from Google Sheets</p>
          {/* <p className="text-sm text-gray-500">
            Data from: {ORDER_DISPATCH_SHEET} & {DISPATCH_DELIVERY_SHEET}
          </p> */}
        </div>
        <Button onClick={fetchAllData} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Data
        </Button>
      </div>

      {/* Order Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card className="bg-gradient-to-r from-blue-100 to-blue-200 border border-blue-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.totalOrders}</div>
            <p className="text-xs text-muted-foreground">From ORDER-DISPATCH sheet</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-yellow-100 to-yellow-200 border border-yellow-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.pendingOrders}</div>
            <p className="text-xs text-muted-foreground">Column BD is null</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-green-100 to-green-200 border border-green-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Complete Orders</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.completedOrders}</div>
            <p className="text-xs text-muted-foreground">Column BD is "Yes"</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-red-100 to-red-200 border border-red-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cancel Orders</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.cancelOrders}</div>
            <p className="text-xs text-muted-foreground">Column BD is "order cancel"</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-purple-100 to-purple-200 border border-purple-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivered Orders</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData.deliveredOrders}</div>
            <p className="text-xs text-muted-foreground">CU & CV not null</p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Statistics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-gradient-to-r from-blue-100 to-blue-200 border border-blue-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{dashboardData.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">From DISPATCH-DELIVERY BR column</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-green-100 to-green-200 border border-green-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Revenue</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{dashboardData.completedRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">AW = "completed", BT column</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-yellow-100 to-yellow-200 border border-yellow-200 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Revenue</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{dashboardData.pendingRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">AW = "pending", BT column</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-gradient-to-r from-white to-gray-100 border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle>Monthly Orders Analytics</CardTitle>
            <CardDescription>Orders completed by month (BD=Yes with BB date)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={dashboardData.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="orders" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-white to-gray-100 border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle>Revenue Distribution</CardTitle>
            <CardDescription>Based on AW column status and BT revenue</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={revenueData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {revenueData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Customers */}
      <div className="grid gap-4 md:grid-cols-1">
        <Card className="bg-gradient-to-r from-white to-gray-100 border border-gray-200 shadow-sm">
          <CardHeader>
            <CardTitle>Top 5 Customers</CardTitle>
            <CardDescription>Real data from DISPATCH-DELIVERY sheet (Column D company names, BR revenue sum)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dashboardData.topCustomers.length > 0 ? (
                dashboardData.topCustomers.map((customer, index) => (
                  <div key={customer.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">{index + 1}</Badge>
                      <div>
                        <p className="text-sm font-medium">{customer.name}</p>
                        <p className="text-xs text-muted-foreground">{customer.orders} orders</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">₹{customer.revenue.toLocaleString()}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No customer data available</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    </MainLayout>
  )
}