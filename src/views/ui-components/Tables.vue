<script setup lang="ts">
import { ref } from "vue";
import BaseCard from "@/components/BaseCard.vue";

import TableDencity from "./table-data/TableDencity.vue";
import TableFixHeight from "./table-data/TableFixHeight.vue";
import TableFixHeader from "./table-data/TableFixHeader.vue";
</script>

<template>
  <v-container fluid class="down-top-padding">
    <v-row>
      <v-col cols="12" sm="12">
        <BaseCard heading="Pendientes" total="49">

          <TableFixHeader />
        </BaseCard>
      </v-col>
      <v-col cols="12" sm="12">
        <BaseCard heading="En proceso" total="29">
          <TableDencity />
        </BaseCard>
      </v-col>
      <v-col cols="12" sm="12">
        <BaseCard heading="Entregados" total="39">
          <TableFixHeight />
        </BaseCard>
      </v-col>
    </v-row>
  </v-container>
</template>
