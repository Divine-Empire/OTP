"use client"

import { useState } from "react"
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

export default function WarehouseMaterialPage() {
  const { orders, updateOrder } = useData()
  const [selectedOrder, setSelectedOrder] = useState<string>("")
  const [materialReceived, setMaterialReceived] = useState<string>("")
  const [installationRequired, setInstallationRequired] = useState<string>("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [viewOrder, setViewOrder] = useState<any>(null)
  const [transporterFollowup, setTransporterFollowup] = useState<string>("")

  const pendingOrders = orders.filter((order) => order.status === "warehouse-processed")
  const processedOrders = orders.filter((order) => order.materialRcvdData)

  const handleProcess = (orderId: string) => {
    setSelectedOrder(orderId)
    setMaterialReceived("")
    setInstallationRequired("")
    setTransporterFollowup("")
    setIsDialogOpen(true)
  }

  // Update the handleSubmit function to properly set the next status
  const handleSubmit = () => {
    if (!selectedOrder || !materialReceived || !installationRequired) return

    const materialRcvdData = {
      materialReceived,
      installationRequired,
      processedAt: new Date().toISOString(),
      processedBy: "Current User",
      transporterFollowup,
    }

    // Update the status to move to calibration step
    updateOrder(selectedOrder, {
      status: "material-received",
      materialRcvdData,
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
          <h1 className="text-3xl font-bold tracking-tight">Warehouse (Material RCVD)</h1>
          <p className="text-muted-foreground">Confirm material receipt and installation requirements</p>
        </div>

        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending">Pending ({pendingOrders.length})</TabsTrigger>
            <TabsTrigger value="history">History ({processedOrders.length})</TabsTrigger>
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
                        <TableHead>Order Number</TableHead>
                        <TableHead>Company Name</TableHead>
                        <TableHead>Bill Number</TableHead>
                        <TableHead>Bilty</TableHead>
                        <TableHead>Follow-up</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingOrders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">{order.id}</TableCell>
                          <TableCell>{order.companyName}</TableCell>
                          <TableCell>{order.invoiceData?.invoiceNumber || "N/A"}</TableCell>
                          <TableCell>
                            <Badge variant="outline">Available</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">Pending</Badge>
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
                        <TableHead>Bill Number</TableHead>
                        <TableHead>Bilty</TableHead>
                        <TableHead>Follow-up</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {processedOrders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">{order.id}</TableCell>
                          <TableCell>{order.companyName}</TableCell>
                          <TableCell>{order.invoiceData?.invoiceNumber || "N/A"}</TableCell>
                          <TableCell>
                            <Badge variant="outline">Available</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="default">Completed</Badge>
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
                <Label htmlFor="transporterFollowup">Transporter Followup</Label>
                <Input
                  id="transporterFollowup"
                  placeholder="Enter transporter followup details"
                  value={transporterFollowup}
                  onChange={(e) => setTransporterFollowup(e.target.value)}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={!materialReceived || !installationRequired}>
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
                      <Label>Transporter Followup</Label>
                      <p className="text-sm">{viewOrder.materialRcvdData.transporterFollowup}</p>
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
