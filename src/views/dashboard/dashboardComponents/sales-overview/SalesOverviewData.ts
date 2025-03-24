export const SalesOverviewData = {
  series: [
    {
      name: "Ample Admin",
      data: [355, 390, 300, 350, 390, 180, 355],
    },
    
  ],
  chartOptions: {
    grid: {
      show: false,
      borderColor: "transparent",
      padding: { left: 0, right: 0, bottom: 0 },
    },
    plotOptions: {
      bar: { horizontal: false, columnWidth: "42%", borderRadius: 5 },
    },
    colors: ["#fb9778", "#03c9d7"],
    fill: { type: "solid", opacity: 1 },
    chart: {
      type: "bar",
      height: 270,
      offsetX: -15,
      toolbar: { show: false },
      foreColor: "#adb0bb",
      fontFamily: "DM sans",
      sparkline: { enabled: false },
    },
    dataLabels: { enabled: false },
    markers: { size: 0 },
    legend: { show: false },
    xaxis: {
      type: "category",
      categories: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"],
    },
    
    yaxis: {
      show: true,
      min: 100,
      max: 400,
      tickAmount: 3,
    },
    stroke: {
      show: true,
      width: 5,
      lineCap: "butt",
      colors: ["transparent"],
    },
    tooltip: { theme: "dark" },
  },
};
