import * as shape from "d3-shape";
import React, { useMemo } from "react";
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
// @ts-ignore
import { LineChart } from "react-native-svg-charts";
import { ThemeColors } from "../constants/colors";

interface DailyRecord {
  id: string;
  date: string;
  [key: string]: any;
}

interface ChartDataPoint {
  date: string;
  [key: string]: number | string;
}

const EXERCISE_COLORS: Record<string, string> = {
  pushups: "#2563EB",
  pullups: "#14B8A6",
  situps: "#F59E0B",
  squats: "#8B5CF6",
  plank: "#EF4444",
  running: "#06B6D4",
};

const EXERCISE_NAMES: Record<string, string> = {
  pushups: "Push-ups",
  pullups: "Pull-ups",
  situps: "Sit-ups",
  squats: "Squats",
  plank: "Plank",
  running: "Running",
};

interface DailyRecordsChartProps {
  records: DailyRecord[];
  theme: ThemeColors;
}

export function DailyRecordsChart({ records, theme }: DailyRecordsChartProps) {
  const chartData = useMemo(() => {
    if (!records || records.length === 0) {
      return { data: [], exercises: [] };
    }

    // Sort records by date
    const sortedRecords = [...records].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Extract all exercise types
    const exercises = new Set<string>();
    sortedRecords.forEach((record) => {
      Object.keys(record).forEach((key) => {
        if (key !== "id" && key !== "date" && typeof record[key] === "number") {
          exercises.add(key);
        }
      });
    });

    // Build chart data
    const exercisesArray = Array.from(exercises).sort();
    const chartDataArray: ChartDataPoint[] = sortedRecords.map((record) => {
      const dataPoint: ChartDataPoint = {
        date: new Date(record.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
      };

      exercisesArray.forEach((exercise) => {
        dataPoint[exercise] = record[exercise] || 0;
      });

      return dataPoint;
    });

    return {
      data: chartDataArray,
      exercises: exercisesArray,
    };
  }, [records]);

  if (chartData.data.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: theme.card }]}>
        <Text style={[styles.emptyText, { color: theme.mutedText }]}>
          No data available
        </Text>
      </View>
    );
  }

  const chartWidth = Math.max(
    Dimensions.get("window").width - 48,
    chartData.data.length * 60
  );

  return (
    <View>
      {/* Legend */}
      <View
        style={[
          styles.legendContainer,
          { backgroundColor: theme.card, borderColor: theme.inputBorder },
        ]}
      >
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.legend}>
            {chartData.exercises.map((exercise) => (
              <View key={exercise} style={styles.legendItem}>
                <View
                  style={[
                    styles.legendDot,
                    {
                      backgroundColor:
                        (EXERCISE_COLORS as Record<string, string>)[exercise] || "#999",
                    },
                  ]}
                />
                <Text
                  style={[
                    styles.legendText,
                    { color: theme.text },
                  ]}
                >
                  {EXERCISE_NAMES[exercise] || exercise}
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>
      </View>

      {/* Chart */}
      <View
        style={[
          styles.chartContainer,
          { backgroundColor: theme.card, borderColor: theme.inputBorder },
        ]}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={true}
          scrollEventThrottle={16}
          style={styles.scrollView}
        >
          <View style={{ width: chartWidth }}>
            <LineChart
              style={styles.chart}
              data={chartData.data.map((_, i) => i)}
              svg={{ strokeWidth: 2, stroke: "#2563EB" }}
              contentInset={{ top: 10, bottom: 10, left: 10, right: 10 }}
              curve={shape.curveMonotoneX}
            >
              {chartData.exercises.map((exercise) => (
                <LineChart.Line
                  key={exercise}
                  data={chartData.data}
                  yAccessor={({ item }: { item: any }) => item[exercise]}
                  svg={{
                    stroke:
                      (EXERCISE_COLORS as Record<string, string>)[exercise] || "#999",
                    strokeWidth: 2,
                  }}
                />
              ))}
            </LineChart>

            {/* X-axis labels */}
            <View style={styles.xAxisContainer}>
              {chartData.data.map((point, i) => (
                <Text
                  key={i}
                  style={[
                    styles.xAxisLabel,
                    {
                      color: theme.mutedText,
                      width: 60,
                    },
                  ]}
                >
                  {point.date}
                </Text>
              ))}
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    padding: 16,
    marginVertical: 12,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 200,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: "500",
  },
  legendContainer: {
    borderRadius: 12,
    padding: 12,
    marginVertical: 12,
    borderWidth: 1,
  },
  legend: {
    flexDirection: "row",
    gap: 12,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 12,
    fontWeight: "600",
  },
  chartContainer: {
    borderRadius: 12,
    padding: 16,
    marginVertical: 12,
    borderWidth: 1,
    minHeight: 250,
  },
  scrollView: {
    width: "100%",
  },
  chart: {
    height: 200,
  },
  xAxisContainer: {
    flexDirection: "row",
    marginTop: 8,
  },
  xAxisLabel: {
    fontSize: 10,
    textAlign: "center",
    fontWeight: "500",
  },
});
