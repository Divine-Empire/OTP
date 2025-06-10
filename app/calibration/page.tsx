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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye } from "lucide-react"

export default function CalibrationPage() {
  const { orders, updateOrder } = useData()
  const [selectedOrder, setSelectedOrder] = useState<string>("")
  const [activeSection, setActiveSection] = useState<"LAB" | "AUTOLEVEL" | "TOTAL STATION">("LAB")
  const [calibrationDate, setCalibrationDate] = useState("")
  const [calibrationPeriod, setCalibrationPeriod] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [viewOrder, setViewOrder] = useState<any>(null)

  // Update the pending orders filter to show orders from material-received status
  const pendingOrders = orders.filter(
    (order) => order.status === "material-received" && order.dispatchData?.calibrationRequired === "YES",
  )
  const processedOrders = orders.filter((order) => order.calibrationData)

  const handleProcess = (orderId: string, section: "LAB" | "AUTOLEVEL" | "TOTAL STATION") => {
    setSelectedOrder(orderId)
    setActiveSection(section)
    setCalibrationDate("")
    setCalibrationPeriod(section === "LAB" ? "" : "12") // Auto-set period for AUTOLEVEL and TOTAL STATION
    setIsDialogOpen(true)
  }

  const calculateDueDate = (calibrationDate: string, period: string) => {
    if (!calibrationDate || !period) return ""
    const date = new Date(calibrationDate)
    date.setMonth(date.getMonth() + Number.parseInt(period))
    return date.toISOString().split("T")[0]
  }

  const handleSubmit = () => {
    if (!selectedOrder || !calibrationDate || !calibrationPeriod) return

    const dueDate = calculateDueDate(calibrationDate, calibrationPeriod)

    const calibrationData = {
      section: activeSection,
      calibrationDate,
      calibrationPeriod: Number.parseInt(calibrationPeriod),
      dueDate,
      processedAt: new Date().toISOString(),
      processedBy: "Current User",
    }

    updateOrder(selectedOrder, {
      status: "calibration-completed",
      calibrationData,
    })

    setIsDialogOpen(false)
    setSelectedOrder("")
  }

  const handleView = (order: any) => {
    setViewOrder(order)
    setViewDialogOpen(true)
  }

  const renderTable = (title: string, description: string, section: "LAB" | "AUTOLEVEL" | "TOTAL STATION") => (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order Number</TableHead>
                <TableHead>Company Name</TableHead>
                <TableHead>Bill Copy</TableHead>
                <TableHead>Bill Number</TableHead>
                <TableHead>Follow-up</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingOrders
                .filter((order) => order.dispatchData?.calibrationType === section)
                .map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>{order.companyName}</TableCell>
                    <TableCell>
                      <Badge variant="outline">Available</Badge>
                    </TableCell>
                    <TableCell>{order.invoiceData?.invoiceNumber || "N/A"}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">Pending</Badge>
                    </TableCell>
                    <TableCell>
                      <Button size="sm" onClick={() => handleProcess(order.id, section)}>
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
  )

  const renderHistoryTable = (title: string, description: string, section: "LAB" | "AUTOLEVEL" | "TOTAL STATION") => (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order Number</TableHead>
                <TableHead>Company Name</TableHead>
                <TableHead>Bill Copy</TableHead>
                <TableHead>Bill Number</TableHead>
                <TableHead>Calibration Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Follow-up</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {processedOrders
                .filter((order) => order.calibrationData?.section === section)
                .map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>{order.companyName}</TableCell>
                    <TableCell>
                      <Badge variant="outline">Available</Badge>
                    </TableCell>
                    <TableCell>{order.invoiceData?.invoiceNumber || "N/A"}</TableCell>
                    <TableCell>
                      {order.calibrationData?.calibrationDate
                        ? new Date(order.calibrationData.calibrationDate).toLocaleDateString()
                        : "N/A"}
                    </TableCell>
                    <TableCell>
                      {order.calibrationData?.dueDate
                        ? new Date(order.calibrationData.dueDate).toLocaleDateString()
                        : "N/A"}
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
  )

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Calibration Certificate Required</h1>
          <p className="text-muted-foreground">Manage calibration certificates for different equipment types</p>
        </div>

        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending">Pending ({pendingOrders.length})</TabsTrigger>
            <TabsTrigger value="history">History ({processedOrders.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            <Tabs defaultValue="LAB" className="space-y-4">
              <TabsList>
                <TabsTrigger value="LAB">LAB</TabsTrigger>
                <TabsTrigger value="AUTOLEVEL">AUTOLEVEL</TabsTrigger>
                <TabsTrigger value="TOTAL STATION">TOTAL STATION</TabsTrigger>
              </TabsList>

              <TabsContent value="LAB">
                {renderTable("LAB Calibration", "Pending LAB calibration certificates", "LAB")}
              </TabsContent>

              <TabsContent value="AUTOLEVEL">
                {renderTable("AUTOLEVEL Calibration", "Pending AUTOLEVEL calibration certificates", "AUTOLEVEL")}
              </TabsContent>

              <TabsContent value="TOTAL STATION">
                {renderTable(
                  "TOTAL STATION Calibration",
                  "Pending TOTAL STATION calibration certificates",
                  "TOTAL STATION",
                )}
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <Tabs defaultValue="LAB" className="space-y-4">
              <TabsList>
                <TabsTrigger value="LAB">LAB</TabsTrigger>
                <TabsTrigger value="AUTOLEVEL">AUTOLEVEL</TabsTrigger>
                <TabsTrigger value="TOTAL STATION">TOTAL STATION</TabsTrigger>
              </TabsList>

              <TabsContent value="LAB">
                {renderHistoryTable("LAB Calibration History", "Completed LAB calibration certificates", "LAB")}
              </TabsContent>

              <TabsContent value="AUTOLEVEL">
                {renderHistoryTable(
                  "AUTOLEVEL Calibration History",
                  "Completed AUTOLEVEL calibration certificates",
                  "AUTOLEVEL",
                )}
              </TabsContent>

              <TabsContent value="TOTAL STATION">
                {renderHistoryTable(
                  "TOTAL STATION Calibration History",
                  "Completed TOTAL STATION calibration certificates",
                  "TOTAL STATION",
                )}
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>

        {/* Process Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Upload {activeSection} Calibration Certificate</DialogTitle>
              <DialogDescription>Upload calibration certificate with details</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="orderNumber">Order Number</Label>
                <Input id="orderNumber" value={selectedOrder} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="section">Section</Label>
                <Input id="section" value={activeSection} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="certificate">Certificate Attachment</Label>
                <Input id="certificate" type="file" accept=".pdf,.doc,.docx,image/*" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="calibrationDate">Calibration Date</Label>
                <Input
                  id="calibrationDate"
                  type="date"
                  value={calibrationDate}
                  onChange={(e) => setCalibrationDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="calibrationPeriod">Calibration Period (Months)</Label>
                {activeSection === "LAB" ? (
                  <Select value={calibrationPeriod} onValueChange={setCalibrationPeriod}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="6">6 Months</SelectItem>
                      <SelectItem value="12">12 Months</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Input id="calibrationPeriod" value="12 Months" disabled />
                )}
              </div>
              {calibrationDate && calibrationPeriod && (
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date (Auto-calculated)</Label>
                  <Input id="dueDate" value={calculateDueDate(calibrationDate, calibrationPeriod)} disabled />
                </div>
              )}
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit} disabled={!calibrationDate || !calibrationPeriod}>
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
              <DialogTitle>Calibration Certificate Details</DialogTitle>
              <DialogDescription>View calibration certificate information</DialogDescription>
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
                {viewOrder.calibrationData && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Section</Label>
                        <p className="text-sm">{viewOrder.calibrationData.section}</p>
                      </div>
                      <div>
                        <Label>Calibration Period</Label>
                        <p className="text-sm">{viewOrder.calibrationData.calibrationPeriod} Months</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Calibration Date</Label>
                        <p className="text-sm">
                          {new Date(viewOrder.calibrationData.calibrationDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <Label>Due Date</Label>
                        <p className="text-sm">{new Date(viewOrder.calibrationData.dueDate).toLocaleDateString()}</p>
                      </div>
                    </div>
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
