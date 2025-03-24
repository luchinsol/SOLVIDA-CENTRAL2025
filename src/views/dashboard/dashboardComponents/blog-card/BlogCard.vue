<script setup lang="ts"></script>

<template>
  <v-row>
    <v-col cols="12" lg="4">
      <v-card class="pa-4">
        <v-container>
          <v-row justify="center" align="center">
            <v-col cols="8">
              <v-card color="blue" class="pa-4 text-center">
                <h2 class="title font-weight-medium mb-2 text-h6" style="color: white;">
                  5 Pendientes
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
                  5 En proceso
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
                  5 Entregados
                </h2>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
      </v-card>
    </v-col>
  </v-row>
</template>
