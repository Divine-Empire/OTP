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
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Eye } from "lucide-react"

const checklistItems = [
  "Price as per Quotation Check",
  "Quantity as per Quotation Check",
  "Technical as per Quotation Check",
  "Payment Terms Check",
  "Freight Check",
  "Material Availability Check",
  "GST Check",
  "Customer Details Check",
]

export default function OrderAcceptablePage() {
  const { orders, updateOrder } = useData()
  const [selectedOrder, setSelectedOrder] = useState<string>("")
  const [isAcceptable, setIsAcceptable] = useState<string>("")
  const [checkedItems, setCheckedItems] = useState<string[]>([])
  const [remarks, setRemarks] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [viewOrder, setViewOrder] = useState<any>(null)

  const pendingOrders = orders.filter((order) => order.status === "pending")
  const processedOrders = orders.filter((order) => order.acceptanceData)

  const handleProcess = (orderId: string) => {
    setSelectedOrder(orderId)
    setIsAcceptable("")
    setCheckedItems([])
    setRemarks("")
    setIsDialogOpen(true)
  }

  const handleSubmit = () => {
    if (!selectedOrder || !isAcceptable) return

    const acceptanceData = {
      isAcceptable,
      checklist: isAcceptable === "Yes" ? checkedItems : [],
      remarks,
      processedAt: new Date().toISOString(),
      processedBy: "Current User",
    }

    updateOrder(selectedOrder, {
      status: isAcceptable === "Yes" ? "accepted" : "cancelled",
      acceptanceData,
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
          <h1 className="text-3xl font-bold tracking-tight">Order Acceptable</h1>
          <p className="text-muted-foreground">Review and process incoming orders</p>
        </div>

        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending">Pending ({pendingOrders.length})</TabsTrigger>
            <TabsTrigger value="history">History ({processedOrders.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Pending Orders</CardTitle>
                <CardDescription>Orders waiting for acceptance review</CardDescription>
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
                        <TableHead>Billing Address</TableHead>
                        <TableHead>Shipping Address</TableHead>
                        <TableHead>Quotation Copy</TableHead>
                        <TableHead>Acceptance Copy</TableHead>
                        <TableHead>Conveyed For Registration Form</TableHead>
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
                          <TableCell className="max-w-[200px] truncate">{order.billingAddress}</TableCell>
                          <TableCell className="max-w-[200px] truncate">{order.shippingAddress}</TableCell>
                          <TableCell>
                            <Badge variant={order.quotationCopy === "Available" ? "default" : "secondary"}>
                              {order.quotationCopy}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={order.acceptanceCopy === "Available" ? "default" : "secondary"}>
                              {order.acceptanceCopy}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={order.conveyedForRegistration === "Yes" ? "default" : "destructive"}>
                              {order.conveyedForRegistration}
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
                <CardTitle>Order History</CardTitle>
                <CardDescription>Previously processed orders</CardDescription>
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
                        <TableHead>Billing Address</TableHead>
                        <TableHead>Shipping Address</TableHead>
                        <TableHead>Quotation Copy</TableHead>
                        <TableHead>Acceptance Copy</TableHead>
                        <TableHead>Conveyed For Registration Form</TableHead>
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
                          <TableCell className="max-w-[200px] truncate">{order.billingAddress}</TableCell>
                          <TableCell className="max-w-[200px] truncate">{order.shippingAddress}</TableCell>
                          <TableCell>
                            <Badge variant={order.quotationCopy === "Available" ? "default" : "secondary"}>
                              {order.quotationCopy}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={order.acceptanceCopy === "Available" ? "default" : "secondary"}>
                              {order.acceptanceCopy}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={order.conveyedForRegistration === "Yes" ? "default" : "destructive"}>
                              {order.conveyedForRegistration}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={order.status === "accepted" ? "default" : "destructive"}>
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

        {/* Process Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Process Order Acceptable</DialogTitle>
              <DialogDescription>Review and process the order acceptance</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="orderNo">Order No.</Label>
                <Input id="orderNo" value={selectedOrder} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="acceptable">Is Order Acceptable? *</Label>
                <Select value={isAcceptable} onValueChange={setIsAcceptable}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Yes">Yes</SelectItem>
                    <SelectItem value="Order Cancel">Order Cancel</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {isAcceptable === "Yes" && (
                <div className="space-y-2">
                  <Label>Order Acceptance Checklist</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {checklistItems.map((item) => (
                      <div key={item} className="flex items-center space-x-2">
                        <Checkbox
                          id={item}
                          checked={checkedItems.includes(item)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setCheckedItems([...checkedItems, item])
                            } else {
                              setCheckedItems(checkedItems.filter((i) => i !== item))
                            }
                          }}
                        />
                        <Label htmlFor={item} className="text-sm">
                          {item}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="remarks">Remarks</Label>
                <Textarea
                  id="remarks"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Enter any remarks..."
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={!isAcceptable}>
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
              <DialogTitle>Order Details</DialogTitle>
              <DialogDescription>View order information and processing details</DialogDescription>
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
                    <Label>Amount</Label>
                    <p className="text-sm">₹{viewOrder.amount.toLocaleString()}</p>
                  </div>
                </div>
                {viewOrder.acceptanceData && (
                  <div>
                    <Label>Acceptance Status</Label>
                    <p className="text-sm">{viewOrder.acceptanceData.isAcceptable}</p>
                    {viewOrder.acceptanceData.remarks && (
                      <div className="mt-2">
                        <Label>Remarks</Label>
                        <p className="text-sm">{viewOrder.acceptanceData.remarks}</p>
                      </div>
                    )}
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
