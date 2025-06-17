<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'

// Reactive variables to store the counts
const pendientesCount = ref(0)
const enProcesoCount = ref(0)
const entregadosCount = ref(0)

// Function to fetch pedidos data
const fetchPedidosData = async () => {
  try {
    // Use environment variables for base URL
    const baseUrl = import.meta.env.VITE_API_BASE_URL;// || 'http://localhost:3000'

    // Fetch pendientes
    const pendientesResponse = await axios.get(`${baseUrl}/apigw/v1/pedido_pendiente`)
    pendientesCount.value = parseInt(pendientesResponse.data.total_pedidos_pendientes)

    // Fetch en proceso
    const enProcesoResponse = await axios.get(`${baseUrl}/apigw/v1/pedido_enproceso`)
    enProcesoCount.value = parseInt(enProcesoResponse.data.total_pedidos_enproceso)

    // Fetch entregados
    const entregadosResponse = await axios.get(`${baseUrl}/apigw/v1/pedido_entregado`)
    entregadosCount.value = parseInt(entregadosResponse.data.total_pedidos_entregados)
  } catch (error) {
    console.error('Error fetching pedidos data:', error)
  }
}

// Fetch data when component is mounted
onMounted(fetchPedidosData)
</script>

<template>
  <v-row>
    <v-col cols="12" lg="4">
      <v-card class="pa-4">
        <v-container>
          <v-row justify="center" align="center">
            <v-col cols="8">
              <v-card color="blue" class="pa-4 text-center">
                <h2 class="title font-weight-medium mb-2 text-h6" style="color: white;">
                  {{ pendientesCount }} Pendientes
                </h2>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
      </v-card>
    </v-col>
    <v-col cols="12" lg="4">
      <v-card class="pa-4">
        <v-container>
          <v-row justify="center" align="center">
            <v-col cols="8">
              <v-card color="yellow" class="pa-4 text-center">
                
                <h2 class="title font-weight-medium mb-2 text-h6" style="color:grey;">
                  {{ enProcesoCount }} En proceso
                </h2>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
      </v-card>
    </v-col>
    <v-col cols="12" lg="4">
      <v-card class="pa-4">
        <v-container>
          <v-row justify="center" align="center">
            <v-col cols="8">
              <v-card color="green" class="pa-4 text-center">
                <h2 class="title font-weight-medium mb-2 text-h6" style="color: white;">
                  {{ entregadosCount }} Entregados
                </h2>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
      </v-card>
    </v-col>
  </v-row>
</template>
