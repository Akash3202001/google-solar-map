"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Layers, Sun, Cloud, Grid3X3, Download, Loader2 } from "lucide-react"
import type { DataLayers } from "@/lib/types"
import { getDataLayers } from "@/lib/solar-api"

interface DataLayersPanelProps {
  location: { lat: number; lng: number } | null
  apiKey: string
}

type LayerType = "rgb" | "dsm" | "mask" | "annualFlux" | "monthlyFlux"

const layerInfo: Record<LayerType, { label: string; description: string; icon: typeof Sun }> = {
  rgb: {
    label: "RGB Imagery",
    description: "Satellite imagery of the building",
    icon: Grid3X3,
  },
  dsm: {
    label: "Digital Surface Model",
    description: "3D elevation data of the roof",
    icon: Layers,
  },
  mask: {
    label: "Building Mask",
    description: "Building footprint boundaries",
    icon: Grid3X3,
  },
  annualFlux: {
    label: "Annual Solar Flux",
    description: "Yearly solar radiation heatmap",
    icon: Sun,
  },
  monthlyFlux: {
    label: "Monthly Flux",
    description: "Monthly solar radiation data",
    icon: Cloud,
  },
}

export function DataLayersPanel({ location, apiKey }: DataLayersPanelProps) {
  const [dataLayers, setDataLayers] = useState<DataLayers | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedLayer, setSelectedLayer] = useState<LayerType | null>(null)

  const fetchDataLayers = async () => {
    if (!location) return

    setIsLoading(true)
    setError(null)

    try {
      const layers = await getDataLayers({ latitude: location.lat, longitude: location.lng }, 100, apiKey)
      setDataLayers(layers)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch data layers")
    } finally {
      setIsLoading(false)
    }
  }

  const getLayerUrl = (layer: LayerType): string | null => {
    if (!dataLayers) return null
    switch (layer) {
      case "rgb":
        return dataLayers.rgbUrl
      case "dsm":
        return dataLayers.dsmUrl
      case "mask":
        return dataLayers.maskUrl
      case "annualFlux":
        return dataLayers.annualFluxUrl
      case "monthlyFlux":
        return dataLayers.monthlyFluxUrl
      default:
        return null
    }
  }

  if (!location) {
    return null
  }

  return (
    <Card className="bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Layers className="h-4 w-4" />
            Data Layers
          </CardTitle>
          {!dataLayers && (
            <Button size="sm" variant="outline" onClick={fetchDataLayers} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                  Loading
                </>
              ) : (
                "Load Layers"
              )}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {error && <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm mb-4">{error}</div>}

        {dataLayers ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
              <Badge variant="outline" className="text-xs">
                {dataLayers.imageryQuality} Quality
              </Badge>
              <span>
                Imagery from {dataLayers.imageryDate.month}/{dataLayers.imageryDate.day}/{dataLayers.imageryDate.year}
              </span>
            </div>

            {(Object.keys(layerInfo) as LayerType[]).map((layer) => {
              const info = layerInfo[layer]
              const url = getLayerUrl(layer)
              const isSelected = selectedLayer === layer

              return (
                <button
                  key={layer}
                  onClick={() => setSelectedLayer(isSelected ? null : layer)}
                  className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                    isSelected ? "bg-primary/10 border border-primary/20" : "bg-muted/50 hover:bg-muted"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <info.icon className="h-4 w-4 text-primary" />
                    </div>
                    <div className="text-left">
                      <div className="text-sm font-medium">{info.label}</div>
                      <div className="text-xs text-muted-foreground">{info.description}</div>
                    </div>
                  </div>
                  {url && (
                    <a
                      href={`${url}&key=${apiKey}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="p-2 rounded-md hover:bg-muted"
                    >
                      <Download className="h-4 w-4 text-muted-foreground" />
                    </a>
                  )}
                </button>
              )
            })}

            {dataLayers.hourlyShadeUrls && dataLayers.hourlyShadeUrls.length > 0 && (
              <div className="pt-3 border-t border-border">
                <div className="text-xs text-muted-foreground mb-2">
                  Hourly Shade Data: {dataLayers.hourlyShadeUrls.length} files available
                </div>
              </div>
            )}
          </div>
        ) : (
          !isLoading && (
            <div className="text-center py-4 text-sm text-muted-foreground">
              Load data layers to view detailed solar flux maps, DSM, and building masks.
            </div>
          )
        )}
      </CardContent>
    </Card>
  )
}
