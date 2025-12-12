"use client"
import { Edit3, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

interface RoofPolygonEditorProps {
  isEditing: boolean
  onEditToggle: (editing: boolean) => void
  hasOutOfBoundsPanels: boolean
  onAutoFitPanels: () => void
}

export function RoofPolygonEditor({
  isEditing,
  onEditToggle,
  hasOutOfBoundsPanels,
  onAutoFitPanels,
}: RoofPolygonEditorProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Edit3 className="h-4 w-4" />
          Roof Boundary Editor
        </CardTitle>
        <CardDescription>Adjust roof boundaries to match satellite imagery</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="edit-mode" className="text-sm">
            Edit Mode
          </Label>
          <Switch id="edit-mode" checked={isEditing} onCheckedChange={onEditToggle} />
        </div>

        {isEditing && (
          <Alert>
            <Edit3 className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>Click and drag</strong> the yellow corner points on the map to adjust roof boundaries.
            </AlertDescription>
          </Alert>
        )}

        {hasOutOfBoundsPanels && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>Warning:</strong> Some panels are outside roof boundaries.
              <Button variant="outline" size="sm" className="mt-2 w-full bg-transparent" onClick={onAutoFitPanels}>
                Auto-Fit Panels to Roof
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Yellow markers: Drag to adjust corners</p>
          <p>• Orange outline: Current roof boundary</p>
          <p>• Blue panels: Inside roof area</p>
          <p>• Red panels: Outside roof area</p>
        </div>
      </CardContent>
    </Card>
  )
}
