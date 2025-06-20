"use client"

import { useState, useEffect } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { useData } from "@/components/data-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Eye, RefreshCw, Upload } from "lucide-react"

export default function DeliveryPage() {
  const { orders, updateOrder } = useData()
  const [selectedOrder, setSelectedOrder] = useState<string>("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [viewOrder, setViewOrder] = useState<any>(null)
  const [pendingOrders, setPendingOrders] = useState<any[]>([])
  const [historyOrders, setHistoryOrders] = useState<any[]>([])

  const APPS_SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbyzW8-RldYx917QpAfO4kY-T8_ntg__T0sbr7Yup2ZTVb1FC5H1g6TYuJgAU6wTquVM/exec"
  const SHEET_ID = "1yEsh4yzyvglPXHxo-5PT70VpwVJbxV7wwH8rpU1RFJA"
  const SHEET_NAME = "DISPATCH-DELIVERY"

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deliveryPhoto, setDeliveryPhoto] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  // Delivery form fields
  // const [deliveryPersonName, setDeliveryPersonName] = useState<string>("")
  // const [deliveryPersonContact, setDeliveryPersonContact] = useState<string>("")
  // const [deliveryDate, setDeliveryDate] = useState<string>("")
  // const [deliveryTime, setDeliveryTime] = useState<string>("")
  // const [receiverName, setReceiverName] = useState<string>("")
  // const [receiverContact, setReceiverContact] = useState<string>("")
  // const [deliveryRemarks, setDeliveryRemarks] = useState<string>("")
  // const [deliveryStatus, setDeliveryStatus] = useState<string>("delivered")

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
            const buColumn = row.c[98] ? row.c[98].v : null // Column BU (warehouse processed)
            const cvColumn = row.c[99] ? row.c[99].v : null // Column CV (delivery processed)

            // Only include rows where BU is not null (warehouse processed) and CV is null (delivery not processed)
            if (buColumn && !cvColumn) {
              const order = {
                rowIndex: actualRowIndex,
                id: row.c[1] ? row.c[1].v : `ORDER-${actualRowIndex}`,
                companyName: row.c[3] ? row.c[3].v : "",
                contactPerson: row.c[4] ? row.c[4].v : "",
                contactNumber: row.c[5] ? row.c[5].v : "",
                billingAddress: row.c[6] ? row.c[6].v : "",
                shippingAddress: row.c[7] ? row.c[7].v : "",
                poNumber: row.c[14] ? row.c[14].v : "",
                paymentMode: row.c[8] ? row.c[8].v : "",
                paymentTerms: row.c[9] ? row.c[9].v : "",
                quantity: row.c[10] ? row.c[10].v : "",
                transportMode: row.c[11] ? row.c[11].v : "",
                destination: row.c[13] ? row.c[13].v : "",
                amount: row.c[12] ? Number.parseFloat(row.c[12].v) || 0 : 0,
                invoiceNumber: row.c[65] ? row.c[65].v : "", // Column BO (invoice number)
                warehouseProcessedDate: buColumn,
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
            const buColumn = row.c[98] ? row.c[98].v : null // Column BU (warehouse processed)
            const cvColumn = row.c[99] ? row.c[99].v : null // Column CV (delivery processed)

            // Only include rows where both BU and CV are not null
            if (buColumn && cvColumn) {
              const order = {
                rowIndex: actualRowIndex,
                id: row.c[1] ? row.c[1].v : `ORDER-${actualRowIndex}`,
                companyName: row.c[3] ? row.c[3].v : "",
                contactPerson: row.c[4] ? row.c[4].v : "",
                contactNumber: row.c[5] ? row.c[5].v : "",
                billingAddress: row.c[6] ? row.c[6].v : "",
                shippingAddress: row.c[7] ? row.c[7].v : "",
                poNumber: row.c[14] ? row.c[14].v : "",
                paymentMode: row.c[8] ? row.c[8].v : "",
                paymentTerms: row.c[9] ? row.c[9].v : "",
                quantity: row.c[10] ? row.c[10].v : "",
                transportMode: row.c[11] ? row.c[11].v : "",
                destination: row.c[13] ? row.c[13].v : "",
                amount: row.c[12] ? Number.parseFloat(row.c[12].v) || 0 : 0,
                invoiceNumber: row.c[65] ? row.c[65].v : "", // Column BO (invoice number)
                warehouseProcessedDate: buColumn,
                deliveryProcessedDate: row.c[101] ? row.c[101].v : "", // Column CV contains the delivery processing date
                fullRowData: row.c,
                deliveryData: {
                  processedAt: cvColumn,
                  processedBy: "Current User",
                },
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

  // Legacy orders from useData hook
  const legacyPendingOrders = orders.filter((order) => order.status === "warehouse-processed")
  const legacyProcessedOrders = orders.filter((order) => order.deliveryData)

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = (error) => reject(error)
    })
  }

  const updateOrderStatus = async (order: any) => {
    try {
      setUploading(true)

      const formData = new FormData()
      formData.append("sheetName", SHEET_NAME)
      formData.append("action", "updateByOrderNoInColumnB")
      formData.append("orderNo", order.id)

      // Handle delivery photo upload
      if (deliveryPhoto) {
        try {
          const base64Data = await convertFileToBase64(deliveryPhoto)
          formData.append("deliveryPhotoFile", base64Data)
          formData.append("deliveryPhotoFileName", deliveryPhoto.name)
          formData.append("deliveryPhotoMimeType", deliveryPhoto.type)
        } catch (error) {
          console.error("Error converting delivery photo:", error)
        }
      }

      const rowData = new Array(110).fill("") // Array size to accommodate all columns

      // Add today's date to CV column (index 100) - Column CV for delivery processed date
      const today = new Date()
      const formattedDate = `${String(today.getDate()).padStart(2, "0")}/${String(today.getMonth() + 1).padStart(2, "0")}/${today.getFullYear()}`
      rowData[99] = formattedDate // Column CV (index 99)

      // Add delivery data to columns CW to DD (indexes 100-107)
      // rowData[100] = deliveryPersonName // Column CW
      // rowData[101] = deliveryPersonContact // Column CX
      // rowData[102] = deliveryDate // Column CY
      // rowData[103] = deliveryTime // Column CZ
      // rowData[104] = receiverName // Column DA
      // rowData[105] = receiverContact // Column DB
      // rowData[106] = deliveryRemarks // Column DC
      // rowData[107] = deliveryStatus // Column DD

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
    setSelectedOrder(orderId)
    setDeliveryPhoto(null)
    // Reset delivery form fields
    // setDeliveryPersonName("")
    // setDeliveryPersonContact("")
    // setDeliveryDate("")
    // setDeliveryTime("")
    // setReceiverName("")
    // setReceiverContact("")
    // setDeliveryRemarks("")
    // setDeliveryStatus("delivered")
    setIsDialogOpen(true)
  }

  const handleSubmit = async () => {
    if (!selectedOrder) return

    const order = pendingOrders.find((o) => o.id === selectedOrder)
    if (!order) {
      // Fallback to legacy orders
      const deliveryData = {
        processedAt: new Date().toISOString(),
        processedBy: "Current User",
        // deliveryPersonName,
        // deliveryPersonContact,
        // deliveryDate,
        // deliveryTime,
        // receiverName,
        // receiverContact,
        // deliveryRemarks,
        // deliveryStatus,
      }

      updateOrder(selectedOrder, {
        status: "delivery-processed",
        deliveryData,
      })

      setIsDialogOpen(false)
      setSelectedOrder("")
      return
    }

    const result = await updateOrderStatus(order)

    if (result.success) {
      setIsDialogOpen(false)
      setSelectedOrder("")
      let message = `Delivery processing for order ${selectedOrder} has been completed successfully`
      if (result.fileUrls && result.fileUrls.deliveryPhotoUrl) {
        message += "\n\nDelivery photo uploaded to Google Drive"
      }
      alert(message)
    } else {
      alert(`Error processing delivery operation: ${result.error}`)
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
            <Button
              onClick={() => {
                fetchPendingOrders()
                fetchHistoryOrders()
              }}
              className="mt-4"
            >
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
          <h1 className="text-3xl font-bold tracking-tight">Delivery Management</h1>
          <p className="text-muted-foreground">Manage delivery operations and documentation</p>
        </div>

        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending">Pending ({pendingOrders.length})</TabsTrigger>
            <TabsTrigger value="history">History ({historyOrders.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Pending Delivery Operations</CardTitle>
                <CardDescription>Orders ready for delivery processing</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order Number</TableHead>
                        <TableHead>Company Name</TableHead>
                        <TableHead>Invoice Number</TableHead>
                        <TableHead>Shipping Address</TableHead>
                        <TableHead>Transport Mode</TableHead>
                        <TableHead>Destination</TableHead>
                        <TableHead>Warehouse Processed</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingOrders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">{order.id}</TableCell>
                          <TableCell>{order.companyName}</TableCell>
                          <TableCell>{order.invoiceNumber || "N/A"}</TableCell>
                          <TableCell className="max-w-[150px] truncate">{order.shippingAddress || "N/A"}</TableCell>
                          <TableCell>{order.transportMode}</TableCell>
                          <TableCell>{order.destination}</TableCell>
                          <TableCell>{order.warehouseProcessedDate}</TableCell>
                          <TableCell>
                            <Button size="sm" onClick={() => handleProcess(order.id)}>
                              Process Delivery
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
                <CardTitle>Delivery History</CardTitle>
                <CardDescription>Previously processed delivery operations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order Number</TableHead>
                        <TableHead>Company Name</TableHead>
                        <TableHead>Invoice Number</TableHead>
                        <TableHead>Shipping Address</TableHead>
                        <TableHead>Transport Mode</TableHead>
                        <TableHead>Destination</TableHead>
                        <TableHead>DN Image</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {historyOrders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">{order.id}</TableCell>
                          <TableCell>{order.companyName}</TableCell>
                          <TableCell>{order.invoiceNumber || "N/A"}</TableCell>
                          <TableCell className="max-w-[150px] truncate">{order.shippingAddress || "N/A"}</TableCell>
                          <TableCell>{order.transportMode}</TableCell>
                          <TableCell>{order.destination}</TableCell>
                          {/* <TableCell>{order.deliveryProcessedDate}</TableCell> */}
                          <TableCell>
        {order.fullRowData?.[101]?.v ? (
          <a 
            href={order.fullRowData[101].v} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            View DN
          </a>
        ) : (
          "N/A"
        )}
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
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Delivery Processing</DialogTitle>
              <DialogDescription>Complete delivery documentation and enter delivery details</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="orderNumber">Order Number</Label>
                <Input id="orderNumber" value={selectedOrder} disabled />
              </div>

              {/* File Upload Section */}
              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">Delivery Photo Upload</h4>

                <div className="space-y-2">
                  <Label htmlFor="deliveryPhoto">Delivery Proof Photo</Label>
                  <Input
                    id="deliveryPhoto"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setDeliveryPhoto(e.target.files?.[0] || null)}
                  />
                  {deliveryPhoto && <p className="text-sm text-muted-foreground">Selected: {deliveryPhoto.name}</p>}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={uploading}>
                  {uploading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Complete Delivery
                    </>
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
              <DialogTitle>Delivery Details</DialogTitle>
              <DialogDescription>View delivery operation details</DialogDescription>
            </DialogHeader>
            {viewOrder && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Order Number</Label>
                    <p className="text-sm">{viewOrder.id}</p>
                  </div>
                  <div>
                    <Label>Company Name</Label>
                    <p className="text-sm">{viewOrder.companyName}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Invoice Number</Label>
                    <p className="text-sm">{viewOrder.invoiceNumber || "N/A"}</p>
                  </div>
                  <div>
                    <Label>Transport Mode</Label>
                    <p className="text-sm">{viewOrder.transportMode}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Warehouse Processed</Label>
                    <p className="text-sm">{viewOrder.warehouseProcessedDate || "N/A"}</p>
                  </div>
                  <div>
                    <Label>Delivery Processed</Label>
                    <p className="text-sm">{viewOrder.deliveryProcessedDate || "N/A"}</p>
                  </div>
                </div>
                <div>
                  <Label>Shipping Address</Label>
                  <p className="text-sm">{viewOrder.shippingAddress || "N/A"}</p>
                </div>
                <div>
                  <Label>Destination</Label>
                  <p className="text-sm">{viewOrder.destination}</p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  )
}
