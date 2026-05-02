<template>
  <div class="container">
    <div class="card">
      <h2 class="title">Multi User Order & Inventory System</h2>
      <p class="subtitle">Login to your account</p>

      <input v-model="email" type="email" placeholder="Email address" />
      <input v-model="password" type="password" placeholder="Password" />

      <button @click="login" :disabled="loading">
        <span v-if="loading" class="loader"></span>
        {{ loading ? "Logging in..." : "Login" }}
      </button>

      <p v-if="error" class="error">{{ error }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import api from "../api/axios";
import { useRouter } from "vue-router";

const email = ref("");
const password = ref("");
const error = ref("");
const loading = ref(false);
const router = useRouter();

const login = async () => {
  error.value = "";
  loading.value = true;

  try {
    const res = await api.post("/login", {
      email: email.value,
      password: password.value,
    });

    localStorage.setItem("token", res.data.token);

    setTimeout(() => {
      router.push("/dashboard");
    }, 300);
  } catch (e) {
    error.value = e.response?.data?.message || "Invalid login";
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
/* LIGHT BLUE BACKGROUND */
.container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;

  background: linear-gradient(-45deg, #dbeafe, #93c5fd, #bfdbfe, #e0f2fe);
  background-size: 400% 400%;
  animation: gradientMove 14s ease infinite;
}

/* GLASS CARD (SOFT BLUE TINT) */
.card {
  width: 360px;
  padding: 34px;
  border-radius: 18px;

  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);

  border: 1px solid rgba(147, 197, 253, 0.4);
  box-shadow: 0 20px 50px rgba(59, 130, 246, 0.15);

  text-align: center;
  animation: fadeUp 0.6s ease;
}

/* TEXT */
.title {
  font-size: 26px;
  font-weight: 600;
  color: #1e3a8a;
  margin-bottom: 6px;
}

.subtitle {
  font-size: 13px;
  color: #3b82f6;
  opacity: 0.8;
  margin-bottom: 22px;
}

/* INPUTS */
input {
  width: 100%;
  padding: 12px 14px;
  margin: 10px 0;

  border-radius: 10px;
  border: 1px solid #bfdbfe;

  background: rgba(255, 255, 255, 0.8);
  color: #1e3a8a;

  outline: none;
  transition: all 0.25s ease;
}

/* placeholder */
input::placeholder {
  color: #60a5fa;
}

/* focus */
input:focus {
  transform: scale(1.02);
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}

/* BUTTON */
button {
  width: 100%;
  padding: 12px;
  margin-top: 14px;

  border-radius: 10px;
  border: none;

  font-weight: 600;
  cursor: pointer;

  color: white;
  background: linear-gradient(135deg, #60a5fa, #3b82f6);

  transition: all 0.3s ease;
}

/* hover */
button:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 25px rgba(59, 130, 246, 0.25);
}

/* disabled */
button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* loader */
.loader {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-top: 2px solid white;
  border-radius: 50%;
  display: inline-block;
  margin-right: 8px;
  animation: spin 0.8s linear infinite;
}

/* error */
.error {
  margin-top: 12px;
  color: #ef4444;
  font-size: 13px;
}

/* ANIMATIONS */
@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

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

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
