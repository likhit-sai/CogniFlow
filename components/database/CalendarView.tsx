
import React, { useState, useMemo } from 'react';
import { PageItem, ItemType } from '../../types';
import Icon from '../Icon';

interface CalendarViewProps {
  database: PageItem;
  pages: PageItem[];
  onCreatePage: (name: string, type: ItemType, parentId: string | null, options?: { setActive?: boolean; properties?: Record<string, any>; }) => void;
  onSelectItem: (id: string) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ database, pages, onCreatePage, onSelectItem }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const dateProperty = useMemo(() =>
      database.schema?.find(prop => prop.type === 'date'),
      [database.schema]
    );

    const eventsByDate = useMemo(() => {
        if (!dateProperty) return new Map<string, PageItem[]>();
        const map = new Map<string, PageItem[]>();
        pages.forEach(page => {
          const dateValue = page.properties?.[dateProperty.id];
          if (typeof dateValue === 'string') { // Dates are stored as 'YYYY-MM-DD'
            if (!map.has(dateValue)) {
              map.set(dateValue, []);
            }
            map.get(dateValue)?.push(page);
          }
        });
        return map;
      }, [pages, dateProperty]
    );

    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const startDate = new Date(startOfMonth);
    startDate.setDate(startDate.getDate() - startOfMonth.getDay());
    const endDate = new Date(endOfMonth);
    endDate.setDate(endDate.getDate() + (6 - endOfMonth.getDay()));

    const calendarDays: { date: Date, isCurrentMonth: boolean }[] = [];
    let day = new Date(startDate);
    while (day <= endDate) {
        calendarDays.push({ date: new Date(day), isCurrentMonth: day.getMonth() === currentDate.getMonth() });
        day.setDate(day.getDate() + 1);
    }
    
    const today = new Date();
    const isToday = (date: Date) => date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();

    const goToPreviousMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    const goToNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    const goToToday = () => setCurrentDate(new Date());

    const handleCreatePageOnDate = (date: Date) => {
        if (!dateProperty) return;
        const properties = { [dateProperty.id]: date.toISOString().split('T')[0] };
        onCreatePage('Untitled Event', 'page', database.id, { setActive: false, properties });
    };

    if (!dateProperty) {
        return <div className="p-8 text-center text-text-dim">To use the calendar view, add a 'date' property to your database schema.</div>;
    }

    return (
        <div className="flex flex-col h-full text-text p-4">
            <header className="flex items-center justify-between mb-4 px-2">
                <div className="flex items-center gap-2">
                    <button onClick={goToToday} className="px-4 py-1.5 text-sm font-semibold rounded-md bg-white/10 hover:bg-white/20 transition-colors">Today</button>
                    <button onClick={goToPreviousMonth} className="p-2 rounded-md hover:bg-white/10"><Icon name="chevron-left" className="w-5 h-5"/></button>
                    <button onClick={goToNextMonth} className="p-2 rounded-md hover:bg-white/10"><Icon name="chevron-right" className="w-5 h-5"/></button>
                </div>
                <h2 className="text-xl font-bold text-text-bright">
                    {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </h2>
            </header>
            <div className="grid grid-cols-7 flex-1 border-t border-l border-border min-h-0">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(dayName => (
                    <div key={dayName} className="text-center p-2 text-xs font-bold uppercase text-text-dim border-b border-border">{dayName}</div>
                ))}
                {calendarDays.map(({ date, isCurrentMonth }, index) => {
                    const dateString = date.toISOString().split('T')[0];
                    const dayEvents = eventsByDate.get(dateString) || [];
                    return (
                        <div key={index} className={`relative p-2 border-b border-r border-border group flex flex-col min-h-[120px] ${isCurrentMonth ? '' : 'bg-primary/50'}`}>
                            <div className="flex justify-between items-center">
                                <span className={`text-sm font-medium ${isToday(date) ? 'bg-accent text-primary rounded-full w-7 h-7 flex items-center justify-center' : ''} ${isCurrentMonth ? 'text-text' : 'text-text-dim'}`}>
                                    {date.getDate()}
                                </span>
                                <button onClick={() => handleCreatePageOnDate(date)} className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-white/10 transition-opacity">
                                    <Icon name="plus" className="w-4 h-4 text-text-dim"/>
                                </button>
                            </div>
                            <div className="mt-1 space-y-1 overflow-y-auto">
                                {dayEvents.map(event => (
                                    <div key={event.id} onClick={() => onSelectItem(event.id)} className="p-1.5 bg-surface rounded-md text-xs cursor-pointer hover:bg-border-hover">
                                        <p className="text-text-bright truncate">{event.icon} {event.name}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default CalendarView;
