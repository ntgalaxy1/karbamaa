import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import { useApp } from '../context/AppContext';
import {
  MapPin,
  Building2,
  Landmark,
  Train,
  HeartPulse,
  Coins,
  Hotel as HotelIcon,
  Navigation,
  Phone,
  Clock,
  Search,
  Crosshair,
  Layers,
  Maximize2,
  Minimize2,
  ChevronDown,
  ChevronUp,
  Info,
  Calendar,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import { EssentialAddress, Hotel, TransitHub } from '../types';

export interface MapPoint {
  id: string;
  title: string;
  titleTr: string;
  category: 'embassy' | 'immigration' | 'transit' | 'hospital' | 'exchange' | 'hotel' | 'emergency' | 'police';
  city: string;
  district: string;
  address: string;
  lat: number;
  lng: number;
  phone?: string;
  phones?: string[];
  workingHours?: string;
  description: string;
  mapsUrl?: string;
  badge?: string;
  color: string;
  extra?: {
    pricePerNight?: number;
    stars?: number;
    lines?: string[];
    connections?: string;
    isEmergency24h?: boolean;
    hotelType?: string;
  };
  distanceKm?: number;
  rawItem?: any;
}

export const calculateDistanceKm = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
};

const CITY_PRESETS = [
  { name: 'استانبول', lat: 41.015, lng: 28.97, zoom: 12 },
  { name: 'آنکارا', lat: 39.925, lng: 32.85, zoom: 12 },
  { name: 'آنتالیا', lat: 36.89, lng: 30.70, zoom: 12 },
  { name: 'ترابزون', lat: 41.002, lng: 39.716, zoom: 13 },
  { name: 'ارزروم', lat: 39.905, lng: 41.276, zoom: 13 },
];

const CATEGORY_CONFIG: Record<string, { label: string; color: string; icon?: string }> = {
  all: { label: 'همه مکان‌ها', color: '#64748b' },
  embassy: { label: 'سفارت و کنسولگری', color: '#ef4444', icon: '🏛️' },
  immigration: { label: 'اداره مهاجرت (Göç)', color: '#10b981', icon: '📋' },
  transit: { label: 'متروبوس و ایستگاه‌ها', color: '#3b82f6', icon: '🚇' },
  hotel: { label: 'هتل‌ها و خوابگاه', color: '#f59e0b', icon: '🏨' },
  hospital: { label: 'بیمارستان و درمانی', color: '#f43f5e', icon: '🏥' },
  emergency: { label: 'اورژانس ۲۴ ساعته', color: '#e11d48', icon: '🚨' },
  police: { label: 'پلیس و امنیت', color: '#0284c7', icon: '👮' },
  exchange: { label: 'صرافی و ارزی', color: '#8b5cf6', icon: '💱' },
};

const TILE_LAYERS = {
  cartoDark: {
    name: 'تاریک مدرن (پیش‌فرض)',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; OpenStreetMap &copy; CARTO',
  },
  osm: {
    name: 'نقشه استاندارد شهری',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors',
  },
};

interface InteractiveMapProps {
  initialCity?: string;
  focusedLocationId?: string | null;
  onSelectLocation?: (location: MapPoint) => void;
  onBookHotel?: (hotel: Hotel) => void;
  heightClass?: string;
  showCategoryFilters?: boolean;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  initialCity = 'استانبول',
  focusedLocationId = null,
  onSelectLocation,
  onBookHotel,
  heightClass = 'h-[520px]',
  showCategoryFilters = true,
}) => {
  const { addresses, hotels, transitHubs, showToast } = useApp();

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  const [selectedCity, setSelectedCity] = useState<string>(initialCity);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activePoint, setActivePoint] = useState<MapPoint | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [selectedTileStyle, setSelectedTileStyle] = useState<'cartoDark' | 'osm'>('cartoDark');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [showDrawer, setShowDrawer] = useState<boolean>(true);

  // Compile unified map points
  const allPoints: MapPoint[] = useMemo(() => {
    const list: MapPoint[] = [];

    // 1. Essential Addresses
    addresses.forEach((addr) => {
      if (!addr.coordinates) return;
      let color = '#ef4444';
      if (addr.category === 'immigration') color = '#10b981';
      else if (addr.category === 'hospital') color = '#f43f5e';
      else if (addr.category === 'exchange') color = '#8b5cf6';
      else if (addr.category === 'emergency') color = '#e11d48';
      else if (addr.category === 'police') color = '#0284c7';

      const distanceKm = userLocation
        ? calculateDistanceKm(userLocation.lat, userLocation.lng, addr.coordinates.lat, addr.coordinates.lng)
        : undefined;

      list.push({
        id: addr.id,
        title: addr.title,
        titleTr: addr.titleTr,
        category: addr.category,
        city: addr.city,
        district: addr.district,
        address: addr.address,
        lat: addr.coordinates.lat,
        lng: addr.coordinates.lng,
        phones: addr.phones,
        phone: addr.phones[0],
        workingHours: addr.workingHours,
        description: addr.description,
        mapsUrl: addr.mapsUrl,
        badge: addr.isEmergency24h ? '۲۴ ساعته شبانه‌روزی' : undefined,
        color,
        distanceKm,
        extra: {
          isEmergency24h: addr.isEmergency24h,
        },
        rawItem: addr,
      });
    });

    // 2. Hotels
    hotels.forEach((hotel) => {
      if (!hotel.coordinates) return;
      const distanceKm = userLocation
        ? calculateDistanceKm(userLocation.lat, userLocation.lng, hotel.coordinates.lat, hotel.coordinates.lng)
        : undefined;

      list.push({
        id: hotel.id,
        title: hotel.name,
        titleTr: hotel.nameTr,
        category: 'hotel',
        city: hotel.city,
        district: hotel.district,
        address: hotel.address,
        lat: hotel.coordinates.lat,
        lng: hotel.coordinates.lng,
        phone: hotel.phone,
        workingHours: 'پذیرش ۲۴ ساعته',
        description: hotel.description,
        mapsUrl: hotel.mapsUrl,
        badge: `${hotel.pricePerNight.toLocaleString()} لیر / شب`,
        color: '#f59e0b',
        distanceKm,
        extra: {
          pricePerNight: hotel.pricePerNight,
          stars: hotel.stars,
          hotelType: hotel.type,
        },
        rawItem: hotel,
      });
    });

    // 3. Transit Hubs
    transitHubs.forEach((hub) => {
      if (!hub.coordinates) return;
      const distanceKm = userLocation
        ? calculateDistanceKm(userLocation.lat, userLocation.lng, hub.coordinates.lat, hub.coordinates.lng)
        : undefined;

      list.push({
        id: hub.id,
        title: hub.name,
        titleTr: hub.nameTr,
        category: 'transit',
        city: hub.city,
        district: hub.district,
        address: `${hub.district} - اتصال خطوط: ${hub.lines.join('، ')}`,
        lat: hub.coordinates.lat,
        lng: hub.coordinates.lng,
        workingHours: hub.schedule,
        description: hub.description,
        mapsUrl: hub.googleMapsUrl,
        badge: hub.lines[0] || 'ایستگاه',
        color: '#3b82f6',
        distanceKm,
        extra: {
          lines: hub.lines,
          connections: hub.connections,
        },
        rawItem: hub,
      });
    });

    return list;
  }, [addresses, hotels, transitHubs, userLocation]);

  // Filtered Points
  const filteredPoints = useMemo(() => {
    const list = allPoints.filter((pt) => {
      if (selectedCategory !== 'all' && pt.category !== selectedCategory) {
        return false;
      }
      if (selectedCity !== 'همه شهرها' && pt.city !== selectedCity && pt.city !== 'سراسری ترکیه') {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = pt.title.toLowerCase().includes(q);
        const matchesTitleTr = pt.titleTr.toLowerCase().includes(q);
        const matchesDistrict = pt.district.toLowerCase().includes(q);
        const matchesAddress = pt.address.toLowerCase().includes(q);
        const matchesDesc = pt.description.toLowerCase().includes(q);
        if (!matchesTitle && !matchesTitleTr && !matchesDistrict && !matchesAddress && !matchesDesc) {
          return false;
        }
      }
      return true;
    });

    // When seeker's location is known, sort items by distance (closest first!)
    if (userLocation) {
      list.sort((a, b) => {
        if (a.distanceKm !== undefined && b.distanceKm !== undefined) {
          return a.distanceKm - b.distanceKm;
        }
        return 0;
      });
    }

    return list;
  }, [allPoints, selectedCategory, selectedCity, searchQuery, userLocation]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: allPoints.length };
    allPoints.forEach((pt) => {
      counts[pt.category] = (counts[pt.category] || 0) + 1;
    });
    return counts;
  }, [allPoints]);

  // Create custom HTML marker pin with Tailwind and SVG
  const createCustomMarkerIcon = (point: MapPoint, isSelected: boolean) => {
    const isRed = point.color === '#ef4444' || point.color === '#e11d48';
    const isEmerald = point.color === '#10b981';
    const isBlue = point.color === '#3b82f6';
    const isAmber = point.color === '#f59e0b';
    const isPurple = point.color === '#8b5cf6';
    const isRose = point.color === '#f43f5e';

    let bgClass = 'bg-slate-700';
    let ringClass = 'border-slate-500';
    let iconEmoji = '📍';

    if (isRed) {
      bgClass = 'bg-red-600';
      ringClass = 'border-red-400';
      iconEmoji = '🏛️';
    } else if (isEmerald) {
      bgClass = 'bg-emerald-600';
      ringClass = 'border-emerald-400';
      iconEmoji = '📋';
    } else if (isBlue) {
      bgClass = 'bg-blue-600';
      ringClass = 'border-blue-400';
      iconEmoji = '🚇';
    } else if (isAmber) {
      bgClass = 'bg-amber-600';
      ringClass = 'border-amber-400';
      iconEmoji = '🏨';
    } else if (isPurple) {
      bgClass = 'bg-purple-600';
      ringClass = 'border-purple-400';
      iconEmoji = '💱';
    } else if (isRose) {
      bgClass = 'bg-rose-600';
      ringClass = 'border-rose-400';
      iconEmoji = '🏥';
    }

    const size = isSelected ? 42 : 34;

    const html = `
      <div class="relative flex items-center justify-center cursor-pointer transition-transform transform ${
        isSelected ? 'scale-125 z-50' : 'hover:scale-110'
      }">
        ${
          isSelected
            ? `<div class="absolute -inset-2 rounded-full ${bgClass} opacity-40 marker-pulse-active"></div>`
            : ''
        }
        <div class="w-[${size}px] h-[${size}px] rounded-2xl ${bgClass} border-2 ${ringClass} text-white shadow-xl flex items-center justify-center text-sm font-bold">
          ${iconEmoji}
        </div>
        <div class="absolute -bottom-1.5 w-2 h-2 ${bgClass} rotate-45 border-r border-b ${ringClass}"></div>
      </div>
    `;

    return L.divIcon({
      className: 'custom-leaflet-marker',
      html,
      iconSize: [size, size],
      iconAnchor: [size / 2, size + 4],
      popupAnchor: [0, -size - 2],
    });
  };

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapRef.current) return; // Prevent double initialization

    // Initial center on Istanbul
    const defaultCenter: [number, number] = [41.015, 28.97];
    const map = L.map(mapContainerRef.current, {
      center: defaultCenter,
      zoom: 12,
      zoomControl: false,
    });

    // Add zoom control to top-left (RTL safe)
    L.control.zoom({ position: 'topleft' }).addTo(map);

    // Initial tile layer
    const currentLayer = L.tileLayer(TILE_LAYERS[selectedTileStyle].url, {
      attribution: TILE_LAYERS[selectedTileStyle].attribution,
      maxZoom: 19,
    }).addTo(map);

    tileLayerRef.current = currentLayer;

    // Layer group for markers
    const markersLayer = L.layerGroup().addTo(map);
    markersLayerRef.current = markersLayer;

    mapRef.current = map;

    // Invalidate size once DOM is settled
    setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update Tile Layer when style changes
  useEffect(() => {
    if (!mapRef.current || !tileLayerRef.current) return;
    tileLayerRef.current.setUrl(TILE_LAYERS[selectedTileStyle].url);
  }, [selectedTileStyle]);

  // Render Markers when filteredPoints change or activePoint changes
  useEffect(() => {
    if (!mapRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    filteredPoints.forEach((point) => {
      const isSelected = activePoint?.id === point.id;
      const markerIcon = createCustomMarkerIcon(point, isSelected);

      const marker = L.marker([point.lat, point.lng], {
        icon: markerIcon,
        title: point.title,
      });

      marker.on('click', () => {
        setActivePoint(point);
        if (onSelectLocation) onSelectLocation(point);
        mapRef.current?.flyTo([point.lat, point.lng], 15, {
          duration: 0.8,
        });
      });

      markersLayerRef.current?.addLayer(marker);
    });
  }, [filteredPoints, activePoint]);

  // Handle external focus (focusedLocationId)
  useEffect(() => {
    if (!focusedLocationId || !mapRef.current) return;
    const match = allPoints.find((p) => p.id === focusedLocationId);
    if (match) {
      setActivePoint(match);
      mapRef.current.flyTo([match.lat, match.lng], 16, {
        duration: 1.2,
      });
    }
  }, [focusedLocationId, allPoints]);

  // Jump to City
  const handleCityJump = (cityName: string) => {
    setSelectedCity(cityName);
    const target = CITY_PRESETS.find((c) => c.name === cityName);
    if (target && mapRef.current) {
      mapRef.current.flyTo([target.lat, target.lng], target.zoom, {
        duration: 1,
      });
    }
  };

  // Locate User (GPS)
  const handleLocateMe = (isAuto = false) => {
    try {
      if (typeof navigator === 'undefined' || !navigator.geolocation) {
        if (!isAuto) showToast('دستگاه شما از مکان‌یابی پشتیبانی نمی‌کند', 'error');
        return;
      }

      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setIsLocating(false);
          const { latitude, longitude } = pos.coords;
          setUserLocation({ lat: latitude, lng: longitude });

          if (mapRef.current) {
            if (userMarkerRef.current) {
              userMarkerRef.current.remove();
            }

            const userHtml = `
              <div class="relative flex items-center justify-center">
                <div class="absolute -inset-3 rounded-full bg-blue-500 opacity-60 marker-pulse-active animate-ping"></div>
                <div class="w-8 h-8 rounded-full bg-blue-600 border-2 border-white shadow-xl flex items-center justify-center text-white text-[11px] font-extrabold z-10">
                  📍 شما
                </div>
              </div>
            `;
            const userIcon = L.divIcon({
              className: 'user-location-marker',
              html: userHtml,
              iconSize: [32, 32],
              iconAnchor: [16, 16],
            });

            const newMarker = L.marker([latitude, longitude], { icon: userIcon }).addTo(mapRef.current);
            userMarkerRef.current = newMarker;

            if (!focusedLocationId) {
              mapRef.current.flyTo([latitude, longitude], 13, { duration: 1.2 });
            }
            showToast('موقعیت کنونی شما با سرعت شناسایی شد و نزدیک‌ترین هتل‌ها و اماکن محاسبه شدند', 'success');
          }
        },
        () => {
          setIsLocating(false);
          if (!isAuto) {
            showToast('امکان دریافت موقعیت وجود ندارد یا دسترسی مسدود است.', 'info');
          }
        },
        { enableHighAccuracy: false, timeout: 6000, maximumAge: 300000 }
      );
    } catch {
      setIsLocating(false);
      if (!isAuto) {
        showToast('دسترسی به مکان‌یابی در این محیط محدود شده است.', 'info');
      }
    }
  };

  // Automatically trigger quick GPS lookup on component load
  useEffect(() => {
    handleLocateMe(true);
  }, []);

  // Toggle Fullscreen / Expand
  const toggleFullscreen = () => {
    setIsFullscreen((prev) => !prev);
    setTimeout(() => {
      mapRef.current?.invalidateSize();
    }, 300);
  };

  return (
    <div
      className={`relative bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col transition-all duration-300 ${
        isFullscreen ? 'fixed inset-4 z-50 h-[calc(100vh-2rem)]' : ''
      }`}
    >
      {/* Top Controls Header */}
      <div className="p-3 sm:p-4 bg-slate-900/95 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-red-600/20 text-red-400 border border-red-500/30 flex items-center justify-center">
            <Navigation className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
              نقشه تعاملی مراکز، کنسولگری و ایستگاه‌ها
              <span className="px-2 py-0.5 rounded-full bg-red-600/30 text-red-300 text-[10px] font-mono font-bold">
                {filteredPoints.length} مکان
              </span>
            </h3>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              کلیک روی هر نشانگر برای نمایش مشخصات، تلفن، ساعت کاری و مسیریابی
            </p>
          </div>
        </div>

        {/* Quick Actions (GPS, Tile style, Fullscreen) */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handleLocateMe(false)}
            disabled={isLocating}
            title="موقعیت فعلی من"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-medium transition flex items-center gap-1.5 disabled:opacity-50"
          >
            <Crosshair className={`w-3.5 h-3.5 text-blue-400 ${isLocating ? 'animate-spin' : ''}`} />
            <span className="hidden md:inline">موقعیت من</span>
          </button>

          <button
            onClick={() =>
              setSelectedTileStyle((prev) => (prev === 'cartoDark' ? 'osm' : 'cartoDark'))
            }
            title="تغییر ظاهر نقشه"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-medium transition flex items-center gap-1.5"
          >
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">
              {selectedTileStyle === 'cartoDark' ? 'نقشه استاندارد' : 'نقشه مدرن'}
            </span>
          </button>

          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? 'خروج از تمام صفحه' : 'نمایش تمام صفحه'}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Filter and City Presets Bar */}
      <div className="px-3 sm:px-4 py-2.5 bg-slate-900/80 border-b border-slate-800 space-y-2.5 shrink-0">
        {/* City jumps + Search bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
          {/* City Presets */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <span className="text-[11px] text-slate-400 shrink-0 font-medium ml-1">پرش به شهر:</span>
            {CITY_PRESETS.map((city) => (
              <button
                key={city.name}
                onClick={() => handleCityJump(city.name)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 transition ${
                  selectedCity === city.name
                    ? 'bg-red-600 text-white shadow-md shadow-red-700/20'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {city.name}
              </button>
            ))}
            <button
              onClick={() => setSelectedCity('همه شهرها')}
              className={`px-2 py-1 rounded-lg text-xs font-medium shrink-0 transition ${
                selectedCity === 'همه شهرها'
                  ? 'bg-slate-200 text-slate-900 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              همه ترکیه
            </button>
          </div>

          {/* Search Input */}
          <div className="relative sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5" />
            <input
              type="text"
              placeholder="جستجو در نقشه (نام، محله، ایستگاه)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800/90 border border-slate-700 focus:border-red-500 text-white placeholder-slate-400 pr-8 pl-3 py-1.5 rounded-xl text-xs focus:outline-hidden"
            />
          </div>
        </div>

        {/* Category Pills */}
        {showCategoryFilters && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-1">
            {Object.entries(CATEGORY_CONFIG).map(([catKey, config]) => {
              const isSelected = selectedCategory === catKey;
              const count = categoryCounts[catKey] || 0;
              return (
                <button
                  key={catKey}
                  onClick={() => setSelectedCategory(catKey)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-medium shrink-0 flex items-center gap-1.5 transition ${
                    isSelected
                      ? 'bg-white text-slate-900 font-bold shadow-md'
                      : 'bg-slate-800/90 text-slate-300 hover:bg-slate-800 border border-slate-700/60'
                  }`}
                >
                  <span>{config.label}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                      isSelected ? 'bg-slate-900/20 text-slate-900' : 'bg-slate-700 text-slate-300'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Map Container & Overlay Drawer */}
      <div className={`relative flex-1 ${heightClass} min-h-[380px]`}>
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Active Point Detail Card (Bottom Float) */}
        {activePoint && (
          <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 z-20 bg-slate-900/95 backdrop-blur-md border border-slate-700 p-4 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-bottom duration-200">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: activePoint.color }}
                />
                <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[10px] font-bold">
                  {CATEGORY_CONFIG[activePoint.category]?.label || activePoint.category}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {activePoint.city} - {activePoint.district}
                </span>
              </div>
              <button
                onClick={() => setActivePoint(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg text-xs"
              >
                ✕
              </button>
            </div>

            <h4 className="text-sm font-bold text-white mb-0.5">{activePoint.title}</h4>
            <p className="text-[11px] text-slate-400 font-mono mb-2" dir="ltr">
              {activePoint.titleTr}
            </p>

            {activePoint.distanceKm !== undefined && (
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-1 rounded-xl mb-2">
                <Navigation className="w-3.5 h-3.5 shrink-0" />
                <span>فاصله از شما: {activePoint.distanceKm.toLocaleString('fa-IR')} کیلومتر</span>
              </div>
            )}

            <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed mb-2.5 bg-slate-800/60 p-2 rounded-xl">
              {activePoint.description}
            </p>

            <div className="space-y-1 text-[11px] text-slate-300 mb-3 font-mono">
              <div className="flex items-start gap-1.5" dir="ltr">
                <MapPin className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                <span className="text-slate-300">{activePoint.address}</span>
              </div>
              {activePoint.workingHours && (
                <div className="flex items-center gap-1.5" dir="rtl">
                  <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{activePoint.workingHours}</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-1 border-t border-slate-800">
              {activePoint.phone && (
                <a
                  href={`tel:${activePoint.phone.replace(/\s/g, '')}`}
                  className="flex-1 py-1.5 px-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1"
                >
                  <Phone className="w-3.5 h-3.5" />
                  تماس مستقیم
                </a>
              )}

              {activePoint.category === 'hotel' && onBookHotel && (
                <button
                  onClick={() => onBookHotel(activePoint.rawItem)}
                  className="flex-1 py-1.5 px-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  رزرو هتل
                </button>
              )}

              <a
                href={
                  userLocation
                    ? `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${activePoint.lat},${activePoint.lng}`
                    : activePoint.mapsUrl || `https://www.google.com/maps/search/?api=1&query=${activePoint.lat},${activePoint.lng}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="py-1.5 px-3 bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 border border-blue-500/30 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1"
              >
                <Navigation className="w-3.5 h-3.5" />
                مسیریابی
              </a>
            </div>
          </div>
        )}

        {/* Floating Quick Drawer Toggle (Bottom Left) */}
        <div className="absolute top-3 right-3 z-10 flex flex-col gap-2">
          <button
            onClick={() => setShowDrawer((prev) => !prev)}
            className="px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-white text-xs font-bold border border-slate-700 shadow-xl flex items-center gap-1.5 backdrop-blur-xs"
          >
            <span>لیست مکان‌ها ({filteredPoints.length})</span>
            {showDrawer ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Collapsible Mini List Drawer */}
        {showDrawer && (
          <div className="absolute top-12 right-3 z-10 w-72 max-h-72 overflow-y-auto bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-2xl p-2 shadow-2xl space-y-1.5">
            {filteredPoints.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400">
                مکانی با فیلتر انتخابی یافت نشد
              </div>
            ) : (
              filteredPoints.map((pt) => {
                const isSelected = activePoint?.id === pt.id;
                return (
                  <button
                    key={pt.id}
                    onClick={() => {
                      setActivePoint(pt);
                      mapRef.current?.flyTo([pt.lat, pt.lng], 15, { duration: 0.8 });
                    }}
                    className={`w-full p-2 rounded-xl text-right transition flex items-start gap-2 ${
                      isSelected
                        ? 'bg-slate-800 border border-slate-700 text-white'
                        : 'hover:bg-slate-800/60 text-slate-300'
                    }`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0 mt-1.5"
                      style={{ backgroundColor: pt.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-white truncate">{pt.title}</div>
                      <div className="text-[10px] text-slate-400 flex items-center justify-between gap-1">
                        <span className="truncate">{pt.district}</span>
                        <div className="flex items-center gap-1 shrink-0">
                          {pt.distanceKm !== undefined && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-emerald-500/20 text-emerald-300 font-bold">
                              {pt.distanceKm.toLocaleString('fa-IR')} ک.م
                            </span>
                          )}
                          {pt.badge && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-slate-800 text-slate-300">
                              {pt.badge}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Map Footer Legend */}
      <div className="p-2 sm:px-4 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 shrink-0">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="flex items-center gap-1 font-semibold text-slate-300">
            <span className="w-2 h-2 rounded-full bg-red-500"></span>
            سفارت/کنسولگری
          </span>
          <span className="flex items-center gap-1 font-semibold text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            اداره مهاجرت
          </span>
          <span className="flex items-center gap-1 font-semibold text-slate-300">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            متروبوس و مترو
          </span>
          <span className="flex items-center gap-1 font-semibold text-slate-300">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            هتل و خوابگاه
          </span>
          <span className="flex items-center gap-1 font-semibold text-slate-300">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            بیمارستان
          </span>
          <span className="flex items-center gap-1 font-semibold text-slate-300">
            <span className="w-2 h-2 rounded-full bg-purple-500"></span>
            صرافی
          </span>
        </div>

        <div className="text-slate-500 text-[10px]">
          داده‌های مکانی بر پایه OpenStreetMap و CARTO
        </div>
      </div>
    </div>
  );
};
