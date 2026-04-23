import React from 'react';

interface ProgressBarProps {
  progress: number; // 0 to 100
  label?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress, label }) => {
  return (
    <div className="w-full space-y-2">
      {label && (
        <div className="flex justify-between text-sm font-medium text-gray-700">
          <span>{label}</span>
          <span className="text-blue-600">{progress}%</span>
        </div>
      )}
      <div className="h-2.5 w-full bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 rounded-full transition-all duration-700 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
