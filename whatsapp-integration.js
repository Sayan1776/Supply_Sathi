// WhatsApp Integration for SupplySathi
class WhatsAppIntegration {
  constructor() {
    this.apiUrl = "https://api.whatsapp.com/send"
    this.businessNumber = "+919876543210" // Replace with actual business number
    this.init()
  }

  init() {
    this.createWhatsAppWidget()
    this.setupEventListeners()
  }

  createWhatsAppWidget() {
    // Create floating WhatsApp button
    const whatsappWidget = document.createElement("div")
    whatsappWidget.id = "whatsapp-widget"
    whatsappWidget.className = "whatsapp-widget"
    whatsappWidget.innerHTML = `
            <div class="whatsapp-button" onclick="whatsappIntegration.toggleChat()">
                <i class="fab fa-whatsapp"></i>
                <span class="whatsapp-notification" id="whatsapp-notification">1</span>
            </div>
            <div class="whatsapp-chat" id="whatsapp-chat">
                <div class="chat-header">
                    <div class="chat-header-info">
                        <img src="/placeholder.svg?height=40&width=40" alt="SupplySathi" class="chat-avatar">
                        <div class="chat-title">
                            <h4>SupplySathi Support</h4>
                            <span class="chat-status">Online</span>
                        </div>
                    </div>
                    <button class="chat-close" onclick="whatsappIntegration.closeChat()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="chat-messages" id="chat-messages">
                    <div class="message received">
                        <div class="message-content">
                            <p>Hello! 👋 Welcome to SupplySathi. How can I help you today?</p>
                            <span class="message-time">${this.getCurrentTime()}</span>
                        </div>
                    </div>
                </div>
                <div class="chat-quick-replies">
                    <button class="quick-reply" onclick="whatsappIntegration.sendQuickReply('I need help with my order')">
                        📦 Order Help
                    </button>
                    <button class="quick-reply" onclick="whatsappIntegration.sendQuickReply('I want to become a supplier')">
                        🚛 Become Supplier
                    </button>
                    <button class="quick-reply" onclick="whatsappIntegration.sendQuickReply('Payment issues')">
                        💳 Payment Help
                    </button>
                </div>
                <div class="chat-input">
                    <input type="text" id="chat-input" placeholder="Type a message..." onkeypress="whatsappIntegration.handleKeyPress(event)">
                    <button class="send-button" onclick="whatsappIntegration.sendMessage()">
                        <i class="fas fa-paper-plane"></i>
                    </button>
                </div>
                <div class="chat-footer">
                    <button class="whatsapp-redirect" onclick="whatsappIntegration.openWhatsApp()">
                        <i class="fab fa-whatsapp"></i>
                        Continue on WhatsApp
                    </button>
                </div>
            </div>
        `

    document.body.appendChild(whatsappWidget)
  }

  setupEventListeners() {
    // Auto-show widget after 30 seconds
    setTimeout(() => {
      this.showNotification()
    }, 30000)

    // Track user interactions
    document.addEventListener("click", (e) => {
      if (e.target.closest(".whatsapp-widget")) {
        this.trackEvent("whatsapp_widget_interaction")
      }
    })
  }

  toggleChat() {
    const chatElement = document.getElementById("whatsapp-chat")
    const isVisible = chatElement.style.display === "block"

    if (isVisible) {
      this.closeChat()
    } else {
      this.openChat()
    }
  }

  openChat() {
    const chatElement = document.getElementById("whatsapp-chat")
    const notification = document.getElementById("whatsapp-notification")

    chatElement.style.display = "block"
    chatElement.classList.add("chat-open")
    notification.style.display = "none"

    this.trackEvent("whatsapp_chat_opened")
  }

  closeChat() {
    const chatElement = document.getElementById("whatsapp-chat")
    chatElement.style.display = "none"
    chatElement.classList.remove("chat-open")

    this.trackEvent("whatsapp_chat_closed")
  }

  sendMessage() {
    const input = document.getElementById("chat-input")
    const message = input.value.trim()

    if (!message) return

    this.addMessage(message, "sent")
    input.value = ""

    // Simulate bot response
    setTimeout(() => {
      this.handleBotResponse(message)
    }, 1000)

    this.trackEvent("whatsapp_message_sent", { message_length: message.length })
  }

  sendQuickReply(message) {
    this.addMessage(message, "sent")

    setTimeout(() => {
      this.handleBotResponse(message)
    }, 1000)

    this.trackEvent("whatsapp_quick_reply_used", { reply: message })
  }

  addMessage(content, type) {
    const messagesContainer = document.getElementById("chat-messages")
    const messageDiv = document.createElement("div")
    messageDiv.className = `message ${type}`

    messageDiv.innerHTML = `
            <div class="message-content">
                <p>${content}</p>
                <span class="message-time">${this.getCurrentTime()}</span>
            </div>
        `

    messagesContainer.appendChild(messageDiv)
    messagesContainer.scrollTop = messagesContainer.scrollHeight
  }

  handleBotResponse(userMessage) {
    let response = ""

    if (userMessage.toLowerCase().includes("order")) {
      response = "I can help you with your order! Please share your order ID or describe the issue you're facing. 📦"
    } else if (userMessage.toLowerCase().includes("supplier")) {
      response =
        "Great! To become a supplier, you need to register on our platform. Would you like me to guide you through the process? 🚛"
    } else if (userMessage.toLowerCase().includes("payment")) {
      response =
        "I understand you're having payment issues. Can you tell me more about the specific problem you're experiencing? 💳"
    } else if (userMessage.toLowerCase().includes("hello") || userMessage.toLowerCase().includes("hi")) {
      response =
        "Hello! How can I assist you today? Feel free to ask about orders, becoming a supplier, or any other questions! 😊"
    } else {
      response =
        'Thank you for your message! Our support team will get back to you shortly. For immediate assistance, please click "Continue on WhatsApp" below. 🙏'
    }

    this.addMessage(response, "received")
  }

  handleKeyPress(event) {
    if (event.key === "Enter") {
      this.sendMessage()
    }
  }

  openWhatsApp() {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"))
    let message = "Hello! I need help with SupplySathi."

    if (currentUser) {
      message = `Hello! I'm ${currentUser.name} and I need help with my SupplySathi account.`
    }

    const whatsappUrl = `${this.apiUrl}?phone=${this.businessNumber}&text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, "_blank")

    this.trackEvent("whatsapp_redirect_clicked")
  }

  showNotification() {
    const notification = document.getElementById("whatsapp-notification")
    if (notification) {
      notification.style.display = "block"

      // Auto-hide after 10 seconds
      setTimeout(() => {
        notification.style.display = "none"
      }, 10000)
    }
  }

  getCurrentTime() {
    return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  trackEvent(eventName, properties = {}) {
    if (window.SupplySathi && window.SupplySathi.trackEvent) {
      window.SupplySathi.trackEvent(eventName, properties)
    }
  }

  // Vendor-Supplier Communication
  initVendorSupplierChat(vendorId, supplierId) {
    const chatId = `${vendorId}_${supplierId}`
    const existingChats = JSON.parse(localStorage.getItem("vendorSupplierChats")) || {}

    if (!existingChats[chatId]) {
      existingChats[chatId] = {
        id: chatId,
        vendorId: vendorId,
        supplierId: supplierId,
        messages: [],
        created: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
      }
      localStorage.setItem("vendorSupplierChats", JSON.stringify(existingChats))
    }

    return chatId
  }

  sendVendorSupplierMessage(chatId, senderId, message) {
    const chats = JSON.parse(localStorage.getItem("vendorSupplierChats")) || {}

    if (chats[chatId]) {
      const newMessage = {
        id: Date.now(),
        senderId: senderId,
        message: message,
        timestamp: new Date().toISOString(),
        read: false,
      }

      chats[chatId].messages.push(newMessage)
      chats[chatId].lastActivity = new Date().toISOString()

      localStorage.setItem("vendorSupplierChats", JSON.stringify(chats))

      // Send WhatsApp notification
      this.sendWhatsAppNotification(chatId, senderId, message)
    }
  }

  sendWhatsAppNotification(chatId, senderId, message) {
    const chats = JSON.parse(localStorage.getItem("vendorSupplierChats")) || {}
    const chat = chats[chatId]

    if (chat) {
      const currentUser = JSON.parse(localStorage.getItem("currentUser"))
      const isVendor = currentUser.userType === "vendor"
      const recipientType = isVendor ? "supplier" : "vendor"

      // In a real implementation, this would send an actual WhatsApp message
      console.log(`WhatsApp notification sent to ${recipientType}:`, message)

      this.trackEvent("vendor_supplier_message_sent", {
        chat_id: chatId,
        sender_type: currentUser.userType,
        message_length: message.length,
      })
    }
  }

  getVendorSupplierChats(userId) {
    const chats = JSON.parse(localStorage.getItem("vendorSupplierChats")) || {}
    const userChats = Object.values(chats).filter((chat) => chat.vendorId === userId || chat.supplierId === userId)

    return userChats.sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity))
  }

  markMessagesAsRead(chatId, userId) {
    const chats = JSON.parse(localStorage.getItem("vendorSupplierChats")) || {}

    if (chats[chatId]) {
      chats[chatId].messages.forEach((message) => {
        if (message.senderId !== userId) {
          message.read = true
        }
      })

      localStorage.setItem("vendorSupplierChats", JSON.stringify(chats))
    }
  }

  getUnreadMessageCount(userId) {
    const chats = this.getVendorSupplierChats(userId)
    let unreadCount = 0

    chats.forEach((chat) => {
      chat.messages.forEach((message) => {
        if (message.senderId !== userId && !message.read) {
          unreadCount++
        }
      })
    })

    return unreadCount
  }
}

// Initialize WhatsApp integration
const whatsappIntegration = new WhatsAppIntegration()

// Export for use in other files
window.WhatsAppIntegration = WhatsAppIntegration
