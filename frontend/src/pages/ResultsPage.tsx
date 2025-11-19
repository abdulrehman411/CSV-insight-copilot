import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DatasetOverview from '../components/DatasetOverview';
import InsightCard from '../components/InsightCard';
import ChartPreview from '../components/ChartPreview';
import { AnalyzeResponse } from '../api/client';

export default function ResultsPage() {
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const navigate = useNavigate();

  useEffect(() => {
    const storedResult = sessionStorage.getItem('analysisResult');
    const resultTimestamp = sessionStorage.getItem('resultTimestamp');
    const fileInfoStr = sessionStorage.getItem('currentFile');
    
    if (!storedResult) {
      navigate('/');
      return;
    }
    
    // Verify the result matches the current file
    if (fileInfoStr && resultTimestamp) {
      const fileInfo = JSON.parse(fileInfoStr);
      if (resultTimestamp !== String(fileInfo.timestamp)) {
        // Result doesn't match current file, redirect to upload
        navigate('/');
        return;
      }
    }
    
    setResult(JSON.parse(storedResult));
  }, [navigate]);

  if (!result) {
    return <div>Loading...</div>;
  }

  const fileInfo = JSON.parse(sessionStorage.getItem('currentFile') || '{}');
  const fileName = fileInfo.name || 'dataset.csv';

  // Extract profile data from result
  const profile = (result as any).profile;
  const totalRows = profile?.n_rows || 0;
  const totalCols = profile?.n_cols || 0;
  const missingTotal = profile ? Object.values(profile.null_counts || {}).reduce((a: number, b: number) => a + b, 0) : 0;
  const missingValues = totalRows > 0 && totalCols > 0 
    ? `${((missingTotal / (totalRows * totalCols)) * 100).toFixed(1)}%`
    : '0%';
  const duplicateRows = '0%'; // Would need to be calculated from actual data

  return (
    <div className="font-display bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark min-h-screen flex flex-col">
      <header className="sticky top-0 z-10 flex h-16 w-full items-center border-b border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 bg-primary/20 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary">data_usage</span>
          </div>
          <div className="flex flex-col">
            <h1 className="text-text-light dark:text-text-dark text-base font-bold leading-normal">DataAnalyzer</h1>
            <p className="text-subtle-light dark:text-subtle-dark text-sm font-normal leading-normal">Automated Insights</p>
          </div>
        </div>
      </header>
      <div className="relative flex flex-1">
        <aside className="sticky top-16 h-[calc(100vh-4rem)] w-64 flex-shrink-0 bg-card-light dark:bg-card-dark border-r border-border-light dark:border-border-dark hidden sm:flex">
          <div className="flex h-full flex-col justify-between p-4">
            <div className="flex flex-col gap-4">
              <nav className="flex flex-col gap-2 mt-4">
                <a
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg ${
                    activeTab === 'overview'
                      ? 'bg-primary/10 dark:bg-primary/20 text-primary'
                      : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                  onClick={() => setActiveTab('overview')}
                >
                  <span className="material-symbols-outlined text-primary">dashboard</span>
                  <p className="text-sm font-semibold leading-normal">Overview</p>
                </a>
                <a
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg ${
                    activeTab === 'columns'
                      ? 'bg-primary/10 dark:bg-primary/20 text-primary'
                      : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                  onClick={() => setActiveTab('columns')}
                >
                  <span className="material-symbols-outlined text-subtle-light dark:text-subtle-dark">view_column</span>
                  <p className="text-sm font-medium leading-normal">Column Analysis</p>
                </a>
                <a
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg ${
                    activeTab === 'visualizations'
                      ? 'bg-primary/10 dark:bg-primary/20 text-primary'
                      : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                  onClick={() => setActiveTab('visualizations')}
                >
                  <span className="material-symbols-outlined text-subtle-light dark:text-subtle-dark">bar_chart</span>
                  <p className="text-sm font-medium leading-normal">Visualizations</p>
                </a>
                <a
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg ${
                    activeTab === 'insights'
                      ? 'bg-primary/10 dark:bg-primary/20 text-primary'
                      : 'hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                  onClick={() => setActiveTab('insights')}
                >
                  <span className="material-symbols-outlined text-subtle-light dark:text-subtle-dark">lightbulb</span>
                  <p className="text-sm font-medium leading-normal">Insights</p>
                </a>
              </nav>
            </div>
            <button
              onClick={() => navigate('/')}
              className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 transition-colors"
            >
              <span className="truncate">Start New Analysis</span>
            </button>
          </div>
        </aside>
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-col gap-2">
                <p className="text-3xl font-bold leading-tight tracking-[-0.033em]">Analysis of {fileName}</p>
                <p className="text-subtle-light dark:text-subtle-dark text-base font-normal leading-normal">
                  A comprehensive overview of your dataset's structure, insights, and visualizations.
                </p>
              </div>
              <button
                onClick={() => navigate('/download')}
                className="flex min-w-[84px] cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg h-10 px-4 bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark text-text-light dark:text-text-dark text-sm font-bold leading-normal tracking-[0.015em] hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>download</span>
                <span className="truncate">Download Report</span>
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
              <div className="flex flex-col gap-2 rounded-lg p-6 bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark">
                <p className="text-base font-medium leading-normal text-subtle-light dark:text-subtle-dark">Total Rows</p>
                <p className="tracking-light text-3xl font-bold leading-tight">{totalRows.toLocaleString()}</p>
              </div>
              <div className="flex flex-col gap-2 rounded-lg p-6 bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark">
                <p className="text-base font-medium leading-normal text-subtle-light dark:text-subtle-dark">Number of Columns</p>
                <p className="tracking-light text-3xl font-bold leading-tight">{totalCols}</p>
              </div>
              <div className="flex flex-col gap-2 rounded-lg p-6 bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark">
                <p className="text-base font-medium leading-normal text-subtle-light dark:text-subtle-dark">Missing Values</p>
                <p className="tracking-light text-3xl font-bold leading-tight">{missingValues}</p>
              </div>
              <div className="flex flex-col gap-2 rounded-lg p-6 bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark">
                <p className="text-base font-medium leading-normal text-subtle-light dark:text-subtle-dark">Duplicate Rows</p>
                <p className="tracking-light text-3xl font-bold leading-tight">{duplicateRows}</p>
              </div>
            </div>
            <div className="mt-8">
              <div className="flex border-b border-border-light dark:border-border-dark gap-8 overflow-x-auto">
                <button
                  className={`flex flex-col items-center justify-center border-b-[3px] ${
                    activeTab === 'overview' ? 'border-primary text-primary' : 'border-transparent text-subtle-light dark:text-subtle-dark hover:text-text-light dark:hover:text-text-dark'
                  } pb-[13px] pt-4 whitespace-nowrap px-1 transition-colors`}
                  onClick={() => setActiveTab('overview')}
                >
                  <p className="text-sm font-bold leading-normal tracking-[0.015em]">Overview</p>
                </button>
                <button
                  className={`flex flex-col items-center justify-center border-b-[3px] ${
                    activeTab === 'columns' ? 'border-primary text-primary' : 'border-transparent text-subtle-light dark:text-subtle-dark hover:text-text-light dark:hover:text-text-dark'
                  } pb-[13px] pt-4 whitespace-nowrap px-1 transition-colors`}
                  onClick={() => setActiveTab('columns')}
                >
                  <p className="text-sm font-bold leading-normal tracking-[0.015em]">Column Analysis</p>
                </button>
                <button
                  className={`flex flex-col items-center justify-center border-b-[3px] ${
                    activeTab === 'visualizations' ? 'border-primary text-primary' : 'border-transparent text-subtle-light dark:text-subtle-dark hover:text-text-light dark:hover:text-text-dark'
                  } pb-[13px] pt-4 whitespace-nowrap px-1 transition-colors`}
                  onClick={() => setActiveTab('visualizations')}
                >
                  <p className="text-sm font-bold leading-normal tracking-[0.015em]">Visualizations</p>
                </button>
                <button
                  className={`flex flex-col items-center justify-center border-b-[3px] ${
                    activeTab === 'insights' ? 'border-primary text-primary' : 'border-transparent text-subtle-light dark:text-subtle-dark hover:text-text-light dark:hover:text-text-dark'
                  } pb-[13px] pt-4 whitespace-nowrap px-1 transition-colors`}
                  onClick={() => setActiveTab('insights')}
                >
                  <p className="text-sm font-bold leading-normal tracking-[0.015em]">Insights</p>
                </button>
              </div>
            </div>
            <div className="mt-8 space-y-12">
              {activeTab === 'overview' && (
                <section className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-bold leading-tight tracking-[-0.015em]">Executive Summary</h2>
                    <div className="mt-4 p-6 bg-card-light dark:bg-card-dark rounded-lg border border-border-light dark:border-border-dark">
                      <p className="text-subtle-light dark:text-subtle-dark leading-relaxed whitespace-pre-wrap">{result.summary}</p>
                    </div>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold leading-tight tracking-[-0.015em]">Dataset Structure</h2>
                    <div className="mt-4 p-6 bg-card-light dark:bg-card-dark rounded-lg border border-border-light dark:border-border-dark">
                      <p className="text-subtle-light dark:text-subtle-dark mb-4">{result.dataset_overview}</p>
                      {profile && (
                        <DatasetOverview
                          columns={profile.columns || []}
                          dtypes={profile.dtypes || {}}
                          null_counts={profile.null_counts || {}}
                          unique_counts={profile.unique_counts || {}}
                          n_rows={profile.n_rows || 0}
                        />
                      )}
                    </div>
                  </div>
                </section>
              )}
              {activeTab === 'columns' && profile && (
                <section>
                  <h2 className="text-2xl font-bold leading-tight tracking-[-0.015em]">Column Analysis</h2>
                  <div className="mt-4">
                    <DatasetOverview
                      columns={profile.columns || []}
                      dtypes={profile.dtypes || {}}
                      null_counts={profile.null_counts || {}}
                      unique_counts={profile.unique_counts || {}}
                      n_rows={profile.n_rows || 0}
                    />
                  </div>
                </section>
              )}
              {activeTab === 'insights' && (
                <section>
                  <h2 className="text-2xl font-bold leading-tight tracking-[-0.015em]">Key Insights</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
                    {result.insights.map((insight, index) => (
                      <InsightCard key={index} insight={insight} index={index} />
                    ))}
                  </div>
                </section>
              )}
              {activeTab === 'visualizations' && (
                <section>
                  <h2 className="text-2xl font-bold leading-tight tracking-[-0.015em]">Visualizations</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
                    {result.insights.map((insight, index) => (
                      <ChartPreview
                        key={index}
                        chartData={result.charts[index] || null}
                        title={insight.title}
                      />
                    ))}
                  </div>
                </section>
              )}
            </div>
          </div>
        </main>
      </div>
      <footer className="w-full border-t border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm text-subtle-light dark:text-subtle-dark">© 2024 DataAnalyzer. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

