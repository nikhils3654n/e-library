/* E-LIBRARY demo authentication - front-end only */
const DEMO_USERS = [
  { userId: "nikhil", password: "Nikhil@123", name: "Nikhil", email: "nikhil@elibrary.demo", userType: "student" },
  { userId: "librarian", password: "Librarian@123", userType: "librarian" },
  { userId: "admin", password: "Admin@123", name: "Admin Office", email: "admin@elibrary.demo", userType: "administrator" }
];

/* Where each user type lands after a successful login */
const DASHBOARD_BY_TYPE = {
  student: "dashboard.html",
  librarian: "librarian-dashboard.html",
  administrator: "admin-dashboard.html"
};

function getUsers() {
  try { return JSON.parse(localStorage.getItem("elibraryUsers") || "[]"); }
  catch (e) { return []; }
}

function saveUsers(users) {
  localStorage.setItem("elibraryUsers", JSON.stringify(users));
}

function findUser(userId) {
  const id = String(userId || "").trim().toLowerCase();
  const demo = DEMO_USERS.find(u => u.userId === id);
  if (demo) return demo;
  return getUsers().find(u => String(u.userId).toLowerCase() === id || String(u.email).toLowerCase() === id);
}

function isLoggedIn() {
  return sessionStorage.getItem("elibraryLoggedIn") === "true";
}

function protectPage() {
  if (!isLoggedIn()) {
    window.location.replace("login.html?required=1");
    return false;
  }
  return true;
}

function showCurrentUser() {
  const name = sessionStorage.getItem("elibraryName") || "Student";
  document.querySelectorAll("[data-user-name]").forEach(el => el.textContent = name);
}

function loginUser(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const userId = form.userid.value.trim();
  const password = form.password.value;
  const userType = form.usertype.value;
  const message = document.getElementById("loginMessage");

  const user = findUser(userId);
  if (!user || user.password !== password || user.userType !== userType) {
    if (message) {
      message.textContent = "Invalid login details. Use the demo account shown below.";
      message.className = "auth-message error";
    }
    return false;
  }

  sessionStorage.setItem("elibraryLoggedIn", "true");
  sessionStorage.setItem("elibraryUserId", user.userId);
  sessionStorage.setItem("elibraryName", user.name || "Student");
  sessionStorage.setItem("elibraryUserType", user.userType);
  window.location.href = DASHBOARD_BY_TYPE[user.userType] || "dashboard.html";
  return false;
}

function logoutUser(event) {
  if (event) event.preventDefault();
  sessionStorage.clear();
  window.location.replace("login.html?logout=1");
}

function signupUser(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const message = document.getElementById("signupMessage");
  const password = form.password.value;
  const confirm = form.confirm_password.value;

  if (password.length < 6) {
    message.textContent = "Password must contain at least 6 characters.";
    message.className = "auth-message error";
    return false;
  }
  if (password !== confirm) {
    message.textContent = "Passwords do not match.";
    message.className = "auth-message error";
    return false;
  }
  if (!form.terms.checked) {
    message.textContent = "Please accept the terms and conditions.";
    message.className = "auth-message error";
    return false;
  }

  const userId = form.userid.value.trim();
  const email = form.email.value.trim().toLowerCase();
  if (DEMO_USERS.some(u => u.userId === userId.toLowerCase())) {
    message.textContent = `The User ID '${userId}' is reserved for a demo account. Choose another User ID.`;
    message.className = "auth-message error";
    return false;
  }

  const users = getUsers();
  if (users.some(u => String(u.userId).toLowerCase() === userId.toLowerCase())) {
    message.textContent = "That User ID already exists. Please choose another one.";
    message.className = "auth-message error";
    return false;
  }
  if (users.some(u => String(u.email).toLowerCase() === email)) {
    message.textContent = "That email is already registered.";
    message.className = "auth-message error";
    return false;
  }

  users.push({
    userId,
    name: `${form.first_name.value.trim()} ${form.last_name.value.trim()}`.trim(),
    email,
    password,
    userType: form.usertype.value
  });
  saveUsers(users);
  message.textContent = "Account created successfully. Redirecting to Login...";
  message.className = "auth-message success";
  setTimeout(() => { window.location.href = "login.html?signup=1"; }, 700);
  return false;
}

/* ---------- Favorites (NEW FEATURE) ----------
   Lets a student "heart" a book on Browse Books or Book Details,
   and see all saved books on the Favorites page. Stored in the
   browser only, so it is a front-end demo like the rest of auth.js. */

function getFavoriteIds() {
  try { return JSON.parse(localStorage.getItem("elibraryFavorites") || "[]"); }
  catch (e) { return []; }
}

function saveFavoriteIds(ids) {
  localStorage.setItem("elibraryFavorites", JSON.stringify(ids));
}

function isFavorite(bookId) {
  return getFavoriteIds().includes(Number(bookId));
}

/* Adds or removes the book from favorites and returns the new state */
function toggleFavorite(bookId) {
  bookId = Number(bookId);
  let ids = getFavoriteIds();
  if (ids.includes(bookId)) {
    ids = ids.filter(id => id !== bookId);
  } else {
    ids.push(bookId);
  }
  saveFavoriteIds(ids);
  return ids.includes(bookId);
}

/* ---------- Notifications (NEW FEATURE) ----------
   Adds a bell icon with a dropdown to every Student Portal page.
   It warns about books that are due soon or overdue, using the
   dueDate field from books-data.js. Nothing to configure per page -
   any page that loads auth.js gets the bell automatically. */

function daysUntil(dateStr) {
  const target = new Date(dateStr + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((target - today) / 86400000);
}

function buildNotifications() {
  const items = [];

  if (typeof BOOKS !== "undefined") {
    BOOKS.forEach(book => {
      if (!book.dueDate) return;
      const days = daysUntil(book.dueDate);
      if (days < 0) {
        items.push({ text: `"${book.title}" is overdue. Please return or renew it.`, level: "danger" });
      } else if (days <= 5) {
        items.push({ text: `"${book.title}" is due in ${days} day${days === 1 ? "" : "s"}.`, level: "warn" });
      }
    });
  }

  items.push({ text: "New books were added to the Programming category this week.", level: "" });
  return items;
}

function renderNotifications() {
  const nav = document.querySelector(".topbar .nav");
  const logoutLink = document.querySelector("[data-logout]");
  if (!nav || !logoutLink) return;

  const notifications = buildNotifications();

  const wrap = document.createElement("div");
  wrap.className = "notif-wrap";
  wrap.innerHTML = `
    <button type="button" class="notif-btn" onclick="toggleNotifDropdown(event)" aria-label="Notifications">
      &#128276;${notifications.length ? `<span class="notif-badge">${notifications.length}</span>` : ""}
    </button>
    <div class="notif-dropdown" id="notifDropdown">
      ${notifications.length
        ? notifications.map(n => `<div class="notif-item ${n.level}">${n.text}</div>`).join("")
        : `<div class="notif-empty">No notifications right now.</div>`}
    </div>
  `;
  nav.insertBefore(wrap, logoutLink);
}

function toggleNotifDropdown(event) {
  event.stopPropagation();
  const dropdown = document.getElementById("notifDropdown");
  if (dropdown) dropdown.classList.toggle("open");
}

/* Close the dropdown when clicking anywhere else on the page */
document.addEventListener("click", () => {
  const dropdown = document.getElementById("notifDropdown");
  if (dropdown) dropdown.classList.remove("open");
});

document.addEventListener("DOMContentLoaded", () => {
  showCurrentUser();
  renderNotifications();
  const logout = document.querySelector("[data-logout]");
  if (logout) logout.addEventListener("click", logoutUser);
});
