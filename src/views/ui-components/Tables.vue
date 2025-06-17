<script setup lang="ts">
import { ref, onMounted } from "vue";
import axios from "axios";
import BaseCard from "@/components/BaseCard.vue";
import TableDencity from "./table-data/TableDencity.vue";
import TableFixHeight from "./table-data/TableFixHeight.vue";
import TableFixHeader from "./table-data/TableFixHeader.vue";
import NotificacionCliente from "./table-data/NotificacionCliente.vue";
import  LibroReclamaciones from "./table-data/LibroReclamaciones.vue";
import  SoporteTecnico from "./table-data/SoporteTecnico.vue";


// Define interface for the API response items
interface PedidoItem {
  estado: string;
  total: string;
}

const pendientesTotal = ref("0");
const enProcesoTotal = ref("0");
const entregadosTotal = ref("0");

const fetchData = async () => {
  try {
    // Use environment variable with fallback
    const baseURL = import.meta.env.VITE_API_BASE_URL; //|| "http://localhost:3000";
    const response = await axios.get<PedidoItem[]>(`${baseURL}/apigw/v1/pedido_distribuidor_total`);
    
    // Map the data to the corresponding totals
    response.data.forEach((item: PedidoItem) => {
      if (item.estado === "pendiente") {
        pendientesTotal.value = item.total;
      } else if (item.estado === "en proceso") {
        enProcesoTotal.value = item.total;
      } else if (item.estado === "entregado") {
        entregadosTotal.value = item.total;
      }
    });
  } catch (error) {
    console.error("Error fetching data:", error);
  }
};

onMounted(() => {
  fetchData();
});
</script>

<template>
  <v-container fluid class="down-top-padding">
    <v-row>
      <v-col cols="12" sm="12">
        <BaseCard heading="Pendientes" :total="pendientesTotal">
          <TableFixHeader />
        </BaseCard>
      </v-col>
      <v-col cols="12" sm="12">
        <BaseCard heading="En proceso" :total="enProcesoTotal">
          <TableDencity />
        </BaseCard>
      </v-col>
      <v-col cols="12" sm="12">
        <BaseCard heading="Entregados" :total="entregadosTotal">
          <TableFixHeight />
        </BaseCard>
      </v-col>
      <v-col cols="12" sm="12">
        <BaseCard heading="Notificación Cliente">
          <NotificacionCliente />
        </BaseCard>
      </v-col>
      <v-col cols="12" sm="12">
        <BaseCard heading="Libro de Reclamaciones">
          <LibroReclamaciones />
        </BaseCard>
      </v-col>
      <v-col cols="12" sm="12">
        <BaseCard heading="Soporte Técnico">
          <SoporteTecnico />
        </BaseCard>
      </v-col>
    </v-row>
  </v-container>
</template>