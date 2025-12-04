"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Line, XAxis, YAxis, ResponsiveContainer, Area, AreaChart } from "recharts"
import { formatCurrency } from "@/lib/solar-api"
import { TrendingUp } from "lucide-react"

interface SavingsBreakdownProps {
  yearlyEnergy: number
  systemCost: number
  electricityRate?: number
}

export function SavingsBreakdown({ yearlyEnergy, systemCost, electricityRate = 0.12 }: SavingsBreakdownProps) {
  const federalCredit = systemCost * 0.3
  const netCost = systemCost - federalCredit
  const yearlySavings = yearlyEnergy * electricityRate

  // Generate 25-year projection
  const years = Array.from({ length: 26 }, (_, i) => {
    const year = i
    const cumulativeSavings = yearlySavings * year
    const netSavings = cumulativeSavings - netCost
    return {
      year,
      savings: Math.round(cumulativeSavings),
      netSavings: Math.round(netSavings),
      cost: Math.round(netCost),
    }
  })

  const paybackYear = years.find((y) => y.netSavings >= 0)?.year || 0
  const totalSavings25 = years[25].savings
  const netProfit25 = years[25].netSavings

  const chartConfig = {
    savings: {
      label: "Cumulative Savings",
      color: "var(--chart-3)",
    },
    cost: {
      label: "System Cost",
      color: "var(--chart-5)",
    },
  }

  return (
    <Card className="bg-card col-span-2">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          25-Year Savings Projection
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="p-3 rounded-lg bg-muted/50">
            <div className="text-xs text-muted-foreground">Payback Period</div>
            <div className="text-xl font-bold text-primary">{paybackYear} years</div>
          </div>
          <div className="p-3 rounded-lg bg-muted/50">
            <div className="text-xs text-muted-foreground">25-Year Savings</div>
            <div className="text-xl font-bold">{formatCurrency(totalSavings25)}</div>
          </div>
          <div className="p-3 rounded-lg bg-green-500/10">
            <div className="text-xs text-muted-foreground">Net Profit (25yr)</div>
            <div className="text-xl font-bold text-green-500">{formatCurrency(netProfit25)}</div>
          </div>
        </div>

        <ChartContainer config={chartConfig} className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={years} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="savingsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--chart-3)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="var(--chart-3)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="year"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 10 }}
                tickFormatter={(v) => `Yr ${v}`}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 10 }}
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                type="monotone"
                dataKey="savings"
                stroke="var(--chart-3)"
                fill="url(#savingsGradient)"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="cost"
                stroke="var(--chart-5)"
                strokeDasharray="5 5"
                strokeWidth={2}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>

        <div className="flex items-center justify-center gap-6 mt-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-chart-3" />
            <span className="text-muted-foreground">Cumulative Savings</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-0.5 border-t-2 border-dashed border-chart-5" />
            <span className="text-muted-foreground">System Cost</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
