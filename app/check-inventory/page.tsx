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
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Trash2, RefreshCw, Search, Settings } from "lucide-react"
import { useAuth } from "@/components/auth-provider"

const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbyzW8-RldYx917QpAfO4kY-T8_ntg__T0sbr7Yup2ZTVb1FC5H1g6TYuJgAU6wTquVM/exec"
const SHEET_ID = "1yEsh4yzyvglPXHxo-5PT70VpwVJbxV7wwH8rpU1RFJA"
const SHEET_NAME = "ORDER-DISPATCH"

// Column definitions for Pending tab (B to AJ + BD, BE, BF)
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
  { key: "isOrderAcceptable", label: "Is Order Acceptable?", searchable: true },
  { key: "orderAcceptanceChecklist", label: "Order Acceptance Checklist", searchable: true },
  { key: "remarks", label: "Remark", searchable: true },
]

// Column definitions for History tab (includes BJ, BK columns)
const historyColumns = [
  ...pendingColumns.filter((col) => col.key !== "actions"),
  { key: "availabilityStatus", label: "Availability Status", searchable: true },
  { key: "inventoryRemarks", label: "Remarks", searchable: true },
]

export default function CheckInventoryPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [availabilityStatus, setAvailabilityStatus] = useState("")
  const [remarks, setRemarks] = useState("")
  const [partialDetails, setPartialDetails] = useState("")
  const [unavailableItems, setUnavailableItems] = useState([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [viewOrder, setViewOrder] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedColumn, setSelectedColumn] = useState("all")
  const [availabilityFilter, setAvailabilityFilter] = useState<string>("all");
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [visiblePendingColumns, setVisiblePendingColumns] = useState(
    pendingColumns.reduce((acc, col) => ({ ...acc, [col.key]: true }), {}),
  )
  const [visibleHistoryColumns, setVisibleHistoryColumns] = useState(
    historyColumns.reduce((acc, col) => ({ ...acc, [col.key]: true }), {}),
  )

  const [inventoryPhotoAttachment, setInventoryPhotoAttachment] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  
  const { user: currentUser } = useAuth()

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

  // Fetch data from Google Sheets based on BG not null and BH null
  const fetchOrders = async () => {
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
        const ordersData = []

        // Skip the first few header rows and process the data rows
        data.table.rows.slice(6).forEach((row, index) => {
          if (row.c) {
            const actualRowIndex = index + 7

            // Column BG (index 58) - inventory status
            const hasColumnBG = row.c[58] && row.c[58].v !== null && row.c[58].v !== ""
            // Column BH (index 59) - inventory remarks
            const isColumnBHEmpty = !row.c[59] || row.c[59].v === null || row.c[59].v === ""

            // For pending orders: show rows where BG has data but BH is empty
            if (hasColumnBG && isColumnBHEmpty) {
              const order = {
                rowIndex: actualRowIndex,
                timestamp: formatGoogleSheetsDate(row.c[0] ? row.c[0].v : ""),
                // Columns B to AJ (all columns for search functionality)
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
                freightType: row.c[33] ? row.c[33].v : "", // Column AH
                destination: row.c[34] ? row.c[34].v : "", // Column AI
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
                // Additional columns BD, BE, BF (indices 55, 56, 57)
                isOrderAcceptable: row.c[55] ? row.c[55].v : "", // Column BD
                orderAcceptanceChecklist: row.c[56] ? row.c[56].v : "", // Column BE
                remarks: row.c[57] ? row.c[57].v : "", // Column BF
                // Keep the old field names for backward compatibility in dialog
                id: row.c[1] ? row.c[1].v : `ORDER-${actualRowIndex}`,
                contactPerson: row.c[4] ? row.c[4].v : "",
                quantity: row.c[55] ? row.c[55].v : "",
                creName: row.c[81] ? row.c[81].v : "", // Column CD (index 81) - CRE Name
                inventoryStatus: row.c[58] ? row.c[58].v : null, // Column BG
                inventoryRemarks: row.c[59] ? row.c[59].v : "", // Column BH
                processedDate: row.c[60] ? row.c[60].v : "", // Column BI
                fullRowData: row.c,
              }

              ordersData.push(order)
            }
          }
        })

        setOrders(ordersData)
        console.log("Total orders loaded:", ordersData.length)
      }
    } catch (err) {
      console.error("Error fetching orders data:", err)
      setError(err.message)
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  // Fetch processed orders (where both BG and BH have data)
  const fetchProcessedOrders = async () => {
    try {
      const sheetUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${SHEET_NAME}`
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

            // Column BG (index 58) - inventory status
            const hasColumnBG = row.c[58] && row.c[58].v !== null && row.c[58].v !== ""
            // Column BH (index 59) - inventory remarks
            const hasColumnBH = row.c[59] && row.c[59].v !== null && row.c[59].v !== ""

            // For processed orders: show rows where both BG and BH have data
            if (hasColumnBG && hasColumnBH) {
              const processedOrder = {
                rowIndex: actualRowIndex,
                timestamp: formatGoogleSheetsDate(row.c[0] ? row.c[0].v : ""),
                // All columns for history view
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
                freightType: row.c[33] ? row.c[33].v : "", // Column AH
                destination: row.c[34] ? row.c[34].v : "", // Column AI
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
                // Additional columns BD, BE, BF (indices 55, 56, 57)
                isOrderAcceptable: row.c[55] ? row.c[55].v : "", // Column BD
                orderAcceptanceChecklist: row.c[56] ? row.c[56].v : "", // Column BE
                remarks: row.c[57] ? row.c[57].v : "", // Column BF
                // BJ, BK columns (indices 61, 62)
                availabilityStatus: row.c[61] ? row.c[61].v : "", // Column BJ
                inventoryRemarks: row.c[62] ? row.c[62].v : "", // Column BK
                // Keep old field names for backward compatibility
                id: row.c[1] ? row.c[1].v : "",
                contactPerson: row.c[4] ? row.c[4].v : "",
                processedDate: formatGoogleSheetsDate(row.c[60] ? row.c[60].v : ""), // Column BI
                fullRowData: row.c,
              }

              processedOrdersData.push(processedOrder)
            }
          }
        })

        return processedOrdersData
      }
      return []
    } catch (err) {
      console.error("Error fetching processed orders data:", err)
      return []
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  // Filter orders based on search term and selected column
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

// Update the filteredOrders useMemo to include role-based filtering
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

  // Filter orders based on status
  const pendingOrders = filteredOrders.filter(
    (order) =>
      // Since we want orders where BG has data but BH is empty
      order.inventoryStatus && !order.inventoryRemarks,
  )

  // For processed orders, we'll fetch them separately when the tab is clicked
  const [processedOrders, setProcessedOrders] = useState([])
  const [processedLoading, setProcessedLoading] = useState(false)

  // Filter processed orders based on search term
// Update the filteredProcessedOrders useMemo
const filteredProcessedOrders = useMemo(() => {
  let filtered = processedOrders;

  // Apply user role-based filtering
  filtered = filterOrdersByUserRole(filtered, currentUser);
  
  // Apply availability filter if not "all"
  if (availabilityFilter !== "all") {
    filtered = filtered.filter(order => 
      (order.availabilityStatus || order.inventoryStatus) === availabilityFilter
    );
  }
  
  // Apply search filter
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
}, [processedOrders, searchTerm, selectedColumn, availabilityFilter, currentUser]);

  const handleProcessedTabClick = async () => {
    setProcessedLoading(true)
    const processed = await fetchProcessedOrders()
    setProcessedOrders(processed)
    setProcessedLoading(false)
  }

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

  

  // Update order status by finding the correct row that matches the order ID in column B
  const updateOrderStatus = async (order, inventoryData) => {
    try {
      console.log(`Updating order for company: ${order.companyName}`);
      console.log(`Looking for Order No.: ${order.id}`);
      console.log(`Order details:`, order);
  
      const formData = new FormData();
      formData.append("sheetName", SHEET_NAME);
      formData.append("action", "updateByOrderNoInColumnB");
      formData.append("orderNo", order.id);
  
      // Handle inventory photo upload
      if (inventoryPhotoAttachment) {
        try {
          const base64Data = await convertFileToBase64(inventoryPhotoAttachment);
          formData.append("beforePhotoFile", base64Data);
          formData.append("beforePhotoFileName", inventoryPhotoAttachment.name);
          formData.append("beforePhotoMimeType", inventoryPhotoAttachment.type);
        } catch (error) {
          console.error("Error converting inventory photo file:", error);
        }
      }
  
      // Create a sparse array to update only specific columns
      const rowData = new Array(70).fill(""); // Make sure array is large enough for all columns
      const today = new Date();
      const formattedDate = `${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()} ${today.getHours()}:${today.getMinutes()}:${today.getSeconds()}`;
  
      // Set inventory status (column BJ - index 61)
      rowData[61] = inventoryData.availabilityStatus;
  
      // Set processed date (column BI - index 59)
      rowData[59] = formattedDate;
  
      // Set remarks in column BK (index 62)
      rowData[62] = inventoryData.remarks || "";
  
      // For Not Available or Partial status, set additional columns
      if (inventoryData.availabilityStatus === "Not Available" || inventoryData.availabilityStatus === "Partial") {
        // Customer wants material as (column BL - index 63)
        rowData[63] = inventoryData.partialDetails?.customerDecision || "";
        
        // Created by (column BM - index 64) - will be set by the file upload
        // rowData[64] = inventoryData.partialDetails?.createdBy || "";
        
        // Warehouse location (column BN - index 65)
        rowData[65] = inventoryData.partialDetails?.warehouseLocation || "";
        
        // Create indent if not available (column BO - index 66)
        rowData[66] = inventoryData.partialDetails?.createIndent ? "File Uploaded" : "";
        
        // Line item number (column BP - index 67)
        rowData[67] = inventoryData.partialDetails?.lineItemNumber || "";
        
        // Total qty (column BQ - index 68)
        rowData[68] = inventoryData.partialDetails?.totalQty || "";
        
        // Material received lead time (column BR - index 69)
        rowData[69] = inventoryData.partialDetails?.leadTime || "";
      }
  
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
        await fetchOrders();
        return { success: true, fileUrls: result.fileUrls };
      } else {
        throw new Error(result.error || "Update failed");
      }
    } catch (err) {
      console.error("Error updating order:", err);
      setError(err.message);
      return { success: false, error: err.message };
    }
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        // Ensure the result is a string
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to convert file to base64'));
        }
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const calculateTotalQty = (items) => {
    return items.reduce((total, item) => total + (Number(item.qty) || 0), 0);
  };
  
  const handleSubmit = async () => {
    if (!selectedOrder || !availabilityStatus) return;
  
    setUploading(true);
    setIsSubmitting(true); // Start loading
  setError(null);
  
    try {
      const formData = new FormData();
      formData.append("sheetName", SHEET_NAME);
      formData.append("action", "updateByOrderNoInColumnB");
      formData.append("orderNo", selectedOrder.id);
  
      // Handle inventory photo upload
      if (inventoryPhotoAttachment) {
        const base64Data = await convertFileToBase64(inventoryPhotoAttachment);
        formData.append("inventoryPhotoFile", base64Data);
        formData.append("inventoryPhotoFileName", inventoryPhotoAttachment.name);
        formData.append("inventoryPhotoMimeType", inventoryPhotoAttachment.type);
      }
  
      // Prepare row data
      const rowData = new Array(70).fill("");
      const today = new Date();
      const formattedDate = `${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()} ${today.getHours()}:${today.getMinutes()}:${today.getSeconds()}`;
  
      // Set inventory status (column BJ - index 61)
      rowData[61] = availabilityStatus;
  
      // Set processed date (column BI - index 59)
      rowData[59] = formattedDate;
  
      // Set remarks in column BK (index 62)
      rowData[62] = remarks || "";
  
      // For Not Available or Partial status
      if (availabilityStatus === "Not Available" || availabilityStatus === "Partial") {
        rowData[63] = partialDetails.customerDecision || "";
        rowData[64] = partialDetails.createdBy || "";  // Column BM - This is the fix
        rowData[65] = partialDetails.warehouseLocation || "";
        rowData[66] = partialDetails.createIndent ? "File Uploaded" : "";
        rowData[67] = partialDetails.lineItemNumber || "";
        rowData[68] = partialDetails.totalQty || "";
        rowData[69] = partialDetails.leadTime || "";
      }

      const itemsData = unavailableItems.map(item => ({
        name: item.name,
        qty: item.qty
      }));
      rowData[79] = JSON.stringify(itemsData);
  
      formData.append("rowData", JSON.stringify(rowData));
  
      const response = await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        mode: "cors",
        body: formData,
      });
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const result = await response.json();
  
      if (!result.success) {
        throw new Error(result.error || "Update failed");
      }
  
      // Success handling
      setIsDialogOpen(false);
      setSelectedOrder(null);
      setInventoryPhotoAttachment(null);
      
      // Refresh data
      await fetchOrders();
      
      // Show success message
      let message = `Inventory check for order ${selectedOrder.id} updated successfully`;
      if (result.fileUrls?.inventoryPhotoUrl) {
        message += `\n\nPhoto uploaded: ${result.fileUrls.inventoryPhotoUrl}`;
      }
      alert(message);
  
    } catch (err) {
      console.error("Submission error:", err);
      setError(err.message);
      alert(`Error: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleProcess = (order) => {
    setSelectedOrder(order)
    setAvailabilityStatus("")
    setRemarks("")
    setPartialDetails({
      customerDecision: "",
      createdBy: "",
      warehouseLocation: "",
      createIndent: false,
      lineItemNumber: "",
      totalQty: "",
      leadTime: ""
    })
    
    // Extract items from the order data (columns M to AF) - first 10 items
    const extractedItems: Array<{ name: string; qty: number }> = []
    for (let i = 12; i <= 31; i += 2) { // Columns M (12) to AF (31)
      const nameCol = order.fullRowData[i]
      const qtyCol = order.fullRowData[i + 1]
  
      if (nameCol && nameCol.v && nameCol.v.toString().trim() !== "") {
        extractedItems.push({
          name: nameCol.v.toString(),
          qty: qtyCol ? Number(qtyCol.v) || 0 : 0,
        })
      }
    }
  
    setUnavailableItems(extractedItems)
    setIsDialogOpen(true)
  }
  


  const addUnavailableItem = () => {
    setUnavailableItems([...unavailableItems, { name: "", qty: 0 }])
  }

  const removeUnavailableItem = (index) => {
    setUnavailableItems(unavailableItems.filter((_, i) => i !== index))
  }

  const updateUnavailableItem = (index: number, field: "name" | "qty", value: string | number) => {
    const updated = [...unavailableItems];
    updated[index] = { ...updated[index], [field]: value };
    setUnavailableItems(updated);
    
    // Update total qty whenever quantity changes
    if (field === "qty") {
      setPartialDetails(prev => ({
        ...prev,
        totalQty: calculateTotalQty(updated).toString()
      }));
    }
  };

  useEffect(() => {
    if (availabilityStatus === "Not Available" || availabilityStatus === "Partial") {
      // Calculate initial total qty
      const initialTotalQty = calculateTotalQty(unavailableItems);
      setPartialDetails(prev => ({
        ...prev,
        totalQty: initialTotalQty.toString()
      }));
    }
  }, [availabilityStatus, unavailableItems]);

  // const handleSubmit = async () => {
  //   if (!selectedOrder || !availabilityStatus) return

  //   setIsSubmitting(true) // Start loading

  //   const inventoryData = {
  //     availabilityStatus,
  //     remarks,
  //     partialDetails: availabilityStatus === "Partial" ? partialDetails : "",
  //     unavailableItems:
  //       availabilityStatus === "Not Available" || availabilityStatus === "Partial" ? unavailableItems : [],
  //     processedAt: new Date().toISOString(),
  //     processedBy: "Current User",
  //   }

  //   const success = await updateOrderStatus(selectedOrder, inventoryData)

  //   setIsSubmitting(false) // Stop loading regardless of outcome

  //   if (success) {
  //     setIsDialogOpen(false)
  //     setSelectedOrder(null)
  //     // Show success message
  //     alert(`Order ${selectedOrder.id} has been updated successfully.`)
  //   }
  // }

  const handleView = (order) => {
    setViewOrder(order)
    setViewDialogOpen(true)
  }

  const renderCellContent = (order, columnKey) => {
    const value = order[columnKey]

    switch (columnKey) {
      case "actions":
        return (
          <Button size="sm" onClick={() => handleProcess(order)}>
            Process
          </Button>
        )
      case "quotationCopy":
        // return <Badge variant={value === "Available" ? "default" : "secondary"}>{value || "N/A"}</Badge>
      case "acceptanceCopy":
        return value && (value.startsWith("http") || value.startsWith("https")) ? (
          <a href={value} target="_blank" rel="noopener noreferrer">
            <Badge variant="default">Link</Badge>
          </a>
        ) : (
          <Badge variant="secondary">{value || "N/A"}</Badge>
        )
      case "isOrderAcceptable":
        return <Badge variant={value === "Yes" ? "default" : "destructive"}>{value || "N/A"}</Badge>
      case "availabilityStatus":
        return (
          <Badge variant={value === "Available" ? "default" : value === "Not Available" ? "destructive" : "secondary"}>
            {value || "N/A"}
          </Badge>
        )
      case "billingAddress":
      case "shippingAddress":
      case "orderAcceptanceChecklist":
      case "remarks":
      case "inventoryRemarks":
        return <div className="max-w-[200px] whitespace-normal break-words">{value}</div>
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
            <Button onClick={fetchOrders} className="mt-4">
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
      Check Inventory
    </h1>
    {currentUser && (
      <p className="text-sm text-muted-foreground mt-1">
        Logged in as: {currentUser.fullName} ({currentUser.role})
      </p>
    )}
  </div>
  <Button onClick={fetchOrders} variant="outline">
    <RefreshCw className="h-4 w-4 mr-2" />
    Refresh from Sheets
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
          {/* <Select value={selectedColumn} onValueChange={setSelectedColumn}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select column" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Columns</SelectItem>
              {pendingColumns
                .filter((col) => col.searchable)
                .map((column) => (
                  <SelectItem key={column.key} value={column.key}>
                    {column.label}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select> */}
        </div>

        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending">Pending ({pendingOrders.length})</TabsTrigger>
            <TabsTrigger value="history" onClick={handleProcessedTabClick}>
              History ({filteredProcessedOrders.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
  <Card>
    <CardHeader>
      <div className="flex justify-between items-center">
        <div>
          <CardTitle>Pending Inventory Check</CardTitle>
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
                  {pendingOrders.map((order) => (
                    <TableRow key={order.rowIndex} className="hover:bg-gray-50">
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
                  {pendingOrders.length === 0 && (
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
          <CardTitle>Inventory Check History</CardTitle>
          <CardDescription>
            Previously processed inventory checks (where both BG and BH columns have data)
          </CardDescription>
        </div>
        <div className="flex gap-4">
          <Select 
            value={availabilityFilter} 
            onValueChange={setAvailabilityFilter}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Available">Available</SelectItem>
              <SelectItem value="Not Available">Not Available</SelectItem>
              <SelectItem value="Partial">Partial</SelectItem>
            </SelectContent>
          </Select>
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
                      <TableRow key={order.rowIndex} className="hover:bg-gray-50">
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
  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
    <DialogHeader>
      <DialogTitle>Check Inventory</DialogTitle>
      <DialogDescription>Verify item availability for the order</DialogDescription>
    </DialogHeader>
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="orderNo">Order No.</Label>
        <Input id="orderNo" value={selectedOrder?.orderNo || ""} disabled />
      </div>
      <div className="space-y-2">
        <Label htmlFor="companyName">Company Name</Label>
        <Input id="companyName" value={selectedOrder?.companyName || ""} disabled />
      </div>
      <div className="space-y-2">
        <Label htmlFor="availability">Availability Status *</Label>
        <Select value={availabilityStatus} onValueChange={setAvailabilityStatus}>
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Available">Available</SelectItem>
            <SelectItem value="Not Available">Not Available</SelectItem>
            <SelectItem value="Partial">Partial</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {availabilityStatus === "Available" && (
        <div className="space-y-2">
          <Label htmlFor="remarks">Remarks</Label>
          <Textarea
            id="remarks"
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Enter remarks..."
          />
        </div>
      )}

      {(availabilityStatus === "Partial" || availabilityStatus === "Not Available") && (
        <>
          <div className="space-y-2">
            <Label htmlFor="customerDecision">Customer wants material as</Label>
            <Select 
              id="customerDecision"
              value={partialDetails.customerDecision || ""}
              onValueChange={(value) => setPartialDetails({...partialDetails, customerDecision: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select option" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="When full material will available">When full material will available</SelectItem>
                <SelectItem value="Order cancel">Order cancel</SelectItem>
                <SelectItem value="Partial">Partial</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* <div className="space-y-4">
  <Label>Items Not Available</Label>
  {unavailableItems.map((item, index) => (
    <div key={index} className="flex gap-2 items-end">
      <div className="flex-1">
        <Label htmlFor={`itemName-${index}`}>Item Name {index + 1}</Label>
        <Input
          id={`itemName-${index}`}
          value={item.name}
          onChange={(e) => updateUnavailableItem(index, "name", e.target.value)}
          placeholder="Enter item name"
        />
      </div>
      <div className="w-24">
        <Label htmlFor={`qty-${index}`}>QTY</Label>
        <Input
          id={`qty-${index}`}
          type="number"
          value={item.qty}
          onChange={(e) => updateUnavailableItem(index, "qty", Number.parseInt(e.target.value) || 0)}
          placeholder="0"
        />
      </div>
      <Button 
        type="button" 
        size="sm" 
        variant="outline" 
        onClick={() => removeUnavailableItem(index)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  ))}
  
  <div className="space-y-2">
    <Label htmlFor="totalQty">Total qty</Label>
    <Input
      type="number"
      id="totalQty"
      value={partialDetails.totalQty || ""}
      placeholder="Will auto-calculate"
      readOnly
    />
  </div>
</div> */}

<div className="space-y-2">
            <Label htmlFor="createdBy">Created by</Label>
            <Select
              id="createdBy"
              value={partialDetails.createdBy || ""}
              onValueChange={(value) => setPartialDetails({...partialDetails, createdBy: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select person" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Sarita Baghel">Sarita Baghel</SelectItem>
                <SelectItem value="Khushi Khemani">Khushi Khemani</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="warehouseLocation">Warehouse location</Label>
            <Select
              id="warehouseLocation"
              value={partialDetails.warehouseLocation || ""}
              onValueChange={(value) => setPartialDetails({...partialDetails, warehouseLocation: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Chhattisgarh">Chhattisgarh</SelectItem>
                <SelectItem value="Odisha">Odisha</SelectItem>
                <SelectItem value="Assam">Assam</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
  <Label htmlFor="inventoryPhoto">Inventory Photo</Label>
  <Input 
    id="inventoryPhoto" 
    type="file" 
    accept="image/*"
    onChange={(e) => setInventoryPhotoAttachment(e.target.files?.[0] || null)}
  />
  {inventoryPhotoAttachment && (
    <p className="text-sm text-muted-foreground">Selected: {inventoryPhotoAttachment.name}</p>
  )}
</div>

          <div className="space-y-2">
            <Label htmlFor="lineItemNumber">Line item number</Label>
            <Input
              type="number"
              id="lineItemNumber"
              value={partialDetails.lineItemNumber || ""}
              onChange={(e) => setPartialDetails({...partialDetails, lineItemNumber: e.target.value})}
              placeholder="Enter line item number"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="totalQty">Total qty</Label>
            <Input
  type="number"
  id="totalQty"
  value={partialDetails.totalQty || ""}
  onChange={(e) => setPartialDetails({...partialDetails, totalQty: e.target.value})}
  placeholder="Will auto-calculate"
  readOnly
/>
          </div>

          <div className="space-y-2">
            <Label htmlFor="leadTime">Material received lead time</Label>
            <Input
              type="number"
              id="leadTime"
              value={partialDetails.leadTime || ""}
              onChange={(e) => setPartialDetails({...partialDetails, leadTime: e.target.value})}
              placeholder="Enter lead time in days"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="remarks">Remarks</Label>
            <Textarea
              id="remarks"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Enter remarks..."
            />
          </div>
          <div className="space-y-4">
  <Label>Items Not Available</Label>
  {unavailableItems.map((item, index) => (
    <div key={index} className="flex gap-2 items-end">
      <div className="flex-1">
        <Label htmlFor={`itemName-${index}`}>Item Name {index + 1}</Label>
        <Input
          id={`itemName-${index}`}
          value={item.name}
          onChange={(e) => updateUnavailableItem(index, "name", e.target.value)}
          placeholder="Enter item name"
        />
      </div>
      <div className="w-24">
        <Label htmlFor={`qty-${index}`}>QTY</Label>
        <Input
          id={`qty-${index}`}
          type="number"
          value={item.qty}
          onChange={(e) => updateUnavailableItem(index, "qty", Number.parseInt(e.target.value) || 0)}
          placeholder="0"
        />
      </div>
      <Button 
        type="button" 
        size="sm" 
        variant="outline" 
        onClick={() => removeUnavailableItem(index)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  ))}
  
  {/* <div className="space-y-2">
    <Label htmlFor="totalQty">Total qty</Label>
    <Input
      type="number"
      id="totalQty"
      value={partialDetails.totalQty || ""}
      placeholder="Will auto-calculate"
      readOnly
    />
  </div> */}
</div>


          {/* {availabilityStatus === "Partial" && (
            <div className="space-y-4">
              {unavailableItems.map((item, index) => (
                <div key={index} className="flex gap-2 items-end">
                  <div className="flex-1">
                    <Label htmlFor={`itemName-${index}`}>Item Name</Label>
                    <Input
                      id={`itemName-${index}`}
                      value={item.name}
                      onChange={(e) => updateUnavailableItem(index, "name", e.target.value)}
                      placeholder="Enter item name"
                    />
                  </div>
                  <div className="w-24">
                    <Label htmlFor={`qty-${index}`}>QTY</Label>
                    <Input
                      id={`qty-${index}`}
                      type="number"
                      value={item.qty}
                      onChange={(e) => updateUnavailableItem(index, "qty", Number.parseInt(e.target.value) || 0)}
                      placeholder="0"
                    />
                  </div>
                  <Button type="button" size="sm" variant="outline" onClick={() => removeUnavailableItem(index)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addUnavailableItem}>
                Add Unavailable Item
              </Button>
            </div>
          )} */}
        </>
      )}

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
          Cancel
        </Button>
     // In the Process Dialog submit button, update to:
<Button
  onClick={handleSubmit}
  disabled={!availabilityStatus || currentUser?.role === "user" || isSubmitting}
>
  {isSubmitting ? (
    <>
      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
      Processing...
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
              <DialogTitle>Inventory Check Details</DialogTitle>
              <DialogDescription>View inventory check information and results</DialogDescription>
            </DialogHeader>
            {viewOrder && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Order No.</Label>
                    <p className="text-sm">{viewOrder.orderNo || viewOrder.id}</p>
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
                    <Label>Contact Number</Label>
                    <p className="text-sm">{viewOrder.contactNumber}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>PO Number</Label>
                    <p className="text-sm">{viewOrder.poNumber}</p>
                  </div>
                  <div>
                    <Label>Payment Mode</Label>
                    <p className="text-sm">{viewOrder.paymentMode}</p>
                  </div>
                </div>
                {(viewOrder.availabilityStatus || viewOrder.inventoryStatus) && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Availability Status</Label>
                      <p className="text-sm">{viewOrder.availabilityStatus || viewOrder.inventoryStatus}</p>
                    </div>
                    <div>
                      <Label>Remarks</Label>
                      <p className="text-sm">{viewOrder.inventoryRemarks || "N/A"}</p>
                    </div>
                  </div>
                )}
                {(viewOrder.processedDate || viewOrder.timestamp) && (
                  <div>
                    <Label>Processed Date</Label>
                    <p className="text-sm">
                      {viewOrder.processedDate
                        ? new Date(viewOrder.processedDate).toLocaleDateString()
                        : viewOrder.timestamp}
                    </p>
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
