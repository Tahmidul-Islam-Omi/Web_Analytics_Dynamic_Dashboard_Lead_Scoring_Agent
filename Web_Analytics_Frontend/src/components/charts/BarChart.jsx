import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { generateChartData } from "../../utils/chartData.js";

// Register required elements for bar chart
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const BarChart = ({ chartEntries, chartConfig }) => {
  console.log("BarChart component is rendering");
  
  const chartData = generateChartData(chartEntries, chartConfig);

  const data = {
    labels: chartData.labels,
    datasets: [
      {
        label: chartData.label,
        data: chartData.values,
        backgroundColor: chartData.colors.backgroundColor,
        hoverBackgroundColor: chartData.colors.hoverBackgroundColor,
        borderWidth: 1,
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
        position: 'top',
        padding: {
          top: 10,
          bottom: 20,
        },
        font: {
          size: 18,
          weight: 'bold',
          family: 'Roboto'
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div style={{ width: '100%', height: '500px' }}>
      <Bar data={data} options={options} />
    </div>
  );
};

export default BarChart;