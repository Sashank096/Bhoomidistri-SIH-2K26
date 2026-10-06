import React, { useEffect, useRef, useState } from 'react';
import { AlertTriangle, ArrowLeft, CheckCircle2, Crosshair, Layers, MapPin, Save, Search, ShieldCheck, Trash2 } from 'lucide-react';
import { SelectedLocationContext } from './LocationSelectionView';
import { landAcquisitionApi } from '../services/landAcquisitionApi';

interface GisMapModuleProps { locationContext?: SelectedLocationContext | null; onBackToLocationSelection?: () => void; }
type Coordinate = { lat: number; lng: number };
const DEFAULT_CENTER: Coordinate = { lat: 16.6, lng: 82.1 };
const MAP_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

function loadGoogleMaps(): Promise<void> {
  if ((window as any).google?.maps) return Promise.resolve();
  if (!MAP_KEY) return Promise.reject(new Error('Google Maps key is not configured. Add VITE_GOOGLE_MAPS_API_KEY to .env.local.'));
  return new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-bhoomi-google-maps]');
    if (existing) { existing.addEventListener('load', () => resolve()); existing.addEventListener('error', () => reject(new Error('Google Maps could not be loaded.'))); return; }
    const script = document.createElement('script'); script.dataset.bhoomiGoogleMaps = 'true'; script.async = true; script.defer = true;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(MAP_KEY)}&v=weekly`;
    script.onload = () => resolve(); script.onerror = () => reject(new Error('Google Maps could not be loaded.')); document.head.appendChild(script);
  });
}

export const GisMapModule: React.FC<GisMapModuleProps> = ({ locationContext, onBackToLocationSelection }) => {
  const mapRef = useRef<HTMLDivElement>(null); const mapObject = useRef<any>(null); const polygonObject = useRef<any>(null); const markers = useRef<any[]>([]);
  const [vertices, setVertices] = useState<Coordinate[]>([]); const [parcels, setParcels] = useState<any[]>([]); const [mapError, setMapError] = useState(''); const [notice, setNotice] = useState(''); const [searchQuery, setSearchQuery] = useState(''); const [isSaving, setIsSaving] = useState(false); const [isUnlocked, setIsUnlocked] = useState(false); const [showCadastral, setShowCadastral] = useState(true); const [is3DView, setIs3DView] = useState(false);
  const center = { lat: locationContext?.lat || DEFAULT_CENTER.lat, lng: locationContext?.lng || DEFAULT_CENTER.lng }; const locationName = locationContext?.locationName || 'Amaravati Capital Region';

  useEffect(() => { let alive = true; loadGoogleMaps().then(() => { if (!alive || !mapRef.current) return; const google = (window as any).google; const map = new google.maps.Map(mapRef.current, { center, zoom: 11, mapTypeControl: false, streetViewControl: false, fullscreenControl: true, mapId: 'BHOOMIDRISHTI_GIS' }); mapObject.current = map; map.addListener('click', (event: any) => { if (!isUnlocked || !event.latLng) return; setVertices((current) => [...current, { lat: event.latLng.lat(), lng: event.latLng.lng() }]); }); }).catch((error: Error) => alive && setMapError(error.message)); return () => { alive = false; }; }, [center.lat, center.lng, isUnlocked]);
  useEffect(() => { if (!mapObject.current || !isUnlocked) return; if (polygonObject.current) polygonObject.current.setMap(null); if (vertices.length < 2) return; const google = (window as any).google; polygonObject.current = new google.maps.Polygon({ paths: vertices, strokeColor: '#0B3520', strokeOpacity: 0.95, strokeWeight: 2, fillColor: '#D9A441', fillOpacity: 0.25, map: mapObject.current, editable: true }); }, [vertices, isUnlocked]);
  useEffect(() => { landAcquisitionApi.searchRegistry((locationContext?.village || '').trim()).then(setParcels).catch(() => setParcels([])); }, [locationContext?.village]);
  useEffect(() => { markers.current.forEach((marker) => marker.setMap(null)); markers.current = []; if (!showCadastral || !mapObject.current || !(window as any).google) return; const google = (window as any).google; parcels.slice(0, 30).forEach((parcel) => { if (typeof parcel.latitude !== 'number' || typeof parcel.longitude !== 'number') return; markers.current.push(new google.maps.Marker({ map: mapObject.current, position: { lat: parcel.latitude, lng: parcel.longitude }, title: `${parcel.parcel_id || 'Parcel'} · ${parcel.survey_number || ''}`, opacity: 0.75 })); }); }, [parcels, showCadastral, mapError]);

  const searchLocation = () => {
    const query = searchQuery.trim();
    if (!query || !mapObject.current || !(window as any).google) return;
    const google = (window as any).google;
    new google.maps.Geocoder().geocode({ address: query, region: 'IN' }, (results: any[], status: string) => {
      if (status !== 'OK' || !results?.[0]) { setNotice('Location not found. Try a village, district, survey area, or landmark.'); return; }
      const result = results[0]; mapObject.current.panTo(result.geometry.location); mapObject.current.setZoom(15); setNotice(`Map centered on ${result.formatted_address}.`);
    });
  };

  const toggle3DView = () => {
    if (!mapObject.current) return;
    const next = !is3DView;
    setIs3DView(next);
    mapObject.current.setMapTypeId(next ? 'satellite' : 'roadmap');
    mapObject.current.setTilt(next ? 45 : 0);
    mapObject.current.setHeading(next ? 20 : 0);
    mapObject.current.setZoom(next ? 17 : 11);
    setNotice(next ? 'Clean 3D satellite view enabled. Use the map to inspect the selected area.' : 'Standard GIS map view restored.');
  };

  const saveBoundary = async () => { if (vertices.length < 3) { setNotice('Add at least three boundary points before saving.'); return; } setIsSaving(true); setNotice(''); try { await landAcquisitionApi.updateBoundary(locationContext?.associatedProjectId || 'PRJ-1042', { type: 'Feature', properties: { location: locationName }, geometry: { type: 'Polygon', coordinates: [[...vertices.map((point) => [point.lng, point.lat]), [vertices[0].lng, vertices[0].lat]]] } }); setNotice('GIS boundary saved to the shared project record and audit log.'); } catch (error) { setNotice(error instanceof Error ? error.message : 'Boundary could not be saved.'); } finally { setIsSaving(false); } };

  return <div className="min-h-full space-y-5"><div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3"><div><div className="flex items-center gap-2 text-[#0B3520] text-xs font-bold uppercase tracking-wider"><MapPin className="w-4 h-4" /> GIS boundary mapping</div><h1 className="text-2xl font-extrabold text-gray-900 mt-1">{locationName}</h1><p className="text-xs text-gray-500 mt-1">{locationContext?.state || 'Andhra Pradesh'} · {locationContext?.district || 'Guntur'} · {locationContext?.village || 'Amaravati'}</p></div>{onBackToLocationSelection && <button type="button" onClick={onBackToLocationSelection} className="inline-flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-[#0B3520]"><ArrowLeft className="w-4 h-4" /> Change location</button>}</div>
    <form onSubmit={(event) => { event.preventDefault(); searchLocation(); }} className="rounded-2xl bg-white border border-gray-200 shadow-sm p-3 flex gap-2"><div className="flex-1 relative"><Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" /><input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search village, district, survey area, or landmark" className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-9 pr-3 py-2.5 text-sm outline-none focus:border-[#0B3520] focus:ring-2 focus:ring-emerald-100" aria-label="Search map location" /></div><button type="submit" className="rounded-xl bg-[#0B3520] text-white px-4 py-2.5 text-xs font-bold inline-flex items-center gap-2"><Search className="w-3.5 h-3.5" /> Search location</button></form>
    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 flex items-start gap-3 text-xs text-amber-900"><ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" /><p><b>Secure GIS session.</b> Two-factor verification is completed during portal access. Unlock map editing only after your authenticated session is active.</p><button type="button" onClick={() => setIsUnlocked((value) => !value)} className="ml-auto shrink-0 rounded-lg bg-[#0B3520] text-white px-3 py-1.5 font-bold">{isUnlocked ? 'Lock editing' : 'Unlock editing'}</button></div>
    {mapError && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-800 flex items-center gap-2"><AlertTriangle className="w-4 h-4" />{mapError}</div>}{notice && <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-800 flex items-center gap-2"><CheckCircle2 className="w-4 h-4" />{notice}</div>}
    <div className="grid lg:grid-cols-[1fr_300px] gap-5"><section className="rounded-2xl bg-white border border-gray-200 shadow-sm overflow-hidden"><div className="p-4 border-b border-gray-100 flex items-center justify-between gap-3"><div><h2 className="font-extrabold text-gray-900">{is3DView ? 'Clean 3D terrain view' : 'Cadastral map canvas'}</h2><p className="text-[11px] text-gray-500 mt-1">{isUnlocked ? 'Click the map to add boundary vertices.' : 'Map is view-only until editing is unlocked.'}</p></div><div className="flex items-center gap-2"><button type="button" onClick={toggle3DView} className={`inline-flex items-center gap-1.5 text-xs font-bold rounded-lg px-3 py-2 border ${is3DView ? 'bg-[#0B3520] text-white border-[#0B3520]' : 'text-gray-600 border-gray-200'}`}>{is3DView ? '2D map' : '3D view'}</button><button type="button" onClick={() => setShowCadastral((value) => !value)} className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 border border-gray-200 rounded-lg px-3 py-2"><Layers className="w-3.5 h-3.5" /> Parcels {showCadastral ? 'on' : 'off'}</button></div></div><div ref={mapRef} className="h-[460px] w-full bg-[#E8EFEA]" />{!MAP_KEY && <div className="p-4 text-xs text-gray-500 border-t border-gray-100">Configure the browser-restricted Google Maps key to display the live map.</div>}</section><aside className="rounded-2xl bg-white border border-gray-200 shadow-sm p-5 h-fit space-y-5"><div><p className="text-[11px] uppercase tracking-wide font-bold text-gray-500">Boundary draft</p><p className="text-2xl font-extrabold text-[#0B3520] mt-1">{vertices.length} <span className="text-sm font-semibold text-gray-500">points</span></p></div><div className="rounded-xl bg-gray-50 border border-gray-100 p-4 space-y-2 text-xs"><div className="flex justify-between"><span className="text-gray-500">Registry parcels</span><b>{parcels.length}</b></div><div className="flex justify-between"><span className="text-gray-500">Editing</span><b className={isUnlocked ? 'text-emerald-700' : 'text-gray-500'}>{isUnlocked ? 'Unlocked' : 'Locked'}</b></div><div className="flex justify-between"><span className="text-gray-500">Map mode</span><b>{is3DView ? '3D satellite' : '2D cadastral'}</b></div></div><div className="flex gap-2"><button type="button" onClick={() => setVertices([])} className="flex-1 inline-flex justify-center items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2.5 text-xs font-bold text-gray-600"><Trash2 className="w-3.5 h-3.5" /> Clear</button><button type="button" disabled={isSaving || !isUnlocked} onClick={saveBoundary} className="flex-1 inline-flex justify-center items-center gap-1.5 rounded-xl bg-[#0B3520] text-white px-3 py-2.5 text-xs font-bold disabled:opacity-40"><Save className="w-3.5 h-3.5" /> {isSaving ? 'Saving' : 'Save boundary'}</button></div><div className="text-[11px] leading-5 text-gray-500 flex items-start gap-2"><Crosshair className="w-3.5 h-3.5 mt-0.5 shrink-0" /> Search the location above, switch to 3D, then unlock editing to place and save the required area.</div></aside></div>
  </div>;
};
