import { useState, useRef } from 'react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
}

export default function FileUpload({ onFileSelect }: FileUploadProps) {
  const [fileName, setFileName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type === 'text/csv' || file.name.endsWith('.csv')) {
        setFileName(file.name);
        onFileSelect(file);
      } else {
        alert('Please upload a CSV file');
      }
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && (file.type === 'text/csv' || file.name.endsWith('.csv'))) {
      setFileName(file.name);
      onFileSelect(file);
    } else {
      alert('Please upload a CSV file');
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
    <label className="flex flex-col min-w-40 h-16 w-full max-w-full">
      <div
        className="flex w-full flex-1 items-stretch rounded-xl h-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-background-dark/50"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <div className="text-gray-500 dark:text-gray-400 flex items-center justify-center pl-4">
          <span className="material-symbols-outlined text-2xl">upload_file</span>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="hidden"
        />
        <input
          className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-gray-900 dark:text-white focus:outline-0 focus:ring-0 border-none bg-transparent h-full placeholder:text-gray-500 dark:placeholder:text-gray-400 px-2 text-sm font-normal leading-normal @[480px]:text-base"
          placeholder={fileName || "Drag & Drop your CSV here, or browse files"}
          value={fileName}
          readOnly
          onClick={() => fileInputRef.current?.click()}
        />
      </div>
    </label>
  );
}

