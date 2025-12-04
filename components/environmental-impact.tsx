"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Leaf, Car, TreePine, Droplets } from "lucide-react"
import { formatNumber } from "@/lib/solar-api"

interface EnvironmentalImpactProps {
  yearlyEnergyKwh: number
  carbonOffsetFactor: number
}

export function EnvironmentalImpact({ yearlyEnergyKwh, carbonOffsetFactor }: EnvironmentalImpactProps) {
  // Calculate environmental equivalents
  const yearlyCO2Kg = (yearlyEnergyKwh / 1000) * carbonOffsetFactor
  const lifetimeCO2Kg = yearlyCO2Kg * 25

  // EPA equivalencies
  const milesNotDriven = yearlyCO2Kg / 0.411 // kg CO2 per mile
  const treesPlanted = yearlyCO2Kg / 21 // kg CO2 absorbed per tree per year
  const gallonsGasSaved = yearlyCO2Kg / 8.887 // kg CO2 per gallon

  const impacts = [
    {
      label: "CO₂ Offset",
      value: formatNumber(yearlyCO2Kg / 1000, 1),
      unit: "tons/year",
      lifetime: `${formatNumber(lifetimeCO2Kg / 1000, 0)} tons over 25 years`,
      icon: Leaf,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      label: "Miles Not Driven",
      value: formatNumber(milesNotDriven),
      unit: "miles/year",
      lifetime: "Equivalent gas car miles",
      icon: Car,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
    },
    {
      label: "Trees Equivalent",
      value: formatNumber(treesPlanted, 0),
      unit: "trees",
      lifetime: "Seedlings grown for 10 years",
      icon: TreePine,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
    },
    {
      label: "Gas Saved",
      value: formatNumber(gallonsGasSaved, 0),
      unit: "gal/year",
      lifetime: "Gallons of gasoline",
      icon: Droplets,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
    },
  ]

  return (
    <Card className="bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Leaf className="h-4 w-4 text-green-500" />
          Environmental Impact
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {impacts.map((impact) => (
            <div key={impact.label} className={`p-3 rounded-lg ${impact.bgColor}`}>
              <div className="flex items-center gap-2 mb-1">
                <impact.icon className={`h-4 w-4 ${impact.color}`} />
                <span className="text-xs text-muted-foreground">{impact.label}</span>
              </div>
              <div className="text-lg font-bold">
                {impact.value}
                <span className="text-xs font-normal text-muted-foreground ml-1">{impact.unit}</span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">{impact.lifetime}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
