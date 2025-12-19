const transactions = []; // Global transactions history
let isLoggedIn = false; // Global auth state

document.addEventListener("DOMContentLoaded", () => {
  // Add smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const targetId = this.getAttribute("href");
      if (targetId === "#") return;

      if (targetId === "#top") {
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
        return;
      }

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        window.scrollTo({
          top: targetElement.offsetTop - 80,
          behavior: "smooth",
        });
      }
    });
  });

  // Simple search filter
  const searchInputs = document.querySelectorAll(".gameSearchInput");
  const gameCards = document.querySelectorAll(".game-card");

  searchInputs.forEach((searchInput) => {
    searchInput.addEventListener("input", (e) => {
      const searchTerm = e.target.value.toLowerCase();

      // Sync other search inputs
      searchInputs.forEach((input) => {
        if (input !== e.target) {
          input.value = e.target.value;
        }
      });

      // Scroll to games section if searching
      if (searchTerm.length > 0) {
        const gamesSection = document.getElementById("games");
        if (gamesSection && window.scrollY < gamesSection.offsetTop - 150) {
          window.scrollTo({
            top: gamesSection.offsetTop - 100,
            behavior: "smooth",
          });
        }
      }

      gameCards.forEach((card) => {
        const gameTitle = card.querySelector("h3").textContent.toLowerCase();
        if (gameTitle.includes(searchTerm)) {
          card.style.display = "block";
          card.style.animation = "fadeInUp 0.5s ease forwards";
        } else {
          card.style.display = "none";
        }
      });
    });
  });

  // Reveal animations on scroll
  const observerOptions = {
    threshold: 0.1,
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = "1";
        entry.target.style.transform = "translateY(0)";
      }
    });
  }, observerOptions);

  gameCards.forEach((card) => {
    card.style.opacity = "0";
    card.style.transform = "translateY(30px)";
    card.style.transition = "all 0.6s ease-out";
    observer.observe(card);
  });

  // Navbar and Side Menu scroll effect
  const navbar = document.querySelector(".navbar");
  const sideNav = document.getElementById("sideNavMenu");

  window.addEventListener("scroll", () => {
    // Navbar effect
    if (window.scrollY > 50) {
      navbar.style.padding = "10px 0";
      navbar.style.background = "rgba(10, 11, 30, 0.95)";
    } else {
      navbar.style.padding = "20px 0";
      navbar.style.background = "rgba(10, 11, 30, 0.8)";
    }

    // Side menu visibility
    if (window.scrollY > 500) {
      sideNav.classList.add("visible");
    } else {
      sideNav.classList.remove("visible");
    }

    // Update active state for side menu items
    const sections = [
      "top",
      "promo",
      "games",
      "entertainment",
      "vouchers",
      "rewards",
      "events",
    ];
    let current = "";

    sections.forEach((section) => {
      const element = document.getElementById(section);
      if (element) {
        const sectionTop = element.offsetTop;
        const sectionHeight = element.clientHeight;
        if (window.pageYOffset >= sectionTop - 150) {
          current = section;
        }
      }
    });

    document.querySelectorAll(".side-nav-item").forEach((item) => {
      item.classList.remove("active");
      if (item.getAttribute("href").substring(1) === current) {
        item.classList.add("active");
      }
    });
  });
});

// Voucher Copy Function
function copyVoucher(code) {
  navigator.clipboard.writeText(code).then(() => {
    const btn = event.target;
    const originalText = btn.textContent;
    btn.textContent = "Berhasil!";
    btn.style.background = "#f093fb";

    setTimeout(() => {
      btn.textContent = originalText;
      btn.style.background = "";
    }, 2000);
  });
}

// Rewards Section Logic
function claimDaily() {
  const btn = event.target;
  if (btn.classList.contains("claimed")) return;

  btn.textContent = "Klaim Berhasil! (+20 Points)";
  btn.classList.add("claimed");
  btn.style.background = "rgba(255, 255, 255, 0.1)";
  btn.style.color = "var(--text-muted)";
  btn.style.borderColor = "var(--glass-border)";
  btn.disabled = true;

  // Visual update for the current day box
  const currentDay = document.querySelector(".day-box.current");
  if (currentDay) {
    currentDay.classList.remove("current");
    currentDay.classList.add("checked");
    currentDay.innerHTML = `<span class="day-num">${
      currentDay.querySelector(".day-num").textContent
    }</span><i class="fas fa-check"></i>`;
  }

  // Update points display (mock update)
  const pointValue = document.querySelector(".point-value");
  if (pointValue) {
    let currentPoints = parseInt(pointValue.textContent.replace(",", ""));
    pointValue.textContent = (currentPoints + 20).toLocaleString();
  }
}

// Add event listeners for mission buttons
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".btn-mission:not(.done)").forEach((btn) => {
    btn.addEventListener("click", function () {
      this.textContent = "Berhasil!";
      this.classList.add("done");
      this.disabled = true;

      const pointValue = document.querySelector(".point-value");
      if (pointValue) {
        let currentPoints = parseInt(pointValue.textContent.replace(",", ""));
        pointValue.textContent = (currentPoints + 50).toLocaleString();
      }
    });
  });
});

// Top Up Modal Logic
const modal = document.getElementById("topupModal");
const closeModal = document.querySelector(".close-modal");
let currentSelectedNominal = "";
let currentSelectedPayment = "";

function openTopUpModal(button) {
  if (!isLoggedIn) {
    showToast("Silahkan masuk terlebih dahulu untuk melakukan Top Up");
    openAuthModal("signup"); // Default to signup as requested for new users
    return;
  }
  const gameCard = button.closest(".game-card");
  const gameTitle = gameCard.querySelector("h3").textContent;
  document.getElementById("modalGameTitle").textContent = `Top Up ${gameTitle}`;
  modal.style.display = "block";
  document.body.style.overflow = "hidden"; // Prevent scroll
}

closeModal.onclick = () => {
  modal.style.display = "none";
  document.body.style.overflow = "auto";
};

window.onclick = (event) => {
  if (event.target == modal) {
    modal.style.display = "none";
    document.body.style.overflow = "auto";
  }
};

function selectNominal(element, val) {
  document
    .querySelectorAll(".nominal-item")
    .forEach((el) => el.classList.remove("active"));
  element.classList.add("active");
  currentSelectedNominal = val;
}

function selectPayment(element, method) {
  document
    .querySelectorAll(".payment-item")
    .forEach((el) => el.classList.remove("active"));
  element.classList.add("active");
  currentSelectedPayment = method;
}

document.getElementById("topupForm").onsubmit = (e) => {
  e.preventDefault();
  const userId = document.getElementById("userId").value;
  const contactInfo = document.getElementById("contactInfo").value;

  if (!currentSelectedNominal || !currentSelectedPayment) {
    alert("Silahkan pilih nominal dan metode pembayaran!");
    return;
  }

  // Mock Success Message
  alert(
    `Berhasil! Pesanan untuk ID ${userId} (${currentSelectedNominal}) via ${currentSelectedPayment} sedang diproses. Bukti pembayaran akan dikirim ke ${contactInfo}.`
  );
  // Create Transaction Record
  const transaction = {
    id: "TRX-" + Date.now().toString().slice(-6),
    type: "Top Up",
    item: `Top Up ${document
      .getElementById("modalGameTitle")
      .textContent.replace("Top Up ", "")} (${currentSelectedNominal})`,
    price: currentSelectedNominal, // In a real app, this would be the price value
    date: new Date(),
    status: "Berhasil",
    payment: currentSelectedPayment,
  };
  transactions.unshift(transaction); // Add to beginning

  // RESET FORM
  modal.style.display = "none";
  document.body.style.overflow = "auto";
  e.target.reset();

  // Reset selection states
  document
    .querySelectorAll(".nominal-item, .payment-item")
    .forEach((el) => el.classList.remove("active"));
  currentSelectedNominal = "";
  currentSelectedPayment = "";

  // Update Points as a reward for top up
  const pointValue = document.querySelector(".point-value");
  if (pointValue) {
    let currentPoints = parseInt(pointValue.textContent.replace(",", ""));
    pointValue.textContent = (currentPoints + 500).toLocaleString();
  }

  // Mock Success Message (Moved after logic to ensure smoother UX, or keep before)
  showToast(
    `Berhasil! Pesanan untuk ID ${userId} (${currentSelectedNominal}) via ${currentSelectedPayment} sedang diproses.`
  );
};

// ==========================================
// Entertainment Subscription Logic
// ==========================================

const subModal = document.getElementById("subModal");
const closeSubModal = document.querySelector(".close-sub-modal");
let currentSelectedPlan = "";
let currentSelectedSubPayment = "";

// Function to open Subscription Modal
function openSubscriptionModal(button) {
  if (!isLoggedIn) {
    showToast("Silahkan masuk terlebih dahulu untuk berlangganan");
    openAuthModal("signup"); // Default to signup as requested for new users
    return;
  }
  const card = button.closest(".game-card");
  const serviceName = card.querySelector("h3").textContent;

  // Update Modal Title
  const modalTitle = document.getElementById("subTitle");
  modalTitle.textContent = `Langganan ${serviceName}`;

  subModal.style.display = "block";
  document.body.style.overflow = "hidden";
}

// Close Subscription Modal
if (closeSubModal) {
  closeSubModal.onclick = () => {
    subModal.style.display = "none";
    document.body.style.overflow = "auto";
  };
}

// Close when clicking outside
window.addEventListener("click", (event) => {
  if (event.target == subModal) {
    subModal.style.display = "none";
    document.body.style.overflow = "auto";
  }
});

// Select Plan Function
function selectPlan(element, planName) {
  // Remove active class from all plans
  document.querySelectorAll(".plan-item").forEach((el) => {
    el.classList.remove("active");
  });

  // Add active class to clicked plan
  element.classList.add("active");
  currentSelectedPlan = planName;
}

// Select Payment Function for Subscription
function selectSubPayment(element, paymentMethod) {
  // Remove active class from all payment items in the sub modal
  const paymentGrid = element.closest(".payment-grid");
  paymentGrid.querySelectorAll(".payment-item").forEach((el) => {
    el.classList.remove("active");
  });

  // Add active class to clicked payment
  element.classList.add("active");
  currentSelectedSubPayment = paymentMethod;
}

// Handle Subscription Form Submit
const subForm = document.getElementById("subForm");
if (subForm) {
  subForm.onsubmit = (e) => {
    e.preventDefault();
    const accountEmail = document.getElementById("subAccount").value;

    if (!currentSelectedPlan || !currentSelectedSubPayment) {
      alert("Silahkan pilih paket langganan dan metode pembayaran!");
      return;
    }

    // Create Transaction Record
    const transaction = {
      id: "SUB-" + Date.now().toString().slice(-6),
      type: "Langganan",
      item: `Langganan ${document
        .getElementById("subTitle")
        .textContent.replace("Langganan ", "")} (${currentSelectedPlan})`,
      price: currentSelectedPlan,
      date: new Date(),
      status: "Berhasil",
      payment: currentSelectedSubPayment,
    };
    transactions.unshift(transaction);

    // Mock Success Message
    alert(
      `Langganan Berhasil!\n\nAkun: ${accountEmail}\nPaket: ${currentSelectedPlan}\nPembayaran: ${currentSelectedSubPayment}\n\nSilahkan cek email anda untuk detail aktivasi.`
    );

    // Close modal and reset
    subModal.style.display = "none";
    document.body.style.overflow = "auto";
    e.target.reset();

    // Reset selections
    document.querySelectorAll(".plan-item, .payment-item").forEach((el) => {
      el.classList.remove("active");
    });
    currentSelectedPlan = "";
    currentSelectedSubPayment = "";

    // Give rewards points
    const pointValue = document.querySelector(".point-value");
    if (pointValue) {
      let currentPoints = parseInt(pointValue.textContent.replace(",", ""));
      pointValue.textContent = (currentPoints + 150).toLocaleString();
    }
  };
}

// ==========================================
// JavaScript relates to carousel removed as it is now a static grid.

// ==========================================
// Event Logic
// ==========================================
function registerEvent(eventName) {
  alert(
    `Berhasil mendaftar untuk event: ${eventName}!\nSilahkan cek email anda untuk instruksi selanjutnya.`
  );
}

// ==========================================
// FAQ Accordion Logic
// ==========================================
const faqItems = document.querySelectorAll(".faq-item");

faqItems.forEach((item) => {
  const question = item.querySelector(".faq-question");
  const answer = item.querySelector(".faq-answer");

  question.addEventListener("click", () => {
    // Check if current item is already active
    const isActive = item.classList.contains("active");

    // Close all other items
    faqItems.forEach((otherItem) => {
      otherItem.classList.remove("active");
      otherItem.querySelector(".faq-answer").style.maxHeight = null;
    });

    // If it wasn't active, open it
    if (!isActive) {
      item.classList.add("active");
      answer.style.maxHeight = answer.scrollHeight + "px";
    }
  });
});

// ==========================================
// Floating Chat Widget Logic
// ==========================================
function toggleChat() {
  const widget = document.querySelector(".chat-widget");
  widget.classList.toggle("active");
}

function toggleChatInfo() {
  // Opens the chat widget from other buttons (e.g. support section)
  const widget = document.querySelector(".chat-widget");
  if (!widget.classList.contains("active")) {
    widget.classList.add("active");
  }
  // Scroll to widget if needed (optional)
}

function handleChatInput(event) {
  if (event.key === "Enter") {
    sendChatMessage();
  }
}

function sendChatMessage() {
  const input = document.getElementById("chatInput");
  const message = input.value.trim();
  const chatBody = document.getElementById("chatBody");

  if (message) {
    // Add User Message
    const userMsgHTML = `
            <div class="chat-message user">
                <p>${message}</p>
                <span class="chat-time">Just now</span>
            </div>
        `;
    chatBody.insertAdjacentHTML("beforeend", userMsgHTML);

    // Clear input
    input.value = "";

    // Auto scroll to bottom
    chatBody.scrollTop = chatBody.scrollHeight;

    // Mock Bot Response (Simulated Delay)
    setTimeout(() => {
      const botResponses = [
        "Terima kasih telah menghubungi kami. Tim CS kami akan segera membalas pesan Anda.",
        "Mohon ditunggu sebentar ya kak, kami sedang mengecek antrian.",
        "Apakah ada kendala dengan pembayaran?",
        "Untuk top up yang belum masuk, mohon lampirkan bukti transfer ya.",
      ];
      const randomResponse =
        botResponses[Math.floor(Math.random() * botResponses.length)];

      const botMsgHTML = `
                <div class="chat-message bot">
                    <p>${randomResponse}</p>
                    <span class="chat-time">Just now</span>
                </div>
            `;
      chatBody.insertAdjacentHTML("beforeend", botMsgHTML);
      chatBody.scrollTop = chatBody.scrollHeight;
    }, 1500);
  }
}

// ==========================================
// Hamburger Menu Logic
// ==========================================
function toggleMenu() {
  const navLinks = document.getElementById("navLinks");
  const hamburger = document.querySelector(".hamburger-menu");
  const icon = hamburger.querySelector("i");

  navLinks.classList.toggle("active");
  hamburger.classList.toggle("active");

  if (navLinks.classList.contains("active")) {
    icon.classList.remove("fa-bars");
    icon.classList.add("fa-times");
    document.body.style.overflow = "hidden";
  } else {
    icon.classList.remove("fa-times");
    icon.classList.add("fa-bars");
    document.body.style.overflow = "auto";
  }
}

// Close mobile menu if clicking outside
window.addEventListener("click", (event) => {
  const navLinks = document.getElementById("navLinks");
  const hamburger = document.querySelector(".hamburger-menu");

  if (
    navLinks &&
    navLinks.classList.contains("active") &&
    !navLinks.contains(event.target) &&
    (!hamburger || !hamburger.contains(event.target))
  ) {
    navLinks.classList.remove("active");
    hamburger.classList.remove("active");
    const icon = hamburger.querySelector("i");
    if (icon) {
      icon.classList.remove("fa-times");
      icon.classList.add("fa-bars");
    }
    document.body.style.overflow = "auto";
  }
});

// ==========================================
// Language & Location Selector Logic
// ==========================================

function toggleLangMenu(event) {
  event.stopPropagation();
  const btn = event.currentTarget;
  // Find the dropdown that is a sibling of the clicked button
  const selectorContainer = btn.closest(".lang-region-selector");
  const dropdown = selectorContainer.querySelector(".lang-dropdown");

  if (dropdown) {
    dropdown.classList.toggle("show");
    btn.classList.toggle("active");
  }
}

function selectOption(element) {
  const type = element.getAttribute("data-type");
  const value = element.getAttribute("data-value");
  const parentGroup = element.closest(".dropdown-options");
  const selectorContainer = element.closest(".lang-region-selector");

  // Remove active class from siblings in the same group
  parentGroup.querySelectorAll(".dropdown-item").forEach((item) => {
    item.classList.remove("active");
  });

  // Add active class to selected item
  element.classList.add("active");

  // Update UI (Button Text)
  // We need to update BOTH desktop and mobile buttons to keep them in sync
  const allLangButtons = document.querySelectorAll(".current-lang");
  if (type === "lang") {
    allLangButtons.forEach((span) => (span.textContent = value));
    console.log(`Language changed to: ${value}`);
  } else if (type === "loc") {
    console.log(`Location changed to: ${value}`);
  }

  // Feedback
  const toastText =
    type === "lang"
      ? `Bahasa diubah ke ${element.innerText.trim()}`
      : `Lokasi diatur ke ${element.innerText.trim()}`;
  showToast(toastText);
}

// Close Dropdown when clicking outside
window.addEventListener("click", (event) => {
  // Close all open dropdowns if click is outside
  document.querySelectorAll(".lang-region-selector").forEach((container) => {
    const dropdown = container.querySelector(".lang-dropdown");
    const btn = container.querySelector(".lang-region-btn");

    if (dropdown && dropdown.classList.contains("show")) {
      if (!container.contains(event.target)) {
        dropdown.classList.remove("show");
        if (btn) btn.classList.remove("active");
      }
    }
  });
});

// Helper: Simple Toast Notification
function showToast(message) {
  // Check if toast container exists, if not create it
  let toastContainer = document.querySelector(".toast-container");
  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.className = "toast-container";
    Object.assign(toastContainer.style, {
      position: "fixed",
      bottom: "20px",
      left: "50%",
      transform: "translateX(-50%)",
      zIndex: "3000",
      display: "flex",
      flexDirection: "column",
      gap: "10px",
    });
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement("div");
  toast.textContent = message;
  Object.assign(toast.style, {
    background: "rgba(10, 11, 30, 0.9)",
    border: "1px solid var(--primary)",
    color: "#fff",
    padding: "12px 24px",
    borderRadius: "8px",
    boxShadow: "0 5px 15px rgba(0,0,0,0.3)",
    backdropFilter: "blur(10px)",
    fontSize: "0.9rem",
    opacity: "0",
    transition: "all 0.3s ease",
    transform: "translateY(20px)",
  });

  toastContainer.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => {
    toast.style.opacity = "1";
    toast.style.transform = "translateY(0)";
  });

  // Remove after 3s
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(20px)";
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3000);
}
// ==========================================
// History Modal Logic
// ==========================================
const historyModal = document.getElementById("historyModal");
const closeHistoryBtn = document.querySelector(".close-history");

function openHistoryModal() {
  renderHistory();
  historyModal.style.display = "block";
  document.body.style.overflow = "hidden";
}

if (closeHistoryBtn) {
  closeHistoryBtn.onclick = () => {
    historyModal.style.display = "none";
    document.body.style.overflow = "auto";
  };
}

window.addEventListener("click", (event) => {
  if (event.target == historyModal) {
    historyModal.style.display = "none";
    document.body.style.overflow = "auto";
  }
});

function renderHistory() {
  const historyList = document.getElementById("historyList");
  historyList.innerHTML = "";

  if (transactions.length === 0) {
    historyList.innerHTML = `
      <div class="empty-history">
        <i class="fas fa-receipt"></i>
        <p>Belum ada riwayat transaksi</p>
      </div>
    `;
    return;
  }

  transactions.forEach((trx) => {
    const dateStr = trx.date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const itemHTML = `
      <div class="history-item">
        <div class="history-details">
          <h4>${trx.type}</h4>
          <p>${trx.item}</p>
          <p class="text-sm" style="color: var(--text-muted); font-size: 0.8rem;">
            <i class="far fa-clock"></i> ${dateStr}
          </p>
        </div>
        <div class="history-status">
          <span class="status-badge success">${trx.status}</span>
          <span class="price-tag">${trx.payment}</span>
        </div>
      </div>
    `;
    historyList.insertAdjacentHTML("beforeend", itemHTML);
  });
}

// ==========================================
// Auth Modal & Login Logic
// ==========================================
const authModal = document.getElementById("authModal");
let isSignUpMode = false;

function openAuthModal(mode = "signin") {
  if (mode === "signup") {
    isSignUpMode = true;
    updateAuthUI();
  } else {
    isSignUpMode = false;
    updateAuthUI();
  }
  authModal.style.display = "block";
  document.body.style.overflow = "hidden";
}

function closeAuthModal() {
  authModal.style.display = "none";
  document.body.style.overflow = "auto";
}

function updateAuthUI() {
  const title = document.getElementById("authTitle");
  const subtitle = document.getElementById("authSubtitle");
  const signInForm = document.getElementById("signInForm");
  const signUpForm = document.getElementById("signUpForm");
  const switchText = document.getElementById("authSwitchText");

  if (isSignUpMode) {
    title.textContent = "Buat Akun Baru";
    subtitle.textContent = "Daftar untuk menikmati layanan lengkap";
    signInForm.style.display = "none";
    signUpForm.style.display = "flex";
    switchText.innerHTML = `Sudah punya akun? <a href="#" onclick="toggleAuthMode(event)">Masuk Sekarang</a>`;
  } else {
    title.textContent = "Selamat Datang Kembali";
    subtitle.textContent = "Silahkan masuk ke akun Anda";
    signInForm.style.display = "flex";
    signUpForm.style.display = "none";
    switchText.innerHTML = `Belum punya akun? <a href="#" onclick="toggleAuthMode(event)">Daftar Gratis</a>`;
  }
}

function toggleAuthMode(event) {
  if (event) event.preventDefault();
  isSignUpMode = !isSignUpMode;
  updateAuthUI();
}

function updateLoggedInUI(name, email = null) {
  isLoggedIn = true;

  // Update Nav Links (Desktop & Mobile)
  const navAkun = document.getElementById("navAkun");
  const mobileNavAkun = document.getElementById("mobileNavAkun");

  if (navAkun) {
    navAkun.innerHTML = `<i class="fas fa-user-circle"></i> ${name}`;
    navAkun.onclick = (e) => {
      e.preventDefault();
      openProfileModal(name, email);
    };
  }

  if (mobileNavAkun) {
    mobileNavAkun.innerHTML = `<i class="fas fa-user-circle"></i> Profile`;
    mobileNavAkun.onclick = (e) => {
      e.preventDefault();
      toggleMenu();
      openProfileModal(name, email);
    };
  }

  // Update Rewards Section
  const rewardsName = document.getElementById("rewardsUserName");
  if (rewardsName) rewardsName.textContent = name;
  const rewardsTier = document.getElementById("rewardsUserTier");
  if (rewardsTier)
    rewardsTier.innerHTML = `<span class="tier-badge gold">Gold Tier</span>`;

  // Update user-info div in rewards
  const userInfo = document.querySelector(".rewards-section .user-info");
  if (userInfo) {
    userInfo.onclick = (e) => {
      showToast(`Halo ${name}, Anda berada di Gold Tier!`);
    };
  }
}

function resetAuthUI() {
  isLoggedIn = false;

  // Reset Nav Links
  const navAkun = document.getElementById("navAkun");
  const mobileNavAkun = document.getElementById("mobileNavAkun");

  if (navAkun) {
    navAkun.innerHTML = `<i class="fas fa-user"></i> Akun`;
    navAkun.onclick = () => openAuthModal();
  }

  if (mobileNavAkun) {
    mobileNavAkun.innerHTML = `<i class="fas fa-user"></i> Akun`;
    mobileNavAkun.onclick = () => {
      openAuthModal();
      toggleMenu();
    };
  }

  const rewardsName = document.getElementById("rewardsUserName");
  if (rewardsName) rewardsName.textContent = "Gamer Pro";
  const rewardsTier = document.getElementById("rewardsUserTier");
  if (rewardsTier)
    rewardsTier.innerHTML = `<span class="tier-badge silver">Silver Tier</span>`;

  const userInfo = document.querySelector(".rewards-section .user-info");
  if (userInfo) {
    userInfo.onclick = () => openAuthModal();
  }
}

function logout() {
  isLoggedIn = false;

  // Clear stored Google user data
  localStorage.removeItem("googleUser");

  showToast("Berhasil keluar");
  resetAuthUI();

  // If Google Login was used
  if (window.google && google.accounts && google.accounts.id) {
    google.accounts.id.disableAutoSelect();
  }
}

// Google Login Callback
function handleCredentialResponse(response) {
  // In a real app, you would send the response.credential to your backend
  console.log("Encoded JWT ID token: " + response.credential);

  // Decoding locally for demonstration (mock)
  try {
    const payload = JSON.parse(atob(response.credential.split(".")[1]));

    // Store user data for profile display
    const userData = {
      name: payload.name,
      email: payload.email,
      picture: payload.picture,
      sub: payload.sub, // Google user ID
    };

    // In a real app, store this in localStorage or send to backend
    localStorage.setItem("googleUser", JSON.stringify(userData));

    showToast(`Selamat datang, ${payload.name}!`);
    isLoggedIn = true;
    closeAuthModal();
    updateLoggedInUI(payload.name, payload.email);

    console.log("Google login successful:", userData);
  } catch (err) {
    console.error("Error decoding Google token", err);
    showToast("Gagal masuk dengan Google. Silakan coba lagi.");
  }
}

function openProfileModal(name, email = null) {
  const profileModal = document.getElementById("profileModal");
  const pName = document.getElementById("profileName");
  const pEmail = document.getElementById("profileEmail");

  if (pName) pName.textContent = name;
  if (pEmail) {
    // Use actual email from Google login or generate mock email
    pEmail.textContent =
      email || name.toLowerCase().replace(" ", "") + "@email.com";
  }

  if (profileModal) {
    profileModal.style.display = "block";
    document.body.style.overflow = "hidden";
  }
}

function closeProfileModal() {
  const profileModal = document.getElementById("profileModal");
  if (profileModal) {
    profileModal.style.display = "none";
    document.body.style.overflow = "auto";
  }
}

// Close Modals on outside click
window.addEventListener("click", (event) => {
  const authModal = document.getElementById("authModal");
  const profileModal = document.getElementById("profileModal");
  const historyModal = document.getElementById("historyModal");
  const topupModal = document.getElementById("topupModal");
  const subModal = document.getElementById("subModal");

  if (event.target == authModal) closeAuthModal();
  if (event.target == profileModal) closeProfileModal();
  if (event.target == historyModal) {
    historyModal.style.display = "none";
    document.body.style.overflow = "auto";
  }
  if (event.target == topupModal) {
    topupModal.style.display = "none";
    document.body.style.overflow = "auto";
  }
  if (event.target == subModal) {
    subModal.style.display = "none";
    document.body.style.overflow = "auto";
  }
});

// Form Submissions (Mock)
const signInFormEl = document.getElementById("signInForm");
if (signInFormEl) {
  signInFormEl.onsubmit = (e) => {
    e.preventDefault();
    const email = document.getElementById("signInEmail").value;
    isLoggedIn = true;
    showToast(`Berhasil masuk sebagai ${email}`);

    updateLoggedInUI(email.split("@")[0]);
    closeAuthModal();
  };
}

const signUpFormEl = document.getElementById("signUpForm");
if (signUpFormEl) {
  signUpFormEl.onsubmit = (e) => {
    e.preventDefault();
    const name = document.getElementById("signUpName").value;
    isLoggedIn = true;
    showToast(`Akun ${name} berhasil didaftarkan!`);

    updateLoggedInUI(name.split(" ")[0]);
    closeAuthModal();
  };
}

// Search Focus for Mobile
function focusSearch() {
  const searchInput = document.getElementById("gameSearch");
  if (searchInput) {
    searchInput.focus();
  }
}
