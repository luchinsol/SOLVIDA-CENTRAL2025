<script setup lang="ts">
import { ref, computed } from "vue";
import axios from "axios";

// Estado del formulario
const form = ref({
  titulo: "",
  descripcion: ""
});

const enviando = ref(false);
const mensajeExito = ref("");
const mensajeError = ref("");
const errorDescripcion = ref("");

// Contar palabras en la descripción
const contarPalabras = computed(() => {
  if (!form.value.descripcion.trim()) return 0;
  return form.value.descripcion.trim().split(/\s+/).length;
});

// Validar descripción
const validarDescripcion = () => {
  const palabras = contarPalabras.value;
  if (palabras > 17) {
    errorDescripcion.value = `Máximo 17 palabras (actual: ${palabras})`;
  } else {
    errorDescripcion.value = "";
  }
};

// Enviar la notificación
const enviarNotificacion = async () => {
  // Resetear errores
  mensajeError.value = "";
  errorDescripcion.value = "";
  
  // Validar campos requeridos
  if (!form.value.titulo || !form.value.descripcion) {
    mensajeError.value = "Por favor complete todos los campos";
    return;
  }
  
  // Validar máximo de palabras
  const palabras = contarPalabras.value;
  if (palabras > 17) {
    errorDescripcion.value = `Máximo 17 palabras (actual: ${palabras})`;
    return;
  }

  enviando.value = true;

  try {
    const baseURL = import.meta.env.VITE_API_BASE_URL;
    
    // Fecha actual en formato YYYY-MM-DD
    const fechaActual = new Date().toISOString().split('T')[0];
    
    // Construir el objeto de datos
    const payload = {
      titulo: form.value.titulo,
      descripcion: form.value.descripcion,
      fecha: fechaActual,
      foto: null
    };

    // Enviar a la API como JSON
    await axios.post(`${baseURL}/apigw/v1/notificacion_cliente`, payload);

    // Éxito: limpiar y mostrar mensaje
    form.value.titulo = "";
    form.value.descripcion = "";
    mensajeExito.value = "Notificación enviada con éxito!";
  } catch (error: any) {
    console.error("Error al enviar notificación:", error);
    mensajeError.value = `Error: ${error.response?.data?.message || error.message || "Error desconocido"}`;
  } finally {
    enviando.value = false;
  }
};
</script>

<template>
  <v-form @submit.prevent="enviarNotificacion">
    <v-text-field
      v-model="form.titulo"
      label="Título"
      required
      :disabled="enviando"
      class="mb-4"
    ></v-text-field>

    <v-textarea
      v-model="form.descripcion"
      label="Descripción"
      required
      rows="3"
      :disabled="enviando"
      class="mb-2"
      @input="validarDescripcion"
    ></v-textarea>
    
    <div class="d-flex justify-space-between align-center mb-4">
      <div class="text-caption text-grey">
        Palabras: {{ contarPalabras }} / 17
      </div>
      <div v-if="errorDescripcion" class="text-error text-caption">
        {{ errorDescripcion }}
      </div>
    </div>

    <v-btn 
      type="submit" 
      color="primary" 
      :loading="enviando"
      class="mt-2"
      :disabled="contarPalabras > 17"
    >
      Enviar Notificación
    </v-btn>

    <v-alert v-if="mensajeExito" type="success" class="mt-4">
      {{ mensajeExito }}
    </v-alert>
    
    <v-alert v-if="mensajeError" type="error" class="mt-4">
      {{ mensajeError }}
    </v-alert>
  </v-form>
</template>

<style scoped>
.text-error {
  color: #ff5252;
  font-size: 0.75rem;
}
</style>