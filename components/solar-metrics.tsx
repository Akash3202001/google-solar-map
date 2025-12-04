"use client"

import { Sun, Zap, Leaf, DollarSign, Home, LayoutGrid } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { BuildingInsights } from "@/lib/types"
import { formatNumber, formatCurrency } from "@/lib/solar-api"

interface SolarMetricsProps {
  buildingInsights: BuildingInsights
  selectedPanelCount: number
  yearlyEnergy: number
}

export function SolarMetrics({ buildingInsights, selectedPanelCount, yearlyEnergy }: SolarMetricsProps) {
  const { solarPotential } = buildingInsights

  const co2Offset = (yearlyEnergy / 1000) * solarPotential.carbonOffsetFactorKgPerMwh
  const yearlySavings = yearlyEnergy * 0.12 // Average electricity rate
  const roofArea = solarPotential.wholeRoofStats.areaMeters2
  const sunshineHours = solarPotential.maxSunshineHoursPerYear

  const metrics = [
    {
      label: "Solar Panels",
      value: formatNumber(selectedPanelCount),
      subtext: `of ${solarPotential.maxArrayPanelsCount} max`,
      icon: LayoutGrid,
      color: "text-blue-500",
    },
    {
      label: "Yearly Energy",
      value: `${formatNumber(yearlyEnergy / 1000, 1)}`,
      subtext: "MWh/year",
      icon: Zap,
      color: "text-amber-500",
    },
    {
      label: "Sunshine Hours",
      value: formatNumber(sunshineHours),
      subtext: "hours/year",
      icon: Sun,
      color: "text-orange-500",
    },
    {
      label: "CO₂ Offset",
      value: formatNumber(co2Offset / 1000, 1),
      subtext: "tons/year",
      icon: Leaf,
      color: "text-green-500",
    },
    {
      label: "Estimated Savings",
      value: formatCurrency(yearlySavings),
      subtext: "per year",
      icon: DollarSign,
      color: "text-emerald-500",
    },
    {
      label: "Roof Area",
      value: formatNumber(roofArea),
      subtext: "m²",
      icon: Home,
      color: "text-primary",
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {metrics.map((metric) => (
        <Card key={metric.label} className="bg-card">
          <CardHeader className="pb-2 pt-4 px-4">
            <div className="flex items-center gap-2">
              <metric.icon className={`h-4 w-4 ${metric.color}`} />
              <CardTitle className="text-xs font-medium text-muted-foreground">{metric.label}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <div className="text-2xl font-bold">{metric.value}</div>
            <div className="text-xs text-muted-foreground">{metric.subtext}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
