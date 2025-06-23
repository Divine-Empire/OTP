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
import { Input } from "@/components/ui/input"
import { Eye, Plus, Trash2, RefreshCw } from "lucide-react"

export default function MakeInvoicePage() {
  const { orders, updateOrder } = useData()
  const [selectedOrder, setSelectedOrder] = useState<string>("")
  const [invoiceNumber, setInvoiceNumber] = useState("")
  const [qty, setQty] = useState<number>(0)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [viewOrder, setViewOrder] = useState<any>(null)
  const [pendingOrders, setPendingOrders] = useState<any[]>([])
  const [historyOrders, setHistoryOrders] = useState<any[]>([])
  const [totalBillAmount, setTotalBillAmount] = useState<number>(0)

  const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyzW8-RldYx917QpAfO4kY-T8_ntg__T0sbr7Yup2ZTVb1FC5H1g6TYuJgAU6wTquVM/exec"
const SHEET_ID = "1yEsh4yzyvglPXHxo-5PT70VpwVJbxV7wwH8rpU1RFJA"
const SHEET_NAME = "DISPATCH-DELIVERY"

const [loading, setLoading] = useState(false)
const [error, setError] = useState<string | null>(null)
const [invoiceAttachment, setInvoiceAttachment] = useState<File | null>(null)
const [ewayBillAttachment, setEwayBillAttachment] = useState<File | null>(null)
const [uploading, setUploading] = useState(false)

const fetchPendingOrders = async () => {
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
      const pendingOrders: any[] = []

      data.table.rows.slice(6).forEach((row, index) => {
        if (row.c) {
          const actualRowIndex = index + 2
          const bjColumn = row.c[62] ? row.c[62].v : null // Column BJ (index 61)
          const bkColumn = row.c[63] ? row.c[63].v : null // Column BK (index 62)

          // Only include rows where BJ is not null and BK is null
          if (bjColumn && !bkColumn) {
            const order = {
              rowIndex: actualRowIndex,
              id: row.c[1] ? row.c[1].v : `ORDER-${actualRowIndex}`,
              companyName: row.c[3] ? row.c[3].v : "",
              contactPerson: row.c[4] ? row.c[4].v : "",
              contactNumber: row.c[5] ? row.c[5].v : "",
              billingAddress: row.c[6] ? row.c[6].v : "", // Added billing address
              shippingAddress: row.c[7] ? row.c[7].v : "", // Added shipping address
              paymentMode: row.c[8] ? row.c[8].v : "",
              paymentDetails: row.c[8] === "Advance" ? "Required" : "N/A", // Payment details logic
              paymentTerms: row.c[9] ? row.c[9].v : "",
              quantity: row.c[10] ? row.c[10].v : "",
              transportMode: row.c[11] ? row.c[11].v : "",
              freightType: row.c[12] ? row.c[12].v : "", // Added freight type (assuming column 12)
              destination: row.c[13] ? row.c[13].v : "",
              poNumber: row.c[14] ? row.c[14].v : "",
              amount: row.c[20] ? Number.parseFloat(row.c[20].v) || 0 : 0, // Adjusted amount column
              seniorApproval: row.c[16] ? row.c[16].v : "Approved", // Added senior approval
              totalQty: row.c[19] ? row.c[19].v : "", // Same as quantity for now
              billingQty: row.c[10] ? row.c[10].v : "", // Same as quantity for now
              quotationCopy: "Available", // Static for now, adjust based on your sheet structure
              acceptanceCopy: "Available", // Static for now, adjust based on your sheet structure
              fullRowData: row.c,
            }
            pendingOrders.push(order)
          }
        }
      })

      setPendingOrders(pendingOrders)
    }
  } catch (err: any) {
    console.error("Error fetching pending orders:", err)
    setError(err.message)
    setPendingOrders([])
  } finally {
    setLoading(false)
  }
}

const fetchHistoryOrders = async () => {
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
      const historyOrders: any[] = []

      data.table.rows.slice(6).forEach((row, index) => {
        if (row.c) {
          const actualRowIndex = index + 2
          const bjColumn = row.c[62] ? row.c[62].v : null // Column BJ (index 61)
          const bkColumn = row.c[63] ? row.c[63].v : null // Column BK (index 62)

          // Only include rows where both BJ and BK are not null
          if (bjColumn && bkColumn) {
            const order = {
              rowIndex: actualRowIndex,
              id: row.c[1] ? row.c[1].v : `ORDER-${actualRowIndex}`,
              companyName: row.c[3] ? row.c[3].v : "",
              contactPerson: row.c[4] ? row.c[4].v : "",
              contactNumber: row.c[5] ? row.c[5].v : "",
              billingAddress: row.c[6] ? row.c[6].v : "", // Added billing address
              shippingAddress: row.c[7] ? row.c[7].v : "", // Added shipping address
              paymentMode: row.c[8] ? row.c[8].v : "",
              paymentDetails: row.c[8] === "Advance" ? "Attached" : "N/A", // Payment details for history
              paymentTerms: row.c[10] ? row.c[10].v : "",
              quantity: row.c[10] ? row.c[10].v : "",
              transportMode: row.c[11] ? row.c[11].v : "",
              freightType: row.c[12] ? row.c[12].v : "", // Added freight type
              destination: row.c[13] ? row.c[13].v : "",
              poNumber: row.c[14] ? row.c[14].v : "",
              amount: row.c[15] ? Number.parseFloat(row.c[15].v) || 0 : 0, // Adjusted amount column
              seniorApproval: row.c[16] ? row.c[16].v : "Approved", // Added senior approval
              totalQty: row.c[60] ? row.c[60].v : "", // Same as quantity for now
              billingQty: row.c[69] ? row.c[69].v : row.c[10] ? row.c[10].v : "", // Invoice qty or original qty
              invoiceDate: bkColumn, // Column BK contains the invoice date
              invoiceNumber: row.c[65] ? row.c[65].v : "", // Column BO (invoice number)
              invoiceQty: row.c[69] ? row.c[69].v : "", // Column BQ (quantity)
              fullRowData: row.c,
              invoiceData: {
                invoiceNumber: row.c[65] ? row.c[65].v : "",
                qty: row.c[69] ? row.c[69].v : "",
                processedAt: bkColumn
              },
              approvalData: {
                approvedBy: row.c[16] ? row.c[16].v : "Approved" // Approval data
              }
            }
            historyOrders.push(order)
          }
        }
      })

      setHistoryOrders(historyOrders)
    }
  } catch (err: any) {
    console.error("Error fetching history orders:", err)
    setError(err.message)
    setHistoryOrders([])
  } finally {
    setLoading(false)
  }
}

useEffect(() => {
  fetchPendingOrders()
  fetchHistoryOrders()
}, [])


  // const pendingOrders = orders.filter((order) => order.status === "dispatch-processed")
  const processedOrders = orders.filter((order) => order.invoiceData)

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = (error) => reject(error)
    })
  }

  const updateOrderStatus = async (order: any, invoiceData: any) => {
    try {
      setUploading(true)
  
      const formData = new FormData()
      formData.append("sheetName", SHEET_NAME)
      formData.append("action", "updateByOrderNoInColumnB")
      formData.append("orderNo", order.id)
  
      // Handle invoice file upload
      if (invoiceAttachment) {
        try {
          const base64Data = await convertFileToBase64(invoiceAttachment)
          formData.append("invoiceFile", base64Data)
          formData.append("invoiceFileName", invoiceAttachment.name)
          formData.append("invoiceMimeType", invoiceAttachment.type)
        } catch (error) {
          console.error("Error converting invoice file:", error)
        }
      }
  
      // Handle eway bill file upload
      if (ewayBillAttachment) {
        try {
          const base64Data = await convertFileToBase64(ewayBillAttachment)
          formData.append("ewayBillFile", base64Data)
          formData.append("ewayBillFileName", ewayBillAttachment.name)
          formData.append("ewayBillMimeType", ewayBillAttachment.type)
        } catch (error) {
          console.error("Error converting E-way Bill file:", error)
        }
      }
  
      const rowData = new Array(70).fill("")
  
      // Add today's date to BK column (index 62)
      const today = new Date();

      const formattedDate = `${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()} ` +
                            `${today.getHours()}:${today.getMinutes()}:${today.getSeconds()}`;
      
      rowData[63] = formattedDate
  
      // Add invoice data to specific columns
      rowData[65] = invoiceData.invoiceNumber // Column BO (invoice number)
      rowData[68] = invoiceData.qty // Column BQ (quantity)
      rowData[69] = totalBillAmount.toString() // Column BS (total bill amount)
      // rowData[69] = "Invoice Created" // Column BR (status)
      // rowData[70] = today.toISOString() // Column BS (timestamp)
  
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
        await fetchPendingOrders()
        await fetchHistoryOrders()
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

  const handleProcess = (orderId: string) => {
    const order = pendingOrders.find((o) => o.id === orderId)
    if (!order) return
    
    setSelectedOrder(orderId)
    setInvoiceNumber("")
    setQty(order.quantity || 0) // Auto-fill from sheet data
    setTotalBillAmount(order.amount || 0) // Auto-fill amount if available
    setInvoiceAttachment(null)
    setEwayBillAttachment(null)
    setIsDialogOpen(true)
  }

  const handleSubmit = async () => {
    if (!selectedOrder || !invoiceNumber) return
  
    const order = pendingOrders.find((o) => o.id === selectedOrder)
    if (!order) return
  
    const invoiceData = {
      invoiceNumber,
      qty,
      processedAt: new Date().toISOString(),
      processedBy: "Current User",
    }
  
    const result = await updateOrderStatus(order, invoiceData)
  
    if (result.success) {
      setIsDialogOpen(false)
      setSelectedOrder("")
      let message = `Invoice for order ${selectedOrder} has been created successfully`
      if (result.fileUrls) {
        message += "\n\nFiles uploaded to Google Drive:"
        if (result.fileUrls.invoiceUrl) message += "\n- Invoice attachment"
        if (result.fileUrls.ewayBillUrl1) message += "\n- E-Way Bill attachment"
      }
      alert(message)
    } else {
      alert(`Error creating invoice: ${result.error}`)
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
            <Button onClick={() => {
              fetchPendingOrders()
              fetchHistoryOrders()
            }} className="mt-4">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </div>
      </MainLayout>
    )
  }

  const handleRefresh = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchPendingOrders(), fetchHistoryOrders()]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
        <div>
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
  Make Invoice (Accounts Part)
</h1>
          <p className="text-muted-foreground">Create invoices for processed orders</p>
        </div>
        <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending">Pending ({pendingOrders.length})</TabsTrigger>
            <TabsTrigger value="history">History ({historyOrders.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Pending Invoices</CardTitle>
                <CardDescription>Orders waiting for invoice creation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Action</TableHead>
                        <TableHead>Order Number</TableHead>
                        <TableHead>Company Name</TableHead>
                        <TableHead>Contact Person Name</TableHead>
                        <TableHead>Contact Number</TableHead>
                        <TableHead>Billing Address</TableHead>
                        <TableHead>Shipping Address</TableHead>
                        <TableHead>Payment Mode</TableHead>
                        <TableHead>Payment Details</TableHead>
                        <TableHead>Payment Terms (In Days)</TableHead>
                        <TableHead>Order Received Qty</TableHead>
                        <TableHead>Transport Mode</TableHead>
                        <TableHead>Freight Type</TableHead>
                        <TableHead>Destination</TableHead>
                        <TableHead>PO Number</TableHead>
                        <TableHead>Senior Approval</TableHead>
                        {/* <TableHead>Total Qty</TableHead>
                        <TableHead>Billing Qty</TableHead> */}
                        <TableHead>Quotation Copy</TableHead>
                        <TableHead>Acceptance Copy</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingOrders.map((order) => (
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
                          <TableCell className="max-w-[150px] truncate">{order.billingAddress || "N/A"}</TableCell>
                          <TableCell className="max-w-[150px] truncate">{order.shippingAddress || "N/A"}</TableCell>
                          <TableCell>{order.paymentMode}</TableCell>
                          <TableCell>
                            {order.paymentMode === "Advance" ? (
                              <Badge variant="secondary">Required</Badge>
                            ) : (
                              <Badge variant="outline">N/A</Badge>
                            )}
                          </TableCell>
                          <TableCell>{order.paymentTerms}</TableCell>
                          <TableCell>{order.quantity}</TableCell>
                          <TableCell>{order.transportMode}</TableCell>
                          <TableCell>{order.freightType || "N/A"}</TableCell>
                          <TableCell>{order.destination}</TableCell>
                          <TableCell>{order.poNumber}</TableCell>
                          <TableCell>
                            <Badge variant="default">{order.approvalData?.approvedBy || "Approved"}</Badge>
                          </TableCell>
                          {/* <TableCell>{order.quantity}</TableCell>
                          <TableCell>{order.quantity}</TableCell> */}
                          <TableCell>
                            <Badge variant="outline">Available</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">Available</Badge>
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
                <CardTitle>Invoice History</CardTitle>
                <CardDescription>Previously created invoices</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order Number</TableHead>
                        <TableHead>Company Name</TableHead>
                        <TableHead>Contact Person Name</TableHead>
                        <TableHead>Contact Number</TableHead>
                        <TableHead>Billing Address</TableHead>
                        <TableHead>Shipping Address</TableHead>
                        <TableHead>Payment Mode</TableHead>
                        <TableHead>Payment Details</TableHead>
                        <TableHead>Payment Terms (In Days)</TableHead>
                        <TableHead>Order Received Qty</TableHead>
                        <TableHead>Transport Mode</TableHead>
                        <TableHead>Freight Type</TableHead>
                        <TableHead>Destination</TableHead>
                        <TableHead>PO Number</TableHead>
                        <TableHead>Senior Approval</TableHead>
                        <TableHead>Total Qty</TableHead>
                        <TableHead>Billing Qty</TableHead>
                        <TableHead>Invoice Number</TableHead>
                        <TableHead>Invoice Date</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {historyOrders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">{order.id}</TableCell>
                          <TableCell>{order.companyName}</TableCell>
                          <TableCell>{order.contactPerson}</TableCell>
                          <TableCell>{order.contactNumber}</TableCell>
                          <TableCell className="max-w-[150px] truncate">{order.billingAddress || "N/A"}</TableCell>
                          <TableCell className="max-w-[150px] truncate">{order.shippingAddress || "N/A"}</TableCell>
                          <TableCell>{order.paymentMode}</TableCell>
                          <TableCell>
                            {order.paymentMode === "Advance" ? (
                              <Badge variant="default">Attached</Badge>
                            ) : (
                              <Badge variant="outline">N/A</Badge>
                            )}
                          </TableCell>
                          <TableCell>{order.paymentTerms}</TableCell>
                          <TableCell>{order.quantity}</TableCell>
                          <TableCell>{order.transportMode}</TableCell>
                          <TableCell>{order.freightType || "N/A"}</TableCell>
                          <TableCell>{order.destination}</TableCell>
                          <TableCell>{order.poNumber}</TableCell>
                          <TableCell>
                            <Badge variant="default">{order.approvalData?.approvedBy || "Approved"}</Badge>
                          </TableCell>
                          <TableCell>{order.quantity}</TableCell>
                          <TableCell>{order.invoiceQty || order.quantity}</TableCell>
                          <TableCell className="font-medium">{order.invoiceNumber}</TableCell>
                          <TableCell>{order.invoiceDate}</TableCell>
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
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create Invoice</DialogTitle>
              <DialogDescription>Generate invoice for the order</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="orderNo">Order No</Label>
                <Input id="orderNo" value={selectedOrder} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="invoiceNumber">Invoice Number</Label>
                <Input
                  id="invoiceNumber"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  placeholder="Enter invoice number manually"
                />
              </div>
              <div className="space-y-2">
  <Label htmlFor="totalQty">Total QTY</Label>
  <Input
    id="totalQty"
    type="number"
    value={qty}
    onChange={(e) => setQty(Number.parseInt(e.target.value) || 0)}
    // disabled // Make it read-only since it's auto-filled
  />
</div>
<div className="space-y-2">
  <Label htmlFor="totalBillAmount">Total Bill Amount</Label>
  <Input
    id="totalBillAmount"
    type="number"
    value={totalBillAmount}
    onChange={(e) => setTotalBillAmount(Number.parseFloat(e.target.value) || 0)}
    placeholder="Enter total bill amount"
  />
</div>
              <div className="space-y-2">
                <Label htmlFor="invoice">Invoice (Attachment)</Label>
                <Input 
                  id="invoice" 
                  type="file" 
                  onChange={(e) => setInvoiceAttachment(e.target.files?.[0] || null)}
                />
                {invoiceAttachment && (
                  <p className="text-sm text-muted-foreground">Selected: {invoiceAttachment.name}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="ewaybill">E-Way Bill (Attachment)</Label>
                <Input 
                  id="ewaybill" 
                  type="file" 
                  onChange={(e) => setEwayBillAttachment(e.target.files?.[0] || null)}
                />
                {ewayBillAttachment && (
                  <p className="text-sm text-muted-foreground">Selected: {ewayBillAttachment.name}</p>
                )}
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={!invoiceNumber || uploading}>
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
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Invoice Details</DialogTitle>
              <DialogDescription>View invoice information</DialogDescription>
            </DialogHeader>
            {viewOrder && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Order No.</Label>
                    <p className="text-sm">{viewOrder.id}</p>
                  </div>
                  <div>
                    <Label>Invoice Number</Label>
                    <p className="text-sm">{viewOrder.invoiceData?.invoiceNumber || "N/A"}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Company Name</Label>
                    <p className="text-sm">{viewOrder.companyName}</p>
                  </div>
                  <div>
                    <Label>Quantity</Label>
                    <p className="text-sm">{viewOrder.invoiceData?.qty || viewOrder.quantity}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Invoice Date</Label>
                    <p className="text-sm">{viewOrder.invoiceDate || "N/A"}</p>
                  </div>
                  <div>
                    <Label>Payment Mode</Label>
                    <p className="text-sm">{viewOrder.paymentMode}</p>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  )
}