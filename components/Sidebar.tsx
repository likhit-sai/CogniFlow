
import React, { useMemo, useState, useRef, useEffect } from 'react';
import { PageItem, ItemType } from '../types';
import FileTreeNode from './FileTreeNode';
import Icon from './Icon';

type SaveStatus = 'saved' | 'saving' | 'error';

interface SidebarProps {
  items: PageItem[];
  activeItemId: string | null;
  onSelectItem: (id: string) => void;
  onCreateItem: (name: string, type: ItemType, parentId: string | null, options?: { setActive?: boolean, properties?: Record<string, any>, content?: string }) => void;
  onDeleteItem: (id: string) => void;
  onUpdateItem: (id: string, updates: Partial<PageItem>) => void;
  onOrganize: () => void;
  isOrganizing: boolean;
  isVisible: boolean;
  toggleSidebar: () => void;
  saveStatus: SaveStatus;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}

const SaveStatusIndicator: React.FC<{ status: SaveStatus }> = ({ status }) => {
  if (status === 'saving') {
    return (
      <div className="flex items-center justify-center text-xs text-text-dim">
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>Saving...</span>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex items-center justify-center text-xs text-danger">
        <Icon name="error" className="w-4 h-4 mr-2" />
        <span>Save failed</span>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center text-xs text-text-dim">
      <Icon name="check" className="w-4 h-4 mr-2 text-success" />
      <span>All changes saved to cloud</span>
    </div>
  );
};

const NewItemDropdown: React.FC<{ 
    onCreateItem: (type: ItemType) => void;
    onOrganize: () => void;
    isOrganizing: boolean;
}> = ({ onCreateItem, onOrganize, isOrganizing }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleCreate = (type: ItemType) => {
        onCreateItem(type);
        setIsOpen(false);
    };

    const handleOrganize = () => {
        onOrganize();
        setIsOpen(false);
    }

    const creationItems: { type: ItemType; label: string; icon: 'note' | 'folder' | 'database' | 'spreadsheet' | 'presentation' | 'microphone' | 'brush' }[] = [
        { type: 'page', label: 'New Page', icon: 'note' },
        { type: 'meeting', label: 'New Meeting', icon: 'microphone' },
        { type: 'sketch', label: 'New Sketch', icon: 'brush' },
        { type: 'database', label: 'New Database', icon: 'database' },
        { type: 'spreadsheet', label: 'New Spreadsheet', icon: 'spreadsheet' },
        { type: 'presentation', label: 'New Presentation', icon: 'presentation' },
        { type: 'folder', label: 'New Folder', icon: 'folder' },
    ];

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-center gap-2 bg-accent text-primary px-3 py-2 rounded-lg hover:bg-accent-hover transition-colors text-sm font-semibold"
            >
                {isOrganizing ? (
                    <>
                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        <span>Organizing...</span>
                    </>
                ) : (
                    <>
                        <Icon name="plus" className="w-4 h-4" />
                        New Item
                    </>
                )}
            </button>
            {isOpen && (
                <div className="absolute top-full left-0 mt-2 w-52 bg-surface border border-border rounded-lg shadow-2xl z-10 p-1">
                    {creationItems.map(({ type, label, icon }) => (
                        <button
                            key={type}
                            onClick={() => handleCreate(type)}
                            className="w-full flex items-center gap-3 px-3 py-2 text-left text-sm text-text hover:bg-white/5 rounded-md"
                        >
                            <Icon name={icon} className="w-4 h-4 text-text-dim" />
                            {label}
                        </button>
                    ))}
                    <div className="my-1 h-px bg-border" />
                    <button
                        onClick={handleOrganize}
                        disabled={isOrganizing}
                        className="w-full flex items-center gap-3 px-3 py-2 text-left text-sm text-text hover:bg-white/5 rounded-md disabled:opacity-50"
                    >
                        <Icon name="sparkles" className="w-4 h-4 text-accent" />
                        Organize with AI
                    </button>
                </div>
            )}
        </div>
    );
};


const Sidebar: React.FC<SidebarProps> = ({
  items,
  activeItemId,
  onSelectItem,
  onCreateItem,
  onDeleteItem,
  onUpdateItem,
  onOrganize,
  isOrganizing,
  isVisible,
  toggleSidebar,
  saveStatus,
  theme,
  setTheme,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items.filter(i => !i.parentId || !i.parentId.startsWith('db-'));
    
    const lowerCaseQuery = searchQuery.toLowerCase();
    const itemMap = new Map(items.map(item => [item.id, item]));
    const visibleIds = new Set<string>();

    for (const item of items) {
        if (item.parentId && item.parentId.startsWith('db-')) continue;
        if (item.name.toLowerCase().includes(lowerCaseQuery)) {
            visibleIds.add(item.id);
            let currentParentId = item.parentId;
            while (currentParentId) {
                if (visibleIds.has(currentParentId)) break;
                const parent = itemMap.get(currentParentId);
                if (parent) {
                    visibleIds.add(parent.id);
                    currentParentId = parent.parentId;
                } else break;
            }
        }
    }
    return items.filter(item => visibleIds.has(item.id));
  }, [items, searchQuery]);

  const fileTree = useMemo(() => {
    const itemMap = new Map(filteredItems.map(item => [item.id, { ...item, children: [] as PageItem[] }]));
    const roots: PageItem[] = [];
    for (const item of itemMap.values()) {
      if (item.parentId && itemMap.has(item.parentId)) {
        itemMap.get(item.parentId)?.children?.push(item);
      } else {
        roots.push(item);
      }
    }
    return roots;
  }, [filteredItems]);

  const handleCreateItem = (type: ItemType) => {
    const name = `Untitled ${type.charAt(0).toUpperCase() + type.slice(1)}`;
    onCreateItem(name, type, null);
  };

  return (
    <aside
      className={`bg-surface border-r border-border flex flex-col transition-all duration-300 ease-in-out ${
        isVisible ? 'w-72 p-4' : 'w-0 p-0'
      } overflow-hidden`}
    >
      <div className="flex justify-between items-center mb-4 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Icon name="logo" className="w-8 h-8" />
          <h1 className="text-xl font-bold text-text-bright whitespace-nowrap">CogniFlow</h1>
        </div>
        <button onClick={toggleSidebar} className="p-1 rounded-md hover:bg-white/10">
          <Icon name="close" className="w-5 h-5" />
        </button>
      </div>
      
      <div className="relative mb-2 flex-shrink-0">
        <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-dim" />
        <input
          type="text"
          placeholder="Search... (⌘K)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-primary border border-border rounded-lg pl-9 pr-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
        />
      </div>

      <div className="mb-4 flex-shrink-0">
         <NewItemDropdown 
            onCreateItem={handleCreateItem}
            onOrganize={onOrganize}
            isOrganizing={isOrganizing}
        />
      </div>

      <nav className="flex-1 overflow-y-auto -mr-2 pr-2">
        {fileTree.map(item => (
          <FileTreeNode
            key={item.id}
            item={item}
            level={0}
            activeItemId={activeItemId}
            onSelectItem={onSelectItem}
            onCreateItem={onCreateItem}
            onDeleteItem={onDeleteItem}
            onUpdateItem={onUpdateItem}
            isInitiallyExpanded={!!searchQuery.trim()}
          />
        ))}
      </nav>
      
      <div className="mt-auto flex-shrink-0 pt-2 border-t border-border">
        <div className="mb-2">
            <SaveStatusIndicator status={saveStatus} />
        </div>
        <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="w-full flex items-center justify-center gap-2 text-sm text-text-dim hover:bg-accent-subtle p-2 rounded-md transition-colors"
        >
            <Icon name={theme === 'dark' ? 'sun' : 'moon'} className="w-4 h-4" />
            <span>Switch to {theme === 'dark' ? 'Light' : 'Dark'} Mode</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;