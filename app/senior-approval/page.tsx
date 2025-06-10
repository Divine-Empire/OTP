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

export default function SeniorApprovalPage() {
  const { orders, updateOrder } = useData()
  const [selectedOrder, setSelectedOrder] = useState<string>("")
  const [approvalStatus, setApprovalStatus] = useState<string>("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const pendingOrders = orders.filter((order) => order.status === "inventory-checked")
  const processedOrders = orders.filter((order) => order.approvalData)

  const handleProcess = (orderId: string) => {
    setSelectedOrder(orderId)
    setApprovalStatus("")
    setIsDialogOpen(true)
  }

  const handleSubmit = () => {
    if (!selectedOrder || !approvalStatus) return

    const approvalData = {
      approvedBy: approvalStatus,
      approvalDate: new Date().toISOString(),
      processedAt: new Date().toISOString(),
      processedBy: "Current User",
    }

    updateOrder(selectedOrder, {
      status: "senior-approved",
      approvalData,
    })

    setIsDialogOpen(false)
    setSelectedOrder("")
  }

  const handleView = (order: any) => {
    console.log("View order:", order)
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Senior Approval</h1>
          <p className="text-muted-foreground">Review and approve orders after inventory check</p>
        </div>

        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending">Pending ({pendingOrders.length})</TabsTrigger>
            <TabsTrigger value="history">History ({processedOrders.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Pending Approvals</CardTitle>
                <CardDescription>Orders waiting for senior approval</CardDescription>
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
                        <TableHead>Inventory Status</TableHead>
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
                            <Badge
                              variant={
                                order.inventoryData?.availabilityStatus === "Available"
                                  ? "default"
                                  : order.inventoryData?.availabilityStatus === "Partial"
                                    ? "secondary"
                                    : "destructive"
                              }
                            >
                              {order.inventoryData?.availabilityStatus || "Unknown"}
                            </Badge>
                          </TableCell>
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
                <CardTitle>Approval History</CardTitle>
                <CardDescription>Previously processed approvals</CardDescription>
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
                        <TableHead>Approval Status</TableHead>
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
                            <Badge
                              variant={order.approvalData?.approvalStatus === "Approved" ? "default" : "destructive"}
                            >
                              {order.approvalData?.approvalStatus}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={order.status === "senior-approved" ? "default" : "destructive"}>
                              {order.status}
                            </Badge>
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

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Senior Approval</DialogTitle>
              <DialogDescription>Review and approve the order</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="orderNo">Order No.</Label>
                <Input id="orderNo" value={selectedOrder} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="approval">Approval Status *</Label>
                <Select value={approvalStatus} onValueChange={setApprovalStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Approver" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="KISHAN PATEL">KISHAN PATEL</SelectItem>
                    <SelectItem value="SHASHANK SIR">SHASHANK SIR</SelectItem>
                    <SelectItem value="NEERAJ SIR">NEERAJ SIR</SelectItem>
                    <SelectItem value="PRASANNA SIR">PRASANNA SIR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={!approvalStatus}>
                  Submit
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  )
}
