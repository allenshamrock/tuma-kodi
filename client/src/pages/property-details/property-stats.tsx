interface PropertyStatsProps {
  totalUnits: number;
  occupied: number;
  vacant: number;
}

export const PropertyStats = ({
  totalUnits,
  occupied,
  vacant,
}: PropertyStatsProps) => {
  const stats = [
    {
      label: "Total Units",
      value: totalUnits,
      color: "text-gray-900 dark:text-gray-100",
    },
    {
      label: "Occupied",
      value: occupied,
      color: "text-blue-600 dark:text-blue-400",
    },
    {
      label: "Vacant",
      value: vacant,
      color: "text-green-600 dark:text-green-400",
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-4 mb-6">
      {stats.map(({ label, value, color }) => (
        <div
          key={label}
          className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 p-4"
        >
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
            {label}
          </p>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
        </div>
      ))}
    </div>
  );
};
