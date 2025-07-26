// Vendor Dashboard JavaScript
let currentUser = null
let suppliers = []
let products = []
let orders = []
let selectedProduct = null

// Declare trackEvent function
function trackEvent(eventName, eventData) {
  // Placeholder for analytics tracking logic
  console.log(`Event: ${eventName}`, eventData)
}

document.addEventListener("DOMContentLoaded", () => {
  initializeVendorDashboard()
})

function initializeVendorDashboard() {
  // Check authentication
  const savedUser = localStorage.getItem("currentUser")
  if (!savedUser) {
    window.location.href = "index.html"
    return
  }

  currentUser = JSON.parse(savedUser)

  // Check if user is vendor
  if (currentUser.userType !== "vendor") {
    window.location.href = "index.html"
    return
  }

  // Update welcome message
  document.getElementById("welcomeMessage").textContent = `Welcome, ${currentUser.name}!`

  // Load data
  loadData()
  setupEventListeners()
  renderSuppliers()
  renderProducts()
  renderRecentOrders()
}

function loadData() {
  // Load from localStorage or use mock data
  suppliers = JSON.parse(localStorage.getItem("suppliers")) || []
  products = JSON.parse(localStorage.getItem("products")) || []
  orders = JSON.parse(localStorage.getItem("orders")) || []

  // Generate mock orders if none exist
  if (orders.length === 0) {
    generateMockOrders()
  }
}

function generateMockOrders() {
  orders = [
    {
      id: 1,
      productName: "Fresh Red Onions",
      supplier: "Fresh Vegetables Co.",
      vendorName: currentUser.name,
      quantity: 10,
      unit: "kg",
      price: 25,
      total: 300, // Including delivery charges
      status: "Delivered",
      date: "2024-01-20",
      deliveryDate: "2024-01-21",
      rating: 5,
      notes: "Good quality onions",
    },
    {
      id: 2,
      productName: "Pure Turmeric Powder",
      supplier: "Spice Masters",
      vendorName: currentUser.name,
      quantity: 2,
      unit: "kg",
      price: 120,
      total: 290, // Including delivery charges
      status: "In Transit",
      date: "2024-01-22",
      deliveryDate: "2024-01-23",
      rating: null,
      notes: "Urgent delivery needed",
    },
    {
      id: 3,
      productName: "Refined Cooking Oil",
      supplier: "Oil & Grains Hub",
      vendorName: currentUser.name,
      quantity: 5,
      unit: "liter",
      price: 150,
      total: 800, // Including delivery charges
      status: "Processing",
      date: "2024-01-23",
      deliveryDate: "2024-01-25",
      rating: null,
      notes: "Please deliver in the morning",
    },
  ]

  localStorage.setItem("orders", JSON.stringify(orders))
}

function setupEventListeners() {
  // Order form submission
  document.getElementById("orderForm").addEventListener("submit", handleOrderSubmission)

  // Quantity change for price calculation
  document.getElementById("quantity").addEventListener("input", calculateOrderTotal)
  
  // Profile form submission (if it exists)
  const updateProfileForm = document.getElementById("updateProfileForm")
  if (updateProfileForm) {
    updateProfileForm.addEventListener("submit", updateProfile)
  }
}

function renderSuppliers() {
  const suppliersList = document.getElementById("suppliersList")

  if (!suppliersList) {
    console.error("Suppliers list element not found")
    return
  }

  if (suppliers.length === 0) {
    suppliersList.innerHTML = `
      <div class="loading">
        <i class="fas fa-spinner"></i>
        <span>Loading suppliers...</span>
      </div>
    `
    return
  }

  suppliersList.innerHTML = suppliers
    .map(
      (supplier) => `
        <div class="supplier-card" onclick="showSupplierDetails(${supplier.id})">
            <div class="supplier-header">
                <h3>
                  <i class="fas fa-store"></i> ${supplier.name}
                </h3>
                ${supplier.verified ? '<span class="verified-badge"><i class="fas fa-shield-alt"></i> Verified</span>' : ""}
            </div>
            <div class="supplier-info">
                <p><i class="fas fa-map-marker-alt"></i> ${supplier.location}</p>
                <p><i class="fas fa-phone"></i> ${supplier.contact}</p>
                <p><i class="fas fa-clock"></i> Delivery: ${supplier.deliveryTime || "2-4 hours"}</p>
                <div class="rating">
                    <i class="fas fa-star"></i>
                    <span>${supplier.rating}/5.0</span>
                    <span style="color: #7f8c8d; margin-left: 10px;">Since ${supplier.established || "2020"}</span>
                </div>
            </div>
            <div class="supplier-products">
                <p><strong>Products:</strong> ${supplier.products.slice(0, 3).join(", ")}${supplier.products.length > 3 ? ` +${supplier.products.length - 3} more` : ""}</p>
            </div>
        </div>
    `,
    )
    .join("")
}

function renderProducts() {
  const productsList = document.getElementById("productsList")

  if (!productsList) {
    console.error("Products list element not found")
    return
  }

  if (products.length === 0) {
    productsList.innerHTML = `
      <div class="loading">
        <i class="fas fa-spinner"></i>
        <span>Loading products...</span>
      </div>
    `
    return
  }

  productsList.innerHTML = products
    .map(
      (product) => `
        <div class="product-card">
            <img src="${product.image}" alt="${product.name}" onerror="this.src='/placeholder.svg?height=150&width=150'">
            <div class="product-info">
                <h4>${product.name}</h4>
                <p class="supplier-name">
                  <i class="fas fa-store"></i> ${product.supplier}
                </p>
                <div class="product-price">
                    <span class="price">₹${product.price}/${product.unit}</span>
                    <span class="stock ${product.stock < 10 ? "low-stock" : ""}">
                        <i class="fas fa-boxes"></i> ${product.stock} ${product.unit}
                    </span>
                </div>
                <p class="product-description">${product.description || "High quality product"}</p>
                <button class="btn-primary btn-small" onclick="showOrderModal(${product.id})" ${product.stock === 0 ? "disabled" : ""}>
                    <i class="fas fa-shopping-cart"></i> 
                    ${product.stock === 0 ? "Out of Stock" : "Order Now"}
                </button>
            </div>
        </div>
    `,
    )
    .join("")
}

function renderRecentOrders() {
  const recentOrders = document.getElementById("recentOrders")

  if (orders.length === 0) {
    recentOrders.innerHTML = "<p>No recent orders.</p>"
    return
  }

  const recentOrdersList = orders.slice(0, 5) // Show last 5 orders

  recentOrders.innerHTML = recentOrdersList
    .map(
      (order) => `
        <div class="order-card">
            <div class="order-header">
                <h4>${order.productName}</h4>
                <span class="order-status status-${order.status.toLowerCase().replace(" ", "-")}">${order.status}</span>
            </div>
            <div class="order-details">
                <p><strong>Supplier:</strong> ${order.supplier}</p>
                <p><strong>Quantity:</strong> ${order.quantity} ${order.unit}</p>
                <p><strong>Total:</strong> ₹${order.total}</p>
                <p><strong>Date:</strong> ${new Date(order.date).toLocaleDateString()}</p>
            </div>
            ${
              order.status === "Delivered" && !order.rating
                ? `<button class="btn-secondary btn-small" onclick="rateOrder(${order.id})">
                    <i class="fas fa-star"></i> Rate Order
                </button>`
                : ""
            }
        </div>
    `,
    )
    .join("")
}

function filterProducts() {
  const searchTerm = document.getElementById("productSearch").value.toLowerCase()
  const filteredProducts = products.filter(
    (product) => product.name.toLowerCase().includes(searchTerm) || product.supplier.toLowerCase().includes(searchTerm),
  )

  const productsList = document.getElementById("productsList")
  productsList.innerHTML = filteredProducts
    .map(
      (product) => `
        <div class="product-card">
            <img src="${product.image}" alt="${product.name}">
            <div class="product-info">
                <h4>${product.name}</h4>
                <p class="supplier-name">${product.supplier}</p>
                <div class="product-price">
                    <span class="price">₹${product.price}/${product.unit}</span>
                    <span class="stock">Stock: ${product.stock} ${product.unit}</span>
                </div>
                <button class="btn-primary btn-small" onclick="showOrderModal(${product.id})">
                    <i class="fas fa-shopping-cart"></i> Order Now
                </button>
            </div>
        </div>
    `,
    )
    .join("")
}

function showOrderModal(productId) {
  selectedProduct = products.find((p) => p.id === productId)
  if (!selectedProduct) {
    showNotification("Product not found", "error")
    return
  }

  if (selectedProduct.stock === 0) {
    showNotification("This product is out of stock", "error")
    return
  }

  const orderDetails = document.getElementById("orderDetails")
  orderDetails.innerHTML = `
        <div class="order-product-info">
            <img src="${selectedProduct.image}" alt="${selectedProduct.name}" onerror="this.src='/placeholder.svg?height=100&width=100'">
            <div>
                <h3>${selectedProduct.name}</h3>
                <p><i class="fas fa-store"></i> <strong>Supplier:</strong> ${selectedProduct.supplier}</p>
                <p><i class="fas fa-tag"></i> <strong>Price:</strong> ₹${selectedProduct.price}/${selectedProduct.unit}</p>
                <p><i class="fas fa-boxes"></i> <strong>Available Stock:</strong> ${selectedProduct.stock} ${selectedProduct.unit}</p>
                <p><i class="fas fa-info-circle"></i> <strong>Description:</strong> ${selectedProduct.description || "High quality product"}</p>
                ${selectedProduct.origin ? `<p><i class="fas fa-map-marker-alt"></i> <strong>Origin:</strong> ${selectedProduct.origin}</p>` : ""}
                <div class="supplier-contact">
                    <button class="btn-secondary btn-small" onclick="contactSupplierWhatsApp('${selectedProduct.supplier}', '${selectedProduct.supplier}')">
                        <i class="fab fa-whatsapp"></i> Contact via WhatsApp
                    </button>
                </div>
            </div>
        </div>
    `

  // Set max quantity and validation
  const quantityInput = document.getElementById("quantity")
  quantityInput.max = selectedProduct.stock
  quantityInput.value = 1
  quantityInput.min = 1

  // Set minimum delivery date (tomorrow)
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const deliveryDateInput = document.getElementById("deliveryDate")
  deliveryDateInput.min = tomorrow.toISOString().split("T")[0]
  deliveryDateInput.value = tomorrow.toISOString().split("T")[0]

  // Clear previous notes
  document.getElementById("notes").value = ""

  calculateOrderTotal()
  document.getElementById("orderModal").style.display = "block"
}

function calculateOrderTotal() {
  if (!selectedProduct) return

  const quantity = Number.parseInt(document.getElementById("quantity").value) || 0
  const subtotal = quantity * selectedProduct.price
  const deliveryCharges = subtotal > 500 ? 0 : 50 // Free delivery for orders above ₹500
  const total = subtotal + deliveryCharges

  document.getElementById("subtotal").textContent = `₹${subtotal}`
  document.getElementById("deliveryCharges").textContent = deliveryCharges === 0 ? "FREE" : `₹${deliveryCharges}`
  document.getElementById("totalAmount").textContent = `₹${total}`

  // Show free delivery message
  const deliveryChargesElement = document.getElementById("deliveryCharges")
  if (deliveryCharges === 0) {
    deliveryChargesElement.style.color = "#2ecc71"
    deliveryChargesElement.innerHTML = "FREE <small>(Order above ₹500)</small>"
  } else {
    deliveryChargesElement.style.color = "#e74c3c"
    deliveryChargesElement.innerHTML = `₹${deliveryCharges} <small>(Free above ₹500)</small>`
  }
}

function handleOrderSubmission(e) {
  e.preventDefault()

  if (!selectedProduct) {
    showNotification("No product selected", "error")
    return
  }

  const quantity = Number.parseInt(document.getElementById("quantity").value)
  const deliveryDate = document.getElementById("deliveryDate").value
  const notes = document.getElementById("notes").value

  // Validation
  if (quantity <= 0 || quantity > selectedProduct.stock) {
    showNotification(`Please enter a valid quantity (1-${selectedProduct.stock})`, "error")
    return
  }

  if (!deliveryDate) {
    showNotification("Please select a delivery date", "error")
    return
  }

  const selectedDate = new Date(deliveryDate)
  const today = new Date()
  if (selectedDate <= today) {
    showNotification("Delivery date must be in the future", "error")
    return
  }

  const subtotal = quantity * selectedProduct.price
  const deliveryCharges = subtotal > 500 ? 0 : 50
  const gst = Math.round(subtotal * 0.09) // 9% GST
  const total = subtotal + deliveryCharges + gst

  const newOrder = {
    id: Date.now(),
    productId: selectedProduct.id,
    productName: selectedProduct.name,
    supplier: selectedProduct.supplier,
    vendorName: currentUser.name,
    quantity: quantity,
    unit: selectedProduct.unit,
    price: selectedProduct.price,
    subtotal: subtotal,
    deliveryCharges: deliveryCharges,
    gst: gst,
    total: total,
    deliveryDate: deliveryDate,
    notes: notes,
    status: "Processing",
    paymentStatus: "Pending",
    date: new Date().toISOString().split("T")[0],
    rating: null,
    items: [
      {
        name: selectedProduct.name,
        quantity: quantity,
        unit: selectedProduct.unit,
        price: selectedProduct.price,
        total: subtotal,
      },
    ],
    deliveryAddress: currentUser.businessAddress || "Default Address",
  }

  orders.unshift(newOrder)
  localStorage.setItem("orders", JSON.stringify(orders))

  // Update product stock
  selectedProduct.stock -= quantity
  const allProducts = JSON.parse(localStorage.getItem("products")) || []
  const productIndex = allProducts.findIndex((p) => p.id === selectedProduct.id)
  if (productIndex !== -1) {
    allProducts[productIndex].stock = selectedProduct.stock
    localStorage.setItem("products", JSON.stringify(allProducts))
  }

  closeModal("orderModal")
  renderProducts()
  renderRecentOrders()
  updateDashboardStats()

  // Show payment option
  const paymentChoice = confirm("Order placed successfully! Would you like to proceed to payment now?")
  if (paymentChoice) {
    proceedToPayment(newOrder.id)
  } else {
    showNotification(`Order placed successfully! Order ID: #${newOrder.id}`, "success")
  }
}

function showSupplierDetails(supplierId) {
  const supplier = suppliers.find((s) => s.id === supplierId)
  if (!supplier) return

  const supplierDetails = document.getElementById("supplierDetails")
  supplierDetails.innerHTML = `
        <div class="supplier-detail-card">
            <div class="supplier-header">
                <h2>${supplier.name}</h2>
                ${supplier.verified ? '<span class="verified-badge"><i class="fas fa-shield-alt"></i> Verified Supplier</span>' : ""}
            </div>
            
            <div class="supplier-info-grid">
                <div class="info-item">
                    <i class="fas fa-map-marker-alt"></i>
                    <div>
                        <strong>Location</strong>
                        <p>${supplier.location}</p>
                    </div>
                </div>
                
                <div class="info-item">
                    <i class="fas fa-phone"></i>
                    <div>
                        <strong>Contact</strong>
                        <p>${supplier.contact}</p>
                    </div>
                </div>
                
                <div class="info-item">
                    <i class="fas fa-star"></i>
                    <div>
                        <strong>Rating</strong>
                        <p>${supplier.rating}/5.0</p>
                    </div>
                </div>
                
                <div class="info-item">
                    <i class="fas fa-certificate"></i>
                    <div>
                        <strong>FSSAI License</strong>
                        <p>${supplier.fssai}</p>
                    </div>
                </div>
            </div>
            
            <div class="supplier-products-section">
                <h3>Available Products</h3>
                <div class="products-tags">
                    ${supplier.products.map((product) => `<span class="product-tag">${product}</span>`).join("")}
                </div>
            </div>
            
            <div class="supplier-actions">
                <button class="btn-primary" onclick="contactSupplier('${supplier.contact}')">
                    <i class="fas fa-phone"></i> Contact Supplier
                </button>
                <button class="btn-secondary" onclick="viewSupplierProducts(${supplier.id})">
                    <i class="fas fa-boxes"></i> View Products
                </button>
            </div>
        </div>
    `

  document.getElementById("supplierModal").style.display = "block"
}

function contactSupplier(phone) {
  window.open(`tel:${phone}`, "_self")
}

function viewSupplierProducts(supplierId) {
  const supplier = suppliers.find((s) => s.id === supplierId)
  if (!supplier) return

  const supplierProducts = products.filter((p) => p.supplier === supplier.name)

  // Filter products and update display
  document.getElementById("productSearch").value = supplier.name
  filterProducts()

  closeModal("supplierModal")

  // Scroll to products section
  document.querySelector(".products-list").scrollIntoView({ behavior: "smooth" })
}

function updateDashboardStats() {
  const totalOrders = orders.length
  const totalSpent = orders.reduce((sum, order) => sum + order.total, 0)
  const activeSuppliers = [...new Set(orders.map((order) => order.supplier))].length
  const avgRating = orders.filter((o) => o.rating).reduce((sum, o, _, arr) => sum + o.rating / arr.length, 0) || 0

  document.getElementById("totalOrders").textContent = totalOrders
  document.getElementById("totalSpent").textContent = `₹${totalSpent.toLocaleString()}`
  document.getElementById("activeSuppliers").textContent = activeSuppliers
  document.getElementById("avgRating").textContent = avgRating.toFixed(1)
}

function rateOrder(orderId) {
  const rating = prompt("Rate this order (1-5 stars):")
  const ratingNum = Number.parseInt(rating)

  if (ratingNum >= 1 && ratingNum <= 5) {
    const order = orders.find((o) => o.id === orderId)
    if (order) {
      order.rating = ratingNum
      localStorage.setItem("orders", JSON.stringify(orders))
      renderRecentOrders()
      updateDashboardStats()
      showNotification("Thank you for your rating!", "success")
    }
  } else if (rating !== null) {
    showNotification("Please enter a rating between 1 and 5", "error")
  }
}

function showNearbySuppliers() {
  document.querySelector(".suppliers-list").scrollIntoView({ behavior: "smooth" })
}

function showOrderHistory() {
  // This could open a dedicated order history page or modal
  document.querySelector(".orders-list").scrollIntoView({ behavior: "smooth" })
}

function closeModal(modalId) {
  document.getElementById(modalId).style.display = "none"
  selectedProduct = null
}

function logout() {
  localStorage.removeItem("currentUser")
  window.location.href = "index.html"
}

function showNotification(message, type) {
  const notification = document.createElement("div")
  notification.className = `notification ${type}`
  notification.innerHTML = `
        <i class="fas ${type === "success" ? "fa-check-circle" : "fa-exclamation-circle"}"></i>
        <span>${message}</span>
    `

  notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === "success" ? "#2ecc71" : "#e74c3c"};
        color: white;
        padding: 15px 20px;
        border-radius: 5px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        z-index: 3000;
        display: flex;
        align-items: center;
        gap: 10px;
        animation: slideIn 0.3s ease;
    `

  document.body.appendChild(notification)

  setTimeout(() => {
    notification.style.animation = "slideOut 0.3s ease"
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification)
      }
    }, 300)
  }, 3000)
}

// Initialize dashboard stats on load
updateDashboardStats()

// WhatsApp Integration for Vendor Dashboard
function contactSupplierWhatsApp(supplierContact, supplierName) {
  const message = `Hello ${supplierName}, I'm interested in your products on SupplySathi. Can we discuss pricing and availability?`
  const whatsappUrl = `https://api.whatsapp.com/send?phone=${supplierContact}&text=${encodeURIComponent(message)}`
  window.open(whatsappUrl, "_blank")

  trackEvent("whatsapp_supplier_contact", {
    supplier: supplierName,
    contact: supplierContact,
  })
}

// Payment Integration
function proceedToPayment(orderId) {
  // Store current order for payment
  const order = orders.find((o) => o.id === orderId)
  if (order) {
    localStorage.setItem("currentOrder", JSON.stringify(order))
    window.location.href = `payment.html?orderId=${orderId}`
  }
}

// Analytics Dashboard Link
function openAnalyticsDashboard() {
  window.open("analytics-dashboard.html", "_blank")
}

// Add analytics button to dashboard actions
document.addEventListener("DOMContentLoaded", () => {
  const dashboardActions = document.querySelector(".dashboard-actions")
  if (dashboardActions) {
    const analyticsBtn = document.createElement("button")
    analyticsBtn.className = "btn-secondary"
    analyticsBtn.innerHTML = '<i class="fas fa-chart-line"></i> Analytics'
    analyticsBtn.onclick = openAnalyticsDashboard
    dashboardActions.appendChild(analyticsBtn)
  }
})

// Profile Management
function showProfileModal() {
  const profileContent = document.getElementById("profileContent")
  const editProfileForm = document.getElementById("editProfileForm")
  
  // Display profile info
  profileContent.innerHTML = `
    <div class="profile-details">
      <div class="profile-header">
        <div class="profile-avatar">
          <i class="fas fa-user-circle fa-5x"></i>
        </div>
        <div class="profile-title">
          <h3>${currentUser.name}</h3>
          <p><i class="fas fa-envelope"></i> ${currentUser.email || 'No email provided'}</p>
          <p><i class="fas fa-phone"></i> ${currentUser.phone || 'No phone provided'}</p>
        </div>
      </div>
      
      <div class="profile-section">
        <h4>Business Information</h4>
        <p><strong>Business Name:</strong> ${currentUser.businessName || 'Not specified'}</p>
        <p><strong>Business Type:</strong> ${currentUser.businessType || 'Not specified'}</p>
        <p><strong>Location:</strong> ${currentUser.location || 'Not specified'}</p>
        <p><strong>Business Address:</strong> ${currentUser.businessAddress || 'Not specified'}</p>
      </div>
      
      <div class="profile-section">
        <h4>Account Information</h4>
        <p><strong>User Type:</strong> Vendor</p>
        <p><strong>Member Since:</strong> ${currentUser.joinDate || new Date().toLocaleDateString()}</p>
      </div>
      
      <button class="btn-primary btn-full" onclick="showEditProfileForm()">
        <i class="fas fa-edit"></i> Edit Profile
      </button>
    </div>
  `
  
  document.getElementById("profileModal").style.display = "block"
}

function showEditProfileForm() {
  document.getElementById("profileContent").style.display = "none"
  const editProfileForm = document.getElementById("editProfileForm")
  editProfileForm.style.display = "block"
  
  // Populate form with current user data
  document.getElementById("profileName").value = currentUser.name || ''
  document.getElementById("profileEmail").value = currentUser.email || ''
  document.getElementById("profilePhone").value = currentUser.phone || ''
  document.getElementById("profileLocation").value = currentUser.location || ''
  document.getElementById("profileBusinessName").value = currentUser.businessName || ''
  document.getElementById("profileBusinessAddress").value = currentUser.businessAddress || ''
  
  if (currentUser.businessType) {
    document.getElementById("profileBusinessType").value = currentUser.businessType
  }
}

function updateProfile(event) {
  event.preventDefault()
  
  // Get form values
  const name = document.getElementById("profileName").value
  const email = document.getElementById("profileEmail").value
  const phone = document.getElementById("profilePhone").value
  const location = document.getElementById("profileLocation").value
  const businessName = document.getElementById("profileBusinessName").value
  const businessAddress = document.getElementById("profileBusinessAddress").value
  const businessType = document.getElementById("profileBusinessType").value
  
  // Update current user object
  currentUser.name = name
  currentUser.email = email
  currentUser.phone = phone
  currentUser.location = location
  currentUser.businessName = businessName
  currentUser.businessAddress = businessAddress
  currentUser.businessType = businessType
  
  // If join date doesn't exist, set it
  if (!currentUser.joinDate) {
    currentUser.joinDate = new Date().toLocaleDateString()
  }
  
  // Save to localStorage
  localStorage.setItem("currentUser", JSON.stringify(currentUser))
  
  // Update welcome message
  document.getElementById("welcomeMessage").textContent = `Welcome, ${currentUser.name}!`
  
  // Show profile content again
  document.getElementById("editProfileForm").style.display = "none"
  document.getElementById("profileContent").style.display = "block"
  
  // Refresh profile content
  showProfileModal()
  
  showNotification("Profile updated successfully!", "success")
  
  // Track profile update event
  trackEvent("profile_updated", {
    userType: "vendor"
  })
}
