"use client"

import { useEffect, useRef, useCallback, useState } from "react"
import { Loader2 } from "lucide-react"
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
}

export function SolarMap({
  center,
  onMapClick,
  roofSegments,
  solarPanels,
  showPanels = true,
  panelCount = 0,
}: SolarMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<google.maps.Map | null>(null)
  const markersRef = useRef<google.maps.Marker[]>([])
  const polygonsRef = useRef<google.maps.Rectangle[]>([])
  const panelRectanglesRef = useRef<google.maps.Rectangle[]>([])
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

  const clearPanelRectangles = useCallback(() => {
    panelRectanglesRef.current.forEach((rect) => rect.setMap(null))
    panelRectanglesRef.current = []
  }, [])

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || !window.google?.maps || mapInstanceRef.current) return

    const defaultCenter = center || { lat: 37.4419, lng: -122.143 }

    mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
      center: defaultCenter,
      zoom: center ? 20 : 4,
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
    mapInstanceRef.current.setZoom(20)

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

  // Draw solar panels
  useEffect(() => {
    if (!mapInstanceRef.current || !window.google?.maps) {
      return
    }

    clearPanelRectangles()

    if (!solarPanels || !showPanels) {
      return
    }

    const panelsToShow = solarPanels.slice(0, panelCount)
    const panelWidth = 0.00001
    const panelHeight = 0.000018

    panelsToShow.forEach((panel) => {
      const width = panel.orientation === "LANDSCAPE" ? panelHeight : panelWidth
      const height = panel.orientation === "LANDSCAPE" ? panelWidth : panelHeight

      const bounds = new window.google.maps.LatLngBounds(
        {
          lat: panel.center.latitude - height / 2,
          lng: panel.center.longitude - width / 2,
        },
        {
          lat: panel.center.latitude + height / 2,
          lng: panel.center.longitude + width / 2,
        },
      )

      const rect = new window.google.maps.Rectangle({
        bounds,
        map: mapInstanceRef.current,
        strokeColor: "#3b82f6",
        strokeOpacity: 0.9,
        strokeWeight: 1,
        fillColor: "#1e3a8a",
        fillOpacity: 0.7,
      })

      panelRectanglesRef.current.push(rect)
    })
  }, [solarPanels, showPanels, panelCount, clearPanelRectangles, mapReady])

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
