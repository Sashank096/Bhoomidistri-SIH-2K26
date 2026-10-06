import { FormEvent, useEffect, useRef, useState, type FC } from 'react';
import { Check, Loader2, MapPin, Search, X } from 'lucide-react';

interface GisLocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: string;
  district: string;
  initialLocation: string;
  onConfirmLocation: (locationStr: string, coords: { lat: number; lng: number; bbox: string }) => void;
}

type Coordinates = { lat: number; lng: number };
const MAP_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const DEFAULT_CENTERS: Record<string, Coordinates> = {
  Telangana: { lat: 17.385, lng: 78.486 },
  Maharashtra: { lat: 19.076, lng: 72.877 },
  Karnataka: { lat: 12.9716, lng: 77.5946 },
  'Andhra Pradesh': { lat: 16.506, lng: 80.648 },
};

function loadGoogleMaps(): Promise<void> {
  if ((window as any).google?.maps) return Promise.resolve();
  if (!MAP_KEY) return Promise.reject(new Error('Google Maps key is not configured. Add VITE_GOOGLE_MAPS_API_KEY to .env.local.'));
  return new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-bhoomi-google-maps]');
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Google Maps could not be loaded.')));
      return;
    }
    const script = document.createElement('script');
    script.dataset.bhoomiGoogleMaps = 'true';
    script.async = true;
    script.defer = true;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(MAP_KEY)}&v=weekly`;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Google Maps could not be loaded. Check the API key and enabled APIs.'));
    document.head.appendChild(script);
  });
}

const formatCoordinates = ({ lat, lng }: Coordinates) => `${lat.toFixed(6)}° N, ${lng.toFixed(6)}° E`;

export const GisLocationPickerModal: FC<GisLocationPickerModalProps> = ({ isOpen, onClose, state, district, initialLocation, onConfirmLocation }) => {
  const mapElement = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [query, setQuery] = useState(initialLocation || district || state || '');
  const [selectedPoint, setSelectedPoint] = useState<Coordinates>(DEFAULT_CENTERS[state] || DEFAULT_CENTERS['Andhra Pradesh']);
  const [locationName, setLocationName] = useState(initialLocation || '');
  const [layerType, setLayerType] = useState<'roadmap' | 'satellite' | 'terrain'>('roadmap');
  const [isLoading, setIsLoading] = useState(false);
  const [mapError, setMapError] = useState('');
  const [notice, setNotice] = useState('Search for a place or click the map to position the project pin.');

  const updateSelection = (point: Coordinates, label?: string) => {
    const normalized = { lat: Number(point.lat.toFixed(6)), lng: Number(point.lng.toFixed(6)) };
    setSelectedPoint(normalized);
    if (label) {
      setLocationName(label);
      setQuery(label);
    }
    markerRef.current?.setPosition(normalized);
  };

  useEffect(() => {
    if (!isOpen) return;
    setQuery(initialLocation || district || state || '');
    setLocationName(initialLocation || '');
    setMapError('');
    let cancelled = false;
    loadGoogleMaps().then(() => {
      if (cancelled || !mapElement.current || mapRef.current) return;
      const center = DEFAULT_CENTERS[state] || DEFAULT_CENTERS['Andhra Pradesh'];
      const googleMaps = (window as any).google.maps;
      const map = new googleMaps.Map(mapElement.current, {
        center, zoom: district ? 11 : 8, mapTypeId: layerType, streetViewControl: false,
        fullscreenControl: true, mapTypeControl: false, gestureHandling: 'greedy',
      });
      mapRef.current = map;
      markerRef.current = new googleMaps.Marker({ map, position: center, draggable: true, title: 'Project location' });
      map.addListener('click', (event: any) => {
        if (!event.latLng) return;
        updateSelection({ lat: event.latLng.lat(), lng: event.latLng.lng() });
        setNotice('Pin placed. Drag it to refine the exact project position.');
      });
      markerRef.current.addListener('dragend', (event: any) => {
        if (!event.latLng) return;
        updateSelection({ lat: event.latLng.lat(), lng: event.latLng.lng() });
        setNotice('Pin position updated.');
      });
    }).catch((error: Error) => {
      if (!cancelled) setMapError(error.message);
    });
    return () => {
      cancelled = true;
      if (mapRef.current) (window as any).google?.maps?.event?.clearInstanceListeners(mapRef.current);
      mapRef.current = null;
      markerRef.current = null;
    };
  }, [isOpen]);

  useEffect(() => {
    if (mapRef.current) mapRef.current.setMapTypeId(layerType);
  }, [layerType]);

  const handleSearch = (event: FormEvent) => {
    event.preventDefault();
    if (!query.trim() || !mapRef.current) return;
    setIsLoading(true);
    setNotice('Finding this place...');
    new (window as any).google.maps.Geocoder().geocode({ address: query.trim(), region: 'IN' }, (results: any[], status: string) => {
      setIsLoading(false);
      if (status !== 'OK' || !results?.[0]) {
        setNotice('Location not found. Try a village, mandal, district, or pincode.');
        return;
      }
      const result = results[0];
      const point = { lat: result.geometry.location.lat(), lng: result.geometry.location.lng() };
      mapRef.current.panTo(point);
      mapRef.current.setZoom(14);
      updateSelection(point, result.formatted_address);
      setNotice('Location found. Review the pin and confirm when ready.');
    });
  };

  const handleConfirm = () => {
    const delta = 0.005;
    const bbox = `${(selectedPoint.lat - delta).toFixed(6)},${(selectedPoint.lng - delta).toFixed(6)},${(selectedPoint.lat + delta).toFixed(6)},${(selectedPoint.lng + delta).toFixed(6)}`;
    onConfirmLocation(locationName || query || `${district || state || 'Selected'} project location`, { ...selectedPoint, bbox });
    onClose();
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn" role="dialog" aria-modal="true">
      <div className="bg-white rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl border border-gray-200 flex flex-col max-h-[90vh]">
        <div className="bg-[#0B3520] text-white p-4 sm:p-5 flex items-center justify-between border-b border-[#EAB308]">
          <div className="flex items-center gap-3"><div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-[#EAB308]"><MapPin className="w-5 h-5" /></div><div><h3 className="text-base font-bold text-white">Select Project Location on Map</h3><p className="text-xs text-white/70">Google Maps search and pin selection {state ? `• ${state}` : ''} {district ? `• ${district}` : ''}</p></div></div>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg text-white/70 hover:bg-white/10 hover:text-white transition-colors cursor-pointer" aria-label="Close"><X className="w-5 h-5" /></button>
        </div>
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 space-y-2">
          <form onSubmit={handleSearch} className="flex gap-2"><div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search village, mandal, district, pincode, or landmark" className="w-full pl-9 pr-3 py-2.5 text-xs border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B3520] bg-white" /></div><button type="submit" disabled={isLoading || !query.trim()} className="px-4 py-2 text-xs font-semibold text-white bg-[#0B3520] rounded-xl disabled:opacity-50 cursor-pointer flex items-center gap-1.5">{isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />} Search</button></form>
          <div className="flex flex-wrap items-center gap-2 text-[11px]"><span className="text-gray-500 font-medium">Map layer:</span>{(['roadmap', 'satellite', 'terrain'] as const).map((layer) => <button key={layer} type="button" onClick={() => setLayerType(layer)} className={`px-2.5 py-1 rounded-md font-semibold cursor-pointer ${layerType === layer ? 'bg-white text-[#0B3520] shadow-xs border border-gray-200' : 'text-gray-600 hover:text-gray-900'}`}>{layer.charAt(0).toUpperCase() + layer.slice(1)}</button>)}<span className="ml-auto font-mono text-gray-700">{formatCoordinates(selectedPoint)}</span></div>
        </div>
        <div className="relative min-h-[340px] bg-[#e5e7eb]"><div ref={mapElement} className="absolute inset-0" />{mapError && <div className="absolute inset-0 flex items-center justify-center p-6 bg-gray-100/95"><div className="max-w-md text-center"><MapPin className="w-10 h-10 mx-auto mb-3 text-[#0B3520]" /><h4 className="font-bold text-gray-900 mb-1">Google Maps is not configured</h4><p className="text-xs text-gray-600">{mapError} This picker intentionally does not use a simulated map, so location coordinates will only be saved after Maps is available.</p></div></div>}{!mapError && <div className="absolute left-3 bottom-3 px-3 py-2 rounded-lg bg-white/95 shadow-md text-[11px] text-gray-700">{notice}</div>}</div>
        <div className="p-4 bg-gray-50 border-t border-gray-200 space-y-3"><div><label className="block text-xs font-semibold text-gray-700 mb-1">Project Location / Alignment Description:</label><input type="text" value={locationName} onChange={(event) => setLocationName(event.target.value)} placeholder="e.g. Village / Mandal / Locality / Sector Alignment" className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B3520] bg-white font-medium" /></div><div className="flex items-center justify-between gap-3 pt-1"><div className="text-[11px] text-gray-500">Coordinates: <span className="font-mono font-semibold text-gray-800">{formatCoordinates(selectedPoint)}</span></div><div className="flex items-center gap-2"><button type="button" onClick={onClose} className="px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer">Cancel</button><button type="button" onClick={handleConfirm} disabled={Boolean(mapError)} className="px-4 py-2 text-xs font-semibold text-white bg-[#0B3520] hover:bg-[#082818] disabled:opacity-50 rounded-xl transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"><Check className="w-4 h-4 text-[#EAB308]" /> Confirm &amp; Apply Location</button></div></div></div>
      </div>
    </div>
  );
};
