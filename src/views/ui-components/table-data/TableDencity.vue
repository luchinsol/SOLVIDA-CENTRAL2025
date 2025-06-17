<script setup lang="ts">
import { ref, onMounted } from "vue";
import axios from "axios";

// Definir la estructura del pedido
interface Pedido {
  id: number;
  nombreCompleto: string;
  telefono: string; 
  direccion: string;
  latitud: number;  // Nuevo campo
  longitud: number; // Nuevo campo
  total: number;
  estado: string;
  distribuidor: string;
  fecha: string; // Nuevo campo para la fecha
}

// Definir la estructura del detalle del pedido
interface ProductoInfo {
  id: number;
  nombre: string;
  descripcion: string;
  foto: string | null;
  valoracion: number;
  categoria: string;
}

interface DetallePedido {
  id: number;
  total: number;
  fecha: string;
  observacion: string;
  cliente_id: number;
  ubicacion_id: number;
  conductor_id: number;
  almacen_id: number;
  producto_id: number;
  cantidad: number;
  promocion_id: number;
  productoInfo: ProductoInfo;
}

interface DetallesPedidoResponse {
  detallesPedidos: DetallePedido[];
}

const pedidos = ref<Pedido[]>([]);
const loading = ref(true);
const error = ref("");
const detalleDialog = ref(false);
const detallesPedido = ref<DetallePedido[]>([]);
const pedidoSeleccionado = ref<number | null>(null);
const loadingDetalles = ref(false);

const showEstadoDialog = ref(false);
const selectedPedidoId = ref<number | null>(null);
const selectedEstado = ref<string | null>(null);
const observacion = ref("");
const processingAction = ref(false);

const formatearFecha = (fechaStr: string): string => {
  const fecha = new Date(fechaStr);
  
  fecha.setHours(fecha.getHours() + 5);
  // Formatear la fecha: DD/MM/YYYY HH:MM
  const dia = fecha.getDate().toString().padStart(2, '0');
  const mes = (fecha.getMonth() + 1).toString().padStart(2, '0');
  const anio = fecha.getFullYear();
  const hora = fecha.getHours().toString().padStart(2, '0');
  const minutos = fecha.getMinutes().toString().padStart(2, '0');
  
  return `${dia}/${mes}/${anio} ${hora}:${minutos}`;
};

// Obtener los pedidos del distribuidor en proceso
// Obtener los pedidos del distribuidor en proceso
const obtenerPedidos = async () => {
  loading.value = true;
  try {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
    const response = await axios.get(`${apiBaseUrl}/apigw/v1/pedido_distribuidor_enproceso`);

    // Verificar si hay datos válidos en la respuesta
    if (!response.data || !Array.isArray(response.data) || response.data.length === 0) {
      pedidos.value = [];
      return; // Salimos de la función, mostrará "No hay pedidos en proceso" en la tabla
    }

    // Mapear los datos según requerimiento con manejo defensivo
    pedidos.value = response.data.map((item: any) => {
      // Verificamos si existen los objetos necesarios
      const cliente = item.cliente || { nombres: 'No disponible', apellidos: '' };
      const telefono = item.telefono || { telefono: 'No disponible' };
      const ubicacion = item.ubicacion || { direccion: 'No disponible', latitud: 0, longitud: 0 };
      const conductor = item.conductor || { nombres: 'No disponible', apellidos: '' };

      return {
        id: item.id || 0,
        nombreCompleto: `${cliente.nombres} ${cliente.apellidos}`,
        telefono: telefono.telefono,
        direccion: ubicacion.direccion,
        latitud: ubicacion.latitud || 0,
        longitud: ubicacion.longitud || 0,
        total: item.total || 0,
        estado: item.estado || 'Desconocido',
        distribuidor: `${conductor.nombres} ${conductor.apellidos}`,
        fecha: formatearFecha(item.fecha || new Date())
      };
    });

  } catch (err) {
    console.error("Error al obtener los pedidos:", err);
    // En lugar de asignar al error, simplemente dejamos pedidos vacío
    pedidos.value = [];
    // No asignamos mensaje de error para que no aparezca el texto rojo
  } finally {
    loading.value = false;
  }
};

// Obtener los detalles de un pedido específico
const obtenerDetallesPedido = async (id: number) => {
  loadingDetalles.value = true;
  detallesPedido.value = [];
  pedidoSeleccionado.value = id;

  try {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;// || "http://localhost:3000";
    const response = await axios.get<DetallesPedidoResponse>(`${apiBaseUrl}/apigw/v1/pedido_distribuidor_detalles/${id}`);
    detallesPedido.value = response.data.detallesPedidos;
    detalleDialog.value = true;
  } catch (err) {
    console.error(`Error al obtener los detalles del pedido ${id}:`, err);
    error.value = "Error al cargar los detalles. Intente nuevamente.";
  } finally {
    loadingDetalles.value = false;
  }
};

const handleEditarEstado = (id: number) => {
  selectedPedidoId.value = id;
  selectedEstado.value = null;
  observacion.value = "";
  showEstadoDialog.value = true;
};

const actualizarEstadoPedido = async () => {
  if (!selectedPedidoId.value || !selectedEstado.value) return;
  
  processingAction.value = true;
  
  try {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;// || "http://localhost:3000";
    
    await axios.put(
      `${apiBaseUrl}/apigw/v1/pedido_distribuidor_almacen/${selectedPedidoId.value}`,
      {
        estado: selectedEstado.value,
        observacion: observacion.value || `Pedido ${selectedPedidoId.value} ${selectedEstado.value}`
      }
    );

    // Actualizar lista de pedidos después de la modificación
    await obtenerPedidos();
    showEstadoDialog.value = false;
  } catch (err) {
    console.error("Error al actualizar estado del pedido:", err);
    error.value = "Error al actualizar el estado. Intente nuevamente.";
  } finally {
    processingAction.value = false;
  }
};

// Cargar los datos al montar el componente
onMounted(() => {
  obtenerPedidos();
});
</script>

<template>
  <!-- ----------------------------------------------------------------------------- -->
  <!-- Pedidos en proceso -->
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
            <th class="text-left">Fecha</th>
            <th class="text-left">Acciones</th>
            <th class="text-left">Distribuidor</th>
          </tr>
        </thead>
        <tbody style="background-color:wheat; color: black;">
          <tr v-if="loading" colspan="9">
            <td colspan="9" class="text-center">Cargando datos...</td>
          </tr>
          <tr v-else-if="pedidos.length === 0">
    <td colspan="9" class="text-center">No hay datos disponibles</td>
  </tr>
          <tr v-for="pedido in pedidos" :key="pedido.id">
            <td>{{ pedido.id }}</td>
            <td>{{ pedido.nombreCompleto }}</td>
            <td>{{ pedido.telefono }}</td>
            <td>
              <div class="d-flex flex-column">
                {{ pedido.direccion }}
                <a 
                  :href="`https://www.google.com/maps?q=${pedido.latitud},${pedido.longitud}`" 
                  target="_blank" 
                  class="maps-link"
                >
                  <v-icon size="small" class="mr-1">mdi-map-marker</v-icon>
                  Ver en Google Maps
                </a>
              </div>
            </td>
            <td>S/ {{ pedido.total.toFixed(2) }}</td>
            <td>{{ pedido.estado }}</td>
            <td>{{ pedido.fecha }}</td>
            <td>
              <div class="d-flex gap-2">
                <v-btn size="small" color="primary" icon @click="obtenerDetallesPedido(pedido.id)">
                  <v-icon>mdi-eye</v-icon>
                </v-btn>
                <v-btn size="small" color="success" icon @click="handleEditarEstado(pedido.id)">
                  <v-icon>mdi-pencil</v-icon>
                </v-btn>
              </div>
            </td>
            <td>{{ pedido.distribuidor }}</td>
          </tr>
        </tbody>
      </v-table>
    </div>

    <!-- Dialog para mostrar los detalles del pedido -->
    <v-dialog v-model="detalleDialog" max-width="500" position="center" class="mx-auto">
      <v-card class="mx-auto rounded-lg elevation-10 border">
        <v-card-title class="d-flex justify-center pa-4 bg-primary text-white rounded-t-lg">
          <div class="text-h5 font-weight-bold">Pedido #{{ pedidoSeleccionado }}</div>
        </v-card-title>

        <v-card-text class="pa-6">
          <div v-if="loadingDetalles" class="d-flex flex-column align-center justify-center py-8">
            <v-progress-circular indeterminate color="primary" size="50" width="5"></v-progress-circular>
            <div class="mt-4 text-subtitle-1">Cargando detalles...</div>
          </div>

          <div v-else>
            <div class="text-h6 font-weight-medium text-center mb-6 pb-2 border-bottom">
              Detalles del pedido
            </div>

            <v-list v-if="detallesPedido.length > 0" class="bg-grey-lighten-4 rounded-lg pa-2">
              <v-list-item v-for="detalle in detallesPedido" :key="detalle.id"
                class="mb-2 rounded bg-white elevation-1">
                <v-list-item-title class="d-flex justify-space-between align-center pa-2">
                  <span class="font-weight-medium">{{ detalle.productoInfo.nombre }}</span>
                  <v-chip color="primary" size="small" class="ml-3">
                    {{ detalle.cantidad }} unidad(es)
                  </v-chip>
                </v-list-item-title>
              </v-list-item>
            </v-list>

            <div v-else class="d-flex justify-center align-center py-8 bg-grey-lighten-4 rounded-lg">
              <v-icon color="grey" class="mr-2">mdi-information-outline</v-icon>
              No se encontraron detalles para este pedido
            </div>
          </div>
        </v-card-text>

        <v-card-actions class="pa-4 d-flex justify-center">
          <v-btn color="primary" variant="contained"  rounded min-width="120" @click="detalleDialog = false">
            Cerrar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>



    <!-- Diálogo para selección de almacén -->
    <v-dialog v-model="showEstadoDialog" max-width="500" position="center" class="mx-auto estado-dialog-container">
      <v-card>
        <v-card-title class="pa-4 bg-primary text-white">
          Actualizar Estado del Pedido
        </v-card-title>

        <v-card-text class="pa-6">
          <div class="text-h6 text-center mb-4">Seleccione la acción a realizar:</div>

          <v-row justify="center">
            <v-col cols="6">
              <v-btn block :color="selectedEstado === 'entregado' ? 'success' : 'grey-lighten-2'" height="100"
                @click="selectedEstado = 'entregado'">
                <div class="d-flex flex-column align-center">
                  <v-icon size="40">mdi-check-circle</v-icon>
                  <span class="mt-2">Entregado</span>
                </div>
              </v-btn>
            </v-col>
            <v-col cols="6">
              <v-btn block :color="selectedEstado === 'anulado' ? 'error' : 'grey-lighten-2'" height="100"
                @click="selectedEstado = 'anulado'">
                <div class="d-flex flex-column align-center">
                  <v-icon size="40">mdi-cancel</v-icon>
                  <span class="mt-2">Anulado</span>
                </div>
              </v-btn>
            </v-col>
          </v-row>

          <v-textarea v-model="observacion" label="Observación" 
            placeholder="Ingrese una observación sobre el pedido" 
            class="mt-6" rows="3" variant="outlined">
          </v-textarea>
        </v-card-text>

        <v-card-actions class="pa-4 d-flex justify-end">
          <v-btn color="error" variant="text" @click="showEstadoDialog = false" :disabled="processingAction">
            Cancelar
          </v-btn>
          <v-btn color="primary" variant="contained" :disabled="!selectedEstado || processingAction" 
            @click="actualizarEstadoPedido" :loading="processingAction">
            Confirmar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
.text-error {
  color: red;
}

/* Asegurar que el encabezado permanezca sobre el contenido */
.v-table thead {
  position: sticky;
  top: 0;
  z-index: 1000;
  background: #fff;
  /* Color del encabezado */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  /* Opcional: sombra para mejor separación */
}

/* Fondo para las celdas del cuerpo */
.v-table tbody tr td {
  background-color: wheat;
  position: relative;
  z-index: 1;
}

/* Asegurar que las celdas de acciones tengan fondo */
.v-table tbody tr td:last-child {
  background-color: inherit;
}

/* Centrar el diálogo */
.v-dialog {
  margin: 0 auto !important;
  position: fixed !important;
  top: 50% !important;
  left: 50% !important;
  transform: translate(-50%, -50%) !important;
}

.warehouse-dialog-container {
  margin: 0 auto !important;
  position: fixed !important;
  top: 50% !important;
  left: 50% !important;
  transform: translate(-50%, -50%) !important;
}

/* Estilo para el borde inferior */
.border-bottom {
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}

/* Añadir borde al card */
.border {
  border: 1px solid rgba(0, 0, 0, 0.1);
}
/* Estilo para el enlace de Google Maps */
.maps-link {
  color: #1976d2;
  font-size: 0.8rem;
  text-decoration: none;
  display: flex;
  align-items: center;
  margin-top: 4px;
}

.maps-link:hover {
  text-decoration: underline;
}
</style>