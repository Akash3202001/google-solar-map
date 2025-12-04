"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { RoofSegmentStats } from "@/lib/types"
import { formatNumber } from "@/lib/solar-api"
import { Compass } from "lucide-react"

interface RoofSegmentsProps {
  segments: RoofSegmentStats[]
}

function getDirectionFromAzimuth(azimuth: number): string {
  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"]
  const index = Math.round(azimuth / 45) % 8
  return directions[index]
}

function getSunshineQuality(quantiles: number[]): { label: string; color: string } {
  const avgSunshine = quantiles.reduce((a, b) => a + b, 0) / quantiles.length
  if (avgSunshine > 1400) return { label: "Excellent", color: "bg-green-500" }
  if (avgSunshine > 1100) return { label: "Good", color: "bg-yellow-500" }
  if (avgSunshine > 800) return { label: "Fair", color: "bg-orange-500" }
  return { label: "Limited", color: "bg-red-500" }
}

export function RoofSegments({ segments }: RoofSegmentsProps) {
  return (
    <Card className="bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Roof Segments</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {segments.slice(0, 4).map((segment, i) => {
            const quality = getSunshineQuality(segment.stats.sunshineQuantiles)
            return (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                    <Compass className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">
                      Segment {i + 1} ({getDirectionFromAzimuth(segment.azimuthDegrees)})
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatNumber(segment.stats.areaMeters2, 1)} m² • {formatNumber(segment.pitchDegrees)}° pitch
                    </div>
                  </div>
                </div>
                <Badge variant="outline" className={`${quality.color} text-foreground border-0`}>
                  {quality.label}
                </Badge>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
