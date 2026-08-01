import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './ui';

export const ConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  loading = false,
}) => (
  <Modal
    open={open}
    onClose={onClose}
    size="sm"
    footer={
      <>
        <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
          {cancelLabel}
        </Button>
        <Button
          type="button"
          variant={variant === 'danger' ? 'danger' : 'primary'}
          onClick={onConfirm}
          disabled={loading}
        >
          {loading ? 'Please wait…' : confirmLabel}
        </Button>
      </>
    }
  >
    <div className="flex items-start gap-3">
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
          variant === 'danger' ? 'bg-red-100 text-red-600' : 'bg-primary/10 text-primary-dark'
        }`}
      >
        <AlertTriangle className="w-5 h-5" />
      </div>
      <div>
        <h3 className="text-base font-semibold text-slate-800">{title}</h3>
        {description && <p className="text-sm text-slate-500 mt-1">{description}</p>}
      </div>
    </div>
  </Modal>
);
