interface CheckboxProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  className?: string;
  children?: React.ReactNode;
}

export function Checkbox({ checked, onCheckedChange, className = '', children }: CheckboxProps) {
  return (
    <label className={`flex items-center space-x-2 cursor-pointer ${className}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onCheckedChange(e.target.checked)}
        className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
      />
      {children && <span className="text-sm text-gray-700">{children}</span>}
    </label>
  );
}
