"use client";

import React, { JSX, useEffect, useRef, useState } from 'react';
import { BuilderElement, ElementType } from '../../types/builder';
import { useBuilderStore } from '../../stores/builderStore';
import { canHaveChildren, getEffectiveStyles, stylesToCSS } from '../../utils/builderUtils';
import * as LucideIcons from 'lucide-react';

interface ElementRendererProps {
  element: BuilderElement;
  isPreview?: boolean;
}

export const ElementRenderer: React.FC<ElementRendererProps> = ({ element, isPreview = false }) => {
  const {
    selectedElementId,
    hoveredElementId,
    draggedElementId,
    dropTargetId,
    dropPosition,
    breakpoint,
    selectElement,
    hoverElement,
    setDraggedElementId,
    setDropTarget,
    moveElement,
    addElementFromPalette,
    updateElementProps,
    pushHistory,
  } = useBuilderStore();

  const [isEditing, setIsEditing] = useState(false);
  const [editingValue, setEditingValue] = useState(element.props.text || '');
  const ref = useRef<HTMLDivElement>(null);

  const styles = getEffectiveStyles(element, breakpoint);
  const cssStyles = stylesToCSS(styles);
  const safeCssStyles: React.CSSProperties = {
    ...cssStyles,
    boxSizing: 'border-box',
    maxWidth: '100%',
    minWidth: 0,
  };
  const safeTextStyles: React.CSSProperties = {
    ...safeCssStyles,
    overflowWrap: 'break-word',
    wordBreak: 'break-word',
  };
  const editingInputStyles: React.CSSProperties = {
    ...safeTextStyles,
    ...cssStyles,
    display: 'inline-flex',
    width: cssStyles.width || 'auto',
    minWidth: 0,
  };

  if (element.hidden && !isPreview) {
    return (
      <div
        style={{ ...safeCssStyles, opacity: 0.3, outline: '1px dashed #d1d5db' }}
        className="relative"
      >
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 text-gray-400 text-xs">
          Hidden: {element.name}
        </div>
      </div>
    );
  }

  const isSelected = selectedElementId === element.id;
  const isHovered = hoveredElementId === element.id;
  const isDropTarget = dropTargetId === element.id;

  const handleClick = (e: React.MouseEvent) => {
    if (isPreview) return;
    e.stopPropagation();
    selectElement(element.id);
  };

  const handleMouseEnter = (e: React.MouseEvent) => {
    if (isPreview) return;
    e.stopPropagation();
    hoverElement(element.id);
  };

  const handleMouseLeave = () => {
    if (isPreview) return;
    hoverElement(null);
  };

  const handleDragStart = (e: React.DragEvent) => {
    if (isPreview || element.locked) return;
    e.stopPropagation();
    e.dataTransfer.setData('elementId', element.id);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedElementId(element.id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (isPreview) return;
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';

    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;

    const y = e.clientY - rect.top;
    const height = rect.height;

    if (canHaveChildren(element.type) && y > height * 0.25 && y < height * 0.75) {
      setDropTarget(element.id, 'inside');
    } else if (y < height / 2) {
      setDropTarget(element.id, 'before');
    } else {
      setDropTarget(element.id, 'after');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    if (isPreview) return;
    e.preventDefault();
    e.stopPropagation();

    const elementId = e.dataTransfer.getData('elementId');
    const elementType = e.dataTransfer.getData('elementType') as ElementType;

    if (elementId && elementId !== element.id) {
      moveElement(elementId, element.id, dropPosition || 'after');
    } else if (elementType) {
      addElementFromPalette(elementType, element.id, dropPosition || 'after');
    }

    setDropTarget(null, null);
    setDraggedElementId(null);
  };

  const handleDragEnd = () => {
    setDraggedElementId(null);
    setDropTarget(null, null);
  };

  useEffect(() => {
    if (!isEditing) {
      setEditingValue(element.props.text || '');
    }
  }, [element.props.text, isEditing]);

  const isTextEditableType = (type: ElementType) => [
    'heading',
    'paragraph',
    'button',
    'link',
    'listItem',
  ].includes(type);

  const commitTextEdit = () => {
    setIsEditing(false);
    updateElementProps(element.id, { text: editingValue });
    pushHistory();
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    if (isPreview || element.locked || !isTextEditableType(element.type)) return;
    e.stopPropagation();
    selectElement(element.id);
    setIsEditing(true);
  };

  const handleEditKeyDown = (e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && element.type !== 'paragraph') {
      e.preventDefault();
      commitTextEdit();
    }

    if (e.key === 'Escape') {
      setIsEditing(false);
      setEditingValue(element.props.text || '');
    }
  };

  const wrapperClasses = isPreview ? '' : [
    'relative',
    'outline-none',
    isSelected ? 'ring-2 ring-blue-500 ring-inset' : '',
    isHovered && !isSelected ? 'ring-1 ring-blue-300 ring-inset' : '',
    isDropTarget && dropPosition === 'inside' ? 'ring-2 ring-green-400 ring-inset bg-green-50/20' : '',
    draggedElementId === element.id ? 'opacity-40' : '',
  ].filter(Boolean).join(' ');

  const dropIndicatorBefore = !isPreview && isDropTarget && dropPosition === 'before';
  const dropIndicatorAfter = !isPreview && isDropTarget && dropPosition === 'after';

  const renderContent = () => {
    switch (element.type) {
      case 'heading': {
        const Tag = `h${element.props.level || 1}` as keyof JSX.IntrinsicElements;
        return isEditing ? (
          <input
            autoFocus
            value={editingValue}
            onChange={e => setEditingValue(e.target.value)}
            onBlur={commitTextEdit}
            onKeyDown={handleEditKeyDown}
            style={editingInputStyles}
            className="outline-none"
          />
        ) : (
          <Tag
            style={safeTextStyles}
            onClick={handleClick}
            onDoubleClick={handleDoubleClick}
            className={isPreview ? '' : 'cursor-pointer select-none'}
          >
            {element.props.text || 'Heading'}
          </Tag>
        );
      }

      case 'paragraph':
        return isEditing ? (
          <textarea
            autoFocus
            value={editingValue}
            onChange={e => setEditingValue(e.target.value)}
            onBlur={commitTextEdit}
            onKeyDown={handleEditKeyDown}
            style={{ ...editingInputStyles, display: 'block', width: '100%' }}
            className="border border-blue-300 focus:ring-2 focus:ring-blue-400 rounded px-2 py-1"
          />
        ) : (
          <p
            style={safeTextStyles}
            onClick={handleClick}
            onDoubleClick={handleDoubleClick}
            className={isPreview ? '' : 'cursor-pointer select-none'}
          >
            {element.props.text || 'Paragraph text'}
          </p>
        );

      case 'button':
        return isEditing ? (
          <input
            autoFocus
            value={editingValue}
            onChange={e => setEditingValue(e.target.value)}
            onBlur={commitTextEdit}
            onKeyDown={handleEditKeyDown}
            style={editingInputStyles}
            className="border outline-none border-blue-300 focus:ring-blue-400 rounded px-2 py-1"
          />
        ) : (
          <button
            style={safeCssStyles}
            onClick={handleClick}
            onDoubleClick={handleDoubleClick}
            className={isPreview ? 'hover:opacity-90' : 'cursor-pointer'}
          >
            {element.props.text || 'Button'}
          </button>
        );

      case 'link':
        return isEditing ? (
          <input
            autoFocus
            value={editingValue}
            onChange={e => setEditingValue(e.target.value)}
            onBlur={commitTextEdit}
            onKeyDown={handleEditKeyDown}
            style={{ ...editingInputStyles, width: 'auto' }}
            className="border border-blue-300 focus:ring-2 focus:ring-blue-400 rounded px-2 py-1"
          />
        ) : (
          <a
            href={isPreview ? element.props.href : undefined}
            style={safeTextStyles}
            onClick={handleClick}
            onDoubleClick={handleDoubleClick}
            className={isPreview ? '' : 'cursor-pointer select-none'}
          >
            {element.props.text || 'Link'}
          </a>
        );

      case 'image':
        return (
          <img
            src={element.props.src}
            alt={element.props.alt || ''}
            style={{ ...safeCssStyles, maxWidth: '100%', height: 'auto' }}
            onClick={handleClick}
            className={isPreview ? '' : 'cursor-pointer'}
            draggable={false}
          />
        );

      case 'video':
        return (
          <video
            src={element.props.src}
            style={{ ...safeCssStyles, maxWidth: '100%', height: 'auto' }}
            controls={element.props.controls}
            onClick={handleClick}
            autoPlay={element.props.autoPlay}
            muted={element.props.muted}
            loop={element.props.autoPlay}
          />
        );

      case 'iframe':
        return (
          <iframe
            src={element.props.src}
            style={{ ...safeCssStyles, width: '100%', height: '100%', border: 'none' }}
            onClick={handleClick}
          />
        );

      case 'divider':
        return <hr style={safeCssStyles} onClick={handleClick} />;

      case 'spacer':
        return (
          <div
            style={safeCssStyles}
            onClick={handleClick}
            className={isPreview ? '' : 'border-dashed border border-gray-200 flex items-center justify-center text-xs text-gray-400'}
          >
            {!isPreview && 'spacer'}
          </div>
        );

      case 'input':
        return (
          <div style={{ width: '100%' }} onClick={handleClick} className={isPreview ? '' : 'cursor-pointer'}>
            {element.props.label && (
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                {element.props.label}
              </label>
            )}
            <input
              type={element.props.type || 'text'}
              placeholder={element.props.placeholder}
              style={safeCssStyles}
              readOnly={!isPreview}
            />
          </div>
        );

      case 'textarea':
        return (
          <div style={{ width: '100%' }} onClick={handleClick} className={isPreview ? '' : 'cursor-pointer'}>
            {element.props.label && (
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '6px' }}>
                {element.props.label}
              </label>
            )}
            <textarea
              placeholder={element.props.placeholder}
              style={safeCssStyles}
              readOnly={!isPreview}
            />
          </div>
        );

      case 'icon': {
        const iconName = (element.props.iconName as string) || 'Star';
        const IconComp = (LucideIcons as unknown as Record<string, React.ComponentType<{ style?: React.CSSProperties; onClick?: (e: React.MouseEvent) => void }>>)[iconName];
        if (!IconComp) return <div style={safeCssStyles} onClick={handleClick}>?</div>;
        return <IconComp style={safeCssStyles} onClick={handleClick} />;
      }

      case 'listItem':
        return isEditing ? (
          <input
            autoFocus
            value={editingValue}
            onChange={e => setEditingValue(e.target.value)}
            onBlur={commitTextEdit}
            onKeyDown={handleEditKeyDown}
            style={{ ...editingInputStyles, width: 'auto' }}
            className="border border-blue-300 focus:ring-2 focus:ring-blue-400 rounded px-2 py-1"
          />
        ) : (
          <li
            style={safeTextStyles}
            onClick={handleClick}
            onDoubleClick={handleDoubleClick}
            className={isPreview ? '' : 'cursor-pointer select-none'}
          >
            {element.props.text || 'List item'}
          </li>
        );

      default:
        return null;
    }
  };

  if (!canHaveChildren(element.type)) {
    const content = renderContent();
    if (!isPreview) {
      return (
        <div
          ref={ref}
          className={wrapperClasses}
          draggable={!element.locked && !isEditing}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onDragEnd={handleDragEnd}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {dropIndicatorBefore && <div className="absolute top-0 left-0 right-0 h-0.5 bg-blue-500 z-50" />}
          {content}
          {isSelected && !element.locked && (
            <div className="absolute -top-5 left-0 bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-t-sm whitespace-nowrap z-50 pointer-events-none">
              {element.name}
            </div>
          )}
          {dropIndicatorAfter && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 z-50" />}
        </div>
      );
    }
    return <>{content}</>;
  }

  // Container elements
  const containerStyle: React.CSSProperties = safeCssStyles;

  const renderChildren = () => (
    <>
      {element.children.map(child => (
        <ElementRenderer key={child.id} element={child} isPreview={isPreview} />
      ))}
      {!isPreview && element.children.length === 0 && (
        <div className="w-full py-8 flex items-center justify-center text-gray-300 text-sm border-2 border-dashed border-gray-200 rounded-lg pointer-events-none">
          Drop elements here
        </div>
      )}
    </>
  );

  const containerElement = (() => {
    switch (element.type) {
      case 'list':
        return (
          <ul style={containerStyle} onClick={handleClick} className={isPreview ? '' : 'cursor-pointer'}>
            {renderChildren()}
          </ul>
        );
      case 'navbar':
        return (
          <nav style={containerStyle} onClick={handleClick} className={isPreview ? '' : 'cursor-pointer'}>
            {renderChildren()}
          </nav>
        );
      case 'form':
        return (
          <form style={containerStyle} onClick={handleClick} onSubmit={e => e.preventDefault()} className={isPreview ? '' : 'cursor-pointer'}>
            {renderChildren()}
          </form>
        );
      default:
        return (
          <div style={containerStyle} onClick={handleClick} className={isPreview ? '' : 'cursor-pointer'}>
            {renderChildren()}
          </div>
        );
    }
  })();

  if (isPreview) return containerElement;

  return (
    <div
      ref={ref}
      className={wrapperClasses}
      draggable={!element.locked}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onDragEnd={handleDragEnd}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {dropIndicatorBefore && <div className="absolute top-0 left-0 right-0 h-0.5 bg-blue-500 z-50" />}
      {containerElement}
      {isSelected && !element.locked && (
        <div className="absolute -top-5 left-0 bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-t-sm whitespace-nowrap z-50 pointer-events-none">
          {element.name}
        </div>
      )}
      {dropIndicatorAfter && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 z-50" />}
    </div>
  );
};
