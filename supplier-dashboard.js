// Supplier Dashboard JavaScript
let currentUser = null
let supplierProducts = []
let incomingOrders = []
let completedOrders = []
let userProfile = null

document.addEventListener("DOMContentLoaded", () => {
  initializeSupplierDashboard()
})

function initializeSupplierDashboard() {
  // Check authentication
  const savedUser = localStorage.getItem("currentUser")
  if (!savedUser) {
    window.location.href = "index.html"
    return
  }

  currentUser = JSON.parse(savedUser)

  // Check if user is supplier
  if (currentUser.userType !== "supplier") {
    window.location.href = "index.html"
    return
  }

  // Update welcome message
  document.getElementById("welcomeMessage").textContent = `Welcome, ${currentUser.name}!`

  // Load data
  loadSupplierData()
  setupEventListeners()
  renderIncomingOrders()
  renderMyProducts()
  renderRecentSales()
  updateDashboardStats()
  
  // Add event listeners to product cards after rendering
  addProductCardEventListeners()
}

function loadSupplierData() {
  // Load supplier's products
  const allProducts = JSON.parse(localStorage.getItem("products")) || []
  supplierProducts = allProducts.filter((product) => product.supplier === currentUser.name)

  // If no products exist for this supplier, create some mock products
  if (supplierProducts.length === 0) {
    generateMockProducts()
  }

  // Load orders
  const allOrders = JSON.parse(localStorage.getItem("orders")) || []
  incomingOrders = allOrders.filter(
    (order) => order.supplier === currentUser.name && ["Processing", "Confirmed"].includes(order.status),
  )

  completedOrders = allOrders.filter(
    (order) => order.supplier === currentUser.name && ["Delivered", "In Transit"].includes(order.status),
  )

  // Generate mock incoming orders if none exist
  if (incomingOrders.length === 0) {
    generateMockIncomingOrders()
  }
  
  // Load user profile
  loadUserProfile()
}

// Enhanced mock product generation
function generateMockProducts() {
  const mockProducts = [
    {
      id: Date.now() + 1,
      name: "Fresh Red Onions",
      category: "vegetables",
      price: 25,
      unit: "kg",
      stock: 500,
      description: "Premium quality red onions sourced directly from farms",
      supplier: currentUser.name,
      image: "https://i.postimg.cc/W3wFHQTX/Fresh-Red-Onion.jpg",
      origin: "Maharashtra",
      shelfLife: "2-3 weeks",
    },
    {
      id: Date.now() + 2,
      name: "Ripe Tomatoes",
      category: "vegetables",
      price: 30,
      unit: "kg",
      stock: 300,
      description: "Fresh, ripe tomatoes perfect for cooking and salads",
      supplier: currentUser.name,
      image: "https://i.postimg.cc/8ckJQtCD/thumb-720-450-f-3.jpg",
      origin: "Karnataka",
      shelfLife: "1 week",
    },
    {
      id: Date.now() + 3,
      name: "Potato",
      category: "vegetables",
      price: 20,
      unit: "kg",
      stock: 100,
      description: "Premium quality potatos sourced directly from farms",
      supplier: currentUser.name,
      image: "https://i.postimg.cc/L69CN1zM/potato-farming.jpg",
      origin: "Andhra Pradesh",
      shelfLife: "2-3 weeks",
    },
    
  ]

  supplierProducts = mockProducts

  // Update global products list
  const allProducts = JSON.parse(localStorage.getItem("products")) || []
  const updatedProducts = [...allProducts, ...mockProducts]
  localStorage.setItem("products", JSON.stringify(updatedProducts))
}

// Enhanced mock orders generation
function generateMockIncomingOrders() {
  incomingOrders = [
    {
      id: Date.now() + 1,
      productName: "Fresh Red Onions",
      supplier: currentUser.name,
      vendorName: "Raj's Food Stall",
      vendorContact: "+91 98765 11111",
      quantity: 15,
      unit: "kg",
      price: 25,
      total: 425, // Including delivery charges
      status: "Processing",
      date: new Date().toISOString().split("T")[0],
      deliveryDate: "2024-01-25",
      notes: "Please ensure good quality onions. Need them fresh for evening rush.",
      orderTime: "10:30 AM",
      priority: "normal",
    },
    {
      id: Date.now() + 2,
      productName: "Ripe Tomatoes",
      supplier: currentUser.name,
      vendorName: "Mumbai Street Kitchen",
      vendorContact: "+91 98765 22222",
      quantity: 20,
      unit: "kg",
      price: 30,
      total: 650, // Including delivery charges
      status: "Processing",
      date: new Date().toISOString().split("T")[0],
      deliveryDate: "2024-01-26",
      notes: "Urgent delivery required for lunch preparation",
      orderTime: "09:15 AM",
      priority: "high",
    },
    {
      id: Date.now() + 3,
      productName: "Pure Turmeric Powder",
      supplier: currentUser.name,
      vendorName: "Spice Corner Stall",
      vendorContact: "+91 98765 33333",
      quantity: 3,
      unit: "kg",
      price: 120,
      total: 410, // Including delivery charges
      status: "Processing",
      date: new Date().toISOString().split("T")[0],
      deliveryDate: "2024-01-27",
      notes: "Need authentic quality for special dishes",
      orderTime: "11:45 AM",
      priority: "normal",
    },
  ]
}

function setupEventListeners() {
  // Add product form submission
  document.getElementById("addProductForm").addEventListener("submit", handleAddProduct)
  
  // Profile form submission
  document.getElementById("updateProfileForm").addEventListener("submit", updateProfile)
  
  // Add click event listeners to product cards for details view
  document.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('click', function() {
      const productId = this.getAttribute('data-id');
      if (productId) {
        showProductDetails(productId);
      }
    });
  });
}

// Load user profile from localStorage or create default one
function loadUserProfile() {
  // Try to load existing profile
  const savedProfile = localStorage.getItem(`profile_${currentUser.email}`);
  
  if (savedProfile) {
    userProfile = JSON.parse(savedProfile);
  } else {
    // Create default profile based on current user info
    userProfile = {
      name: currentUser.name,
      email: currentUser.email,
      phone: currentUser.phone || '',
      location: currentUser.location || '',
      businessName: currentUser.name + "'s Business",
      businessType: 'Supplier',
      joinDate: new Date().toISOString().split('T')[0],
      fssai: '',
      established: new Date().getFullYear() - Math.floor(Math.random() * 10),
      description: 'Quality supplier of fresh products',
      topProducts: supplierProducts.slice(0, 3).map(p => p.name),
      deliveryAreas: ['Local Area', 'Nearby Districts'],
      averageRating: (3.5 + Math.random() * 1.5).toFixed(1)
    };
    
    // Save the default profile
    localStorage.setItem(`profile_${currentUser.email}`, JSON.stringify(userProfile));
  }
}

// Show the profile modal with user information
function showProfileModal() {
  const profileContent = document.getElementById('profileContent');
  
  // Create profile display HTML
  profileContent.innerHTML = `
    <div class="profile-details">
      <div class="profile-header">
        <div class="profile-avatar">
          <i class="fas fa-user-circle fa-5x"></i>
        </div>
        <div class="profile-title">
          <h3>${userProfile.name}</h3>
          <p>${formatBusinessType(userProfile.businessType)}</p>
          <p><i class="fas fa-calendar"></i> Member since: ${userProfile.joinDate}</p>
          <p><i class="fas fa-star"></i> Rating: ${userProfile.averageRating}/5.0</p>
        </div>
      </div>
      
      <div class="profile-section">
        <h4>Contact Information</h4>
        <p><i class="fas fa-envelope"></i> Email: ${userProfile.email}</p>
        <p><i class="fas fa-phone"></i> Phone: ${userProfile.phone}</p>
        <p><i class="fas fa-map-marker-alt"></i> Location: ${userProfile.location}</p>
      </div>
      
      <div class="profile-section">
        <h4>Business Information</h4>
        <p><i class="fas fa-store"></i> Business Name: ${userProfile.businessName}</p>
        ${userProfile.fssai ? `<p><i class="fas fa-certificate"></i> FSSAI License: ${userProfile.fssai}</p>` : ''}
        ${userProfile.established ? `<p><i class="fas fa-calendar-check"></i> Established: ${userProfile.established}</p>` : ''}
        <p><i class="fas fa-info-circle"></i> Description: ${userProfile.description || 'No description available.'}</p>
      </div>
      
      <div class="profile-section">
        <h4>Top Products</h4>
        <ul>
          ${userProfile.topProducts ? userProfile.topProducts.map(product => `<li>${product}</li>`).join('') : '<li>No products listed</li>'}
        </ul>
      </div>
      
      <div class="profile-section">
        <h4>Delivery Areas</h4>
        <ul>
          ${userProfile.deliveryAreas ? userProfile.deliveryAreas.map(area => `<li>${area}</li>`).join('') : '<li>No delivery areas specified</li>'}
        </ul>
      </div>
      
      <button class="btn-primary" onclick="showEditProfileForm()">
        <i class="fas fa-edit"></i> Edit Profile
      </button>
    </div>
  `;
  
  // Hide edit form, show profile content
  document.getElementById('editProfileForm').style.display = 'none';
  profileContent.style.display = 'block';
  
  // Show the modal
  document.getElementById('profileModal').style.display = 'flex';
}

// Show the edit profile form
function showEditProfileForm() {
  // Populate form with current profile data
  document.getElementById('profileName').value = userProfile.name;
  document.getElementById('profileEmail').value = userProfile.email;
  document.getElementById('profilePhone').value = userProfile.phone || '';
  document.getElementById('profileLocation').value = userProfile.location || '';
  document.getElementById('profileBusinessName').value = userProfile.businessName || '';
  document.getElementById('profileFssai').value = userProfile.fssai || '';
  document.getElementById('profileEstablished').value = userProfile.established || '';
  document.getElementById('profileDescription').value = userProfile.description || '';
  
  // Hide profile content, show edit form
  document.getElementById('profileContent').style.display = 'none';
  document.getElementById('editProfileForm').style.display = 'block';
}

// Update profile with form data
function updateProfile(event) {
  event.preventDefault();
  
  // Get form values
  const name = document.getElementById('profileName').value;
  const email = document.getElementById('profileEmail').value;
  const phone = document.getElementById('profilePhone').value;
  const location = document.getElementById('profileLocation').value;
  const businessName = document.getElementById('profileBusinessName').value;
  const fssai = document.getElementById('profileFssai').value;
  const established = document.getElementById('profileEstablished').value;
  const description = document.getElementById('profileDescription').value;
  
  // Update user profile
  userProfile.name = name;
  userProfile.email = email;
  userProfile.phone = phone;
  userProfile.location = location;
  userProfile.businessName = businessName;
  userProfile.fssai = fssai;
  userProfile.established = established;
  userProfile.description = description;
  
  // Update current user name
  currentUser.name = name;
  localStorage.setItem('currentUser', JSON.stringify(currentUser));
  
  // Save updated profile
  localStorage.setItem(`profile_${currentUser.email}`, JSON.stringify(userProfile));
  
  // Update welcome message
  document.getElementById('welcomeMessage').textContent = `Welcome, ${name}!`;
  
  // Show updated profile
  showProfileModal();
}

// Format business type for display
function formatBusinessType(type) {
  if (!type) return 'Business';
  
  return type.charAt(0).toUpperCase() + type.slice(1);
}

// Enhanced order rendering with more details
function renderIncomingOrders() {
  const incomingOrdersList = document.getElementById("incomingOrders")

  if (!incomingOrdersList) {
    console.error("Incoming orders list element not found")
    return
  }

  if (incomingOrders.length === 0) {
    incomingOrdersList.innerHTML = `
      <div style="text-align: center; padding: 40px; color: #7f8c8d;">
        <i class="fas fa-inbox" style="font-size: 3rem; margin-bottom: 15px;"></i>
        <p>No incoming orders at the moment.</p>
        <p>Orders will appear here when vendors place them.</p>
      </div>
    `
    return
  }

  incomingOrdersList.innerHTML = incomingOrders
    .map(
      (order) => `
        <div class="order-card ${order.priority === "high" ? "priority-high" : ""}">
            <div class="order-header">
                <h4>
                  <i class="fas fa-box"></i> ${order.productName}
                  ${order.priority === "high" ? '<span class="priority-badge">URGENT</span>' : ""}
                </h4>
                <span class="order-status status-${order.status.toLowerCase()}">${order.status}</span>
            </div>
            <div class="order-details">
                <div class="order-detail-grid">
                  <div>
                    <p><i class="fas fa-user"></i> <strong>Vendor:</strong> ${order.vendorName}</p>
                    <p><i class="fas fa-phone"></i> <strong>Contact:</strong> ${order.vendorContact || "Not provided"}</p>
                  </div>
                  <div>
                    <p><i class="fas fa-shopping-cart"></i> <strong>Quantity:</strong> ${order.quantity} ${order.unit}</p>
                    <p><i class="fas fa-rupee-sign"></i> <strong>Total:</strong> ₹${order.total}</p>
                  </div>
                </div>
                <p><i class="fas fa-calendar"></i> <strong>Delivery Date:</strong> ${new Date(order.deliveryDate).toLocaleDateString()}</p>
                <p><i class="fas fa-clock"></i> <strong>Order Time:</strong> ${order.orderTime || "Not specified"}</p>
                ${order.notes ? `<div class="order-notes"><i class="fas fa-sticky-note"></i> <strong>Notes:</strong> ${order.notes}</div>` : ""}
            </div>
            <div class="order-actions">
                <button class="btn-primary btn-small" onclick="confirmOrder(${order.id})" title="Accept this order">
                    <i class="fas fa-check"></i> Accept Order
                </button>
                <button class="btn-secondary btn-small" onclick="showOrderDetails(${order.id})" title="View full details">
                    <i class="fas fa-eye"></i> View Details
                </button>
                ${
                  order.vendorContact
                    ? `
                <button class="btn-secondary btn-small" onclick="contactVendorWhatsApp('${order.vendorContact}', '${order.vendorName}', 'Order #${order.id}')" title="Contact vendor via WhatsApp">
                    <i class="fab fa-whatsapp"></i> WhatsApp
                </button>
                `
                    : `
                <button class="btn-secondary btn-small" onclick="contactVendor('${order.vendorContact || order.vendorName}')" title="Contact vendor">
                    <i class="fas fa-phone"></i> Contact
                </button>
                `
                }
                <button class="btn-danger btn-small" onclick="rejectOrder(${order.id})" title="Reject this order">
                    <i class="fas fa-times"></i> Reject
                </button>
            </div>
        </div>
    `,
    )
    .join("")
}

// Enhanced product rendering for suppliers
// Add event listeners to product cards for details view
function addProductCardEventListeners() {
  document.querySelectorAll('.product-card').forEach(card => {
    card.addEventListener('click', function(e) {
      // Only trigger if the click is on the card itself, not on a button
      if (e.target.tagName !== 'BUTTON' && !e.target.closest('button')) {
        const productId = this.getAttribute('data-id');
        if (productId) {
          showProductDetails(productId);
        }
      }
    });
  });
}

function renderMyProducts() {
  const myProductsList = document.getElementById("myProducts")

  if (!myProductsList) {
    console.error("My products list element not found")
    return
  }

  if (supplierProducts.length === 0) {
    myProductsList.innerHTML = `
      <div style="text-align: center; padding: 40px; color: #7f8c8d;">
        <i class="fas fa-plus-circle" style="font-size: 3rem; margin-bottom: 15px;"></i>
        <p>No products added yet.</p>
        <button class="btn-primary" onclick="showAddProductModal()">
          <i class="fas fa-plus"></i> Add Your First Product
        </button>
      </div>
    `
    return
  }

  myProductsList.innerHTML = supplierProducts
    .map(
      (product) => `
        <div class="product-card" data-id="${product.id}">
            <img src="${product.image}" alt="${product.name}" onerror="this.src='/placeholder.svg?height=150&width=150'">
            <div class="product-info">
                <h4>${product.name}</h4>
                <p class="product-category">
                  <i class="fas fa-tag"></i> ${formatCategoryName(product.category)}
                </p>
                <div class="product-price">
                    <span class="price">₹${product.price}/${product.unit}</span>
                    <span class="stock ${product.stock < 10 ? "low-stock" : product.stock < 50 ? "medium-stock" : "good-stock"}">
                        <i class="fas fa-boxes"></i> ${product.stock} ${product.unit}
                    </span>
                </div>
                <p class="product-description">${product.description || "No description available"}</p>
                ${product.origin ? `<p class="product-origin"><i class="fas fa-map-marker-alt"></i> Origin: ${product.origin}</p>` : ""}
                <div class="product-actions">
                    <button class="btn-info btn-small" onclick="showProductDetails(${product.id})" title="View product details">
                        <i class="fas fa-info-circle"></i> Details
                    </button>
                    <button class="btn-secondary btn-small" onclick="editProduct(${product.id})" title="Edit product details">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn-primary btn-small" onclick="updateStock(${product.id})" title="Update stock quantity">
                        <i class="fas fa-plus"></i> Add Stock
                    </button>
                    <button class="btn-danger btn-small" onclick="deleteProduct(${product.id})" title="Delete this product">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        </div>
    `,
    )
    .join("")
}

function renderRecentSales() {
  const recentSalesList = document.getElementById("recentSales")

  if (completedOrders.length === 0) {
    recentSalesList.innerHTML = "<p>No recent sales.</p>"
    return
  }

  const recentSales = completedOrders.slice(0, 5) // Show last 5 sales

  recentSalesList.innerHTML = recentSales
    .map(
      (sale) => `
        <div class="sale-card">
            <div class="sale-header">
                <h4>${sale.productName}</h4>
                <span class="sale-amount">₹${sale.total}</span>
            </div>
            <div class="sale-details">
                <p><strong>Vendor:</strong> ${sale.vendorName || "Unknown Vendor"}</p>
                <p><strong>Quantity:</strong> ${sale.quantity} ${sale.unit}</p>
                <p><strong>Date:</strong> ${new Date(sale.date).toLocaleDateString()}</p>
                <p><strong>Status:</strong> ${sale.status}</p>
            </div>
        </div>
    `,
    )
    .join("")
}

function updateDashboardStats() {
  const totalProducts = supplierProducts.length
  const pendingOrders = incomingOrders.length
  const monthlyRevenue = completedOrders
    .filter((order) => {
      const orderDate = new Date(order.date)
      const currentMonth = new Date().getMonth()
      return orderDate.getMonth() === currentMonth
    })
    .reduce((sum, order) => sum + order.total, 0)

  // Calculate average rating (mock data)
  const avgRating = 4.7

  document.getElementById("totalProducts").textContent = totalProducts
  document.getElementById("pendingOrders").textContent = pendingOrders
  document.getElementById("monthlyRevenue").textContent = `₹${monthlyRevenue.toLocaleString()}`
  document.getElementById("avgRating").textContent = avgRating.toFixed(1)
}

function showAddProductModal() {
  document.getElementById("addProductModal").style.display = "block"
}

// Enhanced add product form validation
function handleAddProduct(e) {
  e.preventDefault()

  const productName = document.getElementById("productName").value.trim()
  const productCategory = document.getElementById("productCategory").value
  const productPrice = Number.parseFloat(document.getElementById("productPrice").value)
  const productUnit = document.getElementById("productUnit").value
  const productStock = Number.parseInt(document.getElementById("productStock").value)
  const productDescription = document.getElementById("productDescription").value.trim()

  // Validation
  if (!productName) {
    showNotification("Please enter a product name", "error")
    return
  }

  if (!productCategory) {
    showNotification("Please select a category", "error")
    return
  }

  if (productPrice <= 0) {
    showNotification("Please enter a valid price", "error")
    return
  }

  if (!productUnit) {
    showNotification("Please select a unit", "error")
    return
  }

  if (productStock < 0) {
    showNotification("Stock cannot be negative", "error")
    return
  }

  // Check for duplicate product names
  const existingProduct = supplierProducts.find((p) => p.name.toLowerCase() === productName.toLowerCase())

  if (existingProduct) {
    showNotification("A product with this name already exists", "error")
    return
  }

  const newProduct = {
    id: Date.now(),
    name: productName,
    category: productCategory,
    price: productPrice,
    unit: productUnit,
    stock: productStock,
    description: productDescription,
    supplier: currentUser.name,
    image: `/placeholder.svg?height=150&width=150&query=${encodeURIComponent(productName)}`,
    dateAdded: new Date().toISOString().split("T")[0],
  }

  supplierProducts.push(newProduct)

  // Update global products list
  const allProducts = JSON.parse(localStorage.getItem("products")) || []
  allProducts.push(newProduct)
  localStorage.setItem("products", JSON.stringify(allProducts))

  closeModal("addProductModal")
  renderMyProducts()
  updateDashboardStats()

  // Reset form
  document.getElementById("addProductForm").reset()

  showNotification(`${productName} added successfully!`, "success")
}

// WhatsApp Integration for Supplier Dashboard
function contactVendorWhatsApp(vendorContact, vendorName, orderDetails = "") {
  let message = `Hello ${vendorName}, this is regarding your order on SupplySathi.`
  if (orderDetails) {
    message += ` Order details: ${orderDetails}`
  }

  const whatsappUrl = `https://api.whatsapp.com/send?phone=${vendorContact}&text=${encodeURIComponent(message)}`
  window.open(whatsappUrl, "_blank")

  trackEvent("whatsapp_vendor_contact", {
    vendor: vendorName,
    contact: vendorContact,
  })
}

function showProductDetails(productId) {
  // Find the product
  const product = supplierProducts.find(p => parseInt(p.id) === parseInt(productId))
  if (!product) return
  
  // Populate the product details modal
  const productDetailsContent = document.getElementById("productDetailsContent")
  
  // Create HTML content with detailed information
  productDetailsContent.innerHTML = `
    <div class="product-details-header">
      <div class="product-details-image">
        <img src="${product.image || "/placeholder.svg?height=200&width=200"}" alt="${product.name}" onerror="this.src='/placeholder.svg?height=200&width=200'">
      </div>
      <div class="product-details-info">
        <h2>${product.name}</h2>
        <p class="product-supplier">
          <i class="fas fa-truck"></i> Supplied by: ${currentUser.name}
          <span class="verified-badge"><i class="fas fa-check-circle"></i> You</span>
        </p>
        <p class="product-price"><i class="fas fa-rupee-sign"></i> ${product.price} per ${product.unit}</p>
        <p class="product-category"><i class="fas fa-tag"></i> ${formatCategoryName(product.category)}</p>
        <p class="product-stock"><i class="fas fa-cubes"></i> Available Stock: ${product.stock || 'Not specified'} ${product.unit}s</p>
      </div>
    </div>
    
    <div class="product-details-section">
      <h3>Product Description</h3>
      <p>${product.description || 'No description available.'}</p>
    </div>
    
    ${product.origin ? `
    <div class="product-details-section">
      <h3>Origin</h3>
      <p><i class="fas fa-map-marker-alt"></i> ${product.origin}</p>
    </div>` : ''}
    
    ${product.shelfLife ? `
    <div class="product-details-section">
      <h3>Shelf Life</h3>
      <p><i class="fas fa-clock"></i> ${product.shelfLife}</p>
    </div>` : ''}
    
    <div class="product-details-section">
      <h3>Sales Information</h3>
      <p><i class="fas fa-chart-line"></i> Total Orders: ${Math.floor(Math.random() * 50)}</p>
      <p><i class="fas fa-users"></i> Unique Customers: ${Math.floor(Math.random() * 20)}</p>
    </div>
    
    <div class="product-details-actions">
      <button class="btn-primary" onclick="editProduct(${product.id})">
        <i class="fas fa-edit"></i> Edit Product
      </button>
      <button class="btn-secondary" onclick="closeModal('productDetailsModal')">
        <i class="fas fa-times"></i> Close
      </button>
    </div>
  `
  
  // Show the modal
  document.getElementById("productDetailsModal").style.display = "block"
}

function formatCategoryName(category) {
  if (!category) return 'Uncategorized';
  
  // Convert from camelCase or snake_case to Title Case with spaces
  return category
    .replace(/([A-Z])/g, ' $1') // Insert space before capital letters
    .replace(/_/g, ' ') // Replace underscores with spaces
    .replace(/^./, str => str.toUpperCase()) // Capitalize first letter
    .trim(); // Remove any extra spaces
}

// Enhanced order confirmation with WhatsApp notification
function confirmOrder(orderId) {
  const order = incomingOrders.find((o) => o.id === orderId)
  if (!order) return

  order.status = "Confirmed"

  // Move to completed orders
  completedOrders.unshift(order)
  incomingOrders = incomingOrders.filter((o) => o.id !== orderId)

  // Update localStorage
  updateOrdersInStorage()

  // Send WhatsApp notification to vendor
  const message = `Great news! Your order #${order.id} for ${order.productName} has been confirmed by ${currentUser.name}. Expected delivery: ${order.deliveryDate}`
  if (order.vendorContact) {
    contactVendorWhatsApp(order.vendorContact, order.vendorName, `Order #${order.id} confirmed`)
  }

  renderIncomingOrders()
  renderRecentSales()
  updateDashboardStats()

  showNotification("Order confirmed successfully! Vendor has been notified via WhatsApp.", "success")
}

// Enhanced order details with WhatsApp contact
function showOrderDetails(orderId) {
  const order = incomingOrders.find((o) => o.id === orderId)
  if (!order) return

  const orderDetailsContent = document.getElementById("orderDetailsContent")
  orderDetailsContent.innerHTML = `
        <div class="order-detail-card">
            <h3>Order #${order.id}</h3>
            <div class="order-info-grid">
                <div class="info-item">
                    <strong>Product:</strong>
                    <p>${order.productName}</p>
                </div>
                <div class="info-item">
                    <strong>Vendor:</strong>
                    <p>${order.vendorName}</p>
                </div>
                <div class="info-item">
                    <strong>Contact:</strong>
                    <p>${order.vendorContact || "Not provided"}</p>
                </div>
                <div class="info-item">
                    <strong>Quantity:</strong>
                    <p>${order.quantity} ${order.unit}</p>
                </div>
                <div class="info-item">
                    <strong>Price per unit:</strong>
                    <p>₹${order.price}</p>
                </div>
                <div class="info-item">
                    <strong>Total Amount:</strong>
                    <p>₹${order.total}</p>
                </div>
                <div class="info-item">
                    <strong>Order Date:</strong>
                    <p>${new Date(order.date).toLocaleDateString()}</p>
                </div>
                <div class="info-item">
                    <strong>Delivery Date:</strong>
                    <p>${new Date(order.deliveryDate).toLocaleDateString()}</p>
                </div>
                <div class="info-item">
                    <strong>Status:</strong>
                    <p><span class="order-status status-${order.status.toLowerCase()}">${order.status}</span></p>
                </div>
            </div>
            ${
              order.notes
                ? `
                <div class="order-notes">
                    <strong>Special Instructions:</strong>
                    <p>${order.notes}</p>
                </div>
            `
                : ""
            }
            <div class="order-actions">
                <button class="btn-primary" onclick="confirmOrder(${order.id}); closeModal('orderDetailsModal')">
                    <i class="fas fa-check"></i> Confirm Order
                </button>
                ${
                  order.vendorContact
                    ? `
                <button class="btn-secondary" onclick="contactVendorWhatsApp('${order.vendorContact}', '${order.vendorName}', 'Order #${order.id}')">
                    <i class="fab fa-whatsapp"></i> Contact via WhatsApp
                </button>
                `
                    : ""
                }
                <button class="btn-danger" onclick="rejectOrder(${order.id}); closeModal('orderDetailsModal')">
                    <i class="fas fa-times"></i> Reject Order
                </button>
            </div>
        </div>
    `

  document.getElementById("orderDetailsModal").style.display = "block"
}

// Payment tracking for suppliers
function trackPaymentReceived(orderId, amount) {
  const payments = JSON.parse(localStorage.getItem("supplierPayments")) || []
  const payment = {
    id: Date.now(),
    orderId: orderId,
    amount: amount,
    supplier: currentUser.name,
    date: new Date().toISOString(),
    status: "Received",
  }

  payments.push(payment)
  localStorage.setItem("supplierPayments", JSON.stringify(payments))

  showNotification(`Payment of ₹${amount} received for order #${orderId}`, "success")
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

function confirmOrder(orderId) {
  const order = incomingOrders.find((o) => o.id === orderId)
  if (!order) return

  order.status = "Confirmed"

  // Move to completed orders
  completedOrders.unshift(order)
  incomingOrders = incomingOrders.filter((o) => o.id !== orderId)

  // Update localStorage
  updateOrdersInStorage()

  renderIncomingOrders()
  renderRecentSales()
  updateDashboardStats()

  showNotification("Order confirmed successfully!", "success")
}

function rejectOrder(orderId) {
  if (confirm("Are you sure you want to reject this order?")) {
    incomingOrders = incomingOrders.filter((o) => o.id !== orderId)
    updateOrdersInStorage()
    renderIncomingOrders()
    updateDashboardStats()
    showNotification("Order rejected", "error")
  }
}

function showOrderDetails(orderId) {
  const order = incomingOrders.find((o) => o.id === orderId)
  if (!order) return

  const orderDetailsContent = document.getElementById("orderDetailsContent")
  orderDetailsContent.innerHTML = `
        <div class="order-detail-card">
            <h3>Order #${order.id}</h3>
            <div class="order-info-grid">
                <div class="info-item">
                    <strong>Product:</strong>
                    <p>${order.productName}</p>
                </div>
                <div class="info-item">
                    <strong>Vendor:</strong>
                    <p>${order.vendorName}</p>
                </div>
                <div class="info-item">
                    <strong>Quantity:</strong>
                    <p>${order.quantity} ${order.unit}</p>
                </div>
                <div class="info-item">
                    <strong>Price per unit:</strong>
                    <p>₹${order.price}</p>
                </div>
                <div class="info-item">
                    <strong>Total Amount:</strong>
                    <p>₹${order.total}</p>
                </div>
                <div class="info-item">
                    <strong>Order Date:</strong>
                    <p>${new Date(order.date).toLocaleDateString()}</p>
                </div>
                <div class="info-item">
                    <strong>Delivery Date:</strong>
                    <p>${new Date(order.deliveryDate).toLocaleDateString()}</p>
                </div>
                <div class="info-item">
                    <strong>Status:</strong>
                    <p><span class="order-status status-${order.status.toLowerCase()}">${order.status}</span></p>
                </div>
            </div>
            ${
              order.notes
                ? `
                <div class="order-notes">
                    <strong>Special Instructions:</strong>
                    <p>${order.notes}</p>
                </div>
            `
                : ""
            }
            <div class="order-actions">
                <button class="btn-primary" onclick="confirmOrder(${order.id}); closeModal('orderDetailsModal')">
                    <i class="fas fa-check"></i> Confirm Order
                </button>
                <button class="btn-danger" onclick="rejectOrder(${order.id}); closeModal('orderDetailsModal')">
                    <i class="fas fa-times"></i> Reject Order
                </button>
            </div>
        </div>
    `

  document.getElementById("orderDetailsModal").style.display = "block"
}

function editProduct(productId) {
  const product = supplierProducts.find((p) => p.id === productId)
  if (!product) return

  // Pre-fill the add product form with existing data
  document.getElementById("productName").value = product.name
  document.getElementById("productCategory").value = product.category
  document.getElementById("productPrice").value = product.price
  document.getElementById("productUnit").value = product.unit
  document.getElementById("productStock").value = product.stock
  document.getElementById("productDescription").value = product.description

  // Change form behavior to edit mode
  const form = document.getElementById("addProductForm")
  form.onsubmit = (e) => {
    e.preventDefault()
    updateProduct(productId)
  }

  // Change modal title
  document.querySelector("#addProductModal h2").textContent = "Edit Product"

  showAddProductModal()
}

function updateProduct(productId) {
  const product = supplierProducts.find((p) => p.id === productId)
  if (!product) return

  product.name = document.getElementById("productName").value
  product.category = document.getElementById("productCategory").value
  product.price = Number.parseFloat(document.getElementById("productPrice").value)
  product.unit = document.getElementById("productUnit").value
  product.stock = Number.parseInt(document.getElementById("productStock").value)
  product.description = document.getElementById("productDescription").value

  // Update global products list
  const allProducts = JSON.parse(localStorage.getItem("products")) || []
  const productIndex = allProducts.findIndex((p) => p.id === productId)
  if (productIndex !== -1) {
    allProducts[productIndex] = product
    localStorage.setItem("products", JSON.stringify(allProducts))
  }

  closeModal("addProductModal")
  renderMyProducts()

  // Reset form behavior
  document.getElementById("addProductForm").onsubmit = handleAddProduct
  document.querySelector("#addProductModal h2").textContent = "Add New Product"
  document.getElementById("addProductForm").reset()

  showNotification("Product updated successfully!", "success")
}

function updateStock(productId) {
  const product = supplierProducts.find((p) => p.id === productId)
  if (!product) return

  const additionalStock = prompt(`Current stock: ${product.stock} ${product.unit}\nEnter additional stock to add:`)
  const stockToAdd = Number.parseInt(additionalStock)

  if (stockToAdd > 0) {
    product.stock += stockToAdd

    // Update global products list
    const allProducts = JSON.parse(localStorage.getItem("products")) || []
    const productIndex = allProducts.findIndex((p) => p.id === productId)
    if (productIndex !== -1) {
      allProducts[productIndex] = product
      localStorage.setItem("products", JSON.stringify(allProducts))
    }

    renderMyProducts()
    showNotification(`Added ${stockToAdd} ${product.unit} to ${product.name}`, "success")
  } else if (additionalStock !== null) {
    showNotification("Please enter a valid stock quantity", "error")
  }
}

function updateOrdersInStorage() {
  // This is a simplified approach - in a real app, you'd have a proper backend
  const allOrders = [...incomingOrders, ...completedOrders]
  localStorage.setItem("orders", JSON.stringify(allOrders))
}

// New function to contact vendor
function contactVendor(contact) {
  if (contact && contact.startsWith("+91")) {
    if (confirm(`Call ${contact}?`)) {
      window.open(`tel:${contact}`, "_self")
    }
  } else {
    showNotification("Vendor contact not available", "error")
  }
}

// New function to delete product
function deleteProduct(productId) {
  if (confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
    // Remove from supplier products
    supplierProducts = supplierProducts.filter((p) => p.id !== productId)

    // Remove from global products list
    const allProducts = JSON.parse(localStorage.getItem("products")) || []
    const updatedProducts = allProducts.filter((p) => p.id !== productId)
    localStorage.setItem("products", JSON.stringify(updatedProducts))

    renderMyProducts()
    updateDashboardStats()
    showNotification("Product deleted successfully", "success")
  }
}

function showInventoryModal() {
  // This could show a detailed inventory management interface
  alert("Inventory management feature coming soon!")
}

function closeModal(modalId) {
  document.getElementById(modalId).style.display = "none"
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

// Add additional CSS for supplier-specific components
const supplierStyles = document.createElement("style")
supplierStyles.textContent = `
    .products-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 20px;
    }
    
    .product-actions {
        display: flex;
        gap: 10px;
        margin-top: 10px;
    }
    
    .btn-small {
        padding: 5px 10px;
        font-size: 0.9rem;
    }
    
    .btn-danger {
        background: #e74c3c;
        color: white;
        border: none;
        padding: 8px 15px;
        border-radius: 5px;
        cursor: pointer;
        font-weight: 500;
        transition: background 0.3s;
    }
    
    .btn-danger:hover {
        background: #c0392b;
    }
    
    .low-stock {
        color: #e74c3c;
        font-weight: bold;
    }

    .medium-stock {
        color: #f39c12;
        font-weight: bold;
    }

    .good-stock {
        color: #2ecc71;
        font-weight: bold;
    }
    
    .order-actions {
        display: flex;
        gap: 10px;
        margin-top: 15px;
        flex-wrap: wrap;
    }
    
    .sale-card {
        background: #f8f9fa;
        padding: 20px;
        border-radius: 10px;
        margin-bottom: 15px;
        border-left: 4px solid #2ecc71;
    }
    
    .sale-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
    }
    
    .sale-amount {
        font-size: 1.2rem;
        font-weight: bold;
        color: #2ecc71;
    }
    
    .order-info-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 15px;
        margin: 20px 0;
    }
    
    .info-item strong {
        display: block;
        color: #2c3e50;
        margin-bottom: 5px;
    }
    
    .order-notes {
        background: #f8f9fa;
        padding: 15px;
        border-radius: 8px;
        margin: 20px 0;
    }
    
    .status-processing {
        background: #f39c12;
        color: white;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 0.8rem;
    }
    
    .status-confirmed {
        background: #2ecc71;
        color: white;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 0.8rem;
    }
    
    .status-delivered {
        background: #27ae60;
        color: white;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 0.8rem;
    }
    
    .status-in-transit {
        background: #3498db;
        color: white;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 0.8rem;
    }

    .priority-high {
        border-left: 5px solid #e74c3c;
    }

    .priority-badge {
        background-color: #e74c3c;
        color: white;
        padding: 3px 6px;
        border-radius: 5px;
        font-size: 0.7rem;
        margin-left: 5px;
    }
    
    @media (max-width: 768px) {
        .products-grid {
            grid-template-columns: 1fr;
        }
        
        .order-actions {
            flex-direction: column;
        }
        
        .order-info-grid {
            grid-template-columns: 1fr;
        }
    }
`
document.head.appendChild(supplierStyles)

// WhatsApp Integration for Supplier Dashboard
function contactVendorWhatsApp(vendorContact, vendorName, orderDetails = "") {
  let message = `Hello ${vendorName}, this is regarding your order on SupplySathi.`
  if (orderDetails) {
    message += ` Order details: ${orderDetails}`
  }

  const whatsappUrl = `https://api.whatsapp.com/send?phone=${vendorContact}&text=${encodeURIComponent(message)}`
  window.open(whatsappUrl, "_blank")

  trackEvent("whatsapp_vendor_contact", {
    vendor: vendorName,
    contact: vendorContact,
  })
}

// Enhanced order confirmation with WhatsApp notification
function confirmOrder(orderId) {
  const order = incomingOrders.find((o) => o.id === orderId)
  if (!order) return

  order.status = "Confirmed"

  // Move to completed orders
  completedOrders.unshift(order)
  incomingOrders = incomingOrders.filter((o) => o.id !== orderId)

  // Update localStorage
  updateOrdersInStorage()

  // Send WhatsApp notification to vendor
  const message = `Great news! Your order #${order.id} for ${order.productName} has been confirmed by ${currentUser.name}. Expected delivery: ${order.deliveryDate}`
  if (order.vendorContact) {
    contactVendorWhatsApp(order.vendorContact, order.vendorName, `Order #${order.id} confirmed`)
  }

  renderIncomingOrders()
  renderRecentSales()
  updateDashboardStats()

  showNotification("Order confirmed successfully! Vendor has been notified via WhatsApp.", "success")
}

// Enhanced order details with WhatsApp contact
function showOrderDetails(orderId) {
  const order = incomingOrders.find((o) => o.id === orderId)
  if (!order) return

  const orderDetailsContent = document.getElementById("orderDetailsContent")
  orderDetailsContent.innerHTML = `
        <div class="order-detail-card">
            <h3>Order #${order.id}</h3>
            <div class="order-info-grid">
                <div class="info-item">
                    <strong>Product:</strong>
                    <p>${order.productName}</p>
                </div>
                <div class="info-item">
                    <strong>Vendor:</strong>
                    <p>${order.vendorName}</p>
                </div>
                <div class="info-item">
                    <strong>Contact:</strong>
                    <p>${order.vendorContact || "Not provided"}</p>
                </div>
                <div class="info-item">
                    <strong>Quantity:</strong>
                    <p>${order.quantity} ${order.unit}</p>
                </div>
                <div class="info-item">
                    <strong>Price per unit:</strong>
                    <p>₹${order.price}</p>
                </div>
                <div class="info-item">
                    <strong>Total Amount:</strong>
                    <p>₹${order.total}</p>
                </div>
                <div class="info-item">
                    <strong>Order Date:</strong>
                    <p>${new Date(order.date).toLocaleDateString()}</p>
                </div>
                <div class="info-item">
                    <strong>Delivery Date:</strong>
                    <p>${new Date(order.deliveryDate).toLocaleDateString()}</p>
                </div>
                <div class="info-item">
                    <strong>Status:</strong>
                    <p><span class="order-status status-${order.status.toLowerCase()}">${order.status}</span></p>
                </div>
            </div>
            ${
              order.notes
                ? `
                <div class="order-notes">
                    <strong>Special Instructions:</strong>
                    <p>${order.notes}</p>
                </div>
            `
                : ""
            }
            <div class="order-actions">
                <button class="btn-primary" onclick="confirmOrder(${order.id}); closeModal('orderDetailsModal')">
                    <i class="fas fa-check"></i> Confirm Order
                </button>
                ${
                  order.vendorContact
                    ? `
                <button class="btn-secondary" onclick="contactVendorWhatsApp('${order.vendorContact}', '${order.vendorName}', 'Order #${order.id}')">
                    <i class="fab fa-whatsapp"></i> Contact via WhatsApp
                </button>
                `
                    : ""
                }
                <button class="btn-danger" onclick="rejectOrder(${order.id}); closeModal('orderDetailsModal')">
                    <i class="fas fa-times"></i> Reject Order
                </button>
            </div>
        </div>
    `

  document.getElementById("orderDetailsModal").style.display = "block"
}

// Payment tracking for suppliers
function trackPaymentReceived(orderId, amount) {
  const payments = JSON.parse(localStorage.getItem("supplierPayments")) || []
  const payment = {
    id: Date.now(),
    orderId: orderId,
    amount: amount,
    supplier: currentUser.name,
    date: new Date().toISOString(),
    status: "Received",
  }

  payments.push(payment)
  localStorage.setItem("supplierPayments", JSON.stringify(payments))

  showNotification(`Payment of ₹${amount} received for order #${orderId}`, "success")
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
