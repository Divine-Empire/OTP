"use client"

import { useState, useEffect, useMemo } from "react"
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
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RefreshCw, Search, Plus, FileText } from "lucide-react"

export default function CreditNotePage() {
  const [orderNumber, setOrderNumber] = useState("")
  const [invoiceNumber, setInvoiceNumber] = useState("")
  const [quantity, setQuantity] = useState("")
  const [value, setValue] = useState("")
  const [seniorApproval, setSeniorApproval] = useState("")
  const [reason, setReason] = useState("")
  const [remarks, setRemarks] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [creditNotes, setCreditNotes] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  // Same URL and Sheet ID as reference code
  const APPS_SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbyzW8-RldYx917QpAfO4kY-T8_ntg__T0sbr7Yup2ZTVb1FC5H1g6TYuJgAU6wTquVM/exec"
  const SHEET_ID = "1yEsh4yzyvglPXHxo-5PT70VpwVJbxV7wwH8rpU1RFJA"
  const SHEET_NAME = "Credit-Note"

  const [searchTerm, setSearchTerm] = useState("")

  // Senior Approval options as specified
  const seniorApprovalOptions = [
    "kishan patel",
    "shashank sir", 
    "neeraj sir",
    "prasnna sir"
  ]

  // Helper function to parse Google Sheets date format and display as DD/MM/YYYY HH:MM:SS
  const parseGoogleSheetsDate = (dateString) => {
    if (!dateString) return "—"
    if (typeof dateString !== "string") return dateString
    if (!dateString.startsWith("Date(")) return dateString

    try {
      // Extract numbers inside Date()
      const parts = dateString.slice(5, -1).split(",")
      if (parts.length < 3) return dateString

      const year = Number(parts[0])
      const month = Number(parts[1]) // zero based
      const day = Number(parts[2])
      const hour = parts.length > 3 ? Number(parts[3]) : 0
      const minute = parts.length > 4 ? Number(parts[4]) : 0
      const second = parts.length > 5 ? Number(parts[5]) : 0

      // Format to dd/mm/yyyy hh:mm:ss
      const pad = (n) => String(n).padStart(2, '0')

      return `${pad(day)}/${pad(month + 1)}/${year} ${pad(hour)}:${pad(minute)}:${pad(second)}`
    } catch (error) {
      return dateString
    }
  }

  const fetchCreditNotes = async () => {
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
        const notes = []

        data.table.rows.slice(1).forEach((row, index) => { // Skip header row
          if (row.c) {
            const actualRowIndex = index + 2
            const note = {
              id: `CREDIT-${actualRowIndex}`,
              rowIndex: actualRowIndex,
              timestamp: row.c[0] ? row.c[0].v : "", // Column A - Timestamp
              orderNumber: row.c[1] ? row.c[1].v : "", // Column B - Order Number
              invoiceNumber: row.c[2] ? row.c[2].v : "", // Column C - Invoice Number
              quantity: row.c[3] ? row.c[3].v : "", // Column D - Quantity
              value: row.c[4] ? row.c[4].v : "", // Column E - Value
              seniorApproval: row.c[5] ? row.c[5].v : "", // Column F - Senior Approval
              reason: row.c[6] ? row.c[6].v : "", // Column G - Reason
              remarks: row.c[7] ? row.c[7].v : "", // Column H - Remarks
              fullRowData: row.c,
            }
            notes.push(note)
          }
        })

        setCreditNotes(notes)
      }
    } catch (err) {
      console.error("Error fetching credit notes:", err)
      setError(err.message)
      setCreditNotes([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCreditNotes()
  }, [])

  // Filter credit notes based on search term
  const filteredCreditNotes = useMemo(() => {
    if (!searchTerm) return creditNotes

    return creditNotes.filter((note) => {
      return (
        note.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.seniorApproval.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
        note.remarks.toLowerCase().includes(searchTerm.toLowerCase())
      )
    })
  }, [creditNotes, searchTerm])

  const submitCreditNote = async () => {
    if (!orderNumber || !invoiceNumber || !quantity || !value || !seniorApproval || !reason) {
      alert("Please fill all required fields")
      return
    }

    setSubmitting(true)

    try {
      const formData = new FormData()
      formData.append("sheetName", SHEET_NAME)
      formData.append("action", "insert")

      // Create row data for the credit note with timestamp in Column A (DD/MM/YYYY format)
      const today = new Date()
      const timestamp = `${today.getDate().toString().padStart(2, '0')}/${(today.getMonth() + 1).toString().padStart(2, '0')}/${today.getFullYear()} ${today.getHours().toString().padStart(2, '0')}:${today.getMinutes().toString().padStart(2, '0')}:${today.getSeconds().toString().padStart(2, '0')}`

      const rowData = [
        timestamp,          // Column A - Timestamp (DD/MM/YYYY HH:MM:SS)
        orderNumber,        // Column B - Order Number
        invoiceNumber,      // Column C - Invoice Number
        quantity,           // Column D - Quantity
        value,              // Column E - Value
        seniorApproval,     // Column F - Senior Approval
        reason,             // Column G - Reason
        remarks,            // Column H - Remarks
      ]

      formData.append("rowData", JSON.stringify(rowData))

      const response = await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        mode: "cors",
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      let result
      try {
        const responseText = await response.text()
        result = JSON.parse(responseText)
      } catch (parseError) {
        result = { success: true }
      }

      if (result.success !== false) {
        // Reset form
        setOrderNumber("")
        setInvoiceNumber("")
        setQuantity("")
        setValue("")
        setSeniorApproval("")
        setReason("")
        setRemarks("")
        setIsDialogOpen(false)
        
        // Refresh the list
        await fetchCreditNotes()
        
        alert(`Credit Note for Invoice ${invoiceNumber} has been created successfully`)
      } else {
        throw new Error(result.error || "Credit Note creation failed")
      }
    } catch (err) {
      console.error("Error submitting credit note:", err)
      alert(`Error creating credit note: ${err.message}`)
    } finally {
      setSubmitting(false)
    }
  }

  const handleNewCreditNote = () => {
    setOrderNumber("")
    setInvoiceNumber("")
    setQuantity("")
    setValue("")
    setSeniorApproval("")
    setReason("")
    setRemarks("")
    setIsDialogOpen(true)
  }

  const handleRefresh = async () => {
    setLoading(true)
    try {
      await fetchCreditNotes()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading && creditNotes.length === 0) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading credit notes...</span>
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
            <Button onClick={handleRefresh} className="mt-4">
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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Credit Note Management
            </h1>
            <p className="text-muted-foreground">Create and manage credit notes for orders</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={handleNewCreditNote}>
              <Plus className="h-4 w-4 mr-2" />
              Create Credit Note
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Credit Notes</CardTitle>
            <CardDescription>List of all credit notes ({filteredCreditNotes.length})</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Created At</TableHead>
                      <TableHead>Order Number</TableHead>
                      <TableHead>Invoice Number</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Senior Approval</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Remarks</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCreditNotes.map((note) => (
                      <TableRow key={note.id} className="hover:bg-gray-50">
                        <TableCell className="text-sm text-muted-foreground">
                          {parseGoogleSheetsDate(note.timestamp) || "—"}
                        </TableCell>
                        <TableCell className="font-medium">{note.orderNumber}</TableCell>
                        <TableCell className="font-medium">{note.invoiceNumber}</TableCell>
                        <TableCell>{note.quantity}</TableCell>
                        <TableCell className="font-medium">
                          {note.value ? `₹${Number(note.value).toLocaleString()}` : "—"}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{note.seniorApproval}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-[200px] whitespace-normal break-words">
                            {note.reason || "—"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-[200px] whitespace-normal break-words">
                            {note.remarks || "—"}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredCreditNotes.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-muted-foreground h-32">
                          {searchTerm ? "No credit notes match your search criteria" : "No credit notes found"}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Create Credit Note Dialog with Scrollable Content */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Credit Note</DialogTitle>
              <DialogDescription>Fill in the details to create a new credit note</DialogDescription>
            </DialogHeader>
                <div className="space-y-4 overflow-visible">
              <div className="space-y-2">
                <Label htmlFor="orderNumber">Order Number *</Label>
                <Input
                  id="orderNumber"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  placeholder="Enter order number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="invoiceNumber">Invoice Number *</Label>
                <Input
                  id="invoiceNumber"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  placeholder="Enter invoice number"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="Enter quantity"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="value">Value *</Label>
                  <Input
                    id="value"
                    type="number"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="Enter value"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="seniorApproval">Senior Approval *</Label>
                <Select value={seniorApproval} onValueChange={setSeniorApproval}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select senior approval" />
                  </SelectTrigger>
                  <SelectContent>
                    {seniorApprovalOptions.map((approver) => (
                      <SelectItem key={approver} value={approver}>
                        {approver}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Reason *</Label>
                <Textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Enter reason for credit note..."
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="remarks">Remarks</Label>
                <Textarea
                  id="remarks"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Additional comments or notes..."
                  rows={2}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={submitCreditNote} 
                disabled={!orderNumber || !invoiceNumber || !quantity || !value || !seniorApproval || !reason || submitting}
              >
                {submitting ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    Create Credit Note
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  )
}
