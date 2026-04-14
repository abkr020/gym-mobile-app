import React, { useMemo } from "react";
import {
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
// import Svg, { Circle, Line, Polyline } from "react-native-svg";
import Svg, { Circle, Line, Polyline, Text as SvgText } from "react-native-svg";
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

        const sortedRecords = [...records].sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        const exercises = new Set<string>();
        sortedRecords.forEach((record) => {
            Object.keys(record).forEach((key) => {
                if (key !== "id" && key !== "date" && typeof record[key] === "number") {
                    exercises.add(key);
                }
            });
        });

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

    const chartWidth = Math.max(
        Dimensions.get("window").width - 48,
        chartData.data.length * 60
    );
    const chartHeight = 200;
    const padding = { left: 40, right: 10, top: 10, bottom: 40 };

    const innerHeight = chartHeight - padding.top - padding.bottom;
    const innerWidth = chartWidth - padding.left - padding.right;

    let maxValue = 0;
    chartData.data.forEach((point) => {
        Object.keys(point).forEach((key) => {
            if (key !== "date") {
                const val = typeof point[key] === "number" ? point[key] : 0;
                if (val > maxValue) maxValue = val;
            }
        });
    });
    maxValue = maxValue || 10;

    const getPoints = (exercise: string) => {
        if (chartData.data.length === 0) return "";
        return chartData.data
            .map((point, i) => {
                const x = padding.left + (i / (chartData.data.length - 1 || 1)) * innerWidth;
                const yValue = typeof point[exercise] === "number" ? point[exercise] : 0;
                const y = padding.top + innerHeight - (yValue / maxValue) * innerHeight;
                return `${x},${y}`;
            })
            .join(" ");
    };

    if (chartData.data.length === 0) {
        return (
            <View style={[styles.container, { backgroundColor: theme.card }]}>
                <Text style={[styles.emptyText, { color: theme.mutedText }]}>
                    No data available
                </Text>
            </View>
        );
    }

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
                >
                    <View style={{ width: chartWidth, height: chartHeight + 50 }}>
                        <Svg width={chartWidth} height={chartHeight}>
                            {/* Grid lines */}
                            {[0, 0.25, 0.5, 0.75, 1].map((i) => (
                                <Line
                                    key={`grid-${i}`}
                                    x1={padding.left}
                                    y1={padding.top + i * innerHeight}
                                    x2={chartWidth - padding.right}
                                    y2={padding.top + i * innerHeight}
                                    stroke={theme.inputBorder}
                                    strokeWidth="1"
                                    strokeOpacity="0.3"
                                />
                            ))}

                            {/* Y-axis */}
                            <Line
                                x1={padding.left}
                                y1={padding.top}
                                x2={padding.left}
                                y2={padding.top + innerHeight}
                                stroke={theme.mutedText}
                                strokeWidth="1"
                            />

                            {/* Exercise lines */}
                            {chartData.exercises.map((exercise) => (
                                <Polyline
                                    key={exercise}
                                    points={getPoints(exercise)}
                                    fill="none"
                                    stroke={(EXERCISE_COLORS as Record<string, string>)[exercise] || "#999"}
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            ))}

                            {/* Data points */}
                            {/* Data points + values */}
                            {chartData.exercises.map((exercise) =>
                                chartData.data.map((point, i) => {
                                    const x =
                                        padding.left +
                                        (i / (chartData.data.length - 1 || 1)) * innerWidth;

                                    const yValue =
                                        typeof point[exercise] === "number" ? point[exercise] : 0;

                                    const y =
                                        padding.top + innerHeight - (yValue / maxValue) * innerHeight;

                                    return (
                                        <React.Fragment key={`${exercise}-${i}`}>
                                            {/* Dot */}
                                            <Circle
                                                cx={x}
                                                cy={y}
                                                r="3"
                                                fill={
                                                    (EXERCISE_COLORS as Record<string, string>)[exercise] || "#999"
                                                }
                                            />

                                            {/* Value */}
                                            <SvgText
                                                x={x}
                                                y={y - 8} // slightly above dot
                                                fontSize="10"
                                                fill={theme.text}
                                                textAnchor="middle"
                                            >
                                                {yValue}
                                            </SvgText>
                                        </React.Fragment>
                                    );
                                })
                            )}
                        </Svg>

                        {/* X-axis labels */}
                        {/* X-axis labels */}
                        <View style={{ position: "absolute", top: chartHeight }}>
                            {chartData.data.map((point, i) => {
                                const x =
                                    padding.left +
                                    (i / (chartData.data.length - 1 || 1)) * innerWidth;

                                return (
                                    <Text
                                        key={i}
                                        style={[
                                            styles.xAxisLabel,
                                            {
                                                position: "absolute",
                                                left: x - 20, // center align
                                                width: 40,
                                                color: theme.mutedText,
                                            },
                                        ]}
                                    >
                                        {point.date}
                                    </Text>
                                );
                            })}
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
