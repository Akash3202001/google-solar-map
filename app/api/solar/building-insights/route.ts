import { type NextRequest, NextResponse } from "next/server"

const SOLAR_API_BASE = "https://solar.googleapis.com/v1"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const lat = searchParams.get("lat")
  const lng = searchParams.get("lng")
  const apiKey = searchParams.get("apiKey")

  if (!lat || !lng || !apiKey) {
    return NextResponse.json({ error: "Missing required parameters: lat, lng, apiKey" }, { status: 400 })
  }

  try {
    const params = new URLSearchParams({
      "location.latitude": Number.parseFloat(lat).toFixed(5),
      "location.longitude": Number.parseFloat(lng).toFixed(5),
      requiredQuality: "HIGH",
      key: apiKey,
    })

    const response = await fetch(`${SOLAR_API_BASE}/buildingInsights:findClosest?${params}`, {
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json(
        { error: error.error?.message || "Failed to fetch building insights" },
        { status: response.status },
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Solar API Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
