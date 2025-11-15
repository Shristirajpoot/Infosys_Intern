import React from 'react';
const Icon = ({ name, className }) => {
  const icons = {
    LayoutDashboard: <path stroke="#000000" strokeWidth="2" d="M4 5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5ZM14 5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1V5ZM4 16a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-3ZM14 13a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-6Z"/>
,
    Briefcase: <><path d="M15.94 7.61999L11.06 9.61999C10.7251 9.75225 10.421 9.95185 10.1664 10.2064C9.91185 10.461 9.71225 10.7651 9.57999 11.1L7.57999 15.98C7.54715 16.0636 7.54869 16.1567 7.58429 16.2392C7.61988 16.3216 7.68664 16.3866 7.76999 16.42C7.85065 16.4499 7.93934 16.4499 8.02 16.42L12.9 14.42C13.2348 14.2877 13.539 14.0881 13.7936 13.8336C14.0481 13.579 14.2477 13.2748 14.38 12.94L16.38 8.05999C16.4128 7.97643 16.4113 7.88326 16.3757 7.80082C16.3401 7.71839 16.2733 7.65338 16.19 7.61999C16.1093 7.59013 16.0207 7.59013 15.94 7.61999ZM12 13C11.8022 13 11.6089 12.9413 11.4444 12.8315C11.28 12.7216 11.1518 12.5654 11.0761 12.3827C11.0004 12.2 10.9806 11.9989 11.0192 11.8049C11.0578 11.6109 11.153 11.4327 11.2929 11.2929C11.4327 11.153 11.6109 11.0578 11.8049 11.0192C11.9989 10.9806 12.2 11.0004 12.3827 11.0761C12.5654 11.1518 12.7216 11.28 12.8315 11.4444C12.9413 11.6089 13 11.8022 13 12C13 12.2652 12.8946 12.5196 12.7071 12.7071C12.5196 12.8946 12.2652 13 12 13Z" fill="#000000"/>
<path d="M12 21C10.22 21 8.47991 20.4722 6.99987 19.4832C5.51983 18.4943 4.36628 17.0887 3.68509 15.4442C3.0039 13.7996 2.82567 11.99 3.17294 10.2442C3.5202 8.49836 4.37737 6.89472 5.63604 5.63604C6.89472 4.37737 8.49836 3.5202 10.2442 3.17294C11.99 2.82567 13.7996 3.0039 15.4442 3.68509C17.0887 4.36628 18.4943 5.51983 19.4832 6.99987C20.4722 8.47991 21 10.22 21 12C21 14.387 20.0518 16.6761 18.364 18.364C16.6761 20.0518 14.387 21 12 21ZM12 4.5C10.5166 4.5 9.0666 4.93987 7.83323 5.76398C6.59986 6.58809 5.63856 7.75943 5.07091 9.12988C4.50325 10.5003 4.35473 12.0083 4.64411 13.4632C4.9335 14.918 5.64781 16.2544 6.6967 17.3033C7.7456 18.3522 9.08197 19.0665 10.5368 19.3559C11.9917 19.6453 13.4997 19.4968 14.8701 18.9291C16.2406 18.3614 17.4119 17.4001 18.236 16.1668C19.0601 14.9334 19.5 13.4834 19.5 12C19.5 10.0109 18.7098 8.10323 17.3033 6.6967C15.8968 5.29018 13.9891 4.5 12 4.5Z" fill="#000000"/></>
,
    CalendarCheck: <path d="M3 9H21M9 15L11 17L15 13M7 3V5M17 3V5M6.2 21H17.8C18.9201 21 19.4802 21 19.908 20.782C20.2843 20.5903 20.5903 20.2843 20.782 19.908C21 19.4802 21 18.9201 21 17.8V8.2C21 7.07989 21 6.51984 20.782 6.09202C20.5903 5.71569 20.2843 5.40973 19.908 5.21799C19.4802 5 18.9201 5 17.8 5H6.2C5.0799 5 4.51984 5 4.09202 5.21799C3.71569 5.40973 3.40973 5.71569 3.21799 6.09202C3 6.51984 3 7.07989 3 8.2V17.8C3 18.9201 3 19.4802 3.21799 19.908C3.40973 20.2843 3.71569 20.5903 4.09202 20.782C4.51984 21 5.07989 21 6.2 21Z" stroke="#000000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>,
    MessageSquare: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" role="img" aria-label="Message Square">
  <title>MessageSquare</title>
  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" 
        fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
</svg>
,
    User: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" role="img" aria-label="User">
  <title>User</title>
  <circle cx="12" cy="7" r="4" fill="none" stroke="currentColor" strokeWidth="2"/>
  <path d="M5.5 21a8.38 8.38 0 0 1 13 0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
</svg>
,
    LogOut: <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />,
    Menu: <line x1="4" x2="20" y1="12" y2="12" />,
    Search: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" role="img" aria-label="Search">
  <title>Search</title>
  <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" fill="none"/>
  <line x1="16.65" y1="16.65" x2="21" y2="21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
</svg>
,
    Trash2: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-recycle-icon lucide-recycle"><path d="M7 19H4.815a1.83 1.83 0 0 1-1.57-.881 1.785 1.785 0 0 1-.004-1.784L7.196 9.5"/><path d="M11 19h8.203a1.83 1.83 0 0 0 1.556-.89 1.784 1.784 0 0 0 0-1.775l-1.226-2.12"/><path d="m14 16-3 3 3 3"/><path d="M8.293 13.596 7.196 9.5 3.1 10.598"/><path d="m9.344 5.811 1.093-1.892A1.83 1.83 0 0 1 11.985 3a1.784 1.784 0 0 1 1.546.888l3.943 6.843"/><path d="m13.378 9.633 4.096 1.098 1.097-4.096"/></svg>
,
    BarChart3: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" role="img" aria-label="Signal">
  <title>Signal</title>
  <rect x="2" y="18" width="3" height="4" rx="1" fill="none" stroke="currentColor" strokeWidth="1.6"/>
  <rect x="7" y="14" width="3" height="8" rx="1" fill="none" stroke="currentColor" strokeWidth="1.6"/>
  <rect x="12" y="10" width="3" height="12" rx="1" fill="none" stroke="currentColor" strokeWidth="1.6"/>
  <rect x="17" y="6" width="3" height="16" rx="1" fill="none" stroke="currentColor" strokeWidth="1.6"/>
</svg>

,
    CheckCircle: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" role="img" aria-label="Circle Tick">
  <title>Circle with Tick</title>
  <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2"/>
  <path d="M9 12l2 2 4-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
</svg>
,
    UserCheck: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" role="img" aria-label="User with check">
  <title>User with check</title>
  <circle cx="9" cy="7" r="4" fill="none" stroke="currentColor" strokeWidth="2"/>
  <path d="M3 21c0-4 3-7 6-7h0c3 0 6 3 6 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  <circle cx="18" cy="17" r="5" fill="none" stroke="currentColor" strokeWidth="2"/>
  <path d="M16 17l2 2 3-3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
</svg>
,
    Clock: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" role="img" aria-label="Clock">
  <title>Clock</title>
  <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2"/>
  <path d="M12 7v5l3 3" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
</svg>
,
    ChevronRight: <path d="m9 18 6-6-6-6" />,
    PackageCheck: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" role="img" aria-label="Info">
  <title>Info</title>
  <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2"/>
  <line x1="12" y1="16" x2="12" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  <circle cx="12" cy="8" r="1" fill="currentColor"/>
</svg>
,
    Sparkles: <path d="m12 3-1.5 3L7 7.5l3 1.5L12 12l1.5-3 3-1.5-3-1.5Z" />,
    BellRing: <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />,
    Facebook: <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />,
    Twitter: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 1227" width="24" height="24" role="img" aria-label="X">
  <title>X</title>
  <path fill="currentColor" d="M714.163 519.284L1160.89 0H1061.1L667.137 450.887L358.61 0H0L468.328 681.821L0 1226.37H99.792L511.59 739.602L841.39 1226.37H1200L714.137 519.284H714.163ZM558.875 678.998L517.003 619.612L136.53 79.694H303.697L601.41 511.323L643.282 570.708L1062.57 1147.95H895.406L558.875 678.998Z"/>
</svg>
,
    Instagram: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" role="img" aria-label="Instagram">
  <title>Instagram</title>
  <rect x="3" y="3" width="18" height="18" rx="5" ry="5" fill="none" stroke="currentColor" stroke-width="1.6"/>
  <circle cx="12" cy="11" r="3.2" fill="none" stroke="currentColor" stroke-width="1.6"/>
  <circle cx="17.5" cy="6.5" r="0.9" fill="currentColor"/>
</svg>
,
    Linkedin: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" role="img" aria-label="LinkedIn">
  <title>LinkedIn</title>
  <rect x="2" y="2" width="20" height="20" rx="2" ry="2" fill="none" stroke="currentColor" stroke-width="1.6"/>
  <path d="M8 11v7M8 7v.01M12 18v-7c0-1.5 1-2.5 2.5-2.5S17 9 17 11v7" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
</svg>
,
    EcoLogo: <><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></>
  };
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      {icons[name] || <circle cx="12" cy="12" r="10" />}
    </svg>
  );
};
export default Icon;
