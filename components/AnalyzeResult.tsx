export function AnalyzeResult({
    result,
  }: {
    result: { contract: string; mcap: number; liquidity: number; moat: number };
  }) {
    return (
      <div className="mt-4 bg-white p-6 rounded-lg shadow-md">
        <p className="text-lg font-semibold text-gray-800">
          Контракт: <span className="text-gray-600 font-normal">{result.contract}</span>
        </p>
        <p className="text-lg font-semibold text-gray-800">
          MCAP: <span className="text-gray-600 font-normal">${result.mcap.toLocaleString()}</span>
        </p>
        <p className="text-lg font-semibold text-gray-800">
          Ликвидность: <span className="text-gray-600 font-normal">${result.liquidity.toLocaleString()}</span>
        </p>
        <p className="text-lg font-semibold text-gray-800">
          Ров: <span className="text-gray-600 font-normal">{result.moat.toFixed(4)}</span>
        </p>
      </div>
    );
  }