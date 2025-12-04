"use client"

import { useState, useRef, useEffect } from "react"
import { Search, MapPin, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { google } from "google-maps" // Declared the google variable

interface AddressSearchProps {
  onSelectLocation: (location: { lat: number; lng: number; address: string }) => void
  className?: string
}

interface Prediction {
  place_id: string
  description: string
  structured_formatting: {
    main_text: string
    secondary_text: string
  }
}

export function AddressSearch({ onSelectLocation, className }: AddressSearchProps) {
  const [query, setQuery] = useState("")
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [servicesReady, setServicesReady] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null)
  const placesService = useRef<google.maps.places.PlacesService | null>(null)

  useEffect(() => {
    if (typeof window !== "undefined" && window.google?.maps?.places) {
      autocompleteService.current = new window.google.maps.places.AutocompleteService()
      const mapDiv = document.createElement("div")
      placesService.current = new window.google.maps.places.PlacesService(mapDiv)
      setServicesReady(true)
    }
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const searchPlaces = (input: string) => {
    if (!input || !autocompleteService.current || !window.google?.maps?.places) return

    setIsLoading(true)
    autocompleteService.current.getPlacePredictions(
      {
        input,
        types: ["address"],
      },
      (preds, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && preds) {
          setPredictions(preds as unknown as Prediction[])
          setShowDropdown(true)
        } else {
          setPredictions([])
        }
        setIsLoading(false)
      },
    )
  }

  useEffect(() => {
    if (!servicesReady) return

    const debounce = setTimeout(() => {
      if (query.length > 2) {
        searchPlaces(query)
      } else {
        setPredictions([])
        setShowDropdown(false)
      }
    }, 300)
    return () => clearTimeout(debounce)
  }, [query, servicesReady])

  const selectPlace = (prediction: Prediction) => {
    if (!placesService.current || !window.google?.maps?.places) return

    setIsLoading(true)
    placesService.current.getDetails(
      { placeId: prediction.place_id, fields: ["geometry", "formatted_address"] },
      (place, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && place?.geometry?.location) {
          onSelectLocation({
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
            address: place.formatted_address || prediction.description,
          })
          setQuery(place.formatted_address || prediction.description)
          setShowDropdown(false)
        }
        setIsLoading(false)
      },
    )
  }

  return (
    <div className={cn("relative w-full", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Enter your address..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => predictions.length > 0 && setShowDropdown(true)}
          className="pl-10 pr-10 h-12 text-base bg-card"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {showDropdown && predictions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-card border border-border rounded-lg shadow-lg overflow-hidden"
        >
          {predictions.map((prediction) => (
            <Button
              key={prediction.place_id}
              variant="ghost"
              className="w-full justify-start px-4 py-3 h-auto rounded-none hover:bg-muted"
              onClick={() => selectPlace(prediction)}
            >
              <MapPin className="h-4 w-4 mr-3 text-muted-foreground flex-shrink-0" />
              <div className="text-left">
                <div className="font-medium text-sm">{prediction.structured_formatting.main_text}</div>
                <div className="text-xs text-muted-foreground">{prediction.structured_formatting.secondary_text}</div>
              </div>
            </Button>
          ))}
        </div>
      )}
    </div>
  )
}
