<script setup lang="ts">
import { ref, onMounted } from "vue";
import axios from "axios";

const monthtable = ref<any[]>([]);

const fetchDistribuidores = async () => {
  try {
    // URL con valor por defecto
    const API_URL = `${
      import.meta.env.VITE_API_BASE_URL// || 'http://localhost:3000'
    }/apigw/v1/distribuidor`;
    
    console.log("Intentando acceder a:", API_URL);
    
    const response = await axios.get(API_URL);
    
    monthtable.value = response.data.map((distribuidor: any) => ({
      id: distribuidor.id,
      leadname: `${distribuidor.nombres} ${distribuidor.apellidos}`,
      telefono: distribuidor.telefono,
      statustext: distribuidor.total_pedidos_pendientes,
      statuscolor: "info"
    }));
    
  } catch (error) {
    console.error("Error completo:", error);
    //console.error("URL solicitada:", error.config?.url);
  }
};

onMounted(() => {
  fetchDistribuidores();
});
</script>

<template>
  <v-card flat class="w-100 h-100">
    <v-card-text>
      <div class="d-sm-flex align-center">
        <h2 class="title text-h6 font-weight-medium">Distribuidores</h2>
      </div>
      
      <v-table class="month-table mt-7">
        <template v-slot:default>
          <thead>
            <tr>
              <th>Id</th>
              <th>Nombre</th>
              <th>Teléfono</th>
              <th>Pedidos pendientes</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in monthtable" :key="item.id">
              <td>{{ item.id }}</td>
              <td>{{ item.leadname }}</td>
              <td>{{ item.telefono }}</td>
              <td>
                <v-chip color="info" label>{{ item.statustext }}</v-chip>
              </td>
            </tr>
          </tbody>
        </template>
      </v-table>
    </v-card-text>
  </v-card>
</template>