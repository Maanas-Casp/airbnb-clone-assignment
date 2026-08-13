'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Listing, Amenity } from '@/lib/types';
import { useUser } from '@/context/UserContext';
import { X, Plus, Trash2, Home, DollarSign, MapPin } from 'lucide-react';

interface ListingFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  listingToEdit?: Listing | null;
}

export const ListingFormModal: React.FC<ListingFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  listingToEdit,
}) => {
  const { activeUserId, showToast } = useUser();
  const [amenitiesCatalog, setAmenitiesCatalog] = useState<Amenity[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Iconic',
    property_type: 'Entire home',
    location_city: '',
    location_country: '',
    price_per_night: 150,
    max_guests: 4,
    bedrooms: 2,
    beds: 2,
    bathrooms: 1.0,
    image_urls: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80'],
    amenity_ids: [] as number[],
  });

  const isEditMode = !!listingToEdit;

  useEffect(() => {
    api.getAmenities().then(setAmenitiesCatalog).catch(console.error);
  }, []);

  useEffect(() => {
    if (listingToEdit) {
      setFormData({
        title: listingToEdit.title || '',
        description: listingToEdit.description || '',
        category: listingToEdit.category || 'Iconic',
        property_type: listingToEdit.property_type || 'Entire home',
        location_city: listingToEdit.location_city || '',
        location_country: listingToEdit.location_country || '',
        price_per_night: listingToEdit.price_per_night || 150,
        max_guests: listingToEdit.max_guests || 4,
        bedrooms: listingToEdit.bedrooms || 2,
        beds: listingToEdit.beds || 2,
        bathrooms: listingToEdit.bathrooms || 1.0,
        image_urls: listingToEdit.images?.map(i => i.image_url) || ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750'],
        amenity_ids: listingToEdit.amenities?.map(a => a.id) || [],
      });
    } else {
      setFormData({
        title: '',
        description: '',
        category: 'Iconic',
        property_type: 'Entire home',
        location_city: '',
        location_country: '',
        price_per_night: 150,
        max_guests: 4,
        bedrooms: 2,
        beds: 2,
        bathrooms: 1.0,
        image_urls: ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80'],
        amenity_ids: [1, 2, 4],
      });
    }
  }, [listingToEdit, isOpen]);

  if (!isOpen) return null;

  const handleImageUrlChange = (index: number, value: string) => {
    const updated = [...formData.image_urls];
    updated[index] = value;
    setFormData({ ...formData, image_urls: updated });
  };

  const handleAddImageUrl = () => {
    setFormData({
      ...formData,
      image_urls: [...formData.image_urls, ''],
    });
  };

  const handleRemoveImageUrl = (index: number) => {
    if (formData.image_urls.length <= 1) return;
    const updated = formData.image_urls.filter((_, i) => i !== index);
    setFormData({ ...formData, image_urls: updated });
  };

  const handleToggleAmenity = (id: number) => {
    const set = new Set(formData.amenity_ids);
    if (set.has(id)) {
      set.delete(id);
    } else {
      set.add(id);
    }
    setFormData({ ...formData, amenity_ids: Array.from(set) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const validImages = formData.image_urls.filter(url => url.trim().length > 0);
    if (validImages.length === 0) {
      showToast('Please provide at least one photo URL', 'error');
      setIsSubmitting(false);
      return;
    }

    try {
      if (isEditMode && listingToEdit) {
        await api.updateListing(listingToEdit.id, {
          ...formData,
          image_urls: validImages,
        });
        showToast('✓ Listing updated successfully!', 'success');
      } else {
        await api.createListing({
          ...formData,
          host_id: activeUserId,
          image_urls: validImages,
        });
        showToast('✓ New listing created successfully!', 'success');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Failed to save listing', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full p-6 relative border border-gray-100 my-8 max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 pb-4 shrink-0">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Home className="w-5 h-5 text-[#FF385C]" />
            {isEditMode ? 'Edit Listing' : 'Create New Airbnb Listing'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto py-6 space-y-6 pr-2">
          
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Listing Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Modern Oceanfront Villa with Infinity Pool"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FF385C] focus:border-transparent outline-hidden text-sm"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Description
            </label>
            <textarea
              required
              rows={4}
              placeholder="Describe your property, view, location details..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FF385C] focus:border-transparent outline-hidden text-sm"
            />
          </div>

          {/* Category & Property Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FF385C] outline-hidden text-sm"
              >
                <option value="Iconic">Iconic</option>
                <option value="Beachfront">Beachfront</option>
                <option value="Cabins">Cabins</option>
                <option value="Mansions">Mansions</option>
                <option value="OMG!">OMG!</option>
                <option value="Countryside">Countryside</option>
                <option value="Tropical">Tropical</option>
                <option value="Design">Design</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Property Type
              </label>
              <select
                value={formData.property_type}
                onChange={(e) => setFormData({ ...formData, property_type: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FF385C] outline-hidden text-sm"
              >
                <option value="Entire villa">Entire villa</option>
                <option value="Entire home">Entire home</option>
                <option value="Entire apartment">Entire apartment</option>
                <option value="Entire chalet">Entire chalet</option>
                <option value="Entire loft">Entire loft</option>
                <option value="Treehouse">Treehouse</option>
                <option value="Cave home">Cave home</option>
              </select>
            </div>
          </div>

          {/* Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                City / Location
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Malibu"
                value={formData.location_city}
                onChange={(e) => setFormData({ ...formData, location_city: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FF385C] outline-hidden text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Country
              </label>
              <input
                type="text"
                required
                placeholder="e.g. United States"
                value={formData.location_country}
                onChange={(e) => setFormData({ ...formData, location_country: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FF385C] outline-hidden text-sm"
              />
            </div>
          </div>

          {/* Pricing & Capacity */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Nightly Price ($)
              </label>
              <input
                type="number"
                required
                min="10"
                value={formData.price_per_night}
                onChange={(e) => setFormData({ ...formData, price_per_night: parseFloat(e.target.value) || 0 })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FF385C] outline-hidden text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Max Guests
              </label>
              <input
                type="number"
                required
                min="1"
                value={formData.max_guests}
                onChange={(e) => setFormData({ ...formData, max_guests: parseInt(e.target.value) || 1 })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FF385C] outline-hidden text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Bedrooms
              </label>
              <input
                type="number"
                min="1"
                value={formData.bedrooms}
                onChange={(e) => setFormData({ ...formData, bedrooms: parseInt(e.target.value) || 1 })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FF385C] outline-hidden text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Bathrooms
              </label>
              <input
                type="number"
                step="0.5"
                min="1"
                value={formData.bathrooms}
                onChange={(e) => setFormData({ ...formData, bathrooms: parseFloat(e.target.value) || 1 })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#FF385C] outline-hidden text-sm"
              />
            </div>
          </div>

          {/* Photos URLs */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                Photo URLs
              </label>
              <button
                type="button"
                onClick={handleAddImageUrl}
                className="text-xs font-bold text-[#FF385C] hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Image URL
              </button>
            </div>
            <div className="space-y-3">
              {formData.image_urls.map((url, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="url"
                    required
                    placeholder="https://images.unsplash.com/..."
                    value={url}
                    onChange={(e) => handleImageUrlChange(idx, e.target.value)}
                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-xs outline-hidden"
                  />
                  {formData.image_urls.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveImageUrl(idx)}
                      className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Amenities Selector */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Amenities
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {amenitiesCatalog.map((amenity) => {
                const isChecked = formData.amenity_ids.includes(amenity.id);
                return (
                  <button
                    key={amenity.id}
                    type="button"
                    onClick={() => handleToggleAmenity(amenity.id)}
                    className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition-all ${
                      isChecked
                        ? 'border-black bg-gray-900 text-white'
                        : 'border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span>{amenity.name}</span>
                    {isChecked && <span>✓</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit Footer */}
          <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary text-sm font-bold flex items-center gap-2"
            >
              {isSubmitting ? (
                <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              ) : isEditMode ? (
                'Save Changes'
              ) : (
                'Publish Listing'
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
