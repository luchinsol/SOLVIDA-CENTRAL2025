<script setup lang="ts">
import { ref } from "vue";

const select = ref("March");
const items = ref(["March", "April", "May", "June"]);

const monthtable = ref([
  {
    id: 1,
    activestate: "",
    leadname: "Sunil Joshi",
    leademail: "Web Designer",
telefono:"9999999",
statuscolor: "info",
    statustext: 5,

  },
  {
    id: 2,
    activestate: "",
    leadname: "Andrew",
    leademail: "Project Manager",
    telefono:"9999999",
 
    statuscolor: "info",
    statustext: 5,
    money: "$23.9K",
  },
  {
    id: 3,
    activestate: "",
    leadname: "Bhavesh patel",
    leademail: "Developer",
    telefono:"9999999",
    statuscolor: "info",
    statustext: 5,
    money: "$12.9K",
  },
  {
    id: 4,
    activestate: "",
    leadname: "Nirav Joshi",
    leademail: "Frontend Eng",
    projectname: "Elite Admin",
    telefono:"9999999",
    statuscolor: "info",
    statustext: 5,
    money: "$10.9K",
  },
]);
</script>

<template>
  <v-card flat class="w-100 h-100">
    <v-card-text>
      <div class="d-sm-flex align-center">
        <div>
          <h2 class="title text-h6 font-weight-medium">Distribuidores</h2>
        </div>
        
      </div>
      <v-table class="month-table mt-7">
        <template v-slot:default>
          <thead>
            <tr>
              <th class="font-weight-medium text-subtitle-1">Id</th>
              
              <th class="font-weight-medium text-subtitle-1">Nombre</th>
              <th class="font-weight-medium text-subtitle-1">Teléfono</th>

              <th class="font-weight-medium text-subtitle-1">Cantidad de pedidos</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in monthtable"
              :key="item.leadname"
              :class="item.activestate"
              class="month-item"
            >
              <td>{{ item.id }}</td>
              <td>
                <h4 class="font-weight-bold text-no-wrap">
                  {{ item.leadname }}
                </h4>
                <h6
                  class="
                    text-no-wrap
                    font-weight-regular
                    text-body-2 text-grey-darken-1
                  "
                >
                  {{ item.leademail }}
                </h6>
              </td>
              <td>
                <h4>
                  {{ item.telefono }}
                </h4>
              </td>
              <td>
                <v-chip
                  class="ma-2"
                  :color="item.statuscolor"
                  size="small"
                  label
                  >{{ item.statustext }}</v-chip
                >
              </td>
              
            </tr>
          </tbody>
        </template>
      </v-table>
    </v-card-text>
  </v-card>
</template>
