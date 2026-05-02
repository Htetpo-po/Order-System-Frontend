import { createRouter, createWebHistory } from "vue-router";
import Login from "../components/login.vue";
import Dashboard from "../components/Dashboard.vue";

const routes = [
  { path: "/", component: Login },
  { path: "/dashboard", component: Dashboard },
];

export default createRouter({
  history: createWebHistory(),
  routes,
});
