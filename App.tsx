
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import Editor from './components/Editor';
import { PageItem, ItemType, OrganizationAction } from './types';
import { fetchItems, saveItems } from './services/dataService';
import Icon from './components/Icon';
import CommandPalette from './components/CommandPalette';
import { organizeWorkspace } from './services/geminiService';
import { useLocalStorage } from './hooks/useLocalStorage';

const FullScreenLoader: React.FC = () => (
  <div className="flex items-center justify-center h-screen bg-primary text-text-bright">
    <div className="flex flex-col items-center">
      <svg className="animate-spin h-10 w-10 text-accent" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <p className="mt-4 text-lg font-medium tracking-wide">Connecting to the cloud...</p>
    </div>
  </div>
);

const ErrorDisplay: React.FC<{ message: string }> = ({ message }) => (
  <div className="flex items-center justify-center h-screen bg-primary text-text p-8">
    <div className="text-center bg-danger/10 border border-danger/50 rounded-lg p-8 max-w-md">
      <h2 className="text-2xl font-bold text-danger mb-4">Connection Error</h2>
      <p className="text-text-bright">{message}</p>
      <p className="mt-4 text-sm text-text-dim">Please try refreshing the page.</p>
    </div>
  </div>
);

const SaveErrorToast: React.FC<{ message: string; onClose: () => void; onRetry: () => void; }> = ({ message, onClose, onRetry }) => (
  <div 
    className="fixed bottom-6 right-6 bg-danger-bg/90 backdrop-blur-sm border border-danger text-danger-text p-4 rounded-lg shadow-2xl max-w-sm z-50 flex items-start gap-4 animate-fade-in-up"
    role="alert"
    aria-live="assertive"
  >
    <style>{`
      @keyframes fade-in-up {
        from { opacity: 0; transform: translateY(1rem); }
        to { opacity: 1; transform: translateY(0); }
      }
      .animate-fade-in-up { animation: fade-in-up 0.3s ease-out forwards; }
    `}</style>
    <div className="flex-shrink-0 pt-0.5">
      <Icon name="error" className="w-6 h-6" />
    </div>
    <div className="flex-1">
      <h3 className="font-bold mb-1">Save Failed</h3>
      <p className="text-sm opacity-90 mb-3">{message}</p>
      <button 
        onClick={onRetry} 
        className="px-3 py-1 text-sm font-semibold rounded-md bg-white/20 hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-danger focus:ring-white transition-colors"
      >
        Try Again
      </button>
    </div>
    <button onClick={onClose} className="p-1 rounded-full hover:bg-white/20 -mt-2 -mr-2 flex-shrink-0" aria-label="Dismiss">
      <Icon name="close" className="w-5 h-5" />
    </button>
  </div>
);

const OrganizeAiModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onApply: () => void;
  suggestions: OrganizationAction[] | null;
  items: PageItem[];
  error: string | null;
}> = ({ isOpen, onClose, onApply, suggestions, items, error }) => {
  if (!isOpen) return null;

  const itemMap = useMemo(() => new Map(items.map(i => [i.id, i])), [items]);

  const renderSuggestion = (suggestion: OrganizationAction, index: number, tempIdMap: Map<string, string>) => {
    switch (suggestion.action) {
      case 'CREATE_FOLDER':
        const parent = suggestion.parentId ? itemMap.get(suggestion.parentId) : null;
        return <li key={index}>Create folder <strong className="text-text-bright">{suggestion.name}</strong> inside {parent ? `"${parent.name}"` : 'root'}.</li>;
      case 'MOVE_ITEM':
        const itemToMove = itemMap.get(suggestion.itemId);
        const newParent = suggestion.newParentId ? (itemMap.get(suggestion.newParentId) || { name: tempIdMap.get(suggestion.newParentId) || 'new folder' }) : { name: 'root' };
        if (!itemToMove) return null;
        return <li key={index}>Move <strong className="text-text-bright">{itemToMove.name}</strong> to {newParent ? `"${newParent.name}"` : 'root'}.</li>;
      case 'RENAME_ITEM':
        const itemToRename = itemMap.get(suggestion.itemId);
        if (!itemToRename) return null;
        return <li key={index}>Rename <em className="line-through">{itemToRename.name}</em> to <strong className="text-text-bright">{suggestion.newName}</strong>.</li>;
      default:
        return null;
    }
  };

  const tempIdNameMap = new Map<string, string>();
  if (suggestions) {
    for (const s of suggestions) {
      if (s.action === 'CREATE_FOLDER') {
        tempIdNameMap.set(s.tempId, s.name);
      }
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center" onClick={onClose}>
      <div className="bg-surface rounded-lg shadow-2xl p-6 w-full max-w-2xl border border-border" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-4">
          <Icon name="sparkles" className="w-6 h-6 text-accent" />
          <h2 className="text-xl font-bold text-text-bright">AI Organization Suggestions</h2>
        </div>
        {error ? (
          <>
            <p className="text-sm text-text-dim mb-4">The AI encountered an error while trying to organize your workspace:</p>
            <div className="bg-danger/10 text-danger p-3 rounded-md border border-danger/20 text-sm">
                {error}
            </div>
            <div className="flex justify-end mt-6">
                <button onClick={onClose} className="px-4 py-2 text-sm font-medium rounded-md bg-accent/10 text-text-bright hover:bg-accent/20 transition-colors">Close</button>
            </div>
          </>
        ) : !suggestions || suggestions.length === 0 ? (
          <p className="text-text-dim">Looks like your workspace is already well-organized! The AI has no suggestions at this time.</p>
        ) : (
          <>
            <p className="text-sm text-text-dim mb-4">The AI has analyzed your workspace and suggests the following changes to improve organization:</p>
            <div className="border border-border rounded-md bg-primary p-4 max-h-80 overflow-y-auto mb-6">
              <ul className="list-disc list-inside space-y-2 text-text">
                {suggestions.map((s, i) => renderSuggestion(s, i, tempIdNameMap))}
              </ul>
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={onClose} className="px-4 py-2 text-sm font-medium rounded-md bg-accent/10 text-text-bright hover:bg-accent/20 transition-colors">Cancel</button>
              <button onClick={onApply} className="px-4 py-2 text-sm font-semibold rounded-md bg-accent text-primary dark:text-d-primary hover:bg-accent-hover transition-colors">Apply Changes</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};


export default function App() {
  const [items, setItems] = useState<PageItem[]>([]);
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); // For fatal load errors
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');
  const [saveError, setSaveError] = useState<string | null>(null); // For non-fatal save errors
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('theme', 'dark');

  const [isOrganizeModalOpen, setIsOrganizeModalOpen] = useState(false);
  const [suggestedOrganization, setSuggestedOrganization] = useState<OrganizationAction[] | null>(null);
  const [isOrganizing, setIsOrganizing] = useState(false);
  const [organizationError, setOrganizationError] = useState<string | null>(null);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchItems();
        setItems(data);
        const firstNote = data.find(item => item.type === 'page' && !item.parentId?.startsWith('db-'));
        if (firstNote) {
          setActiveItemId(firstNote.id);
        } else if (data.length > 0) {
          setActiveItemId(data[0].id);
        }
      } catch (e) {
        console.error("Failed to load data from the cloud", e);
        setError("Could not load your data. Please check your connection and refresh.");
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const handleRetrySave = useCallback(async () => {
    setSaveStatus('saving');
    setSaveError(null);
    try {
      await saveItems(items);
      setSaveStatus('saved');
    } catch (e) {
      console.error("Failed to save changes to the cloud", e);
      setSaveError("Failed to save recent changes. Please check your connection.");
      setSaveStatus('error');
    }
  }, [items]);

  useEffect(() => {
    if (isLoading || items.length === 0) return;

    // If a previous save failed, don't auto-save. The user must manually retry.
    // A successful manual save will reset `saveStatus` and re-enable auto-saving.
    if (saveStatus === 'error') {
      return;
    }

    setSaveStatus('saving');
    // Clear previous save error when a new save starts
    if (saveError) setSaveError(null);

    const handler = setTimeout(async () => {
      try {
        await saveItems(items);
        setSaveStatus('saved');
      } catch (e) {
        console.error("Failed to save changes to the cloud", e);
        setSaveError("Failed to save recent changes. Please check your connection.");
        setSaveStatus('error');
      }
    }, 1500);
    return () => clearTimeout(handler);
  }, [items, isLoading, saveStatus, saveError]);

  const activeItem = useMemo(() => items.find(item => item.id === activeItemId) || null, [items, activeItemId]);
  const activeItemChildren = useMemo(() => {
    if (activeItem?.type === 'database') {
      return items.filter(item => item.parentId === activeItem.id);
    }
    return [];
  }, [items, activeItem]);

  const createItem = useCallback((
    name: string,
    type: ItemType,
    parentId: string | null,
    options?: { setActive?: boolean; properties?: Record<string, any>, content?: string }
  ) => {
    const now = new Date().toISOString();
    let newItem: PageItem;

    if (type === 'database') {
      newItem = {
        id: `db-${Date.now()}`, name, type, parentId, createdAt: now, updatedAt: now, icon: '📦',
        schema: [{ id: 'prop-1', name: 'Name', type: 'text' }],
        views: [{ id: 'view-1', type: 'table', name: 'Table' }, { id: 'view-2', type: 'gallery', name: 'Gallery' }],
        activeViewId: 'view-1',
      };
    } else if (type === 'spreadsheet') {
      newItem = {
        id: `${type}-${Date.now()}`, name, type, parentId, createdAt: now, updatedAt: now, icon: '📊',
        content: JSON.stringify(Array(20).fill(0).map(() => Array(10).fill(''))),
      };
    } else if (type === 'presentation') {
        newItem = {
            id: `${type}-${Date.now()}`, name, type, parentId, createdAt: now, updatedAt: now, icon: '📽️',
            slides: [{ id: `slide-${Date.now()}`, title: 'Title Slide', content: '## Add your content here' }],
            theme: 'default-dark',
        };
    } else if (type === 'meeting') {
        newItem = {
            id: `${type}-${Date.now()}`, name, type, parentId, createdAt: now, updatedAt: now, icon: '🎙️',
            content: `# ${name}\n\n### Agenda\n\n- \n\n### Notes\n\n- `,
        };
    } else if (type === 'sketch') {
        newItem = {
            id: `${type}-${Date.now()}`, name, type, parentId, createdAt: now, updatedAt: now, icon: '🎨',
            content: '', // Empty canvas
            paperStyle: 'plain',
        };
    } else { // 'page' or 'folder'
      newItem = {
        id: `${type}-${Date.now()}`, name, type, parentId, createdAt: now, updatedAt: now,
        icon: type === 'folder' ? undefined : '📄',
        content: options?.content || (type === 'page' ? `# ${name}\n\n` : undefined),
        properties: options?.properties,
      };
    }

    setItems(prev => [...prev, newItem]);
    if (options?.setActive !== false) {
        setActiveItemId(newItem.id);
    }
    return newItem.id;
  }, []);

  const deleteItem = useCallback((id: string) => {
    setItems(prev => {
      const itemsToDelete = new Set<string>([id]);
      let changed = true;
      while (changed) {
        changed = false;
        const currentSize = itemsToDelete.size;
        prev.forEach(item => {
          if (item.parentId && itemsToDelete.has(item.parentId)) {
            itemsToDelete.add(item.id);
          }
        });
        if (itemsToDelete.size > currentSize) changed = true;
      }

      const newItems = prev.filter(item => !itemsToDelete.has(item.id));
      
      if (activeItemId && itemsToDelete.has(activeItemId)) {
        const parentId = prev.find(i => i.id === activeItemId)?.parentId;
        if (parentId) {
          setActiveItemId(parentId);
        } else {
          const firstPage = newItems.find(i => i.type === 'page' && !i.parentId?.startsWith('db-'));
          setActiveItemId(firstPage ? firstPage.id : newItems[0]?.id || null);
        }
      }
      return newItems;
    });
  }, [activeItemId]);

  const updateItem = useCallback((id: string, updates: Partial<PageItem>) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, ...updates, updatedAt: new Date().toISOString() } : item));
  }, []);
  
  const handleOrganize = async () => {
    setIsOrganizing(true);
    setSuggestedOrganization(null);
    setOrganizationError(null);
    try {
      const suggestions = await organizeWorkspace(items);
      setSuggestedOrganization(suggestions);
    } catch(e) {
      console.error(e);
      const message = e instanceof Error ? e.message : 'An unknown error occurred during organization.';
      setOrganizationError(message);
    } finally {
      setIsOrganizing(false);
      setIsOrganizeModalOpen(true);
    }
  };

  const applyOrganization = () => {
    if (!suggestedOrganization) return;
    
    let tempIdMap = new Map<string, string>();

    setItems(prevItems => {
        let newItems = [...prevItems];

        for (const suggestion of suggestedOrganization) {
            if (suggestion.action === 'CREATE_FOLDER') {
                const now = new Date().toISOString();
                const newFolder: PageItem = {
                    id: `folder-${Date.now()}-${Math.random()}`,
                    name: suggestion.name,
                    type: 'folder',
                    parentId: suggestion.parentId,
                    createdAt: now,
                    updatedAt: now,
                };
                newItems.push(newFolder);
                tempIdMap.set(suggestion.tempId, newFolder.id);
            }
        }
        
        newItems = newItems.map(item => {
          let updatedItem = { ...item };
          for (const suggestion of suggestedOrganization) {
            if (suggestion.action === 'MOVE_ITEM' && suggestion.itemId === item.id) {
              const newParentId = tempIdMap.get(suggestion.newParentId!) || suggestion.newParentId;
              updatedItem.parentId = newParentId;
            }
            if (suggestion.action === 'RENAME_ITEM' && suggestion.itemId === item.id) {
              updatedItem.name = suggestion.newName;
            }
          }
          return updatedItem;
        });

        return newItems;
    });
    
    handleCloseOrganizeModal();
  };
  
  const handleCloseOrganizeModal = () => {
    setIsOrganizeModalOpen(false);
    setSuggestedOrganization(null);
    setOrganizationError(null);
  };


  if (isLoading) return <FullScreenLoader />;
  if (error) return <ErrorDisplay message={error} />;

  return (
    <div className="flex h-screen font-sans text-text">
      <Sidebar
        items={items}
        activeItemId={activeItemId}
        onSelectItem={setActiveItemId}
        onCreateItem={createItem}
        onDeleteItem={deleteItem}
        onUpdateItem={updateItem}
        onOrganize={handleOrganize}
        isOrganizing={isOrganizing}
        isVisible={sidebarVisible}
        toggleSidebar={() => setSidebarVisible(!sidebarVisible)}
        saveStatus={saveStatus}
        theme={theme}
        setTheme={setTheme}
      />
      <main className="flex-1 min-w-0">
        <Editor
          item={activeItem}
          childPages={activeItemChildren}
          onUpdate={updateItem}
          onCreate={createItem}
          onSelectItem={setActiveItemId}
          isSidebarVisible={sidebarVisible}
          toggleSidebar={() => setSidebarVisible(!sidebarVisible)}
        />
      </main>
      {saveStatus === 'error' && saveError && (
        <SaveErrorToast message={saveError} onClose={() => setSaveError(null)} onRetry={handleRetrySave} />
      )}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        items={items}
        onSelectItem={(id) => { setActiveItemId(id); setIsCommandPaletteOpen(false); }}
        onCreateItem={(...args) => { createItem(...args); setIsCommandPaletteOpen(false); }}
        toggleSidebar={() => { setSidebarVisible(v => !v); setIsCommandPaletteOpen(false); }}
      />
      <OrganizeAiModal
        isOpen={isOrganizeModalOpen}
        onClose={handleCloseOrganizeModal}
        onApply={applyOrganization}
        suggestions={suggestedOrganization}
        items={items}
        error={organizationError}
      />
    </div>
  );
}