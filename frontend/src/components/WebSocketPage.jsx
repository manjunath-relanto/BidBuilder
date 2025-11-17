"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Textarea } from "./ui/textarea"
import { Badge } from "./ui/badge"
import { AlertCircle, Loader, CheckCircle, Copy, Download } from "lucide-react"

export default function WebSocketPage() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [streamingResponse, setStreamingResponse] = useState("")
  const [fullData, setFullData] = useState(null)
  const [status, setStatus] = useState("idle") // idle, connecting, streaming, complete, error
  const [error, setError] = useState("")
  const [copySuccess, setCopySuccess] = useState(false)
  const wsRef = useRef(null)
  const streamBufferRef = useRef("")
  const streamOutputRef = useRef(null)
  const isStreamingActive = status === "connecting" || status === "streaming"
  const showMagicBadge = status === "connecting"
  const streamShellClass = isStreamingActive
    ? "rounded-3xl transition-all duration-300 p-[5px] animate-gradient-border shadow-[0_0_50px_rgba(59,130,246,0.55)]"
    : "rounded-3xl transition-all duration-300 p-[2px] border border-gray-200"

  // Clean up WebSocket on unmount
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [])

  useEffect(() => {
    if (!streamOutputRef.current) return
    streamOutputRef.current.scrollTop = streamOutputRef.current.scrollHeight
  }, [streamingResponse])

  const handleStreamProposal = async () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.close(4000, "Superseded by new request")
    }
    // Validation
    if (!title.trim()) {
      setError("Title is required")
      setStatus("error")
      return
    }
    if (!description.trim()) {
      setError("Description is required")
      setStatus("error")
      return
    }

    setIsLoading(true)
    setStatus("connecting")
    setStreamingResponse("")
    setFullData(null)
    setError("")
    streamBufferRef.current = ""

    try {
      // Configure your backend WebSocket endpoint here (must match backend route)
      const API_BASE = "ws://127.0.0.1:8000/ws/proposals/"
      let wsUrl

      // Convert HTTP(S) URL to WS(S)
      if (API_BASE.startsWith("ws://") || API_BASE.startsWith("wss://")) {
        wsUrl = API_BASE
      } else if (API_BASE.startsWith("http://")) {
        wsUrl = API_BASE.replace(/^http/, "ws")
      } else if (API_BASE.startsWith("https://")) {
        wsUrl = API_BASE.replace(/^https/, "wss")
      } else {
        // Fallback based on current page protocol
        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:"
        wsUrl = `${protocol}//127.0.0.1:8000/ws/proposals/`
      }
      
      console.log(`🔌 Attempting WebSocket connection to: ${wsUrl}`)
      console.info("Checklist ➜ 1) Confirm backend listens on :8000  2) Path matches backend WS route  3) Host matches 127.0.0.1  4) Protocol matches page (ws/wss)")

      wsRef.current = new WebSocket(wsUrl)

      wsRef.current.onopen = () => {
        console.log("✅ WebSocket connected successfully")
        setStatus("streaming")
        
        // Send the stream payload to start streaming
        wsRef.current.send(
          JSON.stringify({
            title: title.trim(),
            description: description.trim(),
          })
        )
      }

      wsRef.current.onmessage = (event) => {
        try {
          // Backend now emits JSON events: {event: "chunk" | "complete", data|summary: "..."}
          const message = JSON.parse(event.data)

          if (message.event === "chunk" && typeof message.data === "string") {
            streamBufferRef.current += message.data
            setStreamingResponse(streamBufferRef.current)
            setStatus("streaming")
            return
          }

          if (message.event === "complete") {
            console.log("✓ Stream completed via event payload")
            if (typeof message.summary === "string") {
              streamBufferRef.current += message.summary
              setStreamingResponse(streamBufferRef.current)
            }
            setFullData(message)
            setStatus("complete")
            setIsLoading(false)
            return
          }

          if (message.status === "complete") {
            console.log("✓ Stream completed")
            setStatus("complete")
            setIsLoading(false)
            return
          }

          if (message.error) {
            setError(message.error)
            setStatus("error")
            setIsLoading(false)
            return
          }
        } catch (e) {
          // Not JSON, it's a text chunk - append to buffer
          streamBufferRef.current += event.data
          setStreamingResponse(streamBufferRef.current)
          setStatus("streaming")
        }
      }

      wsRef.current.onerror = (error) => {
        console.error("❌ WebSocket error at URL:", wsUrl)
        console.error("Error details:", error)
        console.error("ReadyState:", wsRef.current?.readyState)
        const errorMsg = `Failed to connect to ${wsUrl}. Check that your backend is running and accessible.`
        console.warn("Quick checklist hints: verify port 8000 is free, firewalls allow it, and any reverse proxy forwards Upgrade/Connection headers.")
        setError(errorMsg)
        setStatus("error")
        setIsLoading(false)
      }

      wsRef.current.onclose = () => {
        console.log("⚪ WebSocket connection closed")
        if (status !== "error" && streamingResponse) {
          setStatus("complete")
        }
        setIsLoading(false)
      }
    } catch (err) {
      console.error("Error during WebSocket setup:", err)
      setError(err.message || "Failed to connect to WebSocket stream")
      setStatus("error")
      setIsLoading(false)
    }
  }

  const handleCopyResponse = () => {
    navigator.clipboard.writeText(streamingResponse)
    setCopySuccess(true)
    setTimeout(() => setCopySuccess(false), 2000)
  }

  const handleDownloadResponse = () => {
    const element = document.createElement("a")
    const file = new Blob([streamingResponse], { type: "text/plain" })
    element.href = URL.createObjectURL(file)
    element.download = `stream-response-${Date.now()}.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const handleReset = () => {
    setTitle("")
    setDescription("")
    setStreamingResponse("")
    setFullData(null)
    setStatus("idle")
    setError("")
    if (wsRef.current) {
      wsRef.current.close()
    }
  }

  return ( 
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        {/* <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Realtime Stream Studio</h1>
          <p className="text-gray-600">Send any title + description combo and watch the WebSocket stream paint the response live.</p>
        </div> */}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Form */}
          <Card className="lg:h-fit">
            <CardHeader>
              <CardTitle>Stream Input</CardTitle>
              <CardDescription>Describe what you need and trigger the live channel</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <Input
                  placeholder="Name your request"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <Textarea
                  placeholder="Share context, goals, or constraints"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full min-h-32"
                />
              </div>

              {/* Status Badge */}
              <div className="flex items-center gap-2 flex-wrap">
                {status === "idle" && <Badge variant="outline">Ready</Badge>}
                {status === "connecting" && (
                  <Badge className="bg-blue-100 text-blue-800 border-blue-300">
                    <Loader className="w-3 h-3 mr-1 animate-spin" />
                    Connecting...
                  </Badge>
                )}
                {status === "streaming" && (
                  <Badge className="bg-orange-100 text-orange-800 border-orange-300">
                    <Loader className="w-3 h-3 mr-1 animate-spin" />
                    Streaming data...
                  </Badge>
                )}
                {status === "complete" && (
                  <Badge className="bg-green-100 text-green-800 border-green-300">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Complete
                  </Badge>
                )}
                {status === "error" && (
                  <Badge className="bg-red-100 text-red-800 border-red-300">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Error
                  </Badge>
                )}
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex gap-2">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">Error</p>
                    <p className="text-sm">{error}</p>
                  </div>
                </div>
              )}

              {/* Full Data Display */}
              {/* {fullData && (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3 space-y-2">
                  <p className="text-sm font-medium text-blue-900">Proposal Created</p>
                  <div className="text-xs text-blue-800 space-y-1">
                    <p><strong>ID:</strong> {fullData.id}</p>
                    <p><strong>Title:</strong> {fullData.title}</p>
                    <p><strong>Status:</strong> {fullData.status}</p>
                  </div>
                </div>
              )} */}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4">
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    onClick={handleStreamProposal}
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                  >
                    {isLoading ? (
                      <>
                        <Loader className="w-4 h-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Start Streaming"
                    )}
                  </Button>
                  <Button
                    onClick={() => {
                      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                        wsRef.current.close(4001, "Stopped by user")
                      }
                      setIsLoading(false)
                      setStatus("idle")
                    }}
                    variant="outline"
                    className="flex-none"
                    disabled={!isStreamingActive}
                  >
                    Stop
                  </Button>
                </div>
                <Button onClick={handleReset} variant="outline" disabled={isLoading} className="flex-1">
                  Reset
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Streaming Response */}
          <Card >
            <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle>Live Response Canvas</CardTitle>
                <CardDescription>Watch the stream animate in real-time</CardDescription>
              </div>
              {streamingResponse && (
                <div className="flex w-full md:w-auto gap-2">
                  <Button
                    size="sm"
                    onClick={handleCopyResponse}
                    variant="outline"
                    className="flex-1 md:flex-none"
                  >
                    <Copy className="w-3.5 h-3.5 mr-1.5" />
                    {copySuccess ? "Copied" : "Copy"}
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleDownloadResponse}
                    variant="outline"
                    className="flex-1 md:flex-none"
                  >
                    <Download className="w-3.5 h-3.5 mr-1.5" />
                    Save
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className={`${streamShellClass} min-h-[28rem]`}>
                <div
                  ref={streamOutputRef}
                  className="relative bg-gray-900 text-gray-100 rounded-2xl p-2 min-h-[28rem] max-h-[28rem] overflow-y-auto font-mono text-sm scroll-stealth"
                >
                  {showMagicBadge && (
                    <div className="absolute top-4 right-4 flex items-center gap-2 text-[10px] uppercase tracking-widest text-cyan-200 pointer-events-none">
                      <Loader className="w-4 h-4 animate-spin text-cyan-300" />
                      <span>Priming stream</span>
                    </div>
                  )}
                  {streamingResponse ? (
                    <div className="space-y-1 whitespace-pre-wrap">
                      {streamingResponse}
                      {status === "streaming" && (
                        <span className="text-blue-400 animate-pulse">▌</span>
                      )}
                    </div>
                  ) : (
                    <div className="text-gray-500 italic flex items-center justify-center h-full">
                      {status === "idle" ? "Waiting for your prompt..." : "Summoning the stream..."}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Info Section */}
        {/* <Card className="mt-6 bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-base">How WebSocket Streaming Works</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-gray-700 space-y-2">
            <p>
              <strong>1. Backend URL:</strong> This component connects to <code className="bg-white px-2 py-1 rounded text-xs">ws://127.0.0.1:8000/ws/proposals/</code>
            </p>
            <p>
              <strong>2. Protocol Conversion:</strong> If you swap in an <code>http(s)://</code> base URL, the component safely converts it to <code>ws(s)://</code> for you.
            </p>
            <p>
              <strong>3. Streaming Flow:</strong>
            </p>
            <ul className="list-disc ml-6 space-y-1 text-xs">
              <li>Click "Start Streaming" to open WebSocket connection</li>
              <li>Frontend sends title & description as JSON</li>
              <li>Backend streams response chunks incrementally</li>
              <li>Chunks display in real-time (like ChatGPT)</li>
              <li>Final chunk contains {'{status: "complete"}'}</li>
            </ul>
            <p className="text-xs text-gray-600 mt-3 p-2 bg-gray-100 rounded">
              💡 <strong>Debugging:</strong> Open DevTools (F12) → Console tab to see connection logs with 🔌, ✅, ❌ emojis showing connection progress and any errors.
            </p>
            <p className="text-xs text-gray-600 mt-2 p-2 bg-gray-100 rounded">
              🔧 <strong>To change backend:</strong> Edit <code className="bg-white px-1 rounded">const API_BASE = "..."</code> in the component.
            </p>
          </CardContent>
        </Card>

        <Card className="mt-6 border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-base">WebSocket Quick Checklist</CardTitle>
            <CardDescription>Follow these steps when troubleshooting connection issues (top = most common fix)</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-gray-700 space-y-2">
            <ol className="list-decimal ml-6 space-y-1 text-xs">
              <li>Confirm the backend server is actively listening on port 8000 (watch its terminal logs).</li>
              <li>Ensure the WebSocket endpoint path is exactly <code className="bg-white px-1 rounded text-xs">/ws/proposals/</code> (match whatever your backend exposes).</li>
              <li>Prefer <code className="bg-white px-1 rounded text-xs">ws://127.0.0.1:8000/ws/proposals/</code> locally if <code>localhost</code> keeps failing.</li>
              <li>Match the protocol with the page: use <code>wss://</code> when the page is served over HTTPS.</li>
              <li>Verify port 8000 is free and not blocked by firewalls or other apps.</li>
              <li>If behind nginx or another proxy, forward Upgrade/Connection headers and set <code>proxy_http_version 1.1</code>.</li>
              <li>Check backend logs for handshake errors or application-level disconnects (CORS doesn&apos;t block raw WebSockets).</li>
              <li>Use a simple client (<code>wscat</code>, <code>websocat</code>, or Python) to confirm the server works outside the browser.</li>
            </ol>
          </CardContent>
        </Card> */}
      </div>
    </div>
  )
}
