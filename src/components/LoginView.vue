<template>
  <v-container style="width: 40%">
    <v-card class="pa-4">
      <v-img :src="pendiente" height="150px" cover></v-img>
      <v-card-title>Bienvenido a la central</v-card-title>
      <v-card-subtitle> Indica tus credenciales </v-card-subtitle>
      <div style="height: 30px"></div>
      <v-text-field label="Usuario"></v-text-field>
      <v-text-field
        v-model="password"
        :append-icon="show1 ? 'mdi-eye' : 'mdi-eye-off'"
        label="Contraseña"
        @click:append="show1 = !show1"
      ></v-text-field>
      <div>
        <v-btn color="blue" variant @click="ingreso"> Iniciar sesión </v-btn>
      </div>
    </v-card>
  </v-container>
</template>
<script setup>
import pendiente from "@/assets/images/background/pendiente2.jpg";
</script>
