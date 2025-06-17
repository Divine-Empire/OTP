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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, RefreshCw } from "lucide-react"

export default function CalibrationPage() {
  const { orders, updateOrder } = useData()
  const [selectedOrder, setSelectedOrder] = useState<string>("")
  const [activeSection, setActiveSection] = useState<"LAB" | "TOTAL STATION">("LAB")
  const [calibrationDate, setCalibrationDate] = useState("")
  const [calibrationPeriod, setCalibrationPeriod] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [viewOrder, setViewOrder] = useState<any>(null)
  const [certificateFile, setCertificateFile] = useState<File | null>(null)

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
            const xColumn = row.c[23] ? row.c[23].v : null // Column X (index 23)
            const ckColumn = row.c[88] ? row.c[88].v : null // Column CK (index 88)
            const clColumn = row.c[89] ? row.c[89].v : null // Column CL (index 89)

            // Check if column X matches the calibration type and CK is not null and CL is null
            const isLabOrder = xColumn && xColumn.toLowerCase() === "lab" && ckColumn && !clColumn
            const isTotalStationOrder = xColumn && xColumn.toLowerCase() === "total station" && ckColumn && !clColumn

            if (isLabOrder || isTotalStationOrder) {
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
                invoiceNumber: row.c[66] ? row.c[66].v : "", // Column BO (invoice number)
                calibrationType: isLabOrder ? "LAB" : "TOTAL STATION", // Set based on column X value
                columnXValue: xColumn, // Store original column X value for reference
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
            const ckColumn = row.c[88] ? row.c[88].v : null // Column CK (index 88)
            const clColumn = row.c[89] ? row.c[89].v : null // Column CL (index 89)
  
            // Include all rows where CL is not null (processed)
            if (clColumn) {
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
                invoiceNumber: row.c[66] ? row.c[66].v : "",
                calibrationType: ckColumn || "UNKNOWN", // Default to UNKNOWN if not specified
                calibrationProcessedDate: clColumn,
                fullRowData: row.c,
                calibrationData: {
                  section: ckColumn || "UNKNOWN",
                  calibrationDate: row.c[91] ? row.c[91].v : "",
                  calibrationPeriod: row.c[92] ? row.c[92].v : "",
                  dueDate: row.c[93] ? row.c[93].v : "",
                  processedAt: clColumn,
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
  const legacyPendingOrders = orders.filter(
    (order) => order.status === "material-received" && order.dispatchData?.calibrationRequired === "YES",
  )
  const legacyProcessedOrders = orders.filter((order) => order.calibrationData)

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

      // Add calibration type parameter so Apps Script knows which columns to use
      formData.append("calibrationType", activeSection) // This will be either "LAB" or "TOTAL STATION"

      // Also add calibration date and period as separate parameters
      if (calibrationDate) {
        formData.append("calibrationDate", calibrationDate)
      }
      if (calibrationPeriod) {
        formData.append("calibrationPeriod", calibrationPeriod)
      }

      // Handle certificate file upload
      if (certificateFile) {
        try {
          const base64Data = await convertFileToBase64(certificateFile)
          formData.append("certificateFile", base64Data)
          formData.append("certificateFileName", certificateFile.name)
          formData.append("certificateMimeType", certificateFile.type)
        } catch (error) {
          console.error("Error converting certificate file:", error)
        }
      }

      const rowData = new Array(120).fill("")

      // Add today's date to CL column (index 89)
      const today = new Date()
      const formattedDate = `${String(today.getDate()).padStart(2, "0")}/${String(today.getMonth() + 1).padStart(2, "0")}/${today.getFullYear()}`
      rowData[89] = formattedDate

      // Remove these lines - Apps Script handles calibration data placement
      // rowData[91] = calibrationDate // Column CN
      // rowData[92] = calibrationPeriod // Column CO
      // rowData[93] = dueDate // Column CP

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

  const handleProcess = (orderId: string, section: "LAB" | "TOTAL STATION") => {
    setSelectedOrder(orderId)
    setActiveSection(section)
    setCalibrationDate("")
    setCalibrationPeriod(section === "LAB" ? "" : "12") // Auto-set period for TOTAL STATION
    setCertificateFile(null)
    setIsDialogOpen(true)
  }

  const calculateDueDate = (calibrationDate: string, period: string) => {
    if (!calibrationDate || !period) return ""
    const date = new Date(calibrationDate)
    date.setMonth(date.getMonth() + Number.parseInt(period))
    return date.toISOString().split("T")[0]
  }

  const handleSubmit = async () => {
    if (!selectedOrder || !calibrationDate || !calibrationPeriod) return

    const order = pendingOrders.find((o) => o.id === selectedOrder)
    if (!order) {
      // Fallback to legacy orders
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
      return
    }

    const result = await updateOrderStatus(order)

    if (result.success) {
      setIsDialogOpen(false)
      setSelectedOrder("")
      let message = `Calibration processing for order ${selectedOrder} has been completed successfully`
      if (result.fileUrls && result.fileUrls.certificateUrl) {
        message += "\n\nCertificate uploaded to Google Drive"
      }
      alert(message)
    } else {
      alert(`Error processing calibration: ${result.error}`)
    }
  }

  const handleView = (order: any) => {
    setViewOrder(order)
    setViewDialogOpen(true)
  }

  const renderTable = (title: string, description: string, section: "LAB" | "TOTAL STATION") => (
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
                <TableHead>Bill Number</TableHead>
                <TableHead>Billing Address</TableHead>
                <TableHead>Shipping Address</TableHead>
                <TableHead>Transport Mode</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingOrders
                .filter((order) => order.calibrationType === section)
                .map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>{order.companyName}</TableCell>
                    <TableCell>{order.invoiceNumber || "N/A"}</TableCell>
                    <TableCell className="max-w-[150px] truncate">{order.billingAddress || "N/A"}</TableCell>
                    <TableCell className="max-w-[150px] truncate">{order.shippingAddress || "N/A"}</TableCell>
                    <TableCell>{order.transportMode}</TableCell>
                    <TableCell>{order.destination}</TableCell>
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

  
  const renderHistoryTable = (title: string, description: string, section?: "LAB" | "TOTAL STATION") => (
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
                <TableHead>Calibration Type</TableHead>
                <TableHead>Bill Number</TableHead>
                <TableHead>Calibration Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Processed Date</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {historyOrders
                .filter(order => !section || order.calibrationType === section)
                .map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>{order.companyName}</TableCell>
                    <TableCell>{order.calibrationType || "UNKNOWN"}</TableCell>
                    <TableCell>{order.invoiceNumber || "N/A"}</TableCell>
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
                    <TableCell>{order.calibrationProcessedDate}</TableCell>
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
          <h1 className="text-3xl font-bold tracking-tight">Calibration Certificate Required</h1>
          <p className="text-muted-foreground">Manage calibration certificates for different equipment types</p>
        </div>

        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending">Pending ({pendingOrders.length})</TabsTrigger>
            <TabsTrigger value="history">History ({historyOrders.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            <Tabs defaultValue="LAB" className="space-y-4">
              <TabsList>
                <TabsTrigger value="LAB">LAB</TabsTrigger>
                <TabsTrigger value="TOTAL STATION">TOTAL STATION</TabsTrigger>
              </TabsList>

              <TabsContent value="LAB">
                {renderTable("LAB Calibration", "Pending LAB calibration certificates", "LAB")}
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
                <TabsTrigger value="TOTAL STATION">TOTAL STATION</TabsTrigger>
              </TabsList>

              <TabsContent value="LAB">
                {renderHistoryTable("LAB Calibration History", "Completed LAB calibration certificates", "LAB")}
              </TabsContent>

              <TabsContent value="TOTAL STATION">
                {renderHistoryTable(
                  "TOTAL STATION Calibration History",
                  "Completed TOTAL STATION calibration certificates",
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
                <Input
                  id="certificate"
                  type="file"
                  accept=".pdf,.doc,.docx,image/*"
                  onChange={(e) => setCertificateFile(e.target.files?.[0] || null)}
                />
                {certificateFile && <p className="text-sm text-muted-foreground">Selected: {certificateFile.name}</p>}
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
                <Button onClick={handleSubmit} disabled={!calibrationDate || !calibrationPeriod || uploading}>
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
                    <p className="text-sm">{viewOrder.calibrationProcessedDate || "N/A"}</p>
                  </div>
                  <div>
                    <Label>Destination</Label>
                    <p className="text-sm">{viewOrder.destination}</p>
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
                          {viewOrder.calibrationData.calibrationDate
                            ? new Date(viewOrder.calibrationData.calibrationDate).toLocaleDateString()
                            : "N/A"}
                        </p>
                      </div>
                      <div>
                        <Label>Due Date</Label>
                        <p className="text-sm">
                          {viewOrder.calibrationData.dueDate
                            ? new Date(viewOrder.calibrationData.dueDate).toLocaleDateString()
                            : "N/A"}
                        </p>
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
