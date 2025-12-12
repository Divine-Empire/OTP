"use client"

import { useState, useEffect, useMemo } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { useData } from "@/components/data-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { RefreshCw, Upload, Search, Settings } from "lucide-react"
import { useAuth } from "@/components/auth-provider"

export default function DeliveryPage() {
  const { orders, updateOrder } = useData()
  const [selectedOrder, setSelectedOrder] = useState<string>("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [viewOrder, setViewOrder] = useState<any>(null)
  const [pendingOrders, setPendingOrders] = useState<any[]>([])
  const [historyOrders, setHistoryOrders] = useState<any[]>([])
  const { user: currentUser } = useAuth()

  const APPS_SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbyzW8-RldYx917QpAfO4kY-T8_ntg__T0sbr7Yup2ZTVb1FC5H1g6TYuJgAU6wTquVM/exec"
  const SHEET_ID = "1yEsh4yzyvglPXHxo-5PT70VpwVJbxV7wwH8rpU1RFJA"
  const SHEET_NAME = "DISPATCH-DELIVERY"

  // Column definitions for Pending tab (B to BJ plus warehouse material history and calibration history)
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
    { key: "quotationCopy", label: "Quotation Copy", searchable: true },
    { key: "paymentTerms", label: "Payment Terms(In Days)", searchable: true },
    { key: "transportMode", label: "Transport Mode", searchable: true },
    { key: "freightType", label: "Freight Type", searchable: true },
    { key: "destination", label: "Destination", searchable: true },
    { key: "poNumber", label: "Po Number", searchable: true },
    { key: "quotationCopy2", label: "Quotation Copy", searchable: true },
    { key: "acceptanceCopy", label: "Acceptance Copy (Purchase Order Only)", searchable: true },
    { key: "offer", label: "Offer", searchable: true },
    { key: "conveyedForRegistration", label: "Conveyed For Registration Form", searchable: true },
    { key: "qty", label: "Qty", searchable: true },
    { key: "amount", label: "Amount", searchable: true },
    { key: "approvedName", label: "Approved Name", searchable: true },
    { key: "calibrationCertRequired", label: "Calibration Certificate Required", searchable: true },
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
    // Warehouse material history headers (BV to CC)
    { key: "beforePhotoUpload", label: "Before Photo Upload", searchable: false },
    { key: "afterPhotoUpload", label: "After Photo Upload", searchable: false },
    { key: "biltyUpload", label: "Bilty Upload", searchable: false },
    { key: "transporterName", label: "Transporter/Courier/Flight-Person Name", searchable: true },
    { key: "transporterContact", label: "Transporter/Courier/Flight-Person Contact No.", searchable: true },
    { key: "biltyNumber", label: "Transporter/Courier/Flight-Bilty No./Docket No.", searchable: true },
    { key: "totalCharges", label: "Total Charges", searchable: true },
    { key: "warehouseRemarks", label: "Warehouse Remarks", searchable: true },
    // Material receiving status (CG to CI)
    { key: "materialReceivingStatus", label: "Material Receiving Status", searchable: true },
    { key: "reason", label: "Reason", searchable: true },
    { key: "installationRequiredHistory", label: "Installation Required", searchable: true },
    // Calibration history (CM to CT)
    { key: "labCalibrationCertificate", label: "Lab Calibration Certificate", searchable: false },
    { key: "stCalibrationCertificate", label: "ST Calibration Certificate", searchable: false },
    { key: "labCalibrationDate", label: "Lab Calibration Date", searchable: true },
    { key: "stCalibrationDate", label: "ST Calibration Date", searchable: true },
    { key: "labCalibrationPeriod", label: "Lab Calibration Period", searchable: true },
    { key: "stCalibrationPeriod", label: "ST Calibration Period", searchable: true },
    { key: "labDueDate", label: "Lab Due Date", searchable: true },
    { key: "stDueDate", label: "ST Due Date", searchable: true },
    { key: "dSrNumber", label: "D-Sr Number", searchable: true }, 
  ]

  // Column definitions for History tab (includes Upload DN column CX)
  const historyColumns = [
    ...pendingColumns.filter((col) => col.key !== "actions"),
    // Upload DN column (CX)
    { key: "uploadDN", label: "Upload DN", searchable: false },
    { key: "dSrNumber", label: "D-Sr Number", searchable: true }, 
  ]

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedColumn, setSelectedColumn] = useState("all")
  const [visiblePendingColumns, setVisiblePendingColumns] = useState(
    pendingColumns.reduce((acc, col) => ({ ...acc, [col.key]: true }), {}),
  )
  const [visibleHistoryColumns, setVisibleHistoryColumns] = useState(
    historyColumns.reduce((acc, col) => ({ ...acc, [col.key]: true }), {}),
  )

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deliveryPhoto, setDeliveryPhoto] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  const formatGoogleSheetsDate = (dateValue) => {
    if (!dateValue) return "";
  
    // Handle the case where date comes as "Date(2025,5,21)"
    if (typeof dateValue === "string" && dateValue.startsWith("Date(")) {
      try {
        // Extract the numbers between parentheses
        const dateParts = dateValue.match(/Date\((\d+),(\d+),(\d+)\)/);
        if (dateParts && dateParts.length === 4) {
          const year = parseInt(dateParts[1]);
          const month = parseInt(dateParts[2]); // Note: months are 0-indexed in JS
          const day = parseInt(dateParts[3]);
          
          // Create a date object (month is 0-indexed in JS, so no need to subtract 1)
          const date = new Date(year, month, day);
          
          // Format as dd/mm/yyyy
          const formattedDay = String(date.getDate()).padStart(2, '0');
          const formattedMonth = String(date.getMonth() + 1).padStart(2, '0'); // +1 because months are 0-indexed
          const formattedYear = date.getFullYear();
          
          return `${formattedDay}/${formattedMonth}/${formattedYear}`;
        }
      } catch (e) {
        console.error("Error parsing date string:", e);
      }
    }
  
    // Handle case where date comes as a serial number or string
    try {
      // If it's a number (serial date value from Google Sheets)
      if (typeof dateValue === 'number') {
        // Google Sheets serial date starts from Dec 30, 1899
        const date = new Date(Math.round((dateValue - 25569) * 86400 * 1000));
        const formattedDay = String(date.getDate()).padStart(2, '0');
        const formattedMonth = String(date.getMonth() + 1).padStart(2, '0');
        const formattedYear = date.getFullYear();
        
        return `${formattedDay}/${formattedMonth}/${formattedYear}`;
      }
      
      // If it's already a date string in some format
      const date = new Date(dateValue);
      if (!isNaN(date.getTime())) {
        const formattedDay = String(date.getDate()).padStart(2, '0');
        const formattedMonth = String(date.getMonth() + 1).padStart(2, '0');
        const formattedYear = date.getFullYear();
        
        return `${formattedDay}/${formattedMonth}/${formattedYear}`;
      }
    } catch (e) {
      console.error("Error parsing date value:", e);
    }
  
    // If all else fails, return the original value
    return dateValue;
  };

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
            const buColumn = row.c[98] ? row.c[98].v : null // Column BU (warehouse processed)
            const cvColumn = row.c[99] ? row.c[99].v : null // Column CV (delivery processed)

            // Only include rows where BU is not null (warehouse processed) and CV is null (delivery not processed)
            if (buColumn && !cvColumn) {
              const order = {
                rowIndex: actualRowIndex,
                id: row.c[1] ? row.c[1].v : `ORDER-${actualRowIndex}`,
                orderNo: row.c[1] ? row.c[1].v : "", // Column B - Order No
                quotationNo: row.c[2] ? row.c[2].v : "", // Column C
                companyName: row.c[3] ? row.c[3].v : "",
                contactPersonName: row.c[4] ? row.c[4].v : "", // Fix field name to match column definition
                contactNumber: row.c[5] ? row.c[5].v : "",
                billingAddress: row.c[6] ? row.c[6].v : "",
                dSrNumber: row.c[105] ? row.c[105].v : "",
                shippingAddress: row.c[7] ? row.c[7].v : "",
                paymentMode: row.c[8] ? row.c[8].v : "",
                paymentTerms: row.c[9] ? row.c[9].v : "",
                qty: row.c[10] ? row.c[10].v : "", // Map to qty field for column definition
                transportMode: row.c[11] ? row.c[11].v : "",
                freightType: row.c[12] ? row.c[12].v : "",
                destination: row.c[13] ? row.c[13].v : "",
                poNumber: row.c[14] ? row.c[14].v : "",
                offer: row.c[15] ? row.c[15].v : "",
                amount: row.c[20] ? Number.parseFloat(row.c[20].v) || 0 : 0,
                invoiceNumber: row.c[65] ? row.c[65].v : "", // Column BO (invoice number)
                warehouseProcessedDate: buColumn,
                // Keep existing fields for backward compatibility
                contactPerson: row.c[4] ? row.c[4].v : "",
                quantity: row.c[10] ? row.c[10].v : "",
                totalQty: row.c[19] ? row.c[19].v : "",
                quotationCopy: row.c[15] ? row.c[15].v : "",
                fullRowData: row.c,
                conveyedForRegistration: row.c[18] ? row.c[18].v : "",
                approvedName: row.c[21] ? row.c[21].v : "",
                calibrationCertRequired: row.c[22] ? row.c[22].v : "",
                certificateCategory: row.c[23] ? row.c[23].v : "",
                installationRequired: row.c[24] ? row.c[24].v : "",
                ewayBillDetails: row.c[25] ? row.c[25].v : "",
                ewayBillAttachment: row.c[26] ? row.c[26].v : "",
                srnNumber: row.c[27] ? row.c[27].v : "",
                srnNumberAttachment: row.c[28] ? row.c[28].v : "",
                attachment: row.c[29] ? row.c[29].v : "",
                itemName1: row.c[30] ? row.c[30].v : "",
                quantity1: row.c[31] ? row.c[31].v : "",
                itemName2: row.c[32] ? row.c[32].v : "",
                quantity2: row.c[33] ? row.c[33].v : "",
                itemName3: row.c[34] ? row.c[34].v : "",
                quantity3: row.c[35] ? row.c[35].v : "",
                itemName4: row.c[36] ? row.c[36].v : "",
                quantity4: row.c[37] ? row.c[37].v : "",
                itemName5: row.c[38] ? row.c[38].v : "",
                quantity5: row.c[39] ? row.c[39].v : "",
                itemName6: row.c[40] ? row.c[40].v : "",
                quantity6: row.c[41] ? row.c[41].v : "",
                itemName7: row.c[42] ? row.c[42].v : "",
                quantity7: row.c[43] ? row.c[43].v : "",
                itemName8: row.c[44] ? row.c[44].v : "",
                quantity8: row.c[45] ? row.c[45].v : "",
                itemName9: row.c[46] ? row.c[46].v : "",
                quantity9: row.c[47] ? row.c[47].v : "",
                itemName10: row.c[48] ? row.c[48].v : "",
                quantity10: row.c[49] ? row.c[49].v : "",
                itemName11: row.c[50] ? row.c[50].v : "",
                quantity11: row.c[51] ? row.c[51].v : "",
                itemName12: row.c[52] ? row.c[52].v : "",
                quantity12: row.c[53] ? row.c[53].v : "",
                itemName13: row.c[54] ? row.c[54].v : "",
                quantity13: row.c[55] ? row.c[55].v : "",
                itemName14: row.c[56] ? row.c[56].v : "",
                quantity14: row.c[57] ? row.c[57].v : "",
                itemName15: row.c[58] ? row.c[58].v : "",
                quantity15: row.c[59] ? row.c[59].v : "",
                remarks: row.c[61] ? row.c[61].v : "",
                quotationCopy2: row.c[15] ? row.c[15].v : "",
                acceptanceCopy: row.c[16] ? row.c[16].v : "",
                // Warehouse material history headers (BV to CC)
                beforePhotoUpload: row.c[73] ? row.c[73].v : "", // Column BV
                afterPhotoUpload: row.c[74] ? row.c[74].v : "", // Column BW
                biltyUpload: row.c[75] ? row.c[75].v : "", // Column BX
                transporterName: row.c[76] ? row.c[76].v : "", // Column BY
                transporterContact: row.c[77] ? row.c[77].v : "", // Column BZ
                biltyNumber: row.c[78] ? row.c[78].v : "", // Column CA
                totalCharges: row.c[79] ? row.c[79].v : "", // Column CB
                warehouseRemarks: row.c[80] ? row.c[80].v : "", // Column CC
                // Material receiving status (CG to CI)
                materialReceivingStatus: row.c[84] ? row.c[84].v : "", // Column CG
                reason: row.c[85] ? row.c[85].v : "", // Column CH
                installationRequiredHistory: row.c[86] ? row.c[86].v : "", // Column CI
                // Calibration history (CM to CT)
                labCalibrationCertificate: row.c[90] ? row.c[90].v : "", // Column CM
                stCalibrationCertificate: row.c[91] ? row.c[91].v : "", // Column CN
                labCalibrationDate: formatGoogleSheetsDate(row.c[92] ? row.c[92].v : ""), // Column CO
                stCalibrationDate: formatGoogleSheetsDate(row.c[93] ? row.c[93].v : ""), // Column CP
                labCalibrationPeriod: row.c[94] ? row.c[94].v : "", // Column CQ
                stCalibrationPeriod: row.c[95] ? row.c[95].v : "", // Column CR
                labDueDate: formatGoogleSheetsDate(row.c[96] ? row.c[96].v : ""), // Column CS
                stDueDate: formatGoogleSheetsDate(row.c[97] ? row.c[97].v : ""), // Column CT
                creName: row.c[106] ? row.c[106].v : "", // Column CD (index 81) - CRE Name
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

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "N/A"

    // Handle Date() constructor format like "Date(2025,5,19)"
    if (dateStr.startsWith("Date(")) {
      try {
        const parts = dateStr.match(/Date$$(\d+),(\d+),(\d+)$$/)
        if (parts) {
          const year = Number.parseInt(parts[1])
          const month = Number.parseInt(parts[2])
          const day = Number.parseInt(parts[3])
          // Note: JavaScript months are 0-indexed (5 = June)
          return `${String(day).padStart(2, "0")}/${String(month + 1).padStart(2, "0")}/${year}`
        }
      } catch (e) {
        console.error("Error parsing Date() format:", e)
      }
    }

    // Handle ISO format like "2025-06-19"
    if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = dateStr.split("-")
      return `${day}/${month}/${year}`
    }

    // Handle other formats or return as-is if already formatted
    return dateStr
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
            const buColumn = row.c[98] ? row.c[98].v : null // Column BU (warehouse processed)
            const cvColumn = row.c[99] ? row.c[99].v : null // Column CV (delivery processed)

            // Only include rows where both BU and CV are not null
            if (buColumn && cvColumn) {
              const order = {
                rowIndex: actualRowIndex,
                id: row.c[1] ? row.c[1].v : `ORDER-${actualRowIndex}`,
                orderNo: row.c[1] ? row.c[1].v : "", // Column B - Order No
                quotationNo: row.c[2] ? row.c[2].v : "", // Column C
                companyName: row.c[3] ? row.c[3].v : "",
                contactPersonName: row.c[4] ? row.c[4].v : "", // Fix field name to match column definition
                contactNumber: row.c[5] ? row.c[5].v : "",
                billingAddress: row.c[6] ? row.c[6].v : "",
                shippingAddress: row.c[7] ? row.c[7].v : "",
                paymentMode: row.c[8] ? row.c[8].v : "",
                paymentTerms: row.c[9] ? row.c[9].v : "",
                qty: row.c[10] ? row.c[10].v : "", // Map to qty field for column definition
                transportMode: row.c[11] ? row.c[11].v : "",
                freightType: row.c[12] ? row.c[12].v : "",
                destination: row.c[13] ? row.c[13].v : "",
                dSrNumber: row.c[105] ? row.c[105].v : "",
                poNumber: row.c[14] ? row.c[14].v : "",
                offer: row.c[15] ? row.c[15].v : "",
                amount: row.c[12] ? Number.parseFloat(row.c[12].v) || 0 : 0,
                invoiceNumber: row.c[65] ? row.c[65].v : "", // Column BO (invoice number)
                warehouseProcessedDate: buColumn,
                deliveryProcessedDate: row.c[101] ? row.c[101].v : "", // Column CV contains the delivery processing date
                // Keep existing fields for backward compatibility
                contactPerson: row.c[4] ? row.c[4].v : "",
                quantity: row.c[10] ? row.c[10].v : "",
                totalQty: row.c[19] ? row.c[19].v : "",
                quotationCopy: row.c[15] ? row.c[15].v : "",
                fullRowData: row.c,
                deliveryData: {
                  processedAt: cvColumn,
                  processedBy: "Current User",
                },
                conveyedForRegistration: row.c[18] ? row.c[18].v : "",
                approvedName: row.c[21] ? row.c[21].v : "",
                calibrationCertRequired: row.c[22] ? row.c[22].v : "",
                certificateCategory: row.c[23] ? row.c[23].v : "",
                installationRequired: row.c[24] ? row.c[24].v : "",
                ewayBillDetails: row.c[25] ? row.c[25].v : "",
                ewayBillAttachment: row.c[26] ? row.c[26].v : "",
                srnNumber: row.c[27] ? row.c[27].v : "",
                srnNumberAttachment: row.c[28] ? row.c[28].v : "",
                attachment: row.c[29] ? row.c[29].v : "",
                itemName1: row.c[30] ? row.c[30].v : "",
                quantity1: row.c[31] ? row.c[31].v : "",
                itemName2: row.c[32] ? row.c[32].v : "",
                quantity2: row.c[33] ? row.c[33].v : "",
                itemName3: row.c[34] ? row.c[34].v : "",
                quantity3: row.c[35] ? row.c[35].v : "",
                itemName4: row.c[36] ? row.c[36].v : "",
                quantity4: row.c[37] ? row.c[37].v : "",
                itemName5: row.c[38] ? row.c[38].v : "",
                quantity5: row.c[39] ? row.c[39].v : "",
                itemName6: row.c[40] ? row.c[40].v : "",
                quantity6: row.c[41] ? row.c[41].v : "",
                itemName7: row.c[42] ? row.c[42].v : "",
                quantity7: row.c[43] ? row.c[43].v : "",
                itemName8: row.c[44] ? row.c[44].v : "",
                quantity8: row.c[45] ? row.c[45].v : "",
                itemName9: row.c[46] ? row.c[46].v : "",
                quantity9: row.c[47] ? row.c[47].v : "",
                itemName10: row.c[48] ? row.c[48].v : "",
                quantity10: row.c[49] ? row.c[49].v : "",
                itemName11: row.c[50] ? row.c[50].v : "",
                quantity11: row.c[51] ? row.c[51].v : "",
                itemName12: row.c[52] ? row.c[52].v : "",
                quantity12: row.c[53] ? row.c[53].v : "",
                itemName13: row.c[54] ? row.c[54].v : "",
                quantity13: row.c[55] ? row.c[55].v : "",
                itemName14: row.c[56] ? row.c[56].v : "",
                quantity14: row.c[57] ? row.c[57].v : "",
                itemName15: row.c[58] ? row.c[58].v : "",
                quantity15: row.c[59] ? row.c[59].v : "",
                remarks: row.c[61] ? row.c[61].v : "",
                quotationCopy2: row.c[15] ? row.c[15].v : "",
                acceptanceCopy: row.c[16] ? row.c[16].v : "",
                // Warehouse material history headers (BV to CC)
                beforePhotoUpload: row.c[73] ? row.c[73].v : "", // Column BV
                afterPhotoUpload: row.c[74] ? row.c[74].v : "", // Column BW
                biltyUpload: row.c[75] ? row.c[75].v : "", // Column BX
                transporterName: row.c[76] ? row.c[76].v : "", // Column BY
                transporterContact: row.c[77] ? row.c[77].v : "", // Column BZ
                biltyNumber: row.c[78] ? row.c[78].v : "", // Column CA
                totalCharges: row.c[79] ? row.c[79].v : "", // Column CB
                warehouseRemarks: row.c[80] ? row.c[80].v : "", // Column CC
                // Material receiving status (CG to CI)
                materialReceivingStatus: row.c[84] ? row.c[84].v : "", // Column CG
                reason: row.c[85] ? row.c[85].v : "", // Column CH
                installationRequiredHistory: row.c[86] ? row.c[86].v : "", // Column CI
                // Calibration history (CM to CT)
                labCalibrationCertificate: row.c[90] ? row.c[90].v : "", // Column CM
                stCalibrationCertificate: row.c[91] ? row.c[91].v : "", // Column CN
                labCalibrationDate: formatGoogleSheetsDate(row.c[92] ? row.c[92].v : ""), // Column CO
                stCalibrationDate: formatGoogleSheetsDate(row.c[93] ? row.c[93].v : ""), // Column CP
                labCalibrationPeriod: row.c[94] ? row.c[94].v : "", // Column CQ
                creName: row.c[106] ? row.c[106].v : "", // Column CD (index 81) - CRE Name
                stCalibrationPeriod: row.c[95] ? row.c[95].v : "", // Column CR
                labDueDate: formatGoogleSheetsDate(row.c[96] ? row.c[96].v : ""), // Column CS
                stDueDate: formatGoogleSheetsDate(row.c[97] ? row.c[97].v : ""), // Column CT
                // Upload DN column (CX)
                uploadDN: row.c[101] ? row.c[101].v : "", // Column CX
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

  // Filter orders based on search term and selected column
const filterOrdersByUserRole = (orders: any[], currentUser: any) => {
  if (!currentUser) return orders;
  
  // Super admin sees all data
  if (currentUser.role === "super_admin") {
    return orders;
  }
  
  // Admin and regular users only see data where CRE Name matches their username
  return orders.filter(order => order.creName === currentUser.username);
};

// Update the filteredPendingOrders useMemo to include role-based filtering
const filteredPendingOrders = useMemo(() => {
  let filtered = pendingOrders;

  // Apply user role-based filtering
  filtered = filterOrdersByUserRole(filtered, currentUser);

  if (searchTerm) {
    filtered = filtered.filter((order) => {
      if (selectedColumn === "all") {
        const searchableFields = pendingColumns
          .filter((col) => col.searchable)
          .map((col) => String(order[col.key] || "").toLowerCase());
        return searchableFields.some((field) => field.includes(searchTerm.toLowerCase()));
      } else {
        const fieldValue = String(order[selectedColumn] || "").toLowerCase();
        return fieldValue.includes(searchTerm.toLowerCase());
      }
    });
  }

  return filtered;
}, [pendingOrders, searchTerm, selectedColumn, currentUser]);

// Update the filteredHistoryOrders useMemo to include role-based filtering
const filteredHistoryOrders = useMemo(() => {
  let filtered = historyOrders;

  // Apply user role-based filtering
  filtered = filterOrdersByUserRole(filtered, currentUser);

  if (searchTerm) {
    filtered = filtered.filter((order) => {
      if (selectedColumn === "all") {
        const searchableFields = historyColumns
          .filter((col) => col.searchable)
          .map((col) => String(order[col.key] || "").toLowerCase());
        return searchableFields.some((field) => field.includes(searchTerm.toLowerCase()));
      } else {
        const fieldValue = String(order[selectedColumn] || "").toLowerCase();
        return fieldValue.includes(searchTerm.toLowerCase());
      }
    });
  }

  return filtered;
}, [historyOrders, searchTerm, selectedColumn, currentUser]);

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

  // Legacy orders from useData hook
  const legacyPendingOrders = orders.filter((order) => order.status === "warehouse-processed")
  const legacyProcessedOrders = orders.filter((order) => order.deliveryData)

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
    formData.append("action", "updateByDSrNumber")
    
    // Make sure we're using the D-Sr number, not order ID
    const dSrNumber = order.dSrNumber || order.id
    formData.append("dSrNumber", dSrNumber)

    // Handle delivery photo upload
    if (deliveryPhoto) {
      try {
        const base64Data = await convertFileToBase64(deliveryPhoto)
        formData.append("deliveryPhotoFile", base64Data)
        formData.append("deliveryPhotoFileName", deliveryPhoto.name)
        formData.append("deliveryPhotoMimeType", deliveryPhoto.type)
      } catch (error) {
        console.error("Error converting delivery photo:", error)
      }
    }

    const rowData = new Array(110).fill("") 

    // Add today's date to CV column (index 100) - Column CV for delivery processed date
    const today = new Date()
    const formattedDate =
      `${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()} ` +
      `${today.getHours()}:${today.getMinutes()}:${today.getSeconds()}`

    rowData[99] = formattedDate // Column CV (index 99)

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

  const handleProcess = (order: any) => {
  setSelectedOrder(order)
  setDeliveryPhoto(null)
  setIsDialogOpen(true)
}

const handleSubmit = async () => {
  if (!selectedOrder) return

  // Use the D-Sr number from the selected order
  const result = await updateOrderStatus(selectedOrder)

  if (result.success) {
    setIsDialogOpen(false)
    setSelectedOrder(null)
    let message = `Delivery processing for D-Sr Number ${selectedOrder.dSrNumber} has been completed successfully`
    if (result.fileUrls && result.fileUrls.deliveryPhotoUrl) {
      message += "\n\nDelivery photo uploaded to Google Drive"
    }
    alert(message)
  } else {
    alert(`Error processing delivery operation: ${result.error}`)
  }
}

  const handleView = (order: any) => {
    setViewOrder(order)
    setViewDialogOpen(true)
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

  const handleRefresh = async () => {
    setLoading(true)
    try {
      await Promise.all([fetchPendingOrders(), fetchHistoryOrders()])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const renderCellContent = (order, columnKey) => {
    const value = order[columnKey]

    switch (columnKey) {
      case "actions":
        return (
          <Button size="sm" onClick={() => handleProcess(order)}>
            Process
          </Button>
        );
      case "quotationCopy":
      case "quotationCopy2":
      //   return <Badge variant={value === "" ? "default" : ""}>{value || ""}</Badge>
      case "acceptanceCopy":
        return value && typeof value === "string" && (value.startsWith("http") || value.startsWith("https")) ? (
          <a href={value} target="_blank" rel="noopener noreferrer">
            <Badge variant="default">Link</Badge>
          </a>
        ) : (
          <Badge variant="secondary">{value || ""}</Badge>
        )
      case "calibrationCertRequired":
      case "installationRequired":
      case "installationRequiredHistory":
        return <Badge variant={value === "Yes" || value === "YES" ? "default" : "secondary"}>{value || "N/A"}</Badge>
      case "billingAddress":
      case "shippingAddress":
      case "remarks":
      case "warehouseRemarks":
      case "reason":
        return <div className="max-w-[200px] whitespace-normal break-words">{value || ""}</div>
        case "acceptanceCopy":
    case "ewayBillAttachment":
    case "srnNumberAttachment":
    case "attachment":
    case "invoiceUpload":
    case "ewayBillUpload":
      case "beforePhotoUpload":
      case "afterPhotoUpload":
      case "biltyUpload":
      case "labCalibrationCertificate":
      case "stCalibrationCertificate":
      case "uploadDN":
        return value && typeof value === "string" && (value.startsWith("http") || value.startsWith("https")) ? (
          <a href={value} target="_blank" rel="noopener noreferrer">
            <Badge variant="default">View</Badge>
          </a>
        ) : (
          <Badge variant="secondary">N/A</Badge>
        )
      case "materialReceivingStatus":
        return <Badge variant={value === "yes" ? "default" : "secondary"}>{value || "N/A"}</Badge>
      case "labCalibrationDate":
      case "stCalibrationDate":
      case "labDueDate":
      case "stDueDate":
        return formatDate(value)
      default:
        return value || ""
    }
  }

  return (
    <MainLayout>
      <div className="space-y-6">
       <div className="flex justify-between items-center">
  <div>
    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
      Delivery Management
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
            <TabsTrigger value="pending">Pending ({filteredPendingOrders.length})</TabsTrigger>
            <TabsTrigger value="history">History ({filteredHistoryOrders.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Pending Delivery Operations</CardTitle>
                    <CardDescription>Orders ready for delivery processing</CardDescription>
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
                            {filteredPendingOrders.map((order) => (
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
                            {filteredPendingOrders.length === 0 && (
                              <TableRow>
                                <TableCell
                                  colSpan={pendingColumns.filter((col) => visiblePendingColumns[col.key]).length}
                                  className="text-center text-muted-foreground h-32"
                                >
                                  {searchTerm ? "No orders match your search criteria" : "No pending orders found"}
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
                    <CardTitle>Delivery History</CardTitle>
                    <CardDescription>Previously processed delivery operations</CardDescription>
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
                            {filteredHistoryOrders.map((order) => (
                              <TableRow key={order.id} className="hover:bg-gray-50">
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
                            {filteredHistoryOrders.length === 0 && (
                              <TableRow>
                                <TableCell
                                  colSpan={historyColumns.filter((col) => visibleHistoryColumns[col.key]).length}
                                  className="text-center text-muted-foreground h-32"
                                >
                                  {searchTerm ? "No orders match your search criteria" : "No history orders found"}
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
        </Tabs>

        {/* Process Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Delivery Processing</DialogTitle>
              <DialogDescription>Complete delivery documentation and enter delivery details</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {/* <div className="space-y-2">
                <Label htmlFor="orderNumber">Order Number</Label>
                <Input id="orderNumber" value={selectedOrder} disabled />
              </div> */}
              <div className="space-y-2">
  <Label htmlFor="orderNumber">Order Number</Label>
  <Input id="orderNumber" value={selectedOrder?.orderNo || selectedOrder} disabled />
</div>
<div className="space-y-2">
  <Label htmlFor="dSrNumber">D-Sr Number</Label>
  <Input id="dSrNumber" value={selectedOrder?.dSrNumber || "N/A"} disabled />
</div>

              {/* File Upload Section */}
              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">Delivery Photo Upload</h4>

                <div className="space-y-2">
                  <Label htmlFor="deliveryPhoto">Delivery Proof Photo</Label>
                  <Input
                    id="deliveryPhoto"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setDeliveryPhoto(e.target.files?.[0] || null)}
                  />
                  {deliveryPhoto && <p className="text-sm text-muted-foreground">Selected: {deliveryPhoto.name}</p>}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
               <Button 
  onClick={handleSubmit} 
  disabled={uploading || currentUser?.role === "user"}
>
  {uploading ? (
    <>
      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
      Processing...
    </>
  ) : (
    <>
      <Upload className="h-4 w-4 mr-2" />
      Complete Delivery
    </>
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
              <DialogTitle>Delivery Details</DialogTitle>
              <DialogDescription>View delivery operation details</DialogDescription>
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
                    <Label>Invoice Number</Label>
                    <p className="text-sm">{viewOrder.invoiceNumber || "N/A"}</p>
                  </div>
                  <div>
                    <Label>Transport Mode</Label>
                    <p className="text-sm">{viewOrder.transportMode}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Warehouse Processed</Label>
                    <p className="text-sm">{viewOrder.warehouseProcessedDate || "N/A"}</p>
                  </div>
                  <div>
                    <Label>Delivery Processed</Label>
                    <p className="text-sm">{viewOrder.deliveryProcessedDate || "N/A"}</p>
                  </div>
                </div>
                <div>
                  <Label>Shipping Address</Label>
                  <p className="text-sm">{viewOrder.shippingAddress || "N/A"}</p>
                </div>
                <div>
                  <Label>Destination</Label>
                  <p className="text-sm">{viewOrder.destination}</p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  )
}
