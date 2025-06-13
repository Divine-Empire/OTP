"use client"

import { useState, useEffect } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { useData } from "@/components/data-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Eye } from "lucide-react"

export default function SeniorApprovalPage() {
  // const { orders, updateOrder } = useData()
  const [selectedOrder, setSelectedOrder] = useState<string>("")
  const [approvalStatus, setApprovalStatus] = useState<string>("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const [orders, setOrders] = useState([])
const [loading, setLoading] = useState(true)
const [error, setError] = useState(null)

  // Filter orders based on status
// Filter orders based on status
const pendingOrders = orders.filter(order => 
  order.approvalStatus && !order.approvalDate
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
  const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyzW8-RldYx917QpAfO4kY-T8_ntg__T0sbr7Yup2ZTVb1FC5H1g6TYuJgAU6wTquVM/exec'
  const SHEET_ID = '1yEsh4yzyvglPXHxo-5PT70VpwVJbxV7wwH8rpU1RFJA'
  const SHEET_NAME = 'ORDER-DISPATCH'

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
      
      data.table.rows.slice(6).forEach((row, index) => {
        if (row.c) {
          const actualRowIndex = index + 2;
          
          // Column AR (index 43) - senior approval status
          const hasColumnAR = row.c[43] && row.c[43].v !== null && row.c[43].v !== "";
          // Column AS (index 44) - approval date
          const isColumnASEmpty = !row.c[44] || row.c[44].v === null || row.c[44].v === "";
          
          // For pending orders: show rows where AR has data but AS is empty
          if (hasColumnAR && isColumnASEmpty) {
            const order = {
              rowIndex: actualRowIndex,
              id: row.c[1] ? row.c[1].v : `ORDER-${actualRowIndex}`,
              companyName: row.c[2] ? row.c[2].v : "",
              contactPerson: row.c[3] ? row.c[3].v : "",
              contactNumber: row.c[4] ? row.c[4].v : "",
              poNumber: row.c[5] ? row.c[5].v : "",
              paymentMode: row.c[6] ? row.c[6].v : "",
              paymentTerms: row.c[7] ? row.c[7].v : "",
              quantity: row.c[8] ? row.c[8].v : "",
              transportMode: row.c[9] ? row.c[9].v : "",
              destination: row.c[10] ? row.c[10].v : "",
              approvalStatus: row.c[43] ? row.c[43].v : null, // Column AR
              approvalDate: row.c[44] ? row.c[44].v : "", // Column AS
              approvedBy: row.c[45] ? row.c[45].v : "", // Column AT
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

useEffect(() => {
  fetchOrders()
}, [])

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
          
          // Column AR (index 43) - senior approval status
          const hasColumnAR = row.c[43] && row.c[43].v !== null && row.c[43].v !== "";
          // Column AS (index 44) - approval date
          const hasColumnAS = row.c[44] && row.c[44].v !== null && row.c[44].v !== "";
          
          // For processed orders: show rows where both AR and AS have data
          if (hasColumnAR && hasColumnAS) {
            const processedOrder = {
              rowIndex: actualRowIndex,
              timestamp: formatGoogleSheetsDate(row.c[0] ? row.c[0].v : ""),
              orderNo: row.c[1] ? row.c[1].v : "",
              companyName: row.c[2] ? row.c[2].v : "",
              contactPerson: row.c[3] ? row.c[3].v : "",
              contactNumber: row.c[4] ? row.c[4].v : "",
              poNumber: row.c[5] ? row.c[5].v : "",
              paymentMode: row.c[6] ? row.c[6].v : "",
              paymentTerms: row.c[7] ? row.c[7].v : "",
              quantity: row.c[8] ? row.c[8].v : "",
              transportMode: row.c[9] ? row.c[9].v : "",
              destination: row.c[10] ? row.c[10].v : "",
              approvalStatus: row.c[43] ? row.c[43].v : "", // Column AR
              approvalDate: row.c[44] ? row.c[44].v : "", // Column AS
              approvedBy: row.c[45] ? row.c[45].v : "", // Column AT
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



// Helper function to format date from Google Sheets
const formatGoogleSheetsDate = (dateValue) => {
  if (!dateValue) return "";
  
  if (typeof dateValue === 'string' && dateValue.includes('Date(')) {
    const match = dateValue.match(/Date\((\d+),(\d+),(\d+)\)/);
    if (match) {
      const year = parseInt(match[1]);
      const month = parseInt(match[2]);
      const day = parseInt(match[3]);
      const date = new Date(year, month, day);
      return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
    }
  }
  
  try {
    const date = new Date(dateValue);
    if (!isNaN(date.getTime())) {
      return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`;
    }
  } catch (e) {
    console.error('Error parsing date:', e);
  }
  
  return dateValue;
};

const updateOrderStatus = async (order, approvalData) => {
  try {
    const formData = new FormData()
    formData.append('sheetName', SHEET_NAME)
    formData.append('action', 'updateByOrderNoInColumnB')
    formData.append('orderNo', order.id)
    
    const rowData = new Array(50).fill('')

    const today = new Date();
    const formattedDate = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
    
    // Update columns:
    // AR (index 43) - approval status (keep existing)
    // AS (index 44) - approval date
    // AT (index 45) - approved by
    
    // Keep existing approval status (column AR)
    if (order.approvalStatus) {
      rowData[43] = order.approvalStatus;
    }
    
    // Set approval date (column AS)
    rowData[44] = formattedDate;
    
    // Set approved by (column AT)
    rowData[46] = approvalData.approvedBy;
    
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
      const responseText = await updateResponse.text()
      result = JSON.parse(responseText)
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
  

  const handleProcess = (orderId: string) => {
    setSelectedOrder(orderId)
    setApprovalStatus("")
    setIsDialogOpen(true)
  }

  const handleSubmit = async () => {
    if (!selectedOrder || !approvalStatus) return
  
    const order = orders.find(o => o.id === selectedOrder)
    if (!order) return
  
    const approvalData = {
      approvedBy: approvalStatus,
      approvalDate: new Date().toISOString()
    }
  
    const success = await updateOrderStatus(order, approvalData)
    
    if (success) {
      setIsDialogOpen(false)
      setSelectedOrder("")
      // Show success message
      alert(`Order ${selectedOrder} has been approved successfully.`)
    }
  }

  const handleView = (order: any) => {
    console.log("View order:", order)
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Senior Approval</h1>
          <p className="text-muted-foreground">Review and approve orders after inventory check</p>
        </div>

        // Replace your existing Tabs section with this fixed version:

<Tabs defaultValue="pending" className="space-y-4">
  <TabsList>
    <TabsTrigger value="pending">Pending ({pendingOrders.length})</TabsTrigger>
    <TabsTrigger value="history" onClick={handleProcessedTabClick}>
      History ({processedOrders.length})
    </TabsTrigger>
  </TabsList>

  <TabsContent value="pending" className="space-y-4">
    <Card>
      <CardHeader>
        <CardTitle>Pending Approvals</CardTitle>
        <CardDescription>Orders waiting for senior approval</CardDescription>
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
                <TableHead>Transport Mode</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Inventory Status</TableHead>
                <TableHead>Status</TableHead>
                {/* <TableHead>Actions</TableHead> */}
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={14} className="text-center">Loading...</TableCell>
                </TableRow>
              ) : pendingOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={14} className="text-center">No pending orders</TableCell>
                </TableRow>
              ) : (
                pendingOrders.map((order) => (
                  <TableRow key={order.id}>
                     <TableCell>
                      <Button size="sm" onClick={() => handleProcess(order.id)}>
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
                    <TableCell>₹{order.amount ? order.amount.toLocaleString() : 'N/A'}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          order.inventoryData?.availabilityStatus === "Available"
                            ? "default"
                            : order.inventoryData?.availabilityStatus === "Partial"
                              ? "secondary"
                              : "destructive"
                        }
                      >
                        {order.inventoryData?.availabilityStatus || "Unknown"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{order.status || "Pending"}</Badge>
                    </TableCell>
                    {/* <TableCell>
                      <Button size="sm" onClick={() => handleProcess(order.id)}>
                        Process
                      </Button>
                    </TableCell> */}
                  </TableRow>
                ))
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
        <CardTitle>Approval History</CardTitle>
        <CardDescription>Previously processed approvals</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Company Name</TableHead>
                <TableHead>Contact Person</TableHead>
                <TableHead>Contact Number</TableHead>
                <TableHead>PO Number</TableHead>
                <TableHead>Payment Mode</TableHead>
                <TableHead>Payment Terms</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Transport Mode</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Approval Status</TableHead>
                <TableHead>Approved By</TableHead>
                <TableHead>Approval Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {processedLoading ? (
                <TableRow>
                  <TableCell colSpan={15} className="text-center">Loading history...</TableCell>
                </TableRow>
              ) : processedOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={15} className="text-center">No processed orders</TableCell>
                </TableRow>
              ) : (
                processedOrders.map((order) => (
                  <TableRow key={order.orderNo}>
                    <TableCell className="font-medium">{order.orderNo}</TableCell>
                    <TableCell>{order.companyName}</TableCell>
                    <TableCell>{order.contactPerson}</TableCell>
                    <TableCell>{order.contactNumber}</TableCell>
                    <TableCell>{order.poNumber}</TableCell>
                    <TableCell>{order.paymentMode}</TableCell>
                    <TableCell>{order.paymentTerms}</TableCell>
                    <TableCell>{order.quantity}</TableCell>
                    <TableCell>{order.transportMode}</TableCell>
                    <TableCell>{order.destination}</TableCell>
                    <TableCell>₹{order.amount ? order.amount.toLocaleString() : 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant="default">
                        {order.approvalStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>{order.approvedBy}</TableCell>
                    <TableCell>{formatGoogleSheetsDate(order.approvalDate)}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline" onClick={() => handleView(order)}>
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  </TabsContent>
</Tabs>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Senior Approval</DialogTitle>
              <DialogDescription>Review and approve the order</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="orderNo">Order No.</Label>
                <Input id="orderNo" value={selectedOrder} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="approval">Approval Status *</Label>
                <Select value={approvalStatus} onValueChange={setApprovalStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Approver" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="KISHAN PATEL">KISHAN PATEL</SelectItem>
                    <SelectItem value="SHASHANK SIR">SHASHANK SIR</SelectItem>
                    <SelectItem value="NEERAJ SIR">NEERAJ SIR</SelectItem>
                    <SelectItem value="PRASANNA SIR">PRASANNA SIR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={!approvalStatus}>
                  Submit
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  )
}
