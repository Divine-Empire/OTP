"use client"

import { useState, useEffect } from "react"
import { MainLayout } from "@/components/layout/main-layout"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, RefreshCw } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface User {
  id: string
  username: string
  fullName: string
  role: "admin" | "user"
  assignedSteps: string[]
}

const allSteps = [
  { id: "dashboard", label: "Dashboard" },
  { id: "order-acceptable", label: "Order Acceptable" },
  { id: "check-inventory", label: "Check Inventory" },
  { id: "senior-approval", label: "Senior Approval" },
  { id: "disp-form", label: "DISP Form" },
  { id: "make-invoice", label: "Make Invoice" },
  { id: "make-pi", label: "Make PI" },
  { id: "warehouse", label: "Warehouse" },
  { id: "warehouse-material", label: "Warehouse (Material RCVD)" },
  { id: "calibration", label: "Calibration Certificate" },
  { id: "service-intimation", label: "Service Intimation" },
  { id: "settings", label: "Settings" },
]

// Google Sheets configuration
const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbyzW8-RldYx917QpAfO4kY-T8_ntg__T0sbr7Yup2ZTVb1FC5H1g6TYuJgAU6wTquVM/exec"
const SHEET_ID = "1yEsh4yzyvglPXHxo-5PT70VpwVJbxV7wwH8rpU1RFJA"
const LOGIN_SHEET_NAME = "Login"

export default function SettingsPage() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    username: "",
    fullName: "",
    password: "",
    role: "user" as "admin" | "user",
    assignedSteps: [] as string[],
  })

  // Fetch users from Google Sheets
  const fetchUsers = async () => {
    setLoading(true)
    try {
      const sheetUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json&sheet=${LOGIN_SHEET_NAME}`
      const response = await fetch(sheetUrl)
      const text = await response.text()

      const jsonStart = text.indexOf("{")
      const jsonEnd = text.lastIndexOf("}") + 1
      const jsonData = text.substring(jsonStart, jsonEnd)

      const data = JSON.parse(jsonData)

      if (data && data.table && data.table.rows) {
        const usersData: User[] = []

        // Skip header row
        data.table.rows.slice(1).forEach((row: any, index: number) => {
          if (row.c) {
            const username = row.c[0]?.v || ""
            const fullName = row.c[1]?.v || ""
            const password = row.c[2]?.v || ""
            const role = row.c[3]?.v || "user"
            const assignedStepsStr = row.c[4]?.v || ""

            const assignedSteps = assignedStepsStr.split(",").map((step: string) => step.trim())

            usersData.push({
              id: `user_${index}`,
              username,
              fullName,
              role: role === "admin" ? "admin" : "user",
              assignedSteps: assignedSteps.length > 0 ? assignedSteps : ["all"],
            })
          }
        })

        setUsers(usersData)
      }
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleAddUser = () => {
    setEditingUser(null)
    setFormData({
      username: "",
      fullName: "",
      password: "",
      role: "user",
      assignedSteps: [],
    })
    setIsDialogOpen(true)
  }

  const handleEditUser = (user: User) => {
    setEditingUser(user)
    setFormData({
      username: user.username,
      fullName: user.fullName,
      password: "", // Don't show password for security
      role: user.role,
      assignedSteps: user.assignedSteps,
    })
    setIsDialogOpen(true)
  }

  const handleDeleteUser = async (userId: string) => {
    // Find the user to delete
    const userToDelete = users.find((u) => u.id === userId)
    if (!userToDelete) return

    try {
      // Find the row index of the user we're deleting
      const userIndex = users.findIndex((u) => u.id === userId)
      if (userIndex === -1) {
        throw new Error("User not found")
      }

      // Row index in the sheet is userIndex + 2 (accounting for header row and 0-based index)
      const rowIndex = userIndex + 2

      // Use Apps Script to delete the user from Google Sheets
      const formData = new FormData()
      formData.append("action", "delete")
      formData.append("sheetName", LOGIN_SHEET_NAME)
      formData.append("rowIndex", rowIndex.toString())

      const response = await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        mode: "cors",
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      if (result.success) {
        // Refresh the user list
        await fetchUsers()
        toast({
          title: "User deleted",
          description: `${userToDelete.username} has been removed successfully.`,
        })
      } else {
        throw new Error(result.error || "Delete failed")
      }
    } catch (error) {
      console.error("Error deleting user:", error)
      toast({
        title: "Error",
        description: "Failed to delete user. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleSubmit = async () => {
    if (!formData.username || !formData.fullName || (!editingUser && !formData.password)) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    try {
      // Format assigned steps as comma-separated string
      const assignedStepsStr = formData.assignedSteps.join(", ")

      // Create row data array
      const rowData = [
        formData.username,
        formData.fullName,
        formData.password || (editingUser ? "unchanged" : ""),
        formData.role,
        assignedStepsStr,
      ]

      const formDataToSend = new FormData()

      if (editingUser) {
        // Find the row index of the user we're editing
        const userIndex = users.findIndex((u) => u.id === editingUser.id)
        if (userIndex === -1) {
          throw new Error("User not found")
        }

        // Row index in the sheet is userIndex + 2 (accounting for header row and 0-based index)
        const rowIndex = userIndex + 2

        formDataToSend.append("action", "update")
        formDataToSend.append("sheetName", LOGIN_SHEET_NAME)
        formDataToSend.append("rowIndex", rowIndex.toString())
        formDataToSend.append("rowData", JSON.stringify(rowData))
      } else {
        // For new users, use the insert action
        formDataToSend.append("action", "insert")
        formDataToSend.append("sheetName", LOGIN_SHEET_NAME)
        formDataToSend.append("rowData", JSON.stringify(rowData))
      }

      const response = await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        mode: "cors",
        body: formDataToSend,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      if (result.success) {
        // Refresh the user list
        await fetchUsers()
        setIsDialogOpen(false)

        toast({
          title: editingUser ? "User updated" : "User created",
          description: `${formData.username} has been ${editingUser ? "updated" : "added"} successfully.`,
        })
      } else {
        throw new Error(result.error || "Operation failed")
      }
    } catch (error) {
      console.error("Error saving user:", error)
      toast({
        title: "Error",
        description: "Failed to save user. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleStepChange = (stepId: string, checked: boolean) => {
    if (checked) {
      setFormData((prev) => ({
        ...prev,
        assignedSteps: [...prev.assignedSteps, stepId],
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        assignedSteps: prev.assignedSteps.filter((s) => s !== stepId),
      }))
    }
  }

  if (currentUser?.role !== "admin") {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">Access Denied</h2>
            <p className="text-gray-600">You don't have permission to access this page.</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">Settings</h1>
            <p className="text-muted-foreground">Manage users and their permissions</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchUsers}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={handleAddUser}>
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
            <CardDescription>Manage system users and their access permissions from Google Sheets</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <RefreshCw className="h-6 w-6 animate-spin" />
                <span className="ml-2">Loading users from Google Sheets...</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Username</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Assigned Steps</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.username}</TableCell>
                        <TableCell>{user.fullName}</TableCell>
                        <TableCell>
                          <Badge variant={user.role === "admin" ? "default" : "secondary"}>{user.role}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {user.assignedSteps.includes("all") ? (
                              <Badge variant="outline">All Steps</Badge>
                            ) : (
                              user.assignedSteps.map((step) => (
                                <Badge key={step} variant="outline" className="text-xs">
                                  {allSteps.find((s) => s.id === step)?.label || step}
                                </Badge>
                              ))
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => handleEditUser(user)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleDeleteUser(user.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {users.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          No users found in Google Sheets
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingUser ? "Edit User" : "Add User"}</DialogTitle>
              <DialogDescription>
                {editingUser ? "Update user information and permissions" : "Create a new user account"}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username *</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => setFormData((prev) => ({ ...prev, username: e.target.value }))}
                    placeholder="Enter username"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => setFormData((prev) => ({ ...prev, fullName: e.target.value }))}
                    placeholder="Enter full name"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Password {editingUser ? "(leave blank to keep unchanged)" : "*"}</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                    placeholder={editingUser ? "Leave blank to keep unchanged" : "Enter password"}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role *</Label>
                  <Select
                    value={formData.role}
                    onValueChange={(value: "admin" | "user") => setFormData((prev) => ({ ...prev, role: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Assigned Steps</Label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border rounded-md p-3">
                  {allSteps.map((step) => (
                    <div key={step.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={step.id}
                        checked={formData.assignedSteps.includes(step.id)}
                        onCheckedChange={(checked) => handleStepChange(step.id, checked as boolean)}
                      />
                      <Label htmlFor={step.id} className="text-sm">
                        {step.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!formData.username || !formData.fullName || (!editingUser && !formData.password)}
                >
                  {editingUser ? "Update" : "Create"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  )
}
