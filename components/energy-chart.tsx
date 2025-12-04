"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts"
import type { BuildingInsights } from "@/lib/types"

interface EnergyChartProps {
  buildingInsights: BuildingInsights
  selectedPanelCount: number
}

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

export function EnergyChart({ buildingInsights, selectedPanelCount }: EnergyChartProps) {
  // Calculate monthly energy based on sunshine patterns (simplified)
  const { solarPotential } = buildingInsights
  const config = solarPotential.solarPanelConfigs.find((c) => c.panelsCount >= selectedPanelCount)
  const yearlyEnergy = config?.yearlyEnergyDcKwh || 0

  // Seasonal variation factors (summer months have more sun)
  const seasonalFactors = [0.6, 0.7, 0.85, 0.95, 1.1, 1.2, 1.25, 1.2, 1.0, 0.85, 0.65, 0.55]

  const data = months.map((month, i) => ({
    month,
    energy: Math.round((yearlyEnergy / 12) * seasonalFactors[i]),
  }))

  const chartConfig = {
    energy: {
      label: "Energy (kWh)",
      color: "var(--chart-1)",
    },
  }

  return (
    <Card className="bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">Monthly Energy Production</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 10 }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10 }} tickFormatter={(v) => `${v}`} />
              <ChartTooltip content={<ChartTooltipContent />} cursor={{ fill: "var(--muted)", opacity: 0.3 }} />
              <Bar dataKey="energy" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
