import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';

export function InvitePartnerModal({ partner, isOpen, onClose, onConfirmInvite }) {
  const [projectTitle, setProjectTitle] = useState('Obstacle Avoiding Autonomous Robot');
  const [role, setRole] = useState('CAD & Mechanical Lead');
  const [message, setMessage] = useState('');

  if (!partner) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onConfirmInvite) {
      onConfirmInvite({
        recipientId: partner.id,
        recipientName: partner.name,
        projectTitle,
        role,
        message
      });
    }
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Invite ${partner.name}`}
      subtitle={`${partner.dept} • Skills: ${partner.skills.slice(0, 3).join(', ')}`}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
            Target Project *
          </label>
          <input
            type="text"
            required
            value={projectTitle}
            onChange={(e) => setProjectTitle(e.target.value)}
            className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/30 text-body-sm text-on-surface font-semibold"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
            Proposed Role on Team *
          </label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/30 text-body-sm text-on-surface"
          >
            <option value="CAD & Mechanical Lead">CAD & Mechanical Lead</option>
            <option value="Firmware & Microcontroller Developer">Firmware & Microcontroller Developer</option>
            <option value="IoT & Cloud Telemetry Lead">IoT & Cloud Telemetry Lead</option>
            <option value="Computer Vision & Edge AI Engineer">Computer Vision & Edge AI Engineer</option>
            <option value="PCB Designer & Electronics Lead">PCB Designer & Electronics Lead</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
            Personal Invitation Note (Optional)
          </label>
          <textarea
            rows="2"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="e.g. We loved your CAD chassis projects and would love your help on our robotics rover team!"
            className="p-3 bg-surface-container-low rounded-xl border border-outline-variant/30 text-body-sm text-on-surface"
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          icon="send"
          className="font-bold"
        >
          Send Project Invitation
        </Button>
      </form>
    </Modal>
  );
}
