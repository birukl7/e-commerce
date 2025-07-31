"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export const description = "Sales trends over time"

const chartData = [
  { date: "2024-04-01", revenue: 8220, orders: 45 },
  { date: "2024-04-02", revenue: 6970, orders: 38 },
  { date: "2024-04-03", revenue: 9167, orders: 52 },
  { date: "2024-04-04", revenue: 12420, orders: 68 },
  { date: "2024-04-05", revenue: 15730, orders: 85 },
  { date: "2024-04-06", revenue: 13010, orders: 71 },
  { date: "2024-04-07", revenue: 10450, orders: 58 },
  { date: "2024-04-08", revenue: 18090, orders: 98 },
  { date: "2024-04-09", revenue: 5590, orders: 32 },
  { date: "2024-04-10", revenue: 11610, orders: 64 },
  { date: "2024-04-11", revenue: 14270, orders: 78 },
  { date: "2024-04-12", revenue: 12920, orders: 71 },
  { date: "2024-04-13", revenue: 16420, orders: 89 },
  { date: "2024-04-14", revenue: 8370, orders: 46 },
  { date: "2024-04-15", revenue: 7200, orders: 41 },
  { date: "2024-04-16", revenue: 8380, orders: 47 },
  { date: "2024-04-17", revenue: 19460, orders: 105 },
  { date: "2024-04-18", revenue: 17640, orders: 96 },
  { date: "2024-04-19", revenue: 11430, orders: 63 },
  { date: "2024-04-20", revenue: 6890, orders: 38 },
  { date: "2024-04-21", revenue: 8370, orders: 46 },
  { date: "2024-04-22", revenue: 10240, orders: 56 },
  { date: "2024-04-23", revenue: 8380, orders: 47 },
  { date: "2024-04-24", revenue: 17870, orders: 97 },
  { date: "2024-04-25", revenue: 11150, orders: 61 },
  { date: "2024-04-26", revenue: 5750, orders: 33 },
  { date: "2024-04-27", revenue: 18830, orders: 102 },
  { date: "2024-04-28", revenue: 7220, orders: 40 },
  { date: "2024-04-29", revenue: 14150, orders: 77 },
  { date: "2024-04-30", revenue: 20540, orders: 111 },
  { date: "2024-05-01", revenue: 9650, orders: 53 },
  { date: "2024-05-02", revenue: 13930, orders: 76 },
  { date: "2024-05-03", revenue: 11470, orders: 63 },
  { date: "2024-05-04", revenue: 18850, orders: 102 },
  { date: "2024-05-05", revenue: 22810, orders: 123 },
  { date: "2024-05-06", revenue: 23980, orders: 129 },
  { date: "2024-05-07", revenue: 17880, orders: 97 },
  { date: "2024-05-08", revenue: 8490, orders: 47 },
  { date: "2024-05-09", revenue: 10270, orders: 56 },
  { date: "2024-05-10", revenue: 14930, orders: 81 },
  { date: "2024-05-11", revenue: 15350, orders: 83 },
  { date: "2024-05-12", revenue: 10970, orders: 60 },
  { date: "2024-05-13", revenue: 9970, orders: 55 },
  { date: "2024-05-14", revenue: 21480, orders: 116 },
  { date: "2024-05-15", revenue: 21730, orders: 117 },
  { date: "2024-05-16", revenue: 16380, orders: 89 },
  { date: "2024-05-17", revenue: 22990, orders: 124 },
  { date: "2024-05-18", revenue: 15150, orders: 82 },
  { date: "2024-05-19", revenue: 10350, orders: 57 },
  { date: "2024-05-20", revenue: 9770, orders: 54 },
  { date: "2024-05-21", revenue: 6820, orders: 38 },
  { date: "2024-05-22", revenue: 6810, orders: 38 },
  { date: "2024-05-23", revenue: 12520, orders: 68 },
  { date: "2024-05-24", revenue: 13940, orders: 76 },
  { date: "2024-05-25", revenue: 11010, orders: 60 },
  { date: "2024-05-26", revenue: 10130, rogers: 56 },
  { date: "2024-05-27", revenue: 20200, orders: 109 },
  { date: "2024-05-28", revenue: 10330, orders: 57 },
  { date: "2024-05-29", revenue: 6780, orders: 38 },
  { date: "2024-05-30", revenue: 15400, orders: 84 },
  { date: "2024-05-31", revenue: 9780, orders: 54 },
  { date: "2024-06-01", revenue: 9780, orders: 54 },
  { date: "2024-06-02", revenue: 21700, orders: 117 },
  { date: "2024-06-03", revenue: 7030, orders: 39 },
  { date: "2024-06-04", revenue: 20390, orders: 110 },
  { date: "2024-06-05", revenue: 6880, orders: 38 },
  { date: "2024-06-06", revenue: 13940, orders: 76 },
  { date: "2024-06-07", revenue: 15230, orders: 83 },
  { date: "2024-06-08", revenue: 17850, orders: 97 },
  { date: "2024-06-09", revenue: 20380, orders: 110 },
  { date: "2024-06-10", revenue: 9550, orders: 53 },
  { date: "2024-06-11", revenue: 6920, orders: 39 },
  { date: "2024-06-12", revenue: 22920, orders: 124 },
  { date: "2024-06-13", revenue: 6810, orders: 38 },
  { date: "2024-06-14", revenue: 19760, orders: 107 },
  { date: "2024-06-15", revenue: 15070, orders: 82 },
  { date: "2024-06-16", revenue: 17710, orders: 96 },
  { date: "2024-06-17", revenue: 22750, orders: 123 },
  { date: "2024-06-18", revenue: 7070, orders: 39 },
  { date: "2024-06-19", revenue: 15410, orders: 84 },
  { date: "2024-06-20", revenue: 19080, orders: 103 },
  { date: "2024-06-21", revenue: 9690, orders: 53 },
  { date: "2024-06-22", revenue: 14170, orders: 77 },
  { date: "2024-06-23", revenue: 23800, orders: 128 },
  { date: "2024-06-24", revenue: 8320, orders: 46 },
  { date: "2024-06-25", revenue: 8410, orders: 47 },
  { date: "2024-06-26", revenue: 20340, orders: 110 },
  { date: "2024-06-27", revenue: 20480, orders: 111 },
  { date: "2024-06-28", revenue: 8490, orders: 47 },
  { date: "2024-06-29", revenue: 7030, orders: 39 },
  { date: "2024-06-30", revenue: 20460, orders: 111 },
]

const chartConfig = {
  revenue: {
    label: "Revenue ($)",
    color: "var(--chart-1)",
  },
  orders: {
    label: "Orders",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

export function ChartAreaInteractive() {
  const [timeRange, setTimeRange] = React.useState("90d")

  const filteredData = chartData.filter((item) => {
    const date = new Date(item.date)
    const referenceDate = new Date("2024-06-30")
    let daysToSubtract = 90
    if (timeRange === "30d") {
      daysToSubtract = 30
    } else if (timeRange === "7d") {
      daysToSubtract = 7
    }
    const startDate = new Date(referenceDate)
    startDate.setDate(startDate.getDate() - daysToSubtract)
    return date >= startDate
  })

  return (
    <Card className="pt-0">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle>Sales Trends</CardTitle>
          <CardDescription>Daily revenue and order volume trends</CardDescription>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="hidden w-[160px] rounded-lg sm:ml-auto sm:flex" aria-label="Select a value">
            <SelectValue placeholder="Last 3 months" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="90d" className="rounded-lg">
              Last 3 months
            </SelectItem>
            <SelectItem value="30d" className="rounded-lg">
              Last 30 days
            </SelectItem>
            <SelectItem value="7d" className="rounded-lg">
              Last 7 days
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer config={chartConfig} className="aspect-auto h-[250px] w-full">
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-revenue)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-revenue)" stopOpacity={0.1} />
              </linearGradient>
              <linearGradient id="fillOrders" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-orders)" stopOpacity={0.8} />
                <stop offset="95%" stopColor="var(--color-orders)" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  }}
                  indicator="dot"
                />
              }
            />
            <Area dataKey="orders" type="natural" fill="url(#fillOrders)" stroke="var(--color-orders)" stackId="a" />
            <Area dataKey="revenue" type="natural" fill="url(#fillRevenue)" stroke="var(--color-revenue)" stackId="a" />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
