"use client"

import { TrendingUp } from "lucide-react"
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

export const description = "Product category performance"

const chartData = [
  { category: "Electronics", performance: 85 },
  { category: "Clothing", performance: 72 },
  { category: "Home & Garden", performance: 68 },
  { category: "Sports", performance: 79 },
  { category: "Books", performance: 63 },
  { category: "Beauty", performance: 81 },
]

const chartConfig = {
  performance: {
    label: "Performance Score",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

export function ChartRadarDefault() {
  return (
    <Card>
      <CardHeader className="items-center pb-4">
        <CardTitle>Category Performance</CardTitle>
        <CardDescription>Performance scores across product categories</CardDescription>
      </CardHeader>
      <CardContent className="pb-0">
        <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-[250px]">
          <RadarChart data={chartData}>
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <PolarAngleAxis dataKey="category" />
            <PolarGrid />
            <Radar dataKey="performance" fill="var(--color-performance)" fillOpacity={0.6} />
          </RadarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 leading-none font-medium">
          Electronics leading with 85% score <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground flex items-center gap-2 leading-none">
          Based on sales, reviews, and inventory turnover
        </div>
      </CardFooter>
    </Card>
  )
}
