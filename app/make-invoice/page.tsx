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
import { Input } from "@/components/ui/input"
import { Eye } from "lucide-react"

export default function MakeInvoicePage() {
  const { orders, updateOrder } = useData()
  const [selectedOrder, setSelectedOrder] = useState<string>("")
  const [invoiceNumber, setInvoiceNumber] = useState("")
  const [qty, setQty] = useState<number>(0)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [viewOrder, setViewOrder] = useState<any>(null)

  const pendingOrders = orders.filter((order) => order.status === "dispatch-processed")
  const processedOrders = orders.filter((order) => order.invoiceData)

  const handleProcess = (orderId: string) => {
    const order = orders.find((o) => o.id === orderId)
    setSelectedOrder(orderId)
    setInvoiceNumber("")
    setQty(order?.quantity || 0)
    setIsDialogOpen(true)
  }

  const handleSubmit = () => {
    if (!selectedOrder || !invoiceNumber) return

    const invoiceData = {
      invoiceNumber,
      qty,
      processedAt: new Date().toISOString(),
      processedBy: "Current User",
    }

    updateOrder(selectedOrder, {
      status: "invoice-created",
      invoiceData,
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
          <h1 className="text-3xl font-bold tracking-tight">Make Invoice (Accounts Part)</h1>
          <p className="text-muted-foreground">Create invoices for processed orders</p>
        </div>

        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending">Pending ({pendingOrders.length})</TabsTrigger>
            <TabsTrigger value="history">History ({processedOrders.length})</TabsTrigger>
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
                        <TableHead>Quotation Copy</TableHead>
                        <TableHead>Acceptance Copy</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingOrders.map((order) => (
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
                          <TableCell>{order.quantity}</TableCell>
                          <TableCell>{order.quantity}</TableCell>
                          <TableCell>
                            <Badge variant="outline">Available</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">Available</Badge>
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
                        <TableHead>Quotation Copy</TableHead>
                        <TableHead>Acceptance Copy</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {processedOrders.map((order) => (
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
                          <TableCell>{order.invoiceData?.qty || order.quantity}</TableCell>
                          <TableCell>
                            <Badge variant="outline">Available</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">Available</Badge>
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
                <Label htmlFor="qty">QTY</Label>
                <Input
                  id="qty"
                  type="number"
                  value={qty}
                  onChange={(e) => setQty(Number.parseInt(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="invoice">Invoice (Attachment)</Label>
                <Input id="invoice" type="file" accept=".pdf,.doc,.docx" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ewaybill">E-Way Bill (Attachment)</Label>
                <Input id="ewaybill" type="file" accept=".pdf,.doc,.docx" />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={!invoiceNumber}>
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
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  )
}
