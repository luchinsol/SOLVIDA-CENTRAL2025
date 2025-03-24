<script setup lang="ts">
import { ref } from "vue";

const desserts = ref([
  {
    name: "Frozen Yogurt",
    calories: 159,
  },
  {
    name: "Ice cream sandwich",
    calories: 237,
  },
  {
    name: "Eclair",
    calories: 262,
  },
  {
    name: "Cupcake",
    calories: 305,
  },
  {
    name: "Gingerbread",
    calories: 356,
  },
  {
    name: "Jelly bean",
    calories: 375,
  },
  
]);
</script>

<template>
  <!-- ----------------------------------------------------------------------------- -->
  <!-- Dencity -->
  <!-- ----------------------------------------------------------------------------- -->
  <div>
    
    <div class="mt-4">
      <v-table height="300px" fixed-header>
        <thead>
          <tr>
            <th class="text-left">Id</th>
            <th class="text-left">Nombre</th>
            <th class="text-left">Teléfono</th>
            <th class="text-left">Dirección</th>
            <th class="text-left">Total</th>
            <th class="text-left">Estado</th>
            <th class="text-left">Acciones</th>
          </tr>
        </thead>
        <tbody style="background-color:wheat; color: black;">
          <tr v-for="item in desserts" :key="item.name">
            <td>{{ item.name }}</td>
            <td>{{ item.calories }}</td>
          </tr>
        </tbody>
      </v-table>
    </div>
  </div>
</template>

<style scoped>

</style>
