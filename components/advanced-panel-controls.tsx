"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import type { PanelConfig } from "@/lib/types"
import { DEFAULT_PANEL_CONFIG } from "@/lib/types"
import {
  RotateCcw,
  Maximize2,
  Move,
  RotateCw,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
} from "lucide-react"

interface AdvancedPanelControlsProps {
  config: PanelConfig
  onConfigChange: (config: PanelConfig) => void
}

export function AdvancedPanelControls({ config, onConfigChange }: AdvancedPanelControlsProps) {
  const updateConfig = (updates: Partial<PanelConfig>) => {
    onConfigChange({ ...config, ...updates })
  }

  const handleReset = () => {
    onConfigChange(DEFAULT_PANEL_CONFIG)
  }

  const incrementValue = (key: keyof PanelConfig, amount: number, min: number, max: number) => {
    const newValue = Math.min(max, Math.max(min, config[key] + amount))
    updateConfig({ [key]: newValue })
  }

  return (
    <Card className="bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Maximize2 className="h-4 w-4" />
            Advanced Panel Controls
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={handleReset}>
            <RotateCcw className="h-3 w-3 mr-1" />
            Reset
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Panel Size Controls */}
        <div className="space-y-4">
          <Label className="text-sm font-medium">Panel Dimensions</Label>

          {/* Width Control */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Width</span>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7 bg-transparent"
                  onClick={() => incrementValue("width", -0.05, 0.5, 2.5)}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <Input
                  type="number"
                  value={config.width.toFixed(2)}
                  onChange={(e) =>
                    updateConfig({ width: Math.min(2.5, Math.max(0.5, Number.parseFloat(e.target.value) || 0.5)) })
                  }
                  className="w-20 h-7 text-center text-sm"
                  step={0.05}
                  min={0.5}
                  max={2.5}
                />
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7 bg-transparent"
                  onClick={() => incrementValue("width", 0.05, 0.5, 2.5)}
                >
                  <Plus className="h-3 w-3" />
                </Button>
                <span className="text-xs text-muted-foreground ml-1">m</span>
              </div>
            </div>
            <Slider
              value={[config.width]}
              onValueChange={([v]) => updateConfig({ width: v })}
              min={0.5}
              max={2.5}
              step={0.05}
            />
          </div>

          {/* Height Control */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Height</span>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7 bg-transparent"
                  onClick={() => incrementValue("height", -0.05, 0.5, 3.0)}
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <Input
                  type="number"
                  value={config.height.toFixed(2)}
                  onChange={(e) =>
                    updateConfig({ height: Math.min(3.0, Math.max(0.5, Number.parseFloat(e.target.value) || 0.5)) })
                  }
                  className="w-20 h-7 text-center text-sm"
                  step={0.05}
                  min={0.5}
                  max={3.0}
                />
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7 bg-transparent"
                  onClick={() => incrementValue("height", 0.05, 0.5, 3.0)}
                >
                  <Plus className="h-3 w-3" />
                </Button>
                <span className="text-xs text-muted-foreground ml-1">m</span>
              </div>
            </div>
            <Slider
              value={[config.height]}
              onValueChange={([v]) => updateConfig({ height: v })}
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
                className="h-7 w-7 bg-transparent"
                onClick={() => incrementValue("rotation", -5, 0, 360)}
              >
                <Minus className="h-3 w-3" />
              </Button>
              <Input
                type="number"
                value={config.rotation.toFixed(0)}
                onChange={(e) =>
                  updateConfig({ rotation: Math.min(360, Math.max(0, Number.parseInt(e.target.value) || 0)) })
                }
                className="w-16 h-7 text-center text-sm"
                step={1}
                min={0}
                max={360}
              />
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7 bg-transparent"
                onClick={() => incrementValue("rotation", 5, 0, 360)}
              >
                <Plus className="h-3 w-3" />
              </Button>
              <span className="text-xs text-muted-foreground ml-1">°</span>
            </div>
          </div>
          <Slider
            value={[config.rotation]}
            onValueChange={([v]) => updateConfig({ rotation: v })}
            min={0}
            max={360}
            step={1}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0° (North)</span>
            <span>90° (East)</span>
            <span>180° (South)</span>
            <span>270° (West)</span>
          </div>
        </div>

        {/* Tilt Control */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Panel Tilt Angle</Label>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7 bg-transparent"
                onClick={() => incrementValue("tilt", -5, 0, 90)}
              >
                <Minus className="h-3 w-3" />
              </Button>
              <Input
                type="number"
                value={config.tilt.toFixed(0)}
                onChange={(e) =>
                  updateConfig({ tilt: Math.min(90, Math.max(0, Number.parseInt(e.target.value) || 0)) })
                }
                className="w-16 h-7 text-center text-sm"
                step={1}
                min={0}
                max={90}
              />
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7 bg-transparent"
                onClick={() => incrementValue("tilt", 5, 0, 90)}
              >
                <Plus className="h-3 w-3" />
              </Button>
              <span className="text-xs text-muted-foreground ml-1">°</span>
            </div>
          </div>
          <Slider value={[config.tilt]} onValueChange={([v]) => updateConfig({ tilt: v })} min={0} max={90} step={1} />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0° (Flat)</span>
            <span>30° (Optimal)</span>
            <span>90° (Vertical)</span>
          </div>
        </div>

        {/* Position Offset Control */}
        <div className="space-y-3">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Move className="h-4 w-4" />
            Position Offset
          </Label>

          {/* Position Control Grid */}
          <div className="flex items-center justify-center">
            <div className="grid grid-cols-3 gap-1">
              <div />
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 bg-transparent"
                onClick={() => incrementValue("offsetY", 0.5, -20, 20)}
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
              <div />
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 bg-transparent"
                onClick={() => incrementValue("offsetX", -0.5, -20, 20)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 bg-transparent"
                onClick={() => {
                  updateConfig({ offsetX: 0, offsetY: 0 })
                }}
              >
                <Move className="h-3 w-3" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 bg-transparent"
                onClick={() => incrementValue("offsetX", 0.5, -20, 20)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <div />
              <Button
                variant="outline"
                size="icon"
                className="h-9 w-9 bg-transparent"
                onClick={() => incrementValue("offsetY", -0.5, -20, 20)}
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
              <div />
            </div>
          </div>

          {/* X/Y Offset Inputs */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">X Offset</span>
              <div className="flex items-center gap-1">
                <Input
                  type="number"
                  value={config.offsetX.toFixed(1)}
                  onChange={(e) =>
                    updateConfig({ offsetX: Math.min(20, Math.max(-20, Number.parseFloat(e.target.value) || 0)) })
                  }
                  className="h-8 text-sm"
                  step={0.5}
                />
                <span className="text-xs text-muted-foreground">m</span>
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground">Y Offset</span>
              <div className="flex items-center gap-1">
                <Input
                  type="number"
                  value={config.offsetY.toFixed(1)}
                  onChange={(e) =>
                    updateConfig({ offsetY: Math.min(20, Math.max(-20, Number.parseFloat(e.target.value) || 0)) })
                  }
                  className="h-8 text-sm"
                  step={0.5}
                />
                <span className="text-xs text-muted-foreground">m</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="pt-3 border-t border-border">
          <Label className="text-sm font-medium mb-2 block">Quick Presets</Label>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={() => updateConfig({ rotation: 0 })}>
              North
            </Button>
            <Button variant="outline" size="sm" onClick={() => updateConfig({ rotation: 180 })}>
              South
            </Button>
            <Button variant="outline" size="sm" onClick={() => updateConfig({ rotation: 90 })}>
              East
            </Button>
            <Button variant="outline" size="sm" onClick={() => updateConfig({ rotation: 270 })}>
              West
            </Button>
            <Button variant="outline" size="sm" onClick={() => updateConfig({ tilt: 30 })}>
              Optimal Tilt
            </Button>
          </div>
        </div>

        {/* Info */}
        <div className="p-3 rounded-lg bg-muted/50 text-xs text-muted-foreground">
          <p>Adjust panel dimensions, rotation and position to match your roof layout. Changes apply to all panels.</p>
        </div>
      </CardContent>
    </Card>
  )
}
