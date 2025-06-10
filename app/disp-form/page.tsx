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
import { Eye, Plus, Trash2 } from "lucide-react"

export default function DispFormPage() {
  const { orders, updateOrder } = useData()
  const [selectedOrder, setSelectedOrder] = useState<string>("")
  const [calibrationRequired, setCalibrationRequired] = useState<string>("")
  const [calibrationType, setCalibrationType] = useState<string>("")
  const [installationRequired, setInstallationRequired] = useState<string>("")
  const [items, setItems] = useState<Array<{ name: string; qty: number }>>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [viewOrder, setViewOrder] = useState<any>(null)

  const pendingOrders = orders.filter((order) => order.status === "senior-approved")
  const processedOrders = orders.filter((order) => order.dispatchData)

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

  const handleSubmit = () => {
    if (!selectedOrder || !calibrationRequired || !installationRequired) return

    const dispatchData = {
      calibrationRequired,
      calibrationType: calibrationRequired === "YES" ? calibrationType : "",
      installationRequired,
      items,
      processedAt: new Date().toISOString(),
      processedBy: "Current User",
    }

    updateOrder(selectedOrder, {
      status: "dispatch-processed",
      dispatchData,
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
