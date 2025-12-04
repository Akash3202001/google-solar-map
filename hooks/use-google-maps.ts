"use client"

import { useEffect, useState } from "react"

export function useGoogleMaps(apiKey: string) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [loadError, setLoadError] = useState<Error | null>(null)

  useEffect(() => {
    // Check if already loaded
    if (window.google?.maps) {
      setIsLoaded(true)
      return
    }

    // Check if script is already being loaded
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]')
    if (existingScript) {
      const handleLoad = () => setIsLoaded(true)
      existingScript.addEventListener("load", handleLoad)
      return () => existingScript.removeEventListener("load", handleLoad)
    }

    // Create callback function
    const callbackName = `initGoogleMaps_${Date.now()}`
    ;(window as any)[callbackName] = () => {
      setIsLoaded(true)
      delete (window as any)[callbackName]
    }

    // Load script
    const script = document.createElement("script")
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=${callbackName}`
    script.async = true
    script.defer = true
    script.onerror = () => {
      setLoadError(new Error("Failed to load Google Maps"))
      delete (window as any)[callbackName]
    }

    document.head.appendChild(script)
  }, [apiKey])

  return { isLoaded, loadError }
}
