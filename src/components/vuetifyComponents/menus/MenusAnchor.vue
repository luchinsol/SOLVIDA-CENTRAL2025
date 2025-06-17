<script setup lang="ts">
import { ref, onMounted } from "vue";
import axios from "axios";
import { jsPDF } from "jspdf";
import 'jspdf-autotable';
import autoTable from 'jspdf-autotable';

// Obtener la URL base de la API desde las variables de entorno
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;

interface FirstOrderDateResponse {
  primeraFecha: {
    mes_anio: string;
    anio_mes: string;
  };
  mensaje: string;
}

interface VentasDia {
  fecha_dia: string;
  ventas_total: number;
}

interface UsuariosDia {
  dia: string;
  total_usuarios: string;
}

interface InformeResponse {
  ventas: {
    por_dia: VentasDia[];
    total_mes: {
      ventas_total: number;
    };
  };
  usuarios: {
    por_dia: UsuariosDia[];
    total_mes: {
      total_usuarios: string;
    };
  };
  periodo: string;
}

// Asegurarse de que la interfaz coincida exactamente con lo que Vuetify espera
// Para Vuetify 3.0.0-beta.0, probemos con un formato más simple
const availableMonths = ref<any[]>([]); // Usar any temporalmente para evitar problemas de tipado
const selectedMonth = ref<string>("");
const loading = ref<boolean>(true);
const error = ref<string | null>(null);
const generatingPdf = ref<boolean>(false);

const padNumber = (num: number): string => {
  return num.toString().padStart(2, '0');
};

// Function to fetch the first order date from the API
const fetchFirstOrderDate = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    const response = await axios.get<FirstOrderDateResponse>(`${apiBaseUrl}/apigw/v1/fecha_primerPedido`);
    const firstMonthDate = response.data.primeraFecha.anio_mes;
    
    // Generate list of months
    generateMonthsList(firstMonthDate);
    
    loading.value = false;
  } catch (err) {
    console.error("Error fetching first order date:", err);
    error.value = "Error al obtener la fecha del primer pedido";
    loading.value = false;
  }
};

// Generate list of months from first order date to current date
const generateMonthsList = (firstMonthStr: string) => {
  const months: any[] = [];
  const [firstYear, firstMonth] = firstMonthStr.split('-').map(Number);
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  for (let year = firstYear; year <= currentYear; year++) {
    const startMonth = (year === firstYear) ? firstMonth : 1;
    const endMonth = (year === currentYear) ? currentMonth : 12;
    
    for (let month = startMonth; month <= endMonth; month++) {
      const monthStr = `${year}-${padNumber(month)}`;
      const monthName = formatMonthForDisplay(monthStr);
      
      // Simplificar la estructura del objeto para evitar problemas con Vuetify
      // Proporcionar tanto title como text para compatibilidad
      months.push({
        title: monthName,
        text: monthName,
        value: monthStr
      });
    }
  }
  
  availableMonths.value = months;
  if (months.length > 0) {
    selectedMonth.value = months[months.length - 1].value;
  }
};

// Format YYYY-MM to a more readable format (e.g., "Marzo 2025")
const formatMonthForDisplay = (yearMonth: string): string => {
  const [year, month] = yearMonth.split('-');
  
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  
  const monthIndex = parseInt(month) - 1;
  return `${monthNames[monthIndex]} ${year}`;
};

// Format date from ISO to DD/MM/YYYY
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return `${padNumber(date.getDate())}/${padNumber(date.getMonth() + 1)}/${date.getFullYear()}`;
};

const generateReport = async () => {
  if (!selectedMonth.value) {
    alert("Por favor seleccione un mes para generar el informe");
    return;
  }
  
  generatingPdf.value = true;
  
  try {
    // Fetch data for the selected month
    const response = await axios.get<InformeResponse>(
      `${apiBaseUrl}/apigw/v1/informe_mes_distribuidor/${selectedMonth.value}`
    );
    
    const data = response.data;
    
    // Create PDF
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text(`Informe del mes: ${formatMonthForDisplay(data.periodo)}`, 14, 20);
    
    // Add Ventas section
    doc.setFontSize(16);
    doc.text("Reporte de Ventas", 14, 30);
    
    // Ventas summary
    doc.setFontSize(12);
    doc.text(
      `En el mes de ${formatMonthForDisplay(data.periodo)} se registraron ventas por un total de S/. ${data.ventas.total_mes.ventas_total}.00 soles.`,
      14, 40
    );
    
    // Ventas table
    autoTable(doc, {
      head: [['Fecha', 'Total de Ventas']],
      body: data.ventas.por_dia.map(item => [
        formatDate(item.fecha_dia),
        item.ventas_total
      ]),
      startY: 45,
      theme: 'striped',
      headStyles: { fillColor: [41, 128, 185], textColor: 255 }
    });
    
    const finalYVentas = (doc as any).lastAutoTable.finalY;
    
    // Add Usuarios section
    const usuariosY = finalYVentas + 15;
    doc.setFontSize(16);
    doc.text("Reporte de Usuarios", 14, usuariosY);
    
    // Usuarios summary
    doc.setFontSize(12);
    doc.text(
      `En el mes de ${formatMonthForDisplay(data.periodo)} se registraron un total de ${data.usuarios.total_mes.total_usuarios} usuarios.`,
      14, usuariosY + 10
    );
    
    // Usuarios table
    autoTable(doc, {
      head: [['Fecha', 'Total de Usuarios']],
      body: data.usuarios.por_dia.map(item => [
        formatDate(item.dia),
        item.total_usuarios
      ]),
      startY: usuariosY + 15,
      theme: 'striped',
      headStyles: { fillColor: [41, 128, 185], textColor: 255 }
    });
    
    // Add Footer
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.text(
        `Informe generado el ${new Date().toLocaleDateString()} - Página ${i} de ${pageCount}`,
        doc.internal.pageSize.getWidth() / 2, 
        doc.internal.pageSize.getHeight() - 10, 
        { align: 'center' }
      );
    }
    
    // Save the PDF
    doc.save(`Informe_${data.periodo}.pdf`);
    
  } catch (err) {
    console.error("Error generating report:", err);
    alert("Error al generar el informe PDF");
  } finally {
    generatingPdf.value = false;
  }
};

onMounted(() => {
  fetchFirstOrderDate();
});
</script>

<template>
  <v-container>
    <p class="text-h5 text-primary font-weight-bold">
      Generador de Informes Mensuales
    </p>

    <v-card class="mt-4 pa-4" elevation="3">
      <v-card-title class="text-subtitle-1">Seleccione el mes para generar el informe</v-card-title>
      
      <v-card-text>
        <div v-if="loading">
          <v-progress-circular indeterminate color="primary"></v-progress-circular>
          <span class="ml-2">Cargando meses disponibles...</span>
        </div>
        
        <div v-else-if="error" class="text-error">
          {{ error }}
        </div>
        
        <div v-else>
          <!-- Modificado el componente v-select para asegurar que muestre correctamente los items -->
          <v-select
            v-model="selectedMonth"
            :items="availableMonths"
            label="Seleccione un mes"
            item-title="title"
            item-value="value"
            variant="outlined"
            density="comfortable"
            class="mb-4"
            color="primary"
            bg-color="white"
            menu-props="auto"
            return-object
          ></v-select>

          <v-btn
            color="primary"
            size="large"
            :loading="generatingPdf"
            :disabled="generatingPdf"
            @click="generateReport"
            block
          >
            <v-icon start>mdi-file-pdf-box</v-icon>
            {{ generatingPdf ? 'Generando PDF...' : 'Generar Informe PDF' }}
          </v-btn>
        </div>
      </v-card-text>
    </v-card>
  </v-container>
</template>