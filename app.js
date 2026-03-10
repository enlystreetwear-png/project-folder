const STORAGE_KEY = "dailyExpenseRecords";
const ROLE_KEY = "dailyExpenseRole";
const WORKERS_KEY = "dailyExpenseWorkers";
const FOODS_KEY = "dailyExpenseFoodItems";

const ACCOUNTANT_PASSWORD = "1234";
const OWNER_PASSWORD = "5678";

let records = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
let workers = JSON.parse(localStorage.getItem(WORKERS_KEY) || '["Ramesh","Suresh"]');
let foodItems = JSON.parse(localStorage.getItem(FOODS_KEY) || '[{"name":"Burger","price":120},{"name":"Pizza","price":250}]');
let currentRole = localStorage.getItem(ROLE_KEY) || "";

const today = new Date().toISOString().split("T")[0];

/* ---------- Login ---------- */
const loginPage = document.getElementById("loginPage");
const accountantApp = document.getElementById("accountantApp");
const ownerApp = document.getElementById("ownerApp");
const accountantLoginBtn = document.getElementById("accountantLoginBtn");
const ownerLoginBtn = document.getElementById("ownerLoginBtn");
const loginForm = document.getElementById("loginForm");
const loginRoleInput = document.getElementById("loginRole");
const passwordInput = document.getElementById("passwordInput");
const loginMessage = document.getElementById("loginMessage");

/* ---------- Main Forms ---------- */
const purchaseForm = document.getElementById("purchaseForm");
const salaryForm = document.getElementById("salaryForm");
const expenseForm = document.getElementById("expenseForm");
const workerForm = document.getElementById("workerForm");
const foodForm = document.getElementById("foodForm");
const posForm = document.getElementById("posForm");

const recordsTable = document.getElementById("recordsTable");
const filterType = document.getElementById("filterType");
const filterDate = document.getElementById("filterDate");

const workersList = document.getElementById("workersList");
const foodList = document.getElementById("foodList");
const salaryWorkerSelect = document.getElementById("salaryWorker");

/* ---------- Purchase Bill ---------- */
const billItemsBody = document.getElementById("billItemsBody");
const addBillRowBtn = document.getElementById("addBillRowBtn");
const billGrandTotal = document.getElementById("billGrandTotal");

/* ---------- POS ---------- */
const posItemsBody = document.getElementById("posItemsBody");
const addPosRowBtn = document.getElementById("addPosRowBtn");
const posGrandTotal = document.getElementById("posGrandTotal");
const salesSummaryDate = document.getElementById("salesSummaryDate");
const salesSummaryTotal = document.getElementById("salesSummaryTotal");
const expenseSummaryTotal = document.getElementById("expenseSummaryTotal");
const profitSummaryTotal = document.getElementById("profitSummaryTotal");
const salesSummaryList = document.getElementById("salesSummaryList");

/* ---------- Owner ---------- */
const ownerDate = document.getElementById("ownerDate");
const ownerSearchBtn = document.getElementById("ownerSearchBtn");
const ownerRecordsTable = document.getElementById("ownerRecordsTable");

/* ---------- Defaults ---------- */
setValueIfExists("purchaseDate", today);
setValueIfExists("salaryDate", today);
setValueIfExists("expenseDate", today);
setValueIfExists("ownerDate", today);
setValueIfExists("posDate", today);
setValueIfExists("salesSummaryDate", today);

/* ---------- Local UI data ---------- */
let billItems = [{ item: "", qty: 1, price: 0 }];
let posItems = [{ name: "", qty: 1, price: 0 }];

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

/* ---------- Events ---------- */
purchaseForm.addEventListener("submit", addPurchaseBill);
salaryForm.addEventListener("submit", addSalary);
expenseForm.addEventListener("submit", addExpense);
workerForm.addEventListener("submit", addWorker);
foodForm.addEventListener("submit", addFoodItem);
posForm.addEventListener("submit", addSale);
filterType.addEventListener("change", renderRecords);
filterDate.addEventListener("change", renderRecords);
ownerSearchBtn.addEventListener("click", renderOwnerRecords);
ownerDate.addEventListener("change", renderOwnerRecords);
addBillRowBtn.addEventListener("click", () => addBillRow());
addPosRowBtn.addEventListener("click", () => addPosRow());
salesSummaryDate.addEventListener("change", renderSalesSummary);

/* ---------- Helpers ---------- */
function setValueIfExists(id, value) {
  const el = document.getElementById(id);
  if (el) el.value = value;
}

function saveRecords() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  renderRecords();
  renderSummary();
  renderOwnerRecords();
  renderSalesSummary();
}

function saveWorkers() {
  localStorage.setItem(WORKERS_KEY, JSON.stringify(workers));
  renderWorkers();
  renderWorkerDropdown();
}

function saveFoods() {
  localStorage.setItem(FOODS_KEY, JSON.stringify(foodItems));
  renderFoodList();
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
    renderFoodList();
    renderBillRows();
    updateBillGrandTotal();
    renderPosRows();
    updatePosGrandTotal();
    renderSalesSummary();
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

function getRecordsByType(type) {
  return records.filter((record) => record.type === type);
}

function getRecordsByDate(date) {
  return records.filter((record) => record.date === date);
}

function calculateDayNumbers(date) {
  const dayRecords = getRecordsByDate(date);
  const purchase = dayRecords.filter(r => r.type === "Purchase").reduce((s, r) => s + r.amount, 0);
  const salary = dayRecords.filter(r => r.type === "Salary").reduce((s, r) => s + r.amount, 0);
  const expense = dayRecords.filter(r => r.type === "Expense").reduce((s, r) => s + r.amount, 0);
  const sales = dayRecords.filter(r => r.type === "Sale").reduce((s, r) => s + r.amount, 0);
  const totalExpense = purchase + salary + expense;
  const profit = sales - totalExpense;

  return { purchase, salary, expense, sales, totalExpense, profit, dayRecords };
}

/* ---------- Purchase Bill ---------- */
function addBillRow(item = "", qty = 1, price = 0) {
  billItems.push({ item, qty: Number(qty) || 1, price: Number(price) || 0 });
  renderBillRows();
  updateBillGrandTotal();
}

function removeBillRow(index) {
  if (billItems.length === 1) {
    billItems = [{ item: "", qty: 1, price: 0 }];
  } else {
    billItems.splice(index, 1);
  }
  renderBillRows();
  updateBillGrandTotal();
}

function updateBillItem(index, field, value) {
  if (!billItems[index]) return;
  billItems[index][field] = field === "item" ? value : Number(value) || 0;
  renderBillRowTotalsOnly();
  updateBillGrandTotal();
}

function renderBillRows() {
  billItemsBody.innerHTML = billItems.map((row, index) => {
    const rowTotal = (Number(row.qty) || 0) * (Number(row.price) || 0);
    return `
      <tr>
        <td><input type="text" value="${escapeAttribute(row.item)}" placeholder="Item name" oninput="updateBillItem(${index}, 'item', this.value)" /></td>
        <td><input type="number" min="1" value="${Number(row.qty) || 1}" oninput="updateBillItem(${index}, 'qty', this.value)" /></td>
        <td><input type="number" min="0" value="${Number(row.price) || 0}" oninput="updateBillItem(${index}, 'price', this.value)" /></td>
        <td class="bill-total-cell" data-bill-row-total="${index}">${formatCurrency(rowTotal)}</td>
        <td><button class="row-remove-btn" type="button" onclick="removeBillRow(${index})">Remove</button></td>
      </tr>
    `;
  }).join("");
}

function renderBillRowTotalsOnly() {
  document.querySelectorAll("[data-bill-row-total]").forEach((cell) => {
    const index = Number(cell.getAttribute("data-bill-row-total"));
    const row = billItems[index];
    const total = (Number(row.qty) || 0) * (Number(row.price) || 0);
    cell.textContent = formatCurrency(total);
  });
}

function updateBillGrandTotal() {
  const total = billItems.reduce((sum, row) => sum + ((Number(row.qty) || 0) * (Number(row.price) || 0)), 0);
  billGrandTotal.textContent = formatCurrency(total);
}

function resetPurchaseBillForm() {
  purchaseForm.reset();
  setValueIfExists("purchaseDate", today);
  billItems = [{ item: "", qty: 1, price: 0 }];
  renderBillRows();
  updateBillGrandTotal();
}

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
  const details = cleanedItems.map((row) => `${row.item} (${row.qty} x ${formatCurrency(row.price)})`).join(", ");

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

/* ---------- Workers ---------- */
function addWorker(event) {
  event.preventDefault();
  const name = document.getElementById("workerNameInput").value.trim();
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
  workers = workers.filter((worker) => worker !== name);
  saveWorkers();
}

function renderWorkers() {
  if (!workers.length) {
    workersList.innerHTML = `<div class="empty">No workers added yet.</div>`;
    return;
  }

  workersList.innerHTML = workers.map((worker) => `
    <div class="worker-item">
      <span class="worker-name">${escapeHtml(worker)}</span>
      <button class="remove-worker-btn" onclick="removeWorker('${escapeJs(worker)}')">Remove</button>
    </div>
  `).join("");
}

function renderWorkerDropdown() {
  const currentValue = salaryWorkerSelect.value;
  salaryWorkerSelect.innerHTML = `
    <option value="">Select worker</option>
    ${workers.map((worker) => `<option value="${escapeAttribute(worker)}">${escapeHtml(worker)}</option>`).join("")}
  `;
  if (workers.includes(currentValue)) salaryWorkerSelect.value = currentValue;
}

/* ---------- Food Items ---------- */
function addFoodItem(event) {
  event.preventDefault();

  const name = document.getElementById("foodNameInput").value.trim();
  const price = Number(document.getElementById("foodPriceInput").value);

  if (!name) return;

  const exists = foodItems.some((item) => item.name.toLowerCase() === name.toLowerCase());
  if (exists) {
    alert("Food item already exists.");
    return;
  }

  foodItems.push({ name, price });
  foodItems.sort((a, b) => a.name.localeCompare(b.name));
  foodForm.reset();
  saveFoods();
  renderPosRows();
}

function removeFoodItem(name) {
  foodItems = foodItems.filter((item) => item.name !== name);
  saveFoods();
  renderPosRows();
}

function renderFoodList() {
  if (!foodItems.length) {
    foodList.innerHTML = `<div class="empty">No food items added yet.</div>`;
    return;
  }

  foodList.innerHTML = foodItems.map((item) => `
    <div class="worker-item">
      <span class="worker-name">${escapeHtml(item.name)} - ${formatCurrency(item.price)}</span>
      <button class="remove-worker-btn" onclick="removeFoodItem('${escapeJs(item.name)}')">Remove</button>
    </div>
  `).join("");
}

/* ---------- POS ---------- */
function getEmptyPosRow() {
  const firstItem = foodItems[0];
  return {
    name: firstItem ? firstItem.name : "",
    qty: 1,
    price: firstItem ? Number(firstItem.price) : 0
  };
}

function addPosRow() {
  posItems.push(getEmptyPosRow());
  renderPosRows();
  updatePosGrandTotal();
}

function removePosRow(index) {
  if (posItems.length === 1) {
    posItems = [getEmptyPosRow()];
  } else {
    posItems.splice(index, 1);
  }
  renderPosRows();
  updatePosGrandTotal();
}

function updatePosItem(index, field, value) {
  if (!posItems[index]) return;

  if (field === "name") {
    posItems[index].name = value;
    const found = foodItems.find((item) => item.name === value);
    posItems[index].price = found ? Number(found.price) : 0;
    renderPosRows();
  } else if (field === "qty") {
    posItems[index].qty = Number(value) || 0;
    renderPosRowTotalsOnly();
  } else if (field === "price") {
    posItems[index].price = Number(value) || 0;
    renderPosRowTotalsOnly();
  }

  updatePosGrandTotal();
}

function renderPosRows() {
  posItemsBody.innerHTML = posItems.map((row, index) => {
    const rowTotal = (Number(row.qty) || 0) * (Number(row.price) || 0);

    return `
      <tr>
        <td>
          <select onchange="updatePosItem(${index}, 'name', this.value)">
            <option value="">Select item</option>
            ${foodItems.map((food) => `
              <option value="${escapeAttribute(food.name)}" ${food.name === row.name ? "selected" : ""}>
                ${escapeHtml(food.name)}
              </option>
            `).join("")}
          </select>
        </td>
        <td>
          <input type="number" min="1" value="${Number(row.qty) || 1}" oninput="updatePosItem(${index}, 'qty', this.value)" />
        </td>
        <td>
          <input type="number" min="0" value="${Number(row.price) || 0}" oninput="updatePosItem(${index}, 'price', this.value)" />
        </td>
        <td class="bill-total-cell" data-pos-row-total="${index}">${formatCurrency(rowTotal)}</td>
        <td>
          <button class="row-remove-btn" type="button" onclick="removePosRow(${index})">Remove</button>
        </td>
      </tr>
    `;
  }).join("");
}

function renderPosRowTotalsOnly() {
  document.querySelectorAll("[data-pos-row-total]").forEach((cell) => {
    const index = Number(cell.getAttribute("data-pos-row-total"));
    const row = posItems[index];
    const total = (Number(row.qty) || 0) * (Number(row.price) || 0);
    cell.textContent = formatCurrency(total);
  });
}

function updatePosGrandTotal() {
  const total = posItems.reduce((sum, row) => sum + ((Number(row.qty) || 0) * (Number(row.price) || 0)), 0);
  posGrandTotal.textContent = formatCurrency(total);
}

function resetPosForm() {
  posForm.reset();
  setValueIfExists("posDate", today);
  posItems = [getEmptyPosRow()];
  renderPosRows();
  updatePosGrandTotal();
}

function addSale(event) {
  event.preventDefault();

  const date = document.getElementById("posDate").value;

  const cleaned = posItems
    .map((row) => ({
      name: row.name.trim(),
      qty: Number(row.qty) || 0,
      price: Number(row.price) || 0
    }))
    .filter((row) => row.name && row.qty > 0);

  if (!cleaned.length) {
    alert("Please add at least one food item.");
    return;
  }

  const totalAmount = cleaned.reduce((sum, row) => sum + row.qty * row.price, 0);
  const details = cleaned.map((row) => `${row.name} (${row.qty} x ${formatCurrency(row.price)})`).join(", ");

  records.unshift({
    id: crypto.randomUUID(),
    type: "Sale",
    title: "POS Sale",
    amount: totalAmount,
    date,
    details,
    items: cleaned,
    billImage: ""
  });

  resetPosForm();
  saveRecords();
}

/* ---------- Salary & Expense ---------- */
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

/* ---------- Render Summary ---------- */
function renderSummary() {
  const purchaseTotal = getRecordsByType("Purchase").reduce((sum, record) => sum + record.amount, 0);
  const salaryTotal = getRecordsByType("Salary").reduce((sum, record) => sum + record.amount, 0);
  const expenseTotal = getRecordsByType("Expense").reduce((sum, record) => sum + record.amount, 0);
  const salesTotalValue = getRecordsByType("Sale").reduce((sum, record) => sum + record.amount, 0);
  const netProfit = salesTotalValue - (purchaseTotal + salaryTotal + expenseTotal);

  document.getElementById("purchaseTotal").textContent = formatCurrency(purchaseTotal);
  document.getElementById("salaryTotal").textContent = formatCurrency(salaryTotal);
  document.getElementById("expenseTotal").textContent = formatCurrency(expenseTotal);
  document.getElementById("salesTotal").textContent = formatCurrency(salesTotalValue);
  document.getElementById("netProfitTotal").textContent = formatCurrency(netProfit);
}

/* ---------- Accountant Records ---------- */
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

  recordsTable.innerHTML = filtered.map((record) => `
    <tr>
      <td><span class="badge">${record.type}</span></td>
      <td>${escapeHtml(record.title)}</td>
      <td>${formatCurrency(record.amount)}</td>
      <td>${record.date}</td>
      <td>${escapeHtml(record.details)}</td>
      <td>${record.billImage ? `<img src="${record.billImage}" alt="Bill" class="bill-thumb">` : "-"}</td>
      <td>
        <div class="action-group">
          <button class="edit-btn" onclick="editRecord('${record.id}')">Edit</button>
          <button class="delete-btn" onclick="deleteRecord('${record.id}')">Delete</button>
        </div>
      </td>
    </tr>
  `).join("");
}

/* ---------- POS Summary ---------- */
function renderSalesSummary() {
  const date = salesSummaryDate.value || today;
  const { sales, totalExpense, profit, dayRecords } = calculateDayNumbers(date);
  const saleRecords = dayRecords.filter((r) => r.type === "Sale");

  salesSummaryTotal.textContent = formatCurrency(sales);
  expenseSummaryTotal.textContent = formatCurrency(totalExpense);
  profitSummaryTotal.textContent = formatCurrency(profit);

  if (!saleRecords.length) {
    salesSummaryList.innerHTML = `<div class="empty">No sales found for selected date.</div>`;
    return;
  }

  salesSummaryList.innerHTML = saleRecords.map((sale) => `
    <div class="worker-item">
      <span class="worker-name">${escapeHtml(sale.details)}</span>
      <span>${formatCurrency(sale.amount)}</span>
    </div>
  `).join("");
}

/* ---------- Owner ---------- */
function renderOwnerRecords() {
  const selectedDate = ownerDate.value;
  const { purchase, salary, expense, sales, profit, dayRecords } = calculateDayNumbers(selectedDate);

  if (!dayRecords.length) {
    ownerRecordsTable.innerHTML = `<tr><td colspan="6" class="empty">No records found for selected date.</td></tr>`;
  } else {
    ownerRecordsTable.innerHTML = dayRecords.map((record) => `
      <tr>
        <td><span class="badge">${record.type}</span></td>
        <td>${escapeHtml(record.title)}</td>
        <td>${formatCurrency(record.amount)}</td>
        <td>${record.date}</td>
        <td>${escapeHtml(record.details)}</td>
        <td>${record.billImage ? `<img src="${record.billImage}" alt="Bill" class="bill-thumb">` : "-"}</td>
      </tr>
    `).join("");
  }

  document.getElementById("ownerPurchaseTotal").textContent = formatCurrency(purchase);
  document.getElementById("ownerSalaryTotal").textContent = formatCurrency(salary);
  document.getElementById("ownerExpenseTotal").textContent = formatCurrency(expense);
  document.getElementById("ownerSalesTotal").textContent = formatCurrency(sales);
  document.getElementById("ownerGrandTotal").textContent = formatCurrency(profit);
}

/* ---------- Escaping ---------- */
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
renderWorkers();
renderWorkerDropdown();
renderFoodList();

if (!foodItems.length) {
  posItems = [{ name: "", qty: 1, price: 0 }];
} else {
  posItems = [getEmptyPosRow()];
}
renderPosRows();
updatePosGrandTotal();

showAppByRole();
renderSummary();
renderRecords();
renderSalesSummary();
renderOwnerRecords();
