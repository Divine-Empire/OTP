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
import { Plus, Edit, Trash2 } from "lucide-react"

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

const defaultUsers: User[] = [
  {
    id: "admin",
    username: "admin",
    fullName: "Administrator",
    role: "admin",
    assignedSteps: ["all"],
  },
  {
    id: "user1",
    username: "user1",
    fullName: "User One",
    role: "user",
    assignedSteps: ["dashboard", "order-acceptable", "check-inventory"],
  },
  {
    id: "user2",
    username: "user2",
    fullName: "User Two",
    role: "user",
    assignedSteps: ["warehouse", "calibration", "service-intimation"],
  },
]

export default function SettingsPage() {
  const { user: currentUser } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [formData, setFormData] = useState({
    username: "",
    fullName: "",
    password: "",
    role: "user" as "admin" | "user",
    assignedSteps: [] as string[],
  })

  useEffect(() => {
    const savedUsers = localStorage.getItem("otp-users")
    if (savedUsers) {
      setUsers(JSON.parse(savedUsers))
    } else {
      setUsers(defaultUsers)
      localStorage.setItem("otp-users", JSON.stringify(defaultUsers))
    }
  }, [])

  const saveUsers = (updatedUsers: User[]) => {
    setUsers(updatedUsers)
    localStorage.setItem("otp-users", JSON.stringify(updatedUsers))
  }

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
      password: "",
      role: user.role,
      assignedSteps: user.assignedSteps,
    })
    setIsDialogOpen(true)
  }

  const handleDeleteUser = (userId: string) => {
    if (userId === "admin") return // Prevent deleting admin
    const updatedUsers = users.filter((u) => u.id !== userId)
    saveUsers(updatedUsers)
  }

  const handleSubmit = () => {
    if (!formData.username || !formData.fullName) return

    if (editingUser) {
      // Edit existing user
      const updatedUsers = users.map((u) => (u.id === editingUser.id ? { ...u, ...formData, id: editingUser.id } : u))
      saveUsers(updatedUsers)
    } else {
      // Add new user
      const newUser: User = {
        id: `user_${Date.now()}`,
        ...formData,
      }
      saveUsers([...users, newUser])
    }

    setIsDialogOpen(false)
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
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
            <p className="text-muted-foreground">Manage users and their permissions</p>
          </div>
          <Button onClick={handleAddUser}>
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
            <CardDescription>Manage system users and their access permissions</CardDescription>
          </CardHeader>
          <CardContent>
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
                          {user.id !== "admin" && (
                            <Button size="sm" variant="outline" onClick={() => handleDeleteUser(user.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
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
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                    placeholder="Enter password"
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
                <Button onClick={handleSubmit} disabled={!formData.username || !formData.fullName}>
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
