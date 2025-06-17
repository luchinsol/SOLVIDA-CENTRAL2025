<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import axios from 'axios';

// Base URL configuration with fallback
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

// Definir interfaces para los datos esperados
interface Distribuidor {
  nombres: string;
  apellidos: string;
}

interface AlmacenData {
  almacen_id: number;
  total_pedidos: number;
  distribuidor?: Distribuidor[];
}

// Interface para los datos del pedido completo
interface PedidoCompleto {
  pedido: {
    id: number;
    total: number;
    estado: string;
    fecha: string;
  };
  cliente: {
    nombre: string;
    apellidos: string;
  };
  direccion: {
    direccion: string;
    latitud: number;
    longitud: number;
  };
  telefono: {
    telefono: string;
  };
  almacen: {
    nombre: string;
  };
}

// Interface para los detalles de un pedido específico
interface DetallePedido {
  clienteInfo: {
    id: number;
    nombre: string;
    apellidos: string;
  };
  direccion: {
    id: number;
    direccion: string;
    distrito: string;
  };
  detallesPedidos: Array<{
    total: number;
    producto_id: number;
    cantidad: number;
    promocion_id: number | null;
    productoInfo: {
      id: number;
      nombre: string;
      descripcion: string;
    }
  }>;
}

// Props para recibir la fecha seleccionada
const props = defineProps({
  selectedDate: {
    type: String,
    required: true
  }
});

// Emits para comunicarse con el componente padre
const emit = defineEmits(['update-date', 'update-title']);

// Variables locales
const showDialog = ref(false);
const showDetailDialog = ref(false);
const localSelectedDate = ref(props.selectedDate);
const pedidos = ref<PedidoCompleto[]>([]);
const loading = ref(false);
const almacenNombre = ref('Almacén Socabaya'); // Valor inicial ya corregido con "Almacén"
const detallesPedidoActual = ref<DetallePedido | null>(null);
const loadingDetalles = ref(false);
const pedidoIdActual = ref<number | null>(null);

// Constante para el ID de almacén específico para este componente
const ALMACEN_ID = 4; // Almacén ID 4 (Socabaya)

// Vigilar cambios en la prop selectedDate
watch(() => props.selectedDate, (newValue) => {
  localSelectedDate.value = newValue;
  // Cargar datos cuando cambia la fecha
  fetchDistributorData();
  fetchPedidosData();
});

// Cargar datos al montar el componente
onMounted(() => {
  // Llamar a las funciones en este orden específico
  fetchDistributorData();
  fetchPedidosData();
});

// Métodos
function formatDate(dateString: string) {
  // Parsear la fecha como local
  const [year, month, day] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1, day);

  return date.toLocaleDateString('es-PE', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
}

// Nueva función para formatear fecha y hora de pedidos
function formatDateTime(dateTimeString: string) {
  if (!dateTimeString) return 'N/A';

  const date = new Date(dateTimeString);

  date.setHours(date.getHours() + 5);

  // Formatear fecha como DD/MM/YYYY
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();

  // Formatear hora como HH:MM
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');

  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

function getGoogleMapsUrl(latitud: number, longitud: number): string {
  if (!latitud || !longitud) return '#';
  return `https://www.google.com/maps?q=${latitud},${longitud}`;
}

function openDialog() {
  showDialog.value = true;
}

function updateDate() {
  // Cerrar el diálogo
  showDialog.value = false;

  // Emitir evento al componente padre para actualizar la fecha
  emit('update-date', localSelectedDate.value);

  // Cargar datos con la nueva fecha
  fetchDistributorData();
  fetchPedidosData();
}

function fetchDistributorData() {
  // Usar la fecha seleccionada para la petición API
  const apiUrl = `${BASE_URL}/apigw/v1/pedido_distribuidor_conteo/${localSelectedDate.value}`;

  axios.get<AlmacenData[]>(apiUrl)
    .then(response => {
      // Filtrar datos para el almacen_id 4 (Socabaya)
      const almacenData = response.data.find((item: AlmacenData) => item.almacen_id === ALMACEN_ID);

      if (almacenData) {
        // Si hay distribuidores disponibles, actualizar la información en el componente padre
        if (almacenData.distribuidor && almacenData.distribuidor.length > 0) {
          const distribuidor = almacenData.distribuidor[0];
          const distributorTitle = `Distribuidor ${distribuidor.nombres} ${distribuidor.apellidos}`;

          // Emitir evento para actualizar el título en BaseCard
          emit('update-title', {
            title: distributorTitle,
            total: almacenData.total_pedidos
          });
        } else {
          // Si no hay distribuidor asignado, enviar un título genérico
          emit('update-title', {
            title: `Distribuidor Almacén Socabaya`,
            total: almacenData.total_pedidos || 0
          });
        }
      } else {
        // Si no se encontró el almacén, usar valores por defecto
        emit('update-title', {
          title: 'Distribuidor Almacén Socabaya',
          total: 0
        });
      }
    })
    .catch(error => {
      console.error('Error al obtener datos del distribuidor:', error);
      // En caso de error, usar valores por defecto
      emit('update-title', {
        title: 'Distribuidor Almacén Socabaya',
        total: 0
      });
    });
}

// Función para obtener los datos de pedidos
function fetchPedidosData() {
  loading.value = true;

  // Usar la URL con los parámetros proporcionados
  const apiUrl = `${BASE_URL}/apigw/v1/pedido_distribuidor_conteo_pedidos/${localSelectedDate.value}/${ALMACEN_ID}`;

  axios.get(apiUrl)
    .then(response => {
      // Si la respuesta es un objeto (un solo pedido), convertirlo en array
      const pedidosData = Array.isArray(response.data) ? response.data : [response.data];
      pedidos.value = pedidosData;

      // Actualizar el nombre del almacén si hay datos disponibles
      if (pedidosData.length > 0 && pedidosData[0].almacen && pedidosData[0].almacen.nombre) {
        // Concatenar "Almacén" con el nombre recibido de la API
        almacenNombre.value = `Almacén ${pedidosData[0].almacen.nombre}`;
      } else {
        // Si no hay datos o el nombre no está disponible, usar el valor por defecto
        almacenNombre.value = 'Almacén Socabaya';
      }
    })
    .catch(error => {
      console.error('Error al obtener datos de pedidos:', error);
      pedidos.value = [];
      // En caso de error, asegurar que el nombre esté correcto
      almacenNombre.value = 'Almacén Socabaya';
    })
    .then(() => {
      loading.value = false;
    });
}

// Nueva función para obtener detalles de un pedido específico
function verDetallePedido(pedidoId: number) {
  loadingDetalles.value = true;
  showDetailDialog.value = true;
  pedidoIdActual.value = pedidoId; // Guardar el ID del pedido actual

  const apiUrl = `${BASE_URL}/apigw/v1/pedido_distribuidor_detalles/${pedidoId}`;

  axios.get<DetallePedido>(apiUrl)
    .then(response => {
      detallesPedidoActual.value = response.data;
    })
    .catch(error => {
      console.error('Error al obtener detalles del pedido:', error);
      detallesPedidoActual.value = null;
    })
    .then(() => {
      loadingDetalles.value = false;
    });
}

function getEstadoChipColor(estado: string): string {
  switch (estado?.toLowerCase()) {
    case 'pendiente':
      return 'light-blue';
    case 'en proceso':
      return 'amber';
    case 'entregado':
      return 'light-green';
    case 'anulado':
      return 'red';
    default:
      return 'grey';
  }
}
</script>

<template>
  <v-card>
    <v-card-title class="d-flex justify-space-between align-center">
      <span>{{ almacenNombre }}</span>
      <div class="d-flex align-center">
        <!-- Visualización de la fecha -->
        <v-chip color="primary" class="mr-2" prepend-icon="mdi-calendar">
          {{ formatDate(localSelectedDate) }}
        </v-chip>

        <!-- Botón para abrir el calendario -->
        <v-btn color="primary" variant="text" prepend-icon="mdi-calendar" size="small" @click="openDialog">
          Seleccionar fecha
        </v-btn>
      </div>
    </v-card-title>

    <!-- Diálogo con el calendario nativo HTML -->
    <v-dialog v-model="showDialog" width="auto" :scrim="true" :fullscreen="false" overlay-opacity="0.8"
      transition="dialog-transition">
      <v-card>
        <v-card-text class="pa-4">
          <div class="d-flex flex-column align-center">
            <h3 class="mb-4 text-primary">Seleccione una fecha</h3>
            <input type="date" v-model="localSelectedDate" class="date-input" @change="updateDate" />
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Diálogo para mostrar detalles del pedido -->
    <v-dialog v-model="showDetailDialog" max-width="600px" :scrim="true" :fullscreen="false" overlay-opacity="0.8"
      transition="dialog-transition" position="center" class="mx-auto detail-dialog-container">
      <v-card class="mx-auto">
        <v-card-title class="text-h5 bg-primary text-white">
          <span v-if="pedidoIdActual !== null">Pedido #{{ pedidoIdActual }}</span>
          <span v-else>Detalle de Pedido</span>
        </v-card-title>

        <v-card-text class="pa-4">
          <div class="d-flex justify-center" v-if="loadingDetalles">
            <v-progress-circular indeterminate color="primary" class="my-6"></v-progress-circular>
          </div>

          <div v-else-if="detallesPedidoActual" class="detalle-pedido">
            <div class="info-row">
              <strong>Productos:</strong>
            </div>

            <v-list>
              <v-list-item v-for="(item, index) in detallesPedidoActual.detallesPedidos" :key="index">
                <v-list-item-title>
                  {{ item.productoInfo.nombre }} - {{ item.cantidad }} unidades
                </v-list-item-title>
              </v-list-item>
            </v-list>
          </div>

          <div v-else class="text-center my-4">
            No se pudieron cargar los detalles del pedido
          </div>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" variant="text" @click="showDetailDialog = false">
            Cerrar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <div class="mt-4">
      <v-table height="300px" fixed-header>
        <thead>
          <tr>
            <th class="text-left">Id</th>
            <th class="text-left">Nombre</th>
            <th class="text-left">Teléfono</th>
            <th class="text-left">Dirección</th>
            <th class="text-left">Fecha</th>
            <th class="text-left">Total</th>
            <th class="text-left">Estado</th>
            <th class="text-left">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <template v-if="loading">
            <tr>
              <td colspan="8" class="text-center">Cargando...</td>
            </tr>
          </template>
          <template v-else-if="pedidos.length === 0">
            <tr>
              <td colspan="8" class="text-center">No hay datos disponibles</td>
            </tr>
          </template>
          <template v-else>
            <tr v-for="item in pedidos" :key="item.pedido?.id || 'default'">
              <td>{{ item.pedido?.id }}</td>
              <td>{{ item.cliente?.nombre }} {{ item.cliente?.apellidos }}</td>
              <td>{{ item.telefono?.telefono }}</td>
              <td>
                <div>{{ item.direccion?.direccion }}</div>
                <div class="maps-link">
                  <a :href="getGoogleMapsUrl(item.direccion?.latitud, item.direccion?.longitud)" target="_blank"
                    class="google-maps-link">
                    <v-icon size="small" color="primary" class="mr-1">mdi-map-marker</v-icon>
                    Ver en Google Maps
                  </a>
                </div>
              </td>
              <td>{{ formatDateTime(item.pedido?.fecha) }}</td>
              <td>{{ item.pedido?.total }}</td>
              <td>
                <v-chip :color="getEstadoChipColor(item.pedido?.estado)" text-color="white" size="small"
                  class="font-weight-medium estado-chip">
                  {{ item.pedido?.estado }}
                </v-chip>
              </td>
              <td>
                <v-btn size="small" icon color="primary" @click="verDetallePedido(item.pedido?.id)">
                  <v-icon>mdi-eye</v-icon>
                </v-btn>
              </td>
            </tr>
          </template>
        </tbody>
      </v-table>
    </div>
  </v-card>
</template>

<style scoped>
.v-chip {
  min-width: 280px;
  font-size: 0.95rem;
  justify-content: start;
}

.v-card-title.bg-primary {
  background-color: rgb(var(--v-theme-primary)) !important;
}

.date-input {
  padding: 12px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: white;
  min-width: 200px;
  cursor: pointer;
}

.date-input::-webkit-calendar-picker-indicator {
  cursor: pointer;
  padding: 5px;
}

.detalle-pedido {
  padding: 10px 0;
}

.info-row {
  margin-bottom: 12px;
  font-size: 16px;
}

.info-row strong {
  font-weight: 600;
  margin-right: 8px;
}

.detail-dialog-container {
  margin: 0 auto !important;
  position: fixed !important;
  top: 50% !important;
  left: 50% !important;
  transform: translate(-50%, -50%) !important;
}

/* Nuevos estilos para la tabla */
.orders-table {
  background-color: #f8f9fa !important;
}

.orders-table thead th {
  background-color: #e9ecef !important;
  color: #212529 !important;
  font-weight: bold !important;
  font-size: 0.95rem !important;
}

.orders-table tbody td {
  color: #212529 !important;
  font-size: 0.9rem !important;
}

.orders-table tbody tr:nth-child(even) {
  background-color: #f2f2f2 !important;
}

.orders-table tbody tr:hover {
  background-color: #e2e6ea !important;
}

/* Estilo para los chips de estado */
.estado-chip {
  font-weight: 600 !important;
  min-width: 120px !important;
  width: auto !important;
  text-align: center !important;
  justify-content: center !important;
  padding: 0 16px !important;
}

/* Nuevos estilos para el enlace de Google Maps */
.maps-link {
  margin-top: 4px;
  font-size: 0.85rem;
}

.google-maps-link {
  display: inline-flex;
  align-items: center;
  color: var(--v-theme-primary);
  text-decoration: none;
  transition: all 0.2s ease;
}

.google-maps-link:hover {
  text-decoration: underline;
  opacity: 0.85;
}
</style>