import React from 'react';
import './globals.css';
import QuickSearch from './quick-search';

export const metadata = { title: 'Tirbeo Admin', description: 'Manage the Tirbeo platform' };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script dangerouslySetInnerHTML={{
          __html: `(function(){try{var t=localStorage.getItem('tirbeo-theme')||'dark';document.documentElement.setAttribute('data-theme',t);}catch(e){}})()`,
        }} />
      </head>
      <body>
        {children}
        <QuickSearch />
      </body>
    </html>
  );
}
