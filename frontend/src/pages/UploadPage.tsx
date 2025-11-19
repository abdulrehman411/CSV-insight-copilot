import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FileUpload from '../components/FileUpload';

// Helper function to store file in IndexedDB
const storeFileInIndexedDB = (file: File): Promise<void> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const arrayBuffer = e.target?.result as ArrayBuffer;
      const request = indexedDB.open('CSVAnalyzerDB', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        const transaction = db.transaction(['files'], 'readwrite');
        const store = transaction.objectStore('files');
        
        const fileData = {
          id: 'current',
          data: arrayBuffer,
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified,
        };
        
        const putRequest = store.put(fileData);
        putRequest.onsuccess = () => resolve();
        putRequest.onerror = () => reject(putRequest.error);
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('files')) {
          db.createObjectStore('files', { keyPath: 'id' });
        }
      };
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file);
  });
};

export default function UploadPage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const navigate = useNavigate();

  const handleFileSelect = (file: File) => {
    // Just store the file, don't start processing yet
    setSelectedFile(file);
  };

  const handleAnalyze = async () => {
    if (!selectedFile) {
      alert('Please select a file first');
      return;
    }

    setIsAnalyzing(true);
    try {
      // Clear any previous analysis results and progress flags
      sessionStorage.removeItem('analysisResult');
      sessionStorage.removeItem('analysisInProgress');
      
      // Store file info in sessionStorage for processing page
      // Include a timestamp to uniquely identify this upload session
      const fileInfo = {
        name: selectedFile.name,
        size: selectedFile.size,
        timestamp: Date.now(), // Unique identifier for this upload
      };
      sessionStorage.setItem('currentFile', JSON.stringify(fileInfo));
      
      // Store the actual file in IndexedDB
      await storeFileInIndexedDB(selectedFile);
      
      // Navigate to processing page - it will handle the API call
      navigate('/processing');
    } catch (error) {
      console.error('Error storing file:', error);
      alert('Failed to process file. Please try again.');
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-gray-800 dark:text-gray-200 min-h-screen">
      <div className="flex justify-center w-full px-4 sm:px-8">
        <header className="flex items-center justify-center whitespace-nowrap border-b border-solid border-gray-200 dark:border-gray-700 w-full max-w-6xl px-6 py-4">
          <div className="flex items-center gap-4 text-gray-900 dark:text-white">
            <svg className="h-8 w-8 text-primary" fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path clipRule="evenodd" d="M39.475 21.6262C40.358 21.4363 40.6863 21.5589 40.7581 21.5934C40.7876 21.655 40.8547 21.857 40.8082 22.3336C40.7408 23.0255 40.4502 24.0046 39.8572 25.2301C38.6799 27.6631 36.5085 30.6631 33.5858 33.5858C30.6631 36.5085 27.6632 38.6799 25.2301 39.8572C24.0046 40.4502 23.0255 40.7407 22.3336 40.8082C21.8571 40.8547 21.6551 40.7875 21.5934 40.7581C21.5589 40.6863 21.4363 40.358 21.6262 39.475C21.8562 38.4054 22.4689 36.9657 23.5038 35.2817C24.7575 33.2417 26.5497 30.9744 28.7621 28.762C30.9744 26.5497 33.2417 24.7574 35.2817 23.5037C36.9657 22.4689 38.4054 21.8562 39.475 21.6262ZM4.41189 29.2403L18.7597 43.5881C19.8813 44.7097 21.4027 44.9179 22.7217 44.7893C24.0585 44.659 25.5148 44.1631 26.9723 43.4579C29.9052 42.0387 33.2618 39.5667 36.4142 36.4142C39.5667 33.2618 42.0387 29.9052 43.4579 26.9723C44.1631 25.5148 44.659 24.0585 44.7893 22.7217C44.9179 21.4027 44.7097 19.8813 43.5881 18.7597L29.2403 4.41187C27.8527 3.02428 25.8765 3.02573 24.2861 3.36776C22.6081 3.72863 20.7334 4.58419 18.8396 5.74801C16.4978 7.18716 13.9881 9.18353 11.5858 11.5858C9.18354 13.988 7.18717 16.4978 5.74802 18.8396C4.58421 20.7334 3.72865 22.6081 3.36778 24.2861C3.02574 25.8765 3.02429 27.8527 4.41189 29.2403Z" fillRule="evenodd" />
            </svg>
            <h2 className="text-xl font-bold leading-tight tracking-[-0.015em]">CSV Analyzer</h2>
          </div>
        </header>
      </div>
      <main className="w-full max-w-6xl mx-auto px-4 sm:px-8">
        <div className="py-16 sm:py-24">
          <div className="flex flex-col items-center gap-12">
            <div className="flex flex-col gap-6 w-full max-w-2xl">
              <div className="flex flex-col gap-4 text-center">
                <h1 className="text-gray-900 dark:text-white text-4xl font-black leading-tight tracking-[-0.033em] @[480px]:text-5xl">
                  Turn Your Data Into Insights, Effortlessly.
                </h1>
                <h2 className="text-gray-600 dark:text-gray-300 text-base font-normal leading-normal @[480px]:text-lg">
                  Upload your CSV and get automated data analysis and visualizations in seconds.
                </h2>
              </div>
              <FileUpload onFileSelect={handleFileSelect} />
              {selectedFile && (
                <div className="flex items-center justify-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className="material-symbols-outlined text-primary">description</span>
                  <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                    {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                </div>
              )}
              <div className="flex justify-center">
                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !selectedFile}
                  className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 bg-primary text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="truncate">{isAnalyzing ? 'Analyzing...' : 'Analyze Data'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="py-16 sm:py-24">
          <div className="flex flex-col gap-12 px-4">
            <div className="flex flex-col gap-4 text-center">
              <h1 className="text-gray-900 dark:text-white tracking-tight text-3xl font-bold leading-tight @[480px]:text-4xl">
                Unlock the Power of Your Data
              </h1>
              <p className="text-gray-600 dark:text-gray-300 text-base font-normal leading-normal max-w-3xl mx-auto @[480px]:text-lg">
                Our platform simplifies data analysis, allowing you to focus on what matters most—making informed decisions.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="flex flex-1 flex-col gap-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-background-dark/50 p-6 text-center sm:text-left items-center sm:items-start">
                <span className="material-symbols-outlined text-3xl text-primary">lightbulb</span>
                <div className="flex flex-col gap-1">
                  <h2 className="text-gray-900 dark:text-white text-lg font-bold leading-tight">Instant Insights</h2>
                  <p className="text-gray-600 dark:text-gray-400 text-sm font-normal leading-normal">Get immediate key takeaways and summaries from your data without complex configurations.</p>
                </div>
              </div>
              <div className="flex flex-1 flex-col gap-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-background-dark/50 p-6 text-center sm:text-left items-center sm:items-start">
                <span className="material-symbols-outlined text-3xl text-primary">bar_chart</span>
                <div className="flex flex-col gap-1">
                  <h2 className="text-gray-900 dark:text-white text-lg font-bold leading-tight">Automated Visualizations</h2>
                  <p className="text-gray-600 dark:text-gray-400 text-sm font-normal leading-normal">Automatically generate beautiful and informative charts to understand your data visually.</p>
                </div>
              </div>
              <div className="flex flex-1 flex-col gap-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-background-dark/50 p-6 text-center sm:text-left items-center sm:items-start">
                <span className="material-symbols-outlined text-3xl text-primary">lock</span>
                <div className="flex flex-col gap-1">
                  <h2 className="text-gray-900 dark:text-white text-lg font-bold leading-tight">Secure & Private</h2>
                  <p className="text-gray-600 dark:text-gray-400 text-sm font-normal leading-normal">
                    Your data is encrypted and handled with the utmost confidentiality. We never share your information.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="py-16 sm:py-24">
          <div className="bg-white dark:bg-background-dark/50 rounded-xl">
            <div className="flex flex-col items-center justify-end gap-6 px-4 py-16 text-center @[480px]:gap-8 @[480px]:px-10 @[480px]:py-20">
              <div className="flex flex-col gap-2">
                <h1 className="text-gray-900 dark:text-white tracking-tight text-3xl font-bold leading-tight @[480px]:text-4xl">
                  Ready to get started?
                </h1>
                <p className="text-gray-600 dark:text-gray-300 text-base font-normal leading-normal max-w-xl mx-auto @[480px]:text-lg">
                  Analyze your first dataset for free. No credit card required.
                </p>
              </div>
              <button className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 bg-primary text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 transition-colors">
                <span className="truncate">Get Started For Free</span>
              </button>
            </div>
          </div>
        </div>
      </main>
      <div className="flex justify-center w-full px-4 sm:px-8 border-t border-gray-200 dark:border-gray-700 mt-16">
        <footer className="flex justify-center py-10 text-center w-full max-w-6xl">
          <p className="text-gray-600 dark:text-gray-400 text-sm font-normal leading-normal">© 2024 CSV Analyzer. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}

