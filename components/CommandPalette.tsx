
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { PageItem, ItemType } from '../types';
import Icon from './Icon';
// FIX: Import the IconName type to resolve the 'Cannot find name' error.
import type { IconName } from './Icon';

// Define a type for a command that can be executed from the palette
type Command = {
  id: string;
  name: string;
  type: 'command';
  icon: 'plus' | 'menu';
  action: () => void;
};

type PaletteItem = (PageItem & { action: () => void }) | Command;

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  items: PageItem[];
  onSelectItem: (id: string) => void;
  onCreateItem: (name: string, type: ItemType, parentId: string | null, options?: { setActive?: boolean, properties?: Record<string, any>, content?: string }) => void;
  toggleSidebar: () => void;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, items, onSelectItem, onCreateItem, toggleSidebar }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const commands: Command[] = useMemo(() => [
    { id: 'cmd-new-page', name: 'New Page', type: 'command', icon: 'plus', action: () => onCreateItem('Untitled Page', 'page', null) },
    { id: 'cmd-new-meeting', name: 'New Meeting', type: 'command', icon: 'plus', action: () => onCreateItem('Untitled Meeting', 'meeting', null) },
    { id: 'cmd-new-sketch', name: 'New Sketch', type: 'command', icon: 'plus', action: () => onCreateItem('Untitled Sketch', 'sketch', null) },
    { id: 'cmd-new-db', name: 'New Database', type: 'command', icon: 'plus', action: () => onCreateItem('Untitled Database', 'database', null) },
    { id: 'cmd-new-sheet', name: 'New Spreadsheet', type: 'command', icon: 'plus', action: () => onCreateItem('Untitled Spreadsheet', 'spreadsheet', null) },
    { id: 'cmd-new-pres', name: 'New Presentation', type: 'command', icon: 'plus', action: () => onCreateItem('Untitled Presentation', 'presentation', null) },
    { id: 'cmd-new-folder', name: 'New Folder', type: 'command', icon: 'plus', action: () => onCreateItem('Untitled Folder', 'folder', null) },
    { id: 'cmd-toggle-sidebar', name: 'Toggle Sidebar', type: 'command', icon: 'menu', action: toggleSidebar },
  ], [onCreateItem, toggleSidebar]);

  const searchResults = useMemo((): PaletteItem[] => {
    const lowerCaseQuery = query.toLowerCase().trim();

    const allItems: PaletteItem[] = [
      ...items.map(item => ({
        ...item,
        action: () => onSelectItem(item.id),
      })),
      ...commands,
    ];
    
    const searchableItems = allItems.filter(item => item.type !== 'page' || !item.parentId?.startsWith('db-'));

    if (!lowerCaseQuery) {
      return searchableItems;
    }
    
    return searchableItems.filter(item => item.name.toLowerCase().includes(lowerCaseQuery));
  }, [query, items, commands, onSelectItem]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  useEffect(() => {
    if (resultsRef.current) {
      const selectedElement = resultsRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isOpen) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % searchResults.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + searchResults.length) % searchResults.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const selectedItem = searchResults[selectedIndex];
      if (selectedItem) {
        selectedItem.action();
        onClose();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  }, [isOpen, searchResults, selectedIndex, onClose]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!isOpen) {
    return null;
  }

  const handleItemClick = (item: PaletteItem) => {
    item.action();
    onClose();
  };
  
  const getItemIcon = (item: PaletteItem): IconName => {
      switch(item.type) {
          case 'folder': return 'folder';
          case 'database': return 'database';
          case 'page': return 'note';
          case 'spreadsheet': return 'spreadsheet';
          case 'presentation': return 'presentation';
          case 'meeting': return 'microphone';
          case 'sketch': return 'brush';
          case 'command': return item.icon;
          default: return 'note';
      }
  }
  
  const getParentName = (item: PageItem) => {
    if (!item.parentId || item.parentId.startsWith('db-')) return null;
    const parent = items.find(p => p.id === item.parentId);
    return parent ? parent.name : null;
  }


  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center pt-24" onClick={onClose} role="dialog" aria-modal="true">
      <div 
        className="w-full max-w-2xl bg-surface rounded-lg shadow-2xl border border-border flex flex-col overflow-hidden max-h-[60%]"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 border-b border-border flex items-center gap-3">
          <Icon name="search" className="w-5 h-5 text-text-dim" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or search..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full bg-transparent text-lg text-text-bright focus:outline-none"
            aria-label="Command input"
          />
           <div className="text-xs bg-primary text-text-dim px-2 py-1 rounded-md border border-border">ESC</div>
        </div>

        <div ref={resultsRef} className="flex-1 overflow-y-auto p-2" role="listbox">
          {searchResults.length > 0 ? (
            searchResults.map((item, index) => {
                const parentName = item.type !== 'command' ? getParentName(item) : null;
                return (
                    <div
                        key={item.id}
                        onClick={() => handleItemClick(item)}
                        className={`flex items-center gap-3 p-3 rounded-md cursor-pointer text-sm ${
                        index === selectedIndex ? 'bg-accent-subtle text-text-bright' : 'text-text hover:bg-white/5'
                        }`}
                        role="option"
                        aria-selected={index === selectedIndex}
                    >
                        <Icon name={getItemIcon(item)} className="w-5 h-5 text-text-dim flex-shrink-0" />
                        <span className="flex-1 truncate">{item.name}</span>
                        {parentName && (
                            <span className="text-xs text-text-dim flex-shrink-0">{parentName}</span>
                        )}
                    </div>
                )
            })
          ) : (
            <div className="text-center p-8 text-text-dim">
              No results found for "{query}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
