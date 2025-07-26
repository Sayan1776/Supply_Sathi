// Payment Gateway Integration
let currentOrder = null
let selectedPaymentMethod = null

document.addEventListener("DOMContentLoaded", () => {
  initializePayment()
  setupEventListeners()
})

function initializePayment() {
  // Get order details from URL parameters or localStorage
  const urlParams = new URLSearchParams(window.location.search)
  const orderId = urlParams.get("orderId")

  if (orderId) {
    currentOrder = getOrderById(orderId)
  } else {
    // Get from localStorage (for demo)
    currentOrder = JSON.parse(localStorage.getItem("currentOrder")) || generateDemoOrder()
  }

  displayOrderSummary()
}

function setupEventListeners() {
  // Payment method selection
  const paymentOptions = document.querySelectorAll('input[name="paymentMethod"]')
  paymentOptions.forEach((option) => {
    option.addEventListener("change", handlePaymentMethodChange)
  })

  // Card number formatting
  const cardNumberInput = document.getElementById("cardNumber")
  if (cardNumberInput) {
    cardNumberInput.addEventListener("input", formatCardNumber)
  }

  // Expiry date formatting
  const expiryInput = document.getElementById("expiryDate")
  if (expiryInput) {
    expiryInput.addEventListener("input", formatExpiryDate)
  }

  // CVV validation
  const cvvInput = document.getElementById("cvv")
  if (cvvInput) {
    cvvInput.addEventListener("input", validateCVV)
  }
}

function generateDemoOrder() {
  return {
    id: Date.now(),
    items: [
      {
        name: "Fresh Red Onions",
        quantity: 10,
        unit: "kg",
        price: 25,
        total: 250,
      },
      {
        name: "Ripe Tomatoes",
        quantity: 5,
        unit: "kg",
        price: 30,
        total: 150,
      },
    ],
    subtotal: 400,
    deliveryCharges: 50,
    gst: 36,
    total: 486,
    vendor: "Demo Vendor",
    supplier: "Fresh Vegetables Co.",
    deliveryAddress: "123 Street, Kolkata",
  }
}

function displayOrderSummary() {
  const orderSummaryDetails = document.getElementById("orderSummaryDetails")

  orderSummaryDetails.innerHTML = `
        <div class="order-header">
            <h3>Order #${currentOrder.id}</h3>
            <span class="order-date">${new Date().toLocaleDateString()}</span>
        </div>
        
        <div class="order-items">
            ${currentOrder.items
              .map(
                (item) => `
                <div class="order-item">
                    <div class="item-details">
                        <h4>${item.name}</h4>
                        <p>${item.quantity} ${item.unit} × ₹${item.price}</p>
                    </div>
                    <div class="item-total">₹${item.total}</div>
                </div>
            `,
              )
              .join("")}
        </div>
        
        <div class="order-calculations">
            <div class="calc-row">
                <span>Subtotal:</span>
                <span>₹${currentOrder.subtotal}</span>
            </div>
            <div class="calc-row">
                <span>Delivery Charges:</span>
                <span>₹${currentOrder.deliveryCharges}</span>
            </div>
            <div class="calc-row">
                <span>GST (9%):</span>
                <span>₹${currentOrder.gst}</span>
            </div>
            <div class="calc-row total">
                <span>Total Amount:</span>
                <span>₹${currentOrder.total}</span>
            </div>
        </div>
        
        <div class="delivery-info">
            <h4><i class="fas fa-map-marker-alt"></i> Delivery Address</h4>
            <p>${currentOrder.deliveryAddress}</p>
        </div>
    `
}

function handlePaymentMethodChange(e) {
  selectedPaymentMethod = e.target.value

  // Hide all payment option contents
  document.querySelectorAll(".payment-option-content").forEach((content) => {
    content.style.display = "none"
  })

  // Show selected payment option content
  const selectedOption = document.querySelector(`[data-method="${selectedPaymentMethod}"]`)
  const content = selectedOption.querySelector(".payment-option-content")
  if (content) {
    content.style.display = "block"
  }

  // Update total if COD is selected
  updateTotal()
}

function updateTotal() {
  let total = currentOrder.total
  if (selectedPaymentMethod === "cod") {
    total += 20 // COD handling fee
  }

  document.querySelector(".calc-row.total span:last-child").textContent = `₹${total}`
}

function formatCardNumber(e) {
  const value = e.target.value.replace(/\s/g, "").replace(/[^0-9]/gi, "")
  const formattedValue = value.match(/.{1,4}/g)?.join(" ") || value
  e.target.value = formattedValue
}

function formatExpiryDate(e) {
  let value = e.target.value.replace(/\D/g, "")
  if (value.length >= 2) {
    value = value.substring(0, 2) + "/" + value.substring(2, 4)
  }
  e.target.value = value
}

function validateCVV(e) {
  e.target.value = e.target.value.replace(/[^0-9]/g, "")
}

function processPayment() {
  if (!selectedPaymentMethod) {
    showNotification("Please select a payment method", "error")
    return
  }

  if (!validatePaymentDetails()) {
    return
  }

  const paymentBtn = document.querySelector(".payment-btn")
  const btnText = paymentBtn.querySelector("span")
  const btnLoader = paymentBtn.querySelector(".btn-loader")

  // Show loading state
  paymentBtn.disabled = true
  btnText.style.display = "none"
  btnLoader.style.display = "block"

  // Process payment based on method
  switch (selectedPaymentMethod) {
    case "upi":
      processUPIPayment()
      break
    case "card":
      processCardPayment()
      break
    case "netbanking":
      processNetBankingPayment()
      break
    case "wallet":
      processWalletPayment()
      break
    case "cod":
      processCODPayment()
      break
    default:
      showNotification("Invalid payment method", "error")
      resetPaymentButton()
  }
}

function validatePaymentDetails() {
  switch (selectedPaymentMethod) {
    case "upi":
      const upiId = document.getElementById("upiId").value
      if (!upiId || !upiId.includes("@")) {
        showNotification("Please enter a valid UPI ID", "error")
        return false
      }
      break

    case "card":
      const cardNumber = document.getElementById("cardNumber").value.replace(/\s/g, "")
      const cardName = document.getElementById("cardName").value
      const expiryDate = document.getElementById("expiryDate").value
      const cvv = document.getElementById("cvv").value

      if (!cardNumber || cardNumber.length < 13) {
        showNotification("Please enter a valid card number", "error")
        return false
      }
      if (!cardName.trim()) {
        showNotification("Please enter cardholder name", "error")
        return false
      }
      if (!expiryDate || expiryDate.length !== 5) {
        showNotification("Please enter valid expiry date", "error")
        return false
      }
      if (!cvv || cvv.length < 3) {
        showNotification("Please enter valid CVV", "error")
        return false
      }
      break

    case "netbanking":
      const bank = document.getElementById("bankSelect").value
      if (!bank) {
        showNotification("Please select a bank", "error")
        return false
      }
      break

    case "wallet":
      const wallet = document.getElementById("walletSelect").value
      if (!wallet) {
        showNotification("Please select a wallet", "error")
        return false
      }
      break
  }

  return true
}

function processUPIPayment() {
  // Simulate UPI payment processing
  setTimeout(() => {
    const success = Math.random() > 0.1 // 90% success rate
    if (success) {
      showPaymentSuccess({
        method: "UPI",
        transactionId: "UPI" + Date.now(),
        amount: currentOrder.total,
      })
    } else {
      showPaymentFailure("UPI payment failed. Please try again.")
    }
  }, 3000)
}

function processCardPayment() {
  // Integrate with Razorpay for card payments
  const options = {
    key: "rzp_test_1234567890", // Replace with your Razorpay key
    amount: currentOrder.total * 100, // Amount in paise
    currency: "INR",
    name: "SupplySathi",
    description: `Order #${currentOrder.id}`,
    image: "/placeholder.svg?height=60&width=60",
    order_id: "order_" + currentOrder.id,
    handler: (response) => {
      showPaymentSuccess({
        method: "Card",
        transactionId: response.razorpay_payment_id,
        amount: currentOrder.total,
      })
    },
    prefill: {
      name: document.getElementById("cardName").value,
      email: "customer@example.com",
      contact: "9999999999",
    },
    theme: {
      color: "#e67e22",
    },
    modal: {
      ondismiss: () => {
        resetPaymentButton()
      },
    },
  }

  const rzp = window.Razorpay(options)
  rzp.open()
}

function processNetBankingPayment() {
  // Simulate net banking payment
  setTimeout(() => {
    const success = Math.random() > 0.15 // 85% success rate
    if (success) {
      showPaymentSuccess({
        method: "Net Banking",
        transactionId: "NB" + Date.now(),
        amount: currentOrder.total,
      })
    } else {
      showPaymentFailure("Net banking payment failed. Please try again.")
    }
  }, 4000)
}

function processWalletPayment() {
  // Simulate wallet payment
  setTimeout(() => {
    const success = Math.random() > 0.05 // 95% success rate
    if (success) {
      showPaymentSuccess({
        method: "Digital Wallet",
        transactionId: "WLT" + Date.now(),
        amount: currentOrder.total,
      })
    } else {
      showPaymentFailure("Wallet payment failed. Please try again.")
    }
  }, 2000)
}

function processCODPayment() {
  // COD doesn't require payment processing
  setTimeout(() => {
    showPaymentSuccess({
      method: "Cash on Delivery",
      transactionId: "COD" + Date.now(),
      amount: currentOrder.total + 20, // Including COD fee
    })
  }, 1000)
}

function showPaymentSuccess(paymentDetails) {
  resetPaymentButton()

  // Store payment details
  const transaction = {
    ...paymentDetails,
    orderId: currentOrder.id,
    timestamp: new Date().toISOString(),
    status: "Success",
  }

  // Save to localStorage
  const transactions = JSON.parse(localStorage.getItem("transactions")) || []
  transactions.push(transaction)
  localStorage.setItem("transactions", JSON.stringify(transactions))

  // Update order status
  updateOrderStatus(currentOrder.id, "Paid")

  // Show success modal
  displayTransactionDetails(transaction)
  document.getElementById("paymentSuccessModal").style.display = "block"

  // Track payment success
  trackEvent("payment_success", {
    method: paymentDetails.method,
    amount: paymentDetails.amount,
    order_id: currentOrder.id,
  })
}

function showPaymentFailure(message) {
  resetPaymentButton()
  showNotification(message, "error")

  // Track payment failure
  trackEvent("payment_failure", {
    method: selectedPaymentMethod,
    amount: currentOrder.total,
    order_id: currentOrder.id,
  })
}

function displayTransactionDetails(transaction) {
  const transactionDetails = document.getElementById("transactionDetails")
  transactionDetails.innerHTML = `
        <div class="transaction-info">
            <div class="transaction-row">
                <span>Transaction ID:</span>
                <span class="transaction-id">${transaction.transactionId}</span>
            </div>
            <div class="transaction-row">
                <span>Payment Method:</span>
                <span>${transaction.method}</span>
            </div>
            <div class="transaction-row">
                <span>Amount Paid:</span>
                <span class="amount">₹${transaction.amount}</span>
            </div>
            <div class="transaction-row">
                <span>Date & Time:</span>
                <span>${new Date(transaction.timestamp).toLocaleString()}</span>
            </div>
        </div>
    `
}

function resetPaymentButton() {
  const paymentBtn = document.querySelector(".payment-btn")
  const btnText = paymentBtn.querySelector("span")
  const btnLoader = paymentBtn.querySelector(".btn-loader")

  paymentBtn.disabled = false
  btnText.style.display = "inline"
  btnLoader.style.display = "none"
}

function downloadReceipt() {
  // Generate and download receipt
  const receiptContent = generateReceiptHTML()
  const blob = new Blob([receiptContent], { type: "text/html" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `receipt_${currentOrder.id}.html`
  a.click()
  URL.revokeObjectURL(url)
}

function generateReceiptHTML() {
  return `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Payment Receipt - SupplySathi</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { text-align: center; margin-bottom: 30px; }
                .receipt-details { margin: 20px 0; }
                .receipt-row { display: flex; justify-content: space-between; margin: 10px 0; }
                .total { font-weight: bold; border-top: 1px solid #ccc; padding-top: 10px; }
            </style>
        </head>
        <body>
            <div class="header">
                <h1>SupplySathi</h1>
                <h2>Payment Receipt</h2>
            </div>
            <div class="receipt-details">
                <div class="receipt-row">
                    <span>Order ID:</span>
                    <span>${currentOrder.id}</span>
                </div>
                <div class="receipt-row">
                    <span>Date:</span>
                    <span>${new Date().toLocaleDateString()}</span>
                </div>
                <div class="receipt-row total">
                    <span>Total Amount:</span>
                    <span>₹${currentOrder.total}</span>
                </div>
            </div>
        </body>
        </html>
    `
}

function goToDashboard() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"))
  if (currentUser) {
    if (currentUser.userType === "vendor") {
      window.location.href = "vendor-dashboard.html"
    } else {
      window.location.href = "supplier-dashboard.html"
    }
  } else {
    window.location.href = "index.html"
  }
}

function goBack() {
  window.history.back()
}

function updateOrderStatus(orderId, status) {
  const orders = JSON.parse(localStorage.getItem("orders")) || []
  const orderIndex = orders.findIndex((order) => order.id == orderId)
  if (orderIndex !== -1) {
    orders[orderIndex].status = status
    orders[orderIndex].paymentStatus = "Paid"
    localStorage.setItem("orders", JSON.stringify(orders))
  }
}

function getOrderById(orderId) {
  const orders = JSON.parse(localStorage.getItem("orders")) || []
  return orders.find((order) => order.id == orderId)
}

// Utility functions
function showNotification(message, type) {
  // Use the existing notification system
  if (window.SupplySathi && window.SupplySathi.showNotification) {
    window.SupplySathi.showNotification(message, type)
  } else {
    alert(message)
  }
}

function trackEvent(eventName, properties) {
  // Use the existing analytics system
  if (window.SupplySathi && window.SupplySathi.trackEvent) {
    window.SupplySathi.trackEvent(eventName, properties)
  }
}
