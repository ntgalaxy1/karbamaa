// Self-contained, zero-network-dependency inline SVG Data URIs for Karbama logos, user avatars, and job card banners.
// Guarantees crisp rendering across Light Mode, Dark Mode, offline mode, and any hosting environment.

const encodeSvgDataUri = (svg: string): string =>
  `data:image/svg+xml;utf8,${encodeURIComponent(svg.trim())}`;

export const KARBAMA_LOGO_FALLBACK_DATA_URI = encodeSvgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
  <defs>
    <linearGradient id="kbBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0F172A" />
      <stop offset="55%" stop-color="#1E3A8A" />
      <stop offset="100%" stop-color="#991B1B" />
    </linearGradient>
    <linearGradient id="kbGold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FDE68A" />
      <stop offset="50%" stop-color="#F59E0B" />
      <stop offset="100%" stop-color="#D97706" />
    </linearGradient>
  </defs>
  <circle cx="128" cy="128" r="124" fill="url(#kbBg)" stroke="url(#kbGold)" stroke-width="8" />
  <circle cx="128" cy="128" r="108" fill="none" stroke="#F59E0B" stroke-opacity="0.35" stroke-width="2" />
  <!-- Turkish Crescent & Star Accent -->
  <circle cx="84" cy="70" r="22" fill="#E11D48" />
  <circle cx="90" cy="68" r="17" fill="#1E3A8A" />
  <polygon points="109,62 111,68 117,68 112,72 114,78 109,74 104,78 106,72 101,68 107,68" fill="#FDE68A" />
  <!-- Bold Gold K Emblem -->
  <path d="M86 84 H108 V124 L144 84 H172 L132 126 L175 176 H147 L115 138 L108 145 V176 H86 Z" fill="url(#kbGold)" />
  <!-- Bottom Brand Label -->
  <rect x="46" y="186" width="164" height="30" rx="15" fill="#0F172A" fill-opacity="0.85" stroke="#F59E0B" stroke-width="1.5" />
  <text x="128" y="206" font-family="system-ui, -apple-system, sans-serif" font-size="16" font-weight="900" fill="#FDE68A" text-anchor="middle" letter-spacing="2">KARBAMA</text>
</svg>
`);

export const KARBAMA_LOGO_DATA_URI = '/logo.png';

export const KARBAMA_USER_AVATAR_DATA_URI = encodeSvgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
  <defs>
    <linearGradient id="uBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1E3A8A" />
      <stop offset="100%" stop-color="#2563EB" />
    </linearGradient>
  </defs>
  <circle cx="64" cy="64" r="62" fill="url(#uBg)" stroke="#93C5FD" stroke-width="4" />
  <circle cx="64" cy="46" r="20" fill="#FFFFFF" />
  <path d="M28 106 C28 84 44 74 64 74 C84 74 100 84 100 106" fill="#FFFFFF" />
</svg>
`);

export const KARBAMA_PARTNER_AVATAR_DATA_URI = encodeSvgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
  <defs>
    <linearGradient id="pBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#312E81" />
      <stop offset="100%" stop-color="#4F46E5" />
    </linearGradient>
  </defs>
  <circle cx="64" cy="64" r="62" fill="url(#pBg)" stroke="#A5B4FC" stroke-width="4" />
  <rect x="34" y="46" width="60" height="44" rx="8" fill="#FFFFFF" />
  <path d="M48 46 V38 C48 33 52 30 57 30 H71 C76 30 80 33 80 38 V46" fill="none" stroke="#FFFFFF" stroke-width="6" stroke-linecap="round" />
  <circle cx="64" cy="68" r="7" fill="#4F46E5" />
</svg>
`);

export const KARBAMA_SUPPORT_AVATAR_DATA_URI = encodeSvgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
  <defs>
    <linearGradient id="sBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#065F46" />
      <stop offset="100%" stop-color="#10B981" />
    </linearGradient>
  </defs>
  <circle cx="64" cy="64" r="62" fill="url(#sBg)" stroke="#FCD34D" stroke-width="4" />
  <path d="M64 26 L94 38 V62 C94 83 81 99 64 106 C47 99 34 83 34 62 V38 Z" fill="#FFFFFF" />
  <path d="M53 65 L61 73 L77 55" fill="none" stroke="#065F46" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" />
</svg>
`);

export const getJobCategorySvgDataUri = (category?: string, city?: string): string => {
  const palettes: Record<string, { c1: string; c2: string; accent: string; label: string }> = {
    restaurant: { c1: '#7C2D12', c2: '#B91C1C', accent: '#FBBF24', label: 'RESTAURANT & CULINARY' },
    textile: { c1: '#1E3A8A', c2: '#3730A3', accent: '#38BDF8', label: 'TEXTILE & GARMENT' },
    construction: { c1: '#1E293B', c2: '#0F172A', accent: '#F59E0B', label: 'CONSTRUCTION & TECHNICAL' },
    hotel: { c1: '#064E3B', c2: '#0F766E', accent: '#34D399', label: 'HOTEL & HOSPITALITY' },
    beauty: { c1: '#701A75', c2: '#9D174D', accent: '#F472B6', label: 'BEAUTY & STYLING' },
    warehouse: { c1: '#1E3A8A', c2: '#0F172A', accent: '#60A5FA', label: 'LOGISTICS & PACKAGING' },
    translator: { c1: '#065F46', c2: '#1E3A8A', accent: '#2DD4BF', label: 'MEDICAL & TRANSLATION' },
  };
  const chosen = palettes[category || ''] || {
    c1: '#0F172A',
    c2: '#1E3A8A',
    accent: '#10B981',
    label: 'KARBAMA VERIFIED JOB',
  };
  const safeCity = (city || 'TURKEY').slice(0, 24);

  return encodeSvgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 400" width="800" height="400">
  <defs>
    <linearGradient id="jBg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${chosen.c1}" />
      <stop offset="100%" stop-color="${chosen.c2}" />
    </linearGradient>
  </defs>
  <rect width="800" height="400" fill="url(#jBg)" />
  <circle cx="680" cy="90" r="180" fill="${chosen.accent}" fill-opacity="0.12" />
  <circle cx="120" cy="340" r="140" fill="#FFFFFF" fill-opacity="0.06" />
  <g transform="translate(340, 95)">
    <rect x="0" y="24" width="120" height="86" rx="18" fill="#FFFFFF" fill-opacity="0.16" stroke="${chosen.accent}" stroke-width="4" />
    <path d="M36 24 V12 C36 5 42 0 50 0 H70 C78 0 84 5 84 12 V24" fill="none" stroke="${chosen.accent}" stroke-width="6" stroke-linecap="round" />
    <circle cx="60" cy="67" r="12" fill="${chosen.accent}" />
  </g>
  <text x="400" y="255" font-family="system-ui, -apple-system, sans-serif" font-size="24" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="3">${chosen.label}</text>
  <text x="400" y="292" font-family="system-ui, -apple-system, sans-serif" font-size="18" font-weight="700" fill="${chosen.accent}" text-anchor="middle">KARBAMA34.IR • ${safeCity}</text>
</svg>
  `);
};

// Official Shaparak (شبکه الکترونیکی پرداخت کارت - شاپرک) Emblem SVG
export const SHAPARAK_LOGO_DATA_URI = encodeSvgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
  <defs>
    <linearGradient id="shpGold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F59E0B" />
      <stop offset="100%" stop-color="#B45309" />
    </linearGradient>
    <linearGradient id="shpBlue" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1E40AF" />
      <stop offset="100%" stop-color="#0F172A" />
    </linearGradient>
    <linearGradient id="shpCyan" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0284C7" />
      <stop offset="100%" stop-color="#1D4ED8" />
    </linearGradient>
  </defs>
  <rect x="4" y="4" width="112" height="112" rx="24" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="3" />
  <!-- Shaparak Tri-Wing Geometric Emblem -->
  <polygon points="60,16 86,44 60,58 34,44" fill="url(#shpGold)" />
  <polygon points="24,48 56,62 46,94 18,74" fill="url(#shpBlue)" />
  <polygon points="96,48 102,74 74,94 64,62" fill="url(#shpCyan)" />
  <circle cx="60" cy="58" r="6" fill="#FFFFFF" />
  <text x="60" y="109" font-family="Tahoma, system-ui, sans-serif" font-size="14" font-weight="900" fill="#0F172A" text-anchor="middle">شاپرک</text>
</svg>
`);

// Official SEP / Saman Electronic Payment (پرداخت الکترونیک سامان - سپ) Emblem SVG
export const SEP_LOGO_DATA_URI = encodeSvgDataUri(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
  <defs>
    <linearGradient id="sepBlue" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0284C7" />
      <stop offset="50%" stop-color="#0369A1" />
      <stop offset="100%" stop-color="#1E3A8A" />
    </linearGradient>
  </defs>
  <rect x="4" y="4" width="112" height="112" rx="24" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="3" />
  <!-- Saman SEP Circle & Dual Wave Emblem -->
  <circle cx="60" cy="48" r="31" fill="url(#sepBlue)" />
  <path d="M35 45 C45 32, 62 32, 72 44 C78 51, 84 48, 88 42" fill="none" stroke="#38BDF8" stroke-width="5.5" stroke-linecap="round" />
  <path d="M32 55 C44 43, 60 44, 71 56 C77 62, 83 59, 86 53" fill="none" stroke="#FFFFFF" stroke-width="5.5" stroke-linecap="round" />
  <text x="60" y="96" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="900" fill="#0369A1" text-anchor="middle" letter-spacing="1">SEP</text>
  <text x="60" y="110" font-family="Tahoma, system-ui, sans-serif" font-size="11" font-weight="900" fill="#0F172A" text-anchor="middle">پرداخت سپ</text>
</svg>
`);

