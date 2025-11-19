interface ChartPreviewProps {
  chartData: string | null;
  title: string;
}

export default function ChartPreview({ chartData, title }: ChartPreviewProps) {
  if (!chartData) {
    return (
      <div className="rounded-lg border border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark p-4 flex flex-col gap-3">
        <h3 className="font-bold text-center">{title}</h3>
        <div className="w-full h-64 flex items-center justify-center text-subtle-light dark:text-subtle-dark">
          Chart not available
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border-light dark:border-border-dark bg-card-light dark:bg-card-dark p-4 flex flex-col gap-3">
      <h3 className="font-bold text-center">{title}</h3>
      <img
        src={chartData}
        alt={title}
        className="w-full h-auto rounded-md object-cover"
      />
    </div>
  );
}

