import { Insight } from '../api/client';

interface DatasetOverviewProps {
  columns: string[];
  dtypes: Record<string, string>;
  null_counts: Record<string, number>;
  unique_counts: Record<string, number>;
  n_rows: number;
}

export default function DatasetOverview({
  columns,
  dtypes,
  null_counts,
  unique_counts,
  n_rows,
}: DatasetOverviewProps) {
  return (
    <div className="mt-4 overflow-hidden rounded-lg border border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border-light dark:border-border-dark bg-zinc-50 dark:bg-zinc-900/50">
            <tr>
              <th className="px-6 py-3 font-semibold">Column Name</th>
              <th className="px-6 py-3 font-semibold">Data Type</th>
              <th className="px-6 py-3 font-semibold">Missing Values</th>
              <th className="px-6 py-3 font-semibold">Unique Values</th>
            </tr>
          </thead>
          <tbody>
            {columns.map((col) => {
              const dtypeLabel = dtypes[col] === 'numeric' ? 'Numeric' : 'Categorical';
              const nullCount = null_counts[col] || 0;
              const nullPct = n_rows > 0 ? ((nullCount / n_rows) * 100).toFixed(1) : '0.0';
              const uniqueCount = unique_counts[col] || 0;
              const isNumeric = dtypes[col] === 'numeric';
              
              return (
                <tr key={col} className="border-b border-border-light dark:border-border-dark">
                  <td className="px-6 py-4 font-medium">{col}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block px-2 py-1 text-xs font-semibold rounded ${
                        isNumeric
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300'
                          : 'bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-300'
                      }`}
                    >
                      {dtypeLabel}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {nullCount} ({nullPct}%)
                  </td>
                  <td className="px-6 py-4">{uniqueCount.toLocaleString()}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

