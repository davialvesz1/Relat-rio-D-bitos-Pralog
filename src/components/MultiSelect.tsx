import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, X, Check } from 'lucide-react';

interface MultiSelectProps {
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder: string;
}

const MultiSelect: React.FC<MultiSelectProps> = ({ options, selected, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOption = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter(item => item !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  const removeOption = (option: string) => {
    onChange(selected.filter(item => item !== option));
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        className="bg-[#0F2A5F] border border-white/20 rounded-lg px-4 py-3 cursor-pointer min-h-[48px] flex items-center justify-between"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex-1 flex flex-wrap gap-2">
          {selected.length === 0 ? (
            <span className="text-[#E5F0FF]/60">{placeholder}</span>
          ) : (
            selected.map(item => (
              <span
                key={item}
                className="bg-[#2F6BFF] text-white px-2 py-1 rounded-md text-sm flex items-center gap-1"
              >
                {item}
                <X
                  size={14}
                  className="cursor-pointer hover:bg-white/20 rounded"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeOption(item);
                  }}
                />
              </span>
            ))
          )}
        </div>
        <ChevronDown
          size={20}
          className={`text-[#E5F0FF] transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-[#0F2A5F] border border-white/20 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
          {options.map(option => (
            <div
              key={option}
              className="px-4 py-3 hover:bg-white/10 cursor-pointer flex items-center justify-between text-[#E5F0FF]"
              onClick={() => toggleOption(option)}
            >
              <span className="truncate">{option}</span>
              {selected.includes(option) && (
                <Check size={16} className="text-[#2F6BFF] flex-shrink-0" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MultiSelect;