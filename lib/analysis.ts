// lib/analysis.ts
/**
 * Расчёт внутренней стоимости проекта
 * @param ath - All-Time High цена
 * @param moatFactor - Фактор "рва" (между 0 и 1)
 * @returns Внутренняя стоимость
 */
export function calculateIntrinsicValue(ath: number, moatFactor: number): number {
    return ath * moatFactor;
  }
  
  /**
   * Расчёт рекомендуемой цены покупки с маржой безопасности
   * @param intrinsicValue - Внутренняя стоимость
   * @param marginOfSafety - Маржа безопасности (например, 0.5 для 50%)
   * @returns Рекомендуемая цена покупки
   */
  export function calculateRecommendedBuyPrice(
    intrinsicValue: number,
    marginOfSafety: number
  ): number {
    return intrinsicValue * (1 - marginOfSafety);
  }
  
  /**
   * Расчёт фактора "рва" на основе рыночной капитализации и ликвидности
   * @param marketCap - Рыночная капитализация
   * @param liquidity - Ликвидность
   * @returns Фактор "рва"
   */
  export function calculateMoatFactor(marketCap: number, liquidity: number): number {
    if (marketCap > 0) {
      const liquidityRatio = liquidity / marketCap;
      return Math.min(Math.max(liquidityRatio, 0.1), 0.3);
    }
    return 0.2;
  }
  
  /**
   * Расчёт маржи безопасности
   * @param intrinsicValue - Внутренняя стоимость
   * @param currentPrice - Текущая цена
   * @returns Маржа безопасности в процентах или null, если расчёт невозможен
   */
  export function calculateMarginOfSafety(
    intrinsicValue: number,
    currentPrice: number
  ): number | null {
    if (intrinsicValue <= 0 || !Number.isFinite(currentPrice)) {
      return null;
    }
    return ((Math.abs(intrinsicValue) - currentPrice) / Math.abs(intrinsicValue)) * 100;
  }