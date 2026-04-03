// app.js — Instagram Login Frontend Logic

// ── Config ──────────────────────────────────────────────
const API_BASE = "http://localhost:5000/api"; // Change if backend runs on different port

// ── DOM Elements ─────────────────────────────────────────
const form = document.getElementById("loginForm");
const identifierInput = document.getElementById("identifier");
const passwordInput = document.getElementById("password");
const submitBtn = document.getElementById("submitBtn");
const btnText = document.getElementById("btnText");
const btnSpinner = document.getElementById("btnSpinner");
const errorMsg = document.getElementById("errorMsg");
const statusBadge = document.getElementById("statusBadge");
const statusText = document.getElementById("statusText");
const togglePassword = document.getElementById("togglePassword");
const identifierWrapper = document.getElementById("identifierWrapper");
const passwordWrapper = document.getElementById("passwordWrapper");
const identifierIcon = document.getElementById("identifierIcon");

// ── State ─────────────────────────────────────────────────
let checkTimeout = null;
let lastCheckedIdentifier = "";
let isNewUser = null; // null = unknown, true = new, false = returning

// ── Password Toggle ───────────────────────────────────────
togglePassword.addEventListener("click", () => {
  const isHidden = passwordInput.type === "password";
  passwordInput.type = isHidden ? "text" : "password";
  togglePassword.textContent = isHidden ? "Hide" : "Show";
});

// ── Floating Labels ───────────────────────────────────────
// Add has-value class to trigger float when input is filled
[identifierInput, passwordInput].forEach((input) => {
  input.addEventListener("input", () => {
    if (input.value) {
      input.classList.add("has-value");
    } else {
      input.classList.remove("has-value");
    }
  });
});

// ── Identifier Type Detection (Live) ─────────────────────
identifierInput.addEventListener("input", () => {
  clearError();
  const value = identifierInput.value.trim();

  // Show what type they're entering
  if (value.length > 2) {
    const type = detectType(value);
    const icons = { email: "✉️", mobile: "📱", username: "👤" };
    identifierIcon.textContent = icons[type] || "";
  } else {
    identifierIcon.textContent = "";
  }

  // Auto-check if user exists after 1 second of no typing
  clearTimeout(checkTimeout);
  if (value.length >= 3) {
    checkTimeout = setTimeout(() => checkUserExists(value), 1000);
  } else {
    resetStatusBadge();
  }
});

// ── Check if user exists (for UX feedback) ───────────────
async function checkUserExists(identifier) {
  if (identifier === lastCheckedIdentifier) return;
  lastCheckedIdentifier = identifier;

  try {
    const encoded = encodeURIComponent(identifier);
    const res = await fetch(`${API_BASE}/auth/check/${encoded}`);
    const data = await res.json();

    if (data.success) {
      isNewUser = !data.exists;
      showStatusBadge(data.exists, data.identifierType);
    }
  } catch (err) {
    // Silently fail — this is just a UX hint
    console.log("Check failed:", err.message);
  }
}

function showStatusBadge(exists, type) {
  statusBadge.style.display = "block";
  if (exists) {
    // Returning user
    statusBadge.className = "status-badge returning-user";
    statusText.textContent = `✓ Welcome back! Enter your password to log in.`;
    btnText.textContent = "Log in";
  } else {
    // New user
    statusBadge.className = "status-badge new-user";
    const typeLabel = type === "email" ? "email" : type === "mobile" ? "mobile number" : "username";
    statusText.textContent = `🆕 New ${typeLabel} — we'll create your account!`;
    btnText.textContent = "Create Account & Log in";
  }
}

function resetStatusBadge() {
  statusBadge.style.display = "none";
  isNewUser = null;
  lastCheckedIdentifier = "";
  btnText.textContent = "Log in";
}

// ── Detect identifier type ────────────────────────────────
function detectType(identifier) {
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier)) return "email";
  if (/^\+?[0-9\s\-\(\)]{10,15}$/.test(identifier)) return "mobile";
  return "username";
}

// ── Form Submission ───────────────────────────────────────
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearError();

  const identifier = identifierInput.value.trim();
  const password = passwordInput.value;

  // Client-side validation
  if (!identifier) {
    showError("Please enter your phone number, username, or email.");
    identifierWrapper.classList.add("error");
    return;
  }
  if (!password) {
    showError("Please enter your password.");
    passwordWrapper.classList.add("error");
    return;
  }
  if (password.length < 6) {
    showError("Password must be at least 6 characters.");
    passwordWrapper.classList.add("error");
    return;
  }

  // Start loading
  setLoading(true);

  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identifier, password }),
    });

    const data = await response.json();

    if (data.success) {
      // Save token to localStorage
      localStorage.setItem("ig_token", data.token);
      localStorage.setItem("ig_user", JSON.stringify(data.user));

      // Show success modal
      showSuccessModal(data);
    } else {
      showError(data.message || "Something went wrong. Please try again.");
      if (data.message?.toLowerCase().includes("password")) {
        passwordWrapper.classList.add("error");
        passwordInput.focus();
      }
    }
  } catch (err) {
    showError("Cannot connect to server. Make sure the backend is running.");
    console.error("API Error:", err);
  } finally {
    setLoading(false);
  }
});

// ── Loading state ─────────────────────────────────────────
function setLoading(loading) {
  submitBtn.disabled = loading;
  btnText.style.display = loading ? "none" : "block";
  btnSpinner.style.display = loading ? "block" : "none";
}

// ── Error display ─────────────────────────────────────────
function showError(msg) {
  errorMsg.textContent = msg;
  errorMsg.style.animation = "none";
  // Trigger reflow for animation restart
  errorMsg.offsetHeight;
  errorMsg.style.animation = "shake 0.3s ease";
}

function clearError() {
  errorMsg.textContent = "";
  identifierWrapper.classList.remove("error", "success");
  passwordWrapper.classList.remove("error", "success");
}

// ── Success Modal ─────────────────────────────────────────
function showSuccessModal(data) {
  const modal = document.getElementById("successModal");
  const modalIcon = document.getElementById("modalIcon");
  const modalTitle = document.getElementById("modalTitle");
  const modalMessage = document.getElementById("modalMessage");
  const userInfoBox = document.getElementById("userInfoBox");

  const user = data.user;
  const typeLabel =
    user.identifierType === "email"
      ? "Email"
      : user.identifierType === "mobile"
      ? "Mobile"
      : "Username";

  if (data.isNewUser) {
    modalIcon.textContent = "🎉";
    modalTitle.textContent = "Account Created!";
    modalMessage.textContent =
      "Your account has been created and you're now logged in.";
  } else {
    modalIcon.textContent = "👋";
    modalTitle.textContent = "Welcome Back!";
    modalMessage.textContent = "You have been logged in successfully.";
  }

  userInfoBox.innerHTML = `
    <div><span>${typeLabel}:</span> <strong>${user.identifier}</strong></div>
    <div><span>Account Type:</span> <strong>${user.identifierType}</strong></div>
    <div><span>Member Since:</span> <strong>${new Date(user.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}</strong></div>
    <div><span>User ID:</span> <strong style="font-size:11px;color:#aaa">${user._id}</strong></div>
  `;

  modal.style.display = "flex";
}

function closeModal() {
  document.getElementById("successModal").style.display = "none";
  // In a real app, redirect to the feed page
  // window.location.href = '/feed';
}

// ── Close modal on backdrop click ────────────────────────
document.getElementById("successModal").addEventListener("click", (e) => {
  if (e.target === e.currentTarget) closeModal();
});

// ── Keyboard shortcut ─────────────────────────────────────
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeModal();
});

// ── Check if already logged in ────────────────────────────
window.addEventListener("load", () => {
  const token = localStorage.getItem("ig_token");
  const user = localStorage.getItem("ig_user");

  if (token && user) {
    const parsed = JSON.parse(user);
    // Pre-fill the identifier
    identifierInput.value = parsed.identifier || "";
    identifierInput.classList.add("has-value");
    // Show returning user message
    showStatusBadge(true, parsed.identifierType);
    lastCheckedIdentifier = parsed.identifier;
  }
});
