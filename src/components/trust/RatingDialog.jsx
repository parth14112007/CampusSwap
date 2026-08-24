import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';

export function RatingDialog({
  isOpen,
  onClose,
  transactionTitle = 'Hardware Exchange',
  otherPartyName = 'Student',
  onSubmitRating
}) {
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('');
  const [categories, setCategories] = useState({
    communication: 5,
    itemCondition: 5,
    timeliness: 5,
    overall: 5
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSubmitRating) {
      onSubmitRating({ rating, categories, feedback });
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Rate this Exchange"
      subtitle={`${transactionTitle} with ${otherPartyName}`}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Star Selector */}
        <div className="flex flex-col items-center gap-2 py-2">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="text-amber-500 hover:scale-110 transition-transform cursor-pointer p-1"
              >
                <span
                  className="material-symbols-outlined text-[32px]"
                  style={{ fontVariationSettings: star <= rating ? "'FILL' 1" : "'FILL' 0" }}
                >
                  star
                </span>
              </button>
            ))}
          </div>
          <span className="text-[13px] font-bold text-on-surface">
            {rating === 5 ? 'Excellent 🌟' : rating === 4 ? 'Very Good 👍' : rating === 3 ? 'Satisfactory 👌' : 'Needs Improvement'}
          </span>
        </div>

        {/* Category Ratings */}
        <div className="grid grid-cols-2 gap-2 bg-surface-container p-3 rounded-2xl border border-outline-variant/30 text-body-sm">
          <div className="flex items-center justify-between">
            <span className="text-[12px] text-on-surface-variant">Communication</span>
            <span className="font-bold text-primary">★ {categories.communication}.0</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[12px] text-on-surface-variant">Item Condition</span>
            <span className="font-bold text-primary">★ {categories.itemCondition}.0</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[12px] text-on-surface-variant">Timeliness</span>
            <span className="font-bold text-primary">★ {categories.timeliness}.0</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[12px] text-on-surface-variant">Overall Experience</span>
            <span className="font-bold text-primary">★ {categories.overall}.0</span>
          </div>
        </div>

        {/* Optional Feedback */}
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
            Optional Feedback for Student Profile
          </label>
          <textarea
            rows={2}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="e.g. Prompt handover, hardware worked cleanly with no issues..."
            className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/30 text-body-sm text-on-surface focus:outline-none focus:border-primary"
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          icon="check_circle"
        >
          Submit Review & Update Trust Score
        </Button>
      </form>
    </Modal>
  );
}
