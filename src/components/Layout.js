import React from 'react';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center p-4 font-sans antialiased">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-4xl w-full text-center border border-gray-200">
        {children}
      </div>
    </div>
  );
};

export default Layout;