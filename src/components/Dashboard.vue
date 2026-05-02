<template>
  <div class="container">
    <div class="wrapper">
      <!-- ALERT (FIXED OVERLAY) -->
      <div v-if="alert.text" :class="['alert', alert.type]">
        {{ alert.text }}
      </div>

      <!-- HEADER -->
      <div class="header">
        <h2>Dashboard</h2>
        <button class="logout" @click="logout">Logout</button>
      </div>

      <!-- STATS -->
      <div class="stats">
        <div class="card">
          <div class="card-icon">📦</div>
          <h3>{{ products.length }}</h3>
          <p>Products</p>
        </div>

        <div class="card">
          <div class="card-icon">🛒</div>
          <h3>{{ cart.length }}</h3>
          <p>Cart Items</p>
        </div>
      </div>

      <!-- MAIN -->
      <div class="content">
        <!-- PRODUCTS -->
        <div class="panel">
          <div class="panel-header">
            <h3>🛍️ Products</h3>
            <span class="panel-count">{{ products.length }} items</span>
          </div>

          <div v-if="products.length === 0" class="empty">
            <div class="empty-icon">📦</div>
            <p>No products available</p>
          </div>

          <div v-for="p in products" :key="p.id" class="product-item">
            <div class="product-info">
              <div class="product-name">{{ p.name }}</div>
              <div class="product-details">
                <span class="price">{{ p.price }}Ks</span>
                <span class="stock" :class="{ 'low-stock': p.stock < 5 }">
                  Stock: {{ p.stock }}
                </span>
              </div>
            </div>

            <div class="product-actions">
              <div class="quantity-control">
                <button @click="decreaseQty(p.id)" class="qty-btn">-</button>
                <input
                  type="number"
                  v-model.number="qty[p.id]"
                  min="1"
                  :max="p.stock"
                  class="qty-input"
                />
                <button @click="increaseQty(p.id)" class="qty-btn">+</button>
              </div>
              <button
                @click="addToCart(p)"
                class="add-btn"
                :disabled="p.stock === 0"
              >
                {{ p.stock === 0 ? "Out of Stock" : "Add to Cart" }}
              </button>
            </div>
          </div>
        </div>

        <!-- CART -->
        <div class="panel">
          <div class="panel-header">
            <h3>🛒 Shopping Cart</h3>
            <span class="panel-count">{{ cart.length }} items</span>
          </div>

          <div v-if="cart.length === 0" class="empty">
            <div class="empty-icon">🛒</div>
            <p>Your cart is empty</p>
            <small>Add some products to get started!</small>
          </div>

          <div v-for="item in cart" :key="item.product_id" class="cart-item">
            <div class="cart-item-info">
              <div class="cart-item-name">{{ item.name }}</div>
              <div class="cart-item-details">
                <span class="quantity">Qty: {{ item.quantity }}</span>
                <span class="unit-price"
                  >{{ getPrice(item.product_id) }}Ks</span
                >
              </div>
            </div>
            <div class="cart-item-total">
              <strong>${{ getItemTotal(item) }}</strong>
            </div>
            <button @click="removeFromCart(item.product_id)" class="remove-btn">
              ×
            </button>
          </div>

          <div v-if="cart.length > 0" class="cart-summary">
            <div class="cart-total">
              <span>Total:</span>
              <strong>{{ totalPrice }}</strong>
            </div>
            <button class="order-btn" @click="placeOrder">
              🛍️ Place Order
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import api from "../api/axios";

const router = useRouter();

const products = ref([]);
const cart = ref([]);
const qty = reactive({});

// ALERT STATE
const alert = ref({
  text: "",
  type: "",
});

// FETCH PRODUCTS
onMounted(async () => {
  const res = await api.get("/products");
  products.value = res.data;
});

// ADD TO CART
const addToCart = (product) => {
  const quantity = qty[product.id] || 1;
  const existingItem = cart.value.find(
    (item) => item.product_id === product.id,
  );

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.value.push({
      product_id: product.id,
      name: product.name,
      quantity: quantity,
    });
  }

  // Reset quantity input
  qty[product.id] = 1;
};

// REMOVE FROM CART
const removeFromCart = (productId) => {
  cart.value = cart.value.filter((item) => item.product_id !== productId);
};

// INCREASE QUANTITY
const increaseQty = (productId) => {
  const product = products.value.find((p) => p.id === productId);
  if (product && qty[productId] < product.stock) {
    qty[productId] = (qty[productId] || 1) + 1;
  }
};

// DECREASE QUANTITY
const decreaseQty = (productId) => {
  if (qty[productId] > 1) {
    qty[productId] = qty[productId] - 1;
  }
};

// GET PRICE
const getPrice = (productId) => {
  const product = products.value.find((p) => p.id === productId);
  return product ? product.price : 0;
};

// GET ITEM TOTAL
const getItemTotal = (item) => {
  return item.quantity * getPrice(item.product_id);
};

// COMPUTED TOTAL PRICE
const totalPrice = computed(() => {
  return cart.value.reduce((total, item) => {
    return total + getItemTotal(item);
  }, 0);
});

// PLACE ORDER
const placeOrder = async () => {
  try {
    const items = cart.value.map((i) => ({
      product_id: i.product_id,
      quantity: i.quantity,
    }));

    const res = await api.post("/orders", { items });

    // SUCCESS ALERT
    alert.value = {
      text: res.data.message,
      type: "success",
    };

    // CLEAR CART
    cart.value = [];

    // RESET QTY
    Object.keys(qty).forEach((key) => {
      qty[key] = 1;
    });
  } catch (e) {
    alert.value = {
      text: e.response?.data?.message,
      type: "error",
    };
  }

  // AUTO HIDE ALERT
  setTimeout(() => {
    alert.value.text = "";
  }, 5000);
};

// LOGOUT
const logout = () => {
  localStorage.removeItem("token");
  router.push("/");
};
</script>

<style scoped>
/* BACKGROUND */
.container {
  min-height: 100vh;
  padding: 30px;
  display: flex;
  justify-content: center;

  background: linear-gradient(-45deg, #dbeafe, #93c5fd, #bfdbfe, #e0f2fe);
  background-size: 400% 400%;
  animation: gradientMove 14s ease infinite;
}

.wrapper {
  width: 100%;
  max-width: 1000px;
}

/* ALERT (FIXED TOAST) */
.alert {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;

  padding: 14px 20px;
  border-radius: 10px;
  text-align: center;
  font-weight: 500;

  min-width: 300px;
  max-width: 90%;
}

/* SUCCESS */
.alert.success {
  background: rgba(34, 197, 94, 0.15);
  color: #15803d;
  border: 1px solid rgba(34, 197, 94, 0.3);
}

/* ERROR */
.alert.error {
  background: rgba(239, 68, 68, 0.15);
  color: #b91c1c;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

/* HEADER */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;

  padding: 18px 24px;
  border-radius: 14px;

  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(16px);

  border: 1px solid rgba(147, 197, 253, 0.4);
  box-shadow: 0 10px 30px rgba(59, 130, 246, 0.15);

  margin-bottom: 20px;
}

.header h2 {
  color: #1e3a8a;
}

/* LOGOUT */
.logout {
  padding: 8px 14px;
  border-radius: 8px;
  border: none;
  background: #ef4444;
  color: white;
  cursor: pointer;
}

/* STATS */
.stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stats .card {
  text-align: center;
  padding: 24px 20px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(147, 197, 253, 0.3);
  box-shadow: 0 8px 32px rgba(59, 130, 246, 0.1);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.stats .card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 40px rgba(59, 130, 246, 0.15);
}

.stats .card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #3b82f6, #8b5cf6);
}

.card-icon {
  font-size: 2rem;
  margin-bottom: 8px;
}

.stats .card h3 {
  font-size: 2.5rem;
  font-weight: 700;
  color: #1e3a8a;
  margin: 8px 0;
}

.stats .card p {
  color: #64748b;
  font-weight: 500;
  margin: 0;
}

/* CONTENT */
.content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

/* PANEL */
.panel {
  padding: 24px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(147, 197, 253, 0.3);
  box-shadow: 0 8px 32px rgba(59, 130, 246, 0.1);
  transition: all 0.3s ease;
}

.panel:hover {
  box-shadow: 0 12px 40px rgba(59, 130, 246, 0.15);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 2px solid rgba(147, 197, 253, 0.2);
}

.panel h3 {
  margin: 0;
  color: #1e3a8a;
  font-size: 1.4rem;
  font-weight: 600;
}

.panel-count {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
}

/* PRODUCT ITEM */
.product-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  margin-bottom: 12px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(147, 197, 253, 0.2);
  transition: all 0.3s ease;
}

.product-item:hover {
  background: rgba(255, 255, 255, 0.9);
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(59, 130, 246, 0.1);
}

.product-info {
  flex: 1;
}

.product-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1e3a8a;
  margin-bottom: 4px;
}

.product-details {
  display: flex;
  gap: 12px;
  align-items: center;
}

.price {
  font-size: 1.2rem;
  font-weight: 700;
  color: #059669;
}

.stock {
  font-size: 0.9rem;
  color: #64748b;
  background: rgba(100, 116, 139, 0.1);
  padding: 2px 8px;
  border-radius: 12px;
}

.low-stock {
  color: #dc2626;
  background: rgba(220, 38, 38, 0.1);
}

.product-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-end;
}

.quantity-control {
  display: flex;
  align-items: center;
  gap: 8px;
}

.qty-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: #e5e7eb;
  color: #374151;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  transition: all 0.2s ease;
}

.qty-btn:hover {
  background: #d1d5db;
  transform: scale(1.1);
}

.qty-input {
  width: 60px;
  padding: 6px 8px;
  border-radius: 8px;
  border: 1px solid #bfdbfe;
  text-align: center;
  font-weight: 500;
}

.add-btn {
  padding: 8px 16px;
  border-radius: 8px;
  border: none;
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.add-btn:hover:not(:disabled) {
  background: linear-gradient(135deg, #2563eb, #1e40af);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.add-btn:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

/* CART ITEM */
.cart-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  margin-bottom: 12px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(147, 197, 253, 0.2);
  position: relative;
  transition: all 0.3s ease;
}

.cart-item:hover {
  background: rgba(255, 255, 255, 0.9);
  transform: translateY(-1px);
}

.cart-item-info {
  flex: 1;
}

.cart-item-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1e3a8a;
  margin-bottom: 4px;
}

.cart-item-details {
  display: flex;
  gap: 12px;
  align-items: center;
  font-size: 0.9rem;
  color: #64748b;
}

.quantity {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  padding: 2px 8px;
  border-radius: 12px;
  font-weight: 500;
}

.unit-price {
  color: #059669;
  font-weight: 500;
}

.cart-item-total {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1e3a8a;
  margin-right: 16px;
}

.remove-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: #fee2e2;
  color: #dc2626;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  font-weight: bold;
  transition: all 0.2s ease;
}

.remove-btn:hover {
  background: #fecaca;
  transform: scale(1.1);
}

/* CART SUMMARY */
.cart-summary {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 2px solid rgba(147, 197, 253, 0.2);
}

.cart-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1.3rem;
  font-weight: 600;
  color: #1e3a8a;
  margin-bottom: 16px;
}

.order-btn {
  width: 100%;
  padding: 14px;
  border-radius: 12px;
  border: none;
  background: linear-gradient(135deg, #059669, #047857);
  color: white;
  cursor: pointer;
  font-size: 1.1rem;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);
}

.order-btn:hover {
  background: linear-gradient(135deg, #047857, #065f46);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(5, 150, 105, 0.4);
}

/* EMPTY STATE */
.empty {
  text-align: center;
  padding: 40px 20px;
  color: #64748b;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 12px;
  opacity: 0.6;
}

.empty p {
  margin: 8px 0 4px 0;
  font-size: 1.1rem;
  font-weight: 500;
}

.empty small {
  color: #9ca3af;
  font-size: 0.9rem;
}

/* ANIMATION */
@keyframes gradientMove {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

/* RESPONSIVE */
@media (max-width: 768px) {
  .container {
    padding: 16px;
  }

  .content {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .stats {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .product-item,
  .cart-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .product-actions,
  .cart-item-total {
    align-self: stretch;
  }

  .quantity-control {
    justify-content: center;
  }

  .panel {
    padding: 20px;
  }

  .panel-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
}

@media (max-width: 480px) {
  .header {
    flex-direction: column;
    gap: 12px;
    text-align: center;
  }

  .stats .card {
    padding: 20px 16px;
  }

  .card-icon {
    font-size: 1.8rem;
  }

  .stats .card h3 {
    font-size: 2rem;
  }
}
</style>
