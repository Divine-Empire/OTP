"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"

interface User {
  id: string
  username: string
  fullName: string
  role: "admin" | "user"
  assignedSteps: string[]
}

interface AuthContextType {
  user: User | null
  login: (username: string, password: string) => boolean
  logout: () => void
  isAuthenticated: boolean
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

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

const defaultCredentials = {
  admin: "admin123",
  user1: "user123",
  user2: "user456",
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check for saved user on component mount
    const checkAuth = () => {
      try {
        const savedUser = localStorage.getItem("otp-user")
        const savedAuth = localStorage.getItem("otp-authenticated")

        if (savedUser && savedAuth === "true") {
          const userData = JSON.parse(savedUser)
          setUser(userData)
          setIsAuthenticated(true)
        }
      } catch (error) {
        console.error("Error checking authentication:", error)
        // Clear invalid data
        localStorage.removeItem("otp-user")
        localStorage.removeItem("otp-authenticated")
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = (username: string, password: string): boolean => {
    try {
      const users = JSON.parse(localStorage.getItem("otp-users") || JSON.stringify(defaultUsers))
      const foundUser = users.find((u: User) => u.username === username)

      if (foundUser && defaultCredentials[username as keyof typeof defaultCredentials] === password) {
        setUser(foundUser)
        setIsAuthenticated(true)
        localStorage.setItem("otp-user", JSON.stringify(foundUser))
        localStorage.setItem("otp-authenticated", "true")
        return true
      }
      return false
    } catch (error) {
      console.error("Login error:", error)
      return false
    }
  }

  const logout = () => {
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem("otp-user")
    localStorage.removeItem("otp-authenticated")
    localStorage.removeItem("otp-orders")
    localStorage.removeItem("otp-cache")
    router.push("/login")
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated, isLoading }}>{children}</AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
