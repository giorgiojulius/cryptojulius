export function filterContracts(contracts: string[]): string[] {
    return contracts.filter(contract => contract.startsWith('0x')); // Фильтр для Ethereum контрактов
  }