import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ReportDownload from '../components/ReportDownload';
import { AnalyzeResponse } from '../api/client';

export default function DownloadPage() {
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedResult = sessionStorage.getItem('analysisResult');
    if (!storedResult) {
      navigate('/');
      return;
    }
    setResult(JSON.parse(storedResult));
  }, [navigate]);

  if (!result) {
    return <div>Loading...</div>;
  }

  const fileInfo = JSON.parse(sessionStorage.getItem('currentFile') || '{}');
  const fileName = fileInfo.name?.replace('.csv', '') || 'analysis_report';

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-[#111418] dark:text-gray-200 min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
      <header className="absolute top-0 left-0 w-full p-4 sm:p-6 lg:p-8">
        <a className="flex items-center gap-2" href="/">
          <svg className="h-8 w-auto text-primary" fill="none" height="40" viewBox="0 0 35 40" width="35" xmlns="http://www.w3.org/2000/svg">
            <path d="M31.25 15C31.25 20.625 24.375 25.625 17.5 25.625C10.625 25.625 3.75 20.625 3.75 15C3.75 9.375 10.625 4.375 17.5 4.375C24.375 4.375 31.25 9.375 31.25 15Z" stroke="currentColor" strokeMiterlimit="10" strokeWidth="2" />
            <path d="M31.25 25C31.25 30.625 24.375 35.625 17.5 35.625C10.625 35.625 3.75 30.625 3.75 25" stroke="currentColor" strokeMiterlimit="10" strokeWidth="2" />
            <path d="M3.75 15C3.75 9.375 10.625 4.375 17.5 4.375" stroke="currentColor" strokeMiterlimit="10" strokeWidth="2" />
          </svg>
          <span className="text-xl font-bold text-gray-900 dark:text-white">DataFlow</span>
        </a>
      </header>
      <main className="w-full">
        <div className="flex w-full max-w-[960px] mx-auto flex-col rounded-xl bg-white dark:bg-gray-900/50 shadow-lg ring-1 ring-black/5 dark:ring-white/10">
          <div className="flex flex-wrap items-center justify-between gap-4 p-6 sm:p-8">
            <div className="flex flex-col gap-1">
              <p className="text-2xl font-bold leading-tight text-gray-900 dark:text-white sm:text-3xl">
                Download Your Analysis Report
              </p>
              <p className="text-sm font-normal text-gray-500 dark:text-gray-400 sm:text-base">
                Choose your preferred format to download the report.
              </p>
            </div>
          </div>
          <ReportDownload
            markdownReport={result.markdown_report}
            htmlReport={result.html_report}
            filename={fileName}
          />
        </div>
      </main>
      <footer className="absolute bottom-0 w-full p-4 sm:p-6 lg:p-8">
        <p className="text-center text-sm text-gray-500 dark:text-gray-400">© 2024 DataFlow. All rights reserved.</p>
      </footer>
    </div>
  );
}

