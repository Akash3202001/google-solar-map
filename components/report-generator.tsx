"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { BuildingInsights } from "@/lib/types"
import { formatNumber, formatCurrency, calculateSystemSize } from "@/lib/solar-api"
import { FileText, Download, Loader2, Share2 } from "lucide-react"

interface ReportGeneratorProps {
  buildingInsights: BuildingInsights
  selectedPanelCount: number
  yearlyEnergy: number
  address: string
}

export function ReportGenerator({ buildingInsights, selectedPanelCount, yearlyEnergy, address }: ReportGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false)

  const generateReport = async () => {
    setIsGenerating(true)

    const { solarPotential, center, imageryDate, imageryQuality } = buildingInsights
    const systemSize = calculateSystemSize(selectedPanelCount)
    const systemCost = selectedPanelCount * 300
    const federalCredit = systemCost * 0.3
    const netCost = systemCost - federalCredit
    const yearlySavings = yearlyEnergy * 0.12
    const co2Offset = (yearlyEnergy / 1000) * solarPotential.carbonOffsetFactorKgPerMwh

    // Create report content
    const reportContent = `
SOLAR POTENTIAL REPORT
======================

Generated: ${new Date().toLocaleDateString("en-US", { dateStyle: "full" })}

PROPERTY INFORMATION
--------------------
Address: ${address}
Coordinates: ${center.latitude.toFixed(5)}, ${center.longitude.toFixed(5)}
Imagery Date: ${imageryDate.month}/${imageryDate.day}/${imageryDate.year}
Imagery Quality: ${imageryQuality}

ROOF ANALYSIS
-------------
Total Roof Area: ${formatNumber(solarPotential.wholeRoofStats.areaMeters2, 1)} m²
Usable Solar Area: ${formatNumber(solarPotential.maxArrayAreaMeters2, 1)} m²
Maximum Sunshine: ${formatNumber(solarPotential.maxSunshineHoursPerYear)} hours/year
Number of Roof Segments: ${solarPotential.roofSegmentStats.length}

RECOMMENDED SYSTEM
------------------
Panel Count: ${selectedPanelCount} panels
System Size: ${formatNumber(systemSize.systemSizeKw, 2)} kW
Roof Area Required: ${formatNumber(systemSize.roofAreaNeeded, 1)} m²
System Weight: ${formatNumber(systemSize.weight)} kg

ENERGY PRODUCTION
-----------------
Year 1 Production: ${formatNumber(yearlyEnergy)} kWh
25-Year Production: ${formatNumber(yearlyEnergy * 22.5)} kWh (with degradation)
Average Monthly: ${formatNumber(yearlyEnergy / 12)} kWh

FINANCIAL ANALYSIS
------------------
Estimated System Cost: ${formatCurrency(systemCost)}
Federal Tax Credit (30%): -${formatCurrency(federalCredit)}
Net System Cost: ${formatCurrency(netCost)}

Year 1 Savings: ${formatCurrency(yearlySavings)}
25-Year Savings: ${formatCurrency(yearlySavings * 22.5)}
Payback Period: ${formatNumber(netCost / yearlySavings, 1)} years
25-Year Net Profit: ${formatCurrency(yearlySavings * 22.5 - netCost)}

ENVIRONMENTAL IMPACT
--------------------
Annual CO₂ Offset: ${formatNumber(co2Offset)} kg (${formatNumber(co2Offset / 1000, 2)} tons)
25-Year CO₂ Offset: ${formatNumber((co2Offset * 25) / 1000, 1)} tons
Equivalent Trees Planted: ${formatNumber(co2Offset / 21)} trees
Equivalent Miles Not Driven: ${formatNumber(co2Offset / 0.411)} miles

ROOF SEGMENTS DETAIL
--------------------
${solarPotential.roofSegmentStats
  .map(
    (seg, i) => `Segment ${i + 1}:
  - Area: ${formatNumber(seg.stats.areaMeters2, 1)} m²
  - Pitch: ${formatNumber(seg.pitchDegrees)}°
  - Azimuth: ${formatNumber(seg.azimuthDegrees)}°
  - Height: ${formatNumber(seg.planeHeightAtCenterMeters, 1)} m`,
  )
  .join("\n\n")}

---
Report generated using Google Solar API
This is an estimate only. Actual results may vary.
Consult with a licensed solar installer for accurate quotes.
    `.trim()

    // Create and download the file
    const blob = new Blob([reportContent], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `solar-report-${new Date().toISOString().split("T")[0]}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    setIsGenerating(false)
  }

  const handleShare = async () => {
    const shareData = {
      title: "Solar Potential Report",
      text: `Check out this solar potential analysis for ${address}. Estimated ${formatNumber(yearlyEnergy)} kWh/year with ${selectedPanelCount} panels!`,
      url: window.location.href,
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (err) {
        // User cancelled or error
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}\n${shareData.url}`)
      alert("Report details copied to clipboard!")
    }
  }

  return (
    <Card className="bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Generate Report
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Download a detailed solar potential report with all calculations and recommendations.
        </p>
        <div className="flex gap-2">
          <Button onClick={generateReport} disabled={isGenerating} className="flex-1">
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Download Report
              </>
            )}
          </Button>
          <Button variant="outline" onClick={handleShare}>
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
