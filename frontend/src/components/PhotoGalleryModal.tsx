'use client';

import React from 'react';
import { X } from 'lucide-react';
import { ListingImage } from '@/lib/types';

interface PhotoGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: ListingImage[];
  title: string;
}

export const PhotoGalleryModal: React.FC<PhotoGalleryModalProps> = ({
  isOpen,
  onClose,
  images,
  title,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      
      {/* Top Bar */}
      <div className="sticky top-0 bg-black/70 backdrop-blur-md p-4 flex items-center justify-between text-white z-10 border-b border-white/10">
        <h3 className="font-bold text-lg truncate px-4">{title} — Photo Gallery</h3>
        <button
          onClick={onClose}
          className="p-2 text-white hover:bg-white/10 rounded-full transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Grid of Photos */}
      <div className="max-w-5xl mx-auto py-8 px-4 flex flex-col gap-6">
        {images.map((img, idx) => (
          <div key={img.id || idx} className="rounded-2xl overflow-hidden shadow-2xl bg-gray-900">
            <img
              src={img.image_url}
              alt={`${title} photo ${idx + 1}`}
              className="w-full h-auto object-cover max-h-[80vh]"
            />
          </div>
        ))}
      </div>
    </div>
  );
};
