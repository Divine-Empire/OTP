"use client"

import { useState } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { useData } from "@/components/data-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Eye } from "lucide-react"

export default function WarehousePage() {
  const { orders, updateOrder } = useData()
  const [selectedOrder, setSelectedOrder] = useState<string>("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [viewOrder, setViewOrder] = useState<any>(null)

  // Only show orders that have PI created
  const pendingOrders = orders.filter((order) => order.status === "pi-created")
  const processedOrders = orders.filter((order) => order.warehouseData)

  const handleProcess = (orderId: string) => {
    setSelectedOrder(orderId)
    setIsDialogOpen(true)
  }

  const handleSubmit = () => {
    if (!selectedOrder) return

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
  }

  const handleView = (order: any) => {
    setViewOrder(order)
    setViewDialogOpen(true)
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
            <TabsTrigger value="history">History ({processedOrders.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Pending Warehouse Operations</CardTitle>
                <CardDescription>Orders waiting for warehouse processing (after PI creation)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order Number</TableHead>
                        <TableHead>Company Name</TableHead>
                        <TableHead>Bill Number</TableHead>
                        <TableHead>Address</TableHead>
                        <TableHead>Transport Mode</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingOrders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">{order.id}</TableCell>
                          <TableCell>{order.companyName}</TableCell>
                          <TableCell>{order.invoiceData?.invoiceNumber || "N/A"}</TableCell>
                          <TableCell className="max-w-[200px] truncate">
                            {order.billingAddress || order.shippingAddress || "N/A"}
                          </TableCell>
                          <TableCell>{order.transportMode}</TableCell>
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
                        <TableHead>Bill Number</TableHead>
                        <TableHead>Address</TableHead>
                        <TableHead>Transport Mode</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {processedOrders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">{order.id}</TableCell>
                          <TableCell>{order.companyName}</TableCell>
                          <TableCell>{order.invoiceData?.invoiceNumber || "N/A"}</TableCell>
                          <TableCell className="max-w-[200px] truncate">
                            {order.billingAddress || order.shippingAddress || "N/A"}
                          </TableCell>
                          <TableCell>{order.transportMode}</TableCell>
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
              <DialogTitle>Warehouse Processing</DialogTitle>
              <DialogDescription>Upload warehouse documentation and photos</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="orderNumber">Order Number</Label>
                <Input id="orderNumber" value={selectedOrder} disabled />
              </div>

              <div className="space-y-2">
                <Label htmlFor="beforePhoto">Before Photo Upload</Label>
                <Input id="beforePhoto" type="file" accept="image/*" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="afterPhoto">After Photo Upload</Label>
                <Input id="afterPhoto" type="file" accept="image/*" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="biltyUpload">Bilty Upload</Label>
                <Input id="biltyUpload" type="file" accept="image/*,.pdf" />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit}>Submit</Button>
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
                    <p className="text-sm">{viewOrder.invoiceData?.invoiceNumber || "N/A"}</p>
                  </div>
                  <div>
                    <Label>Transport Mode</Label>
                    <p className="text-sm">{viewOrder.transportMode}</p>
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
