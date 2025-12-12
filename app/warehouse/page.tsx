"use client";

import { useState, useEffect, useMemo } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { useData } from "@/components/data-provider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { RefreshCw, Search, Settings } from "lucide-react";
import { useAuth } from "@/components/auth-provider";

export default function WarehousePage() {
  const { orders, updateOrder } = useData();
  // const [selectedOrder, setSelectedOrder] = useState<string>("")
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewOrder, setViewOrder] = useState<any>(null);
  const [pendingOrders, setPendingOrders] = useState<any[]>([]);
  const [historyOrders, setHistoryOrders] = useState<any[]>([]);
  const { user: currentUser } = useAuth();

  const APPS_SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbyzW8-RldYx917QpAfO4kY-T8_ntg__T0sbr7Yup2ZTVb1FC5H1g6TYuJgAU6wTquVM/exec";
  const SHEET_ID = "1yEsh4yzyvglPXHxo-5PT70VpwVJbxV7wwH8rpU1RFJA";
  const SHEET_NAME = "DISPATCH-DELIVERY";

  // Column definitions for Pending tab (B to BJ)
  const pendingColumns = [
    { key: "actions", label: "Actions", searchable: false },
    { key: "orderNo", label: "Order No.", searchable: true },
    { key: "quotationNo", label: "Quotation No.", searchable: true },
    { key: "companyName", label: "Company Name", searchable: true },
    {
      key: "contactPersonName",
      label: "Contact Person Name",
      searchable: true,
    },
    { key: "contactNumber", label: "Contact Number", searchable: true },
    { key: "billingAddress", label: "Billing Address", searchable: true },
    { key: "shippingAddress", label: "Shipping Address", searchable: true },
    { key: "paymentMode", label: "Payment Mode", searchable: true },
    { key: "quotationCopy", label: "Quotation Copy", searchable: true },
    { key: "paymentTerms", label: "Payment Terms(In Days)", searchable: true },
    { key: "transportMode", label: "Transport Mode", searchable: true },
    { key: "transportid", label: "Transport ID", searchable: true },
    { key: "freightType", label: "Freight Type", searchable: true },
    { key: "destination", label: "Destination", searchable: true },
    { key: "poNumber", label: "Po Number", searchable: true },
    { key: "quotationCopy2", label: "Quotation Copy", searchable: true },
    {
      key: "acceptanceCopy",
      label: "Acceptance Copy (Purchase Order Only)",
      searchable: true,
    },
    { key: "offer", label: "Offer", searchable: true },
    {
      key: "conveyedForRegistration",
      label: "Conveyed For Registration Form",
      searchable: true,
    },
    { key: "qty", label: "Qty", searchable: true },
    { key: "amount", label: "Amount", searchable: true },
    { key: "approvedName", label: "Approved Name", searchable: true },
    {
      key: "calibrationCertRequired",
      label: "Calibration Certificate Required",
      searchable: true,
    },
    {
      key: "certificateCategory",
      label: "Certificate Category",
      searchable: true,
    },
    {
      key: "installationRequired",
      label: "Installation Required",
      searchable: true,
    },
    { key: "ewayBillDetails", label: "Eway Bill Details", searchable: true },
    {
      key: "ewayBillAttachment",
      label: "Eway Bill Attachment",
      searchable: true,
    },
    { key: "srnNumber", label: "Srn Number", searchable: true },
    {
      key: "srnNumberAttachment",
      label: "Srn Number Attachment",
      searchable: true,
    },
    { key: "attachment", label: "Attachment", searchable: true },
    { key: "vehicleNo", label: "Vehicle No.", searchable: true },

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
    { key: "invoiceNumber", label: "Invoice Number", searchable: true },
    { key: "invoiceUpload", label: "Invoice Upload", searchable: true },
    { key: "ewayBillUpload", label: "Eway Bill Upload", searchable: true },
    { key: "totalQtyHistory", label: "Total Qty", searchable: true },
    { key: "totalBillAmount", label: "Total Bill Amount", searchable: true },
    { key: "dSrNumber", label: "D-Sr Number", searchable: true },
  ];

  // Column definitions for History tab (includes BN to BR and BV to CC)
  const historyColumns = [
    ...pendingColumns.filter((col) => col.key !== "actions"),
    { key: "invoiceNumber", label: "Invoice Number", searchable: true },
    { key: "invoiceUpload", label: "Invoice Upload", searchable: true },
    { key: "ewayBillUpload", label: "Eway Bill Upload", searchable: true },
    { key: "totalQtyHistory", label: "Total Qty", searchable: true },
    { key: "totalBillAmount", label: "Total Bill Amount", searchable: true },
    // BV to CC columns
    { key: "transporterName", label: "Transporter Name", searchable: true },
    {
      key: "transporterContact",
      label: "Transporter Contact",
      searchable: true,
    },
    { key: "biltyNumber", label: "Bilty Number", searchable: true },
    { key: "totalCharges", label: "Total Charges", searchable: true },
    { key: "warehouseRemarks", label: "Warehouse Remarks", searchable: true },
    { key: "beforePhoto", label: "Before Photo", searchable: false },
    { key: "afterPhoto", label: "After Photo", searchable: false },
    { key: "biltyUpload", label: "Bilty Upload", searchable: false },
  ];

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedColumn, setSelectedColumn] = useState("all");
  const [visiblePendingColumns, setVisiblePendingColumns] = useState(
    pendingColumns.reduce((acc, col) => ({ ...acc, [col.key]: true }), {})
  );
  const [visibleHistoryColumns, setVisibleHistoryColumns] = useState(
    historyColumns.reduce((acc, col) => ({ ...acc, [col.key]: true }), {})
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [beforePhoto, setBeforePhoto] = useState<File | null>(null);
  const [afterPhoto, setAfterPhoto] = useState<File | null>(null);
  const [biltyUpload, setBiltyUpload] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // New form fields
  const [transporterName, setTransporterName] = useState<string>("");
  const [transporterContact, setTransporterContact] = useState<string>("");
  const [biltyNumber, setBiltyNumber] = useState<string>("");
  const [totalCharges, setTotalCharges] = useState<string>("");
  const [warehouseRemarks, setWarehouseRemarks] = useState<string>("");

  const fetchPendingOrders = async () => {
    setLoading(true);
    setError(null);

    try {
      const sheetUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${SHEET_NAME}`;
      const response = await fetch(sheetUrl);
      const text = await response.text();

      const jsonStart = text.indexOf("{");
      const jsonEnd = text.lastIndexOf("}") + 1;
      const jsonData = text.substring(jsonStart, jsonEnd);

      const data = JSON.parse(jsonData);

      if (data && data.table && data.table.rows) {
        const pendingOrders: any[] = [];

        data.table.rows.slice(6).forEach((row, index) => {
          if (row.c) {
            const actualRowIndex = index + 2;
            const btColumn = row.c[70] ? row.c[70].v : null; // Column BT (index 71)
            const buColumn = row.c[71] ? row.c[71].v : null; // Column BU (index 72)

            // Only include rows where BT is not null and BU is null
            if (btColumn && !buColumn) {
              const order = {
                rowIndex: actualRowIndex,
                id: row.c[105] ? row.c[105].v : `ORDER-${actualRowIndex}`,
                orderNo: row.c[1] ? row.c[1].v : "", // Column B - Order No
                quotationNo: row.c[2] ? row.c[2].v : "", // Column C
                companyName: row.c[3] ? row.c[3].v : "",
                contactPersonName: row.c[4] ? row.c[4].v : "", // Fix field name to match column definition
                contactNumber: row.c[5] ? row.c[5].v : "",
                billingAddress: row.c[6] ? row.c[6].v : "",
                shippingAddress: row.c[7] ? row.c[7].v : "",
                paymentMode: row.c[8] ? row.c[8].v : "",
                paymentTerms: row.c[10] ? row.c[10].v : "",
                qty: row.c[19] ? row.c[19].v : "", // Map to qty field for column definition
                transportMode: row.c[11] ? row.c[11].v : "",
                transportid: row.c[25] ? row.c[25].v : "",
                freightType: row.c[12] ? row.c[12].v : "",
                destination: row.c[13] ? row.c[13].v : "",
                poNumber: row.c[14] ? row.c[14].v : "",
                offer: row.c[17] ? row.c[17].v : "",
                amount: row.c[20] ? Number.parseFloat(row.c[20].v) || 0 : 0,
                invoiceNumber: row.c[65] ? row.c[65].v : "", // Column BO (invoice number)
                // Keep existing fields for backward compatibility
                contactPerson: row.c[4] ? row.c[4].v : "",
                quantity: row.c[10] ? row.c[10].v : "",
                totalQty: row.c[19] ? row.c[19].v : "",
                quotationCopy: row.c[9] ? row.c[9] : "",
                dSrNumber: row.c[105] ? row.c[105].v : "",
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
                remarks: row.c[60] ? row.c[60].v : "",
                quotationCopy2: row.c[15] ? row.c[15].v : "",
                acceptanceCopy: row.c[16] ? row.c[16].v : "",
                vehicleNo: row.c[26] ? row.c[26].v : "",
                // invoiceNumber: row.c[65] ? row.c[65].v : "",
                invoiceUpload: row.c[66] ? row.c[66].v : "",
                ewayBillUpload: row.c[67] ? row.c[67].v : "",
                totalQtyHistory: row.c[68] ? row.c[68].v : "",
                totalBillAmount: row.c[69] ? row.c[69].v : "",
                creName: row.c[106] ? row.c[106].v : "", // Column CD (index 81) - CRE Name
              };
              pendingOrders.push(order);
            }
          }
        });

        setPendingOrders(pendingOrders);
      }
    } catch (err: any) {
      console.error("Error fetching pending orders:", err);
      setError(err.message);
      setPendingOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistoryOrders = async () => {
    setLoading(true);
    setError(null);

    try {
      const sheetUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${SHEET_NAME}`;
      const response = await fetch(sheetUrl);
      const text = await response.text();

      const jsonStart = text.indexOf("{");
      const jsonEnd = text.lastIndexOf("}") + 1;
      const jsonData = text.substring(jsonStart, jsonEnd);

      const data = JSON.parse(jsonData);

      if (data && data.table && data.table.rows) {
        const historyOrders: any[] = [];

        data.table.rows.slice(6).forEach((row, index) => {
          if (row.c) {
            const actualRowIndex = index + 2;
            const btColumn = row.c[70] ? row.c[70].v : null; // Column BT (index 71)
            const buColumn = row.c[71] ? row.c[71].v : null; // Column BU (index 72)

            // Only include rows where both BT and BU are not null
            if (btColumn && buColumn) {
              const order = {
                rowIndex: actualRowIndex,
                id: row.c[105] ? row.c[105].v : `ORDER-${actualRowIndex}`,
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
                transportid: row.c[25] ? row.c[25].v : "",
                freightType: row.c[12] ? row.c[12].v : "",
                destination: row.c[13] ? row.c[13].v : "",
                poNumber: row.c[14] ? row.c[14].v : "",
                vehicleNo: row.c[26] ? row.c[26].v : "",

                offer: row.c[17] ? row.c[17].v : "",
                amount: row.c[12] ? Number.parseFloat(row.c[12].v) || 0 : 0,
                invoiceNumber: row.c[65] ? row.c[65].v : "", // Column BO (invoice number)
                invoiceUpload: row.c[66] ? row.c[66].v : "", // Column BO (invoice number)
                ewayBillUpload: row.c[67] ? row.c[67].v : "", // Column BO (invoice number)
                totalQtyHistory: row.c[68] ? row.c[68].v : "", // Column BO (invoice number)
                totalBillAmount: row.c[69] ? row.c[69].v : "", // Column BO (invoice number)
                warehouseProcessedDate: buColumn, // Column BU contains the warehouse processing date
                // Keep existing fields for backward compatibility
                contactPerson: row.c[4] ? row.c[4].v : "",
                quantity: row.c[10] ? row.c[10].v : "",
                totalQty: row.c[19] ? row.c[19].v : "",
                quotationCopy: row.c[9] ? row.c[9].v : "",
                fullRowData: row.c,
                warehouseData: {
                  processedAt: buColumn,
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
                remarks: row.c[60] ? row.c[60].v : "",
                quotationCopy2: row.c[15] ? row.c[15].v : "",
                acceptanceCopy: row.c[16] ? row.c[16].v : "",
                // BN to BR columns
                totalQtyHistory: row.c[69] ? row.c[69].v : "",
                totalBillAmount: row.c[70] ? row.c[70].v : "",
                // BV to CC columns (warehouse specific data)
                transporterName: row.c[76] ? row.c[76].v : "", // Column BZ
                transporterContact: row.c[77] ? row.c[77].v : "", // Column CA
                biltyNumber: row.c[78] ? row.c[78].v : "", // Column CB
                totalCharges: row.c[79] ? row.c[79].v : "", // Column CC
                warehouseRemarks: row.c[80] ? row.c[80].v : "", // Column CD
                beforePhoto: row.c[73] ? row.c[73].v : "", // Column CE
                afterPhoto: row.c[74] ? row.c[74].v : "", // Column CF
                biltyUpload: row.c[75] ? row.c[75].v : "", // Column CG
                creName: row.c[106] ? row.c[106].v : "", // Column CD (index 81) - CRE Name
              };
              historyOrders.push(order);
            }
          }
        });

        setHistoryOrders(historyOrders);
      }
    } catch (err: any) {
      console.error("Error fetching history orders:", err);
      setError(err.message);
      setHistoryOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingOrders();
    fetchHistoryOrders();
  }, []);

  // Add this function after the useAuth hook
  const filterOrdersByUserRole = (orders: any[], currentUser: any) => {
    if (!currentUser) return orders;

    // Super admin sees all data
    if (currentUser.role === "super_admin") {
      return orders;
    }

    // Admin and regular users only see data where CRE Name matches their username
    return orders.filter((order) => order.creName === currentUser.username);
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
          return searchableFields.some((field) =>
            field.includes(searchTerm.toLowerCase())
          );
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
          return searchableFields.some((field) =>
            field.includes(searchTerm.toLowerCase())
          );
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
    }));
  };

  const toggleHistoryColumn = (columnKey) => {
    setVisibleHistoryColumns((prev) => ({
      ...prev,
      [columnKey]: !prev[columnKey],
    }));
  };

  const showAllPendingColumns = () => {
    setVisiblePendingColumns(
      pendingColumns.reduce((acc, col) => ({ ...acc, [col.key]: true }), {})
    );
  };

  const hideAllPendingColumns = () => {
    setVisiblePendingColumns(
      pendingColumns.reduce(
        (acc, col) => ({ ...acc, [col.key]: col.key === "actions" }),
        {}
      )
    );
  };

  const showAllHistoryColumns = () => {
    setVisibleHistoryColumns(
      historyColumns.reduce((acc, col) => ({ ...acc, [col.key]: true }), {})
    );
  };

  const hideAllHistoryColumns = () => {
    setVisibleHistoryColumns(
      historyColumns.reduce((acc, col) => ({ ...acc, [col.key]: false }), {})
    );
  };

  // Legacy orders from useData hook
  const legacyPendingOrders = orders.filter(
    (order) => order.status === "pi-created"
  );
  const legacyProcessedOrders = orders.filter((order) => order.warehouseData);

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const updateOrderStatus = async (order: any) => {
    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("sheetName", SHEET_NAME);
      formData.append("action", "updateByDSrNumber");
      formData.append("dSrNumber", order.dSrNumber);

      // Handle before photo upload
      if (beforePhoto) {
        try {
          const base64Data = await convertFileToBase64(beforePhoto);
          formData.append("beforePhotoFile", base64Data);
          formData.append("beforePhotoFileName", beforePhoto.name);
          formData.append("beforePhotoMimeType", beforePhoto.type);
        } catch (error) {
          console.error("Error converting before photo:", error);
        }
      }

      // Handle after photo upload
      if (afterPhoto) {
        try {
          const base64Data = await convertFileToBase64(afterPhoto);
          formData.append("afterPhotoFile", base64Data);
          formData.append("afterPhotoFileName", afterPhoto.name);
          formData.append("afterPhotoMimeType", afterPhoto.type);
        } catch (error) {
          console.error("Error converting after photo:", error);
        }
      }

      // Handle bilty upload
      if (biltyUpload) {
        try {
          const base64Data = await convertFileToBase64(biltyUpload);
          formData.append("biltyFile", base64Data);
          formData.append("biltyFileName", biltyUpload.name);
          formData.append("biltyMimeType", biltyUpload.type);
        } catch (error) {
          console.error("Error converting bilty file:", error);
        }
      }

      const rowData = new Array(110).fill(""); // Increased array size to accommodate new columns

      // Add today's date to BU column (index 72)
      const today = new Date();

      const formattedDate =
        `${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()} ` +
        `${today.getHours()}:${today.getMinutes()}:${today.getSeconds()}`;

      rowData[71] = formattedDate;

      // Add new warehouse data to columns BZ to CD (indexes 77-81)
      rowData[76] = transporterName; // Column BZ
      rowData[77] = transporterContact; // Column CA
      rowData[78] = biltyNumber; // Column CB
      rowData[79] = totalCharges; // Column CC
      rowData[80] = warehouseRemarks; // Column CD

      formData.append("rowData", JSON.stringify(rowData));

      const updateResponse = await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        mode: "cors",
        body: formData,
      });

      if (!updateResponse.ok) {
        throw new Error(`HTTP error! status: ${updateResponse.status}`);
      }

      // === SECOND CALL - Insert to Warehouse sheet with dynamic columns ===
      const formData2 = new FormData();
      formData2.append("sheetName", "Warehouse");
      formData2.append("action", "insertWarehouseWithDynamicColumns");
      formData2.append("orderNo", order.orderNo);

      // Find highest item number by checking object keys
      const itemKeys = Object.keys(order).filter(
        (key) => key.startsWith("itemName") || key.startsWith("quantity")
      );
      let totalItems = 0;

      itemKeys.forEach((key) => {
        const match = key.match(/\d+$/);
        if (match) {
          const num = parseInt(match[0]);
          if (
            num > totalItems &&
            (order[`itemName${num}`] || order[`quantity${num}`])
          ) {
            totalItems = num;
          }
        }
      });

      console.log(`Found ${totalItems} items in order ${order.orderNo}`);
      formData2.append("totalItems", totalItems.toString());

      // Build warehouse row data according to your sheet structure:
      // Col 1: Time Stamp
      // Col 2: Order No.
      // Col 3: Quotation No.
      // Col 4: Before Photo Upload (placeholder - will be filled by backend)
      // Col 5: After Photo Upload (placeholder - will be filled by backend)
      // Col 6: Bilty Upload (placeholder - will be filled by backend)
      // Col 7: Transporter Name
      // Col 8: Transporter Contact
      // Col 9: Bilty No.
      // Col 10: Total Charges
      // Col 11: Warehouse Remarks
      // Col 12+: Item Name 1, Quantity 1, Item Name 2, Quantity 2, ...

      const warehouseRowData = [
        formattedDate, // 1. Time Stamp
        order.orderNo, // 2. Order No.
        order.quotationNo, // 3. Quotation No.
        "", // 4. Before Photo (will be filled by backend)
        "", // 5. After Photo (will be filled by backend)
        "", // 6. Bilty Upload (will be filled by backend)
        "", // 7. Transporter Name
        "", // 8. Transporter Contact
        "", // 9. Bilty No.
        "", // 10. Total Charges
        "", // 11. Warehouse Remarks
      ];

      // Add all items dynamically after the fixed columns
      for (let i = 1; i <= totalItems; i++) {
        warehouseRowData.push(order[`itemName${i}`] || ""); // Item Name
        warehouseRowData.push(order[`quantity${i}`] || ""); // Quantity
      }

      formData2.append("rowData", JSON.stringify(warehouseRowData));

      const updateResponse2 = await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        mode: "cors",
        body: formData2,
      });

      if (!updateResponse2.ok) {
        throw new Error(
          `Warehouse insert HTTP error! status: ${updateResponse2.status}`
        );
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
        await fetchHistoryOrders();
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

  const handleProcess = (orderId: string) => {
    const order = pendingOrders.find((o) => o.id === orderId);

    // Add this debug check:
    if (!order || !order.dSrNumber) {
      alert(
        `Error: D-Sr Number not found for order ${orderId}. Please ensure column DB has a value.`
      );
      return;
    }

    // setSelectedOrder(orderId)
    setSelectedOrder(order);
    setBeforePhoto(null);
    setAfterPhoto(null);
    setBiltyUpload(null);
    // Reset new form fields
    setTransporterName("");
    setTransporterContact("");
    setBiltyNumber("");
    setTotalCharges("");
    setWarehouseRemarks("");
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!selectedOrder) return;

    const order = pendingOrders.find((o) => o.id === selectedOrder.id);
    if (!order) {
      // Fallback to legacy orders
      const warehouseData = {
        processedAt: new Date().toISOString(),
        processedBy: "Current User",
      };

      updateOrder(selectedOrder, {
        status: "warehouse-processed",
        warehouseData,
      });

      setIsDialogOpen(false);
      setSelectedOrder(null);
      return;
    }

    const result = await updateOrderStatus(order);

    if (result.success) {
      console.log("Successfully processed D-Sr Number:", order.dSrNumber);
      setIsDialogOpen(false);
      setSelectedOrder("");
      let message = `Warehouse processing for order ${selectedOrder} has been completed successfully`;
      if (result.fileUrls) {
        message += "\n\nFiles uploaded to Google Drive:";
        if (result.fileUrls.beforePhotoUrl) message += "\n- Before photo";
        if (result.fileUrls.afterPhotoUrl) message += "\n- After photo";
        if (result.fileUrls.biltyUrl) message += "\n- Bilty document";
      }
      alert(message);
    } else {
      alert(`Error processing warehouse operation: ${result.error}`);
    }
  };

  const handleView = (order: any) => {
    setViewOrder(order);
    setViewDialogOpen(true);
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading orders from Google Sheets...</span>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600">
              Error Loading Data
            </h1>
            <p className="text-muted-foreground mt-2">{error}</p>
            <Button
              onClick={() => {
                fetchPendingOrders();
                fetchHistoryOrders();
              }}
              className="mt-4"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  const handleRefresh = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchPendingOrders(), fetchHistoryOrders()]);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderCellContent = (order, columnKey) => {
    const value = order[columnKey];
    // Handle Google Sheets API response format where value might be {v: actualValue}
    const actualValue =
      value && typeof value === "object" && "v" in value ? value.v : value;

    switch (columnKey) {
      case "actions":
        return (
          <Button size="sm" onClick={() => handleProcess(order.id)}>
            Process
          </Button>
        );
      case "quotationCopy":
      case "quotationCopy2":
      // return <Badge variant={actualValue === "" ? "default" : ""}>{actualValue || ""}</Badge>
      case "acceptanceCopy":
      case "ewayBillAttachment":
      case "srnNumberAttachment":
      case "attachment":
      case "invoiceUpload":
      case "ewayBillUpload":
      case "beforePhoto":
      case "afterPhoto":
      case "biltyUpload":
        return actualValue &&
          (actualValue.startsWith("http") ||
            actualValue.startsWith("https")) ? (
          <a href={actualValue} target="_blank" rel="noopener noreferrer">
            <Badge variant="default">View Attachment</Badge>
          </a>
        ) : (
          <Badge variant="secondary">{actualValue || "N/A"}</Badge>
        );
      case "calibrationCertRequired":
      case "installationRequired":
        return (
          <Badge variant={actualValue === "Yes" ? "default" : "secondary"}>
            {actualValue || "N/A"}
          </Badge>
        );
      case "billingAddress":
      case "shippingAddress":
      case "remarks":
        return (
          <div className="max-w-[200px] whitespace-normal break-words">
            {actualValue || ""}
          </div>
        );
      case "paymentMode":
        return (
          <div className="flex items-center gap-2">
            {actualValue}
            {actualValue === "Advance" && (
              <Badge variant="secondary">Required</Badge>
            )}
          </div>
        );
      case "amount":
      case "totalBillAmount":
        return actualValue ? `₹${Number(actualValue).toLocaleString()}` : "";
      default:
        return actualValue || "";
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
              Warehouse
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
            <TabsTrigger value="pending">
              Pending ({filteredPendingOrders.length})
            </TabsTrigger>
            <TabsTrigger value="history">
              History ({filteredHistoryOrders.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Pending Warehouse Operations</CardTitle>
                    <CardDescription>
                      Orders waiting for warehouse processing
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
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={showAllPendingColumns}
                        >
                          Show All
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={hideAllPendingColumns}
                        >
                          Hide All
                        </Button>
                      </div>
                      <DropdownMenuSeparator />
                      <div className="p-2 space-y-2">
                        {pendingColumns.map((column) => (
                          <div
                            key={column.key}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={`pending-${column.key}`}
                              checked={visiblePendingColumns[column.key]}
                              onCheckedChange={() =>
                                togglePendingColumn(column.key)
                              }
                            />
                            <Label
                              htmlFor={`pending-${column.key}`}
                              className="text-sm"
                            >
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
                    <div style={{ minWidth: "max-content" }}>
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
                                    width:
                                      column.key === "actions"
                                        ? "120px"
                                        : column.key === "orderNo"
                                        ? "120px"
                                        : column.key === "quotationNo"
                                        ? "150px"
                                        : column.key === "companyName"
                                        ? "250px"
                                        : column.key === "contactPersonName"
                                        ? "180px"
                                        : column.key === "contactNumber"
                                        ? "140px"
                                        : column.key === "billingAddress"
                                        ? "200px"
                                        : column.key === "shippingAddress"
                                        ? "200px"
                                        : column.key === "isOrderAcceptable"
                                        ? "150px"
                                        : column.key ===
                                          "orderAcceptanceChecklist"
                                        ? "250px"
                                        : column.key === "remarks"
                                        ? "200px"
                                        : "160px",
                                    minWidth:
                                      column.key === "actions"
                                        ? "120px"
                                        : column.key === "orderNo"
                                        ? "120px"
                                        : column.key === "quotationNo"
                                        ? "150px"
                                        : column.key === "companyName"
                                        ? "250px"
                                        : column.key === "contactPersonName"
                                        ? "180px"
                                        : column.key === "contactNumber"
                                        ? "140px"
                                        : column.key === "billingAddress"
                                        ? "200px"
                                        : column.key === "shippingAddress"
                                        ? "200px"
                                        : column.key === "isOrderAcceptable"
                                        ? "150px"
                                        : column.key ===
                                          "orderAcceptanceChecklist"
                                        ? "250px"
                                        : column.key === "remarks"
                                        ? "200px"
                                        : "160px",
                                    maxWidth:
                                      column.key === "actions"
                                        ? "120px"
                                        : column.key === "orderNo"
                                        ? "120px"
                                        : column.key === "quotationNo"
                                        ? "150px"
                                        : column.key === "companyName"
                                        ? "250px"
                                        : column.key === "contactPersonName"
                                        ? "180px"
                                        : column.key === "contactNumber"
                                        ? "140px"
                                        : column.key === "billingAddress"
                                        ? "200px"
                                        : column.key === "shippingAddress"
                                        ? "200px"
                                        : column.key === "isOrderAcceptable"
                                        ? "150px"
                                        : column.key ===
                                          "orderAcceptanceChecklist"
                                        ? "250px"
                                        : column.key === "remarks"
                                        ? "200px"
                                        : "160px",
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

                      <div
                        className="overflow-y-auto"
                        style={{ maxHeight: "500px" }}
                      >
                        <Table>
                          <TableBody>
                            {filteredPendingOrders.map((order) => (
                              <TableRow
                                key={order.id}
                                className="hover:bg-gray-50"
                              >
                                {pendingColumns
                                  .filter(
                                    (col) => visiblePendingColumns[col.key]
                                  )
                                  .map((column) => (
                                    <TableCell
                                      key={column.key}
                                      className="border-b px-4 py-3 align-top"
                                      style={{
                                        width:
                                          column.key === "actions"
                                            ? "120px"
                                            : column.key === "orderNo"
                                            ? "120px"
                                            : column.key === "quotationNo"
                                            ? "150px"
                                            : column.key === "companyName"
                                            ? "250px"
                                            : column.key === "contactPersonName"
                                            ? "180px"
                                            : column.key === "contactNumber"
                                            ? "140px"
                                            : column.key === "billingAddress"
                                            ? "200px"
                                            : column.key === "shippingAddress"
                                            ? "200px"
                                            : column.key === "isOrderAcceptable"
                                            ? "150px"
                                            : column.key ===
                                              "orderAcceptanceChecklist"
                                            ? "250px"
                                            : column.key === "remarks"
                                            ? "200px"
                                            : "160px",
                                        minWidth:
                                          column.key === "actions"
                                            ? "120px"
                                            : column.key === "orderNo"
                                            ? "120px"
                                            : column.key === "quotationNo"
                                            ? "150px"
                                            : column.key === "companyName"
                                            ? "250px"
                                            : column.key === "contactPersonName"
                                            ? "180px"
                                            : column.key === "contactNumber"
                                            ? "140px"
                                            : column.key === "billingAddress"
                                            ? "200px"
                                            : column.key === "shippingAddress"
                                            ? "200px"
                                            : column.key === "isOrderAcceptable"
                                            ? "150px"
                                            : column.key ===
                                              "orderAcceptanceChecklist"
                                            ? "250px"
                                            : column.key === "remarks"
                                            ? "200px"
                                            : "160px",
                                        maxWidth:
                                          column.key === "actions"
                                            ? "120px"
                                            : column.key === "orderNo"
                                            ? "120px"
                                            : column.key === "quotationNo"
                                            ? "150px"
                                            : column.key === "companyName"
                                            ? "250px"
                                            : column.key === "contactPersonName"
                                            ? "180px"
                                            : column.key === "contactNumber"
                                            ? "140px"
                                            : column.key === "billingAddress"
                                            ? "200px"
                                            : column.key === "shippingAddress"
                                            ? "200px"
                                            : column.key === "isOrderAcceptable"
                                            ? "150px"
                                            : column.key ===
                                              "orderAcceptanceChecklist"
                                            ? "250px"
                                            : column.key === "remarks"
                                            ? "200px"
                                            : "160px",
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
                                  colSpan={
                                    pendingColumns.filter(
                                      (col) => visiblePendingColumns[col.key]
                                    ).length
                                  }
                                  className="text-center text-muted-foreground h-32"
                                >
                                  {searchTerm
                                    ? "No orders match your search criteria"
                                    : "No pending orders found"}
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
                    <CardTitle>Warehouse History</CardTitle>
                    <CardDescription>
                      Previously processed warehouse operations
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
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={showAllHistoryColumns}
                        >
                          Show All
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={hideAllHistoryColumns}
                        >
                          Hide All
                        </Button>
                      </div>
                      <DropdownMenuSeparator />
                      <div className="p-2 space-y-2">
                        {historyColumns.map((column) => (
                          <div
                            key={column.key}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={`history-${column.key}`}
                              checked={visibleHistoryColumns[column.key]}
                              onCheckedChange={() =>
                                toggleHistoryColumn(column.key)
                              }
                            />
                            <Label
                              htmlFor={`history-${column.key}`}
                              className="text-sm"
                            >
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
                    <div style={{ minWidth: "max-content" }}>
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
                                    width:
                                      column.key === "orderNo"
                                        ? "120px"
                                        : column.key === "quotationNo"
                                        ? "150px"
                                        : column.key === "companyName"
                                        ? "250px"
                                        : column.key === "contactPersonName"
                                        ? "180px"
                                        : column.key === "contactNumber"
                                        ? "140px"
                                        : column.key === "billingAddress"
                                        ? "200px"
                                        : column.key === "shippingAddress"
                                        ? "200px"
                                        : column.key === "isOrderAcceptable"
                                        ? "150px"
                                        : column.key ===
                                          "orderAcceptanceChecklist"
                                        ? "250px"
                                        : column.key === "remarks"
                                        ? "200px"
                                        : column.key === "availabilityStatus"
                                        ? "150px"
                                        : column.key === "inventoryRemarks"
                                        ? "200px"
                                        : "160px",
                                    minWidth:
                                      column.key === "orderNo"
                                        ? "120px"
                                        : column.key === "quotationNo"
                                        ? "150px"
                                        : column.key === "companyName"
                                        ? "250px"
                                        : column.key === "contactPersonName"
                                        ? "180px"
                                        : column.key === "contactNumber"
                                        ? "140px"
                                        : column.key === "billingAddress"
                                        ? "200px"
                                        : column.key === "shippingAddress"
                                        ? "200px"
                                        : column.key === "isOrderAcceptable"
                                        ? "150px"
                                        : column.key ===
                                          "orderAcceptanceChecklist"
                                        ? "250px"
                                        : column.key === "remarks"
                                        ? "200px"
                                        : column.key === "availabilityStatus"
                                        ? "150px"
                                        : column.key === "inventoryRemarks"
                                        ? "200px"
                                        : "160px",
                                    maxWidth:
                                      column.key === "orderNo"
                                        ? "120px"
                                        : column.key === "quotationNo"
                                        ? "150px"
                                        : column.key === "companyName"
                                        ? "250px"
                                        : column.key === "contactPersonName"
                                        ? "180px"
                                        : column.key === "contactNumber"
                                        ? "140px"
                                        : column.key === "billingAddress"
                                        ? "200px"
                                        : column.key === "shippingAddress"
                                        ? "200px"
                                        : column.key === "isOrderAcceptable"
                                        ? "150px"
                                        : column.key ===
                                          "orderAcceptanceChecklist"
                                        ? "250px"
                                        : column.key === "remarks"
                                        ? "200px"
                                        : column.key === "availabilityStatus"
                                        ? "150px"
                                        : column.key === "inventoryRemarks"
                                        ? "200px"
                                        : "160px",
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

                      <div
                        className="overflow-y-auto"
                        style={{ maxHeight: "500px" }}
                      >
                        <Table>
                          <TableBody>
                            {filteredHistoryOrders.map((order) => (
                              <TableRow
                                key={order.id}
                                className="hover:bg-gray-50"
                              >
                                {historyColumns
                                  .filter(
                                    (col) => visibleHistoryColumns[col.key]
                                  )
                                  .map((column) => (
                                    <TableCell
                                      key={column.key}
                                      className="border-b px-4 py-3 align-top"
                                      style={{
                                        width:
                                          column.key === "orderNo"
                                            ? "120px"
                                            : column.key === "quotationNo"
                                            ? "150px"
                                            : column.key === "companyName"
                                            ? "250px"
                                            : column.key === "contactPersonName"
                                            ? "180px"
                                            : column.key === "contactNumber"
                                            ? "140px"
                                            : column.key === "billingAddress"
                                            ? "200px"
                                            : column.key === "shippingAddress"
                                            ? "200px"
                                            : column.key === "isOrderAcceptable"
                                            ? "150px"
                                            : column.key ===
                                              "orderAcceptanceChecklist"
                                            ? "250px"
                                            : column.key === "remarks"
                                            ? "200px"
                                            : column.key ===
                                              "availabilityStatus"
                                            ? "150px"
                                            : column.key === "inventoryRemarks"
                                            ? "200px"
                                            : "160px",
                                        minWidth:
                                          column.key === "orderNo"
                                            ? "120px"
                                            : column.key === "quotationNo"
                                            ? "150px"
                                            : column.key === "companyName"
                                            ? "250px"
                                            : column.key === "contactPersonName"
                                            ? "180px"
                                            : column.key === "contactNumber"
                                            ? "140px"
                                            : column.key === "billingAddress"
                                            ? "200px"
                                            : column.key === "shippingAddress"
                                            ? "200px"
                                            : column.key === "isOrderAcceptable"
                                            ? "150px"
                                            : column.key ===
                                              "orderAcceptanceChecklist"
                                            ? "250px"
                                            : column.key === "remarks"
                                            ? "200px"
                                            : column.key ===
                                              "availabilityStatus"
                                            ? "150px"
                                            : column.key === "inventoryRemarks"
                                            ? "200px"
                                            : "160px",
                                        maxWidth:
                                          column.key === "orderNo"
                                            ? "120px"
                                            : column.key === "quotationNo"
                                            ? "150px"
                                            : column.key === "companyName"
                                            ? "250px"
                                            : column.key === "contactPersonName"
                                            ? "180px"
                                            : column.key === "contactNumber"
                                            ? "140px"
                                            : column.key === "billingAddress"
                                            ? "200px"
                                            : column.key === "shippingAddress"
                                            ? "200px"
                                            : column.key === "isOrderAcceptable"
                                            ? "150px"
                                            : column.key ===
                                              "orderAcceptanceChecklist"
                                            ? "250px"
                                            : column.key === "remarks"
                                            ? "200px"
                                            : column.key ===
                                              "availabilityStatus"
                                            ? "150px"
                                            : column.key === "inventoryRemarks"
                                            ? "200px"
                                            : "160px",
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
                                  colSpan={
                                    historyColumns.filter(
                                      (col) => visibleHistoryColumns[col.key]
                                    ).length
                                  }
                                  className="text-center text-muted-foreground h-32"
                                >
                                  {searchTerm
                                    ? "No orders match your search criteria"
                                    : "No history orders found"}
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
              <DialogTitle>Warehouse Processing</DialogTitle>
              <DialogDescription>
                Upload warehouse documentation and enter processing details
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="orderNumber">Order Number</Label>
                  <Input
                    id="orderNumber"
                    className="font-bold"
                    value={selectedOrder?.orderNo}
                    disabled
                  />
                </div>

                <div className="space-y-2">
                  <Label>Quotation No.</Label>
                  <Input className="font-bold" value={selectedOrder?.quotationNo || ""} disabled />
                </div>
              </div>

              {/* Items Section */}
              <div className="mt-4">
                <h5 className="font-medium mb-2">Items</h5>
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map(
                    (num) => {
                      const itemName = selectedOrder?.[`itemName${num}`];
                      const quantity = selectedOrder?.[`quantity${num}`];
                      // if (itemName || quantity) {
                      return (
                        <div key={num} className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Item Name {num}</Label>
                            <Input className="font-bold" value={itemName || ""} disabled />
                          </div>
                          <div className="space-y-2">
                            <Label>Quantity {num}</Label>
                            <Input className="font-bold" value={quantity || ""} disabled />
                          </div>
                        </div>
                      );
                      // }
                      return null;
                    }
                  )}
                </div>
              </div>

              {/* Attachments Section */}
              <div className="mt-4">
                <h5 className="font-medium mb-2">Attachments</h5>
                <div className="grid grid-cols-2 gap-4">
                  {/* {selectedOrder?.quotationCopy && (
                    <div className="space-y-2">
                      <Label>Quotation Copy</Label>
                      <div>
                        <a
                          href={selectedOrder.quotationCopy}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm"
                        >
                          View Document
                        </a>
                      </div>
                    </div>
                  )}
                  {selectedOrder?.quotationCopy2 && (
                    <div className="space-y-2">
                      <Label>Quotation Copy 2</Label>
                      <div>
                        <a
                          href={selectedOrder.quotationCopy2}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm"
                        >
                          View Document
                        </a>
                      </div>
                    </div>
                  )}
                  {selectedOrder?.acceptanceCopy && (
                    <div className="space-y-2">
                      <Label>Acceptance Copy</Label>
                      <div>
                        <a
                          href={selectedOrder.acceptanceCopy}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm"
                        >
                          View Document
                        </a>
                      </div>
                    </div>
                  )}
                  {selectedOrder?.ewayBillAttachment && (
                    <div className="space-y-2">
                      <Label>Eway Bill Attachment</Label>
                      <div>
                        <a
                          href={selectedOrder.ewayBillAttachment}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm"
                        >
                          View Document
                        </a>
                      </div>
                    </div>
                  )}
                  {selectedOrder?.srnNumberAttachment && (
                    <div className="space-y-2">
                      <Label>SRN Number Attachment</Label>
                      <div>
                        <a
                          href={selectedOrder.srnNumberAttachment}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm"
                        >
                          View Document
                        </a>
                      </div>
                    </div>
                  )}
                  {selectedOrder?.attachment && (
                    <div className="space-y-2">
                      <Label>Other Attachment</Label>
                      <div>
                        <a
                          href={selectedOrder.attachment}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm"
                        >
                          View Document
                        </a>
                      </div>
                    </div>
                  )} */}

                  {selectedOrder?.invoiceUpload && (
                    <div className="space-y-2">
                      <Label>Invoice Upload</Label>
                      <div>
                        <a
                          href={selectedOrder.invoiceUpload}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm"
                        >
                          View Document
                        </a>
                      </div>
                    </div>
                  )}
                  {/* {selectedOrder?.ewayBillUpload && (
                    <div className="space-y-2">
                      <Label>Eway Bill Upload</Label>
                      <div>
                        <a
                          href={selectedOrder.ewayBillUpload}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm"
                        >
                          View Document
                        </a>
                      </div>
                    </div>
                  )} */}
                </div>
              </div>

              {/* New Input Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="transporterName">
                    Transporter/Courier/Flight-Person Name
                  </Label>
                  <Input
                    id="transporterName"
                    value={transporterName}
                    onChange={(e) => setTransporterName(e.target.value)}
                    placeholder="Enter transporter name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="transporterContact">
                    Transporter/Courier/Flight-Person Contact No.
                  </Label>
                  <Input
                    id="transporterContact"
                    value={transporterContact}
                    onChange={(e) => setTransporterContact(e.target.value)}
                    placeholder="Enter contact number"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="biltyNumber">
                    Transporter/Courier/Flight-Bilty No./Docket No.
                  </Label>
                  <Input
                    id="biltyNumber"
                    value={biltyNumber}
                    onChange={(e) => setBiltyNumber(e.target.value)}
                    placeholder="Enter bilty/docket number"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="totalCharges">Total Charges</Label>
                  <Input
                    id="totalCharges"
                    value={totalCharges}
                    onChange={(e) => setTotalCharges(e.target.value)}
                    placeholder="Enter total charges"
                    type="number"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="warehouseRemarks">Warehouse Remarks</Label>
                <Textarea
                  id="warehouseRemarks"
                  value={warehouseRemarks}
                  onChange={(e) => setWarehouseRemarks(e.target.value)}
                  placeholder="Enter warehouse remarks"
                  rows={3}
                />
              </div>

              {/* File Upload Section */}
              <div className="border-t pt-4">
                <h4 className="font-medium mb-3">File Uploads</h4>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="beforePhoto">Before Photo Upload</Label>
                    <Input
                      id="beforePhoto"
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        setBeforePhoto(e.target.files?.[0] || null)
                      }
                    />
                    {beforePhoto && (
                      <p className="text-sm text-muted-foreground">
                        Selected: {beforePhoto.name}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="afterPhoto">After Photo Upload</Label>
                    <Input
                      id="afterPhoto"
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        setAfterPhoto(e.target.files?.[0] || null)
                      }
                    />
                    {afterPhoto && (
                      <p className="text-sm text-muted-foreground">
                        Selected: {afterPhoto.name}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="biltyUpload">Bilty Upload</Label>
                    <Input
                      id="biltyUpload"
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) =>
                        setBiltyUpload(e.target.files?.[0] || null)
                      }
                    />
                    {biltyUpload && (
                      <p className="text-sm text-muted-foreground">
                        Selected: {biltyUpload.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={uploading || currentUser?.role === "user"}
                >
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
              <DialogTitle>Warehouse Details</DialogTitle>
              <DialogDescription>
                View warehouse operation details
              </DialogDescription>
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
                    <p className="text-sm">
                      {viewOrder.invoiceNumber || "N/A"}
                    </p>
                  </div>
                  <div>
                    <Label>Transport Mode</Label>
                    <p className="text-sm">{viewOrder.transportMode}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Processed Date</Label>
                    <p className="text-sm">
                      {viewOrder.warehouseProcessedDate || "N/A"}
                    </p>
                  </div>
                  <div>
                    <Label>Destination</Label>
                    <p className="text-sm">{viewOrder.destination}</p>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
