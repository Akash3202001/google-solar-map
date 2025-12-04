"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import type { BuildingInsights } from "@/lib/types"
import { formatNumber, formatCurrency } from "@/lib/solar-api"
import { Settings2, Zap, RotateCcw } from "lucide-react"

interface PanelSimulationProps {
  buildingInsights: BuildingInsights
  selectedPanelCount: number
  onPanelCountChange: (count: number) => void
  showPanels: boolean
  onShowPanelsChange: (show: boolean) => void
}

type PanelType = "standard" | "premium" | "budget"

const panelTypes: Record<PanelType, { label: string; watts: number; efficiency: number; pricePerPanel: number }> = {
  standard: { label: "Standard (400W)", watts: 400, efficiency: 0.2, pricePerPanel: 250 },
  premium: { label: "Premium (450W)", watts: 450, efficiency: 0.22, pricePerPanel: 350 },
  budget: { label: "Budget (350W)", watts: 350, efficiency: 0.18, pricePerPanel: 180 },
}

export function PanelSimulation({
  buildingInsights,
  selectedPanelCount,
  onPanelCountChange,
  showPanels,
  onShowPanelsChange,
}: PanelSimulationProps) {
  const [panelType, setPanelType] = useState<PanelType>("standard")
  const [electricityRate, setElectricityRate] = useState(0.12)
  const [degradationRate, setDegradationRate] = useState(0.5)

  const { solarPotential } = buildingInsights
  const maxPanels = solarPotential.maxArrayPanelsCount

  // Calculate with selected panel type
  const panel = panelTypes[panelType]
  const systemSizeKw = (selectedPanelCount * panel.watts) / 1000

  // Find base energy from API config
  const config = solarPotential.solarPanelConfigs.find((c) => c.panelsCount >= selectedPanelCount)
  const baseYearlyEnergy = config?.yearlyEnergyDcKwh || 0

  // Adjust for panel efficiency difference (API assumes ~20% efficiency)
  const adjustedYearlyEnergy = baseYearlyEnergy * (panel.efficiency / 0.2)

  // Calculate 25-year production with degradation
  const lifetimeEnergy = Array.from({ length: 25 }, (_, year) => {
    return adjustedYearlyEnergy * Math.pow(1 - degradationRate / 100, year)
  }).reduce((a, b) => a + b, 0)

  const totalCost = selectedPanelCount * panel.pricePerPanel
  const federalCredit = totalCost * 0.3
  const netCost = totalCost - federalCredit
  const lifetimeSavings = lifetimeEnergy * electricityRate
  const netProfit = lifetimeSavings - netCost

  const handleReset = () => {
    setPanelType("standard")
    setElectricityRate(0.12)
    setDegradationRate(0.5)
    const optimal = solarPotential.solarPanelConfigs[solarPotential.solarPanelConfigs.length - 1]
    onPanelCountChange(optimal?.panelsCount || maxPanels)
  }

  return (
    <Card className="bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Settings2 className="h-4 w-4" />
            Panel Simulation
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={handleReset}>
            <RotateCcw className="h-3 w-3 mr-1" />
            Reset
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Show Panels Toggle */}
        <div className="flex items-center justify-between">
          <Label htmlFor="show-panels" className="text-sm">
            Show Panels on Map
          </Label>
          <Switch id="show-panels" checked={showPanels} onCheckedChange={onShowPanelsChange} />
        </div>

        {/* Panel Type Selection */}
        <div className="space-y-2">
          <Label className="text-sm">Panel Type</Label>
          <Select value={panelType} onValueChange={(v) => setPanelType(v as PanelType)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(panelTypes).map(([key, value]) => (
                <SelectItem key={key} value={key}>
                  {value.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Panel Count */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm">Number of Panels</Label>
            <span className="text-lg font-bold text-primary">{selectedPanelCount}</span>
          </div>
          <Slider
            value={[selectedPanelCount]}
            onValueChange={([v]) => onPanelCountChange(v)}
            min={1}
            max={maxPanels}
            step={1}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>1</span>
            <span>{maxPanels} max</span>
          </div>
        </div>

        {/* Electricity Rate */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm">Electricity Rate</Label>
            <span className="text-sm font-medium">${electricityRate.toFixed(2)}/kWh</span>
          </div>
          <Slider
            value={[electricityRate * 100]}
            onValueChange={([v]) => setElectricityRate(v / 100)}
            min={5}
            max={40}
            step={1}
          />
        </div>

        {/* Degradation Rate */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm">Annual Degradation</Label>
            <span className="text-sm font-medium">{degradationRate}%/year</span>
          </div>
          <Slider
            value={[degradationRate * 10]}
            onValueChange={([v]) => setDegradationRate(v / 10)}
            min={2}
            max={10}
            step={1}
          />
        </div>

        {/* Results Summary */}
        <div className="pt-4 border-t border-border space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">System Size</span>
            <span className="font-medium">{formatNumber(systemSizeKw, 2)} kW</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Year 1 Production</span>
            <span className="font-medium">{formatNumber(adjustedYearlyEnergy)} kWh</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">25-Year Production</span>
            <span className="font-medium">{formatNumber(lifetimeEnergy / 1000, 1)} MWh</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Net System Cost</span>
            <span className="font-medium">{formatCurrency(netCost)}</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10">
            <span className="text-sm font-medium flex items-center gap-1">
              <Zap className="h-4 w-4 text-green-500" />
              25-Year Net Profit
            </span>
            <span className="text-lg font-bold text-green-500">{formatCurrency(netProfit)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
