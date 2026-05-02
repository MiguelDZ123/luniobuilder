"use client";

import React, { useEffect, useRef } from 'react';
import { Copy, Trash2, Eye, EyeOff, Lock, Unlock } from 'lucide-react';

interface ContextMenuProps {
  x: number;
  y: number;
  elementId: string;
  onClose: () => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onToggleVisibility: (id: string) => void;
  onToggleLock: (id: string) => void;
  isHidden: boolean;
  isLocked: boolean;
}

export const ContextMenu: React.FC<ContextMenuProps> = ({
  x, y, elementId, onClose,
  onDelete, onDuplicate, onToggleVisibility, onToggleLock,
  isHidden, isLocked,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const menuItems = [
    {
      label: 'Duplicate',
      icon: <Copy size={12} />,
      action: () => { onDuplicate(elementId); onClose(); },
    },
    {
      label: isHidden ? 'Show' : 'Hide',
      icon: isHidden ? <Eye size={12} /> : <EyeOff size={12} />,
      action: () => { onToggleVisibility(elementId); onClose(); },
    },
    {
      label: isLocked ? 'Unlock' : 'Lock',
      icon: isLocked ? <Unlock size={12} /> : <Lock size={12} />,
      action: () => { onToggleLock(elementId); onClose(); },
    },
    { divider: true },
    {
      label: 'Delete',
      icon: <Trash2 size={12} />,
      action: () => { onDelete(elementId); onClose(); },
      danger: true,
    },
  ];

  return (
    <div
      ref={ref}
      className="fixed bg-gray-900 border border-gray-700 rounded-xl shadow-2xl py-1.5 z-999 min-w-36"
      style={{ left: x, top: y }}
    >
      {menuItems.map((item, i) =>
        'divider' in item ? (
          <div key={i} className="border-t border-gray-800 my-1" />
        ) : (
          <button
            key={i}
            onClick={item.action}
            className={`w-full flex items-center gap-2.5 px-3 py-1.5 text-xs transition-colors ${
              item.danger
                ? 'text-red-400 hover:text-red-300 hover:bg-red-900/20'
                : 'text-gray-300 hover:text-white hover:bg-gray-800'
            }`}
          >
            {item.icon}
            {item.label}
          </button>
        )
      )}
    </div>
  );
};
