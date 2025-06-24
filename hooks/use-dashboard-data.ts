// "use client"

// import { useState, useEffect } from "react"

// const SHEET_ID = "1yEsh4yzyvglPXHxo-5PT70VpwVJbxV7wwH8rpU1RFJA"
// const ORDER_DISPATCH_SHEET = "ORDER-DISPATCH"
// const DISPATCH_DELIVERY_SHEET = "DISPATCH-DELIVERY"

// export function useDashboardData() {
//   const [dashboardData, setDashboardData] = useState({
//     // Order metrics (for overview/orders tabs)
//     totalOrders: 0,
//     pendingOrders: 0,
//     completedOrders: 0,
//     cancelOrders: 0,
//     deliveredOrders: 0,
//     totalRevenue: 0,
    
//     // Dispatch metrics (for dispatch/analytics tabs)
//     totalDispatches: 0,
//     pendingDispatches: 0,
//     completedDispatches: 0,
//     dispatchRevenue: 0,
    
//     // Other existing metrics
//     completedRevenue: 0,
//     pendingRevenue: 0,
//     inventoryPending: 0,
//     materialReceived: 0,
//     calibrationRequired: 0,
//     monthlyData: [],
//     topCustomers: [],
//     recentOrders: [],
//     paymentModeData: [],
//     transportModeData: [],
//     approvalPending: 0,
//     invoiceGenerated: 0,
//     dispatchComplete: 0,
//   })

//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState(null)

//   // Helper function to extract month from date
//   const extractMonthFromDate = (dateValue) => {
//     if (!dateValue) return null

//     try {
//       let date
//       if (typeof dateValue === "string") {
//         // Handle dates like "6/7/2025" format
//         const parts = dateValue.split('/')
//         if (parts.length === 3) {
//           const month = parseInt(parts[0]) - 1 // Month is 0-indexed in JS Date
//           const day = parseInt(parts[1])
//           const year = parseInt(parts[2])
//           date = new Date(year, month, day)
//         } else if (dateValue.includes("Date(")) {
//           // Handle Google Sheets Date format
//           const match = dateValue.match(/Date\((\d+),(\d+),(\d+)\)/)
//           if (match) {
//             date = new Date(Number.parseInt(match[1]), Number.parseInt(match[2]), Number.parseInt(match[3]))
//           }
//         } else {
//           date = new Date(dateValue)
//         }
//       } else {
//         date = new Date(dateValue)
//       }

//       if (date && !isNaN(date.getTime())) {
//         const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
//         return monthNames[date.getMonth()]
//       }
//     } catch (e) {
//       console.error("Error parsing date:", e)
//     }
//     return null
//   }

//   // Convert data to chart format
//   const convertToChartData = (dataMap) => {
//     return Object.entries(dataMap).map(([key, value]) => ({
//       name: key,
//       value: value,
//     }))
//   }

//   const convertMonthlyData = (monthlyOrdersMap) => {
//     const monthOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
//     return monthOrder.map((month) => ({
//       month,
//       orders: monthlyOrdersMap[month] || 0,
//     }))
//   }

//   // Fetch data from ORDER-DISPATCH sheet
//   const fetchOrderDispatchData = async () => {
//     try {
//       const sheetUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${ORDER_DISPATCH_SHEET}`
//       const response = await fetch(sheetUrl)
//       const text = await response.text()

//       const jsonStart = text.indexOf("{")
//       const jsonEnd = text.lastIndexOf("}") + 1
//       const jsonData = text.substring(jsonStart, jsonEnd)

//       const data = JSON.parse(jsonData)

//       if (data && data.table && data.table.rows) {
//         let totalOrderCount = 0
//         let pendingOrderCount = 0
//         let completedOrderCount = 0
//         let cancelOrderCount = 0
//         let totalOrderRevenue = 0
//         let deliveredCount = 0
        
//         // Dispatch metrics from ORDER-DISPATCH sheet
//         let pendingDispatchCount = 0
//         let completedDispatchCount = 0
//         let dispatchRevenueSum = 0

//         const monthlyOrdersMap = {}
//         const paymentModeMap = {}
//         const transportModeMap = {}
//         const recentOrdersList = []

//         // Process data rows (skip header rows)
//         data.table.rows.slice(6).forEach((row, index) => {
//           // Check if row has data in column B (index 1)
//           if (row.c && row.c[1] && row.c[1].v) {
//             totalOrderCount++

//             // Order Status - Column AW (index 48 - 0 based, AW is column 49)
//             const orderStatus = row.c[48] && row.c[48].v ? row.c[48].v.toString().toLowerCase().trim() : ""
            
//             // Categorize orders based on Column AW
//             if (orderStatus === "complete") {
//               completedOrderCount++
//             } else if (orderStatus === "pending" || orderStatus === "") {
//               pendingOrderCount++
//             }

//             // Cancel Status - Column AS (index 44 - 0 based, AS is column 45)
//             const cancelStatus = row.c[44] && row.c[44].v ? row.c[44].v.toString().toLowerCase().trim() : ""
//             if (cancelStatus === "cancel") {
//               cancelOrderCount++
//             }

//             const deliveryStatus = row.c[47] && row.c[47].v
//             if (deliveryStatus) {
//               deliveredCount++
//             }

//             // Revenue - Column AP (index 41 - 0 based, AP is column 42)
//             const revenueAmount = Number.parseFloat(
//               row.c[41] && row.c[41].v ? row.c[41].v.toString().replace(/[^0-9.-]/g, "") : "0"
//             ) || 0
//             totalOrderRevenue += revenueAmount

//             // Dispatch Status - Column AX (index 49 - 0 based, AX is column 50)
//             const dispatchStatus = row.c[49] && row.c[49].v ? row.c[49].v.toString().toLowerCase().trim() : ""
//             if (dispatchStatus === "pending") {
//               pendingDispatchCount++
//             } else if (dispatchStatus === "complete") {
//               completedDispatchCount++
//             }

//             // Dispatch Revenue - Column CA (index 78 - 0 based, CA is column 79)
//             const dispatchRevenueAmount = Number.parseFloat(
//               row.c[78] && row.c[78].v ? row.c[78].v.toString().replace(/[^0-9.-]/g, "") : "0"
//             ) || 0
//             dispatchRevenueSum += dispatchRevenueAmount

//             // Analytics data
//             const paymentMode = row.c[8] && row.c[8].v ? row.c[8].v.toString().trim() : "Unknown"
//             const transportMode = row.c[27] && row.c[27].v ? row.c[27].v.toString().trim() : "Unknown"
            
//             paymentModeMap[paymentMode] = (paymentModeMap[paymentMode] || 0) + 1
//             transportModeMap[transportMode] = (transportModeMap[transportMode] || 0) + 1

//             // Monthly data - Changed to use Column A (index 0) instead of column 53
//             const dateValue = row.c[0] && row.c[0].v
//             if (dateValue) {
//               const month = extractMonthFromDate(dateValue)
//               if (month) {
//                 monthlyOrdersMap[month] = (monthlyOrdersMap[month] || 0) + 1
//               }
//             }

//             // Recent orders
//             if (recentOrdersList.length < 10) {
//               recentOrdersList.push({
//                 orderNo: row.c[1] && row.c[1].v ? row.c[1].v.toString() : `ORD-${index}`,
//                 company: row.c[3] && row.c[3].v ? row.c[3].v.toString() : "Unknown Company",
//                 amount: row.c[41] && row.c[41].v ? row.c[41].v.toString() : "0",
//                 status: row.c[48] && row.c[48].v ? row.c[48].v : "",
//                 date: row.c[0] && row.c[0].v ? row.c[0].v : new Date().toISOString(),
//               })
//             }
//           }
//         })

//         return {
//           // Order metrics
//           totalOrders: totalOrderCount,
//           pendingOrders: pendingOrderCount,
//           completedOrders: completedOrderCount,
//           cancelOrders: cancelOrderCount,
//           totalRevenue: totalOrderRevenue,
//           deliveredOrders: deliveredCount,
          
//           // Dispatch metrics
//           pendingDispatches: pendingDispatchCount,
//           completedDispatches: completedDispatchCount,
//           dispatchRevenue: dispatchRevenueSum,
          
//           // Analytics data
//           monthlyOrdersMap,
//           paymentModeMap,
//           transportModeMap,
//           recentOrdersList,
//         }
//       }
//       return {}
//     } catch (err) {
//       console.error("Error fetching ORDER-DISPATCH data:", err)
//       throw err
//     }
//   }

//   // Fetch data from DISPATCH-DELIVERY sheet
//   const fetchDispatchDeliveryData = async () => {
//     try {
//       const sheetUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${DISPATCH_DELIVERY_SHEET}`
//       const response = await fetch(sheetUrl)
//       const text = await response.text()

//       const jsonStart = text.indexOf("{")
//       const jsonEnd = text.lastIndexOf("}") + 1
//       const jsonData = text.substring(jsonStart, jsonEnd)

//       const data = JSON.parse(jsonData)

//       if (data && data.table && data.table.rows) {
//         // let deliveredCount = 0
//         let totalDispatchCount = 0
//         let invoiceGenerated = 0
//         let dispatchComplete = 0
//         let calibrationRequired = 0

//         const customerData = {}

//         data.table.rows.slice(6).forEach((row) => {
//           if (row.c && row.c[1] && row.c[1].v) {
//             // Total Dispatch count - Column B (index 1)
//             totalDispatchCount++

//             // Delivered count - Column CV (index 99 - 0 based, CV is column 100)
//             // const deliveryStatus = row.c[99] && row.c[99].v
//             // if (deliveryStatus) {
//             //   deliveredCount++
//             // }

//             // Other existing logic for invoices, dispatch complete, calibration
//             const invoiceNumber = row.c[68] && row.c[68].v
//             if (invoiceNumber) {
//               invoiceGenerated++
//             }

//             const dispatchStatus = row.c[100] && row.c[100].v
//             if (dispatchStatus && dispatchStatus.toString().toLowerCase().includes("complete")) {
//               dispatchComplete++
//             }

//             const calibrationReq = row.c[21] && row.c[21].v
//             if (calibrationReq && calibrationReq.toString().toLowerCase() === "yes") {
//               calibrationRequired++
//             }

//             // Customer data for top customers
//             const revenue = Number.parseFloat(
//               row.c[69] && row.c[69].v ? row.c[69].v.toString().replace(/[^0-9.-]/g, "") : "0"
//             ) || 0

//             const companyName = row.c[3] && row.c[3].v ? row.c[3].v.toString().trim() : ""
//             if (companyName) {
//               if (!customerData[companyName]) {
//                 customerData[companyName] = { name: companyName, orders: 0, revenue: 0 }
//               }
//               customerData[companyName].orders += 1
//               customerData[companyName].revenue += revenue
//             }
//           }
//         })

//         const topCustomers = Object.values(customerData)
//           .sort((a, b) => b.revenue - a.revenue)
//           .slice(0, 5)

//         return {
//         //   deliveredOrders: deliveredCount,
//           totalDispatches: totalDispatchCount,
//           invoiceGenerated,
//           dispatchComplete,
//           calibrationRequired,
//           topCustomers,
//         }
//       }
//       return {}
//     } catch (err) {
//       console.error("Error fetching DISPATCH-DELIVERY data:", err)
//       throw err
//     }
//   }

//   // Fetch all data
//   const fetchAllData = async () => {
//     setLoading(true)
//     setError(null)

//     try {
//       const [orderDispatchData, dispatchDeliveryData] = await Promise.all([
//         fetchOrderDispatchData(),
//         fetchDispatchDeliveryData(),
//       ])

//       setDashboardData({
//         ...orderDispatchData,
//         ...dispatchDeliveryData,
//         monthlyData: convertMonthlyData(orderDispatchData.monthlyOrdersMap || {}),
//         paymentModeData: convertToChartData(orderDispatchData.paymentModeMap || {}),
//         transportModeData: convertToChartData(orderDispatchData.transportModeMap || {}),
//         recentOrders: orderDispatchData.recentOrdersList || [],
//       })
//     } catch (err) {
//       setError(err.message)
//     } finally {
//       setLoading(false)
//     }
//   }

//   useEffect(() => {
//     fetchAllData()
//   }, [])

//   return {
//     dashboardData,
//     loading,
//     error,
//     fetchAllData,
//   }
// }













"use client"

import { useState, useEffect } from "react"

const SHEET_ID = "1yEsh4yzyvglPXHxo-5PT70VpwVJbxV7wwH8rpU1RFJA"
const ORDER_DISPATCH_SHEET = "ORDER-DISPATCH"
const DISPATCH_DELIVERY_SHEET = "DISPATCH-DELIVERY"

export function useDashboardData() {
  const [dashboardData, setDashboardData] = useState({
    // Order metrics (for overview/orders tabs)
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    cancelOrders: 0,
    deliveredOrders: 0,
    totalRevenue: 0,
    
    // Dispatch metrics (for dispatch/analytics tabs)
    totalDispatches: 0,
    pendingDispatches: 0,
    completedDispatches: 0,
    dispatchRevenue: 0,
    
    // Other existing metrics
    completedRevenue: 0,
    pendingRevenue: 0,
    inventoryPending: 0,
    materialReceived: 0,
    calibrationRequired: 0,
    monthlyData: [],
    topCustomers: [],
    recentOrders: [], // This will now contain ALL orders, not just recent 10
    paymentModeData: [],
    transportModeData: [],
    approvalPending: 0,
    invoiceGenerated: 0,
    dispatchComplete: 0,
  })

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Helper function to extract month from date
  const extractMonthFromDate = (dateValue) => {
    if (!dateValue) return null

    try {
      let date
      if (typeof dateValue === "string") {
        // Handle dates like "6/7/2025" format
        const parts = dateValue.split('/')
        if (parts.length === 3) {
          const month = parseInt(parts[0]) - 1 // Month is 0-indexed in JS Date
          const day = parseInt(parts[1])
          const year = parseInt(parts[2])
          date = new Date(year, month, day)
        } else if (dateValue.includes("Date(")) {
          // Handle Google Sheets Date format
          const match = dateValue.match(/Date\((\d+),(\d+),(\d+)\)/)
          if (match) {
            date = new Date(Number.parseInt(match[1]), Number.parseInt(match[2]), Number.parseInt(match[3]))
          }
        } else {
          date = new Date(dateValue)
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
        let totalOrderCount = 0
        let pendingOrderCount = 0
        let completedOrderCount = 0
        let cancelOrderCount = 0
        let totalOrderRevenue = 0
        let deliveredCount = 0
        
        // Dispatch metrics from ORDER-DISPATCH sheet
        let pendingDispatchCount = 0
        let completedDispatchCount = 0
        let dispatchRevenueSum = 0

        const monthlyOrdersMap = {}
        const paymentModeMap = {}
        const transportModeMap = {}
        const allOrdersList = [] // Changed from recentOrdersList to allOrdersList

        // Process data rows (skip header rows)
        data.table.rows.slice(6).forEach((row, index) => {
          // Check if row has data in column B (index 1)
          if (row.c && row.c[1] && row.c[1].v) {
            totalOrderCount++

            // Order Status - Column AW (index 48 - 0 based, AW is column 49)
            const orderStatus = row.c[48] && row.c[48].v ? row.c[48].v.toString().trim() : ""
            
            // Categorize orders based on Column AW
            if (orderStatus.toLowerCase() === "complete") {
              completedOrderCount++
            } else if (orderStatus.toLowerCase() === "pending" || orderStatus === "") {
              pendingOrderCount++
            }

            // Cancel Status - Column AS (index 44 - 0 based, AS is column 45)
            const cancelStatus = row.c[44] && row.c[44].v ? row.c[44].v.toString().toLowerCase().trim() : ""
            if (cancelStatus === "cancel") {
              cancelOrderCount++
            }

            const deliveryStatus = row.c[47] && row.c[47].v
            if (deliveryStatus) {
              deliveredCount++
            }

            // Revenue - Column AP (index 41 - 0 based, AP is column 42)
            const revenueAmount = Number.parseFloat(
              row.c[41] && row.c[41].v ? row.c[41].v.toString().replace(/[^0-9.-]/g, "") : "0"
            ) || 0
            totalOrderRevenue += revenueAmount

            // Dispatch Status - Column AX (index 49 - 0 based, AX is column 50)
            const dispatchStatus = row.c[49] && row.c[49].v ? row.c[49].v.toString().toLowerCase().trim() : ""
            if (dispatchStatus === "pending") {
              pendingDispatchCount++
            } else if (dispatchStatus === "complete") {
              completedDispatchCount++
            }

            // Dispatch Revenue - Column CA (index 78 - 0 based, CA is column 79)
            const dispatchRevenueAmount = Number.parseFloat(
              row.c[78] && row.c[78].v ? row.c[78].v.toString().replace(/[^0-9.-]/g, "") : "0"
            ) || 0
            dispatchRevenueSum += dispatchRevenueAmount

            // Analytics data
            const paymentMode = row.c[8] && row.c[8].v ? row.c[8].v.toString().trim() : "Unknown"
            const transportMode = row.c[27] && row.c[27].v ? row.c[27].v.toString().trim() : "Unknown"
            
            paymentModeMap[paymentMode] = (paymentModeMap[paymentMode] || 0) + 1
            transportModeMap[transportMode] = (transportModeMap[transportMode] || 0) + 1

            // Monthly data - Column A (index 0)
            const dateValue = row.c[0] && row.c[0].v
            if (dateValue) {
              const month = extractMonthFromDate(dateValue)
              if (month) {
                monthlyOrdersMap[month] = (monthlyOrdersMap[month] || 0) + 1
              }
            }

            // Add ALL orders to the list (removed the limit of 10)
            // Extract and format date properly from column A (index 0)
            let formattedDate = new Date().toISOString() // default
            if (row.c[0] && row.c[0].v) {
              const dateValue = row.c[0].v
              if (typeof dateValue === "string" && dateValue.includes('/')) {
                // Handle mm/dd/yyyy format like "6/12/2025"
                formattedDate = dateValue
              } else if (typeof dateValue === "string" && dateValue.includes("Date(")) {
                // Handle Google Sheets Date format
                const match = dateValue.match(/Date\((\d+),(\d+),(\d+)\)/)
                if (match) {
                  const date = new Date(Number.parseInt(match[1]), Number.parseInt(match[2]), Number.parseInt(match[3]))
                  formattedDate = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`
                }
              } else {
                // Try to parse as regular date and convert to mm/dd/yyyy
                try {
                  const date = new Date(dateValue)
                  if (!isNaN(date.getTime())) {
                    formattedDate = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`
                  }
                } catch (e) {
                  console.error("Date parsing error:", e)
                }
              }
            }

            allOrdersList.push({
              orderNo: row.c[1] && row.c[1].v ? row.c[1].v.toString() : `ORD-${index}`,
              company: row.c[3] && row.c[3].v ? row.c[3].v.toString() : "Unknown Company",
              amount: row.c[41] && row.c[41].v ? row.c[41].v.toString() : "0",
              status: orderStatus, // Use the actual status from column AW
              date: formattedDate,
            })
          }
        })

        // Sort orders by date (most recent first)
        allOrdersList.sort((a, b) => {
          const dateA = new Date(a.date)
          const dateB = new Date(b.date)
          return dateB.getTime() - dateA.getTime()
        })

        return {
          // Order metrics
          totalOrders: totalOrderCount,
          pendingOrders: pendingOrderCount,
          completedOrders: completedOrderCount,
          cancelOrders: cancelOrderCount,
          totalRevenue: totalOrderRevenue,
          deliveredOrders: deliveredCount,
          
          // Dispatch metrics
          pendingDispatches: pendingDispatchCount,
          completedDispatches: completedDispatchCount,
          dispatchRevenue: dispatchRevenueSum,
          
          // Analytics data
          monthlyOrdersMap,
          paymentModeMap,
          transportModeMap,
          allOrdersList, // Changed from recentOrdersList
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
        let totalDispatchCount = 0
        let invoiceGenerated = 0
        let dispatchComplete = 0
        let calibrationRequired = 0

        const customerData = {}

        data.table.rows.slice(6).forEach((row) => {
          if (row.c && row.c[1] && row.c[1].v) {
            // Total Dispatch count - Column B (index 1)
            totalDispatchCount++

            // Other existing logic for invoices, dispatch complete, calibration
            const invoiceNumber = row.c[68] && row.c[68].v
            if (invoiceNumber) {
              invoiceGenerated++
            }

            const dispatchStatus = row.c[100] && row.c[100].v
            if (dispatchStatus && dispatchStatus.toString().toLowerCase().includes("complete")) {
              dispatchComplete++
            }

            const calibrationReq = row.c[21] && row.c[21].v
            if (calibrationReq && calibrationReq.toString().toLowerCase() === "yes") {
              calibrationRequired++
            }

            // Customer data for top customers
            const revenue = Number.parseFloat(
              row.c[69] && row.c[69].v ? row.c[69].v.toString().replace(/[^0-9.-]/g, "") : "0"
            ) || 0

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
          totalDispatches: totalDispatchCount,
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

  // Fetch all data
  const fetchAllData = async () => {
    setLoading(true)
    setError(null)

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
        recentOrders: orderDispatchData.allOrdersList || [], // Use allOrdersList instead of recentOrdersList
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAllData()
  }, [])

  return {
    dashboardData,
    loading,
    error,
    fetchAllData,
  }
}