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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Eye, RefreshCw } from "lucide-react"

export default function WarehouseMaterialPage() {
  const { orders, updateOrder } = useData()
  const [selectedOrder, setSelectedOrder] = useState<string>("")
  const [materialReceived, setMaterialReceived] = useState<string>("")
  const [installationRequired, setInstallationRequired] = useState<string>("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [viewOrder, setViewOrder] = useState<any>(null)
  const [transporterFollowup, setTransporterFollowup] = useState<string>("")

  // New state for Google Sheets integration
  const [pendingOrders, setPendingOrders] = useState<any[]>([])
  const [historyOrders, setHistoryOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  const APPS_SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbyzW8-RldYx917QpAfO4kY-T8_ntg__T0sbr7Yup2ZTVb1FC5H1g6TYuJgAU6wTquVM/exec"
  const SHEET_ID = "1yEsh4yzyvglPXHxo-5PT70VpwVJbxV7wwH8rpU1RFJA"
  const SHEET_NAME = "DISPATCH-DELIVERY"

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
            const ceColumn = row.c[81] ? row.c[81].v : null // Column CE (index 82)
            const cfColumn = row.c[82] ? row.c[82].v : null // Column CF (index 83)

            // Only include rows where CE is not null and CF is null
            if (ceColumn && !cfColumn) {
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
                warehouseProcessedDate: ceColumn, // Column CE contains the warehouse processing date
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
            const ceColumn = row.c[81] ? row.c[81].v : null // Column CE (index 82)
            const cfColumn = row.c[82] ? row.c[82].v : null // Column CF (index 83)

            // Only include rows where both CE and CF are not null
            if (ceColumn && cfColumn) {
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
                warehouseProcessedDate: ceColumn, // Column CE contains the warehouse processing date
                materialProcessedDate: cfColumn, // Column CF contains the material processing date
                fullRowData: row.c,
                materialRcvdData: {
                  materialReceived: row.c[84] ? row.c[84].v : "", // Column CH (index 85)
                  installationRequired: row.c[85] ? row.c[85].v : "", // Column CI (index 86)
                  transporterFollowup: row.c[86] ? row.c[86].v : "", // Column CJ (index 87)
                  processedAt: cfColumn,
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

  // Legacy orders from useData hook (keep for backward compatibility)
  const legacyPendingOrders = orders.filter((order) => order.status === "warehouse-processed")
  const legacyProcessedOrders = orders.filter((order) => order.materialRcvdData)

  const updateOrderStatus = async (order: any) => {
    try {
      setUploading(true)

      const formData = new FormData()
      formData.append("sheetName", SHEET_NAME)
      formData.append("action", "updateByOrderNoInColumnB")
      formData.append("orderNo", order.id)

      const rowData = new Array(110).fill("")

      // Add today's date to CF column (index 83)
      const today = new Date();

      const formattedDate = `${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()} ` +
                            `${today.getHours()}:${today.getMinutes()}:${today.getSeconds()}`;
      
      rowData[82] = formattedDate

      // Add material data to columns CH onwards (indexes 85-87)
      rowData[84] = materialReceived // Column CH
      rowData[86] = installationRequired // Column CI
      rowData[85] = transporterFollowup // Column CJ

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
        return { success: true }
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
    setMaterialReceived("")
    setInstallationRequired("")
    setTransporterFollowup("")
    setIsDialogOpen(true)
  }

  const handleSubmit = async () => {
    if (!selectedOrder || !materialReceived || !installationRequired) return

    const order = pendingOrders.find((o) => o.id === selectedOrder)
    if (!order) {
      // Fallback to legacy orders
      const materialRcvdData = {
        materialReceived,
        installationRequired,
        processedAt: new Date().toISOString(),
        processedBy: "Current User",
        transporterFollowup,
      }

      updateOrder(selectedOrder, {
        status: "material-received",
        materialRcvdData,
      })

      setIsDialogOpen(false)
      setSelectedOrder("")
      return
    }

    const result = await updateOrderStatus(order)

    if (result.success) {
      setIsDialogOpen(false)
      setSelectedOrder("")
      alert(`Material receipt processing for order ${selectedOrder} has been completed successfully`)
    } else {
      alert(`Error processing material receipt: ${result.error}`)
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
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">Warehouse (Material RCVD)</h1>
          <p className="text-muted-foreground">Confirm material receipt and installation requirements</p>
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
                <CardTitle>Pending Material Receipt</CardTitle>
                <CardDescription>Orders waiting for material receipt confirmation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Action</TableHead>
                        <TableHead>Order Number</TableHead>
                        <TableHead>Company Name</TableHead>
                        <TableHead>Invoice Number</TableHead>
                        <TableHead>Billing Address</TableHead>
                        <TableHead>Shipping Address</TableHead>
                        <TableHead>Transport Mode</TableHead>
                        <TableHead>Destination</TableHead>
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
                          <TableCell>{order.invoiceNumber || "N/A"}</TableCell>
                          <TableCell className="max-w-[150px] truncate">{order.billingAddress || "N/A"}</TableCell>
                          <TableCell className="max-w-[150px] truncate">{order.shippingAddress || "N/A"}</TableCell>
                          <TableCell>{order.transportMode}</TableCell>
                          <TableCell>{order.destination}</TableCell>
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
                <CardTitle>Material Receipt History</CardTitle>
                <CardDescription>Previously processed material receipts</CardDescription>
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
                          <TableCell>{order.materialProcessedDate}</TableCell>
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
              <DialogTitle>Material Receipt Confirmation</DialogTitle>
              <DialogDescription>Confirm material receipt and installation requirements</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="orderNumber">Order Number</Label>
                <Input id="orderNumber" value={selectedOrder} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="materialRcvd">Material RCVD</Label>
                <Select value={materialReceived} onValueChange={setMaterialReceived}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="installation">Installation Required</Label>
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
              <div className="space-y-2">
                <Label htmlFor="transporterFollowup">Reason</Label>
                <Input
                  id="transporterFollowup"
                  placeholder="Enter Reason details"
                  value={transporterFollowup}
                  onChange={(e) => setTransporterFollowup(e.target.value)}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={!materialReceived || !installationRequired || uploading}>
                  {uploading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
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
              <DialogTitle>Material Receipt Details</DialogTitle>
              <DialogDescription>View material receipt information</DialogDescription>
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
                    <p className="text-sm">{viewOrder.materialProcessedDate || "N/A"}</p>
                  </div>
                  <div>
                    <Label>Destination</Label>
                    <p className="text-sm">{viewOrder.destination}</p>
                  </div>
                </div>
                {viewOrder.materialRcvdData && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Material Received</Label>
                      <p className="text-sm">{viewOrder.materialRcvdData.materialReceived}</p>
                    </div>
                    <div>
                      <Label>Installation Required</Label>
                      <p className="text-sm">{viewOrder.materialRcvdData.installationRequired}</p>
                    </div>
                    <div>
                      <Label>Reason</Label>
                      <p className="text-sm">{viewOrder.materialRcvdData.transporterFollowup || "N/A"}</p>
                    </div>
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
