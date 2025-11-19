import { Insight } from '../api/client';

interface InsightCardProps {
  insight: Insight;
  index: number;
}

const insightIcons = ['trending_up', 'pie_chart', 'warning', 'bar_chart', 'show_chart'];
const insightColors = [
  'bg-orange-100 dark:bg-orange-900/50 text-orange-500',
  'bg-green-100 dark:bg-green-900/50 text-green-500',
  'bg-red-100 dark:bg-red-900/50 text-red-500',
];

export default function InsightCard({ insight, index }: InsightCardProps) {
  const icon = insightIcons[index % insightIcons.length];
  const colorClass = insightColors[index % insightColors.length];

  return (
    <div className="flex flex-col gap-3 rounded-lg p-6 bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark">
      <div className="flex items-center gap-3">
        <div className={`flex items-center justify-center size-10 rounded-full ${colorClass}`}>
          <span className="material-symbols-outlined">{icon}</span>
        </div>
        <h3 className="text-base font-bold">{insight.title}</h3>
      </div>
      <p className="text-sm text-subtle-light dark:text-subtle-dark">{insight.description}</p>
    </div>
  );
}

