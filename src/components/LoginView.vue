<template>
  <v-container style="width: 40%">
    <v-card class="pa-4">
      <v-img :src="pendiente" height="150px" cover></v-img>
      <v-card-title>Bienvenido a la central</v-card-title>
      <v-card-subtitle>Indica tus credenciales</v-card-subtitle>
      <div style="height: 30px"></div>
      <v-text-field v-model="usuario" label="Usuario"></v-text-field>
      <v-text-field
        v-model="password"
        :append-icon="show1 ? 'mdi-eye' : 'mdi-eye-off'"
        :type="show1 ? 'text' : 'password'"
        label="Contraseña"
        @click:append="show1 = !show1"
      ></v-text-field>
      <div>
        <v-btn color="blue" variant="elevated" @click="ingreso" :loading="loading">
          Iniciar sesión
        </v-btn>
      </div>
      <v-alert
        v-if="error"
        type="error"
        class="mt-4"
        closable
        @click:close="error = ''"
      >
        {{ error }}
      </v-alert>
    </v-card>
  </v-container>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import pendiente from "@/assets/images/background/pendiente2.jpg";

const router = useRouter();
const usuario = ref('');
const password = ref('');
const show1 = ref(false);
const loading = ref(false);
const error = ref('');

// Obtener la URL base desde las variables de entorno o usar la URL alternativa
const BASE_URL = import.meta.env.VITE_API_LOGIN;// || 'http://localhost:3000';

const ingreso = async () => {
  if (!usuario.value || !password.value) {
    error.value = 'Por favor ingrese usuario y contraseña';
    return;
  }

  loading.value = true;
  error.value = '';

  try {
    const response = await axios.post(`${BASE_URL}/login`, {
      nickname: usuario.value,
      contrasena: password.value
    });

    if (response.status === 201 || response.status === 200) {
      // Guardar el token en localStorage
      localStorage.setItem('auth_token', response.data.token);
      localStorage.setItem('user_info', JSON.stringify(response.data.user));
      
      // Redirigir al dashboard
      router.push('/dashboard');
    } else {
      error.value = 'Error en la autenticación';
    }
  } catch (err) {
    console.error('Error de login:', err);
    error.value = err.response?.data?.message || 'Error al iniciar sesión. Verifique sus credenciales.';
  } finally {
    loading.value = false;
  }
};
</script>