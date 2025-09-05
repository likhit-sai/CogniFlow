
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PageItem, ItemType } from '../types';
import Icon from './Icon';

interface FileTreeNodeProps {
  item: PageItem;
  level: number;
  activeItemId: string | null;
  onSelectItem: (id: string) => void;
  onCreateItem: (name: string, type: ItemType, parentId: string | null, options?: { setActive?: boolean, properties?: Record<string, any>, content?: string }) => void;
  onDeleteItem: (id: string) => void;
  onUpdateItem: (id: string, updates: Partial<PageItem>) => void;
  isInitiallyExpanded?: boolean;
}

const countDescendants = (node: PageItem): number => {
  if (!node.children || node.children.length === 0) return 0;
  return node.children.reduce((acc, child) => acc + 1 + countDescendants(child), 0);
};

const FileTreeNode: React.FC<FileTreeNodeProps> = ({
  item, level, activeItemId, onSelectItem, onCreateItem, onDeleteItem, onUpdateItem, isInitiallyExpanded,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(item.name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isInitiallyExpanded) setIsExpanded(true);
  }, [isInitiallyExpanded]);
  
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const isActive = activeItemId === item.id;
  const isContainer = item.type === 'folder' || item.type === 'database';

  const handleNodeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isEditing) {
      onSelectItem(item.id);
      if (isContainer) setIsExpanded(prev => !prev);
    }
  };

  const handleToggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const handleCreateChild = (e: React.MouseEvent, type: ItemType) => {
    e.stopPropagation();
    onCreateItem(`Untitled ${type}`, type, item.id);
    setIsExpanded(true);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    const descendantCount = countDescendants(item);
    let message = descendantCount > 0
      ? `Permanently delete "${item.name}" and all ${descendantCount} items inside?`
      : `Permanently delete "${item.name}"?`;
    if (window.confirm(message)) onDeleteItem(item.id);
  };

  const handleRenameStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };
  
  const handleRenameSubmit = useCallback(() => {
    const trimmedName = newName.trim();
    if (trimmedName && trimmedName !== item.name) {
      onUpdateItem(item.id, { name: trimmedName });
    } else {
      setNewName(item.name);
    }
    setIsEditing(false);
  }, [newName, item.id, item.name, onUpdateItem]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') handleRenameSubmit();
    else if (e.key === 'Escape') setIsEditing(false);
  }, [handleRenameSubmit]);
  
  const getItemIcon = (): 'folder' | 'note' | 'database' | 'spreadsheet' | 'presentation' | 'microphone' | 'brush' => {
      switch(item.type) {
          case 'folder': return 'folder';
          case 'database': return 'database';
          case 'page': return 'note';
          case 'spreadsheet': return 'spreadsheet';
          case 'presentation': return 'presentation';
          case 'meeting': return 'microphone';
          case 'sketch': return 'brush';
          default: return 'note';
      }
  }

  return (
    <div>
      <div
        className={`flex items-center group cursor-pointer pr-2 rounded-md text-sm transition-colors duration-150 min-h-[36px] ${isActive ? 'bg-accent-subtle text-text-bright' : 'hover:bg-white/5 text-text-dim hover:text-text'}`}
        style={{ paddingLeft: `${level * 1.25}rem` }}
        onClick={handleNodeClick}
      >
        <div className="w-6 h-6 flex items-center justify-center flex-shrink-0">
          {isContainer && item.children && item.children.length > 0 && (
            <button onClick={handleToggleExpand} className="p-1 rounded hover:bg-white/10">
              <svg className={`w-3.5 h-3.5 transition-transform ${isExpanded ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}
        </div>

        <div className="w-6 h-6 flex items-center justify-center flex-shrink-0 mr-1">
            {item.icon ? <span className="text-lg">{item.icon}</span> : <Icon name={getItemIcon()} className={`w-5 h-5 ${item.type === 'folder' ? 'text-accent' : ''}`} />}
        </div>

        <div className="flex-1 min-w-0">
          {isEditing ? (
              <input
                ref={inputRef}
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onBlur={handleRenameSubmit}
                onKeyDown={handleKeyDown}
                onClick={(e) => e.stopPropagation()}
                className="bg-primary border border-border rounded px-1 py-0 w-full text-sm focus:outline-none focus:ring-1 focus:ring-accent"
              />
          ) : (
            <span className={`truncate ${isActive ? 'font-semibold' : ''}`}>{item.name}</span>
          )}
        </div>
        
        <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity text-text-dim">
          {isContainer && (
            <button onClick={(e) => handleCreateChild(e, 'page')} className="p-1 rounded hover:bg-white/10" title="New Page">
              <Icon name="plus" className="w-4 h-4" />
            </button>
          )}
          <button onClick={handleRenameStart} className="p-1 rounded hover:bg-white/10" title="Rename">
            <Icon name="edit" className="w-4 h-4" />
          </button>
          <button onClick={handleDelete} className="p-1 rounded hover:bg-danger/20" title="Delete">
            <Icon name="trash" className="w-4 h-4 text-danger" />
          </button>
        </div>
      </div>
      {isContainer && isExpanded && (
        <div>
          {item.children?.map(child => (
            <FileTreeNode key={child.id} item={child} level={level + 1} {...{activeItemId, onSelectItem, onCreateItem, onDeleteItem, onUpdateItem, isInitiallyExpanded}}/>
          ))}
          {item.children?.length === 0 && <p className="text-xs text-text-dim" style={{ paddingLeft: `${(level + 1) * 1.25 + 1.75}rem` }}>No pages inside</p>}
        </div>
      )}
    </div>
  );
};

export default FileTreeNode;