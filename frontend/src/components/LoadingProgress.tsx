interface LoadingProgressProps {
  progress: number;
}

export default function LoadingProgress({ progress }: LoadingProgressProps) {
  return (
    <div className="bg-white dark:bg-background-dark p-6 rounded-xl border border-gray-200 dark:border-gray-800">
      <div className="flex gap-6 justify-between items-center mb-3">
        <p className="text-custom-text-primary dark:text-gray-300 text-base font-medium leading-normal">
          Overall Progress
        </p>
        <p className="text-custom-primary dark:text-primary text-sm font-bold leading-normal">
          {Math.round(progress)}%
        </p>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
        <div
          className="bg-custom-primary h-2.5 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

