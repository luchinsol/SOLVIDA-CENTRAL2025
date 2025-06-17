<script setup lang="ts">
import { ref, onMounted } from "vue";
import axios from "axios";

interface Reclamo {
  id: number;
  nombres: string;
  apellidos: string | null;
  dni: string;
  fecha: string;
  tipo_reclamo: string;
  descripcion: string;
}

const reclamos = ref<Reclamo[]>([]);
const loading = ref(true);
const error = ref("");

// Formatear fecha a formato local
const formatearFecha = (fechaStr: string) => {
  const fecha = new Date(fechaStr);
  return fecha.toLocaleDateString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

// Obtener los reclamos
const obtenerReclamos = async () => {
  loading.value = true;
  try {
    const baseURL = import.meta.env.VITE_API_BASE_URL;
    const response = await axios.get<Reclamo[]>(`${baseURL}/apigw/v1/libro_reclamaciones`);
    reclamos.value = response.data;
  } catch (err) {
    console.error("Error al obtener reclamos:", err);
    error.value = "Error al cargar los reclamos. Intente nuevamente.";
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  obtenerReclamos();
});
</script>

<template>
  <div>
    <v-card-title class="pa-4">
      Libro de Reclamaciones
    </v-card-title>
    
    <v-card-text>
      <v-table density="compact">
        <thead>
          <tr>
            <th class="text-left">ID</th>
            <th class="text-left">Nombres</th>
            <th class="text-left">Apellidos</th>
            <th class="text-left">DNI</th>
            <th class="text-left">Fecha</th>
            <th class="text-left">Tipo de Reclamo</th>
            <th class="text-left">Descripción</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="7" class="text-center py-8">
              <v-progress-circular indeterminate color="primary"></v-progress-circular>
              <div class="mt-2">Cargando reclamos...</div>
            </td>
          </tr>
          
          <tr v-else-if="error">
            <td colspan="7" class="text-center text-error py-8">
              {{ error }}
            </td>
          </tr>
          
          <tr v-else-if="reclamos.length === 0">
            <td colspan="7" class="text-center py-8">
              No se encontraron reclamos
            </td>
          </tr>
          
          <tr v-for="reclamo in reclamos" :key="reclamo.id">
            <td>{{ reclamo.id }}</td>
            <td>{{ reclamo.nombres }}</td>
            <td>{{ reclamo.apellidos || '-' }}</td>
            <td>{{ reclamo.dni }}</td>
            <td>{{ formatearFecha(reclamo.fecha) }}</td>
            <td>{{ reclamo.tipo_reclamo }}</td>
            <td>{{ reclamo.descripcion }}</td>
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