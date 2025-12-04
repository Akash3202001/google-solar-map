import type { BuildingInsights, DataLayers, LatLng } from "./types"

const SOLAR_API_BASE = "https://solar.googleapis.com/v1"

export async function getBuildingInsights(location: LatLng, apiKey: string): Promise<BuildingInsights> {
  const params = new URLSearchParams({
    lat: location.latitude.toString(),
    lng: location.longitude.toString(),
    apiKey,
  })

  const response = await fetch(`/api/solar/building-insights?${params}`)

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to fetch building insights")
  }

  return response.json()
}

export async function getDataLayers(location: LatLng, radiusMeters: number, apiKey: string): Promise<DataLayers> {
  const params = new URLSearchParams({
    lat: location.latitude.toString(),
    lng: location.longitude.toString(),
    radius: radiusMeters.toString(),
    apiKey,
  })

  const response = await fetch(`/api/solar/data-layers?${params}`)

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || "Failed to fetch data layers")
  }

  return response.json()
}

// Helper functions for calculations
export function calculateYearlyEnergy(buildingInsights: BuildingInsights, panelCount: number): number {
  const config = buildingInsights.solarPotential.solarPanelConfigs.find((c) => c.panelsCount === panelCount)
  return config?.yearlyEnergyDcKwh || 0
}

export function calculateCO2Offset(yearlyEnergyKwh: number, carbonOffsetFactor: number): number {
  return (yearlyEnergyKwh / 1000) * carbonOffsetFactor
}

export function calculateSavings(yearlyEnergyKwh: number, electricityRate = 0.12): number {
  return yearlyEnergyKwh * electricityRate
}

export function getOptimalPanelConfig(buildingInsights: BuildingInsights): {
  panelCount: number
  yearlyEnergy: number
} {
  const configs = buildingInsights.solarPotential.solarPanelConfigs
  const optimal = configs[configs.length - 1] // Maximum configuration
  return {
    panelCount: optimal?.panelsCount || 0,
    yearlyEnergy: optimal?.yearlyEnergyDcKwh || 0,
  }
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatNumber(num: number, decimals = 0): string {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: decimals,
  }).format(num)
}

export function interpolateMonthlyEnergy(yearlyEnergy: number): { month: string; energy: number }[] {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  // Typical solar production distribution by month (Northern Hemisphere)
  const seasonalFactors = [0.55, 0.65, 0.85, 1.0, 1.15, 1.25, 1.3, 1.2, 1.0, 0.8, 0.6, 0.5]
  const totalFactor = seasonalFactors.reduce((a, b) => a + b, 0)

  return months.map((month, i) => ({
    month,
    energy: Math.round((yearlyEnergy * seasonalFactors[i]) / totalFactor),
  }))
}

export function calculateSystemSize(panelCount: number): {
  systemSizeKw: number
  roofAreaNeeded: number
  weight: number
} {
  const wattsPerPanel = 400 // Modern panel average
  const areaPerPanel = 1.7 // m² per panel
  const weightPerPanel = 20 // kg per panel

  return {
    systemSizeKw: (panelCount * wattsPerPanel) / 1000,
    roofAreaNeeded: panelCount * areaPerPanel,
    weight: panelCount * weightPerPanel,
  }
}
