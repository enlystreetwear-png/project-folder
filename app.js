const STORAGE_KEY = "dailyExpenseRecords";
const ROLE_KEY = "dailyExpenseRole";
const WORKERS_KEY = "dailyExpenseWorkers";

const ACCOUNTANT_PASSWORD = "1234";
const OWNER_PASSWORD = "5678";

let records = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
let workers = JSON.parse(localStorage.getItem(WORKERS_KEY) || '["Ramesh","Suresh"]');
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

/* ---------- Bill Elements ---------- */
const billItemsBody = document.getElementById("billItemsBody");
const addBillRowBtn = document.getElementById("addBillRowBtn");
const billGrandTotal = document.getElementById("billGrandTotal");

/* ---------- Workers Elements ---------- */
const workerForm = document.getElementById("workerForm");
const workerNameInput = document.getElementById("workerNameInput");
const workersList = document.getElementById("workersList");
const salaryWorkerSelect = document.getElementById("salaryWorker");

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

/* ---------- Tabs ---------- */
document.querySelectorAll(".tab-btn").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach((btn) => btn.classList.remove("active"));
    document.querySelectorAll(".tab-panel").forEach((panel) => panel.classList.add("hidden"));

    button.classList.add("active");
    document.getElementById(button.dataset.tab).classList.remove("hidden");
  });
});

/* ---------- Form Events ---------- */
purchaseForm.addEventListener("submit", addPurchaseBill);
salaryForm.addEventListener("submit", addSalary);
expenseForm.addEventListener("submit", addExpense);
workerForm.addEventListener("submit", addWorker);
filterType.addEventListener("change", renderRecords);
filterDate.addEventListener("change", renderRecords);
ownerSearchBtn.addEventListener("click", renderOwnerRecords);
ownerDate.addEventListener("change", renderOwnerRecords);
addBillRowBtn.addEventListener("click", () => addBillRow());

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

function saveWorkers() {
  localStorage.setItem(WORKERS_KEY, JSON.stringify(workers));
  renderWorkers();
  renderWorkerDropdown();
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
    renderWorkers();
    renderWorkerDropdown();
    renderBillRows();
    updateBillGrandTotal();
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

/* ---------- Purchase Bill Rows ---------- */
function getEmptyBillItem() {
  return { item: "", qty: 1, price: 0 };
}

let billItems = [getEmptyBillItem()];

function addBillRow(item = "", qty = 1, price = 0) {
  billItems.push({
    item,
    qty: Number(qty) || 1,
    price: Number(price) || 0
  });
  renderBillRows();
  updateBillGrandTotal();
}

function removeBillRow(index) {
  if (billItems.length === 1) {
    billItems = [getEmptyBillItem()];
  } else {
    billItems.splice(index, 1);
  }
  renderBillRows();
  updateBillGrandTotal();
}

function updateBillItem(index, field, value) {
  if (!billItems[index]) return;

  if (field === "qty" || field === "price") {
    billItems[index][field] = Number(value) || 0;
  } else {
    billItems[index][field] = value;
  }

  updateBillGrandTotal();
  renderBillRowTotalsOnly();
}

function renderBillRows() {
  billItemsBody.innerHTML = billItems
    .map((row, index) => {
      const rowTotal = (Number(row.qty) || 0) * (Number(row.price) || 0);

      return `
        <tr>
          <td>
            <input
              type="text"
              placeholder="Item name"
              value="${escapeAttribute(row.item)}"
              oninput="updateBillItem(${index}, 'item', this.value)"
            />
          </td>
          <td>
            <input
              type="number"
              min="1"
              value="${Number(row.qty) || 0}"
              oninput="updateBillItem(${index}, 'qty', this.value)"
            />
          </td>
          <td>
            <input
              type="number"
              min="0"
              value="${Number(row.price) || 0}"
              oninput="updateBillItem(${index}, 'price', this.value)"
            />
          </td>
          <td class="bill-total-cell" data-row-total="${index}">
            ${formatCurrency(rowTotal)}
          </td>
          <td>
            <button class="row-remove-btn" type="button" onclick="removeBillRow(${index})">Remove</button>
          </td>
        </tr>
      `;
    })
    .join("");
}

function renderBillRowTotalsOnly() {
  document.querySelectorAll("[data-row-total]").forEach((cell) => {
    const index = Number(cell.getAttribute("data-row-total"));
    const row = billItems[index];
    const rowTotal = (Number(row.qty) || 0) * (Number(row.price) || 0);
    cell.textContent = formatCurrency(rowTotal);
  });
}

function updateBillGrandTotal() {
  const total = billItems.reduce((sum, row) => {
    return sum + (Number(row.qty) || 0) * (Number(row.price) || 0);
  }, 0);

  billGrandTotal.textContent = formatCurrency(total);
}

function resetPurchaseBillForm() {
  purchaseForm.reset();
  setValueIfExists("purchaseDate", today);
  billItems = [getEmptyBillItem()];
  renderBillRows();
  updateBillGrandTotal();
}

/* ---------- Workers ---------- */
function addWorker(event) {
  event.preventDefault();

  const name = workerNameInput.value.trim();
  if (!name) return;

  const exists = workers.some((worker) => worker.toLowerCase() === name.toLowerCase());
  if (exists) {
    alert("Worker already exists.");
    return;
  }

  workers.push(name);
  workers.sort((a, b) => a.localeCompare(b));
  workerForm.reset();
  saveWorkers();
}

function removeWorker(name) {
  const hasSalaryRecord = records.some(
    (record) => record.type === "Salary" && record.title.toLowerCase() === name.toLowerCase()
  );

  if (hasSalaryRecord) {
    const confirmDelete = confirm("This worker has salary records. Remove worker from list only?");
    if (!confirmDelete) return;
  }

  workers = workers.filter((worker) => worker !== name);
  saveWorkers();
}

function renderWorkers() {
  if (!workersList) return;

  if (workers.length === 0) {
    workersList.innerHTML = `<div class="empty">No workers added yet.</div>`;
    return;
  }

  workersList.innerHTML = workers
    .map(
      (worker) => `
        <div class="worker-item">
          <span class="worker-name">${escapeHtml(worker)}</span>
          <button class="remove-worker-btn" onclick="removeWorker('${escapeJs(worker)}')">Remove</button>
        </div>
      `
    )
    .join("");
}

function renderWorkerDropdown() {
  if (!salaryWorkerSelect) return;

  const currentValue = salaryWorkerSelect.value;

  salaryWorkerSelect.innerHTML = `
    <option value="">Select worker</option>
    ${workers
      .map((worker) => `<option value="${escapeAttribute(worker)}">${escapeHtml(worker)}</option>`)
      .join("")}
  `;

  if (workers.includes(currentValue)) {
    salaryWorkerSelect.value = currentValue;
  }
}

/* ---------- Add Records ---------- */
async function addPurchaseBill(event) {
  event.preventDefault();

  const supplier = document.getElementById("purchaseSupplier").value.trim();
  const date = document.getElementById("purchaseDate").value;
  const billFile = document.getElementById("purchaseBill").files[0];
  const billImage = await readImage(billFile);

  const cleanedItems = billItems
    .map((row) => ({
      item: row.item.trim(),
      qty: Number(row.qty) || 0,
      price: Number(row.price) || 0
    }))
    .filter((row) => row.item && row.qty > 0);

  if (cleanedItems.length === 0) {
    alert("Please add at least one bill item.");
    return;
  }

  const totalAmount = cleanedItems.reduce((sum, row) => sum + row.qty * row.price, 0);

  const details = cleanedItems
    .map((row) => `${row.item} (${row.qty} x ${formatCurrency(row.price)})`)
    .join(", ");

  records.unshift({
    id: crypto.randomUUID(),
    type: "Purchase",
    title: supplier || "Purchase Bill",
    amount: totalAmount,
    date,
    details,
    items: cleanedItems,
    billImage
  });

  resetPurchaseBillForm();
  saveRecords();
}

async function addSalary(event) {
  event.preventDefault();

  const worker = document.getElementById("salaryWorker").value;
  const amount = Number(document.getElementById("salaryAmount").value);
  const salaryType = document.getElementById("salaryType").value;
  const date = document.getElementById("salaryDate").value;
  const note = document.getElementById("salaryNote").value.trim();
  const billFile = document.getElementById("salaryBill").files[0];
  const billImage = await readImage(billFile);

  if (!worker) {
    alert("Please select a worker.");
    return;
  }

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
  renderWorkerDropdown();
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

/* ---------- Edit/Delete ---------- */
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

/* ---------- Filters ---------- */
function getFilteredRecords() {
  const selectedType = filterType.value;
  const selectedDate = filterDate.value;

  return records.filter((record) => {
    const typeMatch = selectedType === "All" || record.type === selectedType;
    const dateMatch = !selectedDate || record.date === selectedDate;
    return typeMatch && dateMatch;
  });
}

/* ---------- Render Accountant ---------- */
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

/* ---------- Render Owner ---------- */
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

/* ---------- Escape Helpers ---------- */
function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeAttribute(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeJs(value) {
  return String(value)
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\'");
}

/* ---------- Initial Render ---------- */
renderBillRows();
updateBillGrandTotal();
renderWorkerDropdown();
renderWorkers();
showAppByRole();
renderSummary();
renderRecords();
renderOwnerRecords();
