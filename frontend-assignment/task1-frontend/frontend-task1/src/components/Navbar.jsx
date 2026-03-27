import React from 'react';

const Navbar = ({ title, description, children }) => {
  return (
    <header className="flex justify-between items-end mb-12">
      <div>
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">{title}</h1>
        {description && <p className="text-slate-500 mt-2 font-medium">{description}</p>}
      </div>
      {children && (
        <div className="flex items-center gap-4">
          {children}
        </div>
      )}
    </header>
  );
};

export default Navbar;
