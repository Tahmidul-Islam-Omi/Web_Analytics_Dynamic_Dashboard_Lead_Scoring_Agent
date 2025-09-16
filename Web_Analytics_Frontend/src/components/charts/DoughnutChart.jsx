import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { generateChartData } from "../../utils/chartData.js";

// Register required elements
ChartJS.register(ArcElement, Tooltip, Legend);

const DoughnutChart = ({ chartEntries, chartConfig }) => {
  console.log("DoughnutChart component is rendering");

  const chartData = generateChartData(chartEntries, chartConfig);
  const rawData = chartData.values;
  const total = rawData.reduce((sum, value) => sum + value, 0);

  // Calculate percentages
  const percentages = rawData.map(value => ((value / total) * 100).toFixed(1));

  const data = {
    labels: chartData.labels,
    datasets: [
      {
        label: chartData.label,
        data: rawData,
        backgroundColor: chartData.colors.backgroundColor,
        hoverBackgroundColor: chartData.colors.hoverBackgroundColor,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          generateLabels: (chart) => {
            const data = chart.data;
            if (data.labels.length && data.datasets.length) {
              return data.labels.map((label, i) => {
                const value = data.datasets[0].data[i];
                const percentage = percentages[i];
                return {
                  text: `${label}: ${percentage}%`,
                  fillStyle: data.datasets[0].backgroundColor[i],
                  strokeStyle: data.datasets[0].backgroundColor[i],
                  lineWidth: 0,
                  index: i
                };
              });
            }
            return [];
          }
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.parsed;
            const percentage = percentages[context.dataIndex];
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    },
  };

  return (
    <div style={{ width: '100%', height: '400px' }}>
      <Doughnut data={data} options={options} />
    </div>
  );
};

export default DoughnutChart;