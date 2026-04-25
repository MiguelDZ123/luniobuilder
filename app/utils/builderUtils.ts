import { BuilderElement, ElementType, StyleProperties, ResponsiveStyles } from '../types/builder';

export const generateId = (): string => {
  return `el-${Math.random().toString(36).substr(2, 9)}`;
};

export const deepClone = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};

const emptyStyles = (): ResponsiveStyles => ({
  desktop: {},
  tablet: {},
  mobile: {},
});

export const createDefaultElement = (
  type: ElementType,
  id: string,
  parentId: string | null
): BuilderElement => {
  const defaults = getElementDefaults(type);
  return {
    id,
    type,
    name: defaults.name,
    props: defaults.props,
    styles: {
      desktop: defaults.styles,
      tablet: {},
      mobile: {},
    },
    children: defaults.children || [],
    parentId,
    locked: false,
    hidden: false,
  };
};

interface ElementDefaults {
  name: string;
  props: BuilderElement['props'];
  styles: StyleProperties;
  children?: BuilderElement[];
}

export const getElementDefaults = (type: ElementType): ElementDefaults => {
  switch (type) {
    case 'section':
      return {
        name: 'Section',
        props: {},
        styles: {
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          minHeight: '200px',
          padding: '60px 40px',
          backgroundColor: '#ffffff',
        },
      };
    case 'div':
      return {
        name: 'Container',
        props: {},
        styles: {
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          padding: '16px',
        },
      };
    case 'heading':
      return {
        name: 'Heading',
        props: { text: 'Beautiful Heading', level: 1 },
        styles: {
          display: 'flex',
          fontSize: '48px',
          fontWeight: '700',
          lineHeight: '1.2',
          color: '#111827',
          marginBottom: '16px',
        },
      };
    case 'paragraph':
      return {
        name: 'Paragraph',
        props: { text: 'Add your text content here. Click to edit.' },
        styles: {
          display: 'flex',
          fontSize: '16px',
          lineHeight: '1.6',
          color: '#6b7280',
          marginBottom: '16px',
        },
      };
    case 'button':
      return {
        name: 'Button',
        props: { text: 'Click Me', href: '#' },
        styles: {
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '12px 28px',
          backgroundColor: '#2563eb',
          color: '#ffffff',
          fontSize: '16px',
          fontWeight: '600',
          borderRadius: '8px',
          cursor: 'pointer',
          border: 'none',
          transition: 'all 0.2s ease',
        },
      };
    case 'image':
      return {
        name: 'Image',
        props: {
          src: 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=800',
          alt: 'Image',
        },
        styles: {
          width: '100%',
          height: 'auto',
          display: 'block',
          borderRadius: '8px',
        },
      };
    case 'navbar':
      return {
        name: 'Navigation',
        props: {},
        styles: {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          padding: '16px 40px',
          backgroundColor: '#ffffff',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          position: 'relative',
          zIndex: '100',
        },
      };
    case 'hero':
      return {
        name: 'Hero',
        props: {},
        styles: {
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          minHeight: '600px',
          padding: '100px 40px',
          backgroundColor: '#f8fafc',
          textAlign: 'center',
        },
      };
    case 'card':
      return {
        name: 'Card',
        props: {},
        styles: {
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -1px rgba(0,0,0,0.04)',
          overflow: 'hidden',
        },
      };
    case 'grid':
      return {
        name: 'Grid',
        props: { columns: 3 },
        styles: {
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '24px',
          width: '100%',
          padding: '16px',
        },
      };
    case 'columns':
      return {
        name: 'Columns',
        props: { columns: 2 },
        styles: {
          display: 'flex',
          gap: '24px',
          width: '100%',
        },
      };
    case 'form':
      return {
        name: 'Form',
        props: {},
        styles: {
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          width: '100%',
          maxWidth: '480px',
          padding: '32px',
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.07)',
        },
      };
    case 'input':
      return {
        name: 'Input',
        props: { placeholder: 'Enter text...', type: 'text', label: 'Label' },
        styles: {
          display: 'flex',
          width: '100%',
          padding: '10px 14px',
          fontSize: '14px',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          color: '#111827',
          backgroundColor: '#ffffff',
          outline: 'none',
        },
      };
    case 'textarea':
      return {
        name: 'Textarea',
        props: { placeholder: 'Enter text...', label: 'Message' },
        styles: {
          width: '100%',
          padding: '10px 14px',
          fontSize: '14px',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          color: '#111827',
          backgroundColor: '#ffffff',
          minHeight: '120px',
          resize: 'vertical' as unknown as string,
          outline: 'none',
        },
      };
    case 'video':
      return {
        name: 'Video',
        props: { src: 'https://www.w3schools.com/html/mov_bbb.mp4' },
        styles: {
          width: '100%',
          borderRadius: '8px',
        },
      };
    case 'divider':
      return {
        name: 'Divider',
        props: {},
        styles: {
          width: '100%',
          borderBottom: '1px solid #e5e7eb',
          marginTop: '16px',
          marginBottom: '16px',
        },
      };
    case 'spacer':
      return {
        name: 'Spacer',
        props: {},
        styles: {
          height: '48px',
          width: '100%',
        },
      };
    case 'icon':
      return {
        name: 'Icon',
        props: { iconName: 'Star' },
        styles: {
          color: '#2563eb',
          width: '32px',
          height: '32px',
        },
      };
    case 'list':
      return {
        name: 'List',
        props: {},
        styles: {
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          padding: '0',
          listStyle: 'none' as unknown as string,
        },
      };
    case 'listItem':
      return {
        name: 'List Item',
        props: { text: 'List item text' },
        styles: {
          fontSize: '16px',
          color: '#374151',
          padding: '4px 0',
        },
      };
    case 'link':
      return {
        name: 'Link',
        props: { text: 'Click here', href: '#' },
        styles: {
          color: '#2563eb',
          fontSize: '16px',
          textDecoration: 'underline',
          cursor: 'pointer',
        },
      };
    default:
      return {
        name: type,
        props: {},
        styles: { display: 'block' },
      };
  }
};

export const getEffectiveStyles = (
  element: BuilderElement,
  breakpoint: 'desktop' | 'tablet' | 'mobile'
): StyleProperties => {
  const desktop = element.styles.desktop || {};
  const tablet = element.styles.tablet || {};
  const mobile = element.styles.mobile || {};

  if (breakpoint === 'desktop') return desktop;
  if (breakpoint === 'tablet') return { ...desktop, ...tablet };
  return { ...desktop, ...tablet, ...mobile };
};

export const stylesToCSS = (styles: StyleProperties): React.CSSProperties => {
  return styles as React.CSSProperties;
};

import React from 'react';

export const canHaveChildren = (type: ElementType): boolean => {
  return ['section', 'div', 'navbar', 'hero', 'card', 'grid', 'columns', 'form', 'list'].includes(type);
};

export const COMPONENT_CATEGORIES = {
  Layout: ['section', 'div', 'hero', 'navbar', 'columns', 'grid', 'card'],
  Typography: ['heading', 'paragraph', 'link', 'list', 'listItem'],
  Media: ['image', 'video', 'icon'],
  Forms: ['form', 'input', 'textarea', 'button'],
  Misc: ['divider', 'spacer'],
} as const;

export const COMPONENT_LABELS: Record<ElementType, string> = {
  section: 'Section',
  div: 'Container',
  heading: 'Heading',
  paragraph: 'Paragraph',
  button: 'Button',
  image: 'Image',
  link: 'Link',
  navbar: 'Navbar',
  hero: 'Hero',
  card: 'Card',
  grid: 'Grid',
  columns: 'Columns',
  form: 'Form',
  input: 'Input',
  textarea: 'Textarea',
  video: 'Video',
  divider: 'Divider',
  spacer: 'Spacer',
  icon: 'Icon',
  list: 'List',
  listItem: 'List Item',
};

export { emptyStyles };
