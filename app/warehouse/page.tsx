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
import { Textarea } from "@/components/ui/textarea"
import { Eye, RefreshCw } from "lucide-react"

export default function WarehousePage() {
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
  const [beforePhoto, setBeforePhoto] = useState<File | null>(null)
  const [afterPhoto, setAfterPhoto] = useState<File | null>(null)
  const [biltyUpload, setBiltyUpload] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  // New form fields
  const [transporterName, setTransporterName] = useState<string>("")
  const [transporterContact, setTransporterContact] = useState<string>("")
  const [biltyNumber, setBiltyNumber] = useState<string>("")
  const [totalCharges, setTotalCharges] = useState<string>("")
  const [warehouseRemarks, setWarehouseRemarks] = useState<string>("")

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
            const btColumn = row.c[70] ? row.c[70].v : null // Column BT (index 71)
            const buColumn = row.c[71] ? row.c[71].v : null // Column BU (index 72)

            // Only include rows where BT is not null and BU is null
            if (btColumn && !buColumn) {
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
            const btColumn = row.c[70] ? row.c[70].v : null // Column BT (index 71)
            const buColumn = row.c[71] ? row.c[71].v : null // Column BU (index 72)

            // Only include rows where both BT and BU are not null
            if (btColumn && buColumn) {
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
                warehouseProcessedDate: buColumn, // Column BU contains the warehouse processing date
                fullRowData: row.c,
                warehouseData: {
                  processedAt: buColumn,
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
  const legacyPendingOrders = orders.filter((order) => order.status === "pi-created")
  const legacyProcessedOrders = orders.filter((order) => order.warehouseData)

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

      // Handle before photo upload
      if (beforePhoto) {
        try {
          const base64Data = await convertFileToBase64(beforePhoto)
          formData.append("beforePhotoFile", base64Data)
          formData.append("beforePhotoFileName", beforePhoto.name)
          formData.append("beforePhotoMimeType", beforePhoto.type)
        } catch (error) {
          console.error("Error converting before photo:", error)
        }
      }

      // Handle after photo upload
      if (afterPhoto) {
        try {
          const base64Data = await convertFileToBase64(afterPhoto)
          formData.append("afterPhotoFile", base64Data)
          formData.append("afterPhotoFileName", afterPhoto.name)
          formData.append("afterPhotoMimeType", afterPhoto.type)
        } catch (error) {
          console.error("Error converting after photo:", error)
        }
      }

      // Handle bilty upload
      if (biltyUpload) {
        try {
          const base64Data = await convertFileToBase64(biltyUpload)
          formData.append("biltyFile", base64Data)
          formData.append("biltyFileName", biltyUpload.name)
          formData.append("biltyMimeType", biltyUpload.type)
        } catch (error) {
          console.error("Error converting bilty file:", error)
        }
      }

      const rowData = new Array(110).fill("") // Increased array size to accommodate new columns

      // Add today's date to BU column (index 72)
      const today = new Date();

      const formattedDate = `${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()} ` +
                            `${today.getHours()}:${today.getMinutes()}:${today.getSeconds()}`;
      
      rowData[71] = formattedDate

      // Add new warehouse data to columns BZ to CD (indexes 77-81)
      rowData[76] = transporterName // Column BZ
      rowData[77] = transporterContact // Column CA
      rowData[78] = biltyNumber // Column CB
      rowData[79] = totalCharges // Column CC
      rowData[80] = warehouseRemarks // Column CD

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
    setBeforePhoto(null)
    setAfterPhoto(null)
    setBiltyUpload(null)
    // Reset new form fields
    setTransporterName("")
    setTransporterContact("")
    setBiltyNumber("")
    setTotalCharges("")
    setWarehouseRemarks("")
    setIsDialogOpen(true)
  }

  const handleSubmit = async () => {
    if (!selectedOrder) return

    const order = pendingOrders.find((o) => o.id === selectedOrder)
    if (!order) {
      // Fallback to legacy orders
      const warehouseData = {
        processedAt: new Date().toISOString(),
        processedBy: "Current User",
      }

      updateOrder(selectedOrder, {
        status: "warehouse-processed",
        warehouseData,
      })

      setIsDialogOpen(false)
      setSelectedOrder("")
      return
    }

    const result = await updateOrderStatus(order)

    if (result.success) {
      setIsDialogOpen(false)
      setSelectedOrder("")
      let message = `Warehouse processing for order ${selectedOrder} has been completed successfully`
      if (result.fileUrls) {
        message += "\n\nFiles uploaded to Google Drive:"
        if (result.fileUrls.beforePhotoUrl) message += "\n- Before photo"
        if (result.fileUrls.afterPhotoUrl) message += "\n- After photo"
        if (result.fileUrls.biltyUrl) message += "\n- Bilty document"
      }
      alert(message)
    } else {
      alert(`Error processing warehouse operation: ${result.error}`)
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
          <h1 className="text-3xl font-bold tracking-tight">Warehouse</h1>
          <p className="text-muted-foreground">Manage warehouse operations and documentation</p>
        </div>

        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending">Pending ({pendingOrders.length})</TabsTrigger>
            <TabsTrigger value="history">History ({historyOrders.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Pending Warehouse Operations</CardTitle>
                <CardDescription>Orders waiting for warehouse processing</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order Number</TableHead>
                        <TableHead>Company Name</TableHead>
                        <TableHead>Invoice Number</TableHead>
                        <TableHead>Billing Address</TableHead>
                        <TableHead>Shipping Address</TableHead>
                        <TableHead>Transport Mode</TableHead>
                        <TableHead>Destination</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingOrders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">{order.id}</TableCell>
                          <TableCell>{order.companyName}</TableCell>
                          <TableCell>{order.invoiceNumber || "N/A"}</TableCell>
                          <TableCell className="max-w-[150px] truncate">{order.billingAddress || "N/A"}</TableCell>
                          <TableCell className="max-w-[150px] truncate">{order.shippingAddress || "N/A"}</TableCell>
                          <TableCell>{order.transportMode}</TableCell>
                          <TableCell>{order.destination}</TableCell>
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
                <CardTitle>Warehouse History</CardTitle>
                <CardDescription>Previously processed warehouse operations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order Number</TableHead>
                        <TableHead>Company Name</TableHead>
                        <TableHead>Invoice Number</TableHead>
                        <TableHead>Billing Address</TableHead>
                        <TableHead>Shipping Address</TableHead>
                        <TableHead>Transport Mode</TableHead>
                        <TableHead>Destination</TableHead>
                        <TableHead>Processed Date</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {historyOrders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">{order.id}</TableCell>
                          <TableCell>{order.companyName}</TableCell>
                          <TableCell>{order.invoiceNumber || "N/A"}</TableCell>
                          <TableCell className="max-w-[150px] truncate">{order.billingAddress || "N/A"}</TableCell>
                          <TableCell className="max-w-[150px] truncate">{order.shippingAddress || "N/A"}</TableCell>
                          <TableCell>{order.transportMode}</TableCell>
                          <TableCell>{order.destination}</TableCell>
                          <TableCell>{order.warehouseProcessedDate}</TableCell>
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
              <DialogTitle>Warehouse Processing</DialogTitle>
              <DialogDescription>Upload warehouse documentation and enter processing details</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="orderNumber">Order Number</Label>
                <Input id="orderNumber" value={selectedOrder} disabled />
              </div>

              {/* New Input Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="transporterName">Transporter/Courier/Flight-Person Name</Label>
                  <Input
                    id="transporterName"
                    value={transporterName}
                    onChange={(e) => setTransporterName(e.target.value)}
                    placeholder="Enter transporter name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="transporterContact">Transporter/Courier/Flight-Person Contact No.</Label>
                  <Input
                    id="transporterContact"
                    value={transporterContact}
                    onChange={(e) => setTransporterContact(e.target.value)}
                    placeholder="Enter contact number"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="biltyNumber">Transporter/Courier/Flight-Bilty No./Docket No.</Label>
                  <Input
                    id="biltyNumber"
                    value={biltyNumber}
                    onChange={(e) => setBiltyNumber(e.target.value)}
                    placeholder="Enter bilty/docket number"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="totalCharges">Total Charges</Label>
                  <Input
                    id="totalCharges"
                    value={totalCharges}
                    onChange={(e) => setTotalCharges(e.target.value)}
                    placeholder="Enter total charges"
                    type="number"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="warehouseRemarks">Warehouse Remarks</Label>
                <Textarea
                  id="warehouseRemarks"
                  value={warehouseRemarks}
                  onChange={(e) => setWarehouseRemarks(e.target.value)}
                  placeholder="Enter warehouse remarks"
                  rows={3}
                />
              </div>

              {/* File Upload Section */}
              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">File Uploads</h4>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="beforePhoto">Before Photo Upload</Label>
                    <Input
                      id="beforePhoto"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setBeforePhoto(e.target.files?.[0] || null)}
                    />
                    {beforePhoto && <p className="text-sm text-muted-foreground">Selected: {beforePhoto.name}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="afterPhoto">After Photo Upload</Label>
                    <Input
                      id="afterPhoto"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setAfterPhoto(e.target.files?.[0] || null)}
                    />
                    {afterPhoto && <p className="text-sm text-muted-foreground">Selected: {afterPhoto.name}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="biltyUpload">Bilty Upload</Label>
                    <Input
                      id="biltyUpload"
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => setBiltyUpload(e.target.files?.[0] || null)}
                    />
                    {biltyUpload && <p className="text-sm text-muted-foreground">Selected: {biltyUpload.name}</p>}
                  </div>
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
              <DialogTitle>Warehouse Details</DialogTitle>
              <DialogDescription>View warehouse operation details</DialogDescription>
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
                    <Label>Bill Number</Label>
                    <p className="text-sm">{viewOrder.invoiceNumber || "N/A"}</p>
                  </div>
                  <div>
                    <Label>Transport Mode</Label>
                    <p className="text-sm">{viewOrder.transportMode}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Processed Date</Label>
                    <p className="text-sm">{viewOrder.warehouseProcessedDate || "N/A"}</p>
                  </div>
                  <div>
                    <Label>Destination</Label>
                    <p className="text-sm">{viewOrder.destination}</p>
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
