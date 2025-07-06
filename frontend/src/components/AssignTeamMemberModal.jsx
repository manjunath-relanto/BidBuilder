"use client"

import { useState, useEffect } from "react"
import { useDispatch } from "react-redux"
import { proposalsAPI, userManagementAPI } from "../lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Label } from "./ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Badge } from "./ui/badge"
import { User, Users, CheckCircle } from "lucide-react"

export default function AssignTeamMemberModal({ proposal, onClose, onSuccess }) {
  const dispatch = useDispatch()
  const [users, setUsers] = useState([])
  const [selectedUserId, setSelectedUserId] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingUsers, setIsLoadingUsers] = useState(true)

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    setIsLoadingUsers(true)
    try {
      const response = await userManagementAPI.getAllUsers()
      setUsers(response)
    } catch (error) {
      console.error("Error loading users:", error)
      alert("Failed to load users. Please try again.")
    } finally {
      setIsLoadingUsers(false)
    }
  }

  const handleAssign = async () => {
    if (!selectedUserId) {
      alert("Please select a team member to assign")
      return
    }

    setIsLoading(true)
    try {
      await proposalsAPI.assignToUser(proposal.id, parseInt(selectedUserId))
      alert("Proposal assigned successfully!")
      onSuccess?.()
      onClose?.()
    } catch (error) {
      console.error("Error assigning proposal:", error)
      alert("Failed to assign proposal. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md mx-auto shadow-xl border-2 border-blue-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            Assign Team Member
          </CardTitle>
          <CardDescription>
            Assign "{proposal?.title}" to a team member
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Proposal Info */}
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <User className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Proposal Details</span>
            </div>
            <div className="text-sm text-gray-600">
              <p><strong>Title:</strong> {proposal?.title}</p>
              <p><strong>Client:</strong> {proposal?.client_name}</p>
              <p><strong>Status:</strong> 
                <Badge className="ml-2 bg-blue-100 text-blue-800">
                  {proposal?.status}
                </Badge>
              </p>
            </div>
          </div>

          {/* User Selection */}
          <div className="space-y-2">
            <Label htmlFor="user-select">Select Team Member</Label>
            {isLoadingUsers ? (
              <div className="flex items-center justify-center p-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                <span className="ml-2 text-sm text-gray-600">Loading users...</span>
              </div>
            ) : (
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a team member" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      <div className="flex items-center gap-2">
                        <span>{user.name || user.email}</span>
                        <Badge className={getRoleColor(user.role)}>
                          {getRoleDisplayName(user.role)}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Selected User Info */}
          {selectedUserId && (
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Selected User</span>
              </div>
              {(() => {
                const selectedUser = users.find(u => u.id.toString() === selectedUserId)
                return selectedUser ? (
                  <div className="text-sm text-blue-700">
                    <p><strong>Name:</strong> {selectedUser.name || 'N/A'}</p>
                    <p><strong>Email:</strong> {selectedUser.email}</p>
                    <p><strong>Role:</strong> {getRoleDisplayName(selectedUser.role)}</p>
                  </div>
                ) : null
              })()}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleAssign}
              disabled={isLoading || !selectedUserId}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Assigning...
                </>
              ) : (
                <>
                  <Users className="h-4 w-4 mr-2" />
                  Assign Proposal
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Helper functions (imported from roleUtils)
const getRoleDisplayName = (role) => {
  const roleNames = {
    'user': 'User',
    'manager': 'Manager',
    'admin': 'Administrator'
  }
  return roleNames[role] || role
}

const getRoleColor = (role) => {
  const roleColors = {
    'user': 'bg-blue-100 text-blue-800',
    'manager': 'bg-orange-100 text-orange-800',
    'admin': 'bg-red-100 text-red-800'
  }
  return roleColors[role] || 'bg-gray-100 text-gray-800'
} 