'use client';

import React from 'react';
import {
  Sparkles,
  Palmtree,
  Trees,
  Castle,
  Flame,
  Wheat,
  Sun,
  LayoutGrid,
  Building,
  Bed
} from 'lucide-react';

interface CategoryBarProps {
  activeCategory: string;
  onSelectCategory: (category: string) => void;
}

const CATEGORIES = [
  { id: 'All', label: 'All Listings', icon: LayoutGrid },
  { id: 'Iconic', label: 'Iconic Cities', icon: Sparkles },
  { id: 'Beachfront', label: 'Beachfront', icon: Palmtree },
  { id: 'Cabins', label: 'Cabins', icon: Trees },
  { id: 'Mansions', label: 'Mansions', icon: Castle },
  { id: 'OMG!', label: 'OMG!', icon: Flame },
  { id: 'Countryside', label: 'Countryside', icon: Wheat },
  { id: 'Tropical', label: 'Tropical', icon: Sun },
  { id: 'Design', label: 'Design', icon: Building },
  { id: 'Rooms', label: 'Rooms', icon: Bed },
];

export const CategoryBar: React.FC<CategoryBarProps> = ({ activeCategory, onSelectCategory }) => {
  return (
    <div className="bg-white border-b border-gray-100 py-3">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-7 overflow-x-auto no-scrollbar py-1">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`flex flex-col items-center gap-1.5 border-b-2 pb-2 transition-all shrink-0 group cursor-pointer ${
                  isActive
                    ? 'border-gray-900 text-gray-900 font-semibold'
                    : 'border-transparent text-gray-500 hover:text-gray-900 hover:border-gray-300'
                }`}
              >
                <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? 'text-gray-900' : 'text-gray-500'}`} />
                <span className="text-[12px] whitespace-nowrap">{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
