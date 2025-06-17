<script setup lang="ts">
import { ref } from "vue";
import { profile } from "./data";
import { useRouter } from "vue-router";

const router = useRouter();
const userprofile = ref(profile);

const logout = () => {
  // Eliminar el token de autenticación y la información del usuario
  localStorage.removeItem('auth_token');
  localStorage.removeItem('user_info');
  
  // Redireccionar al login
  router.push('/login');
};
</script>

<template>
  <div>
    <!-- ---------------------------------------------- -->
    <!-- User Profile -->
    <!-- ---------------------------------------------- -->
    <v-menu anchor="bottom end" origin="auto" min-width="300">
      <template v-slot:activator="{ props }">
        <v-btn
          v-bind="props"
          class="pa-0 px-1"
          elevation="0"
          color="transparent"
          plain
          :ripple="false"
        >
          <v-avatar size="55">
            <img src="@/assets/images/users/2.jpg" alt="" width="100" height="100">
          </v-avatar>
        </v-btn>
      </template>

      <v-list class="pa-6" elevation="10" rounded="lg">
        <v-list-item
          class="pa-3 mb-2"
          v-for="(item, i) in userprofile"
          :key="i"
          :value="item"
          :title="item.title"
          :subtitle="item.desc"
          rounded="lg"
        >
        </v-list-item>
        <v-btn 
          block 
          color="secondary" 
          variant="contained" 
          class="mt-4 py-4"
          @click="logout"
        >
          Salir
        </v-btn>
      </v-list>
    </v-menu>
  </div>
</template>