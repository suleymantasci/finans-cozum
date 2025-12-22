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
  'LoanCalculator': () => import('./LoanCalculator'),
  'CurrencyConverter': () => import('./CurrencyConverter'),
  'DepositCalculator': () => import('./DepositCalculator'),
  'VadeCalculator': () => import('./VadeCalculator'),
  'CreditCardDebtCalculator': () => import('./CreditCardDebtCalculator'),
  'InterestCalculator': () => import('./InterestCalculator'),
  // Mevcut component'ler (backward compatibility)
  'loan-calculator': () => import('./LoanCalculator'),
  'currency-converter': () => import('./CurrencyConverter'),
  // Yeni araçlar buraya eklenir
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

