import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { CATEGORIES, CAMPUS_LOCATIONS, AVAILABILITY_STATES } from '../../data/mockData';

const PRESET_IMAGES = [
  { label: 'Microcontroller', url: 'https://images.unsplash.com/photo-1553406830-ef2513450d76?auto=format&fit=crop&w=600&q=80' },
  { label: 'IoT & Wireless', url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80' },
  { label: 'Embedded / SBC', url: 'https://images.unsplash.com/photo-1629654297299-c8506221ca97?auto=format&fit=crop&w=600&q=80' },
  { label: 'Sensors', url: 'https://images.unsplash.com/photo-1563770660941-20978e870e26?auto=format&fit=crop&w=600&q=80' },
  { label: 'Motors / Steppers', url: 'https://images.unsplash.com/photo-1581092334651-ddf26d9a09d0?auto=format&fit=crop&w=600&q=80' },
  { label: 'Lab Testing / Scope', url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80' },
  { label: 'Tools / Soldering', url: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=600&q=80' }
];

export function AddResourceModal({ isOpen, onClose, onAddResource }) {
  const [formData, setFormData] = useState({
    name: '',
    category: 'Arduino & Microcontrollers',
    locationId: CAMPUS_LOCATIONS[0].id,
    room: 'Room 102',
    availability: 'AVAILABLE',
    type: 'Borrow',
    totalStock: 5,
    availableStock: 5,
    description: '',
    image: PRESET_IMAGES[0].url
  });

  const [specs, setSpecs] = useState([
    { label: 'Operating Voltage', value: '5V DC' }
  ]);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'totalStock' || name === 'availableStock' ? Number(value) : value
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleAddSpec = () => {
    setSpecs((prev) => [...prev, { label: '', value: '' }]);
  };

  const handleRemoveSpec = (idx) => {
    setSpecs((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSpecChange = (idx, field, val) => {
    setSpecs((prev) => prev.map((s, i) => (i === idx ? { ...s, [field]: val } : s)));
  };

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Resource name is required';
    if (!formData.room.trim()) errs.room = 'Room / Lab code is required';
    if (!formData.description.trim()) errs.description = 'Please describe the hardware resource';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const validSpecs = specs.filter((s) => s.label.trim() && s.value.trim());
      await onAddResource({
        ...formData,
        specs: validSpecs
      });
      onClose();
    } catch (err) {
      console.error('Failed to submit campus resource', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Campus Resource"
      subtitle="Register lab-owned or department-shared equipment"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Name */}
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface">
            Hardware Resource Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. Raspberry Pi 4 Model B, Tektronix DSO..."
            className={`p-3 bg-surface-container rounded-xl border text-body-sm text-on-surface ${
              errors.name ? 'border-error ring-1 ring-error' : 'border-outline-variant/30'
            }`}
          />
          {errors.name && <span className="text-[11px] font-bold text-error">{errors.name}</span>}
        </div>

        {/* Category & Location */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface">
              Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="p-3 bg-surface-container rounded-xl border border-outline-variant/30 text-body-sm text-on-surface"
            >
              {CATEGORIES.filter((c) => c.id !== 'all').map((c) => (
                <option key={c.id} value={c.label}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface">
              Campus Building / Location
            </label>
            <select
              name="locationId"
              value={formData.locationId}
              onChange={handleChange}
              className="p-3 bg-surface-container rounded-xl border border-outline-variant/30 text-body-sm text-on-surface"
            >
              {CAMPUS_LOCATIONS.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.buildingName} ({loc.roomNumber})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Room & Availability State */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface">
              Specific Room / Lab Bench *
            </label>
            <input
              type="text"
              name="room"
              value={formData.room}
              onChange={handleChange}
              placeholder="e.g. B-204 (Bench 2)"
              className="p-3 bg-surface-container rounded-xl border border-outline-variant/30 text-body-sm text-on-surface"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface">
              Initial Availability State
            </label>
            <select
              name="availability"
              value={formData.availability}
              onChange={handleChange}
              className="p-3 bg-surface-container rounded-xl border border-outline-variant/30 text-body-sm text-on-surface"
            >
              {AVAILABILITY_STATES.filter((a) => a.id !== 'ALL').map((a) => (
                <option key={a.id} value={a.id}>
                  {a.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Stock & Resource Type */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface">
              Available Units
            </label>
            <input
              type="number"
              name="availableStock"
              min="0"
              max="100"
              value={formData.availableStock}
              onChange={handleChange}
              className="p-3 bg-surface-container rounded-xl border border-outline-variant/30 text-body-sm text-on-surface"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface">
              Resource Access Type
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="p-3 bg-surface-container rounded-xl border border-outline-variant/30 text-body-sm text-on-surface"
            >
              <option value="Borrow">Borrow (Peer / Lab Sharing)</option>
              <option value="Lab Access">Lab Access Only</option>
              <option value="Rent">Rent (Escrow Backed)</option>
            </select>
          </div>
        </div>

        {/* Image Picker */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface">
            Choose Hardware Photo
          </label>
          <div className="grid grid-cols-4 gap-2">
            {PRESET_IMAGES.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, image: img.url }))}
                className={`relative rounded-xl overflow-hidden h-14 border-2 transition-all cursor-pointer ${
                  formData.image === img.url
                    ? 'border-primary ring-2 ring-primary/30 scale-[1.02]'
                    : 'border-transparent opacity-75 hover:opacity-100'
                }`}
              >
                <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
                <span className="absolute inset-x-0 bottom-0 bg-black/60 text-white text-[8px] truncate px-1 py-0.5 text-center">
                  {img.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface">
            Description & Lab Context *
          </label>
          <textarea
            name="description"
            rows="2"
            value={formData.description}
            onChange={handleChange}
            placeholder="Specify laboratory authorization rules, cables included, and operating conditions..."
            className="p-3 bg-surface-container rounded-xl border border-outline-variant/30 text-body-sm text-on-surface"
          />
          {errors.description && <span className="text-[11px] font-bold text-error">{errors.description}</span>}
        </div>

        {/* Dynamic Specifications */}
        <div className="flex flex-col gap-2 pt-2 border-t border-outline-variant/20">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface">
              Hardware Specs (Optional)
            </span>
            <button
              type="button"
              onClick={handleAddSpec}
              className="text-[11px] font-bold text-primary hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[14px]">add</span> Add Spec
            </button>
          </div>

          <div className="flex flex-col gap-2">
            {specs.map((s, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Spec name"
                  value={s.label}
                  onChange={(e) => handleSpecChange(idx, 'label', e.target.value)}
                  className="w-1/2 p-2 bg-surface-container rounded-xl text-[12px] border border-outline-variant/30"
                />
                <input
                  type="text"
                  placeholder="Value"
                  value={s.value}
                  onChange={(e) => handleSpecChange(idx, 'value', e.target.value)}
                  className="w-1/2 p-2 bg-surface-container rounded-xl text-[12px] border border-outline-variant/30"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveSpec(idx)}
                  className="text-on-surface-variant hover:text-error p-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">delete</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button type="button" variant="secondary" fullWidth onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            fullWidth
            disabled={isSubmitting}
            icon="add_circle"
            className="font-bold shadow-md"
          >
            {isSubmitting ? 'Registering...' : 'Add Campus Resource'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
