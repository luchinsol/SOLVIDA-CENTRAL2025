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
  {
    name: "Lollipop",
    calories: 392,
  },
  {
    name: "Honeycomb",
    calories: 408,
  },
  {
    name: "Donut",
    calories: 452,
  },
  {
    name: "KitKat",
    calories: 518,
  },
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
  {
    name: "Lollipop",
    calories: 392,
  },
  {
    name: "Honeycomb",
    calories: 408,
  },
  {
    name: "Donut",
    calories: 452,
  },
  {
    name: "KitKat",
    calories: 518,
  },
]);
</script>

<template>
  <!-- ----------------------------------------------------------------------------- -->
  <!-- Props -->
  <!-- ----------------------------------------------------------------------------- -->
  <v-card
    
  >
  <v-card-title>
    Alto Selva Alegre
  </v-card-title>
  
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
        <tbody style="background-color:mediumblue; color: white;">
          <tr v-for="item in desserts" :key="item.name">
            <td>{{ item.calories }}</td>
            <td>{{ item.name }}</td>
            
          </tr>
        </tbody>
      </v-table>
    </div>
  </v-card>
</template>
