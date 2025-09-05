
import React from 'react';
import { PageItem, ItemType } from '../../types';
import PropertyTag from './PropertyTag';
import Icon from '../Icon';

interface TableViewProps {
  database: PageItem;
  pages: PageItem[];
  onUpdatePage: (id: string, updates: Partial<PageItem>) => void;
  onCreatePage: (name: string, type: ItemType, parentId: string | null, options?: { setActive?: boolean, properties?: Record<string, any> }) => void;
  onSelectItem: (id: string) => void;
}

const TableView: React.FC<TableViewProps> = ({ database, pages, onUpdatePage, onCreatePage, onSelectItem }) => {
    
    const handleCreatePage = () => {
        onCreatePage('Untitled', 'page', database.id);
    }
    
    return (
        <div className="p-4 h-full">
            <div className="w-full overflow-auto h-full">
                <table className="w-full text-sm text-left text-text">
                    <thead className="text-xs text-text-dim uppercase bg-surface sticky top-0">
                        <tr>
                            {database.schema?.map(prop => (
                                <th key={prop.id} scope="col" className="px-6 py-3 font-medium">
                                    {prop.name}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {pages.map(page => (
                            <tr key={page.id} onClick={() => onSelectItem(page.id)} className="border-b border-border hover:bg-white/5 transition-colors cursor-pointer">
                                {database.schema?.map((prop, index) => (
                                    <td key={prop.id} className="px-6 py-4">
                                        {index === 0 ? (
                                             <div className="flex items-center gap-2">
                                                {page.icon && <span>{page.icon}</span>}
                                                <span className="font-medium text-text-bright">{page.properties?.[prop.id] || page.name}</span>
                                            </div>
                                        ) : (
                                            <PropertyTag schema={prop} value={page.properties?.[prop.id]} />
                                        )}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
                 <button
                    onClick={handleCreatePage}
                    className="flex items-center gap-2 px-6 py-4 text-text-dim hover:text-accent transition-colors w-full"
                >
                    <Icon name="plus" className="w-4 h-4" />
                    New
                </button>
            </div>
        </div>
    );
};

export default TableView;