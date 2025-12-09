"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import type { IndividualPanelConfig } from "@/lib/types"
import {
  RotateCcw,
  Maximize2,
  RotateCw,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Copy,
  PlusCircle,
  Grid3X3,
  MousePointer,
} from "lucide-react"

interface IndividualPanelEditorProps {
  panels: IndividualPanelConfig[]
  selectedPanelId: number | null
  onPanelSelect: (id: number | null) => void
  onPanelUpdate: (id: number, updates: Partial<IndividualPanelConfig>) => void
  onPanelDelete: (id: number) => void
  onPanelAdd: () => void
  onPanelDuplicate: (id: number) => void
  onApplyToAll: (config: Partial<IndividualPanelConfig>) => void
  onResetAll: () => void
  maxPanels: number
}

export function IndividualPanelEditor({
  panels,
  selectedPanelId,
  onPanelSelect,
  onPanelUpdate,
  onPanelDelete,
  onPanelAdd,
  onPanelDuplicate,
  onApplyToAll,
  onResetAll,
  maxPanels,
}: IndividualPanelEditorProps) {
  const [editMode, setEditMode] = useState<"individual" | "bulk">("individual")

  const selectedPanel = panels.find((p) => p.id === selectedPanelId)
  const visiblePanelsCount = panels.filter((p) => p.visible).length

  const updateSelectedPanel = (updates: Partial<IndividualPanelConfig>) => {
    if (selectedPanelId !== null) {
      onPanelUpdate(selectedPanelId, updates)
    }
  }

  const incrementValue = (key: keyof IndividualPanelConfig, amount: number, min: number, max: number) => {
    if (!selectedPanel) return
    const currentValue = selectedPanel[key] as number
    const newValue = Math.min(max, Math.max(min, currentValue + amount))
    updateSelectedPanel({ [key]: newValue })
  }

  return (
    <Card className="bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Grid3X3 className="h-4 w-4" />
            Individual Panel Editor
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {visiblePanelsCount} / {panels.length} visible
            </Badge>
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="flex gap-2 mt-2">
          <Button
            variant={editMode === "individual" ? "default" : "outline"}
            size="sm"
            onClick={() => setEditMode("individual")}
            className="flex-1"
          >
            <MousePointer className="h-3 w-3 mr-1" />
            Individual
          </Button>
          <Button
            variant={editMode === "bulk" ? "default" : "outline"}
            size="sm"
            onClick={() => setEditMode("bulk")}
            className="flex-1"
          >
            <Grid3X3 className="h-3 w-3 mr-1" />
            Bulk Actions
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {editMode === "bulk" ? (
          /* Bulk Actions Mode */
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onPanelAdd}
                disabled={panels.length >= maxPanels}
                className="bg-transparent"
              >
                <PlusCircle className="h-3 w-3 mr-1" />
                Add Panel
              </Button>
              <Button variant="outline" size="sm" onClick={onResetAll} className="bg-transparent">
                <RotateCcw className="h-3 w-3 mr-1" />
                Reset All
              </Button>
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Apply to All Panels</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onApplyToAll({ rotation: 0 })}
                  className="bg-transparent text-xs"
                >
                  Rotation: 0°
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onApplyToAll({ rotation: 180 })}
                  className="bg-transparent text-xs"
                >
                  Rotation: 180°
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onApplyToAll({ width: 1.0, height: 1.7 })}
                  className="bg-transparent text-xs"
                >
                  Standard Size
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onApplyToAll({ visible: true })}
                  className="bg-transparent text-xs"
                >
                  Show All
                </Button>
              </div>
            </div>

            {/* Panel List */}
            <div className="space-y-2">
              <Label className="text-sm">All Panels</Label>
              <ScrollArea className="h-[200px] rounded-md border border-border p-2">
                <div className="space-y-1">
                  {panels.map((panel) => (
                    <div
                      key={panel.id}
                      className={`flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors ${
                        selectedPanelId === panel.id ? "bg-primary/20 border border-primary" : "hover:bg-muted/50"
                      } ${!panel.visible ? "opacity-50" : ""}`}
                      onClick={() => onPanelSelect(panel.id)}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium">Panel {panel.id + 1}</span>
                        {!panel.visible && <EyeOff className="h-3 w-3 text-muted-foreground" />}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={(e) => {
                            e.stopPropagation()
                            onPanelUpdate(panel.id, { visible: !panel.visible })
                          }}
                        >
                          {panel.visible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-destructive hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation()
                            onPanelDelete(panel.id)
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        ) : (
          /* Individual Panel Edit Mode */
          <>
            {/* Panel Selector */}
            <div className="space-y-2">
              <Label className="text-sm">Select Panel (click on map or list)</Label>
              <ScrollArea className="h-[120px] rounded-md border border-border p-2">
                <div className="grid grid-cols-5 gap-1">
                  {panels.map((panel) => (
                    <Button
                      key={panel.id}
                      variant={selectedPanelId === panel.id ? "default" : "outline"}
                      size="sm"
                      className={`h-8 w-full text-xs ${!panel.visible ? "opacity-50" : ""}`}
                      onClick={() => onPanelSelect(panel.id)}
                    >
                      {panel.id + 1}
                    </Button>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {selectedPanel ? (
              <>
                {/* Panel Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPanelUpdate(selectedPanel.id, { visible: !selectedPanel.visible })}
                    className="flex-1 bg-transparent"
                  >
                    {selectedPanel.visible ? (
                      <>
                        <EyeOff className="h-3 w-3 mr-1" />
                        Hide
                      </>
                    ) : (
                      <>
                        <Eye className="h-3 w-3 mr-1" />
                        Show
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPanelDuplicate(selectedPanel.id)}
                    disabled={panels.length >= maxPanels}
                    className="flex-1 bg-transparent"
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Duplicate
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPanelDelete(selectedPanel.id)}
                    className="text-destructive hover:text-destructive bg-transparent"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>

                {/* Size Controls */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Maximize2 className="h-4 w-4" />
                    Panel Size
                  </Label>

                  {/* Width */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Width</span>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6 bg-transparent"
                          onClick={() => incrementValue("width", -0.05, 0.5, 2.5)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <Input
                          type="number"
                          value={selectedPanel.width.toFixed(2)}
                          onChange={(e) =>
                            updateSelectedPanel({
                              width: Math.min(2.5, Math.max(0.5, Number.parseFloat(e.target.value) || 0.5)),
                            })
                          }
                          className="w-16 h-6 text-center text-xs"
                          step={0.05}
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6 bg-transparent"
                          onClick={() => incrementValue("width", 0.05, 0.5, 2.5)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <span className="text-xs text-muted-foreground">m</span>
                      </div>
                    </div>
                    <Slider
                      value={[selectedPanel.width]}
                      onValueChange={([v]) => updateSelectedPanel({ width: v })}
                      min={0.5}
                      max={2.5}
                      step={0.05}
                    />
                  </div>

                  {/* Height */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Height</span>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6 bg-transparent"
                          onClick={() => incrementValue("height", -0.05, 0.5, 3.0)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <Input
                          type="number"
                          value={selectedPanel.height.toFixed(2)}
                          onChange={(e) =>
                            updateSelectedPanel({
                              height: Math.min(3.0, Math.max(0.5, Number.parseFloat(e.target.value) || 0.5)),
                            })
                          }
                          className="w-16 h-6 text-center text-xs"
                          step={0.05}
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-6 w-6 bg-transparent"
                          onClick={() => incrementValue("height", 0.05, 0.5, 3.0)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <span className="text-xs text-muted-foreground">m</span>
                      </div>
                    </div>
                    <Slider
                      value={[selectedPanel.height]}
                      onValueChange={([v]) => updateSelectedPanel({ height: v })}
                      min={0.5}
                      max={3.0}
                      step={0.05}
                    />
                  </div>
                </div>

                {/* Rotation Control */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      <RotateCw className="h-4 w-4" />
                      Rotation
                    </Label>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-6 w-6 bg-transparent"
                        onClick={() => incrementValue("rotation", -5, 0, 360)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <Input
                        type="number"
                        value={selectedPanel.rotation.toFixed(0)}
                        onChange={(e) =>
                          updateSelectedPanel({
                            rotation: Math.min(360, Math.max(0, Number.parseInt(e.target.value) || 0)),
                          })
                        }
                        className="w-14 h-6 text-center text-xs"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-6 w-6 bg-transparent"
                        onClick={() => incrementValue("rotation", 5, 0, 360)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <span className="text-xs text-muted-foreground">°</span>
                    </div>
                  </div>
                  <Slider
                    value={[selectedPanel.rotation]}
                    onValueChange={([v]) => updateSelectedPanel({ rotation: v })}
                    min={0}
                    max={360}
                    step={1}
                  />
                </div>

                {/* Position Control */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Position Offset</Label>
                  <div className="flex items-center justify-center">
                    <div className="grid grid-cols-3 gap-1">
                      <div />
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 bg-transparent"
                        onClick={() => incrementValue("offsetY", 0.25, -20, 20)}
                      >
                        <ChevronUp className="h-4 w-4" />
                      </Button>
                      <div />
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 bg-transparent"
                        onClick={() => incrementValue("offsetX", -0.25, -20, 20)}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 bg-transparent"
                        onClick={() => updateSelectedPanel({ offsetX: 0, offsetY: 0 })}
                      >
                        <RotateCcw className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 bg-transparent"
                        onClick={() => incrementValue("offsetX", 0.25, -20, 20)}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                      <div />
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 bg-transparent"
                        onClick={() => incrementValue("offsetY", -0.25, -20, 20)}
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                      <div />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground">X Offset</span>
                      <Input
                        type="number"
                        value={selectedPanel.offsetX.toFixed(2)}
                        onChange={(e) =>
                          updateSelectedPanel({
                            offsetX: Math.min(20, Math.max(-20, Number.parseFloat(e.target.value) || 0)),
                          })
                        }
                        className="h-7 text-xs"
                        step={0.25}
                      />
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground">Y Offset</span>
                      <Input
                        type="number"
                        value={selectedPanel.offsetY.toFixed(2)}
                        onChange={(e) =>
                          updateSelectedPanel({
                            offsetY: Math.min(20, Math.max(-20, Number.parseFloat(e.target.value) || 0)),
                          })
                        }
                        className="h-7 text-xs"
                        step={0.25}
                      />
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-6 text-center text-muted-foreground text-sm">
                <MousePointer className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Select a panel from the list above or click on a panel on the map to edit it</p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
