<script setup lang="ts">
const props = defineProps({
  heading: String,
  total : String
});
</script>

<template>
  <v-card>
    <v-card-title>
      
    </v-card-title>
    <v-toolbar color="transparent">
      <v-toolbar-title class="font-weight-medium">
        {{ heading }} -> {{ total }}
      </v-toolbar-title>

      <v-spacer></v-spacer>
    </v-toolbar>
    <v-divider></v-divider>
    <div class="pa-5">
      <slot />
    </div>
  </v-card>
</template>