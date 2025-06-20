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
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Eye, Plus, Trash2, RefreshCw } from "lucide-react"
import { stringify } from "querystring"
import { useAuth } from "@/components/auth-provider"


const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyzW8-RldYx917QpAfO4kY-T8_ntg__T0sbr7Yup2ZTVb1FC5H1g6TYuJgAU6wTquVM/exec'
const SHEET_ID = '1yEsh4yzyvglPXHxo-5PT70VpwVJbxV7wwH8rpU1RFJA'
const SHEET_NAME = 'ORDER-DISPATCH'

export default function CheckInventoryPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [availabilityStatus, setAvailabilityStatus] = useState("")
  const [remarks, setRemarks] = useState("")
  const [partialDetails, setPartialDetails] = useState("")
  const [unavailableItems, setUnavailableItems] = useState([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [viewOrder, setViewOrder] = useState(null)
  const [receivedDate, setReceivedDate] = useState("")
  const [receivingStatus, setReceivingStatus] = useState("")
  const { user: currentUser } = useAuth()

  // Fetch data from Google Sheets using the same approach as TrackerPendingTable
  // Fixed fetchOrders function with correct row index calculation
  const fetchOrders = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const sheetUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${SHEET_NAME}`
      const response = await fetch(sheetUrl)
      const text = await response.text()
      
      const jsonStart = text.indexOf('{')
      const jsonEnd = text.lastIndexOf('}') + 1
      const jsonData = text.substring(jsonStart, jsonEnd)
      
      const data = JSON.parse(jsonData)
      
      if (data && data.table && data.table.rows) {
        const ordersData = []
        
        // Skip the first few header rows and process the data rows
        data.table.rows.slice(6).forEach((row, index) => {
          if (row.c) {
            const actualRowIndex = index + 2;
            
            // Column BL (index 63) - inventory status
            const hasColumnBL = row.c[63] && row.c[63].v !== null && row.c[63].v !== "";
            // Column BM (index 64) - inventory remarks
            const isColumnBMEmpty = !row.c[64] || row.c[64].v === null || row.c[64].v === "";
            
            // For pending orders: show rows where BL has data but BM is empty
            if (hasColumnBL && isColumnBMEmpty) {
              const order = {
                rowIndex: actualRowIndex,
                id: row.c[1] ? row.c[1].v : `ORDER-${actualRowIndex}`,
                companyName: row.c[3] ? row.c[3].v : "",
                contactPerson: row.c[4] ? row.c[4].v : "",
                contactNumber: row.c[5] ? row.c[5].v : "",
                poNumber: row.c[35] ? row.c[35].v : "",
                paymentMode: row.c[8] ? row.c[8].v : "",
                paymentTerms: row.c[9] ? row.c[9].v : "",
                quantity: row.c[40] ? row.c[40].v : "",
                transportMode: row.c[61] ? row.c[61].v : "",
                destination: row.c[62] ? row.c[62].v : "",
                inventoryStatus: row.c[63] ? row.c[63].v : null, // Column BL
                inventoryRemarks: row.c[64] ? row.c[64].v : "", // Column BM
                processedDate: row.c[65] ? row.c[65].v : "", // Column BN
                fullRowData: row.c
              }
              
              ordersData.push(order)
            }
          }
        })
        
        setOrders(ordersData)
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
  
  // Check if it's in the Google Sheets Date format like "Date(2025,5,10)"
  if (typeof dateValue === 'string' && dateValue.includes('Date(')) {
    const match = dateValue.match(/Date\((\d+),(\d+),(\d+)\)/);
    if (match) {
      const year = parseInt(match[1]);
      const month = parseInt(match[2]); // Google Sheets months are 0-based
      const day = parseInt(match[3]);
      
      // Create date and format as dd/mm/yyyy
      const date = new Date(year, month, day);
      const formattedDay = String(date.getDate()).padStart(2, '0');
      const formattedMonth = String(date.getMonth() + 1).padStart(2, '0');
      const formattedYear = date.getFullYear();
      
      return `${formattedDay}/${formattedMonth}/${formattedYear}`;
    }
  }
  
  // If it's already a regular date string, try to parse and format it
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
  
  // Return original value if can't parse
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
          const actualRowIndex = index + 2;
          
          // Column AH (index 33) - inventory status
          const hasColumnAH = row.c[63] && row.c[63].v !== null && row.c[63].v !== "";
          // Column AI (index 34) - inventory remarks
          const hasColumnAI = row.c[64] && row.c[64].v !== null && row.c[64].v !== "";
          
          // For processed orders: show rows where both AH and AI have data
          if (hasColumnAH && hasColumnAI) {
            const processedOrder = {
              rowIndex: actualRowIndex,
              timestamp: formatGoogleSheetsDate(row.c[0] ? row.c[0].v : ""),
              orderNo: row.c[1] ? row.c[1].v : "",
              companyName: row.c[3] ? row.c[3].v : "",
              contactPerson: row.c[4] ? row.c[4].v : "",
              contactNumber: row.c[5] ? row.c[5].v : "",
              billingAddress: row.c[6] ? row.c[6].v : "",
              shippingAddress: row.c[7] ? row.c[7].v : "",
              paymentMode: row.c[8] ? row.c[8].v : "",
              paymentTerms: row.c[9] ? row.c[9].v : "",
              orderReceivedQty: row.c[11] ? row.c[11].v : "",
              transportMode: row.c[32] ? row.c[32].v : "",
              freightType: row.c[33] ? row.c[33].v : "",
              destination: row.c[34] ? row.c[34].v : "",
              poNumber: row.c[35] ? row.c[35].v : "",
              quotationCopy: row.c[36] ? row.c[36].v : "",
              acceptanceCopy: row.c[37] ? row.c[37].v : "",
              inventoryStatus: row.c[33] ? row.c[33].v : "", // Column AH
              inventoryRemarks: row.c[34] ? row.c[34].v : "", // Column AI
              processedDate: row.c[35] ? row.c[35].v : "", // Column AJ
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

  // Update order status using your existing Apps Script - only update columns R and S
// Update order status by finding the correct row that matches the company name in column B
const updateOrderStatus = async (order, inventoryData) => {
  try {
    const formData = new FormData()
    formData.append('sheetName', SHEET_NAME)
    formData.append('action', 'updateByOrderNoInColumnB')
    formData.append('orderNo', order.id)
    
    // Create a sparse array to update only specific columns
    const rowData = new Array(66).fill('') // Make sure array is large enough for all columns

    const today = new Date();

const formattedDate = `${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()} ` +
                      `${today.getHours()}:${today.getMinutes()}:${today.getSeconds()}`;

    // Correct column indices for ORDER-DISPATCH sheet:
    // BL (index 63) - inventory status (we'll use for received status)
    // BM (index 64) - inventory remarks
    // BN (index 65) - processed date
    
    // Set received status (column BL - index 63)
    // rowData[63] = inventoryData.receivingStatus || "Received";
    
    // Set processed date (column BN - index 65)
    rowData[64] = formattedDate;
    
    // Set received date (column BM - index 64)
    rowData[66] = inventoryData.receivedDate;
    
    // Set remarks if any
    if (inventoryData.remarks) {
      rowData[66] = inventoryData.remarks;
    }
    
    formData.append('rowData', JSON.stringify(rowData))
    
    const updateResponse = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      mode: 'cors',
      body: formData
    })
    
    if (!updateResponse.ok) {
      throw new Error(`HTTP error! status: ${updateResponse.status}`)
    }
    
    let result
    try {
      result = await updateResponse.json()
    } catch (parseError) {
      result = { success: true }
    }
    
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
if (!selectedOrder || !receivedDate) return

const inventoryData = {
  receivedDate,
  receivingStatus: "Received", // Default status
  remarks,
  processedAt: new Date().toISOString(),
  processedBy: currentUser?.name || "Unknown User",
}

const success = await updateOrderStatus(selectedOrder, inventoryData)

if (success) {
  setIsDialogOpen(false)
  setSelectedOrder(null)
  setReceivedDate("")
  setRemarks("")
  // Show success message
  alert(`Order ${selectedOrder.id} has been updated successfully.`)
}
}

  const handleProcess = (order) => {
    setSelectedOrder(order)
    setReceivedDate("")
    setReceivingStatus("")
    // setRemarks("")
    setIsDialogOpen(true)
  }

  const addUnavailableItem = () => {
    setUnavailableItems([...unavailableItems, { name: "", qty: 0 }])
  }

  const removeUnavailableItem = (index) => {
    setUnavailableItems(unavailableItems.filter((_, i) => i !== index))
  }

  const updateUnavailableItem = (index, field, value) => {
    const updated = [...unavailableItems]
    updated[index] = { ...updated[index], [field]: value }
    setUnavailableItems(updated)
  }

  // const handleSubmit = async () => {
  //   if (!selectedOrder || !receivedDate || !receivingStatus) return
  
  //   const inventoryData = {
  //     receivedDate,
  //     receivingStatus,
  //     remarks,
  //     processedAt: new Date().toISOString(),
  //     processedBy: "Current User",
  //   }
  
  //   const success = await updateOrderStatus(selectedOrder, inventoryData)
    
  //   if (success) {
  //     setIsDialogOpen(false)
  //     setSelectedOrder(null)
  //     setReceivedDate("")
  //     setReceivingStatus("")
  //     setRemarks("")
  //     // Show success message
  //     alert(`Order ${selectedOrder.id} has been updated successfully.`)
  //   }
  // }

  const handleView = (order) => {
    setViewOrder(order)
    setViewDialogOpen(true)
  }

  // Filter orders based on status
  const pendingOrders = orders.filter(order => 
    // Since we want orders where V has data but W is empty, and inventoryRemarks is from column W
    order.inventoryStatus && !order.inventoryRemarks  // Has V data but no W data
  )

  // For processed orders, we'll fetch them separately when the tab is clicked
  const [processedOrders, setProcessedOrders] = useState([])
  const [processedLoading, setProcessedLoading] = useState(false)

  const handleProcessedTabClick = async () => {
    setProcessedLoading(true)
    const processed = await fetchProcessedOrders()
    setProcessedOrders(processed)
    setProcessedLoading(false)
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
            <h1 className="text-3xl font-bold tracking-tight">Material Received</h1>
            <p className="text-muted-foreground">Verify item availability for orders from Google Sheets</p>
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
            <TabsTrigger value="history" onClick={handleProcessedTabClick}>Processed ({processedOrders.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Pending Material Received</CardTitle>
                <CardDescription>Orders from Google Sheets waiting for inventory verification</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                      <TableHead>Actions</TableHead>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Company Name</TableHead>
                        <TableHead>Contact Person</TableHead>
                        <TableHead>Contact Number</TableHead>
                        <TableHead>PO Number</TableHead>
                        <TableHead>Payment Mode</TableHead>
                        <TableHead>Payment Terms</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Availability Status</TableHead>
                        <TableHead>Remarks</TableHead>
                        {/* <TableHead>Actions</TableHead> */}
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
                          <TableCell className="font-medium">{order.id}</TableCell>
                          <TableCell>{order.companyName}</TableCell>
                          <TableCell>{order.contactPerson}</TableCell>
                          <TableCell>{order.contactNumber}</TableCell>
                          <TableCell>{order.poNumber}</TableCell>
                          <TableCell>{order.paymentMode}</TableCell>
                          <TableCell>{order.paymentTerms}</TableCell>
                          <TableCell>{order.quantity}</TableCell>
                          <TableCell>{order.transportMode}</TableCell>
                          <TableCell>{order.destination}</TableCell>
                          {/* <TableCell>
                            <Button size="sm" onClick={() => handleProcess(order)}>
                              Process
                            </Button>
                          </TableCell> */}
                        </TableRow>
                      ))}
                      {pendingOrders.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={11} className="text-center text-muted-foreground">
                            No pending orders found in Google Sheets
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
                <CardTitle>Inventory Check History</CardTitle>
                <CardDescription>Previously processed inventory checks (where both Q and R columns have data)</CardDescription>
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
                          <TableHead>Company Name</TableHead>
                          <TableHead>Contact Person Name</TableHead>
                          <TableHead>Contact Number</TableHead>
                          <TableHead>Billing Address</TableHead>
                          <TableHead>Shipping Address</TableHead>
                          <TableHead>Payment Mode</TableHead>
                          <TableHead>Payment Terms (In Days)</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Transport Mode</TableHead>
                          <TableHead>Freight Type</TableHead>
                          <TableHead>Destination</TableHead>
                          <TableHead>PO Number</TableHead>
                          <TableHead>Quotation Copy</TableHead>
                          <TableHead>Acceptance Copy (Purchase Order Only)</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {processedOrders.map((order) => (
                          <TableRow key={order.rowIndex}>
                            <TableCell>{order.timestamp}</TableCell>
                            <TableCell className="font-medium">{order.orderNo}</TableCell>
                            <TableCell>{order.companyName}</TableCell>
                            <TableCell>{order.contactPerson}</TableCell>
                            <TableCell>{order.contactNumber}</TableCell>
                            <TableCell>{order.billingAddress}</TableCell>
                            <TableCell>{order.shippingAddress}</TableCell>
                            <TableCell>{order.paymentMode}</TableCell>
                            <TableCell>{order.paymentTerms}</TableCell>
                            <TableCell>{order.orderReceivedQty}</TableCell>
                            <TableCell>{order.transportMode}</TableCell>
                            <TableCell>{order.freightType}</TableCell>
                            <TableCell>{order.destination}</TableCell>
                            <TableCell>{order.poNumber}</TableCell>
                            <TableCell>{order.quotationCopy}</TableCell>
                            <TableCell>{order.acceptanceCopy}</TableCell>
                            <TableCell>
                              <Badge variant="default">
                                Completed
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button size="sm" variant="outline" onClick={() => handleView(order)}>
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                        {processedOrders.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={18} className="text-center text-muted-foreground">
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
   {/* Process Dialog */}
   <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle>Material Received</DialogTitle>
      <DialogDescription>Verify material receipt for the order</DialogDescription>
    </DialogHeader>
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="orderNo">Order No.</Label>
        <Input id="orderNo" value={selectedOrder?.id || ''} disabled />
      </div>
      <div className="space-y-2">
        <Label htmlFor="companyName">Company Name</Label>
        <Input id="companyName" value={selectedOrder?.companyName || ''} disabled />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="receivedDate">Received Date *</Label>
        <Input 
          id="receivedDate" 
          type="date" 
          value={receivedDate}
          onChange={(e) => setReceivedDate(e.target.value)}
          required
        />
      </div>
      
      {/* <div className="space-y-2">
        <Label htmlFor="remarks">Remarks</Label>
        <Textarea
          id="remarks"
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          placeholder="Enter any remarks..."
        />
      </div> */}

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={!receivedDate || currentUser?.role === "user"}>
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
              <DialogTitle>Inventory Check Details</DialogTitle>
              <DialogDescription>View inventory check information and results</DialogDescription>
            </DialogHeader>
            {viewOrder && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Order No.</Label>
                    <p className="text-sm">{viewOrder.orderNo || viewOrder.id}</p>
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
                {/* {(viewOrder.statusR || viewOrder.inventoryStatus) && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Availability Status</Label>
                      <p className="text-sm">{viewOrder.statusR || viewOrder.inventoryStatus}</p>
                    </div>
                    <div>
                      <Label>Remarks</Label>
                      <p className="text-sm">{viewOrder.inventoryRemarks || 'N/A'}</p>
                    </div>
                  </div>
                )} */}
                {(viewOrder.processedDate || viewOrder.timestamp) && (
                  <div>
                    <Label>Processed Date</Label>
                    <p className="text-sm">{viewOrder.processedDate ? new Date(viewOrder.processedDate).toLocaleDateString() : viewOrder.timestamp}</p>
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