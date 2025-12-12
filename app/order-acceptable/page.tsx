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
import { RefreshCw, Search, Settings } from "lucide-react"
import { useAuth } from "@/components/auth-provider"

const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbyzW8-RldYx917QpAfO4kY-T8_ntg__T0sbr7Yup2ZTVb1FC5H1g6TYuJgAU6wTquVM/exec"
const SHEET_ID = "1yEsh4yzyvglPXHxo-5PT70VpwVJbxV7wwH8rpU1RFJA"
const SHEET_NAME = "ORDER-DISPATCH"

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

const creOptions = [
  "Sarita Baghel",
  "Khushi Khemani"
];


// Column definitions for Pending tab
const pendingColumns = [
  { key: "actions", label: "Actions", searchable: false },
  { key: "timestamp", label: "Timestamp", searchable: true },
  { key: "orderNo", label: "Order No.", searchable: true },
  { key: "creName", label: "CRE Name", searchable: true }, // Add this line
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
  // { key: "creName", label: "CRE Name", searchable: true },
]

// Column definitions for History tab (includes 3 additional columns)
const historyColumns = [
  ...pendingColumns.filter((col) => col.key !== "actions"),
  { key: "isOrderAcceptable", label: "Is Order Acceptable?", searchable: true },
  { key: "orderAcceptanceChecklist", label: "Order Acceptance Checklist", searchable: true },
  { key: "remarks", label: "Remark", searchable: true },
]

export default function OrderAcceptablePage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [isAcceptable, setIsAcceptable] = useState("")
  const [checkedItems, setCheckedItems] = useState([])
  const [remarks, setRemarks] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [viewOrder, setViewOrder] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentTab, setCurrentTab] = useState("pending") // Add this line
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [pendingCreFilter, setPendingCreFilter] = useState("all")
  const [visiblePendingColumns, setVisiblePendingColumns] = useState(
    pendingColumns.reduce((acc, col) => ({ ...acc, [col.key]: true }), {}),
  )
  const [visibleHistoryColumns, setVisibleHistoryColumns] = useState(
    historyColumns.reduce((acc, col) => ({ ...acc, [col.key]: true }), {}),
  )
  const [historyCreFilter, setHistoryCreFilter] = useState("all")

  const [creName, setCreName] = useState("") // New state for CRE name
// const [creFilter, setCreFilter] = useState("")
const [creFilter, setCreFilter] = useState("all") 
  const { user: currentUser } = useAuth()

  const formatGoogleSheetsDate = (dateValue) => {
  if (!dateValue) return "";

  // Handle the case where date comes as "Date(2025,5,21)" or "Date(2025,6,23,0,0,0)"
  if (typeof dateValue === "string" && dateValue.startsWith("Date(")) {
    try {
      // Extract the numbers between parentheses
      const dateParts = dateValue.match(/Date\((\d+),(\d+),(\d+)/);
      if (dateParts && dateParts.length >= 4) {
        const year = parseInt(dateParts[1]);
        const month = parseInt(dateParts[2]); // Note: months are 0-indexed in JS
        const day = parseInt(dateParts[3]);
        
        // Format as dd/mm/yyyy
        const formattedDay = String(day).padStart(2, '0');
        const formattedMonth = String(month + 1).padStart(2, '0'); // +1 because months are 0-indexed
        const formattedYear = year;
        
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

  // Fetch data from Google Sheets - condition: column Q is not null and column R is null
  const fetchOrders = async () => {
    setLoading(true)
    setError(null)

    try {
      // Fetch the entire sheet using Google Sheets API directly
      const sheetUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${SHEET_NAME}`
      const response = await fetch(sheetUrl)
      const text = await response.text()

      // Extract the JSON part from the response
      const jsonStart = text.indexOf("{")
      const jsonEnd = text.lastIndexOf("}") + 1
      const jsonData = text.substring(jsonStart, jsonEnd)

      const data = JSON.parse(jsonData)

      // Process the orders data
      if (data && data.table && data.table.rows) {
        const ordersData = []

        data.table.rows.slice(6).forEach((row, index) => {
          if (row.c) {
            // Condition: column Q is not null and column R is null
            const hasColumnQ = row.c[52] && row.c[52].v !== null && row.c[52].v !== "" // Column Q (index 16)
            const isColumnREmpty = !row.c[53] || row.c[53].v === null || row.c[53].v === "" // Column R (index 17)

            if (hasColumnQ && isColumnREmpty) {
              // Calculate correct row index
              const actualRowIndex = index + 7

              const order = {
  rowIndex: actualRowIndex,
  timestamp: formatGoogleSheetsDate(row.c[0] ? row.c[0].v : ""),
  // Columns B to AZ (all columns for search functionality)
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
  status: row.c[53] ? row.c[53].v : "pending",    // for pending is particular column 52 condition is required
  completeDate: row.c[51] ? row.c[51].v : "",
  creName: row.c[81] ? row.c[81].v : "", 
  // Keep the old field names for backward compatibility in dialog
  id: row.c[1] ? row.c[1].v : `ORDER-${actualRowIndex}`,
  fullRowData: row.c,
}


              console.log(`Order ${order.orderNo}: Company "${order.companyName}" at actual row ${order.rowIndex}`)
              ordersData.push(order)
            }
          }
        })

        setOrders(ordersData)
        console.log("Total orders loaded:", ordersData.length)
        console.log("Orders data:", ordersData)
      }
    } catch (err) {
      console.error("Error fetching orders data:", err)
      setError(err.message)
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  // Helper function to format date from Google Sheets format
  // const formatGoogleSheetsDate = (dateValue) => {
  //   if (!dateValue) return ""

  //   if (typeof dateValue === "string" && dateValue.includes("Date(")) {
  //     const match = dateValue.match(/Date$$(\d+),(\d+),(\d+)$$/)
  //     if (match) {
  //       const year = Number.parseInt(match[1])
  //       const month = Number.parseInt(match[2])
  //       const day = Number.parseInt(match[3])

  //       const date = new Date(year, month, day)
  //       const formattedDay = String(date.getDate()).padStart(2, "0")
  //       const formattedMonth = String(date.getMonth() + 1).padStart(2, "0")
  //       const formattedYear = date.getFullYear()

  //       return `${formattedDay}/${formattedMonth}/${formattedYear}`
  //     }
  //   }

  //   try {
  //     const date = new Date(dateValue)
  //     if (!isNaN(date.getTime())) {
  //       const formattedDay = String(date.getDate()).padStart(2, "0")
  //       const formattedMonth = String(date.getMonth() + 1).padStart(2, "0")
  //       const formattedYear = date.getFullYear()

  //       return `${formattedDay}/${formattedMonth}/${formattedYear}`
  //     }
  //   } catch (e) {
  //     console.error("Error parsing date:", e)
  //   }

  //   return dateValue
  // }

  // Fetch processed orders (where both Q and R have data)
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
            // Show rows where both column Q and R have data
            const hasColumnQ = row.c[52] && row.c[52].v !== null && row.c[52].v !== "" // Column Q (index 16)
            const hasColumnR = row.c[53] && row.c[53].v !== null && row.c[53].v !== "" // Column R (index 17)

            if (hasColumnQ && hasColumnR) {
              const actualRowIndex = index + 7

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
                status: row.c[24] ? row.c[24].v : "",
                completeDate: formatGoogleSheetsDate(row.c[25] ? row.c[25].v : ""),
                creName: row.c[81] ? row.c[81].v : "", 
                // Additional columns BD, BE, BF (indices 55, 56, 57)
                isOrderAcceptable: row.c[55] ? row.c[55].v : "", // Column BD
                orderAcceptanceChecklist: row.c[56] ? row.c[56].v : "", // Column BE
                remarks: row.c[57] ? row.c[57].v : "", // Column BF
                // Keep old field names for backward compatibility
                id: row.c[1] ? row.c[1].v : "",
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

  // Filter orders based on search term
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
      const searchableFields = pendingColumns
        .filter((col) => col.searchable)
        .map((col) => String(order[col.key] || "").toLowerCase());

      return searchableFields.some((field) => field.includes(searchTerm.toLowerCase()));
    });
  }

  // Apply CRE filter - only filter if pendingCreFilter is not empty and not "all"
  if (pendingCreFilter && pendingCreFilter !== "all") {
    filtered = filtered.filter((order) => order.creName === pendingCreFilter);
  }

  return filtered;
}, [orders, searchTerm, pendingCreFilter, currentUser]);

  // Filter orders based on status
  const pendingOrders = filteredOrders.filter((order) => order.status === "pending")

  // For processed orders, we'll fetch them separately when the tab is clicked
  const [processedOrders, setProcessedOrders] = useState([])
  const [processedLoading, setProcessedLoading] = useState(false)

const filteredProcessedOrders = useMemo(() => {
  let filtered = processedOrders;

  // Apply user role-based filtering
  filtered = filterOrdersByUserRole(filtered, currentUser);

  if (searchTerm) {
    filtered = filtered.filter((order) => {
      const searchableFields = historyColumns
        .filter((col) => col.searchable)
        .map((col) => String(order[col.key] || "").toLowerCase());

      return searchableFields.some((field) => field.includes(searchTerm.toLowerCase()));
    });
  }

  if (historyCreFilter && historyCreFilter !== "all") {
    filtered = filtered.filter((order) => order.creName === historyCreFilter);
  }

  return filtered;
}, [processedOrders, searchTerm, historyCreFilter, currentUser]);

  // const filteredOrders = useMemo(() => {
  //   let filtered = orders
  
  //   if (searchTerm) {
  //     filtered = filtered.filter((order) => {
  //       const searchableFields = pendingColumns
  //         .filter((col) => col.searchable)
  //         .map((col) => String(order[col.key] || "").toLowerCase())
  
  //       return searchableFields.some((field) => field.includes(searchTerm.toLowerCase()))
  //     })
  //   }
  
  //   if (pendingCreFilter && pendingCreFilter !== "all") {
  //     filtered = filtered.filter((order) => order.creName === pendingCreFilter)
  //   }
  
  //   return filtered
  // }, [orders, searchTerm, pendingCreFilter])

  const handleProcessedTabClick = async () => {
    setProcessedLoading(true)
    const processed = await fetchProcessedOrders()
    setProcessedOrders(processed)
    setProcessedLoading(false)
  }

  const handleProcess = (order) => {
    setSelectedOrder(order)
    setIsAcceptable("")
    setCheckedItems([])
    setRemarks("")
    setCreName("") // Reset CRE name
    setIsDialogOpen(true)
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

  // Update order status in Google Sheets
  // Complete updateOrderStatus function
  const handleSubmit = async () => {
    // Add proper validation
    if (!selectedOrder || !isAcceptable) {
      alert("Please fill in all required fields");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const acceptanceData = {
        isAcceptable,
        checklist: isAcceptable === "Yes" ? checkedItems : [],
        remarks,
        creName, // Make sure this is included
        processedAt: new Date().toISOString(),
        processedBy: currentUser?.name || "Current User",
      };
  
      const success = await updateOrderStatus(selectedOrder, acceptanceData);
  
      if (success) {
        setIsDialogOpen(false);
        setSelectedOrder(null);
        // Reset form fields
        setIsAcceptable("");
        setCheckedItems([]);
        setRemarks("");
        setCreName("");
        
        alert(`Order ${selectedOrder.orderNo} has been updated successfully as: ${isAcceptable}`);
      }
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      alert("Failed to update order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // 2. Fix the updateOrderStatus function - correct the data structure
  const updateOrderStatus = async (order, acceptanceData) => {
    try {
      console.log(`Updating order for Order No.: ${order.orderNo}`); // Use orderNo instead of id
      console.log(`Order details:`, order);
  
      const formData = new FormData();
      formData.append("sheetName", SHEET_NAME);
      formData.append("action", "updateByOrderNoInColumnB");
      formData.append("orderNo", order.orderNo); // Use orderNo instead of id
  
      // Create a sparse array to update only specific columns
      const rowData = new Array(82).fill("");
  
      // Add today's date to column R (index 53) - this is the key column that needs to be filled
      const today = new Date();
      const formattedDate = `${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()} ${today.getHours()}:${today.getMinutes()}:${today.getSeconds()}`;
      
      rowData[53] = formattedDate; // Column R - THIS IS CRITICAL
  
      // Add acceptance status to column BD (index 55)
      rowData[55] = acceptanceData.isAcceptable;
  
      if (acceptanceData.isAcceptable === "Yes") {
        const checklistText = acceptanceData.checklist.join(", ");
        rowData[56] = checklistText; // Column BE
      }
  
      // Always add remarks to column BF (index 57)
      rowData[57] = acceptanceData.remarks || "";
  
      formData.append("rowData", JSON.stringify(rowData));
  
      console.log("Sending data to Apps Script:", {
        sheetName: SHEET_NAME,
        orderNo: order.orderNo,
        isAcceptable: acceptanceData.isAcceptable,
        todayDate: formattedDate,
        checklist: acceptanceData.checklist,
        remarks: acceptanceData.remarks,
      });
  
      const updateResponse = await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        mode: "cors",
        body: formData,
      });
  
      console.log("Response status:", updateResponse.status);
  
      if (!updateResponse.ok) {
        throw new Error(`HTTP error! status: ${updateResponse.status}`);
      }
  
      let result;
      try {
        const responseText = await updateResponse.text();
        console.log("Raw response:", responseText);
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.log("Response parsing failed, but request might be successful");
        result = { success: true };
      }
  
      console.log("Parsed result:", result);
  
      if (result.success !== false) {
        await fetchOrders(); // Refresh the data
        return true;
      } else {
        throw new Error(result.error || "Update failed");
      }
    } catch (err) {
      console.error("Error updating order:", err);
      setError(err.message);
      return false;
    }
  };

// Complete renderCellContent function
const renderCellContent = (order, columnKey) => {
  const value = order[columnKey]

  switch (columnKey) {
    case "actions":
      return (
        <Button size="sm" onClick={() => handleProcess(order)}>
          Process
        </Button>
      )
    case "billingAddress":
    case "shippingAddress":
      return <div className="address-cell">{value}</div>
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
    case "status":
      return <Badge variant="outline">{value}</Badge>
    case "isOrderAcceptable":
      return <Badge variant={value === "Yes" ? "default" : "destructive"}>{value || "N/A"}</Badge>
    case "creName":
      return <Badge variant="outline">{value || "N/A"}</Badge>
    case "orderAcceptanceChecklist":
    case "remarks":
      return <div className="max-w-[150px] truncate">{value}</div>
    default:
      return value || ""
  }
}

  const handleView = (order) => {
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
      Order Acceptable
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
              placeholder="Search across all columns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {/* Conditional filter dropdowns */}
          {currentTab === "pending" && (
            <div className="min-w-[200px]">
              <Select value={pendingCreFilter} onValueChange={setPendingCreFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by CRE Name" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All CRE Names</SelectItem>
                  {creOptions.map((cre) => (
                    <SelectItem key={cre} value={cre}>
                      {cre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          
          {currentTab === "history" && (
            <div className="min-w-[200px]">
              <Select value={historyCreFilter} onValueChange={setHistoryCreFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by CRE Name" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All CRE Names</SelectItem>
                  {creOptions.map((cre) => (
                    <SelectItem key={cre} value={cre}>
                      {cre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <Tabs 
          defaultValue="pending" 
          className="space-y-4"
          onValueChange={(value) => setCurrentTab(value)}
        >
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
          <CardTitle>Pending Orders</CardTitle>
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
                                 column.key === 'timestamp' ? '130px' :
                                 column.key === 'orderNo' ? '120px' :
                                 column.key === 'creName' ? '150px' :
                                 column.key === 'quotationNo' ? '150px' :
                                 column.key === 'companyName' ? '250px' :
                                 column.key === 'contactPersonName' ? '180px' :
                                 column.key === 'contactNumber' ? '140px' :
                                 column.key === 'billingAddress' ? '200px' :
                                 column.key === 'shippingAddress' ? '200px' :
                                 '160px',
                          minWidth: column.key === 'actions' ? '120px' : 
                                   column.key === 'timestamp' ? '130px' :
                                   column.key === 'orderNo' ? '120px' :
                                   column.key === 'creName' ? '150px' :
                                   column.key === 'quotationNo' ? '150px' :
                                   column.key === 'companyName' ? '250px' :
                                   column.key === 'contactPersonName' ? '180px' :
                                   column.key === 'contactNumber' ? '140px' :
                                   column.key === 'billingAddress' ? '200px' :
                                   column.key === 'shippingAddress' ? '200px' :
                                   '160px',
                          maxWidth: column.key === 'actions' ? '120px' : 
                                   column.key === 'timestamp' ? '130px' :
                                   column.key === 'orderNo' ? '120px' :
                                   column.key === 'creName' ? '150px' :
                                   column.key === 'quotationNo' ? '150px' :
                                   column.key === 'companyName' ? '250px' :
                                   column.key === 'contactPersonName' ? '180px' :
                                   column.key === 'contactNumber' ? '140px' :
                                   column.key === 'billingAddress' ? '200px' :
                                   column.key === 'shippingAddress' ? '200px' :
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
                                     column.key === 'timestamp' ? '130px' :
                                     column.key === 'orderNo' ? '120px' :
                                     column.key === 'creName' ? '150px' :
                                     column.key === 'quotationNo' ? '150px' :
                                     column.key === 'companyName' ? '250px' :
                                     column.key === 'contactPersonName' ? '180px' :
                                     column.key === 'contactNumber' ? '140px' :
                                     column.key === 'billingAddress' ? '200px' :
                                     column.key === 'shippingAddress' ? '200px' :
                                     '160px',
                              minWidth: column.key === 'actions' ? '120px' : 
                                       column.key === 'timestamp' ? '130px' :
                                       column.key === 'orderNo' ? '120px' :
                                       column.key === 'creName' ? '150px' :
                                       column.key === 'quotationNo' ? '150px' :
                                       column.key === 'companyName' ? '250px' :
                                       column.key === 'contactPersonName' ? '180px' :
                                       column.key === 'contactNumber' ? '140px' :
                                       column.key === 'billingAddress' ? '200px' :
                                       column.key === 'shippingAddress' ? '200px' :
                                       '160px',
                              maxWidth: column.key === 'actions' ? '120px' : 
                                       column.key === 'timestamp' ? '130px' :
                                       column.key === 'orderNo' ? '120px' :
                                       column.key === 'creName' ? '150px' :
                                       column.key === 'quotationNo' ? '150px' :
                                       column.key === 'companyName' ? '250px' :
                                       column.key === 'contactPersonName' ? '180px' :
                                       column.key === 'contactNumber' ? '140px' :
                                       column.key === 'billingAddress' ? '200px' :
                                       column.key === 'shippingAddress' ? '200px' :
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
          <CardTitle>Order History</CardTitle>
          <CardDescription>
            Previously processed orders (where both Q and R columns have data)
          </CardDescription>
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
                            width: column.key === 'timestamp' ? '130px' :
                                   column.key === 'orderNo' ? '120px' :
                                   column.key === 'creName' ? '150px' :
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
                            minWidth: column.key === 'timestamp' ? '130px' :
                                     column.key === 'orderNo' ? '120px' :
                                     column.key === 'creName' ? '150px' :
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
                            maxWidth: column.key === 'timestamp' ? '130px' :
                                     column.key === 'orderNo' ? '120px' :
                                     column.key === 'creName' ? '150px' :
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
                    {filteredProcessedOrders.map((order) => (
                      <TableRow key={order.rowIndex} className="hover:bg-gray-50">
                        {historyColumns
                          .filter((col) => visibleHistoryColumns[col.key])
                          .map((column) => (
                            <TableCell 
                              key={column.key} 
                              className="border-b px-4 py-3 align-top"
                              style={{ 
                                width: column.key === 'timestamp' ? '130px' :
                                       column.key === 'orderNo' ? '120px' :
                                       column.key === 'creName' ? '150px' :
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
                                minWidth: column.key === 'timestamp' ? '130px' :
                                         column.key === 'orderNo' ? '120px' :
                                         column.key === 'creName' ? '150px' :
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
                                maxWidth: column.key === 'timestamp' ? '130px' :
                                         column.key === 'orderNo' ? '120px' :
                                         column.key === 'creName' ? '150px' :
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
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Process Order Acceptable</DialogTitle>
              <DialogDescription>Review and process the order acceptance</DialogDescription>
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
              {/* <div className="space-y-2">
  <Label htmlFor="creName">CRE Name *</Label>
  <Select value={creName} onValueChange={setCreName}>
    <SelectTrigger>
      <SelectValue placeholder="Select CRE Name" />
    </SelectTrigger>
    <SelectContent>
      {creOptions.map((cre) => (
        <SelectItem key={cre} value={cre}>
          {cre}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
</div> */}
              <div className="space-y-2">
                <Label htmlFor="acceptable">Is Order Acceptable? *</Label>
                <Select value={isAcceptable} onValueChange={setIsAcceptable}>
  <SelectTrigger>
    <SelectValue placeholder="Select" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="Yes">Yes</SelectItem>
    <SelectItem value="No">No</SelectItem>
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
<Button 
  onClick={handleSubmit} 
  disabled={!isAcceptable || isSubmitting || (currentUser?.role === "user")}
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

