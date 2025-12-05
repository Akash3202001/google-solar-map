"use client"

import { useEffect, useRef, useCallback, useState } from "react"
import { Loader2 } from "lucide-react"
import type { PanelConfig } from "@/lib/types"
import { DEFAULT_PANEL_CONFIG } from "@/lib/types"
import type { google } from "google-maps"

interface SolarMapProps {
  center: { lat: number; lng: number } | null
  onMapClick?: (location: { lat: number; lng: number }) => void
  roofSegments?: {
    center: { latitude: number; longitude: number }
    boundingBox: {
      sw: { latitude: number; longitude: number }
      ne: { latitude: number; longitude: number }
    }
  }[]
  solarPanels?: {
    center: { latitude: number; longitude: number }
    orientation: "PORTRAIT" | "LANDSCAPE"
  }[]
  showPanels?: boolean
  panelCount?: number
  panelConfig?: PanelConfig
}

function metersToLatDegrees(meters: number): number {
  return meters / 111320
}

function metersToLngDegrees(meters: number, latitude: number): number {
  return meters / (111320 * Math.cos((latitude * Math.PI) / 180))
}

function rotatePoint(
  point: { lat: number; lng: number },
  center: { lat: number; lng: number },
  angleDegrees: number,
): { lat: number; lng: number } {
  const angleRad = (angleDegrees * Math.PI) / 180
  const cos = Math.cos(angleRad)
  const sin = Math.sin(angleRad)

  const dx = point.lng - center.lng
  const dy = point.lat - center.lat

  return {
    lng: center.lng + dx * cos - dy * sin,
    lat: center.lat + dx * sin + dy * cos,
  }
}

function createRotatedPanelCoords(
  centerLat: number,
  centerLng: number,
  widthMeters: number,
  heightMeters: number,
  rotationDegrees: number,
  offsetXMeters: number,
  offsetYMeters: number,
): Array<{ lat: number; lng: number }> {
  // Apply offset
  const offsetLat = metersToLatDegrees(offsetYMeters)
  const offsetLng = metersToLngDegrees(offsetXMeters, centerLat)
  const adjustedCenter = {
    lat: centerLat + offsetLat,
    lng: centerLng + offsetLng,
  }

  // Convert dimensions to degrees
  const halfWidthDeg = metersToLngDegrees(widthMeters / 2, adjustedCenter.lat)
  const halfHeightDeg = metersToLatDegrees(heightMeters / 2)

  // Create corner points (before rotation)
  const corners = [
    { lat: adjustedCenter.lat - halfHeightDeg, lng: adjustedCenter.lng - halfWidthDeg }, // SW
    { lat: adjustedCenter.lat - halfHeightDeg, lng: adjustedCenter.lng + halfWidthDeg }, // SE
    { lat: adjustedCenter.lat + halfHeightDeg, lng: adjustedCenter.lng + halfWidthDeg }, // NE
    { lat: adjustedCenter.lat + halfHeightDeg, lng: adjustedCenter.lng - halfWidthDeg }, // NW
  ]

  // Rotate each corner around the adjusted center
  return corners.map((corner) => rotatePoint(corner, adjustedCenter, rotationDegrees))
}

export function SolarMap({
  center,
  onMapClick,
  roofSegments,
  solarPanels,
  showPanels = true,
  panelCount = 0,
  panelConfig = DEFAULT_PANEL_CONFIG,
}: SolarMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<google.maps.Map | null>(null)
  const markersRef = useRef<google.maps.Marker[]>([])
  const polygonsRef = useRef<google.maps.Rectangle[]>([])
  const panelPolygonsRef = useRef<google.maps.Polygon[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [mapReady, setMapReady] = useState(false)

  const clearMarkers = useCallback(() => {
    markersRef.current.forEach((marker) => marker.setMap(null))
    markersRef.current = []
  }, [])

  const clearPolygons = useCallback(() => {
    polygonsRef.current.forEach((polygon) => polygon.setMap(null))
    polygonsRef.current = []
  }, [])

  const clearPanelPolygons = useCallback(() => {
    panelPolygonsRef.current.forEach((poly) => poly.setMap(null))
    panelPolygonsRef.current = []
  }, [])

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || !window.google?.maps || mapInstanceRef.current) return

    const defaultCenter = center || { lat: 37.4419, lng: -122.143 }

    mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
      center: defaultCenter,
      zoom: center ? 21 : 4,
      mapTypeId: "satellite",
      tilt: 0,
      disableDefaultUI: false,
      zoomControl: true,
      mapTypeControl: true,
      streetViewControl: false,
      fullscreenControl: true,
    })

    if (onMapClick) {
      mapInstanceRef.current.addListener("click", (e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
          onMapClick({ lat: e.latLng.lat(), lng: e.latLng.lng() })
        }
      })
    }

    setIsLoading(false)
    setMapReady(true)
  }, [])

  // Update center when it changes
  useEffect(() => {
    if (!mapInstanceRef.current || !center || !window.google?.maps) return

    mapInstanceRef.current.setCenter(center)
    mapInstanceRef.current.setZoom(21)

    clearMarkers()
    const marker = new window.google.maps.Marker({
      position: center,
      map: mapInstanceRef.current,
      title: "Selected Location",
    })
    markersRef.current.push(marker)
  }, [center, clearMarkers, mapReady])

  // Draw roof segments
  useEffect(() => {
    if (!mapInstanceRef.current || !roofSegments || !window.google?.maps) return

    clearPolygons()

    roofSegments.forEach((segment) => {
      const bounds = new window.google.maps.LatLngBounds(
        { lat: segment.boundingBox.sw.latitude, lng: segment.boundingBox.sw.longitude },
        { lat: segment.boundingBox.ne.latitude, lng: segment.boundingBox.ne.longitude },
      )

      const polygon = new window.google.maps.Rectangle({
        bounds,
        map: mapInstanceRef.current,
        strokeColor: "#f97316",
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: "#f97316",
        fillOpacity: 0.2,
      })

      polygonsRef.current.push(polygon)
    })
  }, [roofSegments, clearPolygons, mapReady])

  useEffect(() => {
    if (!mapInstanceRef.current || !window.google?.maps) {
      return
    }

    clearPanelPolygons()

    if (!solarPanels || !showPanels) {
      return
    }

    const panelsToShow = solarPanels.slice(0, panelCount)

    panelsToShow.forEach((panel) => {
      // Determine base dimensions based on orientation
      const baseWidth = panel.orientation === "LANDSCAPE" ? panelConfig.height : panelConfig.width
      const baseHeight = panel.orientation === "LANDSCAPE" ? panelConfig.width : panelConfig.height

      // Create rotated polygon coordinates
      const coords = createRotatedPanelCoords(
        panel.center.latitude,
        panel.center.longitude,
        baseWidth,
        baseHeight,
        panelConfig.rotation,
        panelConfig.offsetX,
        panelConfig.offsetY,
      )

      const polygon = new window.google.maps.Polygon({
        paths: coords,
        map: mapInstanceRef.current,
        strokeColor: "#3b82f6",
        strokeOpacity: 0.9,
        strokeWeight: 1,
        fillColor: "#1e3a8a",
        fillOpacity: 0.7,
      })

      panelPolygonsRef.current.push(polygon)
    })
  }, [solarPanels, showPanels, panelCount, panelConfig, clearPanelPolygons, mapReady])

  return (
    <div className="relative w-full h-full min-h-[400px] rounded-lg overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted z-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}
      <div ref={mapRef} className="w-full h-full" />
    </div>
  )
}
