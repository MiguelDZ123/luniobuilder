import { BuilderElement, ElementType, StyleProperties, ResponsiveStyles, Page } from '../types/builder';

export const generateId = (): string => {
  return `el-${Math.random().toString(36).substr(2, 9)}`;
};

export const deepClone = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};

const emptyStyles = (): ResponsiveStyles => ({
  widescreen: {},
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
      widescreen: {},
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
          paddingTop: '40px',
          paddingBottom: '40px',
          paddingLeft: '20px',
          paddingRight: '20px',
          backgroundColor: '#ffffff',
        },
      };
    case 'div':
      return {
        name: 'Container',
        props: {},
        styles: {
          display: 'block',
          flexDirection: 'column',
          width: '100%',
          paddingTop: '20px',
          paddingBottom: '20px',
          paddingLeft: '20px',
          paddingRight: '20px',
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
          paddingTop: '12px',
          paddingRight: '28px',
          paddingBottom: '12px',
          paddingLeft: '28px',
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
          paddingBottom: '16px',
          paddingTop: '16px',
          paddingLeft: '20px',
          paddingRight: '20px',
          backgroundColor: '#ffffff',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          position: 'relative',
          zIndex: '100',
        },
        children: [
          {
            id: generateId(),
            type: 'heading',
            name: 'Nav Link',
            props: { text: 'MyLogo', level: 1 },
            styles: emptyStyles(),
            children: [],
            parentId: null,
            locked: false,
            hidden: false,
          },
          {
            id: generateId(),
            type: 'list',
            name: 'Nav Link',
            props: {},
            styles: emptyStyles(),
            children: [
              {
                id: generateId(),
                type: 'listItem',
                name: 'Nav Item',
                props: { text: 'Home', href: '#' },
                styles: emptyStyles(),
                children: [],
                parentId: null,
                locked: false,
                hidden: false,
              },
              {
                id: generateId(),
                type: 'listItem',
                name: 'Nav Item',
                props: { text: 'Services', href: '#' },
                styles: emptyStyles(),
                children: [],
                parentId: null,
                locked: false,
                hidden: false,
              }
            ],
            parentId: null,
            locked: false,
            hidden: false, 
          }],
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
          width: 'screen',
          minHeight: '600px',
          paddingRight: '100px',
          paddingLeft: '40px',
          paddingTop: '80px',
          paddingBottom: '80px',
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
    case 'iframe':
      return {
        name: 'Iframe',
        props: { src: 'https://www.w3schools.com' },
        styles: {
          width: '100%',
          height: '100%',
          border: 'none',
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
  breakpoint: 'widescreen' | 'desktop' | 'tablet' | 'mobile'
): StyleProperties => {
  const widescreen = element.styles.widescreen || {};
  const desktop = element.styles.desktop || {};
  const tablet = element.styles.tablet || {};
  const mobile = element.styles.mobile || {};

  if (breakpoint === 'desktop') return desktop;
  if (breakpoint === 'widescreen') return { ...desktop, ...widescreen };
  if (breakpoint === 'tablet') return { ...desktop, ...tablet };
  return { ...desktop, ...tablet, ...mobile };
};

const buildComputedStyleObject = (styles: StyleProperties): StyleProperties => {
  const computed: StyleProperties = { ...styles };

  if (styles.backgroundGradient) {
    computed.backgroundImage = styles.backgroundGradient;
  }

  if (styles.textGradient) {
    computed.backgroundImage = styles.textGradient;
    computed.backgroundClip = 'text';
    computed.WebkitBackgroundClip = 'text';
    computed.WebkitTextFillColor = 'transparent';
    if (!computed.color) {
      computed.color = 'transparent';
    }
  }

  return computed;
};

export const stylesToCSS = (styles: StyleProperties): React.CSSProperties => {
  return buildComputedStyleObject(styles) as React.CSSProperties;
};

const camelToKebabCase = (key: string): string => {
  return key.replace(/[A-Z]/g, match => `-${match.toLowerCase()}`);
};

export const styleObjectToCssString = (styles: StyleProperties): string => {
  const computed = buildComputedStyleObject(styles);
  return Object.entries(computed)
    .filter(([key, value]) => value !== undefined && value !== null && value !== '' && key !== 'backgroundGradient' && key !== 'textGradient')
    .map(([key, value]) => `${camelToKebabCase(key)}:${String(value)}`)
    .join('; ');
};

const escapeHtml = (text?: string): string => {
  return String(text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

const escapeJsxString = (text?: string): string => {
  return String(text || '')
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r');
};

const styleObjectToJsxString = (styles: StyleProperties): string => {
  const computed = buildComputedStyleObject(styles);
  const entries = Object.entries(computed)
    .filter(([key, value]) => value !== undefined && value !== null && value !== '' && key !== 'backgroundGradient' && key !== 'textGradient')
    .map(([key, value]) => `${key}: '${escapeJsxString(String(value))}'`);
  return entries.join(', ');
};

const renderElementToReact = (element: BuilderElement, indent = 2): string => {
  const indentation = ' '.repeat(indent);
  const style = element.styles.desktop || {};
  const styleString = styleObjectToJsxString(style);
  const attrs = styleString ? ` style={{${styleString}}}` : '';
  const text = escapeJsxString(element.props.text as string || '');
  const placeholder = escapeJsxString(element.props.placeholder as string || '');
  const href = escapeJsxString(element.props.href as string || '#');
  const src = escapeJsxString(element.props.src as string || '');
  const alt = escapeJsxString(element.props.alt as string || '');
  const iconName = escapeJsxString(element.props.iconName as string || '★');
  const inputType = escapeJsxString(element.props.type as string || 'text');

  const renderChildren = (): string => {
    const childStrings = element.children.map(child => renderElementToReact(child, indent + 2));
    return childStrings.length ? `\n${childStrings.join('\n')}\n${indentation}` : '';
  };

  const children = renderChildren();

  switch (element.type) {
    case 'section':
      return `${indentation}<section${attrs}>${children}</section>`;
    case 'navbar':
      return `${indentation}<nav${attrs}>${children}</nav>`;
    case 'form':
      return `${indentation}<form${attrs}>${children}</form>`;
    case 'list':
      return `${indentation}<ul${attrs}>${children}</ul>`;
    case 'columns':
    case 'grid':
    case 'hero':
    case 'card':
    case 'div':
      return `${indentation}<div${attrs}>${children}</div>`;
    case 'heading': {
      const level = element.props.level || 1;
      const tag = `h${Math.min(Math.max(level, 1), 6)}`;
      return `${indentation}<${tag}${attrs}>${text}</${tag}>`;
    }
    case 'paragraph':
      return `${indentation}<p${attrs}>${text}</p>`;
    case 'button':
      return `${indentation}<button type="button"${attrs}>${text}</button>`;
    case 'link':
      return `${indentation}<a href="${href}"${attrs}>${text}</a>`;
    case 'image':
      return `${indentation}<img src="${src}" alt="${alt}"${attrs} />`;
    case 'video':
      return `${indentation}<video controls src="${src}"${attrs}></video>`;
    case 'divider':
      return `${indentation}<hr${attrs} />`;
    case 'spacer':
      return `${indentation}<div${attrs}></div>`;
    case 'input':
      return `${indentation}<input type="${inputType}" placeholder="${placeholder}"${attrs} />`;
    case 'textarea':
      return `${indentation}<textarea placeholder="${placeholder}"${attrs}></textarea>`;
    case 'icon':
      return `${indentation}<span${attrs}>${iconName}</span>`;
    case 'listItem':
      return `${indentation}<li${attrs}>${text}</li>`;
      case 'iframe':
        return `${indentation}<iframe src="${src}"${attrs}></iframe>`;
    default:
      return `${indentation}<div${attrs}>${children}</div>`;
  }
};

export const renderElementToReactString = (element: BuilderElement): string => {
  return renderElementToReact(element, 2);
};

export const renderElementToHtml = (element: BuilderElement): string => {
  const style = styleObjectToCssString(element.styles.desktop || {});
  const attrs = style ? ` style="${style}"` : '';
  const text = escapeHtml(element.props.text as string || '');
  const placeholder = escapeHtml(element.props.placeholder as string || '');
  const href = escapeHtml(element.props.href as string || '#');
  const src = escapeHtml(element.props.src as string || '');
  const alt = escapeHtml(element.props.alt as string || '');
  const iconName = escapeHtml(element.props.iconName as string || '★');
  const inputType = escapeHtml(element.props.type as string || 'text');

  const renderChildren = (): string => {
    return element.children.map(child => renderElementToHtml(child)).join('');
  };

  switch (element.type) {
    case 'section':
      return `<section${attrs}>${renderChildren()}</section>`;
    case 'navbar':
      return `<nav${attrs}>${renderChildren()}</nav>`;
    case 'form':
      return `<form${attrs}>${renderChildren()}</form>`;
    case 'list':
      return `<ul${attrs}>${renderChildren()}</ul>`;
    case 'columns':
    case 'grid':
    case 'hero':
    case 'card':
      return `<div${attrs}>${renderChildren()}</div>`;
    case 'div':
      return `<div${attrs}>${renderChildren()}</div>`;
    case 'heading': {
      const level = element.props.level || 1;
      const tag = `h${Math.min(Math.max(level, 1), 6)}`;
      return `<${tag}${attrs}>${text}</${tag}>`;
    }
    case 'paragraph':
      return `<p${attrs}>${text}</p>`;
    case 'button':
      return `<button type="button"${attrs}>${text}</button>`;
    case 'link':
      return `<a href="${href}"${attrs}>${text}</a>`;
    case 'image':
      return `<img src="${src}" alt="${alt}"${attrs} />`;
    case 'video':
      return `<video controls src="${src}"${attrs}></video>`;
    case 'divider':
      return `<hr${attrs} />`;
    case 'spacer':
      return `<div${attrs}></div>`;
    case 'input':
      return `<input type="${inputType}" placeholder="${placeholder}"${attrs} />`;
    case 'textarea':
      return `<textarea placeholder="${placeholder}"${attrs}></textarea>`;
    case 'icon':
      return `<span${attrs}>${iconName}</span>`;
    case 'listItem':
      return `<li${attrs}>${text}</li>`;
    case 'iframe':
      return `<iframe src="${src}"${attrs}></iframe>`;
    default:
      return `<div${attrs}>${renderChildren()}</div>`;
  }
};

const toPascalCase = (text: string): string => {
  const words = String(text || '')
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  const pascal = words
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).replace(/[^a-zA-Z0-9]/g, ''))
    .join('');

  return pascal || 'Component';
};

const toSafeFileName = (text: string): string => {
  const fileName = String(text || '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .toLowerCase();
  return fileName || 'page';
};

const getUniqueName = (baseName: string, usedNames: Set<string>): string => {
  let nextName = baseName;
  let counter = 1;
  while (usedNames.has(nextName)) {
    nextName = `${baseName}${counter}`;
    counter += 1;
  }
  usedNames.add(nextName);
  return nextName;
};

export const sanitizeComponentName = (name: string): string => {
  return getUniqueName(toPascalCase(name), new Set());
};

export const getComponentElements = (pages: Page[]): BuilderElement[] => {
  const components: BuilderElement[] = [];

  const walk = (elements: BuilderElement[]) => {
    for (const element of elements) {
      if (element.isComponent) {
        components.push(element);
      }
      if (element.children.length > 0) {
        walk(element.children);
      }
    }
  };

  pages.forEach(page => walk(page.elements));
  return components;
};

export const renderElementToReactWithComponents = (
  element: BuilderElement,
  componentMap: Map<string, string>,
  indent = 2,
  skipComponentTag = false
): string => {
  const indentation = ' '.repeat(indent);

  if (!skipComponentTag && element.isComponent && componentMap.has(element.id)) {
    return `${indentation}<${componentMap.get(element.id)} />`;
  }

  const style = element.styles.desktop || {};
  const styleString = styleObjectToJsxString(style);
  const attrs = styleString ? ` style={{${styleString}}}` : '';
  const text = escapeJsxString(element.props.text as string || '');
  const placeholder = escapeJsxString(element.props.placeholder as string || '');
  const href = escapeJsxString(element.props.href as string || '#');
  const src = escapeJsxString(element.props.src as string || '');
  const alt = escapeJsxString(element.props.alt as string || '');
  const iconName = escapeJsxString(element.props.iconName as string || '★');
  const inputType = escapeJsxString(element.props.type as string || 'text');

  const renderChildren = (): string => {
    const childStrings = element.children.map(child => renderElementToReactWithComponents(child, componentMap, indent + 2));
    return childStrings.length ? `\n${childStrings.join('\n')}\n${indentation}` : '';
  };

  const children = renderChildren();

  switch (element.type) {
    case 'section':
      return `${indentation}<section${attrs}>${children}</section>`;
    case 'navbar':
      return `${indentation}<nav${attrs}>${children}</nav>`;
    case 'form':
      return `${indentation}<form${attrs}>${children}</form>`;
    case 'list':
      return `${indentation}<ul${attrs}>${children}</ul>`;
    case 'columns':
    case 'grid':
    case 'hero':
    case 'card':
    case 'div':
      return `${indentation}<div${attrs}>${children}</div>`;
    case 'heading': {
      const level = element.props.level || 1;
      const tag = `h${Math.min(Math.max(level, 1), 6)}`;
      return `${indentation}<${tag}${attrs}>${text}</${tag}>`;
    }
    case 'paragraph':
      return `${indentation}<p${attrs}>${text}</p>`;
    case 'button':
      return `${indentation}<button type="button"${attrs}>${text}</button>`;
    case 'link':
      return `${indentation}<a href="${href}"${attrs}>${text}</a>`;
    case 'image':
      return `${indentation}<img src="${src}" alt="${alt}"${attrs} />`;
    case 'video':
      return `${indentation}<video controls src="${src}"${attrs}></video>`;
    case 'divider':
      return `${indentation}<hr${attrs} />`;
    case 'spacer':
      return `${indentation}<div${attrs}></div>`;
    case 'input':
      return `${indentation}<input type="${inputType}" placeholder="${placeholder}"${attrs} />`;
    case 'textarea':
      return `${indentation}<textarea placeholder="${placeholder}"${attrs}></textarea>`;
    case 'icon':
      return `${indentation}<span${attrs}>${iconName}</span>`;
    case 'listItem':
      return `${indentation}<li${attrs}>${text}</li>`;
    case 'iframe':
      return `${indentation}<iframe src="${src}"${attrs}></iframe>`;
    default:
      return `${indentation}<div${attrs}>${children}</div>`;
  }
};

export const collectReactComponentDependencies = (
  element: BuilderElement,
  componentMap: Map<string, string>,
  dependencies = new Set<string>()
): Set<string> => {
  if (element.isComponent && componentMap.has(element.id)) {
    dependencies.add(componentMap.get(element.id)!);
    return dependencies;
  }

  for (const child of element.children) {
    collectReactComponentDependencies(child, componentMap, dependencies);
  }
  return dependencies;
};

export const collectReactDependenciesForPage = (
  page: Page,
  componentMap: Map<string, string>
): Set<string> => {
  const dependencies = new Set<string>();
  page.elements.forEach(element => collectReactComponentDependencies(element, componentMap, dependencies));
  return dependencies;
};

export const collectReactDependenciesForComponent = (
  component: BuilderElement,
  componentMap: Map<string, string>
): Set<string> => {
  const dependencies = new Set<string>();
  component.children.forEach(child => collectReactComponentDependencies(child, componentMap, dependencies));
  dependencies.delete(componentMap.get(component.id)!);
  return dependencies;
};

export const getPageComponentName = (page: Page, usedNames: Set<string>) => {
  return getUniqueName(toPascalCase(page.name || page.slug || 'Page'), usedNames);
};

export const getPageFileName = (page: Page, usedFiles: Set<string>) => {
  const baseName = toSafeFileName(page.name || page.slug || 'page');
  let nextName = baseName;
  let counter = 1;
  while (usedFiles.has(nextName)) {
    nextName = `${baseName}-${counter}`;
    counter += 1;
  }
  usedFiles.add(nextName);
  return nextName;
};

export const generateReactProjectFiles = (pages: Page[], projectName: string) => {
  const toPascalCaseName = (value: string) => {
    const words = value
      .replace(/[^a-zA-Z0-9]+/g, ' ')
      .trim()
      .split(/\s+/)
      .filter(Boolean);
    const pascal = words.map(word => word.charAt(0).toUpperCase() + word.slice(1).replace(/[^a-zA-Z0-9]/g, '')).join('');
    return pascal || 'Component';
  };

  const projectSlug = projectName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'luniobuilder-export';
  const packageJson = {
    name: projectSlug,
    version: '0.1.0',
    private: true,
    dependencies: {
      react: '^18.2.0',
      'react-dom': '^18.2.0',
      'react-scripts': '^5.0.1',
    },
    scripts: {
      start: 'react-scripts start',
      build: 'react-scripts build',
      test: 'react-scripts test',
      eject: 'react-scripts eject',
    },
  };

  const componentElements = getComponentElements(pages);
  const componentNameMap = new Map<string, string>();
  const componentNameSet = new Set<string>();

  componentElements.forEach(component => {
    const baseName = toPascalCaseName(component.componentName || component.name || 'Component');
    let nextName = baseName;
    let counter = 1;
    while (componentNameSet.has(nextName)) {
      nextName = `${baseName}${counter}`;
      counter += 1;
    }
    componentNameSet.add(nextName);
    componentNameMap.set(component.id, nextName);
  });

  const pageNameSet = new Set<string>();
  const pageFileSet = new Set<string>();
  const pageMetadata = pages.map(pageItem => ({
    page: pageItem,
    componentName: getPageComponentName(pageItem, pageNameSet),
    fileName: getPageFileName(pageItem, pageFileSet),
  }));

  const files: Array<{ path: string; content: string }> = [
    { path: 'package.json', content: JSON.stringify(packageJson, null, 2) },
    { path: '.gitignore', content: 'node_modules\n/build\n.DS_Store\n' },
    { path: 'README.md', content: `# ${projectName}\n\nGenerated by LUNIO Builder. Run \`npm install\` and \`npm start\` to begin.` },
    { path: 'public/index.html', content: `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8" />\n  <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n  <title>${projectName}</title>\n</head>\n<body>\n  <div id="root"></div>\n</body>\n</html>` },
    { path: 'public/manifest.json', content: JSON.stringify({
      short_name: projectName,
      name: projectName,
      start_url: '.',
      display: 'standalone',
      background_color: '#ffffff',
      theme_color: '#000000',
      icons: [],
    }, null, 2) },
    { path: 'public/robots.txt', content: 'User-agent: *\nDisallow:' },
    { path: 'src/index.js', content: `import React from 'react';\nimport ReactDOM from 'react-dom/client';\nimport App from './App';\nimport './index.css';\n\nconst root = ReactDOM.createRoot(document.getElementById('root'));\nroot.render(\n  <React.StrictMode>\n    <App />\n  </React.StrictMode>\n);` },
  ];

  const appImports = pageMetadata.map(meta => `import ${meta.componentName} from './pages/${meta.fileName}';`).join('\n');
  const pageEntries = pageMetadata.map(meta => `  { title: '${meta.page.name.replace(/'/g, "\\'")}', Component: ${meta.componentName} }`).join(',\n');

  const appSource = `import React, { useState } from 'react';\n${appImports}\nimport './App.css';\n\nconst pages = [\n${pageEntries}\n];\n\nconst App = () => {\n  const [currentIndex, setCurrentIndex] = useState(0);\n  const ActivePage = pages[currentIndex].Component;\n\n  return (\n    <div className="app-shell">\n      ${pageMetadata.length > 1 ? `\n      <div className="page-selector">\n${pageMetadata.map((meta, index) => `        <button type="button" className={currentIndex === ${index} ? 'active' : ''} onClick={() => setCurrentIndex(${index})}>${meta.page.name.replace(/'/g, "\\'")}</button>`).join('\n')}\n      </div>\n      ` : ''}\n      <main className="page-view">\n        <ActivePage />\n      </main>\n    </div>\n  );\n};\n\nexport default App;`;

  files.push({ path: 'src/App.jsx', content: appSource });
  files.push({ path: 'src/App.css', content: `body { margin: 0; font-family: system-ui, sans-serif; background: #ffffff; color: #111827; }\n.app-shell { min-height: 100vh; background: #ffffff; }\n.page-selector { display: flex; flex-wrap: wrap; gap: 8px; padding: 16px; background: transparent; }\n.page-selector button { border: none; padding: 10px 14px; background: #e5e7eb; color: #111827; border-radius: 9999px; cursor: pointer; }\n.page-selector button.active { background: #2563eb; color: #ffffff; }\n.page-view { padding: 0; }` });
  files.push({ path: 'src/index.css', content: `* { box-sizing: border-box; }\nbody { margin: 0; background: #f8fafc; color: #111827; }\nimg { max-width: 100%; display: block; }` });
  files.push({ path: 'src/reportWebVitals.js', content: `const reportWebVitals = onPerfEntry => {\n  if (onPerfEntry && onPerfEntry instanceof Function) {\n    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {\n      getCLS(onPerfEntry);\n      getFID(onPerfEntry);\n      getFCP(onPerfEntry);\n      getLCP(onPerfEntry);\n      getTTFB(onPerfEntry);\n    });\n  }\n};\nexport default reportWebVitals;` });
  files.push({ path: 'src/setupTests.js', content: `// jest-dom adds custom jest matchers for asserting on DOM nodes.\n// allows you to do things like:\n// expect(element).toHaveTextContent(/react/i)\n// learn more: https://github.com/testing-library/jest-dom\nimport '@testing-library/jest-dom';` });

  const componentFolderFiles = new Set<string>();
  componentElements.forEach(component => {
    const componentName = componentNameMap.get(component.id)!;
    const componentDependencies = Array.from(collectReactDependenciesForComponent(component, componentNameMap));
    const componentImports = componentDependencies.map(dep => `import ${dep} from './${dep}';`).join('\n');
    const componentBody = renderElementToReactWithComponents(component, componentNameMap, 2, true);
    const componentSource = `${componentImports ? `${componentImports}\n\n` : ''}import React from 'react';\n\nconst ${componentName} = () => (\n${componentBody}\n);\n\nexport default ${componentName};`;
    const componentPath = `src/components/${componentName}.jsx`;
    if (!componentFolderFiles.has(componentPath)) {
      componentFolderFiles.add(componentPath);
      files.push({ path: componentPath, content: componentSource });
    }
  });

  pageMetadata.forEach(meta => {
    const pageDependencies = Array.from(collectReactDependenciesForPage(meta.page, componentNameMap));
    const pageImports = pageDependencies.map(dep => `import ${dep} from '../components/${dep}';`).join('\n');
    const pageBody = meta.page.elements.length
      ? meta.page.elements.map(element => renderElementToReactWithComponents(element, componentNameMap, 2)).join('\n')
      : `  <div style={{ padding: 32, fontFamily: 'system-ui, sans-serif', color: '#4b5563' }}>No content to export.</div>`;
    const pageSource = `${pageImports ? `${pageImports}\n\n` : ''}import React from 'react';\n\nconst ${meta.componentName} = () => (\n  <>\n${pageBody}\n  </>\n);\n\nexport default ${meta.componentName};`;
    files.push({ path: `src/pages/${meta.fileName}.jsx`, content: pageSource });
  });

  return files;
};

import React from 'react';

export const canHaveChildren = (type: ElementType): boolean => {
  return ['section', 'div', 'navbar', 'hero', 'card', 'grid', 'columns', 'form', 'list'].includes(type);
};

export const COMPONENT_CATEGORIES = {
  Layout: ['section', 'div', 'hero', 'navbar', 'columns', 'grid', 'card'],
  Typography: ['heading', 'paragraph', 'link', 'list', 'listItem'],
  Media: ['image', 'video', 'icon', 'iframe'],
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
  iframe: 'Iframe',
};

export { emptyStyles };
