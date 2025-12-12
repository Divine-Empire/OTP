"use client"

import { useState, useEffect, useMemo } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { useAuth } from "@/components/auth-provider"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Plus, Trash2, RefreshCw, Search, Settings } from "lucide-react"

// Column definitions for Pending tab (ORDER-DISPATCH sheet, columns B to BZ)
const pendingColumns = [
  { key: "actions", label: "Actions", searchable: false },
  { key: "orderNo", label: "Order No.", searchable: true },
  { key: "quotationNo", label: "Quotation No.", searchable: true },
  { key: "companyName", label: "Company Name", searchable: true },
  { key: "contactPersonName", label: "Contact Person Name", searchable: true },
  { key: "contactNumber", label: "Contact Number", searchable: true },
  { key: "billingAddress", label: "Billing Address", searchable: true },
  { key: "shippingAddress", label: "Shipping Address", searchable: true },
  { key: "paymentMode", label: "Payment Mode", searchable: true },
  { key: "paymentTerms", label: "Payment Terms(In Days)", searchable: true },
  { key: "referenceName", label: "Reference Name", searchable: true },
  { key: "email", label: "Email", searchable: true },
  { key: "itemName1", label: "Item Name 1", searchable: true },
  { key: "quantity1", label: "Quantity 1", searchable: true },
  { key: "itemName2", label: "Item Name 2", searchable: true },
  { key: "quantity2", label: "Quantity 2", searchable: true },
  { key: "itemName3", label: "Item Name 3", searchable: true },
  { key: "quantity3", label: "Quantity 3", searchable: true },
  { key: "itemName4", label: "Item Name 4", searchable: true },
  { key: "quantity4", label: "Quantity 4", searchable: true },
  { key: "itemName5", label: "Item Name 5", searchable: true },
  { key: "quantity5", label: "Quantity 5", searchable: true },
  { key: "itemName6", label: "Item Name 6", searchable: true },
  { key: "quantity6", label: "Quantity 6", searchable: true },
  { key: "itemName7", label: "Item Name 7", searchable: true },
  { key: "quantity7", label: "Quantity 7", searchable: true },
  { key: "itemName8", label: "Item Name 8", searchable: true },
  { key: "quantity8", label: "Quantity 8", searchable: true },
  { key: "itemName9", label: "Item Name 9", searchable: true },
  { key: "quantity9", label: "Quantity 9", searchable: true },
  { key: "itemName10", label: "Item Name 10", searchable: true },
  { key: "quantity10", label: "Quantity 10", searchable: true },
  { key: "transportMode", label: "Transport Mode", searchable: true },
  { key: "freightType", label: "Freight Type", searchable: true },
  { key: "destination", label: "Destination", searchable: true },
  { key: "poNumber", label: "Po Number", searchable: true },
  { key: "quotationCopy", label: "Quotation Copy", searchable: true },
  { key: "acceptanceCopy", label: "Acceptance Copy (Purchase Order Only)", searchable: true },
  { key: "offerShow", label: "Offer Show", searchable: true },
  { key: "conveyedForRegistration", label: "Conveyed For Registration Form", searchable: true },
  { key: "totalOrderQty", label: "Total Order Qty", searchable: true },
  { key: "amount", label: "Amount", searchable: true },
  { key: "totalDispatch", label: "Total Dispatch", searchable: true },
  { key: "quantityDelivered", label: "Quantity Delivered", searchable: true },
  { key: "orderCancel", label: "Order Cancel", searchable: true },
  { key: "pendingDeliveryQty", label: "Pending Delivery Qty", searchable: true },
  { key: "pendingDispatchQty", label: "Pending Dispatch Qty", searchable: true },
  { key: "materialReturn", label: "Material Return", searchable: true },
  { key: "deliveryStatus", label: "Delivery Status", searchable: true },
  { key: "dispatchStatus", label: "Dispatch Status", searchable: true },
  { key: "dispatchCompleteDate", label: "Dispatch Complete Date", searchable: true },
  { key: "deliveryCompleteDate", label: "Delivery Complete Date", searchable: true },
  { key: "seniorApproveName", label: "Senior Approval Name", searchable: true },
  { key: "itemQty", label: "Item/Qty", searchable: true },
  { key: "dispatchTotalQty", label: "Dispatch Total Qty", searchable: true },
  { key: "dispatchPendingQty", label: "Dispatch Pending Qty", searchable: true },
]

// Column definitions for History tab (DISPATCH-DELIVERY sheet, columns B to BZ)
const historyColumns = [
  { key: "orderNo", label: "Order No.", searchable: true },
  { key: "quotationNo", label: "Quotation No.", searchable: true },
  { key: "companyName", label: "Company Name", searchable: true },
  { key: "contactPersonName", label: "Contact Person Name", searchable: true },
  { key: "contactNumber", label: "Contact Number", searchable: true },
  { key: "billingAddress", label: "Billing Address", searchable: true },
  { key: "shippingAddress", label: "Shipping Address", searchable: true },
  { key: "paymentMode", label: "Payment Mode", searchable: true },
  { key: "quotationCopyHistory", label: "Quotation Copy", searchable: true },
  { key: "paymentTerms", label: "Payment Terms(In Days)", searchable: true },
  { key: "transportMode", label: "Transport Mode", searchable: true },
  { key: "freightType", label: "Freight Type", searchable: true },
  { key: "destination", label: "Destination", searchable: true },
  { key: "poNumber", label: "Po Number", searchable: true },
  { key: "quotationCopy", label: "Quotation Copy", searchable: true },
  { key: "acceptanceCopy", label: "Acceptance Copy (Purchase Order Only)", searchable: true },
  { key: "offer", label: "Offer", searchable: true },
  { key: "conveyedForRegistration", label: "Conveyed For Registration Form", searchable: true },
  { key: "qty", label: "Qty", searchable: true },
  { key: "amount", label: "Amount", searchable: true },
  { key: "approvedName", label: "Approved Name", searchable: true },
  { key: "calibrationRequired", label: "Calibration Certificate Required", searchable: true },
  { key: "certificateCategory", label: "Certificate Category", searchable: true },
  { key: "installationRequired", label: "Installation Required", searchable: true },
  { key: "ewayBillDetails", label: "Eway Bill Details", searchable: true },
  { key: "ewayBillAttachment", label: "Eway Bill Attachment", searchable: true },
  { key: "srnNumber", label: "Srn Number", searchable: true },
  { key: "srnNumberAttachment", label: "Srn Number Attachment", searchable: true },
  { key: "attachment", label: "Attachment", searchable: true },
  { key: "itemName1", label: "Item Name 1", searchable: true },
  { key: "quantity1", label: "Quantity 1", searchable: true },
  { key: "itemName2", label: "Item Name 2", searchable: true },
  { key: "quantity2", label: "Quantity 2", searchable: true },
  { key: "itemName3", label: "Item Name 3", searchable: true },
  { key: "quantity3", label: "Quantity 3", searchable: true },
  { key: "itemName4", label: "Item Name 4", searchable: true },
  { key: "quantity4", label: "Quantity 4", searchable: true },
  { key: "itemName5", label: "Item Name 5", searchable: true },
  { key: "quantity5", label: "Quantity 5", searchable: true },
  { key: "itemName6", label: "Item Name 6", searchable: true },
  { key: "quantity6", label: "Quantity 6", searchable: true },
  { key: "itemName7", label: "Item Name 7", searchable: true },
  { key: "quantity7", label: "Quantity 7", searchable: true },
  { key: "itemName8", label: "Item Name 8", searchable: true },
  { key: "quantity8", label: "Quantity 8", searchable: true },
  { key: "itemName9", label: "Item Name 9", searchable: true },
  { key: "quantity9", label: "Quantity 9", searchable: true },
  { key: "itemName10", label: "Item Name 10", searchable: true },
  { key: "quantity10", label: "Quantity 10", searchable: true },
  { key: "itemName11", label: "Item Name 11", searchable: true },
  { key: "quantity11", label: "Quantity 11", searchable: true },
  { key: "itemName12", label: "Item Name 12", searchable: true },
  { key: "quantity12", label: "Quantity 12", searchable: true },
  { key: "itemName13", label: "Item Name 13", searchable: true },
  { key: "quantity13", label: "Quantity 13", searchable: true },
  { key: "itemName14", label: "Item Name 14", searchable: true },
  { key: "quantity14", label: "Quantity 14", searchable: true },
  { key: "itemName15", label: "Item Name 15", searchable: true },
  { key: "quantity15", label: "Quantity 15", searchable: true },
  { key: "totalQty", label: "Total Qty", searchable: true },
  { key: "remarks", label: "Remarks", searchable: true },
]

const convertFileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = (error) => reject(error)
  })
}

export default function DispFormPage() {
  const [selectedOrder, setSelectedOrder] = useState<string>("")
  const [calibrationRequired, setCalibrationRequired] = useState<string>("")
  const [calibrationType, setCalibrationType] = useState<string>("")
  const [installationRequired, setInstallationRequired] = useState<string>("")
  const [items, setItems] = useState<Array<{ name: string; qty: number }>>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [viewOrder, setViewOrder] = useState<any>(null)
  const [orders, setOrders] = useState<any[]>([])
  const [processedOrders, setProcessedOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [processedLoading, setProcessedLoading] = useState(false)
  const [ewayBillDetails, setEwayBillDetails] = useState<string>("")
  const [ewayBillAttachment, setEwayBillAttachment] = useState<File | null>(null)
  const [srnNumber, setSrnNumber] = useState<string>("")
  const [srnNumberAttachment, setSrnNumberAttachment] = useState<File | null>(null)
  const [paymentAttachment, setPaymentAttachment] = useState<File | null>(null)
  const [gstNumber, setGstNumber] = useState<string>("")
const [vehicleNumber, setVehicleNumber] = useState<string>("")
const [dispatchLocation, setDispatchLocation] = useState<string>("")
  const [uploading, setUploading] = useState(false)
  const [directDispatch, setDirectDispatch] = useState<string>("");
  const [remarks, setRemarks] = useState<string>("")
  const [additionalItemsJson, setAdditionalItemsJson] = useState("")

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedColumn, setSelectedColumn] = useState("all")
  const [visiblePendingColumns, setVisiblePendingColumns] = useState(
    pendingColumns.reduce((acc, col) => ({ ...acc, [col.key]: true }), {}),
  )
  const [visibleHistoryColumns, setVisibleHistoryColumns] = useState(
    historyColumns.reduce((acc, col) => ({ ...acc, [col.key]: true }), {}),
  )

  const {user: currentUser} = useAuth();

  const APPS_SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbyzW8-RldYx917QpAfO4kY-T8_ntg__T0sbr7Yup2ZTVb1FC5H1g6TYuJgAU6wTquVM/exec"
  const SHEET_ID = "1yEsh4yzyvglPXHxo-5PT70VpwVJbxV7wwH8rpU1RFJA"
  const PENDING_SHEET_NAME = "ORDER-DISPATCH"
  const HISTORY_SHEET_NAME = "DISPATCH-DELIVERY"

  const formatGoogleSheetsDate = (dateValue) => {
    if (!dateValue) return ""

    // Handle the case where date comes as "Date(2025,5,21)"
    if (typeof dateValue === "string" && dateValue.startsWith("Date(")) {
      try {
        // Extract the numbers between parentheses
        const dateParts = dateValue.match(/Date$$(\d+),(\d+),(\d+)$$/)
        if (dateParts && dateParts.length === 4) {
          const year = Number.parseInt(dateParts[1])
          const month = Number.parseInt(dateParts[2]) // Note: months are 0-indexed in JS
          const day = Number.parseInt(dateParts[3])

          // Create a date object (month is 0-indexed in JS, so no need to subtract 1)
          const date = new Date(year, month, day)

          // Format as dd/mm/yyyy
          const formattedDay = String(date.getDate()).padStart(2, "0")
          const formattedMonth = String(date.getMonth() + 1).padStart(2, "0") // +1 because months are 0-indexed
          const formattedYear = date.getFullYear()

          return `${formattedDay}/${formattedMonth}/${formattedYear}`
        }
      } catch (e) {
        console.error("Error parsing date string:", e)
      }
    }

    // Handle case where date comes as a serial number or string
    try {
      // If it's a number (serial date value from Google Sheets)
      if (typeof dateValue === "number") {
        // Google Sheets serial date starts from Dec 30, 1899
        const date = new Date(Math.round((dateValue - 25569) * 86400 * 1000))
        const formattedDay = String(date.getDate()).padStart(2, "0")
        const formattedMonth = String(date.getMonth() + 1).padStart(2, "0")
        const formattedYear = date.getFullYear()

        return `${formattedDay}/${formattedMonth}/${formattedYear}`
      }

      // If it's already a date string in some format
      const date = new Date(dateValue)
      if (!isNaN(date.getTime())) {
        const formattedDay = String(date.getDate()).padStart(2, "0")
        const formattedMonth = String(date.getMonth() + 1).padStart(2, "0")
        const formattedYear = date.getFullYear()

        return `${formattedDay}/${formattedMonth}/${formattedYear}`
      }
    } catch (e) {
      console.error("Error parsing date value:", e)
    }

    // If all else fails, return the original value
    return dateValue
  }


  // Add this function after the useAuth hook
const filterOrdersByUserRole = (orders: any[], currentUser: any) => {
  if (!currentUser) return orders;
  
  // Super admin sees all data
  if (currentUser.role === "super_admin") {
    return orders;
  }
  
  // Admin and regular users only see data where CRE Name matches their username
  return orders.filter(order => order.creName === currentUser.username);
};
  // Filter orders based on search term and selected column
const filteredOrders = useMemo(() => {
  let filtered = orders;

  // Apply user role-based filtering
  filtered = filterOrdersByUserRole(filtered, currentUser);

  if (searchTerm) {
    filtered = filtered.filter((order) => {
      if (selectedColumn === "all") {
        const searchableFields = pendingColumns
          .filter((col) => col.searchable)
          .map((col) => String(order[col.key] || "").toLowerCase())
        return searchableFields.some((field) => field.includes(searchTerm.toLowerCase()))
      } else {
        const fieldValue = String(order[selectedColumn] || "").toLowerCase()
        return fieldValue.includes(searchTerm.toLowerCase())
      }
    })
  }

  return filtered
}, [orders, searchTerm, selectedColumn, currentUser])

  // Filter processed orders based on search term
const filteredProcessedOrders = useMemo(() => {
  let filtered = processedOrders;

  // Apply user role-based filtering
  filtered = filterOrdersByUserRole(filtered, currentUser);

  if (searchTerm) {
    filtered = filtered.filter((order) => {
      if (selectedColumn === "all") {
        const searchableFields = historyColumns
          .filter((col) => col.searchable)
          .map((col) => String(order[col.key] || "").toLowerCase())
        return searchableFields.some((field) => field.includes(searchTerm.toLowerCase()))
      } else {
        const fieldValue = String(order[selectedColumn] || "").toLowerCase()
        return fieldValue.includes(searchTerm.toLowerCase())
      }
    })
  }

  return filtered
}, [processedOrders, searchTerm, selectedColumn, currentUser])

  // Column visibility handlers
  const togglePendingColumn = (columnKey) => {
    setVisiblePendingColumns((prev) => ({
      ...prev,
      [columnKey]: !prev[columnKey],
    }))
  }

  const toggleHistoryColumn = (columnKey) => {
    setVisibleHistoryColumns((prev) => ({
      ...prev,
      [columnKey]: !prev[columnKey],
    }))
  }

  const showAllPendingColumns = () => {
    setVisiblePendingColumns(pendingColumns.reduce((acc, col) => ({ ...acc, [col.key]: true }), {}))
  }

  const hideAllPendingColumns = () => {
    setVisiblePendingColumns(pendingColumns.reduce((acc, col) => ({ ...acc, [col.key]: col.key === "actions" }), {}))
  }

  const showAllHistoryColumns = () => {
    setVisibleHistoryColumns(historyColumns.reduce((acc, col) => ({ ...acc, [col.key]: true }), {}))
  }

  const hideAllHistoryColumns = () => {
    setVisibleHistoryColumns(historyColumns.reduce((acc, col) => ({ ...acc, [col.key]: false }), {}))
  }

  const fetchPendingOrders = async () => {
    setLoading(true)
    setError(null)

    try {
      const sheetUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${PENDING_SHEET_NAME}`
      const response = await fetch(sheetUrl)
      const text = await response.text()

      const jsonStart = text.indexOf("{")
      const jsonEnd = text.lastIndexOf("}") + 1
      const jsonData = text.substring(jsonStart, jsonEnd)

      const data = JSON.parse(jsonData)

      if (data && data.table && data.table.rows) {
        const ordersData = []

        data.table.rows.slice(6).forEach((row, index) => {
          if (row.c) {
            const actualRowIndex = index + 7

            // Check if this order needs DISP form processing
            // You can adjust this logic based on your requirements
            // const hasColumnBR = row.c[69] && row.c[69].v !== null && row.c[69].v !== ""
            // const hasColumnBS = row.c[70] && row.c[70].v !== null && row.c[70].v !== ""

            // For pending orders: show rows where BR and BS have data (senior approved)
            // if (hasColumnBR && hasColumnBS) {
            // Column AX (index 49) - Dispatch Status should be "PENDING"
            const dispatchStatus = row.c[49] && row.c[49].v ? row.c[49].v.toString().toUpperCase() : ""
          
          // Column BX (index 75) - Should not be null or empty
          const columnBX = row.c[75] && row.c[75].v ? row.c[75].v.toString().trim() : ""

          // For pending orders: show rows where AX column has "PENDING" value AND BX column is not empty
          if (dispatchStatus === "PENDING" && columnBX !== "") {
            const order = {
                rowIndex: actualRowIndex,
                timestamp: formatGoogleSheetsDate(row.c[0] ? row.c[0].v : ""),
                // Map all columns B to BZ
                orderNo: row.c[1] ? row.c[1].v : "", // Column B
                quotationNo: row.c[2] ? row.c[2].v : "", // Column C
                companyName: row.c[3] ? row.c[3].v : "", // Column D
                contactPersonName: row.c[4] ? row.c[4].v : "", // Column E
                contactNumber: row.c[5] ? row.c[5].v : "", // Column F
                billingAddress: row.c[6] ? row.c[6].v : "", // Column G
                shippingAddress: row.c[7] ? row.c[7].v : "", // Column H
                paymentMode: row.c[8] ? row.c[8].v : "", // Column I
                paymentTerms: row.c[9] ? row.c[9].v : "", // Column J
                referenceName: row.c[10] ? row.c[10].v : "", // Column K
                email: row.c[11] ? row.c[11].v : "", // Column L
                itemName1: row.c[12] ? row.c[12].v : "", // Column M
                quantity1: row.c[13] ? row.c[13].v : "", // Column N
                itemName2: row.c[14] ? row.c[14].v : "", // Column O
                quantity2: row.c[15] ? row.c[15].v : "", // Column P
                itemName3: row.c[16] ? row.c[16].v : "", // Column Q
                quantity3: row.c[17] ? row.c[17].v : "", // Column R
                itemName4: row.c[18] ? row.c[18].v : "", // Column S
                quantity4: row.c[19] ? row.c[19].v : "", // Column T
                itemName5: row.c[20] ? row.c[20].v : "", // Column U
                quantity5: row.c[21] ? row.c[21].v : "", // Column V
                itemName6: row.c[22] ? row.c[22].v : "", // Column W
                quantity6: row.c[23] ? row.c[23].v : "", // Column X
                itemName7: row.c[24] ? row.c[24].v : "", // Column Y
                quantity7: row.c[25] ? row.c[25].v : "", // Column Z
                itemName8: row.c[26] ? row.c[26].v : "", // Column AA
                quantity8: row.c[27] ? row.c[27].v : "", // Column AB
                itemName9: row.c[28] ? row.c[28].v : "", // Column AC
                quantity9: row.c[29] ? row.c[29].v : "", // Column AD
                itemName10: row.c[30] ? row.c[30].v : "", // Column AE
                quantity10: row.c[31] ? row.c[31].v : "", // Column AF
                transportMode: row.c[32] ? row.c[32].v : "", // Column AG
                freightType: row.c[34] ? row.c[34].v : "", // Column AH
                destination: row.c[33] ? row.c[33].v : "", // Column AI
                poNumber: row.c[35] ? row.c[35].v : "", // Column AJ
                quotationCopy: row.c[36] ? row.c[36].v : "", // Column AK
                acceptanceCopy: row.c[37] ? row.c[37].v : "", // Column AL
                offerShow: row.c[38] ? row.c[38].v : "", // Column AM
                conveyedForRegistration: row.c[39] ? row.c[39].v : "", // Column AN
                totalOrderQty: row.c[40] ? row.c[40].v : "", // Column AO
                amount: row.c[41] ? row.c[41].v : "", // Column AP
                totalDispatch: row.c[42] ? row.c[42].v : "", // Column AQ
                quantityDelivered: row.c[43] ? row.c[43].v : "", // Column AR
                orderCancel: row.c[44] ? row.c[44].v : "", // Column AS
                pendingDeliveryQty: row.c[45] ? row.c[45].v : "", // Column AT
                pendingDispatchQty: row.c[46] ? row.c[46].v : "", // Column AU
                materialReturn: row.c[47] ? row.c[47].v : "", // Column AV
                deliveryStatus: row.c[48] ? row.c[48].v : "", // Column AW
                dispatchStatus: row.c[49] ? row.c[49].v : "", // Column AX
                dispatchCompleteDate: formatGoogleSheetsDate(row.c[50] ? row.c[50].v : ""), // Column AY
                deliveryCompleteDate: formatGoogleSheetsDate(row.c[51] ? row.c[51].v : ""), // Column AZ
                seniorApproveName: row.c[77] ? row.c[77].v : "",
                itemQty: row.c[79] ? row.c[79].v : "",
                dispatchTotalQty: row.c[80] ? row.c[80].v : "",
                creName: row.c[81] ? row.c[81].v : "", // Column CD (index 81) - CRE Name
                dispatchPendingQty: row.c[82] ? row.c[82].v : "",
                // Keep old field names for backward compatibility
                id: row.c[1] ? row.c[1].v : `ORDER-${actualRowIndex}`,
                contactPerson: row.c[4] ? row.c[4].v : "",
                quantity: row.c[40] ? row.c[40].v : "",
                fullRowData: row.c,
              }

              ordersData.push(order)
            }
          }
        })

        setOrders(ordersData)
      }
    } catch (err: any) {
      console.error("Error fetching pending orders data:", err)
      setError(err.message)
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  const fetchProcessedOrders = async () => {
    setProcessedLoading(true)

    try {
      const sheetUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${HISTORY_SHEET_NAME}`
      const response = await fetch(sheetUrl)
      const text = await response.text()

      const jsonStart = text.indexOf("{")
      const jsonEnd = text.lastIndexOf("}") + 1
      const jsonData = text.substring(jsonStart, jsonEnd)

      const data = JSON.parse(jsonData)

      if (data && data.table && data.table.rows) {
        const processedOrdersData = []

        data.table.rows.slice(6).forEach((row, index) => {
          if (row.c) {
            const actualRowIndex = index + 7

            // Replace the existing condition with:
            // Column B (index 1) should have a value
            const hasOrderNo = row.c[1] && row.c[1].v !== null && row.c[1].v !== ""

            // For processed orders: show rows where column B has a value
            if (hasOrderNo) {
              const processedOrder = {
                rowIndex: actualRowIndex,
                timestamp: formatGoogleSheetsDate(row.c[0] ? row.c[0].v : ""),
                // Map all columns B to BZ for DISPATCH-DELIVERY sheet
                orderNo: row.c[1] ? row.c[1].v : "", // Column B
                quotationNo: row.c[2] ? row.c[2].v : "", // Column C
                companyName: row.c[3] ? row.c[3].v : "", // Column D
                contactPersonName: row.c[4] ? row.c[4].v : "", // Column E
                contactNumber: row.c[5] ? row.c[5].v : "", // Column F
                billingAddress: row.c[6] ? row.c[6].v : "", // Column G
                shippingAddress: row.c[7] ? row.c[7].v : "", // Column H
                paymentMode: row.c[8] ? row.c[8].v : "", // Column I
                quotationCopyHistory: row.c[9] ? row.c[9].v : "", // Column J
                paymentTerms: row.c[10] ? row.c[10].v : "", // Column K
                transportMode: row.c[11] ? row.c[11].v : "", // Column L
                freightType: row.c[12] ? row.c[12].v : "", // Column M
                destination: row.c[33] ? row.c[33].v : "", // Column N
                poNumber: row.c[14] ? row.c[14].v : "", // Column O
                quotationCopy: row.c[15] ? row.c[15].v : "", // Column P
                acceptanceCopy: row.c[16] ? row.c[16].v : "", // Column Q
                offer: row.c[17] ? row.c[17].v : "", // Column R
                conveyedForRegistration: row.c[18] ? row.c[18].v : "", // Column S
                qty: row.c[19] ? row.c[19].v : "", // Column T
                amount: row.c[20] ? row.c[20].v : "", // Column U
                approvedName: row.c[21] ? row.c[21].v : "", // Column V
                calibrationRequired: row.c[22] ? row.c[22].v : "", // Column W
                certificateCategory: row.c[23] ? row.c[23].v : "", // Column X
                installationRequired: row.c[24] ? row.c[24].v : "", // Column Y
                ewayBillDetails: row.c[25] ? row.c[25].v : "", // Column Z
                ewayBillAttachment: row.c[26] ? row.c[26].v : "", // Column AA
                srnNumber: row.c[27] ? row.c[27].v : "", // Column AB
                srnNumberAttachment: row.c[28] ? row.c[28].v : "", // Column AC
                attachment: row.c[29] ? row.c[29].v : "", // Column AD
                itemName1: row.c[30] ? row.c[30].v : "", // Column AE
                quantity1: row.c[31] ? row.c[31].v : "", // Column AF
                itemName2: row.c[32] ? row.c[32].v : "", // Column AG
                quantity2: row.c[13] ? row.c[13].v : "", // Column AH
                itemName3: row.c[34] ? row.c[34].v : "", // Column AI
                quantity3: row.c[35] ? row.c[35].v : "", // Column AJ
                itemName4: row.c[36] ? row.c[36].v : "", // Column AK
                quantity4: row.c[37] ? row.c[37].v : "", // Column AL
                itemName5: row.c[38] ? row.c[38].v : "", // Column AM
                quantity5: row.c[39] ? row.c[39].v : "", // Column AN
                itemName6: row.c[40] ? row.c[40].v : "", // Column AO
                quantity6: row.c[41] ? row.c[41].v : "", // Column AP
                itemName7: row.c[42] ? row.c[42].v : "", // Column AQ
                quantity7: row.c[43] ? row.c[43].v : "", // Column AR
                itemName8: row.c[44] ? row.c[44].v : "", // Column AS
                quantity8: row.c[45] ? row.c[45].v : "", // Column AT
                itemName9: row.c[46] ? row.c[46].v : "", // Column AU
                quantity9: row.c[47] ? row.c[47].v : "", // Column AV
                itemName10: row.c[48] ? row.c[48].v : "", // Column AW
                quantity10: row.c[49] ? row.c[49].v : "", // Column AX
                itemName11: row.c[50] ? row.c[50].v : "", // Column AY
                quantity11: row.c[51] ? row.c[51].v : "", // Column AZ
                itemName12: row.c[52] ? row.c[52].v : "", // Column BA
                quantity12: row.c[53] ? row.c[53].v : "", // Column BB
                itemName13: row.c[54] ? row.c[54].v : "", // Column BC
                quantity13: row.c[55] ? row.c[55].v : "", // Column BD
                itemName14: row.c[56] ? row.c[56].v : "", // Column BE
                quantity14: row.c[57] ? row.c[57].v : "", // Column BF
                itemName15: row.c[58] ? row.c[58].v : "", // Column BG
                quantity15: row.c[59] ? row.c[59].v : "", // Column BH
                creName: row.c[106] ? row.c[106].v : "", // Column CD (index 81) - CRE Name
                totalQty: row.c[60] ? row.c[60].v : "", // Column BI
                remarks: row.c[61] ? row.c[61].v : "", // Column BJ
                // Keep old field names for backward compatibility
                id: row.c[1] ? row.c[1].v : `ORDER-${actualRowIndex}`,
                contactPerson: row.c[4] ? row.c[4].v : "",
                quantity: row.c[19] ? row.c[19].v : "",
                fullRowData: row.c,
              }

              processedOrdersData.push(processedOrder)
            }
          }
        })

        setProcessedOrders(processedOrdersData)
      }
    } catch (err: any) {
      console.error("Error fetching processed orders data:", err)
      setProcessedOrders([])
    } finally {
      setProcessedLoading(false)
    }
  }

  useEffect(() => {
    fetchPendingOrders()
  }, [])

  const handleProcessedTabClick = async () => {
    await fetchProcessedOrders()
  }

  const handleProcess = (orderId: string) => {
    const order = orders.find((o: any) => o.id === orderId)
    if (!order) return
  
    setSelectedOrder(orderId)
    setCalibrationRequired("")
    setCalibrationType("")
    setInstallationRequired("")
  
    // Extract items from the order data (columns M to AF) - first 10 items
    const extractedItems: Array<{ name: string; qty: number }> = []
    for (let i = 12; i <= 31; i += 2) {
      // Columns M (12) to AF (31)
      const nameCol = order.fullRowData[i]
      const qtyCol = order.fullRowData[i + 1]
  
      if (nameCol && nameCol.v && nameCol.v.toString().trim() !== "") {
        extractedItems.push({
          name: nameCol.v.toString(),
          qty: qtyCol ? Number(qtyCol.v) || 0 : 0,
        })
      }
    }
  
    // Extract additional items from column AI (index 34) if it contains JSON data
    try {
      const aiColumnData = order.fullRowData[34] // Column AI
      if (aiColumnData && aiColumnData.v) {
        const jsonData = JSON.parse(aiColumnData.v)
        if (Array.isArray(jsonData)) {
          jsonData.forEach(item => {
            if (item.name && item.quantity !== undefined) {
              extractedItems.push({
                name: item.name,
                qty: Number(item.quantity) || 0
              })
            }
          })
        }
      }
    } catch (error) {
      console.log("No valid JSON data found in column AI or error parsing:", error)
    }
  
    setItems(extractedItems)
    setAdditionalItemsJson("")
    setEwayBillDetails("")
    setEwayBillAttachment(null)
    setSrnNumber("")
    setSrnNumberAttachment(null)
    setPaymentAttachment(null)
    setIsDialogOpen(true)
    setRemarks("")
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

  const handleSubmit = async () => {
    if (!selectedOrder || !calibrationRequired || !installationRequired) return;
  
    const order = orders.find((o: any) => o.id === selectedOrder);
    if (!order) return;
  
    // Calculate total quantity - Fixed syntax
    const totalQty = items.reduce((sum, item) => sum + (Number(item.qty) || 0), 0);
  
    const dispatchData = {
      calibrationRequired,
      calibrationType: calibrationRequired === "YES" ? calibrationType : "",
      installationRequired,
      items,
      ewayBillDetails, // Add this line to include transport ID
      gstNumber,
      vehicleNumber,
      dispatchLocation,
      directDispatch,
      srnNumber,
      remarks,
      totalQty,
      processedAt: new Date().toISOString(),
    };
  
    const result = await updateOrderStatus(order, dispatchData);
  
    if (result.success) {
      setIsDialogOpen(false);
      setSelectedOrder("");
      let message = `Order ${selectedOrder} dispatch form has been processed successfully`;
      if (result.fileUrls) {
        message += "\n\nFiles uploaded to Google Drive:";
        if (result.fileUrls.ewayBillUrl) message += "\n- Eway Bill attachment";
        if (result.fileUrls.srnUrl) message += "\n- SRN Number attachment";
        if (result.fileUrls.paymentUrl) message += "\n- Payment attachment";
      }
      alert(message);
    } else {
      alert(`Error processing order: ${result.error}`);
    }
  };
  
  const updateOrderStatus = async (order: any, dispatchData: any) => {
    try {
      setUploading(true);
  
      const formData = new FormData();
      formData.append("sheetName", "DISPATCH-DELIVERY");
      formData.append("action", "insert");
      formData.append("orderNo", order.id);
  
      // Handle file uploads (keep existing file upload code)
      if (ewayBillAttachment) {
        try {
          const base64Data = await convertFileToBase64(ewayBillAttachment);
          formData.append("ewayBillFile", base64Data);
          formData.append("ewayBillFileName", ewayBillAttachment.name);
          formData.append("ewayBillMimeType", ewayBillAttachment.type);
        } catch (error) {
          console.error("Error converting Eway Bill file:", error);
        }
      }
  
      if (srnNumberAttachment) {
        try {
          const base64Data = await convertFileToBase64(srnNumberAttachment);
          formData.append("srnFile", base64Data);
          formData.append("srnFileName", srnNumberAttachment.name);
          formData.append("srnMimeType", srnNumberAttachment.type);
        } catch (error) {
          console.error("Error converting SRN file:", error);
        }
      }
  
      if (paymentAttachment) {
        try {
          const base64Data = await convertFileToBase64(paymentAttachment);
          formData.append("paymentFile", base64Data);
          formData.append("paymentFileName", paymentAttachment.name);
          formData.append("paymentMimeType", paymentAttachment.type);
        } catch (error) {
          console.error("Error converting Payment file:", error);
        }
      }
  
      const rowData = new Array(105).fill("");
  
      // Add today's date in column A (index 0)
      const today = new Date();
      const formattedDate =
        `${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()} ` +
        `${today.getHours()}:${today.getMinutes()}:${today.getSeconds()}`;
  
      rowData[0] = formattedDate;
      rowData[1] = order.id;
      rowData[22] = dispatchData.calibrationRequired;
      rowData[23] = dispatchData.calibrationType || "";
      rowData[24] = dispatchData.installationRequired;
      rowData[25] = dispatchData.ewayBillDetails;
      rowData[27] = dispatchData.srnNumber;
  
      // Process first 14 items in individual columns (AE-BB: index 30-57)
      const first14Items = dispatchData.items.slice(0, 14);
      let columnIndex = 30;
      first14Items.forEach((item: any) => {
        if (columnIndex + 1 < 58) { // Stop at column BB (index 57)
          rowData[columnIndex] = item.name;
          rowData[columnIndex + 1] = item.qty;
          columnIndex += 2;
        }
      });
  
      // Items 15+ go to column BC (index 58) as JSON
      const remainingItems = dispatchData.items.slice(14);
      if (remainingItems.length > 0) {
        const jsonItems = remainingItems.map(item => ({
          name: item.name,
          quantity: item.qty.toString()
        }));
        rowData[58] = JSON.stringify(jsonItems); // Column BC
      }
  
      // Total quantity goes to column BD (index 59)
      rowData[59] = dispatchData.totalQty;
      // GST Number goes to column BJ (index 61)
rowData[61] = dispatchData.gstNumber || "";

// Vehicle Number goes to column AA (index 26)
rowData[26] = dispatchData.vehicleNumber || "";
// Add this mapping for Transport ID (Eway Bill Details)
rowData[25] = dispatchData.ewayBillDetails || "";  // Column Z (index 25)

// Remove any other assignments to rowData[25] that might be conflicting

// Dispatch Location goes to column AB (index 27)
rowData[103] = dispatchData.dispatchLocation || "";
  // Direct Dispatch goes to column CZ (index 103)
rowData[104] = dispatchData.directDispatch || "";
      // Remarks go to column BE (index 60)
      rowData[60] = dispatchData.remarks || "";
  
      formData.append("rowData", JSON.stringify(rowData));
  
      const updateResponse = await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        mode: "cors",
        body: formData,
      });
  
      if (!updateResponse.ok) {
        throw new Error(`HTTP error! status: ${updateResponse.status}`);
      }
  
      let result;
      try {
        const responseText = await updateResponse.text();
        result = JSON.parse(responseText);
      } catch (parseError) {
        result = { success: true };
      }
  
      if (result.success !== false) {
        await fetchPendingOrders();
        return { success: true, fileUrls: result.fileUrls };
      } else {
        throw new Error(result.error || "Update failed");
      }
    } catch (err: any) {
      console.error("Error updating order:", err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setUploading(false);
    }
  };

  const handleView = (order: any) => {
    setViewOrder(order)
    setViewDialogOpen(true)
  }

  const handleRefresh = async () => {
    setLoading(true)
    setProcessedLoading(true)
    await fetchPendingOrders()
    await fetchProcessedOrders()
    setLoading(false)
    setProcessedLoading(false)
  }

  // Update the renderCellContent function to handle these fields as hyperlinks
const renderCellContent = (order, columnKey) => {
  const value = order[columnKey]

  switch (columnKey) {
case "actions":
  return (
    <Button 
      size="sm" 
      onClick={() => handleProcess(order.id)}
      disabled={currentUser?.role === "user"}
    >
      {currentUser?.role === "user" ? "View Only" : "Process"}
    </Button>
  )
    case "quotationCopy":
    case "quotationCopyHistory":
      // return <Badge variant={value === "Available" ? "default" : "secondary"}>{value || "N/A"}</Badge>
    case "acceptanceCopy":
    case "ewayBillAttachment":
    case "srnNumberAttachment":
    case "attachment":
      return value && (value.startsWith("http") || value.startsWith("https")) ? (
        <a href={value} target="_blank" rel="noopener noreferrer">
          <Badge variant="default">View Attachment</Badge>
        </a>
      ) : (
        <Badge variant="secondary">{value || "N/A"}</Badge>
      )
    case "calibrationRequired":
    case "installationRequired":
      return <Badge variant={value === "YES" ? "default" : "destructive"}>{value || "N/A"}</Badge>
    case "billingAddress":
    case "shippingAddress":
    case "remarks":
      return <div className="max-w-[200px] whitespace-normal break-words">{value}</div>
    case "amount":
      return value ? `₹${Number(value).toLocaleString()}` : ""
    default:
      return value || ""
  }
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
            <Button onClick={fetchPendingOrders} className="mt-4">
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
    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
      Pre Invoice Form
    </h1>
    {currentUser && (
      <p className="text-sm text-muted-foreground mt-1">
        Logged in as: {currentUser.fullName} ({currentUser.role})
      </p>
    )}
  </div>
  <Button onClick={handleRefresh} variant="outline">
    <RefreshCw className="h-4 w-4 mr-2" />
    Refresh
  </Button>
</div>

        {/* Search and Filter Controls */}
        <div className="flex gap-4 items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending">Pending ({filteredOrders.length})</TabsTrigger>
            <TabsTrigger value="history" onClick={handleProcessedTabClick}>
              History ({filteredProcessedOrders.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
  <Card>
    <CardHeader>
      <div className="flex justify-between items-center">
        <div>
          <CardTitle>Pending Pre Invoice Forms</CardTitle>
          <CardDescription>Orders waiting for dispatch form processing</CardDescription>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Column Visibility
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-80 max-h-96 overflow-y-auto">
            <DropdownMenuLabel>Show/Hide Columns</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="flex gap-2 p-2">
              <Button size="sm" variant="outline" onClick={showAllPendingColumns}>
                Show All
              </Button>
              <Button size="sm" variant="outline" onClick={hideAllPendingColumns}>
                Hide All
              </Button>
            </div>
            <DropdownMenuSeparator />
            <div className="p-2 space-y-2">
              {pendingColumns.map((column) => (
                <div key={column.key} className="flex items-center space-x-2">
                  <Checkbox
                    id={`pending-${column.key}`}
                    checked={visiblePendingColumns[column.key]}
                    onCheckedChange={() => togglePendingColumn(column.key)}
                  />
                  <Label htmlFor={`pending-${column.key}`} className="text-sm">
                    {column.label}
                  </Label>
                </div>
              ))}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </CardHeader>
    <CardContent>
      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <div style={{ minWidth: 'max-content' }}>
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-gray-50">
                <TableRow>
                  {pendingColumns
                    .filter((col) => visiblePendingColumns[col.key])
                    .map((column) => (
                      <TableHead 
                        key={column.key}
                        className="bg-gray-50 font-semibold text-gray-900 border-b-2 border-gray-200 px-4 py-3"
                        style={{ 
                          width: column.key === 'actions' ? '120px' : 
                                 column.key === 'orderNo' ? '120px' :
                                 column.key === 'quotationNo' ? '150px' :
                                 column.key === 'companyName' ? '250px' :
                                 column.key === 'contactPersonName' ? '180px' :
                                 column.key === 'contactNumber' ? '140px' :
                                 column.key === 'billingAddress' ? '200px' :
                                 column.key === 'shippingAddress' ? '200px' :
                                 column.key === 'isOrderAcceptable' ? '150px' :
                                 column.key === 'orderAcceptanceChecklist' ? '250px' :
                                 column.key === 'remarks' ? '200px' :
                                 '160px',
                          minWidth: column.key === 'actions' ? '120px' : 
                                   column.key === 'orderNo' ? '120px' :
                                   column.key === 'quotationNo' ? '150px' :
                                   column.key === 'companyName' ? '250px' :
                                   column.key === 'contactPersonName' ? '180px' :
                                   column.key === 'contactNumber' ? '140px' :
                                   column.key === 'billingAddress' ? '200px' :
                                   column.key === 'shippingAddress' ? '200px' :
                                   column.key === 'isOrderAcceptable' ? '150px' :
                                   column.key === 'orderAcceptanceChecklist' ? '250px' :
                                   column.key === 'remarks' ? '200px' :
                                   '160px',
                          maxWidth: column.key === 'actions' ? '120px' : 
                                   column.key === 'orderNo' ? '120px' :
                                   column.key === 'quotationNo' ? '150px' :
                                   column.key === 'companyName' ? '250px' :
                                   column.key === 'contactPersonName' ? '180px' :
                                   column.key === 'contactNumber' ? '140px' :
                                   column.key === 'billingAddress' ? '200px' :
                                   column.key === 'shippingAddress' ? '200px' :
                                   column.key === 'isOrderAcceptable' ? '150px' :
                                   column.key === 'orderAcceptanceChecklist' ? '250px' :
                                   column.key === 'remarks' ? '200px' :
                                   '160px'
                        }}
                      >
                        <div className="break-words">
                          {column.label}
                        </div>
                      </TableHead>
                    ))}
                </TableRow>
              </TableHeader>
            </Table>
            
            <div className="overflow-y-auto" style={{ maxHeight: '500px' }}>
              <Table>
                <TableBody>
                  {filteredOrders.map((order) => (
                    <TableRow key={order.id} className="hover:bg-gray-50">
                      {pendingColumns
                        .filter((col) => visiblePendingColumns[col.key])
                        .map((column) => (
                          <TableCell 
                            key={column.key} 
                            className="border-b px-4 py-3 align-top"
                            style={{ 
                              width: column.key === 'actions' ? '120px' : 
                                     column.key === 'orderNo' ? '120px' :
                                     column.key === 'quotationNo' ? '150px' :
                                     column.key === 'companyName' ? '250px' :
                                     column.key === 'contactPersonName' ? '180px' :
                                     column.key === 'contactNumber' ? '140px' :
                                     column.key === 'billingAddress' ? '200px' :
                                     column.key === 'shippingAddress' ? '200px' :
                                     column.key === 'isOrderAcceptable' ? '150px' :
                                     column.key === 'orderAcceptanceChecklist' ? '250px' :
                                     column.key === 'remarks' ? '200px' :
                                     '160px',
                              minWidth: column.key === 'actions' ? '120px' : 
                                       column.key === 'orderNo' ? '120px' :
                                       column.key === 'quotationNo' ? '150px' :
                                       column.key === 'companyName' ? '250px' :
                                       column.key === 'contactPersonName' ? '180px' :
                                       column.key === 'contactNumber' ? '140px' :
                                       column.key === 'billingAddress' ? '200px' :
                                       column.key === 'shippingAddress' ? '200px' :
                                       column.key === 'isOrderAcceptable' ? '150px' :
                                       column.key === 'orderAcceptanceChecklist' ? '250px' :
                                       column.key === 'remarks' ? '200px' :
                                       '160px',
                              maxWidth: column.key === 'actions' ? '120px' : 
                                       column.key === 'orderNo' ? '120px' :
                                       column.key === 'quotationNo' ? '150px' :
                                       column.key === 'companyName' ? '250px' :
                                       column.key === 'contactPersonName' ? '180px' :
                                       column.key === 'contactNumber' ? '140px' :
                                       column.key === 'billingAddress' ? '200px' :
                                       column.key === 'shippingAddress' ? '200px' :
                                       column.key === 'isOrderAcceptable' ? '150px' :
                                       column.key === 'orderAcceptanceChecklist' ? '250px' :
                                       column.key === 'remarks' ? '200px' :
                                       '160px'
                            }}
                          >
                            <div className="break-words whitespace-normal leading-relaxed">
                              {renderCellContent(order, column.key)}
                            </div>
                          </TableCell>
                        ))}
                    </TableRow>
                  ))}
                  {filteredOrders.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={pendingColumns.filter((col) => visiblePendingColumns[col.key]).length}
                        className="text-center text-muted-foreground h-32"
                      >
                        {searchTerm
                          ? "No orders match your search criteria"
                          : "No pending orders found in Google Sheets"}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
</TabsContent>

<TabsContent value="history" className="space-y-4">
  <Card>
    <CardHeader>
      <div className="flex justify-between items-center">
        <div>
          <CardTitle>DISP Form History</CardTitle>
          <CardDescription>Previously processed dispatch forms</CardDescription>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Column Visibility
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-80 max-h-96 overflow-y-auto">
            <DropdownMenuLabel>Show/Hide Columns</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="flex gap-2 p-2">
              <Button size="sm" variant="outline" onClick={showAllHistoryColumns}>
                Show All
              </Button>
              <Button size="sm" variant="outline" onClick={hideAllHistoryColumns}>
                Hide All
              </Button>
            </div>
            <DropdownMenuSeparator />
            <div className="p-2 space-y-2">
              {historyColumns.map((column) => (
                <div key={column.key} className="flex items-center space-x-2">
                  <Checkbox
                    id={`history-${column.key}`}
                    checked={visibleHistoryColumns[column.key]}
                    onCheckedChange={() => toggleHistoryColumn(column.key)}
                  />
                  <Label htmlFor={`history-${column.key}`} className="text-sm">
                    {column.label}
                  </Label>
                </div>
              ))}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </CardHeader>
    <CardContent>
      {processedLoading ? (
        <div className="flex items-center justify-center h-32">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span className="ml-2">Loading processed orders...</span>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <div style={{ minWidth: 'max-content' }}>
              <Table>
                <TableHeader className="sticky top-0 z-10 bg-gray-50">
                  <TableRow>
                    {historyColumns
                      .filter((col) => visibleHistoryColumns[col.key])
                      .map((column) => (
                        <TableHead 
                          key={column.key}
                          className="bg-gray-50 font-semibold text-gray-900 border-b-2 border-gray-200 px-4 py-3"
                          style={{ 
                            width: column.key === 'orderNo' ? '120px' :
                                   column.key === 'quotationNo' ? '150px' :
                                   column.key === 'companyName' ? '250px' :
                                   column.key === 'contactPersonName' ? '180px' :
                                   column.key === 'contactNumber' ? '140px' :
                                   column.key === 'billingAddress' ? '200px' :
                                   column.key === 'shippingAddress' ? '200px' :
                                   column.key === 'isOrderAcceptable' ? '150px' :
                                   column.key === 'orderAcceptanceChecklist' ? '250px' :
                                   column.key === 'remarks' ? '200px' :
                                   column.key === 'availabilityStatus' ? '150px' :
                                   column.key === 'inventoryRemarks' ? '200px' :
                                   '160px',
                            minWidth: column.key === 'orderNo' ? '120px' :
                                     column.key === 'quotationNo' ? '150px' :
                                     column.key === 'companyName' ? '250px' :
                                     column.key === 'contactPersonName' ? '180px' :
                                     column.key === 'contactNumber' ? '140px' :
                                     column.key === 'billingAddress' ? '200px' :
                                     column.key === 'shippingAddress' ? '200px' :
                                     column.key === 'isOrderAcceptable' ? '150px' :
                                     column.key === 'orderAcceptanceChecklist' ? '250px' :
                                     column.key === 'remarks' ? '200px' :
                                     column.key === 'availabilityStatus' ? '150px' :
                                     column.key === 'inventoryRemarks' ? '200px' :
                                     '160px',
                            maxWidth: column.key === 'orderNo' ? '120px' :
                                     column.key === 'quotationNo' ? '150px' :
                                     column.key === 'companyName' ? '250px' :
                                     column.key === 'contactPersonName' ? '180px' :
                                     column.key === 'contactNumber' ? '140px' :
                                     column.key === 'billingAddress' ? '200px' :
                                     column.key === 'shippingAddress' ? '200px' :
                                     column.key === 'isOrderAcceptable' ? '150px' :
                                     column.key === 'orderAcceptanceChecklist' ? '250px' :
                                     column.key === 'remarks' ? '200px' :
                                     column.key === 'availabilityStatus' ? '150px' :
                                     column.key === 'inventoryRemarks' ? '200px' :
                                     '160px'
                          }}
                        >
                          <div className="break-words">
                            {column.label}
                          </div>
                        </TableHead>
                      ))}
                  </TableRow>
                </TableHeader>
              </Table>
              
              <div className="overflow-y-auto" style={{ maxHeight: '500px' }}>
                <Table>
                  <TableBody>
                    {filteredProcessedOrders.map((order) => (
                      <TableRow key={order.orderNo} className="hover:bg-gray-50">
                        {historyColumns
                          .filter((col) => visibleHistoryColumns[col.key])
                          .map((column) => (
                            <TableCell 
                              key={column.key} 
                              className="border-b px-4 py-3 align-top"
                              style={{ 
                                width: column.key === 'orderNo' ? '120px' :
                                       column.key === 'quotationNo' ? '150px' :
                                       column.key === 'companyName' ? '250px' :
                                       column.key === 'contactPersonName' ? '180px' :
                                       column.key === 'contactNumber' ? '140px' :
                                       column.key === 'billingAddress' ? '200px' :
                                       column.key === 'shippingAddress' ? '200px' :
                                       column.key === 'isOrderAcceptable' ? '150px' :
                                       column.key === 'orderAcceptanceChecklist' ? '250px' :
                                       column.key === 'remarks' ? '200px' :
                                       column.key === 'availabilityStatus' ? '150px' :
                                       column.key === 'inventoryRemarks' ? '200px' :
                                       '160px',
                                minWidth: column.key === 'orderNo' ? '120px' :
                                         column.key === 'quotationNo' ? '150px' :
                                         column.key === 'companyName' ? '250px' :
                                         column.key === 'contactPersonName' ? '180px' :
                                         column.key === 'contactNumber' ? '140px' :
                                         column.key === 'billingAddress' ? '200px' :
                                         column.key === 'shippingAddress' ? '200px' :
                                         column.key === 'isOrderAcceptable' ? '150px' :
                                         column.key === 'orderAcceptanceChecklist' ? '250px' :
                                         column.key === 'remarks' ? '200px' :
                                         column.key === 'availabilityStatus' ? '150px' :
                                         column.key === 'inventoryRemarks' ? '200px' :
                                         '160px',
                                maxWidth: column.key === 'orderNo' ? '120px' :
                                         column.key === 'quotationNo' ? '150px' :
                                         column.key === 'companyName' ? '250px' :
                                         column.key === 'contactPersonName' ? '180px' :
                                         column.key === 'contactNumber' ? '140px' :
                                         column.key === 'billingAddress' ? '200px' :
                                         column.key === 'shippingAddress' ? '200px' :
                                         column.key === 'isOrderAcceptable' ? '150px' :
                                         column.key === 'orderAcceptanceChecklist' ? '250px' :
                                         column.key === 'remarks' ? '200px' :
                                         column.key === 'availabilityStatus' ? '150px' :
                                         column.key === 'inventoryRemarks' ? '200px' :
                                         '160px'
                              }}
                            >
                              <div className="break-words whitespace-normal leading-relaxed">
                                {renderCellContent(order, column.key)}
                              </div>
                            </TableCell>
                          ))}
                      </TableRow>
                    ))}
                    {filteredProcessedOrders.length === 0 && (
                      <TableRow>
                        <TableCell
                          colSpan={historyColumns.filter((col) => visibleHistoryColumns[col.key]).length}
                          className="text-center text-muted-foreground h-32"
                        >
                          {searchTerm ? "No orders match your search criteria" : "No processed orders found"}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </div>
      )}
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
                <Select value={calibrationRequired} onValueChange={setCalibrationRequired} required>
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
                      <SelectItem value="Surevey Instruments">Survey Instruments</SelectItem>
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

              {/* Eway Bill Details */}
              <div className="space-y-2">
                <Label htmlFor="ewayBill">Transport Id/Name</Label>
                <Input
                  id="ewayBill"
                  value={ewayBillDetails}
                  onChange={(e) => setEwayBillDetails(e.target.value)}
                  placeholder="Enter Eway Bill details"
                />
              </div>

              {/* Remove Eway Bill Attachment and add new fields */}
<div className="space-y-2">
  <Label htmlFor="gstNumber">GST Number</Label>
  <Input
    id="gstNumber"
    value={gstNumber}
    onChange={(e) => setGstNumber(e.target.value)}
    placeholder="Enter GST Number"
  />
</div>

<div className="space-y-2">
  <Label htmlFor="vehicleNumber">Vehicle Number</Label>
  <Input
    id="vehicleNumber"
    value={vehicleNumber}
    onChange={(e) => setVehicleNumber(e.target.value)}
    placeholder="Enter Vehicle Number"
  />
</div>

<div className="space-y-2">
  <Label htmlFor="dispatchLocation">Dispatch Location</Label>
  <Select value={dispatchLocation} onValueChange={setDispatchLocation}>
    <SelectTrigger>
      <SelectValue placeholder="Select dispatch location" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="By C.G.Warehouse">By C.G.Warehouse</SelectItem>
      <SelectItem value="By Head office">By Head office</SelectItem>
      <SelectItem value="By N.E Warehouse">By N.E Warehouse</SelectItem>
      <SelectItem value="Direct Dispatch">Direct Dispatch</SelectItem>
      <SelectItem value="Maniquip store">Maniquip store</SelectItem>
    </SelectContent>
  </Select>
</div>

{/* Direct Dispatch Input */}
<div className="space-y-2">
  <Label htmlFor="directDispatch">Direct Dispatch Details</Label>
  <Input
    id="directDispatch"
    value={directDispatch}
    onChange={(e) => setDirectDispatch(e.target.value)}
    placeholder="Enter direct dispatch details"
  />
</div>

              {/* SRN Number */}
              <div className="space-y-2">
                <Label htmlFor="srnNumber">SRN Number</Label>
                <Input
                  id="srnNumber"
                  value={srnNumber}
                  onChange={(e) => setSrnNumber(e.target.value)}
                  placeholder="Enter SRN Number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="srnNumberAttachment">SRN Number Attachment</Label>
                <Input
                  id="srnNumberAttachment"
                  type="file"
                  accept=".pdf,.doc,.docx,image/*"
                  onChange={(e) => setSrnNumberAttachment(e.target.files?.[0] || null)}
                />
                {srnNumberAttachment && (
                  <p className="text-sm text-muted-foreground">Selected: {srnNumberAttachment.name}</p>
                )}
              </div>

              <div className="space-y-4">
  {/* <div className="flex items-center justify-between">
    <Label>Items (Total: {items.length}, First 15 individual, Rest as JSON)</Label>
    <Button type="button" size="sm" onClick={addItem}>
      <Plus className="h-4 w-4 mr-1" />
      Add Item ({items.length})
    </Button>
  </div> */}
  
  {/* Show first 15 items normally */}
  {items.slice(0, 15).map((item, index) => (
    <div key={index} className="flex gap-2 items-end">
      <div className="flex-1">
        <Label htmlFor={`itemName-${index}`}>Item Name {index + 1}</Label>
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
  
  {/* Show remaining items (16+) in a condensed format */}
  {items.length > 15 && (
    <div className="border-t pt-4">
      <Label className="text-orange-600">Additional Items (16+) - Will be stored as JSON:</Label>
      {items.slice(15).map((item, index) => (
        <div key={index + 15} className="flex gap-2 items-end mt-2">
          <div className="flex-1">
            <Label htmlFor={`itemName-${index + 15}`}>Item Name {index + 16}</Label>
            <Input
              id={`itemName-${index + 15}`}
              value={item.name}
              onChange={(e) => updateItem(index + 15, "name", e.target.value)}
              placeholder="Enter item name"
            />
          </div>
          <div className="w-24">
            <Label htmlFor={`qty-${index + 15}`}>QTY</Label>
            <Input
              id={`qty-${index + 15}`}
              type="number"
              value={item.qty}
              onChange={(e) => updateItem(index + 15, "qty", Number.parseInt(e.target.value) || 0)}
              placeholder="0"
            />
          </div>
          <Button type="button" size="sm" variant="outline" onClick={() => removeItem(index + 15)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  )}
</div>

              <div className="space-y-2">
                <Label htmlFor="paymentDetails">Payment Details (Attachment) - In case of Advance</Label>
                <Input
                  id="paymentDetails"
                  type="file"
                  accept=".pdf,.doc,.docx,image/*"
                  onChange={(e) => setPaymentAttachment(e.target.files?.[0] || null)}
                />
                {paymentAttachment && (
                  <p className="text-sm text-muted-foreground">Selected: {paymentAttachment.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="remarks">Remarks</Label>
                <Input
                  id="remarks"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Enter any additional remarks"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
               <Button 
  onClick={handleSubmit} 
  disabled={!calibrationRequired || !installationRequired || uploading || currentUser?.role === "user"}
>
  {uploading ? (
    <>
      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
      Uploading...
    </>
  ) : (
    currentUser?.role === "user" ? "View Only" : "Submit"
  )}
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

