import React from 'react';

const Navbar = ({ title, description, children }) => {
  return (
    <header className="flex flex-col sm:flex-row sm:justify-between sm:items-end mb-8 sm:mb-12 gap-4">
      <div className="min-w-0">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">{title}</h1>
        {description && <p className="text-slate-500 mt-1 sm:mt-2 font-medium text-sm sm:text-base">{description}</p>}
      </div>
      {children && (
        <div className="flex items-center gap-3 sm:gap-4 flex-wrap shrink-0">
          {children}
        </div>
      )}
    </header>
  );
};

export default Navbar;
