// Solar API response types
export interface LatLng {
  latitude: number
  longitude: number
}

export interface SizeAndSunshineStats {
  areaMeters2: number
  sunshineQuantiles: number[]
  groundAreaMeters2?: number
}

export interface RoofSegmentStats {
  pitchDegrees: number
  azimuthDegrees: number
  stats: SizeAndSunshineStats
  center: LatLng
  boundingBox: {
    sw: LatLng
    ne: LatLng
  }
  planeHeightAtCenterMeters: number
}

export interface SolarPanelConfig {
  panelsCount: number
  yearlyEnergyDcKwh: number
  roofSegmentSummaries: {
    pitchDegrees: number
    azimuthDegrees: number
    panelsCount: number
    yearlyEnergyDcKwh: number
    segmentIndex: number
  }[]
}

export interface FinancialAnalysis {
  monthlyBill: {
    currencyCode: string
    units: string
  }
  defaultBill: boolean
  averageKwhPerMonth: number
  financialDetails?: {
    initialAcKwhPerYear: number
    remainingLifetimeUtilityBill: {
      currencyCode: string
      units: string
    }
    federalIncentive: {
      currencyCode: string
      units: string
    }
    stateIncentive: {
      currencyCode: string
      units: string
    }
    utilityIncentive: {
      currencyCode: string
      units: string
    }
    lifetimeSrecTotal: {
      currencyCode: string
      units: string
    }
    costOfElectricityWithoutSolar: {
      currencyCode: string
      units: string
    }
    netMeteringAllowed: boolean
    solarPercentage: number
    percentageExportedToGrid: number
  }
  leasingSavings?: {
    leasesAllowed: boolean
    leasesSupported: boolean
    annualLeasingCost: {
      currencyCode: string
      units: string
    }
    savings: {
      savingsYear1: { currencyCode: string; units: string }
      savingsYear20: { currencyCode: string; units: string }
      savingsLifetime: { currencyCode: string; units: string }
    }
  }
  cashPurchaseSavings?: {
    outOfPocketCost: {
      currencyCode: string
      units: string
    }
    upfrontCost: {
      currencyCode: string
      units: string
    }
    rebateValue: {
      currencyCode: string
      units: string
    }
    paybackYears: number
    savings: {
      savingsYear1: { currencyCode: string; units: string }
      savingsYear20: { currencyCode: string; units: string }
      savingsLifetime: { currencyCode: string; units: string }
    }
  }
  financedPurchaseSavings?: {
    annualLoanPayment: {
      currencyCode: string
      units: string
    }
    rebateValue: {
      currencyCode: string
      units: string
    }
    loanInterestRate: number
    savings: {
      savingsYear1: { currencyCode: string; units: string }
      savingsYear20: { currencyCode: string; units: string }
      savingsLifetime: { currencyCode: string; units: string }
    }
  }
  panelConfigIndex: number
}

export interface BuildingInsights {
  name: string
  center: LatLng
  imageryDate: {
    year: number
    month: number
    day: number
  }
  regionCode: string
  solarPotential: {
    maxArrayPanelsCount: number
    maxArrayAreaMeters2: number
    maxSunshineHoursPerYear: number
    carbonOffsetFactorKgPerMwh: number
    wholeRoofStats: SizeAndSunshineStats
    buildingStats: SizeAndSunshineStats
    roofSegmentStats: RoofSegmentStats[]
    solarPanels: {
      center: LatLng
      orientation: "PORTRAIT" | "LANDSCAPE"
      yearlyEnergyDcKwh: number
      segmentIndex: number
    }[]
    solarPanelConfigs: SolarPanelConfig[]
    financialAnalyses: FinancialAnalysis[]
  }
  imageryQuality: "HIGH" | "MEDIUM" | "LOW"
  imageryProcessedDate: {
    year: number
    month: number
    day: number
  }
}

export interface DataLayers {
  imageryDate: {
    year: number
    month: number
    day: number
  }
  imageryProcessedDate: {
    year: number
    month: number
    day: number
  }
  dsmUrl: string
  rgbUrl: string
  maskUrl: string
  annualFluxUrl: string
  monthlyFluxUrl: string
  hourlyShadeUrls: string[]
  imageryQuality: "HIGH" | "MEDIUM" | "LOW"
}

export interface SolarCalculation {
  buildingInsights: BuildingInsights | null
  dataLayers: DataLayers | null
  selectedPanelCount: number
  monthlyBill: number
  loading: boolean
  error: string | null
}
