"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  LayoutDashboard,
  ClipboardCheck,
  Package,
  UserCheck,
  FileText,
  Receipt,
  FileSpreadsheet,
  Warehouse,
  PackageCheck,
  Award,
  Bell,
  Settings,
  LogOut,
  Menu,
} from "lucide-react"

const menuItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, step: "dashboard" },
  { href: "/order-acceptable", label: "Order Acceptable", icon: ClipboardCheck, step: "order-acceptable" },
  { href: "/check-inventory", label: "Check Inventory", icon: Package, step: "check-inventory" },
  { href: "/material-received", label: "Material Received", icon: Package, step: "material-received" },
  { href: "/senior-approval", label: "Senior Approval", icon: UserCheck, step: "senior-approval" },
  { href: "/disp-form", label: "DISP Form", icon: FileText, step: "disp-form" },
  { href: "/make-invoice", label: "Make Invoice", icon: Receipt, step: "make-invoice" },
  { href: "/make-pi", label: "Make PI", icon: FileSpreadsheet, step: "make-pi" },
  { href: "/warehouse", label: "Warehouse", icon: Warehouse, step: "warehouse" },
  { href: "/warehouse-material", label: "Warehouse (Material RCVD)", icon: PackageCheck, step: "warehouse-material" },
  { href: "/calibration", label: "Calibration Certificate", icon: Award, step: "calibration" },
  { href: "/service-intimation", label: "Service Intimation", icon: Bell, step: "service-intimation" },
  { href: "/settings", label: "Settings", icon: Settings, step: "settings" },
]

export function Sidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)

  const filteredMenuItems = menuItems.filter((item) => {
    if (user?.role === "admin") return true
    return user?.assignedSteps.includes(item.step) || user?.assignedSteps.includes("all")
  })

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">OTP System</h2>
        <p className="text-sm text-gray-600">Order To Payment</p>
      </div>
      <ScrollArea className="flex-1 px-3">
        <div className="space-y-1 py-4">
          {filteredMenuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-gray-100 ${
                  isActive ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700" : "text-gray-700"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}
        </div>
      </ScrollArea>
      <div className="p-3 border-t border-gray-200">
        <div className="flex items-center gap-3 px-3 py-2 text-sm">
          <div className="flex-1">
            <p className="font-medium text-gray-900">{user?.fullName}</p>
            <p className="text-xs text-gray-600">{user?.role}</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-3 mt-2 text-gray-700 hover:bg-gray-100"
          onClick={logout}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64">
          <SidebarContent />
        </SheetContent>
      </Sheet>
    </>
  )
}
