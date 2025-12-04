"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { BuildingInsights } from "@/lib/types"
import { formatCurrency, formatNumber } from "@/lib/solar-api"
import { TrendingUp, Wallet, CreditCard, PiggyBank } from "lucide-react"

interface FinancialSummaryProps {
  buildingInsights: BuildingInsights
  selectedPanelCount: number
}

export function FinancialSummary({ buildingInsights, selectedPanelCount }: FinancialSummaryProps) {
  const { solarPotential } = buildingInsights

  // Find the financial analysis for the closest panel configuration
  const configIndex = solarPotential.solarPanelConfigs.findIndex((c) => c.panelsCount >= selectedPanelCount)
  const analysis = solarPotential.financialAnalyses?.[configIndex]

  // Estimate values if no financial analysis is available
  const config = solarPotential.solarPanelConfigs[configIndex]
  const yearlyEnergy = config?.yearlyEnergyDcKwh || 0
  const estimatedYearlySavings = yearlyEnergy * 0.12
  const estimatedSystemCost = selectedPanelCount * 300 // ~$300 per panel avg installed
  const estimatedPayback = estimatedSystemCost / estimatedYearlySavings
  const federalCredit = estimatedSystemCost * 0.3 // 30% federal tax credit
  const netCost = estimatedSystemCost - federalCredit

  return (
    <Card className="bg-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          Financial Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="cash" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="cash" className="text-xs">
              <Wallet className="h-3 w-3 mr-1" />
              Cash
            </TabsTrigger>
            <TabsTrigger value="finance" className="text-xs">
              <CreditCard className="h-3 w-3 mr-1" />
              Finance
            </TabsTrigger>
            <TabsTrigger value="lease" className="text-xs">
              <PiggyBank className="h-3 w-3 mr-1" />
              Lease
            </TabsTrigger>
          </TabsList>

          <TabsContent value="cash" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-muted/50">
                <div className="text-xs text-muted-foreground">System Cost</div>
                <div className="text-lg font-semibold">{formatCurrency(estimatedSystemCost)}</div>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <div className="text-xs text-muted-foreground">Federal Tax Credit</div>
                <div className="text-lg font-semibold text-green-500">-{formatCurrency(federalCredit)}</div>
              </div>
              <div className="p-3 rounded-lg bg-primary/10">
                <div className="text-xs text-muted-foreground">Net Cost</div>
                <div className="text-lg font-semibold text-primary">{formatCurrency(netCost)}</div>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <div className="text-xs text-muted-foreground">Payback Period</div>
                <div className="text-lg font-semibold">{formatNumber(estimatedPayback, 1)} years</div>
              </div>
            </div>
            <div className="pt-3 border-t border-border">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">20-Year Savings</span>
                <span className="text-xl font-bold text-green-500">
                  {formatCurrency(estimatedYearlySavings * 20 - netCost)}
                </span>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="finance" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-muted/50">
                <div className="text-xs text-muted-foreground">Monthly Payment</div>
                <div className="text-lg font-semibold">{formatCurrency(netCost / 240)}</div>
                <div className="text-xs text-muted-foreground">20-year @ 5% APR</div>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <div className="text-xs text-muted-foreground">Monthly Savings</div>
                <div className="text-lg font-semibold text-green-500">
                  {formatCurrency(estimatedYearlySavings / 12)}
                </div>
              </div>
            </div>
            <div className="p-3 rounded-lg bg-primary/10">
              <div className="text-xs text-muted-foreground">Net Monthly Benefit</div>
              <div className="text-lg font-semibold text-primary">
                {formatCurrency(estimatedYearlySavings / 12 - netCost / 240)}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="lease" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-muted/50">
                <div className="text-xs text-muted-foreground">Monthly Lease</div>
                <div className="text-lg font-semibold">{formatCurrency((estimatedYearlySavings * 0.6) / 12)}</div>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <div className="text-xs text-muted-foreground">Monthly Savings</div>
                <div className="text-lg font-semibold text-green-500">
                  {formatCurrency((estimatedYearlySavings * 0.4) / 12)}
                </div>
              </div>
            </div>
            <div className="p-4 rounded-lg bg-muted/50 text-sm text-muted-foreground">
              With a solar lease, you pay a fixed monthly fee and the solar company owns and maintains the system.
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
