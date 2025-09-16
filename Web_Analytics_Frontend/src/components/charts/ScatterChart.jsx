import { Scatter } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Title,
} from "chart.js";
import { generateChartData } from "../../utils/chartData.js";

// Register required elements for scatter chart
ChartJS.register(
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Title
);

const ScatterChart = ({ chartEntries, chartConfig }) => {
  console.log("ScatterChart component is rendering");
  
  const chartData = generateChartData(chartEntries, chartConfig);

  // Transform data for scatter plot (x: index, y: value)
  const scatterData = chartData.values.map((value, index) => ({
    x: index + 1,
    y: value,
    label: chartData.labels[index],
    color: chartData.colors.backgroundColor[index],
    hoverColor: chartData.colors.hoverBackgroundColor[index]
  }));

  const data = {
    datasets: [
      {
        label: chartData.label,
        data: scatterData,
        backgroundColor: scatterData.map(point => point.color),
        borderColor: scatterData.map(point => point.color),
        pointRadius: 8,
        pointHoverRadius: 12,
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
      tooltip: {
        callbacks: {
          label: (context) => {
            const point = scatterData[context.dataIndex];
            return `${point.label}: ${point.y}`;
          }
        }
      }
    },
    scales: {
      x: {
        type: 'linear',
        position: 'bottom',
        title: {
          display: true,
          text: 'Category Index'
        },
        min: 0,
        max: chartData.labels.length + 1
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Values'
        },
      },
    },
  };

  return (
    <div style={{ width: '100%', height: '500px' }}>
      <Scatter data={data} options={options} />
    </div>
  );
};

export default ScatterChart;