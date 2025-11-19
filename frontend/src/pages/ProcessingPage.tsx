import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingProgress from '../components/LoadingProgress';
import AnalysisSteps from '../components/AnalysisSteps';
import axios from 'axios';

// Helper function to retrieve file from IndexedDB
const getFileFromIndexedDB = (): Promise<File | null> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('CSVAnalyzerDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(['files'], 'readonly');
      const store = transaction.objectStore('files');
      const getRequest = store.get('current');
      
      getRequest.onsuccess = () => {
        const data = getRequest.result;
        if (data && data.data) {
          // Reconstruct File object from ArrayBuffer
          const blob = new Blob([data.data], { type: data.type });
          const file = new File([blob], data.name, {
            type: data.type,
            lastModified: data.lastModified,
          });
          resolve(file);
        } else {
          resolve(null);
        }
      };
      
      getRequest.onerror = () => reject(getRequest.error);
    };
    
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('files')) {
        db.createObjectStore('files', { keyPath: 'id' });
      }
    };
  });
};

export default function ProcessingPage() {
  const [progress, setProgress] = useState(0);
  const [steps, setSteps] = useState([
    { label: 'Parsing CSV file', completed: false, active: false },
    { label: 'Analyzing dataset structure', completed: false, active: false },
    { label: 'Identifying key metrics', completed: false, active: false },
    { label: 'Generating statistical insights', completed: false, active: false },
    { label: 'Creating data visualizations', completed: false, active: false },
  ]);
  const navigate = useNavigate();

  // Get file info for display
  const fileInfoStr = sessionStorage.getItem('currentFile');
  const fileInfo = fileInfoStr ? JSON.parse(fileInfoStr) : { name: '', size: 0 };

  useEffect(() => {
    const processFile = async () => {
      const fileInfoStr = sessionStorage.getItem('currentFile');
      if (!fileInfoStr) {
        navigate('/');
        return;
      }

      const fileInfo = JSON.parse(fileInfoStr);
      const fileTimestamp = fileInfo.timestamp;
      
      // Check if we already have a result, but only if it matches the current file
      const existingResult = sessionStorage.getItem('analysisResult');
      const resultTimestamp = sessionStorage.getItem('resultTimestamp');
      
      // Only navigate to results if the result matches the current file upload
      if (existingResult && resultTimestamp && resultTimestamp === String(fileTimestamp)) {
        navigate('/results');
        return;
      }

      // If result exists but doesn't match, clear it (new file uploaded)
      if (existingResult) {
        sessionStorage.removeItem('analysisResult');
        sessionStorage.removeItem('resultTimestamp');
      }

      // Check if analysis is already in progress for this specific file
      const analysisInProgress = sessionStorage.getItem('analysisInProgress');
      const progressTimestamp = sessionStorage.getItem('progressTimestamp');
      
      // If analysis is in progress for a different file, clear it
      if (analysisInProgress && progressTimestamp && progressTimestamp !== String(fileTimestamp)) {
        sessionStorage.removeItem('analysisInProgress');
        sessionStorage.removeItem('progressTimestamp');
      }
      
      if (!analysisInProgress || progressTimestamp !== String(fileTimestamp)) {
        // Reset progress and steps for new file
        setProgress(0);
        setSteps([
          { label: 'Parsing CSV file', completed: false, active: false },
          { label: 'Analyzing dataset structure', completed: false, active: false },
          { label: 'Identifying key metrics', completed: false, active: false },
          { label: 'Generating statistical insights', completed: false, active: false },
          { label: 'Creating data visualizations', completed: false, active: false },
        ]);
        
        // Mark analysis as in progress with timestamp
        sessionStorage.setItem('analysisInProgress', 'true');
        sessionStorage.setItem('progressTimestamp', String(fileTimestamp));
        
        try {
          // Get file from IndexedDB
          const file = await getFileFromIndexedDB();
          if (!file) {
            throw new Error('File not found');
          }

          // Update step 1: Parsing CSV file
          setSteps((prev) => prev.map((s, i) => (i === 0 ? { ...s, active: true } : s)));
          setProgress(10);

          // Wait a bit for visual feedback
          await new Promise(resolve => setTimeout(resolve, 500));

          // Complete step 1, start step 2
          setSteps((prev) => prev.map((s, i) => 
            i === 0 ? { ...s, completed: true, active: false } : 
            i === 1 ? { ...s, active: true } : s
          ));
          setProgress(25);

          await new Promise(resolve => setTimeout(resolve, 500));

          // Complete step 2, start step 3
          setSteps((prev) => prev.map((s, i) => 
            i === 1 ? { ...s, completed: true, active: false } : 
            i === 2 ? { ...s, active: true } : s
          ));
          setProgress(40);

          // Make the actual API call with progress tracking
          const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000';
          const formData = new FormData();
          formData.append('file', file);

          const result = await axios.post(`${API_BASE_URL}/analyze`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: (progressEvent) => {
              if (progressEvent.total) {
                const uploadProgress = Math.round((progressEvent.loaded * 50) / progressEvent.total) + 40;
                setProgress(Math.min(uploadProgress, 90));
              }
            },
          });

          // Complete step 3, start step 4
          setSteps((prev) => prev.map((s, i) => 
            i === 2 ? { ...s, completed: true, active: false } : 
            i === 3 ? { ...s, active: true } : s
          ));
          setProgress(70);

          await new Promise(resolve => setTimeout(resolve, 500));

          // Complete step 4, start step 5
          setSteps((prev) => prev.map((s, i) => 
            i === 3 ? { ...s, completed: true, active: false } : 
            i === 4 ? { ...s, active: true } : s
          ));
          setProgress(85);

          await new Promise(resolve => setTimeout(resolve, 500));

          // Complete step 5
          setSteps((prev) => prev.map((s, i) => 
            i === 4 ? { ...s, completed: true, active: false } : s
          ));
          setProgress(100);

          // Store result with timestamp to match it with the file
          sessionStorage.setItem('analysisResult', JSON.stringify(result.data));
          sessionStorage.setItem('resultTimestamp', String(fileTimestamp));
          sessionStorage.removeItem('analysisInProgress');
          sessionStorage.removeItem('progressTimestamp');
          
          // Clean up IndexedDB
          const request = indexedDB.open('CSVAnalyzerDB', 1);
          request.onsuccess = () => {
            const db = request.result;
            const transaction = db.transaction(['files'], 'readwrite');
            const store = transaction.objectStore('files');
            store.delete('current');
          };

          // Navigate to results after a short delay
          setTimeout(() => {
            navigate('/results');
          }, 500);
        } catch (error) {
          console.error('Analysis error:', error);
          sessionStorage.removeItem('analysisInProgress');
          sessionStorage.removeItem('progressTimestamp');
          alert('Failed to analyze file. Please try again.');
          navigate('/');
        }
      } else {
        // Analysis already in progress for this file, show progress
        const progressInterval = setInterval(() => {
          setProgress((prev) => {
            if (prev >= 90) {
              clearInterval(progressInterval);
              return 90;
            }
            return prev + 2;
          });
        }, 200);
        
        // Check for result periodically, but verify it matches current file
        const checkInterval = setInterval(() => {
          const result = sessionStorage.getItem('analysisResult');
          const resultTs = sessionStorage.getItem('resultTimestamp');
          if (result && resultTs === String(fileTimestamp)) {
            clearInterval(checkInterval);
            clearInterval(progressInterval);
            setProgress(100);
            sessionStorage.removeItem('analysisInProgress');
            sessionStorage.removeItem('progressTimestamp');
            navigate('/results');
          }
        }, 500);

        return () => {
          clearInterval(progressInterval);
          clearInterval(checkInterval);
        };
      }
    };

    processFile();
  }, [navigate]);

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-custom-text-primary dark:text-gray-300 min-h-screen flex flex-col">
      <header className="w-full border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-background-dark">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-start px-4 sm:px-6 lg:px-8">
          <a className="flex items-center gap-2" href="/">
            <span className="material-symbols-outlined text-3xl text-primary">data_usage</span>
            <span className="text-xl font-bold text-custom-text-primary dark:text-white">DataAnalyzer</span>
          </a>
        </div>
      </header>
      <main className="flex-1 flex w-full justify-center py-8 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-4xl flex flex-col gap-8">
          <header>
            <div className="flex flex-wrap justify-between gap-3">
              <div className="flex flex-col gap-2">
                <h1 className="text-custom-text-primary dark:text-white text-4xl font-black leading-tight tracking-[-0.033em]">
                  Analyzing Your Data...
                </h1>
                <p className="text-custom-text-secondary dark:text-gray-400 text-base font-normal leading-normal">
                  This should only take a moment. Great discoveries await!
                </p>
              </div>
            </div>
          </header>
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            <div className="w-full lg:w-2/3 flex flex-col gap-6">
              <LoadingProgress progress={progress} />
              <div className="bg-white dark:bg-background-dark p-6 rounded-xl border border-gray-200 dark:border-gray-800">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center size-12 bg-primary/10 dark:bg-primary/20 rounded-lg">
                      <span className="material-symbols-outlined text-primary text-3xl">csv</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <p className="text-custom-text-primary dark:text-white text-base font-bold leading-tight">
                        Processing: {fileInfo.name || 'file.csv'}
                      </p>
                      <p className="text-custom-text-secondary dark:text-gray-400 text-sm font-normal leading-normal">
                        File Size: {fileInfo.size ? (fileInfo.size / 1024 / 1024).toFixed(2) + 'MB' : 'N/A'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate('/')}
                    className="px-4 py-2 text-sm font-medium text-custom-text-secondary dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
            <div className="w-full lg:w-1/3">
              <AnalysisSteps steps={steps} />
            </div>
          </div>
          <div className="mt-auto pt-8">
            <div className="bg-primary/10 dark:bg-primary/20 p-6 rounded-xl flex items-start gap-4">
              <span className="material-symbols-outlined text-primary text-3xl mt-1">lightbulb</span>
              <div className="flex flex-col">
                <h4 className="text-custom-primary dark:text-primary font-bold">Pro Tip</h4>
                <p className="text-custom-text-secondary dark:text-gray-400 text-sm">
                  Did you know that correlation doesn't imply causation? Always look for confounding variables in your analysis.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <footer className="w-full py-6 px-4 sm:px-6 lg:px-8 mt-auto">
        <div className="text-center">
          <p className="text-sm text-custom-text-secondary dark:text-gray-400">© 2024 DataAnalyzer. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

