import React from 'react';
import { LayoutGrid, List } from 'lucide-react';

const ViewToggle = ({ viewMode, setViewMode }) => {
  return (
    <div className="flex bg-slate-100/80 p-1 rounded-xl">
      <button 
        onClick={() => setViewMode('grid')}
        className={`p-2 rounded-lg transition-all ${
          viewMode === 'grid' 
            ? 'bg-white shadow-sm text-indigo-600' 
            : 'text-slate-400 hover:text-slate-600'
        }`}
        title="Grid View"
      >
        <LayoutGrid size={18} />
      </button>
      <button 
        onClick={() => setViewMode('list')}
        className={`p-2 rounded-lg transition-all ${
          viewMode === 'list' 
            ? 'bg-white shadow-sm text-indigo-600' 
            : 'text-slate-400 hover:text-slate-600'
        }`}
        title="List View"
      >
        <List size={18} />
      </button>
    </div>
  );
};

export default ViewToggle;
