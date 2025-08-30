"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { FunctionReturnType } from "convex/server";
import { api } from "@/convex/_generated/api";

const chartConfig = {
  pickCount: {
    label: "Picks",
    color: "hsl(var(--chart-4))",
  },
  label: {
    color: "hsl(var(--foreground))",
  },
} satisfies ChartConfig;

type TopPicksData = FunctionReturnType<
  typeof api.events.getEventMostPopularPick
>;

export function TopPicksChart({ data }: { data: TopPicksData }) {
  if (!data || !data.top3Picks || data.top3Picks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Most Popular First Place Picks
          </CardTitle>
          <CardDescription>No data available</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const chartData = data.top3Picks.map((pick, index) => ({
    name: pick.participant?.display_name || `Pick ${index + 1}`,
    pickCount: pick.pickCount,
    percentage: pick.percentage,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">
          Most Popular First Place Picks
        </CardTitle>
        <CardDescription>
          Based on {data.totalPicks} total picks
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart
            accessibilityLayer
            data={chartData}
            layout="vertical"
            margin={{
              right: 16,
            }}
          >
            <CartesianGrid horizontal={false} />
            <YAxis
              dataKey="name"
              type="category"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              hide
            />
            <XAxis dataKey="pickCount" type="number" hide />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  indicator="line"
                  formatter={(value) => [
                    `${value}(${chartData.find((d) => d.pickCount === value)?.percentage}%) `,
                    "Picks",
                  ]}
                />
              }
            />
            <Bar
              dataKey="pickCount"
              layout="vertical"
              fill="var(--color-purple-800)"
              radius={4}
            >
              <LabelList
                dataKey="name"
                position="insideLeft"
                offset={8}
                className="fill-[var(--color-white)]"
                fontSize={12}
              />
              <LabelList
                dataKey="pickCount"
                position="right"
                offset={8}
                className="fill-foreground"
                fontSize={12}
                formatter={(value: number) => {
                  const item = chartData.find((d) => d.pickCount === value);
                  return `${value} (${item?.percentage}%)`;
                }}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

