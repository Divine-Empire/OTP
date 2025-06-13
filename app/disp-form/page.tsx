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
import { Eye, Plus, Trash2, RefreshCw } from "lucide-react"

export default function DispFormPage() {
  // const { orders, updateOrder } = useData()
  const [selectedOrder, setSelectedOrder] = useState<string>("")
  const [calibrationRequired, setCalibrationRequired] = useState<string>("")
  const [calibrationType, setCalibrationType] = useState<string>("")
  const [installationRequired, setInstallationRequired] = useState<string>("")
  const [items, setItems] = useState<Array<{ name: string; qty: number }>>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [viewOrder, setViewOrder] = useState<any>(null)
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyzW8-RldYx917QpAfO4kY-T8_ntg__T0sbr7Yup2ZTVb1FC5H1g6TYuJgAU6wTquVM/exec'
const SHEET_ID = '1yEsh4yzyvglPXHxo-5PT70VpwVJbxV7wwH8rpU1RFJA'
const SHEET_NAME = 'ORDER-DISPATCH'

  const pendingOrders = orders.filter((order) => order.status === "senior-approved")
  const processedOrders = orders.filter((order) => order.dispatchData)


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
          // Condition: column Q is not null and column R is null (adjust column indexes as needed)
          const hasColumnQ = row.c[27] && row.c[27].v !== null && row.c[27].v !== "";
          const isColumnREmpty = !row.c[28] || row.c[28].v === null || row.c[28].v === "";
          
          if (hasColumnQ && isColumnREmpty) {
            const actualRowIndex = index + 2;
            
            const order = {
              rowIndex: actualRowIndex,
              id: row.c[1] ? row.c[1].v : `ORDER-${actualRowIndex}`,
              companyName: row.c[3] ? row.c[3].v : "",
              contactPerson: row.c[4] ? row.c[4].v : "",
              contactNumber: row.c[5] ? row.c[5].v : "",
              poNumber: row.c[14] ? row.c[14].v : "",
              paymentMode: row.c[8] ? row.c[8].v : "",
              paymentTerms: row.c[9] ? row.c[9].v : "",
              quantity: row.c[10] ? row.c[10].v : "",
              transportMode: row.c[11] ? row.c[11].v : "",
              destination: row.c[13] ? row.c[13].v : "",
              amount: row.c[12] ? parseFloat(row.c[12].v) || 0 : 0,
              status: "senior-approved",
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

// For processed orders
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
          const hasColumnQ = row.c[27] && row.c[27].v !== null && row.c[27].v !== "";
          const hasColumnR = row.c[28] && row.c[28].v !== null && row.c[28].v !== "";
          
          if (hasColumnQ && hasColumnR) {
            const actualRowIndex = index + 2;
            
            const processedOrder = {
              rowIndex: actualRowIndex,
              id: row.c[1] ? row.c[1].v : "",
              companyName: row.c[3] ? row.c[3].v : "",
              contactPerson: row.c[4] ? row.c[4].v : "",
              contactNumber: row.c[5] ? row.c[5].v : "",
              poNumber: row.c[14] ? row.c[14].v : "",
              paymentMode: row.c[8] ? row.c[8].v : "",
              paymentTerms: row.c[9] ? row.c[9].v : "",
              quantity: row.c[10] ? row.c[10].v : "",
              transportMode: row.c[11] ? row.c[11].v : "",
              destination: row.c[13] ? row.c[13].v : "",
              amount: row.c[12] ? parseFloat(row.c[12].v) || 0 : 0,
              status: "dispatch-processed",
              dispatchData: {
                calibrationRequired: row.c[28] ? row.c[28].v : "",
                calibrationType: row.c[29] ? row.c[29].v : "",
                installationRequired: row.c[30] ? row.c[30].v : "",
                items: row.c[31] ? JSON.parse(row.c[31].v) : [],
                processedAt: row.c[32] ? row.c[32].v : "",
              },
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

  const handleProcess = (orderId: string) => {
    setSelectedOrder(orderId)
    setCalibrationRequired("")
    setCalibrationType("")
    setInstallationRequired("")
    setItems([])
    setIsDialogOpen(true)
  }

  const addItem = () => {
    setItems([...items, { name: "", qty: 0 }])
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const updateItem = (index: number, field: "name" | "qty", value: string | number) => {
    const updated = [...items]
    updated[index] = { ...updated[index], [field]: value }
    setItems(updated)
  }

// Replace the existing useEffect with:
useEffect(() => {
  fetchOrders()
}, [])

// Update the processed orders handler
const handleProcessedTabClick = async () => {
  setProcessedLoading(true)
  const processed = await fetchProcessedOrders()
  setProcessedOrders(processed)
  setProcessedLoading(false)
}

// Update the order status update function
const updateOrderStatus = async (order, dispatchData) => {
  try {
    const formData = new FormData()
    formData.append('sheetName', SHEET_NAME)
    formData.append('action', 'updateByOrderNoInColumnB')
    formData.append('orderNo', order.id)
    
    const rowData = new Array(30).fill('')
    
    // Add today's date to column R (index 17)
    const today = new Date();
    const formattedDate = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
    rowData[28] = formattedDate; // Column R
    
    // Add dispatch data to columns S, T, U, etc.
    rowData[29] = dispatchData.calibrationRequired; // Column S
    rowData[30] = dispatchData.calibrationType || ''; // Column T
    rowData[31] = dispatchData.installationRequired; // Column U
    rowData[32] = JSON.stringify(dispatchData.items); // Column V
    
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

// Update handleSubmit to use the new update function
const handleSubmit = async () => {
  if (!selectedOrder || !calibrationRequired || !installationRequired) return

  const order = orders.find(o => o.id === selectedOrder)
  if (!order) return

  const dispatchData = {
    calibrationRequired,
    calibrationType: calibrationRequired === "YES" ? calibrationType : "",
    installationRequired,
    items,
    processedAt: new Date().toISOString(),
  }

  const success = await updateOrderStatus(order, dispatchData)
  
  if (success) {
    setIsDialogOpen(false)
    setSelectedOrder("")
    // Show success message
    alert(`Order ${selectedOrder} dispatch form has been processed successfully`)
  }
}

  const handleView = (order: any) => {
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
        <div>
          <h1 className="text-3xl font-bold tracking-tight">DISP Form</h1>
          <p className="text-muted-foreground">Process dispatch forms for approved orders</p>
        </div>

        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending">Pending ({pendingOrders.length})</TabsTrigger>
            <TabsTrigger value="history">History ({processedOrders.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Pending DISP Forms</CardTitle>
                <CardDescription>Orders waiting for dispatch form processing</CardDescription>
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
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingOrders.map((order) => (
                        <TableRow key={order.id}>
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
                          <TableCell>₹{order.amount.toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{order.status}</Badge>
                          </TableCell>
                          <TableCell>
                            <Button size="sm" onClick={() => handleProcess(order.id)}>
                              Process
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>DISP Form History</CardTitle>
                <CardDescription>Previously processed dispatch forms</CardDescription>
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
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {processedOrders.map((order) => (
                        <TableRow key={order.id}>
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
                          <TableCell>₹{order.amount.toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge variant="default">{order.status}</Badge>
                          </TableCell>
                          <TableCell>
                            <Button size="sm" variant="outline" onClick={() => handleView(order)}>
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Process Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Process DISP Form</DialogTitle>
              <DialogDescription>Process dispatch form for the order</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="orderNo">Order No.</Label>
                <Input id="orderNo" value={selectedOrder} disabled />
              </div>

              <div className="space-y-2">
                <Label htmlFor="calibration">CALIBRATION CERTIFICATE REQUIRED</Label>
                <Select value={calibrationRequired} onValueChange={setCalibrationRequired}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="YES">YES</SelectItem>
                    <SelectItem value="NO">NO</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {calibrationRequired === "YES" && (
                <div className="space-y-2">
                  <Label htmlFor="calibrationType">Calibration Type</Label>
                  <Select value={calibrationType} onValueChange={setCalibrationType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select calibration type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LAB">LAB</SelectItem>
                      <SelectItem value="AUTO LEVEL">AUTO LEVEL</SelectItem>
                      <SelectItem value="TOTAL STATION">TOTAL STATION</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="installation">INSTALLATION REQUIRED</Label>
                <Select value={installationRequired} onValueChange={setInstallationRequired}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="YES">YES</SelectItem>
                    <SelectItem value="NO">NO</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Items</Label>
                  <Button type="button" size="sm" onClick={addItem}>
                    <Plus className="h-4 w-4 mr-1" />
                    Add Item
                  </Button>
                </div>
                {items.map((item, index) => (
                  <div key={index} className="flex gap-2 items-end">
                    <div className="flex-1">
                      <Label htmlFor={`itemName-${index}`}>Item Name</Label>
                      <Input
                        id={`itemName-${index}`}
                        value={item.name}
                        onChange={(e) => updateItem(index, "name", e.target.value)}
                        placeholder="Enter item name"
                      />
                    </div>
                    <div className="w-24">
                      <Label htmlFor={`qty-${index}`}>QTY</Label>
                      <Input
                        id={`qty-${index}`}
                        type="number"
                        value={item.qty}
                        onChange={(e) => updateItem(index, "qty", Number.parseInt(e.target.value) || 0)}
                        placeholder="0"
                      />
                    </div>
                    <Button type="button" size="sm" variant="outline" onClick={() => removeItem(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentDetails">Payment Details (Attachment) - In case of Advance</Label>
                <Input id="paymentDetails" type="file" accept=".pdf,.doc,.docx,image/*" />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={!calibrationRequired || !installationRequired}>
                  Submit
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* View Dialog */}
        <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>DISP Form Details</DialogTitle>
              <DialogDescription>View dispatch form details</DialogDescription>
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
                {viewOrder.dispatchData && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Calibration Required</Label>
                        <p className="text-sm">{viewOrder.dispatchData.calibrationRequired}</p>
                      </div>
                      <div>
                        <Label>Calibration Type</Label>
                        <p className="text-sm">{viewOrder.dispatchData.calibrationType || "N/A"}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Installation Required</Label>
                        <p className="text-sm">{viewOrder.dispatchData.installationRequired}</p>
                      </div>
                    </div>
                    {viewOrder.dispatchData.items?.length > 0 && (
                      <div>
                        <Label>Items</Label>
                        <div className="mt-2 space-y-2">
                          {viewOrder.dispatchData.items.map((item: any, index: number) => (
                            <div key={index} className="flex justify-between text-sm border-b pb-1">
                              <span>{item.name}</span>
                              <span>Qty: {item.qty}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    {viewOrder.dispatchData.remarks && (
                      <div>
                        <Label>Remarks</Label>
                        <p className="text-sm">{viewOrder.dispatchData.remarks}</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  )
}
