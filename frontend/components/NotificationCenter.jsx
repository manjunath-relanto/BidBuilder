"use client"

import { useSelector, useDispatch } from "react-redux"
import { markAsRead, markAllAsRead } from "@/lib/features/notificationsSlice"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Bell, Check, CheckCheck, AlertCircle, MessageCircle, Clock } from "lucide-react"

export default function NotificationCenter() {
  const dispatch = useDispatch()
  const { items: notifications, unreadCount } = useSelector((state) => state.notifications)

  const handleMarkAsRead = (id) => {
    dispatch(markAsRead(id))
  }

  const handleMarkAllAsRead = () => {
    dispatch(markAllAsRead())
  }

  const getNotificationIcon = (type) => {
    const iconProps = { className: "h-4 w-4" }
    switch (type) {
      case "approval":
        return <Check {...iconProps} className="h-4 w-4 text-green-600" />
      case "comment":
        return <MessageCircle {...iconProps} className="h-4 w-4 text-blue-600" />
      case "deadline":
        return <Clock {...iconProps} className="h-4 w-4 text-orange-600" />
      default:
        return <AlertCircle {...iconProps} className="h-4 w-4 text-gray-600" />
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-50 text-red-700 border-red-200"
      case "medium":
        return "bg-yellow-50 text-yellow-700 border-yellow-200"
      default:
        return "bg-blue-50 text-blue-700 border-blue-200"
    }
  }

  const getNotificationBg = (notification) => {
    if (!notification.read) {
      return "bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-l-blue-500"
    }
    return "bg-white hover:bg-gray-50"
  }

  const formatTimestamp = (timestamp) => {
    const now = new Date()
    const notificationTime = new Date(timestamp)
    const diffInHours = Math.floor((now - notificationTime) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours}h ago`
    return notificationTime.toLocaleDateString()
  }

  return (
    <Card className="w-full max-w-md shadow-xl border-0">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="p-2 bg-blue-100 rounded-full">
              <Bell className="h-4 w-4 text-blue-600" />
            </div>
            Notifications
            {unreadCount > 0 && (
              <Badge variant="destructive" className="ml-2 animate-pulse">
                {unreadCount}
              </Badge>
            )}
          </CardTitle>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead} className="text-xs">
              <CheckCheck className="h-3 w-3 mr-1" />
              Mark all read
            </Button>
          )}
        </div>
      </CardHeader>
      <Separator />
      <CardContent className="p-0">
        <ScrollArea className="h-96">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="p-3 bg-gray-100 rounded-full mb-3">
                <Bell className="h-6 w-6 text-gray-400" />
              </div>
              <p className="text-sm text-muted-foreground">No notifications yet</p>
              <p className="text-xs text-muted-foreground mt-1">You're all caught up!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 cursor-pointer transition-all duration-200 hover:shadow-sm ${getNotificationBg(
                    notification,
                  )}`}
                  onClick={() => !notification.read && handleMarkAsRead(notification.id)}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className="flex-shrink-0 mt-0.5">
                      <div className="p-2 bg-white rounded-full shadow-sm border">
                        {getNotificationIcon(notification.type)}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-start justify-between gap-2">
                        <h4
                          className={`text-sm font-medium leading-tight ${
                            !notification.read ? "text-gray-900" : "text-gray-700"
                          }`}
                        >
                          {notification.title}
                        </h4>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <Badge variant="outline" className={`text-xs ${getPriorityColor(notification.priority)}`}>
                            {notification.priority}
                          </Badge>
                          {!notification.read && <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />}
                        </div>
                      </div>

                      <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                        {notification.message}
                      </p>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-xs text-muted-foreground">{formatTimestamp(notification.timestamp)}</span>
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleMarkAsRead(notification.id)
                            }}
                          >
                            Mark read
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>

      {/* Footer */}
      {notifications.length > 0 && (
        <>
          <Separator />
          <div className="p-3 bg-gray-50">
            <Button variant="ghost" size="sm" className="w-full text-xs text-muted-foreground hover:text-gray-700">
              View all notifications
            </Button>
          </div>
        </>
      )}
    </Card>
  )
}
