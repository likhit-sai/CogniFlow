
import React from 'react';
import { PageItem, ItemType } from '../../types';
import PropertyTag from './PropertyTag';
import Icon from '../Icon';

interface GalleryViewProps {
  database: PageItem;
  pages: PageItem[];
  onUpdatePage: (id: string, updates: Partial<PageItem>) => void;
  onCreatePage: (name: string, type: ItemType, parentId: string | null, options?: { setActive?: boolean, properties?: Record<string, any> }) => void;
  onSelectItem: (id: string) => void;
}

const GalleryCard: React.FC<{ page: PageItem, database: PageItem, onSelectItem: (id: string) => void }> = ({ page, database, onSelectItem }) => {
    return (
        <div onClick={() => onSelectItem(page.id)} className="bg-surface rounded-lg overflow-hidden border border-border group cursor-pointer hover:border-border-hover transition-all duration-200 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary">
            <div className="h-32 bg-primary">
                {page.coverImage && <img src={page.coverImage} alt={page.name} className="w-full h-full object-cover" />}
            </div>
            <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                    {page.icon && <span className="text-xl">{page.icon}</span>}
                    <h3 className="font-semibold text-text-bright truncate">{page.name}</h3>
                </div>
                 <div className="space-y-2 mt-2">
                    {database.schema?.slice(1, 4).map(prop => (
                        <div key={prop.id} className="flex items-center text-xs">
                            <span className="w-20 text-text-dim truncate">{prop.name}</span>
                            <div className="flex-1">
                                <PropertyTag schema={prop} value={page.properties?.[prop.id]} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const GalleryView: React.FC<GalleryViewProps> = ({ database, pages, onUpdatePage, onCreatePage, onSelectItem }) => {

    const handleCreatePage = () => {
        onCreatePage('Untitled', 'page', database.id);
    }
    
    return (
        <div className="p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {pages.map(page => (
                    <GalleryCard key={page.id} page={page} database={database} onSelectItem={onSelectItem} />
                ))}
                 <button 
                    onClick={handleCreatePage}
                    className="flex items-center justify-center bg-surface rounded-lg border-2 border-dashed border-border hover:border-accent hover:text-accent transition-all text-text-dim min-h-[240px]">
                    <Icon name="plus" className="w-6 h-6 mr-2" />
                    New Page
                </button>
            </div>
        </div>
    );
};

export default GalleryView;