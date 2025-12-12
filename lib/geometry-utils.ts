// Geometry utility functions for polygon operations

export interface Point {
  lat: number
  lng: number
}

export interface Polygon {
  points: Point[]
}

/**
 * Check if a point is inside a polygon using ray casting algorithm
 */
export function isPointInPolygon(point: Point, polygon: Point[]): boolean {
  let inside = false
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].lng
    const yi = polygon[i].lat
    const xj = polygon[j].lng
    const yj = polygon[j].lat

    const intersect = yi > point.lat !== yj > point.lat && point.lng < ((xj - xi) * (point.lat - yi)) / (yj - yi) + xi

    if (intersect) inside = !inside
  }
  return inside
}

/**
 * Check if a panel (defined by its corners) is fully inside a polygon
 */
export function isPanelInPolygon(panelCorners: Point[], roofPolygon: Point[]): boolean {
  // Check if all 4 corners of the panel are inside the roof polygon
  return panelCorners.every((corner) => isPointInPolygon(corner, roofPolygon))
}

/**
 * Get the centroid of a polygon
 */
export function getPolygonCentroid(points: Point[]): Point {
  let lat = 0
  let lng = 0
  points.forEach((p) => {
    lat += p.lat
    lng += p.lng
  })
  return {
    lat: lat / points.length,
    lng: lng / points.length,
  }
}

/**
 * Calculate the bounds of a polygon
 */
export function getPolygonBounds(points: Point[]): {
  north: number
  south: number
  east: number
  west: number
  center: Point
} {
  const lats = points.map((p) => p.lat)
  const lngs = points.map((p) => p.lng)

  const north = Math.max(...lats)
  const south = Math.min(...lats)
  const east = Math.max(...lngs)
  const west = Math.min(...lngs)

  return {
    north,
    south,
    east,
    west,
    center: {
      lat: (north + south) / 2,
      lng: (east + west) / 2,
    },
  }
}

/**
 * Move all points in a polygon by an offset
 */
export function offsetPolygon(points: Point[], offsetLat: number, offsetLng: number): Point[] {
  return points.map((p) => ({
    lat: p.lat + offsetLat,
    lng: p.lng + offsetLng,
  }))
}

/**
 * Scale a polygon from its center
 */
export function scalePolygon(points: Point[], scale: number): Point[] {
  const center = getPolygonCentroid(points)
  return points.map((p) => ({
    lat: center.lat + (p.lat - center.lat) * scale,
    lng: center.lng + (p.lng - center.lng) * scale,
  }))
}
