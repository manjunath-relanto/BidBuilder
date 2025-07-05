"use client"

import { useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { addComment } from "@/lib/features/proposalSlice"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageCircle, Send } from "lucide-react"

export default function CommentSection({ proposalId, comments = [] }) {
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const [newComment, setNewComment] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmitComment = async (e) => {
    e.preventDefault()
    if (!newComment.trim()) return

    setIsSubmitting(true)
    try {
      await dispatch(
        addComment({
          proposalId,
          comment: {
            author: user?.name || "Anonymous",
            content: newComment.trim(),
          },
        }),
      )
      setNewComment("")
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

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
        {/* Existing Comments */}
        <div className="space-y-4">
          {comments.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No comments yet. Start the discussion!</p>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder.svg?height=32&width=32" />
                  <AvatarFallback>{comment.author.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{comment.author}</span>
                    <span className="text-xs text-muted-foreground">{formatTimestamp(comment.timestamp)}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{comment.content}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add New Comment */}
        <form onSubmit={handleSubmitComment} className="space-y-3">
          <div className="flex gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.avatar || "/placeholder.svg"} />
              <AvatarFallback>{user?.name?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                rows={3}
                className="resize-none"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit" size="sm" disabled={!newComment.trim() || isSubmitting}>
              <Send className="h-3 w-3 mr-1" />
              {isSubmitting ? "Posting..." : "Post Comment"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
