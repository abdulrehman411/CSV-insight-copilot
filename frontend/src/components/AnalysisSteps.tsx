interface Step {
  label: string;
  completed: boolean;
  active: boolean;
}

interface AnalysisStepsProps {
  steps: Step[];
}

export default function AnalysisSteps({ steps }: AnalysisStepsProps) {
  return (
    <div className="bg-white dark:bg-background-dark p-6 rounded-xl border border-gray-200 dark:border-gray-800">
      <h3 className="text-custom-text-primary dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] pb-4">
        Analysis Steps
      </h3>
      <ul className="flex flex-col gap-4">
        {steps.map((step, index) => (
          <li key={index} className="flex items-center gap-3">
            {step.completed ? (
              <div className="flex items-center justify-center size-6 bg-green-500 rounded-full flex-shrink-0">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            ) : step.active ? (
              <div className="flex items-center justify-center size-6 border-2 border-blue-500 rounded-full flex-shrink-0">
                <div className="size-2.5 bg-blue-500 rounded-full" />
              </div>
            ) : (
              <div className="flex items-center justify-center size-6 flex-shrink-0">
                <svg className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" strokeWidth="2" strokeDasharray="20 40" />
                </svg>
              </div>
            )}
            <p
              className={`text-sm leading-normal ${
                step.completed
                  ? 'text-gray-600 dark:text-gray-400'
                  : step.active
                  ? 'text-gray-900 dark:text-white font-medium'
                  : 'text-gray-500 dark:text-gray-500'
              }`}
            >
              {step.label}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

