// Global variables
let currentUser = null
let suppliers = []
let products = []
const orders = []

// Initialize the application
document.addEventListener("DOMContentLoaded", () => {
  initializeApp()
  setupEventListeners()
  loadMockData()
})

function initializeApp() {
  // Check if user is logged in
  const savedUser = localStorage.getItem("currentUser")
  if (savedUser) {
    currentUser = JSON.parse(savedUser)
    redirectToDashboard()
  }
}

function setupEventListeners() {
  // Login form
  document.getElementById("loginForm").addEventListener("submit", handleLogin)

  // Signup form
  document.getElementById("signupForm").addEventListener("submit", handleSignup)

  // Mobile menu toggle
  const hamburger = document.querySelector(".hamburger")
  const navMenu = document.querySelector(".nav-menu")

  if (hamburger) {
    hamburger.addEventListener("click", () => {
      if (!navMenu.classList.contains("active")) {
        navMenu.classList.add("active")
      } else {
        navMenu.classList.remove("active")
      }
    })
  }

  // Smooth scrolling for navigation links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault()
      const target = document.querySelector(this.getAttribute("href"))
      if (target) {
        target.scrollIntoView({
          behavior: "smooth",
          block: "start",
        })
      }
    })
  })
}

function loadMockData() {
  // Mock suppliers data with better images
  suppliers = [
    {
      id: 1,
      name: "Fresh Vegetables Co.",
      location: "Kolkata",
      rating: 4.5,
      verified: true,
      products: ["Onions", "Tomatoes", "Potatoes", "Carrots", "Cabbage", "Spinach"],
      contact: "+91 98765 43210",
      fssai: "12345678901234",
      description: "Premium quality fresh vegetables sourced directly from farms",
      established: "2015",
      deliveryTime: "2-4 hours",
    },
    {
      id: 2,
      name: "Spice Masters",
      location: "Delhi, NCR",
      rating: 4.8,
      verified: true,
      products: ["Turmeric", "Red Chili", "Coriander", "Cumin", "Garam Masala", "Black Pepper"],
      contact: "+91 87654 32109",
      fssai: "23456789012345",
      description: "Authentic Indian spices with traditional grinding methods",
      established: "2012",
      deliveryTime: "1-2 hours",
    },
    {
      id: 3,
      name: "Oil & Grains Hub",
      location: "Pune, Maharashtra",
      rating: 4.3,
      verified: true,
      products: ["Cooking Oil", "Rice", "Wheat Flour", "Lentils", "Chickpeas", "Mustard Oil"],
      contact: "+91 76543 21098",
      fssai: "34567890123456",
      description: "Quality oils and grains for all your cooking needs",
      established: "2018",
      deliveryTime: "3-5 hours",
    },
    {
      id: 4,
      name: "Dairy Fresh",
      location: "Bangalore, Karnataka",
      rating: 4.6,
      verified: true,
      products: ["Milk", "Paneer", "Butter", "Yogurt", "Cheese", "Cream"],
      contact: "+91 65432 10987",
      fssai: "45678901234567",
      description: "Fresh dairy products delivered daily",
      established: "2020",
      deliveryTime: "1-3 hours",
    },
  ]

  // Mock products data with proper images
  products = [
    {
      id: 1,
      name: "Fresh Red Onions",
      supplier: "Fresh Vegetables Co.",
      price: 25,
      unit: "kg",
      stock: 500,
      category: "vegetables",
      image: "https://i.postimg.cc/W3wFHQTX/Fresh-Red-Onion.jpg",
      description: "Premium quality red onions, perfect for cooking",
      origin: "Maharashtra",
      shelfLife: "2-3 weeks",
    },
    {
      id: 2,
      name: "Ripe Tomatoes",
      supplier: "Fresh Vegetables Co.",
      price: 30,
      unit: "kg",
      stock: 300,
      category: "vegetables",
      image: "https://i.postimg.cc/8ckJQtCD/thumb-720-450-f-3.jpg",
      description: "Fresh, ripe tomatoes ideal for curries and salads",
      origin: "Karnataka",
      shelfLife: "1 week",
    },
    {
      id: 4,
      name: "Refined Cooking Oil",
      supplier: "Oil & Grains Hub",
      price: 150,
      unit: "liter",
      stock: 200,
      category: "oils",
      image: "https://i.postimg.cc/bvQsZKDp/71nh-PCrj5-TL-UF350-350-QL80.jpg",
      description: "High-quality refined cooking oil for all purposes",
      origin: "Gujarat",
      shelfLife: "18 months",
    },
    {
      id: 5,
      name: "Basmati Rice",
      supplier: "Oil & Grains Hub",
      price: 80,
      unit: "kg",
      stock: 150,
      category: "grains",
      image: "https://i.postimg.cc/gJsjD8H7/Tilda-Pure-1-Kg-e1658831747537.png",
      description: "Premium long-grain basmati rice",
      origin: "Punjab",
      shelfLife: "24 months",
    },
    {
      id: 7,
      name: "Fresh Paneer",
      supplier: "Dairy Fresh",
      price: 300,
      unit: "kg",
      stock: 50,
      category: "dairy",
      image: "https://i.postimg.cc/RVNh736P/40096748-3-amul-malai-fresh-paneer.png",
      description: "Soft, fresh paneer made daily",
      origin: "Local",
      shelfLife: "3 days",
    },
    {
       id: 7,
      name: "Potato",
      supplier: "Fresh Vegetables Co.",
      price: 20,
      unit: "kg",
      stock: 50,
      category: "vegetable",
      image: "https://i.postimg.cc/L69CN1zM/potato-farming.jpg",
      description: "Premium quality potatos sourced directly from farms",
      origin: "Local",
      shelfLife: "2-3 weeks" 
    }
   
  ]

  // Save to localStorage
  localStorage.setItem("suppliers", JSON.stringify(suppliers))
  localStorage.setItem("products", JSON.stringify(products))
}

function showLoginModal() {
  document.getElementById("loginModal").style.display = "block"
}

function showSignupModal(userType = "") {
  document.getElementById("signupModal").style.display = "block"
  if (userType) {
    document.getElementById("signupUserType").value = userType
  }
}

function closeModal(modalId) {
  document.getElementById(modalId).style.display = "none"
}

function handleLogin(e) {
  e.preventDefault()

  const email = document.getElementById("loginEmail").value
  const password = document.getElementById("loginPassword").value
  const userType = document.getElementById("userType").value

  // Mock authentication
  if (email && password && userType) {
    currentUser = {
      id: Date.now(),
      email: email,
      userType: userType,
      name: email.split("@")[0],
      location: "Kolkata",
    }

    localStorage.setItem("currentUser", JSON.stringify(currentUser))
    closeModal("loginModal")
    redirectToDashboard()
    showNotification("Login successful!", "success")
  } else {
    showNotification("Please fill all fields", "error")
  }
}

function handleSignup(e) {
  e.preventDefault()

  const name = document.getElementById("signupName").value
  const email = document.getElementById("signupEmail").value
  const phone = document.getElementById("signupPhone").value
  const password = document.getElementById("signupPassword").value
  const userType = document.getElementById("signupUserType").value
  const location = document.getElementById("signupLocation").value

  if (name && email && phone && password && userType && location) {
    currentUser = {
      id: Date.now(),
      name: name,
      email: email,
      phone: phone,
      userType: userType,
      location: location,
    }

    localStorage.setItem("currentUser", JSON.stringify(currentUser))
    closeModal("signupModal")
    redirectToDashboard()
    showNotification("Account created successfully!", "success")
  } else {
    showNotification("Please fill all fields", "error")
  }
}

function redirectToDashboard() {
  if (currentUser.userType === "vendor") {
    window.location.href = "vendor-dashboard.html"
  } else if (currentUser.userType === "supplier") {
    window.location.href = "supplier-dashboard.html"
  }
}

function logout() {
  localStorage.removeItem("currentUser")
  currentUser = null
  window.location.href = "index.html"
  showNotification("Logged out successfully!", "success")
}

function showNotification(message, type) {
  // Create notification element
  const notification = document.createElement("div")
  notification.className = `notification ${type}`
  notification.innerHTML = `
        <i class="fas ${type === "success" ? "fa-check-circle" : "fa-exclamation-circle"}"></i>
        <span>${message}</span>
    `

  // Add styles
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

  // Remove after 3 seconds
  setTimeout(() => {
    notification.style.animation = "slideOut 0.3s ease"
    setTimeout(() => {
      document.body.removeChild(notification)
    }, 300)
  }, 3000)
}

// Add CSS animations
const style = document.createElement("style")
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`
document.head.appendChild(style)

// Close modals when clicking outside
window.onclick = (event) => {
  const loginModal = document.getElementById("loginModal")
  const signupModal = document.getElementById("signupModal")

  if (event.target === loginModal) {
    closeModal("loginModal")
  }
  if (event.target === signupModal) {
    closeModal("signupModal")
  }
}