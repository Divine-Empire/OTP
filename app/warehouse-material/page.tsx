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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
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

export default function WarehouseMaterialPage() {
  const { orders, updateOrder } = useData();
  const [selectedOrder, setSelectedOrder] = useState<string>("");
  const [materialReceived, setMaterialReceived] = useState<string>("");
  const [installationRequired, setInstallationRequired] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewOrder, setViewOrder] = useState<any>(null);
  const [transporterFollowup, setTransporterFollowup] = useState<string>("");

  // New state for Google Sheets integration
  const [pendingOrders, setPendingOrders] = useState<any[]>([]);
  const [historyOrders, setHistoryOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const {user: currentUser} = useAuth();

  const APPS_SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbyzW8-RldYx917QpAfO4kY-T8_ntg__T0sbr7Yup2ZTVb1FC5H1g6TYuJgAU6wTquVM/exec";
  const SHEET_ID = "1yEsh4yzyvglPXHxo-5PT70VpwVJbxV7wwH8rpU1RFJA";
  const SHEET_NAME = "DISPATCH-DELIVERY";

  // Column definitions for Pending tab (B to BJ plus BV to CC)
  const pendingColumns = [
    { key: "actions", label: "Actions", searchable: false },
    { key: "orderNo", label: "Order No.", searchable: true },
    { key: "invoiceNumber", label: "Invoice Number", searchable: true },
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
    { key: "freightType", label: "Freight Type", searchable: true },
    { key: "destination", label: "Destination", searchable: true },
    { key: "poNumber", label: "Po Number", searchable: true },
    // { key: "quotationCopy2", label: "Quotation Copy", searchable: true },
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
    // BV to CC columns
    {
      key: "beforePhotoUpload",
      label: "Before Photo Upload",
      searchable: false,
    },
    { key: "afterPhotoUpload", label: "After Photo Upload", searchable: false },
    { key: "biltyUpload", label: "Bilty Upload", searchable: false },
    {
      key: "transporterName",
      label: "Transporter/Courier/Flight-Person Name",
      searchable: true,
    },
    {
      key: "transporterContact",
      label: "Transporter/Courier/Flight-Person Contact No.",
      searchable: true,
    },
    {
      key: "biltyNumber",
      label: "Transporter/Courier/Flight-Bilty No./Docket No.",
      searchable: true,
    },
    { key: "totalCharges", label: "Total Charges", searchable: true },
    { key: "warehouseRemarks", label: "Warehouse Remarks", searchable: true },
    { key: "dSrNumber", label: "D-Sr Number", searchable: true },
  ];

  // Column definitions for History tab (includes CG to CI)
  const historyColumns = [
    ...pendingColumns.filter((col) => col.key !== "actions"),
    // CG to CI columns
    {
      key: "materialReceivingStatus",
      label: "Material Receiving Status",
      searchable: true,
    },
    { key: "reason", label: "Reason", searchable: true },
    {
      key: "installationRequiredHistory",
      label: "Installation Required",
      searchable: true,
    },
    { key: "dSrNumber", label: "D-Sr Number", searchable: true },
  ];

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedColumn, setSelectedColumn] = useState("all");
  const [visiblePendingColumns, setVisiblePendingColumns] = useState(
    pendingColumns.reduce((acc, col) => ({ ...acc, [col.key]: true }), {})
  );
  const [visibleHistoryColumns, setVisibleHistoryColumns] = useState(
    historyColumns.reduce((acc, col) => ({ ...acc, [col.key]: true }), {})
  );

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
            const ceColumn = row.c[81] ? row.c[81].v : null; // Column CE (index 82)
            const cfColumn = row.c[82] ? row.c[82].v : null; // Column CF (index 83)

            // Only include rows where CE is not null and CF is null
            if (ceColumn && !cfColumn) {
              const order = {
                rowIndex: actualRowIndex,
                id: row.c[1] ? row.c[1].v : `ORDER-${actualRowIndex}`,
                orderNo: row.c[1] ? row.c[1].v : "", // Column B - Order No
                quotationNo: row.c[2] ? row.c[2].v : "", // Column C
                companyName: row.c[3] ? row.c[3].v : "",
                contactPersonName: row.c[4] ? row.c[4].v : "", // Fix field name to match column definitions
                contactNumber: row.c[5] ? row.c[5].v : "",
                billingAddress: row.c[6] ? row.c[6].v : "",
                shippingAddress: row.c[7] ? row.c[7].v : "",
                paymentMode: row.c[8] ? row.c[8].v : "",
                paymentTerms: row.c[9] ? row.c[9].v : "",
                qty: row.c[10] ? row.c[10].v : "", // Map to qty field for column definition
                transportMode: row.c[11] ? row.c[11].v : "",
                freightType: row.c[12] ? row.c[12].v : "",
                destination: row.c[13] ? row.c[13].v : "",
                poNumber: row.c[14] ? row.c[14].v : "",
                offer: row.c[15] ? row.c[15].v : "",
                dSrNumber: row.c[105] ? row.c[105].v : "",
                amount: row.c[20] ? Number.parseFloat(row.c[20].v) || 0 : 0,
                invoiceNumber: row.c[66] ? row.c[65].v : "", // Column BN (invoice number)
                warehouseProcessedDate: ceColumn, // Column CE contains the warehouse processing date
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
                // BV to CC columns (warehouse specific data)
                beforePhotoUpload: row.c[73] ? row.c[73].v : "", // Column BV
                afterPhotoUpload: row.c[74] ? row.c[74].v : "", // Column BW
                creName: row.c[106] ? row.c[106].v : "", // Column CD (index 81) - CRE Name
                biltyUpload: row.c[75] ? row.c[75].v : "", // Column BX
                transporterName: row.c[76] ? row.c[76].v : "", // Column BY
                transporterContact: row.c[77] ? row.c[77].v : "", // Column BZ
                biltyNumber: row.c[78] ? row.c[78].v : "", // Column CA
                totalCharges: row.c[79] ? row.c[79].v : "", // Column CB
                warehouseRemarks: row.c[80] ? row.c[80].v : "", // Column CC
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
            const ceColumn = row.c[81] ? row.c[81].v : null; // Column CE (index 82)
            const cfColumn = row.c[82] ? row.c[82].v : null; // Column CF (index 83)

            // Only include rows where both CE and CF are not null
            if (ceColumn && cfColumn) {
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
                poNumber: row.c[14] ? row.c[14].v : "",
                dSrNumber: row.c[105] ? row.c[105].v : "",
                offer: row.c[15] ? row.c[15].v : "",
                amount: row.c[12] ? Number.parseFloat(row.c[12].v) || 0 : 0,
                invoiceNumber: row.c[66] ? row.c[65].v : "", // Column BN (invoice number)
                warehouseProcessedDate: ceColumn, // Column CE contains the warehouse processing date
                materialProcessedDate: cfColumn, // Column CF contains the material processing date
                // Keep existing fields for backward compatibility
                contactPerson: row.c[4] ? row.c[4].v : "",
                quantity: row.c[10] ? row.c[10].v : "",
                totalQty: row.c[19] ? row.c[19].v : "",
                quotationCopy: row.c[15] ? row.c[15].v : "",
                fullRowData: row.c,
                materialRcvdData: {
                  materialReceived: row.c[84] ? row.c[84].v : "", // Column CG (index 85)
                  installationRequired: row.c[86] ? row.c[86].v : "", // Column CI (index 87)
                  transporterFollowup: row.c[85] ? row.c[85].v : "", // Column CH (index 86)
                  processedAt: cfColumn,
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
                // BV to CC columns (warehouse specific data)
                beforePhotoUpload: row.c[73] ? row.c[73].v : "", // Column BV
                afterPhotoUpload: row.c[74] ? row.c[74].v : "", // Column BW
                biltyUpload: row.c[75] ? row.c[75].v : "", // Column BX
                transporterName: row.c[76] ? row.c[76].v : "", // Column BY
                transporterContact: row.c[77] ? row.c[77].v : "", // Column BZ
                biltyNumber: row.c[78] ? row.c[78].v : "", // Column CA
                totalCharges: row.c[79] ? row.c[79].v : "", // Column CB
                warehouseRemarks: row.c[80] ? row.c[80].v : "", // Column CC
                // CG to CI columns
                creName: row.c[106] ? row.c[106].v : "", // Column CD (index 81) - CRE Name
                materialReceivingStatus: row.c[84] ? row.c[84].v : "", // Column CG
                reason: row.c[85] ? row.c[85].v : "", // Column CH
                installationRequiredHistory: row.c[86] ? row.c[86].v : "", // Column CI
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
  return orders.filter(order => order.creName === currentUser.username);
};

  // Filter orders based on search term and selected column
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

  // Legacy orders from useData hook (keep for backward compatibility)
  const legacyPendingOrders = orders.filter(
    (order) => order.status === "warehouse-processed"
  );
  const legacyProcessedOrders = orders.filter(
    (order) => order.materialRcvdData
  );

  const updateOrderStatus = async (order: any) => {
    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("sheetName", SHEET_NAME);
      formData.append("action", "updateByDSrNumber"); // Changed from updateByOrderNoInColumnB
      formData.append("dSrNumber", order.dSrNumber); // Changed from orderNo to dSrNumber

      const rowData = new Array(110).fill("");

      // Add today's date to CF column (index 83)
      const today = new Date();
      const formattedDate =
        `${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()} ` +
        `${today.getHours()}:${today.getMinutes()}:${today.getSeconds()}`;

      rowData[82] = formattedDate;

      // Add material data to columns CG onwards (indexes 84-86)
      rowData[84] = materialReceived; // Column CG
      rowData[85] = transporterFollowup; // Column CH
      rowData[86] = installationRequired; // Column CI

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
        await fetchHistoryOrders();
        return { success: true };
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
    setSelectedOrder(orderId);
    setMaterialReceived("");
    setInstallationRequired("");
    setTransporterFollowup("");
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!selectedOrder || !materialReceived || !installationRequired) return;

    const order = pendingOrders.find((o) => o.id === selectedOrder);
    if (!order) {
      // Fallback to legacy orders
      const materialRcvdData = {
        materialReceived,
        installationRequired,
        processedAt: new Date().toISOString(),
        processedBy: "Current User",
        transporterFollowup,
      };

      updateOrder(selectedOrder, {
        status: "material-received",
        materialRcvdData,
      });

      setIsDialogOpen(false);
      setSelectedOrder("");
      return;
    }

    // Check if D-Sr Number exists
    if (!order.dSrNumber) {
      alert("D-Sr Number not found for this order. Cannot process.");
      return;
    }

    const result = await updateOrderStatus(order);

    if (result.success) {
      setIsDialogOpen(false);
      setSelectedOrder("");
      alert(
        `Material receipt processing for D-Sr Number ${order.dSrNumber} has been completed successfully`
      );
    } else {
      alert(`Error processing material receipt: ${result.error}`);
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

    switch (columnKey) {
      // In the actions column renderer, update the Process button:
case "actions":
  return (
    <Button 
      size="sm" 
      onClick={() => handleProcess(order.id)}
      disabled={currentUser?.role === "user"}
    >
      Process
    </Button>
  );
      case "quotationCopy":
      case "quotationCopy2":
      //   return <Badge variant={value === "" ? "default" : ""}>{value || ""}</Badge>
      case "acceptanceCopy":
        return value &&
          typeof value === "string" &&
          (value.startsWith("http") || value.startsWith("https")) ? (
          <a href={value} target="_blank" rel="noopener noreferrer">
            <Badge variant="default">Link</Badge>
          </a>
        ) : (
          <Badge variant="secondary">{value || ""}</Badge>
        );
      case "calibrationCertRequired":
      case "installationRequired":
      case "installationRequiredHistory":
        return (
          <Badge
            variant={
              value === "Yes" || value === "YES" ? "default" : "secondary"
            }
          >
            {value || "N/A"}
          </Badge>
        );
      case "billingAddress":
      case "shippingAddress":
      case "remarks":
      case "warehouseRemarks":
      case "reason":
        return (
          <div className="max-w-[200px] whitespace-normal break-words">
            {value || ""}
          </div>
        );
      case "beforePhotoUpload":
      case "afterPhotoUpload":
      case "biltyUpload":
      case "ewayBillAttachment":
        return value &&
          typeof value === "string" &&
          (value.startsWith("http") || value.startsWith("https")) ? (
          <a href={value} target="_blank" rel="noopener noreferrer">
            <Badge variant="default">View</Badge>
          </a>
        ) : (
          <Badge variant="secondary">N/A</Badge>
        );
      case "materialReceivingStatus":
        return (
          <Badge variant={value === "yes" ? "default" : "secondary"}>
            {value || "N/A"}
          </Badge>
        );
      default:
        return value || "";
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        // Update the header section:
<div className="flex justify-between items-center">
  <div>
    <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
      Warehouse (Material RCVD)
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
                    <CardTitle>Pending Material Receipt</CardTitle>
                    <CardDescription>
                      Orders waiting for material receipt confirmation
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
                                        : column.key === "invoiceNumber"
                                        ? "150px"
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
                                        : column.key === "invoiceNumber"
                                        ? "150px"
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
                                        : column.key === "invoiceNumber"
                                        ? "150px"
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
                    <CardTitle>Material Receipt History</CardTitle>
                    <CardDescription>
                      Previously processed material receipts
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
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Material Receipt Confirmation</DialogTitle>
              <DialogDescription>
                Confirm material receipt and installation requirements
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="orderNumber">Order Number</Label>
                <Input id="orderNumber" value={selectedOrder} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="materialRcvd">Material RCVD</Label>
                <Select
                  value={materialReceived}
                  onValueChange={setMaterialReceived}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="installation">Installation Required</Label>
                <Select
                  value={installationRequired}
                  onValueChange={setInstallationRequired}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="YES">YES</SelectItem>
                    <SelectItem value="NO">NO</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="transporterFollowup">Reason</Label>
                <Input
                  id="transporterFollowup"
                  placeholder="Enter Reason details"
                  value={transporterFollowup}
                  onChange={(e) => setTransporterFollowup(e.target.value)}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                // In the Process Dialog submit button:
<Button
  onClick={handleSubmit}
  disabled={
    !materialReceived || 
    !installationRequired || 
    uploading ||
    currentUser?.role === "user"
  }
>
  {uploading ? (
    <>
      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
      Submitting...
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
              <DialogTitle>Material Receipt Details</DialogTitle>
              <DialogDescription>
                View material receipt information
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
                      {viewOrder.materialProcessedDate || "N/A"}
                    </p>
                  </div>
                  <div>
                    <Label>Destination</Label>
                    <p className="text-sm">{viewOrder.destination}</p>
                  </div>
                </div>
                {viewOrder.materialRcvdData && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Material Received</Label>
                      <p className="text-sm">
                        {viewOrder.materialRcvdData.materialReceived}
                      </p>
                    </div>
                    <div>
                      <Label>Installation Required</Label>
                      <p className="text-sm">
                        {viewOrder.materialRcvdData.installationRequired}
                      </p>
                    </div>
                    <div>
                      <Label>Reason</Label>
                      <p className="text-sm">
                        {viewOrder.materialRcvdData.transporterFollowup ||
                          "N/A"}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
