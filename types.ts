
export type ItemType = 'folder' | 'page' | 'database' | 'spreadsheet' | 'presentation' | 'meeting' | 'sketch';

export type AiAction = 'summarize' | 'improve' | 'brainstorm';

export type PropertyType = 'text' | 'tag' | 'date' | 'status';

export type ViewType = 'table' | 'gallery' | 'calendar';

export type PaperStyle = 'plain' | 'lined' | 'grid' | 'dotted' | 'four-line';

export type PresentationTheme = 'default-dark' | 'professional' | 'galaxy' | 'playful';

export interface PropertyOption {
  id: string;
  name: string;
  color: string;
}

export interface PropertySchema {
  id:string;
  name: string;
  type: PropertyType;
  options?: PropertyOption[]; // For 'tag' or 'status'
}

export interface Slide {
  id: string;
  title: string;
  content: string; // Markdown content
}

export interface PageItem {
  id:string;
  name: string;
  type: ItemType;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
  
  // Page-specific
  content?: string; // For pages, spreadsheets (JSON 2D array), and sketches (Base64 data URL)
  icon?: string; // Emoji or icon URL
  coverImage?: string;
  paperStyle?: PaperStyle; // New property for paper background style

  // Presentation-specific
  slides?: Slide[];
  theme?: PresentationTheme;

  // Database-specific
  schema?: PropertySchema[];
  views?: { id: string; type: ViewType; name: string }[];
  activeViewId?: string;

  // For pages inside a database
  properties?: Record<string, any>; // { propertyId: value }
  
  // For client-side rendering
  children?: PageItem[];
}

export type OrganizationAction =
  | { action: 'CREATE_FOLDER'; name: string; parentId: string | null; tempId: string; }
  | { action: 'MOVE_ITEM'; itemId: string; newParentId: string | null; } // newParentId can be a tempId
  | { action: 'RENAME_ITEM'; itemId: string; newName: string; };