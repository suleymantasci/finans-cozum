'use client'

import dynamic from 'next/dynamic';
import { ComponentType } from 'react';

// Tool component props interface
export interface ToolComponentProps {
  config?: any;
  toolId?: string;
  data?: any;
  dataSourceType?: 'STATIC' | 'DATABASE' | 'EXTERNAL_API';
}

// Component registry - Yeni araçlar buraya eklenir
const toolComponents: Record<string, () => Promise<{ default: ComponentType<ToolComponentProps> }>> = {
  // Faiz Hesaplamaları
  'SimpleInterestCalculator': () => import('./SimpleInterestCalculator'),
  'basit-faiz': () => import('./SimpleInterestCalculator'),
  'CompoundInterestCalculator': () => import('./CompoundInterestCalculator'),
  'bilesik-faiz': () => import('./CompoundInterestCalculator'),
  'InterestRateConverter': () => import('./InterestRateConverter'),
  'faiz-orani-donusturme': () => import('./InterestRateConverter'),
  'TotalInterestCostCalculator': () => import('./TotalInterestCostCalculator'),
  'toplam-faiz-maliyeti': () => import('./TotalInterestCostCalculator'),

  // Yatırım Hesaplamaları
  'AnnualReturnCalculator': () => import('./AnnualReturnCalculator'),
  'yillik-getiri': () => import('./AnnualReturnCalculator'),
  'NPVCalculator': () => import('./NPVCalculator'),
  'npv': () => import('./NPVCalculator'),
  'IRRCalculator': () => import('./IRRCalculator'),
  'irr': () => import('./IRRCalculator'),
  'ROICalculator': () => import('./ROICalculator'),
  'roi': () => import('./ROICalculator'),
  'InvestmentProfitabilityCalculator': () => import('./InvestmentProfitabilityCalculator'),
  'yatirim-karlilik': () => import('./InvestmentProfitabilityCalculator'),
  'InflationCalculator': () => import('./InflationCalculator'),
  'enflasyon-etkisi': () => import('./InflationCalculator'),
  'GrowthRateCalculator': () => import('./GrowthRateCalculator'),
  'yatirim-buyume-orani': () => import('./GrowthRateCalculator'),
  'AverageReturnCalculator': () => import('./AverageReturnCalculator'),
  'ortalama-getiri': () => import('./AverageReturnCalculator'),

  // Kredi Hesaplamaları
  'MonthlyPaymentCalculator': () => import('./MonthlyPaymentCalculator'),
  'aylik-taksit': () => import('./MonthlyPaymentCalculator'),
  'AmortizationTableCalculator': () => import('./AmortizationTableCalculator'),
  'amortisman-tablosu': () => import('./AmortizationTableCalculator'),
  'PaymentScheduleCalculator': () => import('./PaymentScheduleCalculator'),
  'odeme-plani-ciktisi': () => import('./PaymentScheduleCalculator'),

  // İşletme Hesaplamaları
  'BreakEvenCalculator': () => import('./BreakEvenCalculator'),
  'break-even': () => import('./BreakEvenCalculator'),
  'MarginCalculator': () => import('./MarginCalculator'),
  'marj-kar-orani': () => import('./MarginCalculator'),
  'ProfitLossCalculator': () => import('./ProfitLossCalculator'),
  'kar-zarar': () => import('./ProfitLossCalculator'),
  'PerformanceCoefficientCalculator': () => import('./PerformanceCoefficientCalculator'),
  'verimlilik-katsayisi': () => import('./PerformanceCoefficientCalculator'),
  'WorkingCapitalCalculator': () => import('./WorkingCapitalCalculator'),
  'calisma-sermayesi': () => import('./WorkingCapitalCalculator'),
  'CapitalRequirementCalculator': () => import('./CapitalRequirementCalculator'),
  'sermaye-ihtiyaci': () => import('./CapitalRequirementCalculator'),
  'CashFlowAnalyzerCalculator': () => import('./CashFlowAnalyzerCalculator'),
  'nakit-akisi-analizi': () => import('./CashFlowAnalyzerCalculator'),

  // Bütçe Hesaplamaları
  'BudgetPlannerCalculator': () => import('./BudgetPlannerCalculator'),
  'basit-butce': () => import('./BudgetPlannerCalculator'),
  'IncomeExpenseBalanceCalculator': () => import('./IncomeExpenseBalanceCalculator'),
  'gelir-gider-dengesi': () => import('./IncomeExpenseBalanceCalculator'),
  'AnnualSavingsGoalCalculator': () => import('./AnnualSavingsGoalCalculator'),
  'yillik-tasarruf-hedefi': () => import('./AnnualSavingsGoalCalculator'),
};

// Dynamic component loader
export function getToolComponent(componentName: string): ComponentType<ToolComponentProps> | null {
  const loader = toolComponents[componentName];
  if (!loader) {
    console.warn(`Tool component "${componentName}" not found in registry`);
    return null;
  }

  return dynamic(loader, {
    loading: () => (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
          <p className="text-sm text-muted-foreground">Araç yükleniyor...</p>
        </div>
      </div>
    ),
    ssr: false,
  });
}

// Registry'deki tüm component isimlerini getir
export function getAvailableComponents(): string[] {
  return Object.keys(toolComponents);
}
