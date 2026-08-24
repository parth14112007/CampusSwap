import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TopAppBar } from '../components/common/TopAppBar';
import { BottomNav } from '../components/common/BottomNav';
import { Button } from '../components/common/Button';
import { ListingCard } from '../components/marketplace/ListingCard';
import { useMarketplace } from '../context/MarketplaceContext';
import { CATEGORIES, CONDITIONS } from '../data/mockData';
import { storageService } from '../services/storageService';

const PRESET_IMAGES = [
  { label: "Arduino / Microcontroller", url: "https://images.unsplash.com/photo-1553406830-ef2513450d76?auto=format&fit=crop&w=600&q=80" },
  { label: "ESP32 / Wireless IoT", url: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80" },
  { label: "Raspberry Pi / SBC", url: "https://images.unsplash.com/photo-1629654297299-c8506221ca97?auto=format&fit=crop&w=600&q=80" },
  { label: "Soldering Station & Tools", url: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=600&q=80" },
  { label: "Oscilloscope / Testing", url: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80" },
  { label: "Sensors & Modules", url: "https://images.unsplash.com/photo-1563770660941-20978e870e26?auto=format&fit=crop&w=600&q=80" },
  { label: "Motors & Robotics", url: "https://images.unsplash.com/photo-15810934651-ddf26d9a09d0?auto=format&fit=crop&w=600&q=80" }
];

export function ListItemPage() {
  const navigate = useNavigate();
  const { addItem, user } = useMarketplace();

  const [formData, setFormData] = useState({
    title: '',
    category: 'Arduino & Microcontrollers',
    type: 'Rent',
    price: 80,
    priceUnit: '/day',
    deposit: 300,
    condition: 'Lab Tested',
    location: 'Block B • Electronics Lab 2',
    description: '',
    image: PRESET_IMAGES[0].url
  });

  const [customImageUrl, setCustomImageUrl] = useState('');
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [specs, setSpecs] = useState([
    { label: 'Operating Voltage', value: '5V' },
    { label: 'Condition Note', value: 'Tested and functional' }
  ]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'price' || name === 'deposit' ? Number(value) : value,
      priceUnit:
        name === 'type'
          ? value === 'Rent'
            ? '/day'
            : value === 'Buy'
            ? 'One-time'
            : 'Free Peer Borrow'
          : prev.priceUnit
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleAddSpec = () => {
    setSpecs((prev) => [...prev, { label: '', value: '' }]);
  };

  const handleRemoveSpec = (index) => {
    setSpecs((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSpecChange = (index, field, value) => {
    setSpecs((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [field]: value } : s))
    );
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError('');
    setIsUploadingFile(true);
    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const userId = user?.id || 'user-001';
      const path = `${userId}/${Date.now()}_listing.${ext}`;
      const result = await storageService.uploadFile('listing-images', path, file);
      setFormData((prev) => ({ ...prev, image: result.publicUrl }));
      setCustomImageUrl(result.publicUrl);
    } catch (err) {
      setUploadError(err.message || 'Image upload failed');
    } finally {
      setIsUploadingFile(false);
    }
  };

  const validate = () => {
    const errs = {};
    if (!formData.title.trim()) errs.title = 'Component / Tool name is required';
    if (!formData.description.trim()) errs.description = 'Please provide a brief description';
    if (!formData.location.trim()) errs.location = 'Pickup location on campus is required';
    if (formData.type !== 'Borrow' && formData.price < 0) errs.price = 'Price cannot be negative';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const finalImage = customImageUrl.trim() || formData.image;
      const validSpecs = specs.filter((s) => s.label.trim() && s.value.trim());

      const createdItem = await addItem({
        ...formData,
        image: finalImage,
        specs: validSpecs
      });

      navigate(`/item/${createdItem.id}`);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Preview object for instant visual feedback
  const previewItem = {
    id: 'preview',
    title: formData.title || 'Component Title Preview',
    category: formData.category,
    type: formData.type,
    price: formData.price || 0,
    priceUnit: formData.priceUnit,
    deposit: formData.deposit || 0,
    condition: formData.condition,
    location: formData.location || 'Block B • Lab Complex',
    image: customImageUrl.trim() || formData.image,
    description: formData.description || 'Description of the hardware component, pin headers, voltage ratings, and accessories included.',
    available: true,
    owner: {
      name: user?.name || 'Arjun Sharma',
      year: user?.year || '3rd Year',
      dept: user?.dept || 'Robotics & Automation',
      rating: user?.trustScore || 4.9,
      swapsCount: user?.totalSwaps || 18,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      verified: true
    }
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col antialiased">
      <TopAppBar showBack={true} />

      <main className="flex-1 w-full max-w-5xl mx-auto p-margin-mobile flex flex-col gap-lg pb-32">
        <div className="flex flex-col gap-1">
          <h2 className="font-heading-xl text-[24px] sm:text-[28px] text-on-surface font-extrabold">
            List Component or Tool
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Make your idle lab gear available for rent, sale, or peer borrow across campus engineering labs.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
          {/* Form Column */}
          <form
            onSubmit={handleSubmit}
            className="lg:col-span-7 bg-surface-container-lowest rounded-[24px] p-6 border border-outline-variant/30 shadow-xs flex flex-col gap-5"
          >
            {/* Title */}
            <div className="flex flex-col gap-1.5">
              <label className="font-label-md text-label-md uppercase font-bold text-on-surface">
                Component / Tool Name *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Arduino Uno R3, ESP32 NodeMCU, NEMA 17 Stepper"
                className={`w-full px-4 py-3 bg-surface-container-low border rounded-[16px] text-body-md text-on-surface focus:outline-none transition-all ${
                  errors.title ? 'border-error ring-1 ring-error' : 'border-outline-variant/30 focus:border-primary'
                }`}
              />
              {errors.title && <span className="text-[11px] font-bold text-error">{errors.title}</span>}
            </div>

            {/* Category & Type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-label-md text-label-md uppercase font-bold text-on-surface">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/30 rounded-[16px] text-body-sm text-on-surface focus:outline-none focus:border-primary"
                >
                  {CATEGORIES.filter((c) => c.id !== 'all').map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-label-md text-label-md uppercase font-bold text-on-surface">
                  Listing Type
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/30 rounded-[16px] text-body-sm text-on-surface focus:outline-none focus:border-primary"
                >
                  <option value="Rent">Rent (Daily / Weekly with Escrow)</option>
                  <option value="Buy">Sell (One-time Purchase)</option>
                  <option value="Borrow">Peer Borrow (Free with Deposit)</option>
                </select>
              </div>
            </div>

            {/* Pricing & Deposit */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-label-md text-label-md uppercase font-bold text-on-surface">
                  {formData.type === 'Rent' ? 'Daily Rental Rate (₹)' : formData.type === 'Buy' ? 'Sale Price (₹)' : 'Borrow Rate (₹)'}
                </label>
                <input
                  type="number"
                  name="price"
                  min="0"
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/30 rounded-[16px] text-body-md text-on-surface focus:outline-none focus:border-primary"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-label-md text-label-md uppercase font-bold text-on-surface">
                  Refundable Escrow Deposit (₹)
                </label>
                <input
                  type="number"
                  name="deposit"
                  min="0"
                  value={formData.deposit}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/30 rounded-[16px] text-body-md text-on-surface focus:outline-none focus:border-primary"
                />
              </div>
            </div>

            {/* Condition & Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-label-md text-label-md uppercase font-bold text-on-surface">
                  Condition
                </label>
                <select
                  name="condition"
                  value={formData.condition}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/30 rounded-[16px] text-body-sm text-on-surface focus:outline-none focus:border-primary"
                >
                  {CONDITIONS.filter((c) => c !== 'All').map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-label-md text-label-md uppercase font-bold text-on-surface">
                  Pickup Location on Campus *
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="e.g. Block B • Electronics Lab 2 / Hostel 4"
                  className={`w-full px-4 py-3 bg-surface-container-low border rounded-[16px] text-body-sm text-on-surface focus:outline-none transition-all ${
                    errors.location ? 'border-error ring-1 ring-error' : 'border-outline-variant/30 focus:border-primary'
                  }`}
                />
                {errors.location && <span className="text-[11px] font-bold text-error">{errors.location}</span>}
              </div>
            </div>

            {/* Image Preset Selector */}
            <div className="flex flex-col gap-2">
              <label className="font-label-md text-label-md uppercase font-bold text-on-surface">
                Select Component Image
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {PRESET_IMAGES.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, image: img.url }));
                      setCustomImageUrl('');
                    }}
                    className={`relative rounded-xl overflow-hidden h-16 border-2 transition-all cursor-pointer ${
                      formData.image === img.url && !customImageUrl
                        ? 'border-primary ring-2 ring-primary/30 scale-[1.02]'
                        : 'border-transparent opacity-75 hover:opacity-100'
                    }`}
                  >
                    <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
                    <span className="absolute inset-x-0 bottom-0 bg-black/60 text-white text-[8px] font-semibold truncate px-1 py-0.5 text-center">
                      {img.label}
                    </span>
                  </button>
                ))}
              </div>

              {/* Upload custom image file to Supabase Storage */}
              <div className="flex flex-col gap-1.5 pt-1">
                <label className="flex items-center justify-center gap-2 px-4 py-2.5 bg-surface-container-high hover:bg-surface-container-highest border border-dashed border-primary/40 rounded-xl cursor-pointer transition-colors text-primary font-bold text-[12px]">
                  <span className="material-symbols-outlined text-[18px]">
                    {isUploadingFile ? 'hourglass_top' : 'upload_file'}
                  </span>
                  <span>{isUploadingFile ? 'Uploading photo to Supabase...' : 'Upload Photo from Device'}</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleFileUpload}
                    disabled={isUploadingFile}
                    className="hidden"
                  />
                </label>
                {uploadError && (
                  <span className="text-[11px] font-bold text-error">{uploadError}</span>
                )}
              </div>

              {/* Custom Image URL fallback */}
              <input
                type="url"
                placeholder="Or paste custom image URL..."
                value={customImageUrl}
                onChange={(e) => setCustomImageUrl(e.target.value)}
                className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant/30 rounded-xl text-[12px] text-on-surface mt-0.5"
              />
            </div>

            {/* Description */}
            <div className="flex flex-col gap-1.5">
              <label className="font-label-md text-label-md uppercase font-bold text-on-surface">
                Description & Accessories Included *
              </label>
              <textarea
                name="description"
                rows="3"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe condition, working notes, pin compatibility, USB cable/accessories included..."
                className={`w-full px-4 py-3 bg-surface-container-low border rounded-[16px] text-body-md text-on-surface focus:outline-none transition-all ${
                  errors.description ? 'border-error ring-1 ring-error' : 'border-outline-variant/30 focus:border-primary'
                }`}
              />
              {errors.description && <span className="text-[11px] font-bold text-error">{errors.description}</span>}
            </div>

            {/* Dynamic Hardware Specifications */}
            <div className="flex flex-col gap-2 pt-2 border-t border-outline-variant/20">
              <div className="flex items-center justify-between">
                <label className="font-label-md text-label-md uppercase font-bold text-on-surface">
                  Technical Specifications (Optional)
                </label>
                <button
                  type="button"
                  onClick={handleAddSpec}
                  className="text-[12px] font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span>
                  Add Spec
                </button>
              </div>

              <div className="flex flex-col gap-2">
                {specs.map((spec, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Spec Name (e.g. Voltage)"
                      value={spec.label}
                      onChange={(e) => handleSpecChange(idx, 'label', e.target.value)}
                      className="w-1/2 p-2 bg-surface-container rounded-xl text-[12px] border border-outline-variant/30"
                    />
                    <input
                      type="text"
                      placeholder="Value (e.g. 5V DC)"
                      value={spec.value}
                      onChange={(e) => handleSpecChange(idx, 'value', e.target.value)}
                      className="w-1/2 p-2 bg-surface-container rounded-xl text-[12px] border border-outline-variant/30"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveSpec(idx)}
                      className="text-on-surface-variant hover:text-error p-1 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              disabled={isSubmitting}
              icon="publish"
              className="mt-2 font-bold shadow-md"
            >
              {isSubmitting ? 'Publishing Component...' : 'Publish to Marketplace'}
            </Button>
          </form>

          {/* Live Preview Column */}
          <div className="lg:col-span-5 flex flex-col gap-3 sticky top-20">
            <div className="flex items-center justify-between">
              <span className="font-label-md text-label-md uppercase font-bold text-outline tracking-wider">
                Live Card Preview
              </span>
              <span className="text-[11px] text-primary font-semibold">Real-time update</span>
            </div>
            <ListingCard item={previewItem} />
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
