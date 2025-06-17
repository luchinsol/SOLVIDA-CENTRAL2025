<script setup lang="ts">
import { ref, onMounted, onUnmounted  } from "vue";
import axios from "axios";
import { io } from "socket.io-client";


// Definir la estructura del pedido
interface Pedido {
  id: number;
  total: number;
  estado: string;
  fecha: string; // Nuevo campo para fecha
  cliente: {
    nombres: string;
    apellidos: string;
  };
  telefono: {
    telefono: string;
  };
  ubicacion: {
    direccion: string;
    latitud: number; // Añadido el campo de latitud
    longitud: number; // Añadido el campo de longitud
  };
  almacen: {
    nombre: string;
  };
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

// Interfaz para la respuesta del PUT
interface PedidoActualizadoResponse {
  id: number;
  cliente_id: number;
  subtotal: number;
  descuento: number;
  total: number;
  fecha: string;
  tipo: string;
  foto: string | null;
  estado: string;
  observacion: string;
  tipo_pago: string;
  beneficiado_id: number | null;
  ubicacion_id: number;
  conductor_id: number | null;
  almacen_id: number;
  almacenAnterior: number;
}


interface Almacen {
  id: number;
  nombre: string;
  latitud: number;
  longitud: number;
  horario: string;
  departamento: string;
  provincia: string;
  direccion: string;
}

// Nuevas variables para el diálogo de actualización de estado
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
// Obtener la URL del socket desde variables de entorno
const socketPedidosUrl = (import.meta.env.VITE_SOCKET_URL as string);// || "http://localhost:5010";
const socket = io(socketPedidosUrl, {
  transports: ['websocket'], 
  reconnection: true
});

// Escuchar eventos del servidor
socket.on("connect", () => {
  console.log("Conectado al servidor de pedidos via Socket.IO");
});

socket.on("rotacion_manual_completada", (data) => {
  console.log("Rotación exitosa:", data);
  // Actualizar UI aquí (ej. recargar pedidos)
});

socket.on("rotacion_manual_error", (error) => {
  console.error("Error en rotación:", error);
});

// Limpiar al desmontar el componente
onUnmounted(() => {
  socket.disconnect();
});

const pedidos = ref<Pedido[]>([]);
const loading = ref(true);
const error = ref("");
const detalleDialog = ref(false);
const detallesPedido = ref<DetallePedido[]>([]);
const pedidoSeleccionado = ref<number | null>(null);
const loadingDetalles = ref(false);

// Variables para el modal de edición de almacén
const editAlmacenDialog = ref(false);
const selectedWarehouse = ref<number | null>(null);
const editPedidoId = ref<number | null>(null);
const almacenes = ref<Almacen[]>([]);
const loadingAlmacenes = ref(false);

const obtenerAlmacenes = async () => {
  loadingAlmacenes.value = true;
  try {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
    const response = await axios.get<Almacen[]>(`${apiBaseUrl}/apigw/v1/almacen`);
    almacenes.value = response.data;
  } catch (err) {
    console.error("Error al obtener los almacenes:", err);
    error.value = "Error al cargar los almacenes. Intente nuevamente.";
    almacenes.value = [];
  } finally {
    loadingAlmacenes.value = false;
  }
};

const obtenerPedidos = async () => {
  loading.value = true;
  try {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
    const response = await axios.get(`${apiBaseUrl}/apigw/v1/pedido_distribuidor_pendiente`);
    
    // Verificar si hay datos válidos en la respuesta
    if (!response.data || !Array.isArray(response.data) || response.data.length === 0) {
      pedidos.value = [];
      return; // Salimos de la función, mostrará "No hay pedidos pendientes" en la tabla
    }
    
    pedidos.value = response.data.map((item) => ({
      ...item,
      // Asegurarse de que todos los campos necesarios existen
      cliente: item.cliente || { nombre: 'No disponible', apellidos: '' },
      telefono: item.telefono || { telefono: 'No disponible' },
      ubicacion: item.ubicacion || { direccion: 'No disponible', latitud: 0, longitud: 0 },
      almacen: item.almacen || { nombre: 'No disponible' },
      fecha: formatearFecha(item.fecha || new Date())
    }));
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
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
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

const actualizarAlmacen = async () => {
  if (!editPedidoId.value || !selectedWarehouse.value) return;

  try {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
    
    // Llamar al endpoint para actualizar el almacén
    const response = await axios.put<PedidoActualizadoResponse>(
      `${apiBaseUrl}/apigw/v1/pedido_rotado/${editPedidoId.value}`,
      { almacen_id: selectedWarehouse.value }
    );

    // Extraer datos de la respuesta JSON
    const pedidoActualizado = response.data;
    
    // Si la actualización fue exitosa, emitir el evento de socket desde el frontend
    // usando los datos devueltos por la API
    socket.emit('rotacion_manual', {
      pedidoId: pedidoActualizado.id,
      almacenActual: pedidoActualizado.almacenAnterior,
      almacenDestino: pedidoActualizado.almacen_id
    });
    
    console.log("Evento de rotación manual emitido desde el frontend con datos:", {
      pedidoId: pedidoActualizado.id,
      almacenActual: pedidoActualizado.almacenAnterior,
      almacenDestino: pedidoActualizado.almacen_id
    });
    
    // Actualizar la lista de pedidos
    await obtenerPedidos();
    editAlmacenDialog.value = false;
    selectedWarehouse.value = null;
  } catch (error) {
    console.error("Error al actualizar almacén:", error);
    // También podríamos emitir un evento de error si lo deseamos
    socket.emit('rotacion_manual_error', {
      pedidoId: editPedidoId.value,
      error: "Error al actualizar el almacén"
    });
  }
};

const handleEditarAlmacen = async  (id: number) => {
  editPedidoId.value = id;
  if (almacenes.value.length === 0) {
    await obtenerAlmacenes();
  }
  editAlmacenDialog.value = true;
};

// Función para abrir el diálogo de actualización de estado
const handleActualizarEstado = (id: number) => {
  selectedPedidoId.value = id;
  selectedEstado.value = null;
  observacion.value = "";
  showEstadoDialog.value = true;
};

// Función para actualizar el estado del pedido
const actualizarEstadoPedido = async () => {
  if (!selectedPedidoId.value || !selectedEstado.value) return;
  
  processingAction.value = true;
  
  try {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
    
    await axios.put(
      `${apiBaseUrl}/apigw/v1/pedido_distribuidor_almacen/${selectedPedidoId.value}`,
      {
        estado: selectedEstado.value,
        observacion: observacion.value || `Pedido ${selectedPedidoId.value} ${selectedEstado.value}`
      }
    );

    await obtenerPedidos();
    showEstadoDialog.value = false;
  } catch (err) {
    console.error("Error al actualizar estado del pedido:", err);
    error.value = "Error al actualizar el estado. Intente nuevamente.";
  } finally {
    processingAction.value = false;
  }
};

onMounted(() => {
  obtenerPedidos();
});
</script>

<template>
  <div>
    <div class="mt-4">
      <v-table height="300px" fixed-header class="order-table">
        <thead>
          <tr class="header-row">
            <th class="text-left table-header">Id</th>
            <th class="text-left table-header">Nombre</th>
            <th class="text-left table-header">Teléfono</th>
            <th class="text-left table-header">Dirección</th>
            <th class="text-left table-header">Total</th>
            <th class="text-left table-header">Estado</th>
            <th class="text-left table-header">Fecha</th>
            <th class="text-left table-header" style="width: 100px; min-width: 100px;">Acciones</th>
            <th class="text-left table-header">Almacen</th>
          </tr>
        </thead>
        <tbody class="table-body">
          <tr v-if="loading">
            <td colspan="9" class="text-center">Cargando datos...</td>
          </tr>
          <tr v-else-if="pedidos.length === 0">
    <td colspan="9" class="text-center">No hay datos disponibles</td>
  </tr>
          <tr v-for="pedido in pedidos" :key="pedido.id" class="table-row">
            <td>{{ pedido.id }}</td>
            <td>{{ `${pedido.cliente.nombres} ${pedido.cliente.apellidos}` }}</td>
            <td>{{ pedido.telefono.telefono }}</td>
            <td>
              <div class="d-flex flex-column">
                {{ pedido.ubicacion.direccion }}
                <a 
                  :href="`https://www.google.com/maps?q=${pedido.ubicacion.latitud},${pedido.ubicacion.longitud}`" 
                  target="_blank" 
                  class="maps-link"
                >
                  <v-icon size="small" class="mr-1">mdi-map-marker</v-icon>
                  Ver en Google Maps
                </a>
              </div>
            </td>
            <td>S/ {{ pedido.total?.toFixed(2) || '0.00' }}</td>
            <td>{{ pedido.estado }}</td>
            <td>{{ pedido.fecha }}</td>
            <td style="width: 100px; min-width: 100px; position: relative;">
              <div class="d-flex gap-2 justify-center">
                <v-btn size="small" class="action-btn view-btn" icon @click="obtenerDetallesPedido(pedido.id)">
                  <v-icon>mdi-eye</v-icon>
                </v-btn>
                <v-btn size="small" class="action-btn edit-btn" icon @click="handleEditarAlmacen(pedido.id)">
                  <v-icon>mdi-pencil</v-icon>
                </v-btn>
                <!-- Nuevo botón para actualizar estado -->
                <v-btn size="small" class="action-btn status-btn" icon @click="handleActualizarEstado(pedido.id)">
                  <v-icon>mdi-check</v-icon>
                </v-btn>
              </div>
            </td>
            <td>
              {{ pedido.almacen?.nombre || 'Sin asignar' }}
            </td>
          </tr>
        </tbody>
      </v-table>
    </div>

    <!-- Dialog para mostrar los detalles del pedido -->
    <v-dialog
      v-model="detalleDialog"
      max-width="550"
      position="center"
      class="mx-auto detail-dialog"
    >
      <v-card class="mx-auto rounded-lg elevation-10 border detail-card">
        <v-card-title class="d-flex justify-center pa-4 dialog-header text-white rounded-t-lg">
          <div class="text-h5 font-weight-bold">Pedido #{{ pedidoSeleccionado }}</div>
        </v-card-title>
        
        <v-card-text class="pa-6">
          <div v-if="loadingDetalles" class="d-flex flex-column align-center justify-center py-8">
            <v-progress-circular 
              indeterminate 
              color="indigo" 
              size="50"
              width="5"
            ></v-progress-circular>
            <div class="mt-4 text-subtitle-1">Cargando detalles...</div>
          </div>
          
          <div v-else>
            <div class="text-h6 font-weight-medium text-center mb-6 pb-2 border-bottom">
              Detalles del pedido
            </div>
            
            <v-list v-if="detallesPedido.length > 0" class="detail-list rounded-lg pa-2">
              <v-list-item
                v-for="detalle in detallesPedido"
                :key="detalle.id"
                class="mb-2 rounded list-item elevation-1"
              >
                <v-list-item-title class="d-flex justify-space-between align-center pa-2">
                  <span class="font-weight-medium">{{ detalle.productoInfo.nombre }}</span>
                  <v-chip color="indigo" class="ml-3 quantity-chip" size="small">
                    {{ detalle.cantidad }} unidad(es)
                  </v-chip>
                </v-list-item-title>
              </v-list-item>
            </v-list>
            
            <div v-else class="d-flex justify-center align-center py-8 no-details rounded-lg">
              <v-icon color="grey" class="mr-2">mdi-information-outline</v-icon>
              No se encontraron detalles para este pedido
            </div>
          </div>
        </v-card-text>
        
        <v-card-actions class="pa-4 d-flex justify-center">
          <v-btn 
            color="indigo" 
            variant="contained"
            rounded 
            min-width="120" 
            class="close-btn"
            @click="detalleDialog = false"
          >
            Cerrar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="editAlmacenDialog" max-width="500" position="center" class="mx-auto warehouse-dialog-container">
    <v-card class="warehouse-dialog">
      <v-card-title class="pa-4 dialog-header text-white">
        Seleccionar Almacén
      </v-card-title>

      <v-card-text class="pa-6">
        <div class="text-h6 text-center mb-4">Seleccione el almacén destino:</div>

        <div v-if="loadingAlmacenes" class="d-flex justify-center my-4">
            <v-progress-circular indeterminate color="indigo"></v-progress-circular>
          </div>

          <v-row justify="center" v-else>
            <v-col cols="6" md="3" v-for="almacen in almacenes" :key="almacen.id">
              <v-btn 
                block 
                :class="['warehouse-btn', selectedWarehouse === almacen.id ? 'selected' : '']" 
                height="100" 
                @click="selectedWarehouse = almacen.id"
              >
                <div class="d-flex flex-column align-center">
                  <v-icon size="40">mdi-warehouse</v-icon>
                  <span class="mt-2 text-center">Almacén {{ almacen.id }} - {{ almacen.nombre.replace('Almacen', '').replace('de', '').trim() }}</span>
                </div>
              </v-btn>
            </v-col>
          </v-row>
      </v-card-text>

      <v-card-actions class="pa-4 d-flex justify-end">
        <v-btn color="error" variant="text" @click="editAlmacenDialog = false">
          Cancelar
        </v-btn>
        <v-btn 
          color="indigo" 
          variant="contained" 
          :disabled="!selectedWarehouse" 
          @click="actualizarAlmacen"
          class="confirm-btn"
        >
          Confirmar
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

  <!-- Nuevo diálogo para actualización de estado -->
    <v-dialog v-model="showEstadoDialog" max-width="500" position="center" class="mx-auto estado-dialog-container">
      <v-card class="estado-dialog">
        <v-card-title class="pa-4 dialog-header text-white">
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

          <v-textarea 
            v-model="observacion" 
            label="Observación" 
            placeholder="Ingrese una observación sobre el pedido" 
            class="mt-6" 
            rows="3" 
            variant="outlined"
          ></v-textarea>
        </v-card-text>

        <v-card-actions class="pa-4 d-flex justify-end">
          <v-btn color="error" variant="text" @click="showEstadoDialog = false" :disabled="processingAction">
            Cancelar
          </v-btn>
          <v-btn 
            color="indigo" 
            variant="contained" 
            :disabled="!selectedEstado || processingAction" 
            @click="actualizarEstadoPedido" 
            :loading="processingAction"
            class="confirm-btn"
          >
            Confirmar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>


  </div>
</template>

<style scoped>
.text-error {
  color: #ff5252;
}

.order-table {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.v-table thead {
  position: sticky;
  top: 0;
  z-index: 1000;
  background: #f5f5f5; /* Color claro para el encabezado */
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-row {
  background-color: #f5f5f5;
}

.table-header {
  font-weight: 600 !important;
  padding: 16px !important;
  color: #05131a  !important; /* Color índigo oscuro para los títulos */
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 2px solid #3949AB !important;
}

.table-body {
  background-color: #42A5F5; /* Indigo 700 */
  color: white;
}

.table-row:hover {
  background-color: #0288D1 !important; /* Indigo 800 - hover effect */
}

.v-table tbody tr td {
  background-color: transparent;
  position: relative;
  z-index: 1;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.action-btn {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease;
  margin: 0 4px;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.view-btn {
  background: #5C6BC0 !important; /* Indigo 400 */
  color: white !important;
}

.edit-btn {
  background: #81D4FA !important; /* Indigo 300 */
  color: white !important;
}

/* Centrar el diálogo */
.detail-dialog {
  margin: 0 auto !important;
  position: fixed !important;
  top: 50% !important;
  left: 50% !important;
  transform: translate(-50%, -50%) !important;
}

.detail-card {
  border-radius: 12px;
  overflow: hidden;
  background: #F5F7FF;
}

.dialog-header {
  background: linear-gradient(135deg, #64B5F6, #5C6BC0);
}

/* Estilo para el borde inferior */
.border-bottom {
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}

/* Añadir borde al card */
.border {
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.detail-list {
  background-color: #E8EAF6 !important; /* Indigo 50 */
}

.list-item {
  background: white;
  transition: all 0.2s ease;
  border-left: 4px solid #3949AB;
}

.list-item:hover {
  transform: translateX(4px);
}

.quantity-chip {
  font-weight: 500;
  color: white;
}

.no-details {
  background-color: #E8EAF6;
  color: #4FC3F7;
}

.close-btn {
  font-weight: 500;
  letter-spacing: 1px;
  box-shadow: 0 4px 12px rgba(63, 81, 181, 0.3);
  transition: all 0.3s ease;
}

.close-btn:hover {
  box-shadow: 0 6px 14px rgba(63, 81, 181, 0.4);
  transform: translateY(-2px);
}

/* Estilos para el modal de edición de almacén */
.warehouse-dialog {
  border-radius: 12px;
  overflow: hidden;
  background: #F5F7FF;
}

.warehouse-dialog-container {
  margin: 0 auto !important;
  position: fixed !important;
  top: 50% !important;
  left: 50% !important;
  transform: translate(-50%, -50%) !important;
}

.warehouse-btn {
  background-color: #E8EAF6 !important;
  color: #3949AB !important;
  border-radius: 8px;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.warehouse-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 12px rgba(63, 81, 181, 0.2);
}

.warehouse-btn.selected {
  background-color: #C5CAE9 !important;
  border: 2px solid #3F51B5;
  box-shadow: 0 4px 10px rgba(63, 81, 181, 0.3);
}

.confirm-btn {
  font-weight: 500;
  letter-spacing: 1px;
  box-shadow: 0 4px 12px rgba(63, 81, 181, 0.3);
  transition: all 0.3s ease;
}

.confirm-btn:hover {
  box-shadow: 0 6px 14px rgba(63, 81, 181, 0.4);
  transform: translateY(-2px);
}

.maps-link {
  color: white;
  font-size: 0.8rem;
  text-decoration: none;
  display: flex;
  align-items: center;
  margin-top: 4px;
  transition: all 0.2s ease;
}

.maps-link:hover {
  color: #E1F5FE;
  text-decoration: underline;
}
</style>