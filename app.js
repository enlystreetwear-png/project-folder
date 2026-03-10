const STORAGE_KEY = "dailyExpenseRecords";
let records = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");

const purchaseForm = document.getElementById("purchaseForm");
const salaryForm = document.getElementById("salaryForm");
const expenseForm = document.getElementById("expenseForm");
const recordsTable = document.getElementById("recordsTable");
const filterType = document.getElementById("filterType");
const filterDate = document.getElementById("filterDate");

const today = new Date().toISOString().split("T")[0];
document.getElementById("purchaseDate").value = today;
document.getElementById("salaryDate").value = today;
document.getElementById("expenseDate").value = today;

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

function saveRecords() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  renderRecords();
  renderSummary();
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
  document.getElementById("purchaseDate").value = today;
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
  document.getElementById("salaryDate").value = today;
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
  document.getElementById("expenseDate").value = today;
  saveRecords();
}

function deleteRecord(id) {
  records = records.filter((record) => record.id !== id);
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
            <button class="delete-btn" onclick="deleteRecord('${record.id}')">Delete</button>
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

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

renderRecords();
renderSummary();
