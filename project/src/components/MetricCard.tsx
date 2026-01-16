import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  format?: 'currency' | 'percentage';
  onClick?: () => void;
  clickable?: boolean;
}

export function MetricCard({ 
  title, 
  value, 
  icon: Icon, 
  iconColor, 
  iconBg, 
  format = 'currency', 
  onClick, 
  clickable = false 
}: MetricCardProps) {
  const formatValue = (val: number) => {
    if (format === 'currency') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(val);
    } else {
      return `${val.toFixed(2)}%`;
    }
  };

  return (
    <div
      className={`bg-white rounded-xl shadow-lg p-6 transition-all duration-300 ${
        clickable
          ? 'hover:shadow-2xl hover:scale-105 cursor-pointer border-2 border-transparent hover:border-blue-400 transform'
          : 'hover:shadow-xl'
      }`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
          <p className={`text-2xl font-bold ${value < 0 ? 'text-red-600' : 'text-gray-900'}`}>
            {formatValue(value)}
          </p>
          {clickable && (
            <p className="text-xs text-blue-500 mt-2 font-medium">Click for details →</p>
          )}
        </div>
        <div className={`${iconBg} p-3 rounded-lg`}>
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
      </div>
    </div>
  );
}
