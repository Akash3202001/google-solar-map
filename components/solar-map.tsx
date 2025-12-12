"use client"

import { useEffect, useRef, useCallback, useState } from "react"
import { Loader2 } from "lucide-react"
import type { IndividualPanelConfig } from "@/lib/types"
import { isPanelInPolygon } from "@/lib/geometry-utils"
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
  individualPanelConfigs?: IndividualPanelConfig[]
  selectedPanelId?: number | null
  onPanelClick?: (panelId: number) => void
  isEditingRoof?: boolean
  roofPolygon?: Array<{ lat: number; lng: number }>
  onRoofPolygonChange?: (polygon: Array<{ lat: number; lng: number }>) => void
  onPanelBoundsCheck?: (panelId: number, isInBounds: boolean) => void
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
  const offsetLat = metersToLatDegrees(offsetYMeters)
  const offsetLng = metersToLngDegrees(offsetXMeters, centerLat)
  const adjustedCenter = {
    lat: centerLat + offsetLat,
    lng: centerLng + offsetLng,
  }

  const halfWidthDeg = metersToLngDegrees(widthMeters / 2, adjustedCenter.lat)
  const halfHeightDeg = metersToLatDegrees(heightMeters / 2)

  const corners = [
    { lat: adjustedCenter.lat - halfHeightDeg, lng: adjustedCenter.lng - halfWidthDeg },
    { lat: adjustedCenter.lat - halfHeightDeg, lng: adjustedCenter.lng + halfWidthDeg },
    { lat: adjustedCenter.lat + halfHeightDeg, lng: adjustedCenter.lng + halfWidthDeg },
    { lat: adjustedCenter.lat + halfHeightDeg, lng: adjustedCenter.lng - halfWidthDeg },
  ]

  return corners.map((corner) => rotatePoint(corner, adjustedCenter, rotationDegrees))
}

export function SolarMap({
  center,
  onMapClick,
  roofSegments,
  solarPanels,
  showPanels = true,
  individualPanelConfigs,
  selectedPanelId,
  onPanelClick,
  isEditingRoof = false,
  roofPolygon,
  onRoofPolygonChange,
  onPanelBoundsCheck,
}: SolarMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<google.maps.Map | null>(null)
  const markersRef = useRef<google.maps.Marker[]>([])
  const polygonsRef = useRef<google.maps.Rectangle[]>([])
  const panelPolygonsRef = useRef<google.maps.Polygon[]>([])
  const roofPolygonRef = useRef<google.maps.Polygon | null>(null)
  const roofMarkersRef = useRef<google.maps.Marker[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [mapReady, setMapReady] = useState(false)
  const prevBoundsStatusRef = useRef<Map<number, boolean>>(new Map())

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
    if (!mapInstanceRef.current || !roofPolygon || !window.google?.maps) return

    if (roofPolygonRef.current) {
      roofPolygonRef.current.setMap(null)
    }
    roofMarkersRef.current.forEach((marker) => marker.setMap(null))
    roofMarkersRef.current = []

    const polygon = new window.google.maps.Polygon({
      paths: roofPolygon,
      map: mapInstanceRef.current,
      strokeColor: "#f97316",
      strokeOpacity: 0.9,
      strokeWeight: 3,
      fillColor: "#f97316",
      fillOpacity: 0.15,
      clickable: false,
      zIndex: 0,
    })
    roofPolygonRef.current = polygon

    if (isEditingRoof) {
      roofPolygon.forEach((point, index) => {
        const marker = new window.google.maps.Marker({
          position: point,
          map: mapInstanceRef.current,
          draggable: true,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: "#fbbf24",
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 2,
          },
          zIndex: 100,
        })

        marker.addListener("drag", () => {
          const newPosition = marker.getPosition()
          if (newPosition && onRoofPolygonChange) {
            const newPolygon = [...roofPolygon]
            newPolygon[index] = { lat: newPosition.lat(), lng: newPosition.lng() }
            onRoofPolygonChange(newPolygon)
          }
        })

        roofMarkersRef.current.push(marker)
      })
    }
  }, [roofPolygon, isEditingRoof, onRoofPolygonChange, mapReady])

  useEffect(() => {
    if (!mapInstanceRef.current || !window.google?.maps) {
      return
    }

    clearPanelPolygons()

    if (!solarPanels || !showPanels || !individualPanelConfigs) {
      return
    }

    const newBoundsStatus = new Map<number, boolean>()

    individualPanelConfigs.forEach((panelConfig, index) => {
      if (!panelConfig.visible || index >= solarPanels.length) return

      const panel = solarPanels[index]

      const baseWidth = panel.orientation === "LANDSCAPE" ? panelConfig.height : panelConfig.width
      const baseHeight = panel.orientation === "LANDSCAPE" ? panelConfig.width : panelConfig.height

      const coords = createRotatedPanelCoords(
        panel.center.latitude,
        panel.center.longitude,
        baseWidth,
        baseHeight,
        panelConfig.rotation,
        panelConfig.offsetX,
        panelConfig.offsetY,
      )

      const isInBounds = !roofPolygon || isPanelInPolygon(coords, roofPolygon)
      newBoundsStatus.set(panelConfig.id, isInBounds)

      const isSelected = selectedPanelId === panelConfig.id

      const polygon = new window.google.maps.Polygon({
        paths: coords,
        map: mapInstanceRef.current,
        strokeColor: isSelected ? "#fbbf24" : isInBounds ? "#3b82f6" : "#ef4444",
        strokeOpacity: 1,
        strokeWeight: isSelected ? 3 : isInBounds ? 1 : 2,
        fillColor: isSelected ? "#fbbf24" : isInBounds ? "#1e3a8a" : "#7f1d1d",
        fillOpacity: isSelected ? 0.8 : isInBounds ? 0.7 : 0.6,
        clickable: true,
        zIndex: isSelected ? 10 : isInBounds ? 1 : 2,
      })

      polygon.addListener("click", (e: google.maps.MapMouseEvent) => {
        e.stop?.()
        onPanelClick?.(panelConfig.id)
      })

      panelPolygonsRef.current.push(polygon)
    })

    if (onPanelBoundsCheck) {
      let hasChanges = false

      for (const [id, isInBounds] of newBoundsStatus.entries()) {
        if (prevBoundsStatusRef.current.get(id) !== isInBounds) {
          hasChanges = true
          break
        }
      }

      if (!hasChanges && prevBoundsStatusRef.current.size !== newBoundsStatus.size) {
        hasChanges = true
      }

      if (hasChanges) {
        prevBoundsStatusRef.current = newBoundsStatus
        newBoundsStatus.forEach((isInBounds, id) => {
          onPanelBoundsCheck(id, isInBounds)
        })
      }
    }
  }, [
    solarPanels,
    showPanels,
    individualPanelConfigs,
    selectedPanelId,
    onPanelClick,
    clearPanelPolygons,
    mapReady,
    roofPolygon,
    onPanelBoundsCheck,
  ])

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
