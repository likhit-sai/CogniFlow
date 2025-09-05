
import React from 'react';

// FIX: Export the IconName type to be used in other components.
export type IconName = 'folder' | 'note' | 'plus' | 'trash' | 'edit' | 'close' | 'menu' | 'sparkles' | 'summarize' | 'improve' | 'brainstorm' | 'search' | 'check' | 'error' | 'database' | 'gallery' | 'table' | 'eye' | 'youtube' | 'spotify' | 'palette' | 'spreadsheet' | 'presentation' | 'play' | 'microphone' | 'stop' | 'chevron-left' | 'chevron-right' | 'calendar' | 'brush' | 'eraser' | 'page-plain' | 'page-lined' | 'page-grid' | 'page-dotted' | 'page-four-line' | 'text-recognition' | 'sun' | 'moon' | 'template' | 'logo';

interface IconProps {
  name: IconName;
  className?: string;
}

const ICONS: Record<IconName, JSX.Element> = {
  logo: (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad_icon_logo" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#A78BFA"/>
          <stop offset="100%" stopColor="#4F46E5"/>
        </linearGradient>
      </defs>
      <path fillRule="evenodd" clipRule="evenodd" d="M32 0C14.3269 0 0 14.3269 0 32C0 49.6731 14.3269 64 32 64C49.6731 64 64 49.6731 64 32C64 14.3269 49.6731 0 32 0ZM44.5 16C41.2 16 38.5 18.7 38.5 22C38.5 24.8 40.6 27.2 43.3 27.9L42.5 30.5C39.1 28.5 34.9 28.5 31.5 30.5L30.7 27.9C33.4 27.2 35.5 24.8 35.5 22C35.5 18.7 32.8 16 29.5 16C25.5 16 22.5 19.6 22.5 24.5C22.5 27.6 24 30.3 26.3 32C24 33.7 22.5 36.4 22.5 39.5C22.5 44.4 25.5 48 29.5 48C31.5 48 33.3 47.1 34.5 45.7L35.6 42.1C37.3 43.1 39.3 43.1 41 42L42.4 45.7C43.6 47.1 45.4 48 47.5 48C51.5 48 54.5 44.4 54.5 39.5C54.5 36.4 53 33.7 50.7 32C53 30.3 54.5 27.6 54.5 24.5C54.5 19.6 51.5 16 47.5 16H44.5Z" fill="url(#grad_icon_logo)"/>
    </svg>
  ),
  folder: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.75h16.5m-16.5 0A2.25 2.25 0 015.25 7.5h13.5a2.25 2.25 0 012.25 2.25m-18 0v6.75A2.25 2.25 0 005.25 18.75h13.5a2.25 2.25 0 002.25-2.25V9.75" />
    </svg>
  ),
  note: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  ),
  database: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5v10.5H3.75V6.75z M3.75 6.75A2.25 2.25 0 016 4.5h12a2.25 2.25 0 012.25 2.25 M3.75 17.25a2.25 2.25 0 002.25 2.25h12a2.25 2.25 0 002.25-2.25" />
    </svg>
  ),
  spreadsheet: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 4.5v15m6-15v15m-10.5-6h15m-15-6h15M3.75 4.5h16.5a2.25 2.25 0 012.25 2.25v10.5a2.25 2.25 0 01-2.25 2.25H3.75a2.25 2.25 0 01-2.25-2.25V6.75A2.25 2.25 0 013.75 4.5z" />
    </svg>
  ),
  presentation: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h12A2.25 2.25 0 0020.25 14.25V3M3.75 21h16.5M12 3v18m-3.75-9h7.5" />
    </svg>
  ),
  microphone: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 013-3 3 3 0 013 3v8.25a3 3 0 01-3 3z" />
    </svg>
  ),
  stop: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 7.5A2.25 2.25 0 017.5 5.25h9a2.25 2.25 0 012.25 2.25v9a2.25 2.25 0 01-2.25 2.25h-9a2.25 2.25 0 01-2.25-2.25v-9z" />
    </svg>
  ),
  play: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
    </svg>
  ),
  gallery: (
     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 6.75h4.5v4.5h-4.5v-4.5z M12.75 6.75h4.5v4.5h-4.5v-4.5z M6.75 12.75h4.5v4.5h-4.5v-4.5z M12.75 12.75h4.5v4.5h-4.5v-4.5z" />
    </svg>
  ),
  table: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75h16.5v16.5H3.75V3.75z M3.75 9.75h16.5 M3.75 15.75h16.5 M9.75 3.75v16.5 M15.75 3.75v16.5" />
    </svg>
  ),
    calendar: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0h18M7.5 12h.008v.008H7.5V12zm4.5 0h.008v.008H12v-.008zm4.5 0h.008v.008H16.5V12z" />
    </svg>
  ),
  brush: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.47 2.118v-.09A18.354 18.354 0 018.02 3.22c.07-.03.11-.1.11-.192v-1.5a2.25 2.25 0 012.25-2.25c1.24 0 2.25 1.01 2.25 2.25v1.5c0 .092.04.162.11.192A18.354 18.354 0 0121.98 19.35v.09a2.25 2.25 0 01-2.47-2.118 3 3 0 00-5.78-1.128z" />
    </svg>
  ),
  eraser: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 4.5l7.5 7.5-7.5 7.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 4.5l7.5 7.5-7.5 7.5" transform="matrix(-1 0 0 1 20.25 0)" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h18" />
    </svg>
  ),
  plus: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  ),
  trash: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  ),
  edit: (
     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" />
    </svg>
  ),
  close: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  menu: (
     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  ),
  sparkles: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM18 13.5a3.375 3.375 0 00-3.375-3.375L12.75 9.75l1.875-1.875a3.375 3.375 0 00-3.375-3.375L9.75 6.25 9 5.25l-.75 1.001a3.375 3.375 0 00-3.375 3.375L3 11.25l1.001.75a3.375 3.375 0 003.375 3.375L9 18.75l.75-1.001a3.375 3.375 0 003.375-3.375l1.875-1.875-1.875 1.875a3.375 3.375 0 003.375 3.375L18.75 18l1.001-.75a3.375 3.375 0 003.375-3.375l.001-2.25-1.001-.75z"/>
    </svg>
  ),
  summarize: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"/>
    </svg>
  ),
  improve: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125"/>
    </svg>
  ),
  brainstorm: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.184m-1.5.184a6.01 6.01 0 01-1.5-.184m3.75 3.636l-1.096-2.292a6.012 6.012 0 00-1.082-1.082L12 10.5m0 0l-2.292-1.096a6.012 6.012 0 01-1.082-1.082L6 6l2.292 1.096a6.012 6.012 0 011.082 1.082L12 10.5m0 0l2.292 1.096a6.012 6.012 0 001.082 1.082L18 14.25l-2.292-1.096a6.012 6.012 0 00-1.082-1.082L12 10.5z" />
    </svg>
  ),
  search: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  check: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  error: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  eye: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  youtube: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
      <path fillRule="evenodd" d="M19.802 5.802a.75.75 0 01.548.722l.001 10.952a.75.75 0 01-1.298.548l-9.35-6.102a.75.75 0 010-1.096l9.35-6.102a.75.75 0 01.75-.024zM4.5 5.25A3.75 3.75 0 00.75 9v6A3.75 3.75 0 004.5 18.75h15A3.75 3.75 0 0023.25 15V9A3.75 3.75 0 0019.5 5.25h-15zm15 1.5h-15a2.25 2.25 0 00-2.25 2.25v6c0 1.24 1.01 2.25 2.25 2.25h15a2.25 2.25 0 002.25-2.25V9a2.25 2.25 0 00-2.25-2.25z" clipRule="evenodd" />
    </svg>
  ),
  spotify: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 24C5.373 24 0 18.627 0 12S5.373 0 12 0s12 5.373 12 12-5.373 12-12 12zM8.214 14.739a.75.75 0 01-1.033-1.092 6.425 6.425 0 005.187-2.376.75.75 0 111.258.828 7.925 7.925 0 01-6.445 2.936v-.296zm-1.07-3.41a.75.75 0 01-1.06-1.06 9.426 9.426 0 007.41-3.64.75.75 0 111.3.751 10.926 10.926 0 01-8.62 4.22v-.271zm.015-3.52a.75.75 0 01-1.06-1.06c4.686-4.686 12.28-4.686 16.966 0a.75.75 0 11-1.06 1.06c-4.156-4.156-10.87-4.156-15.029-.083l.123.083z"/>
    </svg>
  ),
  palette: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.098 19.902a3.75 3.75 0 005.304 0l6.401-6.402a3.75 3.75 0 00-.615-5.883A3.75 3.75 0 009.7 4.098L3.297 10.5a3.75 3.75 0 000 5.304zm-1.03-1.03a5.25 5.25 0 010-7.424L9.12 4.39a5.25 5.25 0 017.424 0l.028.028a5.25 5.25 0 010 7.424l-6.402 6.401a5.25 5.25 0 01-7.424 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 7.5l.028.028a2.25 2.25 0 010 3.182l-3.204 3.203a2.25 2.25 0 01-3.182 0l-1.06-1.061a2.25 2.25 0 010-3.182l3.203-3.204a2.25 2.25 0 013.182 0l.028.028z" />
    </svg>
  ),
  'chevron-left': (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
    </svg>
  ),
  'chevron-right': (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
    </svg>
  ),
  'page-plain': (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  ),
  'page-lined': (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m-3 9h10.5m-10.5 3h10.5m-10.5-6h10.5M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  ),
  'page-grid': (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m-3 9h10.5m-10.5 3h10.5m-10.5-6h10.5m-4.5 9v-12m4.5 12v-12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  ),
  'page-dotted': (
    <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
      <circle cx="8" cy="10" r="1"></circle><circle cx="12" cy="10" r="1"></circle><circle cx="16" cy="10" r="1"></circle>
      <circle cx="8" cy="14" r="1"></circle><circle cx="12" cy="14" r="1"></circle><circle cx="16" cy="14" r="1"></circle>
      <circle cx="8" cy="18" r="1"></circle><circle cx="12" cy="18" r="1"></circle><circle cx="16" cy="18" r="1"></circle>
      <path d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m-2.625 19.5H18.375c.621 0 1.125-.504-1.125-1.125V11.25a9 9 0 00-9-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
    </svg>
  ),
  'page-four-line': (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path d="M5.625 8.25h10.5" stroke="#ef4444" />
        <path d="M5.625 11.25h10.5" stroke="#3b82f6" />
        <path d="M5.625 14.25h10.5" stroke="#3b82f6" />
        <path d="M5.625 17.25h10.5" stroke="#ef4444" />
        <path d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  'text-recognition': (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 19.5l-3.372.843.843-3.372L16.862 4.487zM19.5 8.25h-6M19.5 12h-6m-3.75-3.75h-3m3 3.75h-3" />
    </svg>
  ),
  sun: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.364l-1.591 1.591M21 12h-2.25m-.364 6.364l-1.591-1.591M12 18.75V21m-4.95-4.95l1.591-1.591M5.25 12H3m4.227-4.227l-1.591-1.591M12 12a4.5 4.5 0 000 9 4.5 4.5 0 000-9z" />
    </svg>
  ),
  moon: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
    </svg>
  ),
  template: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4h6v6H4V4zm0 8h6v6H4v-6zm8-8h6v6h-6V4zm0 8h6v6h-6v-6z" />
    </svg>
  ),
};

const Icon: React.FC<IconProps> = ({ name, className = 'w-5 h-5' }) => {
  return React.cloneElement(ICONS[name], { className });
};

export default Icon;
