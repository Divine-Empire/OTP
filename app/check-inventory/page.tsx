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

const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbx3GapQxdv5YIHg2dexd84vsVL3x-kcBn_Nain104HEXz6TiXtv9yf8HuieW9KA0q_H/exec'
const SHEET_ID = '1-mQgwMp8mko3xtDZDzvFPQ0V9xy1u40K_2pYOLxVTCs'
const SHEET_NAME = 'Order'

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

  // Fetch data from Google Sheets using the same approach as TrackerPendingTable
  // Fixed fetchOrders function with correct row index calculation
// Fixed fetchOrders function with correct row index calculation matching your working code
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
      
      // Skip the first few header rows and process the data rows
      // Based on your sheet structure, data seems to start after some header rows
      data.table.rows.slice(0).forEach((row, index) => {
        if (row.c) {
          // Only show rows where column P has data and column Q is null
          const hasColumnP = row.c[16] && row.c[16].v !== null && row.c[16].v !== ""; // Column P (index 15)
          const isColumnQEmpty = !row.c[17] || row.c[17].v === null || row.c[17].v === ""; // Column Q (index 16)
          
          if (hasColumnP && isColumnQEmpty) {
            // Calculate correct row index: skip 1 header row, then add offset for current index
            const actualRowIndex = index + 2; // +1 for slice(1), +1 for 1-based indexing
            
            const order = {
              rowIndex: actualRowIndex, // This will be the actual row number in Google Sheets
              id: row.c[1] ? row.c[1].v : `ORDER-${actualRowIndex}`, // Column A
              companyName: row.c[2] ? row.c[2].v : "", // Column B
              contactPerson: row.c[3] ? row.c[3].v : "", // Column C
              contactNumber: row.c[4] ? row.c[4].v : "", // Column D
              poNumber: row.c[5] ? row.c[5].v : "", // Column E
              paymentMode: row.c[6] ? row.c[6].v : "", // Column F
              paymentTerms: row.c[7] ? row.c[7].v : "", // Column G
              quantity: row.c[8] ? row.c[8].v : "", // Column H
              transportMode: row.c[9] ? row.c[9].v : "", // Column I
              destination: row.c[10] ? row.c[10].v : "", // Column J
              // Check for inventory status in later columns
              inventoryStatus: row.c[17] ? row.c[17].v : null, // Column R (index 17)
              inventoryRemarks: row.c[18] ? row.c[18].v : "", // Column S (index 18)
              processedDate: row.c[19] ? row.c[19].v : "", // Column T (index 19)
              status: row.c[16] ? row.c[16].v : "pending", // Column Q (index 16) - for processed status
              // Store the complete row data for future reference
              fullRowData: row.c
            }
            
            console.log(`Order ${order.id}: Company "${order.companyName}" at actual row ${order.rowIndex} (slice index ${index})`)
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
    // On error, set to empty array
    setOrders([])
  } finally {
    setLoading(false)
  }
}

  useEffect(() => {
    fetchOrders()
  }, [])

  // Update order status using your existing Apps Script - only update columns R and S
// Update order status by finding the correct row that matches the company name in column B
// Update order status by finding the correct row that matches the order ID in column B
const updateOrderStatus = async (order, inventoryData) => {
  try {
    console.log(`Updating order for company: ${order.companyName}`)
    console.log(`Looking for Order No.: ${order.id}`)
    console.log(`Order details:`, order)
    
    const formData = new FormData()
    formData.append('sheetName', SHEET_NAME)
    formData.append('action', 'updateByOrderNoInColumnB') // Changed action name to be more specific
    formData.append('orderNo', order.id) // This will search in column B instead of column A
    
    // Create a sparse array to update only specific columns
    const rowData = new Array(30).fill('') // Create array with 30 empty strings
    
    // Always update column R (index 17) with availability status
    rowData[18] = inventoryData.availabilityStatus // Column R (index 17)
    
    // Update different columns based on availability status
    if (inventoryData.availabilityStatus === 'Available') {
      // For Available: Update columns R and S
      rowData[19] = inventoryData.remarks || '' // Column S (index 18)
    } 
    else if (inventoryData.availabilityStatus === 'Not Available') {
      // For Not Available: Update columns R and T
      const unavailableItemsText = inventoryData.unavailableItems
        .map(item => `${item.name}: ${item.qty}`)
        .join(', ')
      rowData[20] = unavailableItemsText // Column T (index 19)
    } 
    else if (inventoryData.availabilityStatus === 'Partial') {
      // For Partial: Update columns R, U, V, W...
      rowData[21] = inventoryData.partialDetails || '' // Column U (index 20)
      
      // Add unavailable items starting from column V (index 21)
      inventoryData.unavailableItems.forEach((item, index) => {
        const itemText = `${item.name}: ${item.qty}`
        rowData[22 + index] = itemText // Column V, W, X...
      })
    }
    
    // Mark as processed in column Q
    // rowData[16] = 'inventory-checked' // Column Q (index 16)
    
    formData.append('rowData', JSON.stringify(rowData))
    
    console.log('Sending data to Apps Script:', {
      sheetName: SHEET_NAME,
      orderNo: order.id,
      availabilityStatus: inventoryData.availabilityStatus,
      searchColumn: 'B' // Added for clarity
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

  const handleProcess = (order) => {
    setSelectedOrder(order)
    setAvailabilityStatus("")
    setRemarks("")
    setPartialDetails("")
    setUnavailableItems([])
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

  const handleSubmit = async () => {
    if (!selectedOrder || !availabilityStatus) return

    const inventoryData = {
      availabilityStatus,
      remarks,
      partialDetails: availabilityStatus === "Partial" ? partialDetails : "",
      unavailableItems:
        availabilityStatus === "Not Available" || availabilityStatus === "Partial" ? unavailableItems : [],
      processedAt: new Date().toISOString(),
      processedBy: "Current User",
    }

    const success = await updateOrderStatus(selectedOrder, inventoryData)
    
    if (success) {
      setIsDialogOpen(false)
      setSelectedOrder(null)
      // Show success message
      alert(`Order ${selectedOrder.id} has been updated successfully.`)
    }
  }

  const handleView = (order) => {
    setViewOrder(order)
    setViewDialogOpen(true)
  }

  // Filter orders based on status
  const pendingOrders = orders.filter(order => 
    !order.inventoryStatus && !order.status.includes('inventory-checked')
  )
  const processedOrders = orders.filter(order => 
    order.inventoryStatus || order.status.includes('inventory-checked')
  )

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
            <h1 className="text-3xl font-bold tracking-tight">Check Inventory</h1>
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
            <TabsTrigger value="history">Processed ({processedOrders.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Pending Inventory Check</CardTitle>
                <CardDescription>Orders from Google Sheets waiting for inventory verification</CardDescription>
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
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingOrders.map((order) => (
                        <TableRow key={order.rowIndex}>
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
                          <TableCell>
                            <Button size="sm" onClick={() => handleProcess(order)}>
                              Process
                            </Button>
                          </TableCell>
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
                <CardDescription>Previously processed inventory checks</CardDescription>
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
                        <TableHead>Availability</TableHead>
                        <TableHead>Processed Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {processedOrders.map((order) => (
                        <TableRow key={order.rowIndex}>
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
                          <TableCell>
                            <Badge variant="default">
                              {order.inventoryStatus || 'N/A'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {order.processedDate ? 
                              new Date(order.processedDate).toLocaleDateString() : 
                              'N/A'
                            }
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
                          <TableCell colSpan={13} className="text-center text-muted-foreground">
                            No processed orders found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Process Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Check Inventory</DialogTitle>
              <DialogDescription>Verify item availability for the order</DialogDescription>
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
                <Label htmlFor="availability">Availability Status *</Label>
                <Select value={availabilityStatus} onValueChange={setAvailabilityStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Available">Available</SelectItem>
                    <SelectItem value="Not Available">Not Available</SelectItem>
                    <SelectItem value="Partial">Partial</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {availabilityStatus === "Available" && (
                <div className="space-y-2">
                  <Label htmlFor="remarks">Remarks</Label>
                  <Textarea
                    id="remarks"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Enter any remarks..."
                  />
                </div>
              )}

              {availabilityStatus === "Partial" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="partialDetails">Partial Availability Details *</Label>
                    <Textarea
                      id="partialDetails"
                      value={partialDetails}
                      onChange={(e) => setPartialDetails(e.target.value)}
                      placeholder="Enter partial availability details..."
                    />
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>Unavailable Items</Label>
                      <Button type="button" size="sm" onClick={addUnavailableItem}>
                        <Plus className="h-4 w-4 mr-1" />
                        Add Item
                      </Button>
                    </div>
                    {unavailableItems.map((item, index) => (
                      <div key={index} className="flex gap-2 items-end">
                        <div className="flex-1">
                          <Label htmlFor={`itemName-${index}`}>Item Name</Label>
                          <Input
                            id={`itemName-${index}`}
                            value={item.name}
                            onChange={(e) => updateUnavailableItem(index, "name", e.target.value)}
                            placeholder="Enter item name"
                          />
                        </div>
                        <div className="w-24">
                          <Label htmlFor={`qty-${index}`}>QTY</Label>
                          <Input
                            id={`qty-${index}`}
                            type="number"
                            value={item.qty}
                            onChange={(e) => updateUnavailableItem(index, "qty", Number.parseInt(e.target.value) || 0)}
                            placeholder="0"
                          />
                        </div>
                        <Button type="button" size="sm" variant="outline" onClick={() => removeUnavailableItem(index)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {availabilityStatus === "Not Available" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Unavailable Items</Label>
                    <Button type="button" size="sm" onClick={addUnavailableItem}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add Item
                    </Button>
                  </div>
                  {unavailableItems.map((item, index) => (
                    <div key={index} className="flex gap-2 items-end">
                      <div className="flex-1">
                        <Label htmlFor={`itemName-${index}`}>Item Name</Label>
                        <Input
                          id={`itemName-${index}`}
                          value={item.name}
                          onChange={(e) => updateUnavailableItem(index, "name", e.target.value)}
                          placeholder="Enter item name"
                        />
                      </div>
                      <div className="w-24">
                        <Label htmlFor={`qty-${index}`}>QTY</Label>
                        <Input
                          id={`qty-${index}`}
                          type="number"
                          value={item.qty}
                          onChange={(e) => updateUnavailableItem(index, "qty", Number.parseInt(e.target.value) || 0)}
                          placeholder="0"
                        />
                      </div>
                      <Button type="button" size="sm" variant="outline" onClick={() => removeUnavailableItem(index)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <div className="space-y-2">
                    <Label htmlFor="attachment">Attachment</Label>
                    <Input id="attachment" type="file" accept="image/*,.pdf,.doc,.docx" />
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={!availabilityStatus}>
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
                {viewOrder.inventoryStatus && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Availability Status</Label>
                      <p className="text-sm">{viewOrder.inventoryStatus}</p>
                    </div>
                    <div>
                      <Label>Remarks</Label>
                      <p className="text-sm">{viewOrder.inventoryRemarks || 'N/A'}</p>
                    </div>
                  </div>
                )}
                {viewOrder.processedDate && (
                  <div>
                    <Label>Processed Date</Label>
                    <p className="text-sm">{new Date(viewOrder.processedDate).toLocaleDateString()}</p>
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