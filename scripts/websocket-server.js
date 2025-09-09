const WebSocket = require("ws")
const http = require("http")

// Create HTTP server
const server = http.createServer()
const wss = new WebSocket.Server({ server })

// Store connected clients and chat data
const clients = new Map()
const users = new Map()
const messages = []

console.log("🚀 Starting WebSocket chat server...")

wss.on("connection", (ws, req) => {
  const clientId = Math.random().toString(36).substr(2, 9)
  clients.set(clientId, ws)

  console.log(`📱 Client ${clientId} connected from ${req.socket.remoteAddress}`)

  // Send existing messages and users to new client
  ws.send(
    JSON.stringify({
      type: "MESSAGES_HISTORY",
      data: messages,
    }),
  )

  ws.send(
    JSON.stringify({
      type: "USERS_LIST",
      data: Array.from(users.values()),
    }),
  )

  ws.on("message", (data) => {
    try {
      const message = JSON.parse(data.toString())
      console.log(`📨 Received from ${clientId}:`, message.type)

      switch (message.type) {
        case "USER_JOINED":
          users.set(message.data.id, { ...message.data, isOnline: true })
          broadcast(message, clientId)
          console.log(`👋 User ${message.data.name} joined`)
          break

        case "USER_LEFT":
          if (users.has(message.data.id)) {
            users.set(message.data.id, { ...users.get(message.data.id), isOnline: false })
            broadcast(message, clientId)
            console.log(`👋 User ${message.data.name} left`)
          }
          break

        case "USER_UPDATED":
          users.set(message.data.id, message.data)
          broadcast(message, clientId)
          console.log(`✏️ User ${message.data.name} updated profile`)
          break

        case "NEW_MESSAGE":
          messages.push(message.data)
          // Keep only last 100 messages
          if (messages.length > 100) {
            messages.shift()
          }
          broadcast(message, clientId)
          console.log(`💬 New message from ${message.data.sender}`)
          break
      }
    } catch (error) {
      console.error("❌ Error processing message:", error)
    }
  })

  ws.on("close", () => {
    clients.delete(clientId)
    console.log(`📱 Client ${clientId} disconnected`)
  })

  ws.on("error", (error) => {
    console.error(`❌ WebSocket error for client ${clientId}:`, error)
  })
})

// Broadcast message to all connected clients except sender
function broadcast(message, senderClientId) {
  const messageStr = JSON.stringify(message)

  clients.forEach((client, clientId) => {
    if (client.readyState === WebSocket.OPEN && clientId !== senderClientId) {
      client.send(messageStr)
    }
  })
}

// Start server
const PORT = process.env.PORT || 8080
server.listen(PORT, () => {
  console.log(`🌐 WebSocket server running on ws://localhost:${PORT}`)
  console.log("📋 Instructions:")
  console.log("   1. Keep this server running")
  console.log("   2. Open the chat app in your browser")
  console.log("   3. Share this server address with friends: ws://YOUR_IP:8080")
  console.log("   4. Friends can connect from different devices!")
  console.log("")
  console.log("💡 To allow external connections:")
  console.log("   - Make sure port 8080 is open in your firewall")
  console.log("   - Share your local IP address with friends")
  console.log("   - Or deploy this server to a cloud service")
})

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\n🛑 Shutting down WebSocket server...")
  wss.close(() => {
    server.close(() => {
      console.log("✅ Server closed gracefully")
      process.exit(0)
    })
  })
})
