import { createRouter, createWebHistory } from "vue-router";
import axios from "axios";

const router = createRouter({
  history: createWebHistory("/"),
  routes: [
    {
      path: "/login",
      name: "Login",
      component: () => import("@/components/LoginView.vue"),
    },
    {
      path: "/",
      component: () => import("@/layouts/full/FullLayout.vue"),
      meta: { requiresAuth: true },
      children: [
        {
          path: "",
          redirect: "/dashboard",
        },
        {
          name: "Dashboard",
          path: "dashboard",
          component: () => import("@/views/dashboard/Dashboard.vue"),
        },
        {
          name: "Buttons",
          path: "ui-components/buttons",
          component: () => import("@/views/ui-components/Buttons.vue"),
        },
        {
          name: "Cards",
          path: "ui-components/cards",
          component: () => import("@/views/ui-components/Cards.vue"),
        },
        {
          name: "Menus",
          path: "ui-components/menus",
          component: () => import("@/views/ui-components/Menus.vue"),
        },
        {
          name: "Tables",
          path: "ui-components/tables",
          component: () => import("@/views/ui-components/Tables.vue"),
        },
      ],
    },
    // Ruta para redireccionar cualquier ruta no definida al login
    {
      path: "/:pathMatch(.*)*",
      redirect: "/login",
    },
  ],
});

// Protección de rutas con navegación guard
router.beforeEach((to, from, next) => {
  const authToken = localStorage.getItem('auth_token');
  
  // Configurar el token en el header de Axios si existe
  if (authToken) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
  
  // Si la ruta requiere autenticación y no hay token, redirigir al login
  if (to.matched.some(record => record.meta.requiresAuth) && !authToken) {
    next('/login');
  }
  
  // Si intenta acceder al login pero ya está autenticado, redirigir al dashboard
  else if (to.path === '/login' && authToken) {
    next('/dashboard');
  }
  
  else {
    next();
  }
});

// Interceptor básico para manejar errores de autenticación
axios.interceptors.response.use(
  response => response,
  error => {
    // Si el servidor responde con un error 401 (no autorizado), cerrar sesión
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_info');
      router.push('/login');
    }
    return Promise.reject(error);
  }
);

export default router;