if (localStorage.getItem("passoFinoLoggedIn") !== "true") {
  window.location.href = "login.html";
}

const form = document.querySelector("#productForm");
const imageInput = document.querySelector("#productImage");
const imagePreview = document.querySelector("#imagePreview");
const previewText = document.querySelector("#previewText");
const formAlert = document.querySelector("#formAlert");
const adminList = document.querySelector("#adminList");
const credentialsForm = document.querySelector("#credentialsForm");
const credentialsAlert = document.querySelector("#credentialsAlert");
const ordersList = document.querySelector("#ordersList");
const reportRevenue = document.querySelector("#reportRevenue");
const reportOrders = document.querySelector("#reportOrders");
const reportItems = document.querySelector("#reportItems");
const reportAverage = document.querySelector("#reportAverage");
let selectedImage = "";

function getCredentials() {
  return JSON.parse(localStorage.getItem("passoFinoCredentials") || '{"user":"admin","password":"1234"}');
}

function getProducts() {
  return JSON.parse(localStorage.getItem("passoFinoProducts") || "[]");
}

function saveProducts(products) {
  localStorage.setItem("passoFinoProducts", JSON.stringify(products));
}

function getOrders() {
  return JSON.parse(localStorage.getItem("passoFinoOrders") || "[]");
}

function formatPrice(value) {
  return `${Number(value).toLocaleString("pt-AO")} Kz`;
}

function renderAdminList() {
  const products = getProducts();

  if (products.length === 0) {
    adminList.innerHTML = '<p class="empty-admin">Ainda nao cadastraste nenhum calcado.</p>';
    return;
  }

  adminList.innerHTML = products
    .map(
      (product) => {
        const stock = Number.isFinite(product.stock) ? product.stock : 1;
        const available = product.available !== false && stock > 0;

        return `
        <article class="admin-product">
          <img src="${product.image}" alt="${product.name}">
          <div>
            <h3>${product.name}</h3>
            <p>${product.category} - ${product.color} - ${formatPrice(product.price)}</p>
            <span>Tamanhos: ${product.sizes.join(", ")}</span>
            <strong class="${available ? "stock-ok" : "stock-out"}">
              ${available ? "Disponivel" : "Indisponivel"} - restam ${stock}
            </strong>
          </div>
          <button type="button" data-delete="${product.id}" aria-label="Apagar ${product.name}">x</button>
        </article>
      `;
      },
    )
    .join("");
}

function renderOrders() {
  const orders = getOrders();

  if (orders.length === 0) {
    ordersList.innerHTML = '<p class="empty-admin">Ainda nao existem pedidos registados.</p>';
    return;
  }

  ordersList.innerHTML = orders
    .map((order) => {
      const proofLink = order.proofData
        ? `<a class="proof-link" href="${order.proofData}" target="_blank" rel="noreferrer">Abrir comprovativo</a>`
        : `<span>${order.proofFileName || "Sem ficheiro"}</span>`;

      return `
        <article class="order-card">
          <div>
            <h3>${order.customer}</h3>
            <p>${order.phone} - ${order.paymentMethod} - ${formatPrice(order.total)}</p>
            <span>${order.items.length} produto${order.items.length === 1 ? "" : "s"}</span>
          </div>
          ${proofLink}
        </article>
      `;
    })
    .join("");
}

function renderReports() {
  const orders = getOrders();
  const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total || 0), 0);
  const totalItems = orders.reduce((sum, order) => sum + (order.items ? order.items.length : 0), 0);
  const average = orders.length > 0 ? totalRevenue / orders.length : 0;

  reportRevenue.textContent = formatPrice(totalRevenue);
  reportOrders.textContent = String(orders.length);
  reportItems.textContent = String(totalItems);
  reportAverage.textContent = formatPrice(average);
}

imageInput.addEventListener("change", () => {
  const file = imageInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.addEventListener("load", () => {
    selectedImage = reader.result;
    imagePreview.src = selectedImage;
    imagePreview.classList.add("is-visible");
    previewText.classList.add("is-hidden");
  });
  reader.readAsDataURL(file);
});

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const sizes = document
    .querySelector("#productSizes")
    .value.split(",")
    .map((size) => Number(size.trim()))
    .filter(Boolean);

  if (!selectedImage || sizes.length === 0) {
    formAlert.textContent = "Escolha uma imagem e informe pelo menos um tamanho.";
    return;
  }

  const product = {
    id: Date.now(),
    name: document.querySelector("#productName").value.trim(),
    category: document.querySelector("#productCategory").value,
    color: document.querySelector("#productColor").value.trim(),
    price: Number(document.querySelector("#productPrice").value),
    sizes,
    stock: Number(document.querySelector("#productStock").value),
    available: document.querySelector("#productAvailable").checked,
    image: selectedImage,
  };

  saveProducts([product, ...getProducts()]);
  form.reset();
  selectedImage = "";
  imagePreview.removeAttribute("src");
  imagePreview.classList.remove("is-visible");
  previewText.classList.remove("is-hidden");
  formAlert.textContent = "Produto guardado com sucesso. Ja aparece na loja.";
  renderAdminList();
});

adminList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-delete]");
  if (!button) return;

  const products = getProducts().filter((product) => product.id !== Number(button.dataset.delete));
  saveProducts(products);
  renderAdminList();
});

document.querySelector("#clearProducts").addEventListener("click", () => {
  saveProducts([]);
  renderAdminList();
});

document.querySelector("#clearOrders").addEventListener("click", () => {
  localStorage.setItem("passoFinoOrders", "[]");
  renderOrders();
  renderReports();
});

document.querySelector("#logoutButton").addEventListener("click", () => {
  localStorage.removeItem("passoFinoLoggedIn");
  window.location.href = "login.html";
});

credentialsForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const credentials = getCredentials();
  const newUser = document.querySelector("#newUsername").value.trim();
  const currentPassword = document.querySelector("#currentPassword").value.trim();
  const newPassword = document.querySelector("#newPassword").value.trim();
  const confirmPassword = document.querySelector("#confirmPassword").value.trim();

  credentialsAlert.classList.remove("form-success");

  if (currentPassword !== credentials.password) {
    credentialsAlert.textContent = "A palavra-passe atual esta incorreta.";
    return;
  }

  if (newPassword.length < 4) {
    credentialsAlert.textContent = "A nova palavra-passe deve ter pelo menos 4 caracteres.";
    return;
  }

  if (newPassword !== confirmPassword) {
    credentialsAlert.textContent = "A confirmacao nao corresponde a nova palavra-passe.";
    return;
  }

  localStorage.setItem("passoFinoCredentials", JSON.stringify({ user: newUser, password: newPassword }));
  credentialsForm.reset();
  document.querySelector("#newUsername").value = newUser;
  credentialsAlert.classList.add("form-success");
  credentialsAlert.textContent = "Dados de acesso alterados com sucesso.";
});

document.querySelector("#newUsername").value = getCredentials().user;
renderAdminList();
renderOrders();
renderReports();
