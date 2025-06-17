<script setup lang="ts">
import { ref, onMounted } from "vue";
import axios from "axios";

interface SoporteTecnico {
  id: number;
  cliente_id: number;
  asunto: string;
  descripcion: string;
  nombres: string;
  apellidos: string;
}

const soportes = ref<SoporteTecnico[]>([]);
const loading = ref(true);
const error = ref("");

// Obtener los datos de soporte técnico
const obtenerSoportes = async () => {
  loading.value = true;
  try {
    const baseURL = import.meta.env.VITE_API_BASE_URL;
    const response = await axios.get<SoporteTecnico[]>(`${baseURL}/apigw/v1/soporte_tecnico`);
    soportes.value = response.data;
  } catch (err) {
    console.error("Error al obtener datos de soporte:", err);
    error.value = "Error al cargar los datos de soporte. Intente nuevamente.";
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  obtenerSoportes();
});
</script>

<template>
  <div>
    <v-card-title class="pa-4">
      Soporte Técnico
    </v-card-title>
    
    <v-card-text>
      <v-table density="compact">
        <thead>
          <tr>
            <th class="text-left">ID</th>
            <th class="text-left">Cliente</th>
            <th class="text-left">Asunto</th>
            <th class="text-left">Descripción</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="4" class="text-center py-8">
              <v-progress-circular indeterminate color="primary"></v-progress-circular>
              <div class="mt-2">Cargando datos de soporte...</div>
            </td>
          </tr>
          
          <tr v-else-if="error">
            <td colspan="4" class="text-center text-error py-8">
              {{ error }}
            </td>
          </tr>
          
          <tr v-else-if="soportes.length === 0">
            <td colspan="4" class="text-center py-8">
              No se encontraron registros de soporte
            </td>
          </tr>
          
          <tr v-for="soporte in soportes" :key="soporte.id">
            <td>{{ soporte.id }}</td>
            <td>{{ soporte.nombres }} {{ soporte.apellidos }}</td>
            <td>{{ soporte.asunto }}</td>
            <td>{{ soporte.descripcion }}</td>
          </tr>
        </tbody>
      </v-table>
    </v-card-text>
  </div>
</template>

<style scoped>
.text-error {
  color: #ff5252;
}
</style>