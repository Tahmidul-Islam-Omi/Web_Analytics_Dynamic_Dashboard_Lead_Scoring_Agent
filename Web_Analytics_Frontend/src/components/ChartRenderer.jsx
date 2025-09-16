import React from 'react';
import BarChart from './charts/BarChart';
import DoughnutChart from './charts/DoughnutChart';
import LineChart from './charts/LineChart';
import ScatterChart from './charts/ScatterChart';

const ChartRenderer = ({ chartType, chartData }) => {
  // Parse the chart data if it's a string
  let parsedData;
  try {
    if (typeof chartData === 'string') {
      // Extract chartEntries and chartConfig from the JavaScript code
      const entriesMatch = chartData.match(/export const chartEntries = (\[[\s\S]*?\]);/);
      const configMatch = chartData.match(/export const chartConfig = (\{[\s\S]*?\});/);
      
      if (entriesMatch && configMatch) {
        // Use eval to parse the JavaScript objects (in a real app, use a proper parser)
        const chartEntries = eval(entriesMatch[1]);
        const chartConfig = eval(configMatch[1]);
        
        parsedData = { chartEntries, chartConfig };
      }
    } else {
      parsedData = chartData;
    }
  } catch (error) {
    console.error('Error parsing chart data:', error);
    return <div>Error parsing chart data</div>;
  }

  if (!parsedData || !parsedData.chartEntries || !parsedData.chartConfig) {
    return <div>No chart data available</div>;
  }

  const { chartEntries, chartConfig } = parsedData;

  switch (chartType) {
    case 'BarChart':
      return <BarChart chartEntries={chartEntries} chartConfig={chartConfig} />;
    case 'DoughnutChart':
      return <DoughnutChart chartEntries={chartEntries} chartConfig={chartConfig} />;
    case 'LineChart':
      return <LineChart chartEntries={chartEntries} chartConfig={chartConfig} />;
    case 'ScatterChart':
      return <ScatterChart chartEntries={chartEntries} chartConfig={chartConfig} />;
    default:
      return <BarChart chartEntries={chartEntries} chartConfig={chartConfig} />;
  }
};

export default ChartRenderer;