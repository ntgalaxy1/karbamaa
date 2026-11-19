import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import { useApp } from '../context/AppContext';
import {
  MapPin,
  Train,
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
  Calendar,
  ExternalLink,
  Globe,
  Coins,
  Compass,
} from 'lucide-react';
import { Hotel } from '../types';

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
  websiteUrl?: string;
  badge?: string;
  color: string;
  extra?: {
    pricePerNight?: number;
    monthlyPrice?: number;
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
  { name: 'استانبول', lat: 41.015, lng: 28.97, zoom: 11 },
  { name: 'آنکارا', lat: 39.925, lng: 32.85, zoom: 12 },
  { name: 'ازمیر', lat: 38.423, lng: 27.142, zoom: 12 },
  { name: 'آنتالیا', lat: 36.89, lng: 30.7, zoom: 12 },
  { name: 'بورسا', lat: 40.188, lng: 29.061, zoom: 12 },
  { name: 'ترابزون', lat: 41.002, lng: 39.716, zoom: 12 },
  { name: 'قونیه', lat: 37.871, lng: 32.485, zoom: 12 },
  { name: 'مرسین', lat: 36.812, lng: 34.641, zoom: 12 },
];

const ISTANBUL_DISTRICT_PRESETS = [
  { id: 'all', name: 'همه مناطق استانبول', keyword: '', lat: 41.015, lng: 28.97, zoom: 11 },
  { id: 'aksaray', name: 'آکسارای و فاتیح (Fatih)', keyword: 'فاتیح', lat: 41.0079, lng: 28.9518, zoom: 14 },
  { id: 'taksim', name: 'میدان تقسیم (Taksim)', keyword: 'تقسیم', lat: 41.0355, lng: 28.9852, zoom: 14 },
  { id: 'sisli', name: 'شیشلی و مجیدیه‌کوی (Şişli)', keyword: 'شیشلی', lat: 41.0638, lng: 28.9904, zoom: 14 },
  { id: 'merter', name: 'مرتر و زیتون‌بورنو (Merter)', keyword: 'مرتر', lat: 41.0094, lng: 28.8878, zoom: 14 },
  { id: 'esenyurt', name: 'اسنیورت و بیلیک‌دوزو (Esenyurt)', keyword: 'اسنیورت', lat: 41.0165, lng: 28.6512, zoom: 13 },
  { id: 'kadikoy', name: 'کادیکوی - آسیایی (Kadıköy)', keyword: 'کادیکوی', lat: 40.9928, lng: 29.0235, zoom: 14 },
];

const CATEGORY_CONFIG: Record<string, { label: string; color: string; icon?: string }> = {
  all: { label: 'همه مکان‌ها', color: '#64748b' },
  hotel: { label: 'هتل‌ها و اقامتگاه', color: '#f59e0b', icon: '🏨' },
  immigration: { label: 'اداره مهاجرت (Göç)', color: '#10b981', icon: '📋' },
  embassy: { label: 'سفارت و کنسولگری', color: '#ef4444', icon: '🏛️' },
  transit: { label: 'متروبوس و ایستگاه‌ها', color: '#3b82f6', icon: '🚇' },
  hospital: { label: 'بیمارستان و درمانی', color: '#f43f5e', icon: '🏥' },
  emergency: { label: 'اورژانس ۲۴ ساعته', color: '#e11d48', icon: '🚨' },
  police: { label: 'پلیس و امنیت', color: '#0284c7', icon: '👮' },
  exchange: { label: 'صرافی و ارزی', color: '#8b5cf6', icon: '💱' },
};

const TILE_LAYERS = {
  cartoDark: {
    name: 'نقشه مدرن و خوانا',
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
  defaultCategory?: string;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  initialCity = 'استانبول',
  focusedLocationId = null,
  onSelectLocation,
  onBookHotel,
  heightClass = 'h-[540px]',
  showCategoryFilters = true,
  defaultCategory = 'all',
}) => {
  const { addresses, hotels, transitHubs, showToast, formatTryToIrr } = useApp();

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);

  const [selectedCity, setSelectedCity] = useState<string>(initialCity);
  const [selectedDistrictPreset, setSelectedDistrictPreset] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>(defaultCategory);
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
        websiteUrl: hotel.websiteUrl,
        badge: `${hotel.pricePerNight.toLocaleString('fa-IR')} ₺ / شب`,
        color: '#f59e0b',
        distanceKm,
        extra: {
          pricePerNight: hotel.pricePerNight,
          monthlyPrice: hotel.monthlyPrice,
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
    const activeDistrictObj = ISTANBUL_DISTRICT_PRESETS.find((d) => d.id === selectedDistrictPreset);

    const list = allPoints.filter((pt) => {
      if (selectedCategory !== 'all' && pt.category !== selectedCategory) {
        return false;
      }
      if (selectedCity !== 'همه شهرها' && pt.city !== selectedCity && pt.city !== 'سراسری ترکیه') {
        return false;
      }
      if (
        selectedCity === 'استانبول' &&
        activeDistrictObj &&
        activeDistrictObj.id !== 'all' &&
        activeDistrictObj.keyword
      ) {
        const kw = activeDistrictObj.keyword.toLowerCase();
        const inDistrict =
          pt.district.toLowerCase().includes(kw) ||
          pt.title.toLowerCase().includes(kw) ||
          pt.address.toLowerCase().includes(kw);
        if (!inDistrict) return false;
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

    if (userLocation) {
      list.sort((a, b) => {
        if (a.distanceKm !== undefined && b.distanceKm !== undefined) {
          return a.distanceKm - b.distanceKm;
        }
        return 0;
      });
    }

    return list;
  }, [allPoints, selectedCategory, selectedCity, selectedDistrictPreset, searchQuery, userLocation]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: allPoints.length };
    allPoints.forEach((pt) => {
      counts[pt.category] = (counts[pt.category] || 0) + 1;
    });
    return counts;
  }, [allPoints]);

  // Create custom HTML marker pin
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
      ringClass = 'border-red-300';
      iconEmoji = '🏛️';
    } else if (isEmerald) {
      bgClass = 'bg-emerald-600';
      ringClass = 'border-emerald-300';
      iconEmoji = '📋';
    } else if (isBlue) {
      bgClass = 'bg-blue-600';
      ringClass = 'border-blue-300';
      iconEmoji = '🚇';
    } else if (isAmber) {
      bgClass = 'bg-amber-600';
      ringClass = 'border-amber-300';
      iconEmoji = '🏨';
    } else if (isPurple) {
      bgClass = 'bg-purple-600';
      ringClass = 'border-purple-300';
      iconEmoji = '💱';
    } else if (isRose) {
      bgClass = 'bg-rose-600';
      ringClass = 'border-rose-300';
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
    if (mapRef.current) return;

    const defaultCenter: [number, number] = [41.015, 28.97];
    const map = L.map(mapContainerRef.current, {
      center: defaultCenter,
      zoom: 12,
      zoomControl: false,
    });

    L.control.zoom({ position: 'topleft' }).addTo(map);

    const currentLayer = L.tileLayer(TILE_LAYERS[selectedTileStyle].url, {
      attribution: TILE_LAYERS[selectedTileStyle].attribution,
      maxZoom: 19,
    }).addTo(map);

    tileLayerRef.current = currentLayer;

    const markersLayer = L.layerGroup().addTo(map);
    markersLayerRef.current = markersLayer;

    mapRef.current = map;

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

  // Render Markers when filteredPoints or activePoint changes
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
      setSelectedCategory('all');
      setSelectedCity('همه شهرها');
      setSelectedDistrictPreset('all');
      setActivePoint(match);
      mapRef.current.flyTo([match.lat, match.lng], 16, {
        duration: 1.1,
      });
    }
  }, [focusedLocationId, allPoints]);

  // Jump to City
  const handleCityJump = (cityName: string) => {
    setSelectedCity(cityName);
    setSelectedDistrictPreset('all');
    const target = CITY_PRESETS.find((c) => c.name === cityName);
    if (target && mapRef.current) {
      mapRef.current.flyTo([target.lat, target.lng], target.zoom, {
        duration: 0.9,
      });
    }
  };

  // Jump to Istanbul District
  const handleDistrictPresetJump = (districtId: string) => {
    setSelectedCity('استانبول');
    setSelectedDistrictPreset(districtId);
    const preset = ISTANBUL_DISTRICT_PRESETS.find((d) => d.id === districtId);
    if (preset && mapRef.current) {
      mapRef.current.flyTo([preset.lat, preset.lng], preset.zoom, {
        duration: 0.9,
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
            if (!isAuto) {
              showToast('موقعیت کنونی شما شناسایی شد و نزدیک‌ترین هتل‌ها و مراکز محاسبه شدند', 'success');
            }
          }
        },
        () => {
          setIsLocating(false);
          if (!isAuto) {
            showToast('امکان دریافت موقعیت مکانی وجود ندارد یا دسترسی مسدود است.', 'info');
          }
        },
        { enableHighAccuracy: false, timeout: 6000, maximumAge: 300000 }
      );
    } catch {
      setIsLocating(false);
    }
  };

  useEffect(() => {
    handleLocateMe(true);
  }, []);

  const toggleFullscreen = () => {
    setIsFullscreen((prev) => !prev);
    setTimeout(() => {
      mapRef.current?.invalidateSize();
    }, 300);
  };

  return (
    <div
      className={`relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xl flex flex-col transition-all duration-300 ${
        isFullscreen ? 'fixed inset-4 z-50 h-[calc(100vh-2rem)]' : ''
      }`}
    >
      {/* Top Controls Header */}
      <div className="p-3 sm:p-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-600/15 dark:bg-red-600/20 text-blue-700 dark:text-red-400 border border-blue-500/30 dark:border-red-500/30 flex items-center justify-center shrink-0">
            <Navigation className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              نقشه تعاملی زنده هتل‌ها، مراکز مهاجرت، کنسولگری و متروبوس
              <span className="px-2.5 py-0.5 rounded-full bg-blue-600 dark:bg-red-600 text-white text-[11px] font-mono font-bold">
                {filteredPoints.length.toLocaleString('fa-IR')} مکان فعال
              </span>
            </h3>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 hidden sm:block">
              روی هر نشانگر کلیک کنید تا قیمت لحظه‌ای، آدرس، تلفن، سایت رزرو آنلاین و مسیریابی باز شود
            </p>
          </div>
        </div>

        {/* Quick Actions (GPS, Tile style, Fullscreen) */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handleLocateMe(false)}
            disabled={isLocating}
            title="موقعیت فعلی من"
            className="px-2.5 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 text-xs font-bold transition flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
          >
            <Crosshair className={`w-3.5 h-3.5 text-blue-600 dark:text-blue-400 ${isLocating ? 'animate-spin' : ''}`} />
            <span className="hidden md:inline">موقعیت من</span>
          </button>

          <button
            onClick={() =>
              setSelectedTileStyle((prev) => (prev === 'cartoDark' ? 'osm' : 'cartoDark'))
            }
            title="تغییر ظاهر نقشه"
            className="px-2.5 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span className="hidden md:inline">
              {selectedTileStyle === 'cartoDark' ? 'نقشه استاندارد' : 'نقشه مدرن'}
            </span>
          </button>

          <button
            onClick={toggleFullscreen}
            title={isFullscreen ? 'خروج از تمام صفحه' : 'نمایش تمام صفحه'}
            className="p-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition cursor-pointer"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Filter, City Presets, and Istanbul District Bar */}
      <div className="px-3 sm:px-4 py-3 bg-white dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 space-y-2.5 shrink-0">
        {/* City jumps + Search bar */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2.5">
          {/* City Presets */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-slate-700 dark:text-slate-400 shrink-0 font-bold ml-1">پرش به شهر:</span>
            {CITY_PRESETS.map((city) => (
              <button
                key={city.name}
                type="button"
                onClick={() => handleCityJump(city.name)}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold shrink-0 transition cursor-pointer ${
                  selectedCity === city.name
                    ? 'bg-blue-600 dark:bg-red-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {city.name}
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                setSelectedCity('همه شهرها');
                setSelectedDistrictPreset('all');
              }}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold shrink-0 transition cursor-pointer ${
                selectedCity === 'همه شهرها'
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
              }`}
            >
              همه شهرها
            </button>
          </div>

          {/* Search Input */}
          <div className="relative lg:w-72">
            <Search className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 absolute right-3 top-2.5" />
            <input
              type="text"
              placeholder="جستجو در نقشه (هتل، آکسارای، تقسیم، شیشلی، مرتر)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 focus:border-blue-600 dark:focus:border-red-500 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 pr-8 pl-3 py-1.5 rounded-xl text-xs focus:outline-none"
            />
          </div>
        </div>

        {/* Istanbul District Filter Bar (Esenyurt, Şişli, Merter, Taksim, Aksaray/Fatih, Kadıköy) */}
        {(selectedCity === 'استانبول' || selectedCity === 'همه شهرها') && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-100 dark:border-slate-800/80">
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-400 flex items-center gap-1 ml-1">
              <Compass className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              مناطق مهم استانبول:
            </span>
            {ISTANBUL_DISTRICT_PRESETS.map((dist) => {
              const isSelected = selectedCity === 'استانبول' && selectedDistrictPreset === dist.id;
              return (
                <button
                  key={dist.id}
                  type="button"
                  onClick={() => handleDistrictPresetJump(dist.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                    isSelected
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {dist.name}
                </button>
              );
            })}
          </div>
        )}

        {/* Category Filter Tabs */}
        {showCategoryFilters && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-100 dark:border-slate-800/80">
            {Object.entries(CATEGORY_CONFIG).map(([catKey, config]) => {
              const isSelected = selectedCategory === catKey;
              const count = categoryCounts[catKey] || 0;
              return (
                <button
                  key={catKey}
                  type="button"
                  onClick={() => setSelectedCategory(catKey)}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 dark:bg-red-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {config.icon && <span className="text-sm">{config.icon}</span>}
                  <span>{config.label}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                      isSelected
                        ? 'bg-black/25 text-white'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    {count.toLocaleString('fa-IR')}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Map Container & Overlay Drawer */}
      <div className={`relative flex-1 ${heightClass} min-h-[420px]`}>
        <div ref={mapContainerRef} className="w-full h-full z-0" />

        {/* Active Point Detail Card (Bottom Float) */}
        {activePoint && (
          <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-[400px] z-20 bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 p-4 rounded-2xl shadow-2xl animate-in fade-in slide-in-from-bottom duration-200">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: activePoint.color }}
                />
                <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-200 text-[10px] font-extrabold border border-slate-200 dark:border-slate-700">
                  {CATEGORY_CONFIG[activePoint.category]?.label || activePoint.category}
                </span>
                <span className="text-[11px] text-slate-700 dark:text-slate-300 font-bold">
                  {activePoint.city} - {activePoint.district}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActivePoint(null)}
                className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white p-1 rounded-lg text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <h4 className="text-sm font-black text-slate-900 dark:text-white mb-0.5">{activePoint.title}</h4>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 font-mono mb-2" dir="ltr">
              {activePoint.titleTr}
            </p>

            {/* Hotel Live TRY + Rial/Toman Price Breakdown */}
            {activePoint.category === 'hotel' && activePoint.extra?.pricePerNight && (
              <div className="mb-2.5 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-500/40 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 dark:text-amber-200 flex items-center gap-1">
                    <Coins className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    تعرفه هر شب اقامت:
                  </span>
                  <span className="font-mono font-black text-amber-800 dark:text-amber-300 text-sm">
                    {activePoint.extra.pricePerNight.toLocaleString('fa-IR')} لیر (₺)
                  </span>
                </div>
                <div className="text-[11px] font-mono font-bold text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
                  <span>معادل لحظه‌ای به نرخ روز:</span>
                  <span>{formatTryToIrr(activePoint.extra.pricePerNight).combinedText}</span>
                </div>
              </div>
            )}

            {activePoint.distanceKm !== undefined && (
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-500/15 border border-emerald-300 dark:border-emerald-500/30 px-2.5 py-1 rounded-xl mb-2">
                <Navigation className="w-3.5 h-3.5 shrink-0" />
                <span>فاصله از شما: {activePoint.distanceKm.toLocaleString('fa-IR')} کیلومتر</span>
              </div>
            )}

            <p className="text-xs text-slate-700 dark:text-slate-200 line-clamp-2 leading-relaxed mb-2.5 bg-slate-100 dark:bg-slate-800/70 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700/70">
              {activePoint.description}
            </p>

            <div className="space-y-1 text-[11px] text-slate-700 dark:text-slate-300 mb-3 font-mono">
              <div className="flex items-start gap-1.5" dir="ltr">
                <MapPin className="w-3.5 h-3.5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                <span className="text-slate-800 dark:text-slate-200">{activePoint.address}</span>
              </div>
              {activePoint.workingHours && (
                <div className="flex items-center gap-1.5" dir="rtl">
                  <Clock className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 shrink-0" />
                  <span>{activePoint.workingHours}</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              {activePoint.phone && (
                <a
                  href={`tel:${activePoint.phone.replace(/\s/g, '')}`}
                  className="py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 shadow-sm"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>تماس</span>
                </a>
              )}

              {activePoint.category === 'hotel' && (activePoint.websiteUrl || activePoint.mapsUrl) && (
                <a
                  href={activePoint.websiteUrl || activePoint.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>مشاهده سایت و رزرو آنلاین</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}

              {activePoint.category === 'hotel' && onBookHotel && (
                <button
                  type="button"
                  onClick={() => onBookHotel(activePoint.rawItem)}
                  className="py-2 px-3 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer shadow-sm"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>فرم رزرو</span>
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
                className="py-2 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1"
              >
                <Navigation className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>مسیریابی</span>
              </a>
            </div>
          </div>
        )}

        {/* Floating Quick Drawer Toggle (Top Right) */}
        <div className="absolute top-3 right-3 z-10 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => setShowDrawer((prev) => !prev)}
            className="px-3 py-1.5 rounded-xl bg-white/95 dark:bg-slate-900/95 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-900 dark:text-white text-xs font-extrabold border border-slate-300 dark:border-slate-700 shadow-lg flex items-center gap-1.5 backdrop-blur-xs cursor-pointer"
          >
            <span>لیست مکان‌های روی نقشه ({filteredPoints.length.toLocaleString('fa-IR')})</span>
            {showDrawer ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Collapsible Mini List Drawer */}
        {showDrawer && (
          <div className="absolute top-12 right-3 z-10 w-72 sm:w-80 max-h-72 overflow-y-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border border-slate-300 dark:border-slate-800 rounded-2xl p-2 shadow-2xl space-y-1.5">
            {filteredPoints.length === 0 ? (
              <div className="p-4 text-center text-xs font-bold text-slate-600 dark:text-slate-400">
                مکانی با فیلتر انتخابی یافت نشد
              </div>
            ) : (
              filteredPoints.map((pt) => {
                const isSelected = activePoint?.id === pt.id;
                return (
                  <button
                    key={pt.id}
                    type="button"
                    onClick={() => {
                      setActivePoint(pt);
                      if (onSelectLocation) onSelectLocation(pt);
                      mapRef.current?.flyTo([pt.lat, pt.lng], 15, { duration: 0.8 });
                    }}
                    className={`w-full p-2.5 rounded-xl text-right transition flex items-start gap-2 cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50 dark:bg-slate-800 border border-blue-400 dark:border-slate-600 text-slate-900 dark:text-white'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-800 dark:text-slate-300'
                    }`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0 mt-1.5"
                      style={{ backgroundColor: pt.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-extrabold text-slate-900 dark:text-white truncate">{pt.title}</div>
                      <div className="text-[10px] text-slate-600 dark:text-slate-400 flex items-center justify-between gap-1 mt-0.5">
                        <span className="truncate">{pt.city} - {pt.district}</span>
                        <div className="flex items-center gap-1 shrink-0">
                          {pt.distanceKm !== undefined && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-bold">
                              {pt.distanceKm.toLocaleString('fa-IR')} ک.م
                            </span>
                          )}
                          {pt.badge && (
                            <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-300 font-mono font-bold">
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
      <div className="p-2.5 sm:px-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-700 dark:text-slate-400 shrink-0">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="flex items-center gap-1 font-bold text-slate-800 dark:text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            هتل و اقامتگاه
          </span>
          <span className="flex items-center gap-1 font-bold text-slate-800 dark:text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            اداره مهاجرت (Göç)
          </span>
          <span className="flex items-center gap-1 font-bold text-slate-800 dark:text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
            سفارت و کنسولگری
          </span>
          <span className="flex items-center gap-1 font-bold text-slate-800 dark:text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
            متروبوس و مترو
          </span>
          <span className="flex items-center gap-1 font-bold text-slate-800 dark:text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            بیمارستان
          </span>
          <span className="flex items-center gap-1 font-bold text-slate-800 dark:text-slate-300">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
            صرافی مجاز
          </span>
        </div>

        <div className="text-slate-600 dark:text-slate-500 text-[10px] font-mono">
          OpenStreetMap &amp; Leaflet Live Engine
        </div>
      </div>
    </div>
  );
};
