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
import { Input } from "@/components/ui/input"
import { Eye, Plus, Trash2, RefreshCw } from "lucide-react"

const convertFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = (error) => reject(error)
  })
}

export default function DispFormPage() {
  const [selectedOrder, setSelectedOrder] = useState<string>("")
  const [calibrationRequired, setCalibrationRequired] = useState<string>("")
  const [calibrationType, setCalibrationType] = useState<string>("")
  const [installationRequired, setInstallationRequired] = useState<string>("")
  const [items, setItems] = useState<Array<{ name: string; qty: number }>>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [viewOrder, setViewOrder] = useState<any>(null)
  const [orders, setOrders] = useState<any[]>([])
  const [processedOrders, setProcessedOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [processedLoading, setProcessedLoading] = useState(false)
  const [ewayBillDetails, setEwayBillDetails] = useState<string>("")
  const [ewayBillAttachment, setEwayBillAttachment] = useState<File | null>(null)
  const [srnNumber, setSrnNumber] = useState<string>("")
  const [srnNumberAttachment, setSrnNumberAttachment] = useState<File | null>(null)
  const [paymentAttachment, setPaymentAttachment] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [remarks, setRemarks] = useState<string>("")

  const APPS_SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbyzW8-RldYx917QpAfO4kY-T8_ntg__T0sbr7Yup2ZTVb1FC5H1g6TYuJgAU6wTquVM/exec"
  const SHEET_ID = "1yEsh4yzyvglPXHxo-5PT70VpwVJbxV7wwH8rpU1RFJA"
  const SHEET_NAME = "ORDER-DISPATCH"

  const fetchAllOrders = async () => {
    setLoading(true)
    setError(null)

    try {
      const sheetUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${SHEET_NAME}`
      const response = await fetch(sheetUrl)
      const text = await response.text()

      const jsonStart = text.indexOf("{")
      const jsonEnd = text.lastIndexOf("}") + 1
      const jsonData = text.substring(jsonStart, jsonEnd)

      const data = JSON.parse(jsonData)

      if (data && data.table && data.table.rows) {
        const pendingData: any[] = []
        const processedData: any[] = []

        data.table.rows.slice(6).forEach((row, index) => {
          if (row.c) {
            const actualRowIndex = index + 2
            const statusColumn = row.c[49] ? row.c[49].v?.toString().toLowerCase() : "" // Column AX (index 49)

            const order = {
              rowIndex: actualRowIndex,
              id: row.c[1] ? row.c[1].v : `ORDER-${actualRowIndex}`,
              companyName: row.c[3] ? row.c[3].v : "",
              contactPerson: row.c[4] ? row.c[4].v : "",
              contactNumber: row.c[5] ? row.c[5].v : "",
              poNumber: row.c[35] ? row.c[35].v : "",
              paymentMode: row.c[8] ? row.c[8].v : "",
              paymentTerms: row.c[9] ? row.c[9].v : "",
              quantity: row.c[41] ? row.c[41].v : "",
              transportMode: row.c[32] ? row.c[32].v : "",
              destination: row.c[32] ? row.c[32].v : "",
              amount: row.c[12] ? Number.parseFloat(row.c[12].v) || 0 : 0,
              status: statusColumn === "completed" ? "dispatch-processed" : "senior-approved",
              fullRowData: row.c,
            }

            if (statusColumn === "pending") {
              pendingData.push(order)
            } else if (statusColumn === "completed") {
              processedData.push(order)
            }
          }
        })

        setOrders(pendingData)
        setProcessedOrders(processedData)
      }
    } catch (err: any) {
      console.error("Error fetching orders data:", err)
      setError(err.message)
      setOrders([])
      setProcessedOrders([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAllOrders()
  }, [])

  const handleProcess = (orderId: string) => {
    const order = orders.find((o: any) => o.id === orderId)
    if (!order) return

    setSelectedOrder(orderId)
    setCalibrationRequired("")
    setCalibrationType("")
    setInstallationRequired("")
    
    // Extract items from the order data (columns M to AF)
    const extractedItems: Array<{ name: string; qty: number }> = []
    for (let i = 12; i <= 31; i += 2) { // Columns M (12) to AF (31)
      const nameCol = order.fullRowData[i]
      const qtyCol = order.fullRowData[i + 1]
      
      if (nameCol && nameCol.v && nameCol.v.toString().trim() !== "") {
        extractedItems.push({
          name: nameCol.v.toString(),
          qty: qtyCol ? Number(qtyCol.v) || 0 : 0
        })
      }
    }
    
    setItems(extractedItems)
    setEwayBillDetails("")
    setEwayBillAttachment(null)
    setSrnNumber("")
    setSrnNumberAttachment(null)
    setPaymentAttachment(null)
    setIsDialogOpen(true)
    setRemarks("") // Add this line
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

  const updateOrderStatus = async (order: any, dispatchData: any) => {
    try {
      setUploading(true)
  
      const formData = new FormData()
      formData.append("sheetName", "DISPATCH-DELIVERY")
      formData.append("action", "insert") // Changed to "insert" to always create new row
      formData.append("orderNo", order.id)
  
      // Handle file uploads (same as before)
      if (ewayBillAttachment) {
        try {
          const base64Data = await convertFileToBase64(ewayBillAttachment)
          formData.append("ewayBillFile", base64Data)
          formData.append("ewayBillFileName", ewayBillAttachment.name)
          formData.append("ewayBillMimeType", ewayBillAttachment.type)
        } catch (error) {
          console.error("Error converting Eway Bill file:", error)
        }
      }
  
      if (srnNumberAttachment) {
        try {
          const base64Data = await convertFileToBase64(srnNumberAttachment)
          formData.append("srnFile", base64Data)
          formData.append("srnFileName", srnNumberAttachment.name)
          formData.append("srnMimeType", srnNumberAttachment.type)
        } catch (error) {
          console.error("Error converting SRN file:", error)
        }
      }
  
      if (paymentAttachment) {
        try {
          const base64Data = await convertFileToBase64(paymentAttachment)
          formData.append("paymentFile", base64Data)
          formData.append("paymentFileName", paymentAttachment.name)
          formData.append("paymentMimeType", paymentAttachment.type)
        } catch (error) {
          console.error("Error converting Payment file:", error)
        }
      }
  
      const rowData = new Array(100).fill("") // Make sure this is large enough for all columns

      // Add today's date in column A (index 0)
      const today = new Date()
      const formattedDate = `${String(today.getDate()).padStart(2, "0")}/${String(today.getMonth() + 1).padStart(2, "0")}/${today.getFullYear()}`
      rowData[0] = formattedDate
  
      // Add order number in column B (index 1)
      rowData[1] = order.id
  
      // Map other data to columns
      rowData[22] = dispatchData.calibrationRequired // Column X
      rowData[23] = dispatchData.calibrationType || "" // Column Y
      rowData[24] = dispatchData.installationRequired // Column Z
      rowData[25] = dispatchData.ewayBillDetails // Column AB
      rowData[27] = dispatchData.srnNumber // Column AC
      rowData[61] = dispatchData.remarks || "" // Column BI (index 61)
  
      // Process items array
      const processedItems = dispatchData.items.map((item: any) => ({
        name: item.name || "",
        qty: item.qty || 0
      }))
  
      // Assign items to columns starting from AA (index 30)
      let columnIndex = 30
      processedItems.forEach((item: any) => {
        if (columnIndex + 1 < rowData.length) {
          rowData[columnIndex] = item.name
          rowData[columnIndex + 1] = item.qty
          columnIndex += 2
        }
      })
  
      formData.append("rowData", JSON.stringify(rowData))
  
  
      const updateResponse = await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        mode: "cors",
        body: formData,
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
        await fetchAllOrders()
        return { success: true, fileUrls: result.fileUrls }
      } else {
        throw new Error(result.error || "Update failed")
      }
    } catch (err: any) {
      console.error("Error updating order:", err)
      setError(err.message)
      return { success: false, error: err.message }
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async () => {
    if (!selectedOrder || !calibrationRequired || !installationRequired) return

    const order = orders.find((o: any) => o.id === selectedOrder)
    if (!order) return

    const dispatchData = {
      calibrationRequired,
      calibrationType: calibrationRequired === "YES" ? calibrationType : "",
      installationRequired,
      items,
      ewayBillDetails,
      srnNumber,
      remarks, // Add this line
      processedAt: new Date().toISOString(),
    }

    const result = await updateOrderStatus(order, dispatchData)

    if (result.success) {
      setIsDialogOpen(false)
      setSelectedOrder("")
      let message = `Order ${selectedOrder} dispatch form has been processed successfully`
      if (result.fileUrls) {
        message += "\n\nFiles uploaded to Google Drive:"
        if (result.fileUrls.ewayBillUrl) message += "\n- Eway Bill attachment"
        if (result.fileUrls.srnUrl) message += "\n- SRN Number attachment"
        if (result.fileUrls.paymentUrl) message += "\n- Payment attachment"
      }
      alert(message)
    } else {
      alert(`Error processing order: ${result.error}`)
    }
  }

  const handleView = (order: any) => {
    setViewOrder(order)
    setViewDialogOpen(true)
  }

  const handleRefresh = async () => {
    setLoading(true)
    setProcessedLoading(true)
    await fetchAllOrders()
    setLoading(false)
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
            <Button onClick={fetchAllOrders} className="mt-4">
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
            <h1 className="text-3xl font-bold tracking-tight">DISP Form</h1>
            <p className="text-muted-foreground">Process dispatch forms for approved orders</p>
          </div>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending">Pending ({orders.length})</TabsTrigger>
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
                      {orders.map((order) => (
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
                {processedLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <RefreshCw className="h-8 w-8 animate-spin" />
                  </div>
                ) : (
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
                )}
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
                      {/* <SelectItem value="AUTO LEVEL">AUTO LEVEL</SelectItem> */}
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

              {/* Eway Bill Details */}
              <div className="space-y-2">
                <Label htmlFor="ewayBill">Eway Bill Details</Label>
                <Input
                  id="ewayBill"
                  value={ewayBillDetails}
                  onChange={(e) => setEwayBillDetails(e.target.value)}
                  placeholder="Enter Eway Bill details"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ewayBillAttachment">Eway Bill Attachment</Label>
                <Input
                  id="ewayBillAttachment"
                  type="file"
                  accept=".pdf,.doc,.docx,image/*"
                  onChange={(e) => setEwayBillAttachment(e.target.files?.[0] || null)}
                />
                {ewayBillAttachment && (
                  <p className="text-sm text-muted-foreground">Selected: {ewayBillAttachment.name}</p>
                )}
              </div>

              {/* SRN Number */}
              <div className="space-y-2">
                <Label htmlFor="srnNumber">SRN Number</Label>
                <Input
                  id="srnNumber"
                  value={srnNumber}
                  onChange={(e) => setSrnNumber(e.target.value)}
                  placeholder="Enter SRN Number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="srnNumberAttachment">SRN Number Attachment</Label>
                <Input
                  id="srnNumberAttachment"
                  type="file"
                  accept=".pdf,.doc,.docx,image/*"
                  onChange={(e) => setSrnNumberAttachment(e.target.files?.[0] || null)}
                />
                {srnNumberAttachment && (
                  <p className="text-sm text-muted-foreground">Selected: {srnNumberAttachment.name}</p>
                )}
              </div>

              <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Items (Max 15)</Label>
                <Button 
                  type="button" 
                  size="sm" 
                  onClick={addItem}
                  disabled={items.length >= 15}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Item ({items.length}/15)
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
                <Input
                  id="paymentDetails"
                  type="file"
                  accept=".pdf,.doc,.docx,image/*"
                  onChange={(e) => setPaymentAttachment(e.target.files?.[0] || null)}
                />
                {paymentAttachment && (
                  <p className="text-sm text-muted-foreground">Selected: {paymentAttachment.name}</p>
                )}
              </div>

              <div className="space-y-2">
  <Label htmlFor="remarks">Remarks</Label>
  <Input
    id="remarks"
    value={remarks}
    onChange={(e) => setRemarks(e.target.value)}
    placeholder="Enter any additional remarks"
  />
</div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={!calibrationRequired || !installationRequired || uploading}>
                  {uploading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    "Submit"
                  )}
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
