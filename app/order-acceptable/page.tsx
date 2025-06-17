"use client"

import { useState, useEffect } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Eye, RefreshCw } from "lucide-react"
import { useAuth } from "@/components/auth-provider"


const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyzW8-RldYx917QpAfO4kY-T8_ntg__T0sbr7Yup2ZTVb1FC5H1g6TYuJgAU6wTquVM/exec'
const SHEET_ID = '1yEsh4yzyvglPXHxo-5PT70VpwVJbxV7wwH8rpU1RFJA'
const SHEET_NAME = 'ORDER-DISPATCH'

const checklistItems = [
  "Price as per Quotation Check",
  "Quantity as per Quotation Check",
  "Technical as per Quotation Check",
  "Payment Terms Check",
  "Freight Check",
  "Material Availability Check",
  "GST Check",
  "Customer Details Check",
]

export default function OrderAcceptablePage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [isAcceptable, setIsAcceptable] = useState("")
  const [checkedItems, setCheckedItems] = useState([])
  const [remarks, setRemarks] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [viewOrder, setViewOrder] = useState(null)
const { user: currentUser } = useAuth()

  // Fetch data from Google Sheets - condition: column Q is not null and column R is null
  const fetchOrders = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Fetch the entire sheet using Google Sheets API directly
      const sheetUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${SHEET_NAME}`
      const response = await fetch(sheetUrl)
      const text = await response.text()
      
      // Extract the JSON part from the response
      const jsonStart = text.indexOf('{')
      const jsonEnd = text.lastIndexOf('}') + 1
      const jsonData = text.substring(jsonStart, jsonEnd)
      
      const data = JSON.parse(jsonData)
      
      // Process the orders data
      if (data && data.table && data.table.rows) {
        const ordersData = []
        
        data.table.rows.slice(6).forEach((row, index) => {
          if (row.c) {
            // Condition: column Q is not null and column R is null
            const hasColumnQ = row.c[52] && row.c[52].v !== null && row.c[52].v !== ""; // Column Q (index 16)
            const isColumnREmpty = !row.c[53] || row.c[53].v === null || row.c[53].v === ""; // Column R (index 17)
            
            if (hasColumnQ && isColumnREmpty) {
              // Calculate correct row index
              const actualRowIndex = index + 7;
              
              const order = {
                rowIndex: actualRowIndex,
                // Columns B to AA (indices 1 to 26)
                orderNo: row.c[1] ? row.c[1].v : "", // Column B
                quotationNo: row.c[2] ? row.c[2].v : "", // Column C
                companyName: row.c[3] ? row.c[3].v : "", // Column D
                contactPersonName: row.c[4] ? row.c[4].v : "", // Column E
                contactNumber: row.c[5] ? row.c[5].v : "", // Column F
                billingAddress: row.c[6] ? row.c[6].v : "", // Column G
                shippingAddress: row.c[7] ? row.c[7].v : "", // Column H
                paymentMode: row.c[8] ? row.c[8].v : "", // Column I
                paymentTerms: row.c[9] ? row.c[9].v : "", // Column J
                orderReceivedQty: row.c[10] ? row.c[10].v : "", // Column K
                transportMode: row.c[32] ? row.c[32].v : "", // Column L
                freightType: row.c[33] ? row.c[33].v : "", // Column M
                destination: row.c[34] ? row.c[34].v : "", // Column N
                poNumber: row.c[35] ? row.c[35].v : "", // Column O
                quotationCopy: row.c[36] ? row.c[36].v : "", // Column P
                acceptanceCopy: row.c[37] ? row.c[37].v : "", // Column Q
                offerShow: row.c[38] ? row.c[38].v : "", // Column R
                conveyedForRegistration: row.c[39] ? row.c[39].v : "", // Column S
                qtyAmount: row.c[40] ? row.c[40].v : "", // Column T
                quantityDelivered: row.c[43] ? row.c[43].v : "", // Column U
                orderCancel: row.c[44] ? row.c[44].v : "", // Column V
                pendingQty: row.c[45] ? row.c[45].v : "", // Column W
                materialReturn: row.c[47] ? row.c[47].v : "", // Column X
                status: row.c[24] ? row.c[24].v : "pending", // Column Y
                completeDate: row.c[51] ? row.c[51].v : "", // Column Z
                // Keep the old field names for backward compatibility in dialog
                id: row.c[1] ? row.c[1].v : `ORDER-${actualRowIndex}`,
                fullRowData: row.c
              }
              
              console.log(`Order ${order.orderNo}: Company "${order.companyName}" at actual row ${order.rowIndex}`)
              ordersData.push(order)
            }
          }
        })
        
        setOrders(ordersData)
        console.log('Total orders loaded:', ordersData.length)
        console.log('Orders data:', ordersData)
      }
    } catch (err) {
      console.error("Error fetching orders data:", err)
      setError(err.message)
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  // Helper function to format date from Google Sheets format
  const formatGoogleSheetsDate = (dateValue) => {
    if (!dateValue) return "";
    
    if (typeof dateValue === 'string' && dateValue.includes('Date(')) {
      const match = dateValue.match(/Date\((\d+),(\d+),(\d+)\)/);
      if (match) {
        const year = parseInt(match[1]);
        const month = parseInt(match[2]);
        const day = parseInt(match[3]);
        
        const date = new Date(year, month, day);
        const formattedDay = String(date.getDate()).padStart(2, '0');
        const formattedMonth = String(date.getMonth() + 1).padStart(2, '0');
        const formattedYear = date.getFullYear();
        
        return `${formattedDay}/${formattedMonth}/${formattedYear}`;
      }
    }
    
    try {
      const date = new Date(dateValue);
      if (!isNaN(date.getTime())) {
        const formattedDay = String(date.getDate()).padStart(2, '0');
        const formattedMonth = String(date.getMonth() + 1).padStart(2, '0');
        const formattedYear = date.getFullYear();
        
        return `${formattedDay}/${formattedMonth}/${formattedYear}`;
      }
    } catch (e) {
      console.error('Error parsing date:', e);
    }
    
    return dateValue;
  };

  // Fetch processed orders (where both Q and R have data)
  const fetchProcessedOrders = async () => {
    try {
      const sheetUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${SHEET_NAME}`
      const response = await fetch(sheetUrl)
      const text = await response.text()
      
      const jsonStart = text.indexOf('{')
      const jsonEnd = text.lastIndexOf('}') + 1
      const jsonData = text.substring(jsonStart, jsonEnd)
      
      const data = JSON.parse(jsonData)
      
      if (data && data.table && data.table.rows) {
        const processedOrdersData = []
        
        data.table.rows.slice(6).forEach((row, index) => {
          if (row.c) {
            // Show rows where both column Q and R have data
            const hasColumnQ = row.c[52] && row.c[52].v !== null && row.c[52].v !== ""; // Column Q (index 16)
            const hasColumnR = row.c[53] && row.c[53].v !== null && row.c[53].v !== ""; // Column R (index 17)
            
            if (hasColumnQ && hasColumnR) {
              const actualRowIndex = index + 7;
              
              const processedOrder = {
                rowIndex: actualRowIndex,
                timestamp: formatGoogleSheetsDate(row.c[0] ? row.c[0].v : ""),
                // Columns B to AA (indices 1 to 26)
                orderNo: row.c[1] ? row.c[1].v : "", // Column B
                quotationNo: row.c[2] ? row.c[2].v : "", // Column C
                companyName: row.c[3] ? row.c[3].v : "", // Column D
                contactPersonName: row.c[4] ? row.c[4].v : "", // Column E
                contactNumber: row.c[5] ? row.c[5].v : "", // Column F
                billingAddress: row.c[6] ? row.c[6].v : "", // Column G
                shippingAddress: row.c[7] ? row.c[7].v : "", // Column H
                paymentMode: row.c[8] ? row.c[8].v : "", // Column I
                paymentTerms: row.c[9] ? row.c[9].v : "", // Column J
                orderReceivedQty: row.c[10] ? row.c[10].v : "", // Column K
                transportMode: row.c[11] ? row.c[11].v : "", // Column L
                freightType: row.c[12] ? row.c[12].v : "", // Column M
                destination: row.c[13] ? row.c[13].v : "", // Column N
                poNumber: row.c[14] ? row.c[14].v : "", // Column O
                quotationCopy: row.c[15] ? row.c[15].v : "", // Column P
                acceptanceCopy: row.c[16] ? row.c[16].v : "", // Column Q
                offerShow: row.c[17] ? row.c[17].v : "", // Column R
                conveyedForRegistration: row.c[18] ? row.c[18].v : "", // Column S
                qtyAmount: row.c[19] ? row.c[19].v : "", // Column T
                quantityDelivered: row.c[20] ? row.c[20].v : "", // Column U
                orderCancel: row.c[21] ? row.c[21].v : "", // Column V
                pendingQty: row.c[22] ? row.c[22].v : "", // Column W
                materialReturn: row.c[23] ? row.c[23].v : "", // Column X
                status: row.c[24] ? row.c[24].v : "", // Column Y
                completeDate: row.c[25] ? row.c[25].v : "", // Column Z
                // Additional columns AE, AF, AG (indices 30, 31, 32)
                isOrderAcceptable: row.c[55] ? row.c[55].v : "", // Column AE
                orderAcceptanceChecklist: row.c[56] ? row.c[56].v : "", // Column AF
                remarks: row.c[57] ? row.c[57].v : "", // Column AG
                // Keep old field names for backward compatibility
                id: row.c[1] ? row.c[1].v : "",
                fullRowData: row.c
              }
              
              processedOrdersData.push(processedOrder)
            }
          }
        })
        
        return processedOrdersData
      }
      return []
    } catch (err) {
      console.error("Error fetching processed orders data:", err)
      return []
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  // Filter orders based on status
  const pendingOrders = orders.filter(order => order.status === "pending")

  // For processed orders, we'll fetch them separately when the tab is clicked
  const [processedOrders, setProcessedOrders] = useState([])
  const [processedLoading, setProcessedLoading] = useState(false)

  const handleProcessedTabClick = async () => {
    setProcessedLoading(true)
    const processed = await fetchProcessedOrders()
    setProcessedOrders(processed)
    setProcessedLoading(false)
  }

  const handleProcess = (order) => {
    setSelectedOrder(order)
    setIsAcceptable("")
    setCheckedItems([])
    setRemarks("")
    setIsDialogOpen(true)
  }

  // Update order status in Google Sheets
  const updateOrderStatus = async (order, acceptanceData) => {
    try {
      console.log(`Updating order for Order No.: ${order.id}`)
      console.log(`Order details:`, order)
      
      const formData = new FormData()
      formData.append('sheetName', SHEET_NAME)
      formData.append('action', 'updateByOrderNoInColumnB')
      formData.append('orderNo', order.id) // This will search in column B
      
      // Create a sparse array to update only specific columns
      const rowData = new Array(57).fill('') // Create array with 30 empty strings

      // Add today's date to column R (index 17)
      const today = new Date();
      const formattedDate = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
      rowData[53] = formattedDate; // Column R
      
      // Add acceptance status to column S (index 18)
      rowData[55] = acceptanceData.isAcceptable; // Column S
      
      if (acceptanceData.isAcceptable === 'Yes') {
        // If Yes, add checklist items to column T (index 19)
        const checklistText = acceptanceData.checklist.join(', ');
        rowData[56] = checklistText; // Column T
      }
      
      // Always add remarks to column U (index 20) regardless of acceptance status
      rowData[57] = acceptanceData.remarks || ''; // Column U
      
      formData.append('rowData', JSON.stringify(rowData))
      
      console.log('Sending data to Apps Script:', {
        sheetName: SHEET_NAME,
        orderNo: order.id,
        isAcceptable: acceptanceData.isAcceptable,
        todayDate: formattedDate,
        checklist: acceptanceData.checklist,
        remarks: acceptanceData.remarks
      })
      
      const updateResponse = await fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        mode: 'cors',
        body: formData
      })
      
      console.log('Response status:', updateResponse.status)
      
      if (!updateResponse.ok) {
        throw new Error(`HTTP error! status: ${updateResponse.status}`)
      }
      
      let result
      try {
        const responseText = await updateResponse.text()
        console.log('Raw response:', responseText)
        result = JSON.parse(responseText)
      } catch (parseError) {
        console.log('Response parsing failed, but request might be successful')
        result = { success: true }
      }
      
      console.log('Parsed result:', result)
      
      if (result.success !== false) {
        await fetchOrders()
        return true
      } else {
        throw new Error(result.error || 'Update failed')
      }
      
    } catch (err) {
      console.error('Error updating order:', err)
      setError(err.message)
      return false
    }
  }

  const handleSubmit = async () => {
    if (!selectedOrder || !isAcceptable) return

    const acceptanceData = {
      isAcceptable,
      checklist: isAcceptable === "Yes" ? checkedItems : [],
      remarks,
      processedAt: new Date().toISOString(),
      processedBy: "Current User",
    }

    const success = await updateOrderStatus(selectedOrder, acceptanceData)
    
    if (success) {
      setIsDialogOpen(false)
      setSelectedOrder(null)
      // Show success message
      alert(`Order ${selectedOrder.id} has been updated successfully as: ${isAcceptable}`)
    }
  }

  const handleView = (order) => {
    setViewOrder(order)
    setViewDialogOpen(true)
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading orders from Google Sheets...</span>
        </div>
      </MainLayout>
    )
  }

  if (error) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600">Error Loading Data</h1>
            <p className="text-muted-foreground mt-2">{error}</p>
            <Button onClick={fetchOrders} className="mt-4">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Order Acceptable</h1>
            <p className="text-muted-foreground">Review and process incoming orders from Google Sheets</p>
            <p className="text-sm text-gray-500">Sheet: {SHEET_NAME} | Total Orders: {orders.length}</p>
          </div>
          <Button onClick={fetchOrders} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh from Sheets
          </Button>
        </div>

        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending">Pending ({pendingOrders.length})</TabsTrigger>
            <TabsTrigger value="history" onClick={handleProcessedTabClick}>History ({processedOrders.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Pending Orders</CardTitle>
                <CardDescription>Orders from Google Sheets waiting for acceptance review (Q not null, R null)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Actions</TableHead>
                        <TableHead>Order No.</TableHead>
                        <TableHead>Quotation No.</TableHead>
                        <TableHead>Company Name</TableHead>
                        <TableHead>Contact Person Name</TableHead>
                        <TableHead>Contact Number</TableHead>
                        <TableHead>Billing Address</TableHead>
                        <TableHead>Shipping Address</TableHead>
                        <TableHead>Payment Mode</TableHead>
                        <TableHead>Payment Terms (In Days)</TableHead>
                        <TableHead>Reference No.</TableHead>
                        <TableHead>Transport Mode</TableHead>
                        <TableHead>Freight Type</TableHead>
                        <TableHead>Destination</TableHead>
                        <TableHead>PO Number</TableHead>
                        <TableHead>Quotation Copy</TableHead>
                        <TableHead>Acceptance Copy (Purchase Order Only)</TableHead>
                        <TableHead>Offer Show</TableHead>
                        <TableHead>Conveyed For Registration Form</TableHead>
                        <TableHead>Qty Amount</TableHead>
                        <TableHead>Quantity Delivered</TableHead>
                        <TableHead>Order Cancel</TableHead>
                        <TableHead>Pending Qty</TableHead>
                        <TableHead>Material Return</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Complete Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingOrders.map((order) => (
                        <TableRow key={order.rowIndex}>
                          <TableCell>
                            <Button size="sm" onClick={() => handleProcess(order)}>
                              Process
                            </Button>
                          </TableCell>
                          <TableCell className="font-medium">{order.orderNo}</TableCell>
                          <TableCell>{order.quotationNo}</TableCell>
                          <TableCell>{order.companyName}</TableCell>
                          <TableCell>{order.contactPersonName}</TableCell>
                          <TableCell>{order.contactNumber}</TableCell>
                          <TableCell className="max-w-[150px] truncate">{order.billingAddress}</TableCell>
                          <TableCell className="max-w-[150px] truncate">{order.shippingAddress}</TableCell>
                          <TableCell>{order.paymentMode}</TableCell>
                          <TableCell>{order.paymentTerms}</TableCell>
                          <TableCell>{order.orderReceivedQty}</TableCell>
                          <TableCell>{order.transportMode}</TableCell>
                          <TableCell>{order.freightType}</TableCell>
                          <TableCell>{order.destination}</TableCell>
                          <TableCell>{order.poNumber}</TableCell>
                          <TableCell>
                            <Badge variant={order.quotationCopy === "Available" ? "default" : "secondary"}>
                              {order.quotationCopy || "N/A"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={order.acceptanceCopy === "Available" ? "default" : "secondary"}>
                              {order.acceptanceCopy || "N/A"}
                            </Badge>
                          </TableCell>
                          <TableCell>{order.offerShow}</TableCell>
                          <TableCell>{order.conveyedForRegistration}</TableCell>
                          <TableCell>{order.qtyAmount}</TableCell>
                          <TableCell>{order.quantityDelivered}</TableCell>
                          <TableCell>{order.orderCancel}</TableCell>
                          <TableCell>{order.pendingQty}</TableCell>
                          <TableCell>{order.materialReturn}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{order.status}</Badge>
                          </TableCell>
                          <TableCell>{order.completeDate}</TableCell>
                        </TableRow>
                      ))}
                      {pendingOrders.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={26} className="text-center text-muted-foreground">
                            No pending orders found in Google Sheets (Q not null, R null)
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
  <Card>
    <CardHeader>
      <CardTitle>Order History</CardTitle>
      <CardDescription>Previously processed orders (where both Q and R columns have data)</CardDescription>
    </CardHeader>
    <CardContent>
      {processedLoading ? (
        <div className="flex items-center justify-center h-32">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span className="ml-2">Loading processed orders...</span>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Order No.</TableHead>
                <TableHead>Quotation No.</TableHead>
                <TableHead>Company Name</TableHead>
                <TableHead>Contact Person Name</TableHead>
                <TableHead>Contact Number</TableHead>
                <TableHead>Billing Address</TableHead>
                <TableHead>Shipping Address</TableHead>
                <TableHead>Payment Mode</TableHead>
                <TableHead>Payment Terms (In Days)</TableHead>
                <TableHead>Order Received Qty</TableHead>
                <TableHead>Transport Mode</TableHead>
                <TableHead>Freight Type</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead>PO Number</TableHead>
                <TableHead>Quotation Copy</TableHead>
                <TableHead>Acceptance Copy (Purchase Order Only)</TableHead>
                <TableHead>Offer Show</TableHead>
                <TableHead>Conveyed For Registration Form</TableHead>
                <TableHead>Qty Amount</TableHead>
                <TableHead>Quantity Delivered</TableHead>
                <TableHead>Order Cancel</TableHead>
                <TableHead>Pending Qty</TableHead>
                <TableHead>Material Return</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Complete Date</TableHead>
                <TableHead>Is Order Acceptable?</TableHead>
                <TableHead>Order Acceptance Checklist</TableHead>
                <TableHead>Remarks</TableHead>
                {/* <TableHead>Actions</TableHead> */}
              </TableRow>
            </TableHeader>
            <TableBody>
              {processedOrders.map((order) => (
                <TableRow key={order.rowIndex}>
                  <TableCell>{order.timestamp}</TableCell>
                  <TableCell className="font-medium">{order.orderNo}</TableCell>
                  <TableCell>{order.quotationNo}</TableCell>
                  <TableCell>{order.companyName}</TableCell>
                  <TableCell>{order.contactPersonName}</TableCell>
                  <TableCell>{order.contactNumber}</TableCell>
                  <TableCell className="max-w-[150px] truncate">{order.billingAddress}</TableCell>
                  <TableCell className="max-w-[150px] truncate">{order.shippingAddress}</TableCell>
                  <TableCell>{order.paymentMode}</TableCell>
                  <TableCell>{order.paymentTerms}</TableCell>
                  <TableCell>{order.orderReceivedQty}</TableCell>
                  <TableCell>{order.transportMode}</TableCell>
                  <TableCell>{order.freightType}</TableCell>
                  <TableCell>{order.destination}</TableCell>
                  <TableCell>{order.poNumber}</TableCell>
                  <TableCell>
                    <Badge variant={order.quotationCopy === "Available" ? "default" : "secondary"}>
                      {order.quotationCopy || "N/A"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={order.acceptanceCopy === "Available" ? "default" : "secondary"}>
                      {order.acceptanceCopy || "N/A"}
                    </Badge>
                  </TableCell>
                  <TableCell>{order.offerShow}</TableCell>
                  <TableCell>{order.conveyedForRegistration}</TableCell>
                  <TableCell>{order.qtyAmount}</TableCell>
                  <TableCell>{order.quantityDelivered}</TableCell>
                  <TableCell>{order.orderCancel}</TableCell>
                  <TableCell>{order.pendingQty}</TableCell>
                  <TableCell>{order.materialReturn}</TableCell>
                  <TableCell>
                    <Badge variant="default">
                      {order.status || "Completed"}
                    </Badge>
                  </TableCell>
                  <TableCell>{order.completeDate}</TableCell>
                  <TableCell>
                    <Badge variant={order.isOrderAcceptable === "Yes" ? "default" : "destructive"}>
                      {order.isOrderAcceptable || "N/A"}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">{order.orderAcceptanceChecklist}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{order.remarks}</TableCell>
                  {/* <TableCell>
                    <Button size="sm" variant="outline" onClick={() => handleView(order)}>
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </TableCell> */}
                </TableRow>
              ))}
              {processedOrders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={30} className="text-center text-muted-foreground">
                    No processed orders found (Q and R columns both need data)
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </CardContent>
  </Card>
</TabsContent>
        </Tabs>

        {/* Process Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Process Order Acceptable</DialogTitle>
              <DialogDescription>Review and process the order acceptance</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="orderNo">Order No.</Label>
                <Input id="orderNo" value={selectedOrder?.orderNo || ''} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name</Label>
                <Input id="companyName" value={selectedOrder?.companyName || ''} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="acceptable">Is Order Acceptable? *</Label>
                <Select value={isAcceptable} onValueChange={setIsAcceptable}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Yes">Yes</SelectItem>
                    <SelectItem value="Order Cancel">Order Cancel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {isAcceptable === "Yes" && (
                <div className="space-y-2">
                  <Label>Order Acceptance Checklist</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {checklistItems.map((item) => (
                      <div key={item} className="flex items-center space-x-2">
                        <Checkbox
                          id={item}
                          checked={checkedItems.includes(item)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setCheckedItems([...checkedItems, item])
                            } else {
                              setCheckedItems(checkedItems.filter((i) => i !== item))
                            }
                          }}
                        />
                        <Label htmlFor={item} className="text-sm">
                          {item}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="remarks">Remarks</Label>
                <Textarea
                  id="remarks"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Enter any remarks..."
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={!isAcceptable || currentUser?.role === "user"}>
                  Submit
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* View Dialog */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Order Details</DialogTitle>
              <DialogDescription>View order information and processing details</DialogDescription>
            </DialogHeader>
            {viewOrder && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Order No.</Label>
                    <p className="text-sm">{viewOrder.id}</p>
                  </div>
                  <div>
                    <Label>Company Name</Label>
                    <p className="text-sm">{viewOrder.companyName}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Contact Person</Label>
                    <p className="text-sm">{viewOrder.contactPerson}</p>
                  </div>
                  <div>
                    <Label>Contact Number</Label>
                    <p className="text-sm">{viewOrder.contactNumber}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>PO Number</Label>
                    <p className="text-sm">{viewOrder.poNumber}</p>
                  </div>
                  <div>
                    <Label>Payment Mode</Label>
                    <p className="text-sm">{viewOrder.paymentMode}</p>
                  </div>
                </div>
                {viewOrder.acceptanceData && (
                  <div>
                    <Label>Acceptance Status</Label>
                    <p className="text-sm">{viewOrder.acceptanceData.isAcceptable}</p>
                    {viewOrder.acceptanceData.remarks && (
                      <div className="mt-2">
                        <Label>Remarks</Label>
                        <p className="text-sm">{viewOrder.acceptanceData.remarks}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  )
}