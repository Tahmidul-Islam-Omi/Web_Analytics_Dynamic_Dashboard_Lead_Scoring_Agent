import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { generateChartData } from "../../utils/chartData.js";

// Register required elements for line chart
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const LineChart = ({ chartEntries, chartConfig }) => {
  console.log("LineChart component is rendering");
  
  const chartData = generateChartData(chartEntries, chartConfig);

  const data = {
    labels: chartData.labels,
    datasets: [
      {
        label: chartData.label,
        data: chartData.values,
        borderColor: "#36A2EB",
        backgroundColor: "rgba(54, 162, 235, 0.2)",
        pointBackgroundColor: chartData.colors.backgroundColor,
        pointBorderColor: chartData.colors.backgroundColor,
        pointHoverBackgroundColor: chartData.colors.hoverBackgroundColor,
        pointHoverBorderColor: chartData.colors.hoverBackgroundColor,
        pointRadius: 6,
        pointHoverRadius: 8,
        borderWidth: 3,
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: chartData.label,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div style={{ width: '100%', height: '400px' }}>
      <Line data={data} options={options} />
    </div>
  );
};

export default LineChart;