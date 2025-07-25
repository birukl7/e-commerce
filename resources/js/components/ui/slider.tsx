import React from 'react';

interface SliderProps {
  value: number[];
  onValueChange: (value: number[]) => void;
  max: number;
  min: number;
  step: number;
  className?: string;
}

export function Slider({ value, onValueChange, max, min, step, className = '' }: SliderProps) {
  const handleChange = (index: number, newValue: string) => {
    const numValue = parseInt(newValue);
    const newValues = [...value];
    newValues[index] = numValue;
    
    // Ensure min <= max
    if (index === 0 && numValue > newValues[1]) {
      newValues[1] = numValue;
    } else if (index === 1 && numValue < newValues[0]) {
      newValues[0] = numValue;
    }
    
    onValueChange(newValues);
  };

  const percentage1 = ((value[0] - min) / (max - min)) * 100;
  const percentage2 = ((value[1] - min) / (max - min)) * 100;

  return (
    <div className={`relative ${className}`}>
      <div className="relative h-2 bg-gray-200 rounded-full">
        <div
          className="absolute h-2 bg-primary rounded-full"
          style={{
            left: `${percentage1}%`,
            width: `${percentage2 - percentage1}%`
          }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value[0]}
          onChange={(e) => handleChange(0, e.target.value)}
          className="absolute inset-0 w-full h-2 opacity-0 cursor-pointer"
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value[1]}
          onChange={(e) => handleChange(1, e.target.value)}
          className="absolute inset-0 w-full h-2 opacity-0 cursor-pointer"
        />
        <div
          className="absolute w-4 h-4 bg-white border-2 border-primary rounded-full transform -translate-y-1 -translate-x-2 cursor-pointer"
          style={{ left: `${percentage1}%` }}
        />
        <div
          className="absolute w-4 h-4 bg-white border-2 border-primary rounded-full transform -translate-y-1 -translate-x-2 cursor-pointer"
          style={{ left: `${percentage2}%` }}
        />
      </div>
    </div>
  );
}
