import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { MapPin, Navigation, Crosshair, Check, Globe } from 'lucide-react';

interface MapLocationPickerProps {
  initialCoordinates?: { lat: number; lng: number };
  onChange: (coords: { lat: number; lng: number }, mapsUrl: string) => void;
  height?: string;
  defaultCity?: string;
}

const CITY_PRESETS = [
  { name: 'استانبول - تکسیم', lat: 41.0369, lng: 28.9851, zoom: 14 },
  { name: 'استانبول - آکسارای', lat: 41.0082, lng: 28.9484, zoom: 15 },
  { name: 'استانبول - فاتیح', lat: 41.0185, lng: 28.9497, zoom: 14 },
  { name: 'استانبول - کادیکوی', lat: 40.9904, lng: 29.0254, zoom: 14 },
  { name: 'استانبول - شیشلی', lat: 41.0602, lng: 28.9877, zoom: 14 },
  { name: 'آنتالیا - لارا', lat: 36.8525, lng: 30.7725, zoom: 13 },
  { name: 'آنکارا - کیزیلای', lat: 39.9208, lng: 32.8541, zoom: 14 },
  { name: 'ازمیر - کوناک', lat: 38.4192, lng: 27.1287, zoom: 14 },
];

export const MapLocationPicker: React.FC<MapLocationPickerProps> = ({
  initialCoordinates = { lat: 41.0082, lng: 28.9484 }, // Default: Aksaray, Istanbul
  onChange,
  height = '320px',
  defaultCity,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number }>(initialCoordinates);
  const [isLocating, setIsLocating] = useState(false);

  // Helper to build Google Maps URL
  const buildMapsUrl = (lat: number, lng: number) => {
    return `https://www.google.com/maps?q=${lat.toFixed(6)},${lng.toFixed(6)}`;
  };

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Create Leaflet icon
    const customPinIcon = L.divIcon({
      className: 'custom-hotel-marker-pin',
      html: `
        <div style="
          width: 38px;
          height: 38px;
          background: #dc2626;
          border: 3px solid #ffffff;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: 0 4px 14px rgba(0,0,0,0.45);
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <span style="
            transform: rotate(45deg);
            color: #ffffff;
            font-size: 16px;
          ">🏨</span>
        </div>
      `,
      iconSize: [38, 38],
      iconAnchor: [19, 38],
    });

    const initialLat = initialCoordinates?.lat || 41.0082;
    const initialLng = initialCoordinates?.lng || 28.9484;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLng],
      zoom: 14,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap &copy; CARTO',
      maxZoom: 19,
    }).addTo(map);

    const marker = L.marker([initialLat, initialLng], {
      icon: customPinIcon,
      draggable: true,
    }).addTo(map);

    markerRef.current = marker;
    mapInstanceRef.current = map;

    // Fix map rendering inside modal: invalidate size after animation finishes
    const timer1 = setTimeout(() => map.invalidateSize(), 150);
    const timer2 = setTimeout(() => map.invalidateSize(), 400);
    const timer3 = setTimeout(() => map.invalidateSize(), 800);

    // Event on marker drag end
    marker.on('dragend', () => {
      const pos = marker.getLatLng();
      const updated = { lat: Number(pos.lat.toFixed(6)), lng: Number(pos.lng.toFixed(6)) };
      setCurrentCoords(updated);
      onChange(updated, buildMapsUrl(updated.lat, updated.lng));
    });

    // Event on map click
    map.on('click', (e: L.LeafletMouseEvent) => {
      const updated = { lat: Number(e.latlng.lat.toFixed(6)), lng: Number(e.latlng.lng.toFixed(6)) };
      marker.setLatLng([updated.lat, updated.lng]);
      setCurrentCoords(updated);
      onChange(updated, buildMapsUrl(updated.lat, updated.lng));
      map.panTo([updated.lat, updated.lng]);
    });

    // Cleanup
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      map.remove();
      mapInstanceRef.current = null;
      markerRef.current = null;
    };
  }, []);

  // Center on city when defaultCity changes in parent form
  useEffect(() => {
    if (!defaultCity || !mapInstanceRef.current || !markerRef.current) return;
    const match = CITY_PRESETS.find((p) => p.name.includes(defaultCity));
    if (match) {
      mapInstanceRef.current.setView([match.lat, match.lng], match.zoom);
      markerRef.current.setLatLng([match.lat, match.lng]);
      const updated = { lat: match.lat, lng: match.lng };
      setCurrentCoords(updated);
      onChange(updated, buildMapsUrl(updated.lat, updated.lng));
    }
  }, [defaultCity]);

  const handleSelectCityPreset = (preset: typeof CITY_PRESETS[0]) => {
    if (!mapInstanceRef.current || !markerRef.current) return;
    mapInstanceRef.current.setView([preset.lat, preset.lng], preset.zoom);
    markerRef.current.setLatLng([preset.lat, preset.lng]);
    const updated = { lat: preset.lat, lng: preset.lng };
    setCurrentCoords(updated);
    onChange(updated, buildMapsUrl(updated.lat, updated.lng));
  };

  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      alert('مرورگر شما از موقعیت‌یاب پشتیبانی نمی‌کند');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const lat = Number(pos.coords.latitude.toFixed(6));
        const lng = Number(pos.coords.longitude.toFixed(6));
        if (mapInstanceRef.current && markerRef.current) {
          mapInstanceRef.current.setView([lat, lng], 16);
          markerRef.current.setLatLng([lat, lng]);
          const updated = { lat, lng };
          setCurrentCoords(updated);
          onChange(updated, buildMapsUrl(lat, lng));
        }
      },
      () => {
        setIsLocating(false);
      },
      { timeout: 8000 }
    );
  };

  return (
    <div className="space-y-2">
      {/* City Presets Quick Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] scrollbar-none">
        <span className="text-slate-400 shrink-0 font-medium ml-1">پرش سریع به منطقه:</span>
        {CITY_PRESETS.map((p, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSelectCityPreset(p)}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 shrink-0 transition hover:text-white"
          >
            {p.name}
          </button>
        ))}
      </div>

      {/* Map Container */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-700 shadow-md">
        <div ref={mapContainerRef} style={{ height, width: '100%' }} className="z-0" />

        {/* Floating Info Overlay */}
        <div className="absolute top-2 right-2 z-10 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 px-3 py-1.5 rounded-xl text-[11px] text-white flex items-center gap-1.5 shadow-lg">
          <MapPin className="w-3.5 h-3.5 text-red-500 animate-bounce" />
          <span>روی هر نقطه کلیک کنید یا نشانگر را بکشید</span>
        </div>

        {/* Locate Me GPS Button */}
        <button
          type="button"
          onClick={handleLocateMe}
          disabled={isLocating}
          className="absolute bottom-2 left-2 z-10 p-2 bg-slate-900/90 hover:bg-slate-800 text-white border border-slate-700 rounded-xl shadow-lg transition flex items-center gap-1.5 text-xs font-bold"
          title="موقعیت فعلی من"
        >
          <Crosshair className={`w-4 h-4 text-emerald-400 ${isLocating ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">{isLocating ? 'در حال جستجو...' : 'موقعیت من'}</span>
        </button>
      </div>

      {/* Live Coordinates Readout */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-2.5 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-3">
          <span className="text-slate-400 text-[11px]">مختصات ثبت شده هتل:</span>
          <span className="text-amber-300 font-bold" dir="ltr">
            Lat: {currentCoords.lat}
          </span>
          <span className="text-amber-300 font-bold" dir="ltr">
            Lng: {currentCoords.lng}
          </span>
        </div>
        <span className="text-[10px] text-emerald-400 font-medium font-sans flex items-center gap-1">
          <Check className="w-3 h-3" />
          تنظیم شد
        </span>
      </div>
    </div>
  );
};
