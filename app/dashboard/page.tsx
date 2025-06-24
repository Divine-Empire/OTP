"use client"

import { MainLayout } from "@/components/layout/main-layout"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
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
  LineChart,
  Line,
} from "recharts"
import {
  ShoppingCart,
  Clock,
  CheckCircle,
  Truck,
  DollarSign,
  CreditCard,
  AlertCircle,
  RefreshCw,
  Package,
  FileText,
  TrendingUp,
  Activity,
  Warehouse,
  ClipboardCheck,
} from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const SHEET_ID = "1yEsh4yzyvglPXHxo-5PT70VpwVJbxV7wwH8rpU1RFJA"
const ORDER_DISPATCH_SHEET = "ORDER-DISPATCH"
const DISPATCH_DELIVERY_SHEET = "DISPATCH-DELIVERY"

export default function OrderDispatchDashboard() {
  const [dashboardData, setDashboardData] = useState({
    // Order Statistics
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    cancelOrders: 0,
    deliveredOrders: 0,

    // Financial Data
    totalRevenue: 0,
    completedRevenue: 0,
    pendingRevenue: 0,

    // Inventory & Material
    inventoryPending: 0,
    materialReceived: 0,
    calibrationRequired: 0,

    // Analytics Data
    monthlyData: [],
    topCustomers: [],
    recentOrders: [],
    paymentModeData: [],
    transportModeData: [],

    // Status Tracking
    approvalPending: 0,
    invoiceGenerated: 0,
    dispatchComplete: 0,

    loading: true,
    error: null,
  })

  const [filters, setFilters] = useState({
    dateRange: "all",
    status: "all",
    customer: "all",
  })

  // Fetch data from ORDER-DISPATCH sheet
  const fetchOrderDispatchData = async () => {
    try {
      const sheetUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${ORDER_DISPATCH_SHEET}`
      const response = await fetch(sheetUrl)
      const text = await response.text()

      const jsonStart = text.indexOf("{")
      const jsonEnd = text.lastIndexOf("}") + 1
      const jsonData = text.substring(jsonStart, jsonEnd)

      const data = JSON.parse(jsonData)

      if (data && data.table && data.table.rows) {
        let totalCount = 0
        let pendingCount = 0
        let completedCount = 0
        let cancelCount = 0
        let completedRevenue = 0
        let pendingRevenue = 0
        let inventoryPending = 0
        let materialReceived = 0
        let approvalPending = 0
        const calibrationRequired = 0

        const monthlyOrdersMap = {}
        const paymentModeMap = {}
        const transportModeMap = {}
        const recentOrdersList = []

        // Process data rows (skip header rows)
        data.table.rows.slice(6).forEach((row, index) => {
          if (row.c && row.c[1] && row.c[1].v) {
            // Column B has order data
            totalCount++

            // Order Status (Column BD - index 55)
            const orderStatus = row.c[55] && row.c[55].v ? row.c[55].v.toString().toLowerCase().trim() : ""

            // Revenue Status (Column AW - index 48)
            const revenueStatus = row.c[48] && row.c[48].v ? row.c[48].v.toString().toLowerCase().trim() : ""

            // Revenue Amount (Column BT - index 71)
            const revenueAmount =
              Number.parseFloat(row.c[71] && row.c[71].v ? row.c[71].v.toString().replace(/[^0-9.-]/g, "") : "0") || 0

            // Inventory Status (Column AY - index 50)
            const inventoryStatus = row.c[50] && row.c[50].v ? row.c[50].v.toString().toLowerCase().trim() : ""

            // Material Received (Column BC - index 54)
            const materialStatus = row.c[54] && row.c[54].v ? row.c[54].v.toString().toLowerCase().trim() : ""

            // Approval Status (Column BE - index 56)
            const approvalStatus = row.c[56] && row.c[56].v ? row.c[56].v.toString().toLowerCase().trim() : ""

            // Payment Mode (Column I - index 8)
            const paymentMode = row.c[8] && row.c[8].v ? row.c[8].v.toString().trim() : "Unknown"

            // Transport Mode (Column AB - index 27)
            const transportMode = row.c[27] && row.c[27].v ? row.c[27].v.toString().trim() : "Unknown"

            // Categorize orders
            if (!orderStatus || orderStatus === "") {
              pendingCount++
            } else if (orderStatus === "yes") {
              completedCount++

              // Monthly analytics
              const dateValue = row.c[53] && row.c[53].v
              if (dateValue) {
                const month = extractMonthFromDate(dateValue)
                if (month) {
                  monthlyOrdersMap[month] = (monthlyOrdersMap[month] || 0) + 1
                }
              }
            } else if (orderStatus === "order cancel") {
              cancelCount++
            }

            // Revenue categorization
            if (revenueStatus === "completed") {
              completedRevenue += revenueAmount
            } else {
              pendingRevenue += revenueAmount
            }

            // Inventory tracking
            if (inventoryStatus === "not available" || inventoryStatus === "pending") {
              inventoryPending++
            }

            // Material tracking
            if (materialStatus === "received" || materialStatus === "yes") {
              materialReceived++
            }

            // Approval tracking
            if (!approvalStatus || approvalStatus === "" || approvalStatus === "pending") {
              approvalPending++
            }

            // Payment mode analytics
            paymentModeMap[paymentMode] = (paymentModeMap[paymentMode] || 0) + 1

            // Transport mode analytics
            transportModeMap[transportMode] = (transportModeMap[transportMode] || 0) + 1

            // Recent orders (last 10)
            if (recentOrdersList.length < 10) {
              recentOrdersList.push({
                orderNo: row.c[1] && row.c[1].v ? row.c[1].v.toString() : `ORD-${index}`,
                company: row.c[3] && row.c[3].v ? row.c[3].v.toString() : "Unknown Company",
                amount: revenueAmount,
                status: orderStatus || "pending",
                date: row.c[0] && row.c[0].v ? row.c[0].v : new Date().toISOString(),
              })
            }
          }
        })

        return {
          totalOrders: totalCount,
          pendingOrders: pendingCount,
          completedOrders: completedCount,
          cancelOrders: cancelCount,
          completedRevenue,
          pendingRevenue,
          inventoryPending,
          materialReceived,
          approvalPending,
          calibrationRequired,
          monthlyOrdersMap,
          paymentModeMap,
          transportModeMap,
          recentOrdersList,
        }
      }
      return {}
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

      const jsonStart = text.indexOf("{")
      const jsonEnd = text.lastIndexOf("}") + 1
      const jsonData = text.substring(jsonStart, jsonEnd)

      const data = JSON.parse(jsonData)

      if (data && data.table && data.table.rows) {
        let deliveredCount = 0
        let totalRevenue = 0
        let invoiceGenerated = 0
        let dispatchComplete = 0
        let calibrationRequired = 0

        const customerData = {}

        // Process data rows
        data.table.rows.slice(6).forEach((row) => {
          if (row.c) {
            // Delivery Status (Columns CU & CV - index 98, 99)
            const deliveryDate1 = row.c[98] && row.c[98].v
            const deliveryDate2 = row.c[99] && row.c[99].v

            if (deliveryDate1 && deliveryDate2) {
              deliveredCount++
            }

            // Invoice Status (Column BQ - index 68)
            const invoiceNumber = row.c[68] && row.c[68].v
            if (invoiceNumber) {
              invoiceGenerated++
            }

            // Dispatch Status (Column CW - index 100)
            const dispatchStatus = row.c[100] && row.c[100].v
            if (dispatchStatus && dispatchStatus.toString().toLowerCase().includes("complete")) {
              dispatchComplete++
            }

            // Calibration Required (Column V - index 21)
            const calibrationReq = row.c[21] && row.c[21].v
            if (calibrationReq && calibrationReq.toString().toLowerCase() === "yes") {
              calibrationRequired++
            }

            // Total Revenue (Column BR - index 69)
            const revenue =
              Number.parseFloat(row.c[69] && row.c[69].v ? row.c[69].v.toString().replace(/[^0-9.-]/g, "") : "0") || 0
            totalRevenue += revenue

            // Customer Data (Column D - index 3)
            const companyName = row.c[3] && row.c[3].v ? row.c[3].v.toString().trim() : ""
            if (companyName) {
              if (!customerData[companyName]) {
                customerData[companyName] = { name: companyName, orders: 0, revenue: 0 }
              }
              customerData[companyName].orders += 1
              customerData[companyName].revenue += revenue
            }
          }
        })

        const topCustomers = Object.values(customerData)
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 5)

        return {
          deliveredOrders: deliveredCount,
          totalRevenue,
          invoiceGenerated,
          dispatchComplete,
          calibrationRequired,
          topCustomers,
        }
      }
      return {}
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
      if (typeof dateValue === "string" && dateValue.includes("Date(")) {
        const match = dateValue.match(/Date$$(\d+),(\d+),(\d+)$$/)
        if (match) {
          date = new Date(Number.parseInt(match[1]), Number.parseInt(match[2]), Number.parseInt(match[3]))
        }
      } else {
        date = new Date(dateValue)
      }

      if (date && !isNaN(date.getTime())) {
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        return monthNames[date.getMonth()]
      }
    } catch (e) {
      console.error("Error parsing date:", e)
    }
    return null
  }

  // Convert data to chart format
  const convertToChartData = (dataMap) => {
    return Object.entries(dataMap).map(([key, value]) => ({
      name: key,
      value: value,
    }))
  }

  const convertMonthlyData = (monthlyOrdersMap) => {
    const monthOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    return monthOrder.map((month) => ({
      month,
      orders: monthlyOrdersMap[month] || 0,
    }))
  }

  // Fetch all data
  const fetchAllData = async () => {
    setDashboardData((prev) => ({ ...prev, loading: true, error: null }))

    try {
      const [orderDispatchData, dispatchDeliveryData] = await Promise.all([
        fetchOrderDispatchData(),
        fetchDispatchDeliveryData(),
      ])

      setDashboardData({
        ...orderDispatchData,
        ...dispatchDeliveryData,
        monthlyData: convertMonthlyData(orderDispatchData.monthlyOrdersMap || {}),
        paymentModeData: convertToChartData(orderDispatchData.paymentModeMap || {}),
        transportModeData: convertToChartData(orderDispatchData.transportModeMap || {}),
        recentOrders: orderDispatchData.recentOrdersList || [],
        loading: false,
        error: null,
      })
    } catch (err) {
      setDashboardData((prev) => ({
        ...prev,
        loading: false,
        error: err.message,
      }))
    }
  }

  useEffect(() => {
    fetchAllData()
  }, [])

  if (dashboardData.loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-purple-600" />
          <span className="ml-2 text-purple-700">Loading comprehensive dashboard data...</span>
        </div>
      </div>
    )
  }

  if (dashboardData.error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
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

  const orderStatusData = [
    { name: "Completed", value: dashboardData.completedOrders, color: "#10b981" },
    { name: "Pending", value: dashboardData.pendingOrders, color: "#f59e0b" },
    { name: "Cancelled", value: dashboardData.cancelOrders, color: "#ef4444" },
  ]

  const revenueData = [
    { name: "Completed", value: dashboardData.completedRevenue, color: "#10b981" },
    { name: "Pending", value: dashboardData.pendingRevenue, color: "#f59e0b" },
  ]
  return (
<MainLayout>
<div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
              Order & Dispatch Dashboard
            </h1>
            <p className="text-muted-foreground mt-2">Comprehensive real-time overview from Google Sheets</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={fetchAllData} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Data
            </Button>
          </div>
        </div>

        {/* Main Metrics */}
        {/* Main Metrics - Simplified */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.totalOrders}</div>
              <p className="text-xs opacity-80">All orders</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.completedOrders}</div>
              <p className="text-xs opacity-80">
                Success rate:{" "}
                {dashboardData.totalOrders > 0
                  ? ((dashboardData.completedOrders / dashboardData.totalOrders) * 100).toFixed(1)
                  : 0}
                %
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Delivered</CardTitle>
              <Truck className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.deliveredOrders}</div>
              <p className="text-xs opacity-80">
                Delivery rate:{" "}
                {dashboardData.totalOrders > 0
                  ? ((dashboardData.deliveredOrders / dashboardData.totalOrders) * 100).toFixed(1)
                  : 0}
                %
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white border-0 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <DollarSign className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{(dashboardData.totalRevenue / 100000).toFixed(1)}L</div>
              <p className="text-xs opacity-80">Total earnings</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for Different Views */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="dispatch">Dispatch</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Revenue & Status Cards */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completed Revenue</CardTitle>
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₹{dashboardData.completedRevenue.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">Revenue from completed orders</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Revenue</CardTitle>
                  <AlertCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₹{dashboardData.pendingRevenue.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">Revenue from pending orders</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Invoices Generated</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardData.invoiceGenerated}</div>
                  <p className="text-xs text-muted-foreground">Invoices created</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Approvals Pending</CardTitle>
                  <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardData.approvalPending}</div>
                  <p className="text-xs text-muted-foreground">Awaiting approval</p>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Order Status Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={orderStatusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {orderStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Monthly Orders Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={dashboardData.monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="orders" stroke="#3b82f6" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Top Customers */}
            <Card>
              <CardHeader>
                <CardTitle>Top 5 Customers</CardTitle>
                <CardDescription>Based on total revenue</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dashboardData.topCustomers.map((customer, index) => (
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
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Latest order activities</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Order No.</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dashboardData.recentOrders.map((order, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{order.orderNo}</TableCell>
                        <TableCell>{order.company}</TableCell>
                        <TableCell>₹{order.amount.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              order.status === "yes"
                                ? "default"
                                : order.status === "order cancel"
                                  ? "destructive"
                                  : "secondary"
                            }
                          >
                            {order.status === "yes"
                              ? "Completed"
                              : order.status === "order cancel"
                                ? "Cancelled"
                                : "Pending"}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(order.date).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inventory" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Inventory Pending</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardData.inventoryPending}</div>
                  <p className="text-xs text-muted-foreground">Items not available</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Material Received</CardTitle>
                  <Warehouse className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardData.materialReceived}</div>
                  <p className="text-xs text-muted-foreground">Materials in stock</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Calibration Required</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardData.calibrationRequired}</div>
                  <p className="text-xs text-muted-foreground">Items need calibration</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="dispatch" className="space-y-4">
            {/* Dispatch Summary Cards */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Dispatched</CardTitle>
                  <Truck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {dashboardData.dispatchComplete + dashboardData.pendingOrders}
                  </div>
                  <p className="text-xs text-muted-foreground">All dispatch orders</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Dispatch Complete</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{dashboardData.dispatchComplete}</div>
                  <p className="text-xs text-muted-foreground">Successfully dispatched</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Dispatch Pending</CardTitle>
                  <Clock className="h-4 w-4 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">{dashboardData.pendingOrders}</div>
                  <p className="text-xs text-muted-foreground">Awaiting dispatch</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {dashboardData.dispatchComplete + dashboardData.pendingOrders > 0
                      ? (
                          (dashboardData.dispatchComplete /
                            (dashboardData.dispatchComplete + dashboardData.pendingOrders)) *
                          100
                        ).toFixed(1)
                      : 0}
                    %
                  </div>
                  <p className="text-xs text-muted-foreground">Dispatch efficiency</p>
                </CardContent>
              </Card>
            </div>

            {/* Dispatch Analytics */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Dispatch Status Overview</CardTitle>
                  <CardDescription>Complete vs Pending dispatch orders</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: "Complete", value: dashboardData.dispatchComplete, color: "#10b981" },
                          { name: "Pending", value: dashboardData.pendingOrders, color: "#f59e0b" },
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        <Cell fill="#10b981" />
                        <Cell fill="#f59e0b" />
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Dispatch Trend</CardTitle>
                  <CardDescription>Monthly dispatch completion</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={dashboardData.monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="orders" fill="#8b5cf6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Dispatch Tables */}
            <div className="grid gap-4 md:grid-cols-2">
              {/* Complete Dispatch Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-green-600">Complete Dispatch Orders</CardTitle>
                  <CardDescription>Successfully dispatched orders</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order No.</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dashboardData.recentOrders
                        .filter((order) => order.status === "yes")
                        .slice(0, 5)
                        .map((order, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{order.orderNo}</TableCell>
                            <TableCell>{order.company}</TableCell>
                            <TableCell>₹{order.amount.toLocaleString()}</TableCell>
                            <TableCell>
                              <Badge variant="default" className="bg-green-100 text-green-800">
                                Complete
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Pending Dispatch Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-yellow-600">Pending Dispatch Orders</CardTitle>
                  <CardDescription>Orders awaiting dispatch</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order No.</TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dashboardData.recentOrders
                        .filter((order) => order.status !== "yes" && order.status !== "order cancel")
                        .slice(0, 5)
                        .map((order, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">{order.orderNo}</TableCell>
                            <TableCell>{order.company}</TableCell>
                            <TableCell>₹{order.amount.toLocaleString()}</TableCell>
                            <TableCell>
                              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                                Pending
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>

            {/* Dispatch Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Dispatch Performance Metrics</CardTitle>
                <CardDescription>Key performance indicators for dispatch operations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{dashboardData.dispatchComplete}</div>
                    <p className="text-sm text-muted-foreground">Orders Dispatched</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">{dashboardData.pendingOrders}</div>
                    <p className="text-sm text-muted-foreground">Pending Dispatch</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {dashboardData.dispatchComplete + dashboardData.pendingOrders > 0
                        ? Math.round(
                            (dashboardData.dispatchComplete /
                              (dashboardData.dispatchComplete + dashboardData.pendingOrders)) *
                              100,
                          )
                        : 0}
                      %
                    </div>
                    <p className="text-sm text-muted-foreground">Success Rate</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Payment Mode Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={dashboardData.paymentModeData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#8b5cf6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Transport Mode Usage</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={dashboardData.transportModeData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#06b6d4" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Distribution</CardTitle>
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
          </TabsContent>
        </Tabs>
      </div>
    </div>
    </MainLayout>
  )
}