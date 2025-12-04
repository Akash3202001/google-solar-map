"use client"

import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatNumber, formatCurrency } from "@/lib/solar-api"
import type { BuildingInsights } from "@/lib/types"

interface PanelSliderProps {
  buildingInsights: BuildingInsights
  value: number
  onChange: (value: number) => void
}

export function PanelSlider({ buildingInsights, value, onChange }: PanelSliderProps) {
  const { solarPotential } = buildingInsights
  const maxPanels = solarPotential.maxArrayPanelsCount

  // Find the configuration for the current panel count
  const getEnergyForPanels = (count: number) => {
    const config = solarPotential.solarPanelConfigs.find((c) => c.panelsCount >= count)
    return config?.yearlyEnergyDcKwh || 0
  }

  const yearlyEnergy = getEnergyForPanels(value)
  const yearlySavings = yearlyEnergy * 0.12

  return (
    <Card className="bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Panel Configuration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Number of Panels</Label>
            <span className="text-2xl font-bold text-primary">{value}</span>
          </div>
          <Slider
            value={[value]}
            onValueChange={([v]) => onChange(v)}
            min={1}
            max={maxPanels}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>1 panel</span>
            <span>{maxPanels} panels (max)</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border">
          <div>
            <div className="text-xs text-muted-foreground mb-1">Energy Production</div>
            <div className="text-lg font-semibold">
              {formatNumber(yearlyEnergy / 1000, 1)} MWh
              <span className="text-xs font-normal text-muted-foreground">/year</span>
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">Est. Savings</div>
            <div className="text-lg font-semibold text-solar-success">
              {formatCurrency(yearlySavings)}
              <span className="text-xs font-normal text-muted-foreground">/year</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
