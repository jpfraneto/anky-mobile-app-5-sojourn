import React, { useMemo } from "react";
import { View, Dimensions } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { AbstractChartConfig } from "react-native-chart-kit/dist/AbstractChart";

interface ChartDataset {
  data: number[];
  color: (opacity?: number) => string;
  strokeWidth: number;
}

interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

interface ParsedData {
  timePoints: number[];
  intervals: number[];
  average: number;
}

const WritingSessionChart = ({
  session_long_string,
}: {
  session_long_string: string;
}) => {
  const { width: screenWidth } = Dimensions.get("window");

  const parsedData = useMemo((): ParsedData => {
    const lines = session_long_string.split("\n").slice(3); // Skip metadata lines
    const intervals: number[] = [];
    let currentTime = 0;
    const timePoints: number[] = [];

    lines.forEach((line) => {
      if (!line.trim()) return;
      const [char, timeStr] = line.split(/\s+/);
      const interval = parseFloat(timeStr);

      if (!isNaN(interval)) {
        intervals.push(interval); // Keep as seconds
        currentTime += interval;
        timePoints.push(currentTime);
      }
    });

    const average = intervals.reduce((a, b) => a + b, 0) / intervals.length;

    return {
      timePoints,
      intervals,
      average,
    };
  }, [session_long_string]);

  const chartData: ChartData = {
    labels: [], // We'll let the chart handle X-axis automatically
    datasets: [
      {
        data: parsedData.intervals,
        color: (opacity = 1) => `rgba(134, 255, 244, ${opacity})`,
        strokeWidth: 2,
      },
    ],
  };

  const chartConfig: AbstractChartConfig = {
    backgroundColor: "#1E2B3D",
    backgroundGradientFrom: "#1E2B3D",
    backgroundGradientTo: "#1E2B3D",
    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    strokeWidth: 2,
    decimalPlaces: 3,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: "2",
      strokeWidth: "1",
      stroke: "#86B4FF",
    },
  };

  // Add a dataset for the average line
  chartData.datasets.push({
    data: new Array(parsedData.intervals.length).fill(parsedData.average),
    color: (opacity = 1) => `rgba(255, 255, 134, ${opacity})`,
    strokeWidth: 1,
  });

  // Calculate dimensions based on screen width
  const chartWidth = screenWidth * 0.9; // 90% of screen width
  const chartHeight = chartWidth * 0.6; // Maintain 5:3 aspect ratio

  return (
    <View
      style={{
        backgroundColor: "#1E2B3D",
        padding: 16,
        borderRadius: 8,
        width: chartWidth,
      }}
    >
      <LineChart
        data={chartData}
        width={chartWidth}
        height={chartHeight}
        chartConfig={chartConfig}
        bezier
        style={{
          marginVertical: 8,
          borderRadius: 16,
        }}
        withDots={false}
        withInnerLines={false}
        withOuterLines={true}
        withVerticalLines={false}
        withHorizontalLines={true}
        horizontalLabelRotation={0}
        yAxisLabel=""
        yAxisInterval={0.1}
        fromZero={true}
      />
    </View>
  );
};

export default WritingSessionChart;
