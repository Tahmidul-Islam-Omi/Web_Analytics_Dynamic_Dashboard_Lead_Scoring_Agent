// Helper function to generate chart data from entries
export const generateChartData = (chartEntries, chartConfig) => {
  return {
    labels: chartEntries.map(entry => entry.label),
    values: chartEntries.map(entry => entry.value),
    colors: {
      backgroundColor: chartEntries.map(entry => entry.color),
      hoverBackgroundColor: chartEntries.map(entry => entry.hoverColor),
    },
    label: chartConfig.datasetLabel
  };
};