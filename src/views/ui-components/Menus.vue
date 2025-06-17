<script setup lang="ts">
import { ref } from "vue";
import BaseCard from "@/components/BaseCard.vue";

import MenusAnchor from "@/components/vuetifyComponents/menus/MenusAnchor.vue";


</script>

<template>
  <v-row>
    <v-col cols="12" sm="12">
      <BaseCard heading="Informes Mensuales">
        <MenusAnchor />
      </BaseCard>
    </v-col>
  </v-row>
</template>
