interface ReportDownloadProps {
  markdownReport?: string;
  htmlReport?: string;
  filename?: string;
}

export default function ReportDownload({
  markdownReport,
  htmlReport,
  filename = 'analysis_report',
}: ReportDownloadProps) {
  const downloadMarkdown = () => {
    if (!markdownReport) return;
    const blob = new Blob([markdownReport], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadHTML = () => {
    if (!htmlReport) return;
    const blob = new Blob([htmlReport], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid grid-cols-1 gap-6 p-6 pt-0 sm:grid-cols-2 sm:p-8 sm:pt-0">
      <div className="flex flex-col gap-4 rounded-lg bg-white dark:bg-gray-800/60 p-6 shadow-[0_2px_8px_rgba(0,0,0,0.05)] ring-1 ring-gray-200 dark:ring-gray-700">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <span className="material-symbols-outlined !text-3xl">article</span>
          </div>
          <p className="text-lg font-bold text-gray-900 dark:text-white">Markdown (.md)</p>
        </div>
        <p className="text-sm font-normal text-gray-600 dark:text-gray-300">
          A lightweight, text-based format ideal for documentation, version control, and easy editing.
        </p>
        <button
          onClick={downloadMarkdown}
          disabled={!markdownReport}
          className="mt-auto flex w-fit cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="material-symbols-outlined !text-lg">download</span>
          <span className="truncate">Download .md</span>
        </button>
      </div>
      <div className="flex flex-col gap-4 rounded-lg bg-white dark:bg-gray-800/60 p-6 shadow-[0_2px_8px_rgba(0,0,0,0.05)] ring-1 ring-gray-200 dark:ring-gray-700">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <span className="material-symbols-outlined !text-3xl">html</span>
          </div>
          <p className="text-lg font-bold text-gray-900 dark:text-white">HTML (.html)</p>
        </div>
        <p className="text-sm font-normal text-gray-600 dark:text-gray-300">
          A self-contained, interactive report with embedded charts and tables, perfect for sharing.
        </p>
        <button
          onClick={downloadHTML}
          disabled={!htmlReport}
          className="mt-auto flex w-fit cursor-pointer items-center justify-center gap-2 overflow-hidden rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] transition-colors hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="material-symbols-outlined !text-lg">download</span>
          <span className="truncate">Download .html</span>
        </button>
      </div>
    </div>
  );
}

