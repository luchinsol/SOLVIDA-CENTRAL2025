<script setup lang="ts">
import { ref } from "vue";
import BaseCard from "@/components/BaseCard.vue";
import CardsProps from "@/components/vuetifyComponents/cards/CardsProps.vue";
import CardsMedia from "@/components/vuetifyComponents/cards/CardsMedia.vue";
import CardsTwitter from "@/components/vuetifyComponents/cards/CardsTwitter.vue";
import CardsSlots from "@/components/vuetifyComponents/cards/CardsSlots.vue";

// Fechas independientes para cada componente
const propsSelectedDate = ref(getCurrentDate());
const mediaSelectedDate = ref(getCurrentDate());
const twitterSelectedDate = ref(getCurrentDate());
const slotsSelectedDate = ref(getCurrentDate()); // Añadida la declaración que faltaba

// Referencias para el título y total del primer BaseCard (CardsProps)
const propsCardTitle = ref("Distribuidor A");
const propsCardTotal = ref("30");

// Referencias para el título y total del segundo BaseCard (CardsMedia)
const mediaCardTitle = ref("Distribuidor A");
const mediaCardTotal = ref("30");

// Referencias para el título y total del tercer BaseCard (CardsTwitter)
const twitterCardTitle = ref("Distribuidor A");
const twitterCardTotal = ref("30");

// Referencias para el título y total del cuarto BaseCard (CardsSlots)
const slotsCardTitle = ref("Distribuidor A");
const slotsCardTotal = ref("30");

// Función para obtener la fecha actual en formato YYYY-MM-DD
function getCurrentDate() {
  const today = new Date();
  const year = today.getFullYear();
  // Solución para evitar padStart
  const month = (today.getMonth() + 1 < 10) ? '0' + (today.getMonth() + 1) : String(today.getMonth() + 1);
  const day = (today.getDate() < 10) ? '0' + today.getDate() : String(today.getDate());
    
  return `${year}-${month}-${day}`;
}

// Funciones independientes para actualizar cada fecha
function updatePropsDate(newDate: string) {
  propsSelectedDate.value = newDate;
}

function updateMediaDate(newDate: string) {
  mediaSelectedDate.value = newDate;
}

function updateTwitterDate(newDate: string) {
  twitterSelectedDate.value = newDate;
}

function updateSlotsDate(newDate: string) {
  slotsSelectedDate.value = newDate;
}

// Función para actualizar el título y total del primer BaseCard (CardsProps)
function updatePropsCardInfo(info: { title: string, total: string | number }) {
  propsCardTitle.value = info.title;
  propsCardTotal.value = String(info.total);
}

// Función para actualizar el título y total del segundo BaseCard (CardsMedia)
function updateMediaCardInfo(info: { title: string, total: string | number }) {
  mediaCardTitle.value = info.title;
  mediaCardTotal.value = String(info.total);
}

// Función para actualizar el título y total del tercer BaseCard (CardsTwitter)
function updateTwitterCardInfo(info: { title: string, total: string | number }) {
  twitterCardTitle.value = info.title;
  twitterCardTotal.value = String(info.total);
}

// Función para actualizar el título y total del cuarto BaseCard (CardsSlots)
function updateSlotsCardInfo(info: { title: string, total: string | number }) {
  slotsCardTitle.value = info.title;
  slotsCardTotal.value = String(info.total);
}
</script>

<template>
  <v-row>
    <v-col cols="12">
      <BaseCard :heading="propsCardTitle" :total="propsCardTotal">
        <!-- Pasar la fecha específica para el primer componente -->
        <CardsProps
          :selectedDate="propsSelectedDate"
          @update-date="updatePropsDate"
          @update-title="updatePropsCardInfo"
        />
      </BaseCard>
    </v-col>
    <v-col cols="12">
      <BaseCard :heading="mediaCardTitle" :total="mediaCardTotal">
        <!-- Pasar la fecha específica para el segundo componente -->
        <CardsMedia
          :selectedDate="mediaSelectedDate"
          @update-date="updateMediaDate"
          @update-title="updateMediaCardInfo"
        />
      </BaseCard>
    </v-col>
    <v-col cols="12">
      <BaseCard :heading="twitterCardTitle" :total="twitterCardTotal">
        <!-- Pasar la fecha específica para el tercer componente -->
        <CardsTwitter
          :selectedDate="twitterSelectedDate"
          @update-date="updateTwitterDate"
          @update-title="updateTwitterCardInfo"
        />
      </BaseCard>
    </v-col>
    <v-col cols="12">
      <BaseCard :heading="slotsCardTitle" :total="slotsCardTotal">
        <!-- Pasar la fecha específica para el cuarto componente -->
        <CardsSlots
          :selectedDate="slotsSelectedDate"
          @update-date="updateSlotsDate"
          @update-title="updateSlotsCardInfo"
        />
      </BaseCard>
    </v-col>
  </v-row>
</template>