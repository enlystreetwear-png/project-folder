const STORAGE_KEY = "dailyExpenseRecords";
const ROLE_KEY = "dailyExpenseRole";

const ACCOUNTANT_PASSWORD = "1234";
const OWNER_PASSWORD = "5678";

let records = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
let currentRole = localStorage.getItem(ROLE_KEY) || "";

const today = new Date().toISOString().split("T")[0];

/* ---------- Login Elements ---------- */
const loginPage = document.getElementById("loginPage");
const accountantApp = document.getElementById("accountantApp");
const ownerApp = document.getElementById("ownerApp");
const accountantLoginBtn = document.getElementById("accountantLoginBtn");
const ownerLoginBtn = document.getElementById("ownerLoginBtn");
const loginForm = document.getElementById("loginForm");
const loginRoleInput = document.getElementById("loginRole");
const passwordInput = document.getElementById("passwordInput");
const loginMessage = document.getElementById("loginMessage");

/* ---------- Accountant Elements ---------- */
const purchaseForm = document.getElementById("purchaseForm");
const salaryForm = document.getElementById("salaryForm");
const expenseForm = document.getElementById("expenseForm");
const recordsTable = document.getElementById("recordsTable");
const filterType = document.getElementById("filterType");
const filterDate = document.getElementById("filterDate");

/* ---------- Owner Elements ---------- */
const ownerDate = document.getElementById("ownerDate");
const ownerSearchBtn = document.getElementById("ownerSearchBtn");
const ownerRecordsTable = document.getElementById("ownerRecordsTable");

/* ---------- Default Dates ---------- */
setValueIfExists("purchaseDate", today);
setValueIfExists("salaryDate", today);
setValueIfExists("expenseDate", today);
setValueIfExists("ownerDate", today);

/* ---------- Login Events ---------- */
accountantLoginBtn.addEventListener("click", () => {
  loginRoleInput.value = "accountant";
  loginMessage.textContent = "Selected: Accountant";
});

ownerLoginBtn.addEventListener("click", () => {
  loginRoleInput.value = "owner";
  loginMessage.textContent = "Selected: Owner";
});

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const selectedRole = loginRoleInput.value;
  const password = passwordInput.value.trim();

  if (!selectedRole) {
    loginMessage.textContent = "Please select login type.";
    return;
  }

  if (selectedRole === "accountant" && password === ACCOUNTANT_PASSWORD) {
    currentRole = "accountant";
    localStorage.setItem(ROLE_KEY, currentRole);
    showAppByRole();
    return;
  }

  if (selectedRole === "owner" && password === OWNER_PASSWORD) {
    currentRole = "owner";
    localStorage.setItem(ROLE_KEY, currentRole);
    showAppByRole();
    return;
  }

  loginMessage.textContent = "Wrong password.";
});

/* ---------- Accountant Events ---------- */
document.querySelectorAll(".tab-btn").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach((btn) => btn.classList.remove("active"));
    document.querySelectorAll(".tab-panel").forEach((panel) => panel.classList.add("hidden"));

    button.classList.add("active");
    document.getElementById(button.dataset.tab).classList.remove("hidden");
  });
});

purchaseForm.addEventListener("submit", addPurchase);
salaryForm.addEventListener("submit", addSalary);
expenseForm.addEventListener("submit", addExpense);
filterType.addEventListener("change", renderRecords);
filterDate.addEventListener("change", renderRecords);

/* ---------- Owner Events ---------- */
ownerSearchBtn.addEventListener("click", renderOwnerRecords);
ownerDate.addEventListener("change", renderOwnerRecords);

/* ---------- Core ---------- */
function setValueIfExists(id, value) {
  const el = document.getElementById(id);
  if (el) el.value = value;
}

function saveRecords() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  renderRecords();
  renderSummary();
  renderOwnerRecords();
}

function logout() {
  currentRole = "";
  localStorage.removeItem(ROLE_KEY);
  passwordInput.value = "";
  loginRoleInput.value = "";
  loginMessage.textContent = "";
  showAppByRole();
}

function showAppByRole() {
  loginPage.classList.add("hidden");
  accountantApp.classList.add("hidden");
  ownerApp.classList.add("hidden");

  if (currentRole === "accountant") {
    accountantApp.classList.remove("hidden");
    renderRecords();
    renderSummary();
    return;
  }

  if (currentRole === "owner") {
    ownerApp.classList.remove("hidden");
    renderOwnerRecords();
    return;
  }

  loginPage.classList.remove("hidden");
}

function formatCurrency(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN")}`;
}

function readImage(file) {
  return new Promise((resolve) => {
    if (!file) {
      resolve("");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => resolve(event.target.result);
    reader.readAsDataURL(file);
  });
}

async function addPurchase(event) {
  event.preventDefault();

  const item = document.getElementById("purchaseItem").value.trim();
  const qty = Number(document.getElementById("purchaseQty").value);
  const price = Number(document.getElementById("purchasePrice").value);
  const supplier = document.getElementById("purchaseSupplier").value.trim();
  const date = document.getElementById("purchaseDate").value;
  const billFile = document.getElementById("purchaseBill").files[0];
  const billImage = await readImage(billFile);

  records.unshift({
    id: crypto.randomUUID(),
    type: "Purchase",
    title: item,
    amount: qty * price,
    date,
    details: `Qty: ${qty}, Unit Price: ${formatCurrency(price)}, Supplier: ${supplier || "-"}`,
    billImage
  });

  purchaseForm.reset();
  setValueIfExists("purchaseDate", today);
  saveRecords();
}

async function addSalary(event) {
  event.preventDefault();

  const worker = document.getElementById("salaryWorker").value.trim();
  const amount = Number(document.getElementById("salaryAmount").value);
  const salaryType = document.getElementById("salaryType").value;
  const date = document.getElementById("salaryDate").value;
  const note = document.getElementById("salaryNote").value.trim();
  const billFile = document.getElementById("salaryBill").files[0];
  const billImage = await readImage(billFile);

  records.unshift({
    id: crypto.randomUUID(),
    type: "Salary",
    title: worker,
    amount,
    date,
    details: `Type: ${salaryType}, Note: ${note || "-"}`,
    billImage
  });

  salaryForm.reset();
  setValueIfExists("salaryDate", today);
  saveRecords();
}

async function addExpense(event) {
  event.preventDefault();

  const category = document.getElementById("expenseCategory").value;
  const amount = Number(document.getElementById("expenseAmount").value);
  const date = document.getElementById("expenseDate").value;
  const note = document.getElementById("expenseNote").value.trim();
  const billFile = document.getElementById("expenseBill").files[0];
  const billImage = await readImage(billFile);

  records.unshift({
    id: crypto.randomUUID(),
    type: "Expense",
    title: category,
    amount,
    date,
    details: note || "-",
    billImage
  });

  expenseForm.reset();
  setValueIfExists("expenseDate", today);
  saveRecords();
}

function deleteRecord(id) {
  records = records.filter((record) => record.id !== id);
  saveRecords();
}

function editRecord(id) {
  const record = records.find((item) => item.id === id);
  if (!record) return;

  const newTitle = prompt("Enter name/category", record.title);
  if (newTitle === null) return;

  const newAmount = prompt("Enter amount", record.amount);
  if (newAmount === null) return;

  const newDate = prompt("Enter date (YYYY-MM-DD)", record.date);
  if (newDate === null) return;

  const newDetails = prompt("Enter details", record.details);
  if (newDetails === null) return;

  record.title = newTitle.trim();
  record.amount = Number(newAmount);
  record.date = newDate;
  record.details = newDetails.trim();

  saveRecords();
}

function getFilteredRecords() {
  const selectedType = filterType.value;
  const selectedDate = filterDate.value;

  return records.filter((record) => {
    const typeMatch = selectedType === "All" || record.type === selectedType;
    const dateMatch = !selectedDate || record.date === selectedDate;
    return typeMatch && dateMatch;
  });
}

function renderRecords() {
  const filtered = getFilteredRecords();

  if (filtered.length === 0) {
    recordsTable.innerHTML = `<tr><td colspan="7" class="empty">No records found.</td></tr>`;
    return;
  }

  recordsTable.innerHTML = filtered
    .map(
      (record) => `
        <tr>
          <td><span class="badge">${record.type}</span></td>
          <td>${escapeHtml(record.title)}</td>
          <td>${formatCurrency(record.amount)}</td>
          <td>${record.date}</td>
          <td>${escapeHtml(record.details)}</td>
          <td>
            ${
              record.billImage
                ? `<img src="${record.billImage}" alt="Bill" class="bill-thumb">`
                : "-"
            }
          </td>
          <td>
            <div class="action-group">
              <button class="edit-btn" onclick="editRecord('${record.id}')">Edit</button>
              <button class="delete-btn" onclick="deleteRecord('${record.id}')">Delete</button>
            </div>
          </td>
        </tr>
      `
    )
    .join("");
}

function renderSummary() {
  const purchaseTotal = records
    .filter((record) => record.type === "Purchase")
    .reduce((sum, record) => sum + record.amount, 0);

  const salaryTotal = records
    .filter((record) => record.type === "Salary")
    .reduce((sum, record) => sum + record.amount, 0);

  const expenseTotal = records
    .filter((record) => record.type === "Expense")
    .reduce((sum, record) => sum + record.amount, 0);

  const grandTotal = purchaseTotal + salaryTotal + expenseTotal;

  document.getElementById("purchaseTotal").textContent = formatCurrency(purchaseTotal);
  document.getElementById("salaryTotal").textContent = formatCurrency(salaryTotal);
  document.getElementById("expenseTotal").textContent = formatCurrency(expenseTotal);
  document.getElementById("grandTotal").textContent = formatCurrency(grandTotal);
}

function renderOwnerRecords() {
  const selectedDate = ownerDate.value;

  const filtered = records.filter((record) => record.date === selectedDate);

  if (filtered.length === 0) {
    ownerRecordsTable.innerHTML = `<tr><td colspan="6" class="empty">No records found for selected date.</td></tr>`;
    setOwnerTotals([], [], []);
    return;
  }

  ownerRecordsTable.innerHTML = filtered
    .map(
      (record) => `
        <tr>
          <td><span class="badge">${record.type}</span></td>
          <td>${escapeHtml(record.title)}</td>
          <td>${formatCurrency(record.amount)}</td>
          <td>${record.date}</td>
          <td>${escapeHtml(record.details)}</td>
          <td>
            ${
              record.billImage
                ? `<img src="${record.billImage}" alt="Bill" class="bill-thumb">`
                : "-"
            }
          </td>
        </tr>
      `
    )
    .join("");

  const purchases = filtered.filter((record) => record.type === "Purchase");
  const salaries = filtered.filter((record) => record.type === "Salary");
  const expenses = filtered.filter((record) => record.type === "Expense");

  setOwnerTotals(purchases, salaries, expenses);
}

function setOwnerTotals(purchases, salaries, expenses) {
  const purchaseTotal = purchases.reduce((sum, item) => sum + item.amount, 0);
  const salaryTotal = salaries.reduce((sum, item) => sum + item.amount, 0);
  const expenseTotal = expenses.reduce((sum, item) => sum + item.amount, 0);
  const grandTotal = purchaseTotal + salaryTotal + expenseTotal;

  document.getElementById("ownerPurchaseTotal").textContent = formatCurrency(purchaseTotal);
  document.getElementById("ownerSalaryTotal").textContent = formatCurrency(salaryTotal);
  document.getElementById("ownerExpenseTotal").textContent = formatCurrency(expenseTotal);
  document.getElementById("ownerGrandTotal").textContent = formatCurrency(grandTotal);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

showAppByRole();
renderSummary();
renderRecords();
renderOwnerRecords();
