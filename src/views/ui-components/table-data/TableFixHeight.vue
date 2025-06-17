<script setup lang="ts">
import { ref, onMounted } from "vue";
import axios from "axios";

interface Pedido {
  id: number;
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
  distribuidor: {
    nombres: string;
    apellidos: string;
  }
  total: number;
  estado: string;
  fecha: string; // Nuevo campo para fecha
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

const pedidos = ref<Pedido[]>([]);
const loading = ref(true);
const error = ref("");
const detalleDialog = ref(false);
const detallesPedido = ref<DetallePedido[]>([]);
const pedidoSeleccionado = ref<number | null>(null);
const loadingDetalles = ref(false);

const showAnularDialog = ref(false);
const selectedPedidoId = ref<number | null>(null);
const observacion = ref("");
const processingAction = ref(false);

const cargarPedidos = async () => {
  loading.value = true;
  try {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
    const response = await axios.get(`${apiBaseUrl}/apigw/v1/pedido_distribuidor_entregado`);

    // Verificar si hay datos válidos en la respuesta
    if (!response.data || !Array.isArray(response.data) || response.data.length === 0) {
      pedidos.value = [];
      return; // Salimos de la función, mostrará "No hay pedidos entregados" en la tabla
    }

    // Mapear los datos según requerimiento con manejo defensivo
    pedidos.value = response.data.map((item: any) => {
      // Verificamos si existen los objetos necesarios
      const cliente = item.cliente || { nombres: 'No disponible', apellidos: '' };
      const telefono = item.telefono || { telefono: 'No disponible' };
      const ubicacion = item.ubicacion || { direccion: 'No disponible', latitud: 0, longitud: 0 };
      const distribuidor = item.distribuidor || { nombres: 'No disponible', apellidos: '' };

      return {
        id: item.id || 0,
        cliente: cliente,
        telefono: telefono,
        ubicacion: ubicacion,
        distribuidor: distribuidor,
        total: item.total || 0,
        estado: item.estado || 'Desconocido',
        fecha: formatearFecha(item.fecha || new Date())
      };
    });

  } catch (err) {
    console.error("Error al cargar los pedidos:", err);
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

const handleAnularPedido = (id: number) => {
  selectedPedidoId.value = id;
  observacion.value = "";
  showAnularDialog.value = true;
};

const confirmarAnulacion = async () => {
  if (!selectedPedidoId.value) return;
  
  processingAction.value = true;
  
  try {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;// || "http://localhost:3000";
    
    await axios.put(
      `${apiBaseUrl}/apigw/v1/pedido_distribuidor_almacen/${selectedPedidoId.value}`,
      {
        estado: "anulado",
        observacion: observacion.value || `Pedido ${selectedPedidoId.value} anulado`
      }
    );

    // Actualizar lista de pedidos después de la anulación
    await cargarPedidos();
    showAnularDialog.value = false;
  } catch (err) {
    console.error("Error al anular el pedido:", err);
    error.value = "Error al anular el pedido. Intente nuevamente.";
  } finally {
    processingAction.value = false;
  }
};

onMounted(() => {
  cargarPedidos();
});
</script>

<template>
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
            <th class="text-left" style="width: 100px; min-width: 100px;">Acciones</th>
            <th class="text-left">Distribuidor</th>
          </tr>
        </thead>
        <tbody style="background-color: darkseagreen; color: white;">
          <tr v-if="loading" colspan="9">
            <td colspan="9" class="text-center">Cargando datos...</td>
          </tr>
          <tr v-else-if="pedidos.length === 0">
            <td colspan="9" class="text-center">No hay pedidos entregados</td>
          </tr>
          <tr v-for="pedido in pedidos" :key="pedido.id">
            <td>{{ pedido.id }}</td>
            <td>{{ pedido.cliente?.nombres || '' }} {{ pedido.cliente?.apellidos || '' }}</td>
            <td>{{ pedido.telefono?.telefono || '' }}</td>
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
            <td>S/ {{ pedido.total.toFixed(2) }}</td>
            <td>{{ pedido.estado }}</td>
            <td>{{ pedido.fecha }}</td>
            <td style="width: 100px; min-width: 100px; text-align: center;">
              <div class="d-flex justify-center align-center">
                <v-btn size="small" color="white" icon @click="obtenerDetallesPedido(pedido.id)" class="mr-2">
                  <v-icon>mdi-eye</v-icon>
                </v-btn>
                <v-btn size="small" color="white" icon @click="handleAnularPedido(pedido.id)">
                  <v-icon>mdi-pencil</v-icon>
                </v-btn>
              </div>
            </td>
            <td>{{ pedido.distribuidor?.nombres || '' }} {{ pedido.distribuidor?.apellidos || '' }}</td>
          </tr>
        </tbody>
      </v-table>
    </div>
    
    <!-- Dialog para mostrar los detalles del pedido -->
    <v-dialog
      v-model="detalleDialog"
      max-width="500"
      position="center"
      class="mx-auto"
    >
      <v-card class="mx-auto rounded-lg elevation-10 border">
        <v-card-title class="d-flex justify-center pa-4 bg-success text-white rounded-t-lg">
          <div class="text-h5 font-weight-bold">Pedido #{{ pedidoSeleccionado }}</div>
        </v-card-title>
        
        <v-card-text class="pa-6">
          <div v-if="loadingDetalles" class="d-flex flex-column align-center justify-center py-8">
            <v-progress-circular 
              indeterminate 
              color="success" 
              size="50"
              width="5"
            ></v-progress-circular>
            <div class="mt-4 text-subtitle-1">Cargando detalles...</div>
          </div>
          
          <div v-else>
            <div class="text-h6 font-weight-medium text-center mb-6 pb-2 border-bottom">
              Detalles del pedido
            </div>
            
            <v-list v-if="detallesPedido.length > 0" class="bg-grey-lighten-4 rounded-lg pa-2">
              <v-list-item
                v-for="detalle in detallesPedido"
                :key="detalle.id"
                class="mb-2 rounded bg-white elevation-1"
              >
                <v-list-item-title class="d-flex justify-space-between align-center pa-2">
                  <span class="font-weight-medium">{{ detalle.productoInfo.nombre }}</span>
                  <v-chip color="success" size="small" class="ml-3">
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
          <v-btn 
            color="success" 
            variant="contained"
            rounded 
            min-width="120" 
            @click="detalleDialog = false"
          >
            Cerrar
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="showAnularDialog" max-width="500" position="center" class="mx-auto anular-dialog-container">
      <v-card>
        <v-card-title class="pa-4 bg-success text-white">
          Anular Pedido
        </v-card-title>

        <v-card-text class="pa-6">
          <div class="text-h6 text-center mb-6">¿Está seguro que desea anular este pedido?</div>
          
          <div class="d-flex justify-center mb-6">
            <v-btn class="pa-6" color="error" height="100" width="100">
              <div class="d-flex flex-column align-center">
                <v-icon size="40">mdi-cancel</v-icon>
                <span class="mt-2">Anular</span>
              </div>
            </v-btn>
          </div>

          <v-textarea 
            v-model="observacion" 
            label="Motivo de anulación" 
            placeholder="Ingrese el motivo por el cual está anulando este pedido" 
            rows="3" 
            variant="outlined"
          ></v-textarea>
        </v-card-text>

        <v-card-actions class="pa-4 d-flex justify-end">
          <v-btn 
            color="grey-darken-1" 
            variant="text" 
            @click="showAnularDialog = false" 
            :disabled="processingAction"
          >
            Cancelar
          </v-btn>
          <v-btn 
            color="error" 
            variant="contained"
            @click="confirmarAnulacion" 
            :loading="processingAction"
            :disabled="processingAction"
          >
            Confirmar Anulación
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

.v-table thead {
  position: sticky;
  top: 0;
  z-index: 1000;
  background: #fff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.v-table tbody tr td {
  background-color: darkseagreen;
  position: relative;
  z-index: 1;
}

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

.anular-dialog-container {
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