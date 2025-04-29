export function calculateMoat(mcap: number, liquidity: number): number {
    if (mcap === 0) return 0; // Избегаем деления на ноль
    return liquidity / mcap;
  }