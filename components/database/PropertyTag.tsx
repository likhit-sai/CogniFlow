
import React from 'react';
import { PropertySchema, PropertyOption } from '../../types';

interface PropertyTagProps {
  schema: PropertySchema;
  value: string | string[];
}

const Tag: React.FC<{ option: PropertyOption }> = ({ option }) => (
    <span className={`px-2 py-0.5 text-xs font-medium rounded-full text-white ${option.color}`}>
        {option.name}
    </span>
);

const PropertyTag: React.FC<PropertyTagProps> = ({ schema, value }) => {
  if (!value || !schema.options) return null;

  if (schema.type === 'status') {
    const option = schema.options.find(o => o.id === value);
    return option ? <Tag option={option} /> : null;
  }

  if (schema.type === 'tag' && Array.isArray(value)) {
    const selectedOptions = schema.options.filter(o => value.includes(o.id));
    return (
      <div className="flex flex-wrap gap-1">
        {selectedOptions.map(opt => <Tag key={opt.id} option={opt} />)}
      </div>
    );
  }
  
  if (schema.type === 'date') {
      return <span className="text-sm text-gray-300">{value}</span>;
  }

  return <span className="text-sm text-gray-300 truncate">{String(value)}</span>;
};

export default PropertyTag;