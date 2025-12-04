"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { BuildingInsights } from "@/lib/types"
import { formatNumber, calculateSystemSize } from "@/lib/solar-api"
import { Ruler, Weight, Maximize2, Calendar, MapPin, CheckCircle2 } from "lucide-react"

interface SystemSpecsProps {
  buildingInsights: BuildingInsights
  selectedPanelCount: number
}

export function SystemSpecs({ buildingInsights, selectedPanelCount }: SystemSpecsProps) {
  const systemSize = calculateSystemSize(selectedPanelCount)
  const { imageryDate, imageryQuality, center, regionCode } = buildingInsights

  const specs = [
    {
      label: "System Size",
      value: `${formatNumber(systemSize.systemSizeKw, 1)} kW`,
      icon: Maximize2,
    },
    {
      label: "Roof Area Needed",
      value: `${formatNumber(systemSize.roofAreaNeeded, 1)} m²`,
      icon: Ruler,
    },
    {
      label: "System Weight",
      value: `${formatNumber(systemSize.weight)} kg`,
      icon: Weight,
    },
    {
      label: "Imagery Date",
      value: `${imageryDate.month}/${imageryDate.day}/${imageryDate.year}`,
      icon: Calendar,
    },
  ]

  return (
    <Card className="bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">System Specifications</CardTitle>
          <Badge variant="outline" className="text-xs">
            {imageryQuality} Quality
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {specs.map((spec) => (
            <div key={spec.label} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
              <spec.icon className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-xs text-muted-foreground">{spec.label}</div>
                <div className="text-sm font-medium">{spec.value}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-3 border-t border-border">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Location:</span>
            <span className="font-mono text-xs">
              {center.latitude.toFixed(5)}, {center.longitude.toFixed(5)}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm mt-2">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <span className="text-muted-foreground">Region:</span>
            <span>{regionCode || "N/A"}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
