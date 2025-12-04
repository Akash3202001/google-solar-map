"use client"

import { useState, useEffect } from "react"
import Script from "next/script"
import { ApiKeyForm } from "@/components/api-key-form"
import { SolarCalculator } from "@/components/solar-calculator"

export default function HomePage() {
  const [apiKey, setApiKey] = useState<string | null>(null)
  const [mapsLoaded, setMapsLoaded] = useState(false)

  // Check for stored API key
  useEffect(() => {
    const stored = localStorage.getItem("google-maps-api-key")
    if (stored) {
      setApiKey(stored)
    }
  }, [])

  const handleApiKeySubmit = (key: string) => {
    localStorage.setItem("google-maps-api-key", key)
    setApiKey(key)
  }

  if (!apiKey) {
    return <ApiKeyForm onSubmit={handleApiKeySubmit} />
  }

  return (
    <>
      <Script
        src={`https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`}
        onLoad={() => setMapsLoaded(true)}
        strategy="afterInteractive"
      />
      {mapsLoaded ? (
        <SolarCalculator apiKey={apiKey} />
      ) : (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto mb-4" />
            <p className="text-muted-foreground">Loading Google Maps...</p>
          </div>
        </div>
      )}
    </>
  )
}
