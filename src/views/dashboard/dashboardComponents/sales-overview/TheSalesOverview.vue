<script setup lang="ts">
import { ref, onMounted, reactive, computed } from "vue"
import axios from "axios"
import ApexChart from "vue3-apexcharts"

interface WeeklySalesItem {
  dia_semana: string
  suma_total: number
  dia_actual: string
  numero_semana: string
  mes_actual: string
  semana_del_mes: number
}

const elementVisible = ref(false)
const weeklySalesData = ref<WeeklySalesItem[]>([])

const salesOverviewData = reactive({
  chartOptions: {
    chart: {
      type: 'bar',
      height: 280,
      toolbar: {
        show: false
      }
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%',
        endingShape: 'rounded'
      }
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      show: true,
      width: 2,
      colors: ['transparent']
    },
    xaxis: {
      type: 'category',
      categories: [] as string[],
      labels: {
        style: {
          colors: '#000',
          fontSize: '12px'
        }
      },
      title: {
        text: 'Días de la Semana',
        style: {
          fontSize: '12px'
        }
      }
    },
    yaxis: {
      title: {
        text: 'Ventas Totales'
      }
    },
    fill: {
      opacity: 1
    },
    tooltip: {
      y: {
        formatter: function (val: number) {
          return `S/. ${val}`
        }
      }
    },
    colors: ['#556ee6']
  },
  series: [
    {
      name: 'Ventas',
      data: [] as number[]
    }
  ]
})

// Computed property para el título dinámico
const dynamicHeader = computed(() => {
  if (weeklySalesData.value.length > 0) {
    const firstItem = weeklySalesData.value[0]
    return `${firstItem.mes_actual}- Semana ${firstItem.semana_del_mes}`
  }
  return 'Ventas'
})

const fetchWeeklySalesData = async () => {
  try {
    const baseUrl = import.meta.env.VITE_API_BASE_URL;// || 'http://localhost:3000'
    const response = await axios.get<WeeklySalesItem[]>(`${baseUrl}/apigw/v1/pedido_semanal`)
    
    weeklySalesData.value = response.data
    
    // Actualizar categorías y datos con tipado explícito
    salesOverviewData.chartOptions.xaxis.categories = response.data.map((item: WeeklySalesItem) => item.dia_semana)
    salesOverviewData.series[0].data = response.data.map((item: WeeklySalesItem) => item.suma_total)
    
    // Mostrar elemento sin retraso
    elementVisible.value = true
  } catch (error) {
    console.error('Error fetching weekly sales data:', error)
  }
}

onMounted(fetchWeeklySalesData)
</script>

<template>
  <v-card>
    <v-card-text class="pa-7">
      <div class="d-sm-flex align-center mb-5">
        <div>
          <h3 class="text-h6 title font-weight-medium">Ventas</h3>
        </div>
        <v-spacer></v-spacer>
        <div class="ml-auto">
          <div class="d-flex align-center">
            <div class="d-flex align-center px-2">
              <span class="text-primary">
                <span class="text-overline">
                  <i class="mdi mdi-brightness-1 mx-1"></i>
                </span>
                <span class="font-weight-regular">{{ dynamicHeader }}</span>
              </span>
            </div>
          </div>
        </div>
      </div>
      <div v-if="elementVisible">
        <apexchart
          type="bar"
          height="280px"
          :options="salesOverviewData.chartOptions"
          :series="salesOverviewData.series"
        ></apexchart>
      </div>
    </v-card-text>
  </v-card>
</template>