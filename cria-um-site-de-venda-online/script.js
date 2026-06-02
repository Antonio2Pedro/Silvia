const defaultProducts = [
  {
    id: 1,
    name: "The essence of luxury" ,
    category: "Luxo",
    color: "Castanho",
    price: 54900,
    sizes: [75, 100, 150],
    stock: 1,
    available: true,
    image: "https://tse4.mm.bing.net/th/id/OIP.CyqCF8QZubw2kKFjEOTnOgHaHa?r=0&rs=1&pid=ImgDetMain&o=7&rm=3",
  },
  {
    id: 2,
    name: "Fakhar Preto",
    category: "Árabe",
    color: "Preto",
    price: 72500,
    sizes: [40, 41, 42, 43],
    stock: 5,
    available: true,
    image: "https://images.tcdn.com.br/img/editor/up/1101389/Banner_PRODUTO_Arabic_Collection_Che770ro_Meu_COMP.jpg",
  },
 

];

const savedProducts = JSON.parse(localStorage.getItem("passoFinoProducts") || "[]");
const products = [...savedProducts, ...defaultProducts];

const state = {
  category: "Todos",
  size: null,
  search: "",
  sort: "featured",
  cart: [],
};

const money = new Intl.NumberFormat("pt-AO", {
  style: "currency",
  currency: "AOA",
  maximumFractionDigits: 0,
});

const productGrid = document.querySelector("#productGrid");
const resultCount = document.querySelector("#resultCount");
const searchInput = document.querySelector("#searchInput");
const sortSelect = document.querySelector("#sortSelect");
const cartPanel = document.querySelector("#cartPanel");
const overlay = document.querySelector("#overlay");
const cartItems = document.querySelector("#cartItems");
const cartEmpty = document.querySelector("#cartEmpty");
const cartCount = document.querySelector("#cartCount");
const cartTotal = document.querySelector("#cartTotal");
const paymentForm = document.querySelector("#paymentForm");
const paymentAlert = document.querySelector("#paymentAlert");
const paymentProof = document.querySelector("#paymentProof");
let proofFileName = "";

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(reader.result));
    reader.addEventListener("error", reject);
    reader.readAsDataURL(file);
  });
}

function formatPrice(value) {
  return money.format(value).replace("AOA", "Kz");
}

function getFilteredProducts() {
  const term = state.search.trim().toLowerCase();
  const filtered = products.filter((product) => {
    const matchesCategory = state.category === "Todos" || product.category === state.category;
    const matchesSize = !state.size || product.sizes.includes(state.size);
    const matchesTerm = [product.name, product.category, product.color]
      .join(" ")
      .toLowerCase()
      .includes(term);

    return matchesCategory && matchesSize && matchesTerm;
  });

  return filtered.sort((a, b) => {
    if (state.sort === "low") return a.price - b.price;
    if (state.sort === "high") return b.price - a.price;
    return a.id - b.id;
  });
}

function renderProducts() {
  const visibleProducts = getFilteredProducts();
  resultCount.textContent = `${visibleProducts.length} produto${visibleProducts.length === 1 ? "" : "s"}`;

  productGrid.innerHTML = visibleProducts
    .map(
      (product) => {
        const stock = Number.isFinite(product.stock) ? product.stock : 1;
        const available = product.available !== false && stock > 0;

        return `
        <article class="product-card">
          <img src="${product.image}" alt="${product.name}" loading="lazy">
          <div class="product-card__body">
            <div>
              <h3>${product.name}</h3>
              <div class="meta">
                <span>${product.category}</span>
                <span>${product.color}</span>
              </div>
            </div>
            <div class="meta">
              <span>Tamanhos</span>
              <span>${product.sizes.join(", ")}</span>
            </div>
            <div class="stock-line ${available ? "stock-ok" : "stock-out"}">
              <span>${available ? "Disponivel" : "Indisponivel"}</span>
              <strong>Restam ${stock}</strong>
            </div>
            <div class="price-row">
              <strong>${formatPrice(product.price)}</strong>
              <button type="button" data-add="${product.id}" ${available ? "" : "disabled"}>
                ${available ? "Adicionar" : "Esgotado"}
              </button>
            </div>
          </div>
        </article>
      `;
      },
    )
    .join("");
}

function renderCart() {
  cartCount.textContent = state.cart.length;
  cartEmpty.classList.toggle("is-hidden", state.cart.length > 0);

  cartItems.innerHTML = state.cart
    .map(
      (item) => `
        <div class="cart-item">
          <img src="${item.image}" alt="${item.name}">
          <div>
            <h3>${item.name}</h3>
            <span>${formatPrice(item.price)}</span>
          </div>
          <button type="button" aria-label="Remover ${item.name}" data-remove="${item.cartId}">x</button>
        </div>
      `,
    )
    .join("");

  const total = state.cart.reduce((sum, item) => sum + item.price, 0);
  cartTotal.textContent = formatPrice(total);
}

function openCart() {
  cartPanel.classList.add("is-open");
  overlay.classList.add("is-open");
  cartPanel.setAttribute("aria-hidden", "false");
}

function closeCart() {
  cartPanel.classList.remove("is-open");
  overlay.classList.remove("is-open");
  cartPanel.setAttribute("aria-hidden", "true");
}

document.querySelector("#categoryFilters").addEventListener("click", (event) => {
  const button = event.target.closest("[data-category]");
  if (!button) return;

  state.category = button.dataset.category;
  document.querySelectorAll("[data-category]").forEach((item) => item.classList.remove("is-active"));
  button.classList.add("is-active");
  renderProducts();
});

document.querySelector("#sizeFilters").addEventListener("click", (event) => {
  const button = event.target.closest("[data-size]");
  if (!button) return;

  const selectedSize = Number(button.dataset.size);
  state.size = state.size === selectedSize ? null : selectedSize;
  document.querySelectorAll("[data-size]").forEach((item) => {
    item.classList.toggle("is-active", Number(item.dataset.size) === state.size);
  });
  renderProducts();
});

searchInput.addEventListener("input", (event) => {
  state.search = event.target.value;
  renderProducts();
});

sortSelect.addEventListener("change", (event) => {
  state.sort = event.target.value;
  renderProducts();
});

productGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-add]");
  if (!button) return;

  const product = products.find((item) => item.id === Number(button.dataset.add));
  const stock = Number.isFinite(product.stock) ? product.stock : 1;
  const available = product.available !== false && stock > 0;

  if (!available) return;

  state.cart.push({ ...product, cartId: `${product.id}-${Date.now()}-${Math.random()}` });
  renderCart();
  openCart();
});

cartItems.addEventListener("click", (event) => {
  const button = event.target.closest("[data-remove]");
  if (!button) return;

  state.cart = state.cart.filter((item) => item.cartId !== button.dataset.remove);
  renderCart();
});

document.querySelector(".cart-button").addEventListener("click", openCart);
document.querySelector("#closeCart").addEventListener("click", closeCart);
overlay.addEventListener("click", closeCart);

paymentProof.addEventListener("change", () => {
  const file = paymentProof.files[0];
  proofFileName = file ? file.name : "";
  paymentAlert.textContent = proofFileName ? `Comprovativo selecionado: ${proofFileName}` : "";
});

paymentForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (state.cart.length === 0) {
    paymentAlert.textContent = "Adicione pelo menos um calcado ao carrinho.";
    return;
  }

  if (!paymentProof.files[0]) {
    paymentAlert.textContent = "Carregue o comprovativo do pagamento Express.";
    return;
  }

  const proofData = await readFileAsDataUrl(paymentProof.files[0]);
  const order = {
    id: Date.now(),
    customer: document.querySelector("#customerName").value.trim(),
    phone: document.querySelector("#customerPhone").value.trim(),
    paymentMethod: "Express",
    proofFileName,
    proofData,
    total: state.cart.reduce((sum, item) => sum + item.price, 0),
    items: state.cart,
    createdAt: new Date().toISOString(),
  };

  const orders = JSON.parse(localStorage.getItem("passoFinoOrders") || "[]");
  localStorage.setItem("passoFinoOrders", JSON.stringify([order, ...orders]));

  state.cart = [];
  paymentForm.reset();
  proofFileName = "";
  renderCart();
  paymentAlert.textContent = "Pedido registado. O comprovativo sera confirmado pela loja.";
});

renderProducts();
renderCart();
