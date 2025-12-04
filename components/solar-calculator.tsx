"use client"

import { useState, useCallback } from "react"
import { Sun, AlertCircle, Loader2, Settings } from "lucide-react"
import { AddressSearch } from "./address-search"
import { SolarMap } from "./solar-map"
import { SolarMetrics } from "./solar-metrics"
import { EnergyChart } from "./energy-chart"
import { RoofSegments } from "./roof-segments"
import { FinancialSummary } from "./financial-summary"
import { DataLayersPanel } from "./data-layers-panel"
import { SystemSpecs } from "./system-specs"
import { SavingsBreakdown } from "./savings-breakdown"
import { EnvironmentalImpact } from "./environmental-impact"
import { PanelSimulation } from "./panel-simulation"
import { ReportGenerator } from "./report-generator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { BuildingInsights } from "@/lib/types"
import { getBuildingInsights, getOptimalPanelConfig } from "@/lib/solar-api"
import { useGoogleMaps } from "@/hooks/use-google-maps"

interface SolarCalculatorProps {
  apiKey: string
}

export function SolarCalculator({ apiKey }: SolarCalculatorProps) {
  const [location, setLocation] = useState<{ lat: number; lng: number; address: string } | null>(null)
  const [buildingInsights, setBuildingInsights] = useState<BuildingInsights | null>(null)
  const [selectedPanelCount, setSelectedPanelCount] = useState(0)
  const [yearlyEnergy, setYearlyEnergy] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPanels, setShowPanels] = useState(true)

  const { isLoaded: mapsLoaded, loadError: mapsError } = useGoogleMaps(apiKey)

  const fetchSolarData = useCallback(
    async (lat: number, lng: number) => {
      setIsLoading(true)
      setError(null)

      try {
        const insights = await getBuildingInsights({ latitude: lat, longitude: lng }, apiKey)
        setBuildingInsights(insights)

        const optimal = getOptimalPanelConfig(insights)
        setSelectedPanelCount(optimal.panelCount)
        setYearlyEnergy(optimal.yearlyEnergy)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch solar data")
        setBuildingInsights(null)
      } finally {
        setIsLoading(false)
      }
    },
    [apiKey],
  )

  const handleLocationSelect = useCallback(
    (loc: { lat: number; lng: number; address: string }) => {
      setLocation(loc)
      fetchSolarData(loc.lat, loc.lng)
    },
    [fetchSolarData],
  )

  const handleMapClick = useCallback(
    (loc: { lat: number; lng: number }) => {
      setLocation({ ...loc, address: `${loc.lat.toFixed(6)}, ${loc.lng.toFixed(6)}` })
      fetchSolarData(loc.lat, loc.lng)
    },
    [fetchSolarData],
  )

  const handlePanelCountChange = useCallback(
    (count: number) => {
      setSelectedPanelCount(count)
      if (buildingInsights) {
        const config = buildingInsights.solarPotential.solarPanelConfigs.find((c) => c.panelsCount >= count)
        setYearlyEnergy(config?.yearlyEnergyDcKwh || 0)
      }
    },
    [buildingInsights],
  )

  const handleClearApiKey = () => {
    localStorage.removeItem("google-maps-api-key")
    window.location.reload()
  }

  const systemCost = selectedPanelCount * 300

  if (!mapsLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading Google Maps...</p>
        </div>
      </div>
    )
  }

  if (mapsError) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Failed to load Google Maps</AlertTitle>
          <AlertDescription>
            Please check your API key and ensure the Maps JavaScript API is enabled.
            <Button variant="outline" className="mt-4 w-full bg-transparent" onClick={handleClearApiKey}>
              Change API Key
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary">
              <Sun className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg">Solar Calculator</span>
          </div>
          <div className="hidden md:block w-full max-w-md mx-8">
            <AddressSearch onSelectLocation={handleLocationSelect} />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleClearApiKey}>Change API Key</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Mobile Search */}
      <div className="md:hidden p-4 border-b border-border bg-card">
        <AddressSearch onSelectLocation={handleLocationSelect} />
      </div>

      {/* Main Content */}
      <main className="container px-4 py-6">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Map Section */}
          <div className="lg:col-span-2 space-y-4">
            <div className="h-[400px] lg:h-[500px] rounded-lg overflow-hidden border border-border">
              <SolarMap
                center={location ? { lat: location.lat, lng: location.lng } : null}
                onMapClick={handleMapClick}
                roofSegments={buildingInsights?.solarPotential.roofSegmentStats}
                solarPanels={buildingInsights?.solarPotential.solarPanels}
                showPanels={showPanels && !!buildingInsights}
                panelCount={selectedPanelCount}
              />
            </div>

            {location && (
              <div className="p-3 rounded-lg bg-muted/50 text-sm">
                <span className="font-medium">Selected Location:</span>{" "}
                <span className="text-muted-foreground">{location.address}</span>
              </div>
            )}

            {isLoading && (
              <div className="flex items-center justify-center p-8 rounded-lg border border-border bg-card">
                <Loader2 className="h-8 w-8 animate-spin text-primary mr-3" />
                <span className="text-muted-foreground">Analyzing solar potential...</span>
              </div>
            )}
          </div>

          {/* Results Sidebar */}
          <div className="space-y-4">
            {buildingInsights ? (
              <>
                <SolarMetrics
                  buildingInsights={buildingInsights}
                  selectedPanelCount={selectedPanelCount}
                  yearlyEnergy={yearlyEnergy}
                />
                <PanelSimulation
                  buildingInsights={buildingInsights}
                  selectedPanelCount={selectedPanelCount}
                  onPanelCountChange={handlePanelCountChange}
                  showPanels={showPanels}
                  onShowPanelsChange={setShowPanels}
                />
                <ReportGenerator
                  buildingInsights={buildingInsights}
                  selectedPanelCount={selectedPanelCount}
                  yearlyEnergy={yearlyEnergy}
                  address={location?.address || ""}
                />
              </>
            ) : (
              !isLoading && (
                <div className="p-8 rounded-lg border border-dashed border-border text-center">
                  <Sun className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                  <h3 className="font-medium mb-2">Enter an Address</h3>
                  <p className="text-sm text-muted-foreground text-balance">
                    Search for an address or click on the map to analyze solar potential for any building.
                  </p>
                </div>
              )
            )}
          </div>
        </div>

        {/* Additional Analysis - Enhanced Grid */}
        {buildingInsights && (
          <>
            <div className="mt-6">
              <SavingsBreakdown yearlyEnergy={yearlyEnergy} systemCost={systemCost} />
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
              <EnergyChart buildingInsights={buildingInsights} selectedPanelCount={selectedPanelCount} />
              <RoofSegments segments={buildingInsights.solarPotential.roofSegmentStats} />
              <EnvironmentalImpact
                yearlyEnergyKwh={yearlyEnergy}
                carbonOffsetFactor={buildingInsights.solarPotential.carbonOffsetFactorKgPerMwh}
              />
              <FinancialSummary buildingInsights={buildingInsights} selectedPanelCount={selectedPanelCount} />
            </div>

            {/* System Specs & Data Layers */}
            <div className="grid md:grid-cols-2 gap-6 mt-6">
              <SystemSpecs buildingInsights={buildingInsights} selectedPanelCount={selectedPanelCount} />
              <DataLayersPanel location={location ? { lat: location.lat, lng: location.lng } : null} apiKey={apiKey} />
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card mt-12">
        <div className="container px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>Solar potential analysis powered by Google Solar API</p>
            <p>Estimates only. Consult a licensed installer for accurate quotes.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
