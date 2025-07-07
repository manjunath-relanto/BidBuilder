import { useEffect, useState, useRef } from "react"
import { useSelector } from "react-redux"
import { proposalsAPI } from "../lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Textarea } from "./ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { MessageCircle, Send } from "lucide-react"

export default function TeamDiscussion({ proposalId }) {
  const { user } = useSelector((state) => state.auth)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    fetchMessages()
    // Optionally, poll for new messages every 30s
    // const interval = setInterval(fetchMessages, 30000)
    // return () => clearInterval(interval)
  }, [proposalId])

  const fetchMessages = async () => {
    setIsLoading(true)
    try {
      const data = await proposalsAPI.getChatMessages(proposalId)
      setMessages(Array.isArray(data) ? data : [])
    } catch (error) {
      setMessages([])
    } finally {
      setIsLoading(false)
      scrollToBottom()
    }
  }

  const handleSend = async (e) => {
    e.preventDefault()
    if (!newMessage.trim()) return
    setIsSubmitting(true)
    try {
      await proposalsAPI.postChatMessage(proposalId, newMessage.trim())
      setNewMessage("")
      await fetchMessages()
    } catch (error) {
      // Optionally show error
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return ""
    return new Date(timestamp).toLocaleString()
  }

  const scrollToBottom = () => {
    setTimeout(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
      }
    }, 100)
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Team Discussion
        </CardTitle>
        <CardDescription>Collaborate with your team on this proposal</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Chat Messages */}
        <div className="space-y-4 max-h-64 overflow-y-auto bg-gray-50 p-2 rounded">
          {isLoading ? (
            <p className="text-center text-muted-foreground">Loading messages...</p>
          ) : messages.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No messages yet. Start the discussion!</p>
          ) : (
            messages.map((msg) => (
              <div key={msg.id || msg.timestamp} className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={msg.avatar || "/placeholder.svg?height=32&width=32"} />
                  <AvatarFallback>{(msg.author || msg.username || "U").charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{msg.author || msg.username || "User"}</span>
                    <span className="text-xs text-muted-foreground">{formatTimestamp(msg.timestamp)}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{msg.content}</p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Add New Message */}
        <form onSubmit={handleSend} className="space-y-3">
          <div className="flex gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.avatar || "/placeholder.svg"} />
              <AvatarFallback>{user?.name?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                rows={3}
                className="resize-none"
                disabled={isSubmitting}
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit" size="sm" disabled={!newMessage.trim() || isSubmitting}>
              <Send className="h-3 w-3 mr-1" />
              {isSubmitting ? "Sending..." : "Send"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
} 