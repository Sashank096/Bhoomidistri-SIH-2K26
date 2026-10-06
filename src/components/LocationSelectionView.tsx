import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  MapPin,
  Search,
  Navigation,
  Globe,
  Layers,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Compass,
  Building2,
  FileText,
  ShieldCheck,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sparkles,
  Info,
  Copy,
  Check,
  ChevronRight,
  Share2,
  Bookmark,
  Filter,
  Eye,
  SlidersHorizontal,
  Crosshair,
  Map as MapIcon,
  ExternalLink,
} from 'lucide-react';
import {
  INDIAN_GEOGRAPHIC_DATA,
  POPULAR_LOCATION_PRESETS,
  VillageRecord,
  MandalRecord,
  DistrictRecord,
  StateRecord,
  LocationSearchResult,
} from '../data/locationData';
import { ProjectRecord } from '../types';
import { INITIAL_PROJECTS } from '../data/projectsData';

export interface SelectedLocationContext {
  state: string;
  stateCode: string;
  stateLgd: string;
  district: string;
  districtLgd: string;
  mandal: string;
  mandalLgd: string;
  village: string;
  villageLgd: string;
  locationName: string;
  lat: number;
  lng: number;
  elevationMeters: number;
  pincode: string;
  surveyAuthority: string;
  toposheetNo: string;
  revenueDivision: string;
  subRegistrarOffice: string;
  cadastralSheetsCount: number;
  totalSurveyParcels: number;
  bbox: [number, number, number, number];
  associatedProjectId?: string;
  associatedProjectName?: string;
}

interface LocationSelectionViewProps {
  onContinueToGis?: (locationContext: SelectedLocationContext) => void;
  selectedProject?: ProjectRecord | null;
  availableProjects?: ProjectRecord[];
  onSelectProject?: (project: ProjectRecord) => void;
}

export const LocationSelectionView: React.FC<LocationSelectionViewProps> = ({
  onContinueToGis,
  selectedProject: initialProject,
  availableProjects = INITIAL_PROJECTS,
  onSelectProject,
}) => {
  // Linked project state
  const [currentProject, setCurrentProject] = useState<ProjectRecord | null>(
    initialProject || (availableProjects.length > 0 ? availableProjects[0] : null)
  );

  // Selected administrative hierarchy state
  // Default to Andhra Pradesh > Guntur > Thullur > Amaravati as the primary prompt example
  const [selectedState, setSelectedState] = useState<string>('Andhra Pradesh');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('Guntur');
  const [selectedMandal, setSelectedMandal] = useState<string>('Thullur');
  const [selectedVillageName, setSelectedVillageName] = useState<string>('Amaravati');
  const [pincodeInput, setPincodeInput] = useState<string>('');
  const [pincodeMessage, setPincodeMessage] = useState<string>('');
  const [manualLocationMessage, setManualLocationMessage] = useState<string>('');
  const [locationName, setLocationName] = useState<string>(
    'Amaravati Capital Region (Seed Access Road Alignment)'
  );

  // Exact coordinates
  const [lat, setLat] = useState<number>(16.5131);
  const [lng, setLng] = useState<number>(80.5165);
  const [elevation, setElevation] = useState<number>(24);

  // Search input & state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearchFocused, setIsSearchFocused] = useState<boolean>(false);
  const [searchFilterType, setSearchFilterType] = useState<string>('ALL');

  // Map state
  const [mapLayer, setMapLayer] = useState<'carto' | 'satellite' | 'terrain' | 'bhuvan'>('carto');
  const [showBoundaries, setShowBoundaries] = useState<boolean>(true);
  const [showRiverOverlay, setShowRiverOverlay] = useState<boolean>(true);
  const [showCorridorBuffer, setShowCorridorBuffer] = useState<boolean>(true);
  const [showToposheetGrid, setShowToposheetGrid] = useState<boolean>(true);
  const [showHeatmap, setShowHeatmap] = useState<boolean>(true);
  const [isEditingRequiredPositions, setIsEditingRequiredPositions] = useState<boolean>(false);
  const [requiredPositions, setRequiredPositions] = useState<Array<{ x: number; y: number; lat: number; lng: number }>>([]);
  const [zoomLevel, setZoomLevel] = useState<number>(14);
  const [isMapFullscreen, setIsMapFullscreen] = useState<boolean>(false);
  const [isDraggingPin, setIsDraggingPin] = useState<boolean>(false);
  const [hoverCoords, setHoverCoords] = useState<{ lat: number; lng: number } | null>(null);

  // UI state
  const [copiedCoords, setCopiedCoords] = useState<boolean>(false);
  const [toastNotification, setToastNotification] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'hierarchy' | 'search' | 'presets'>('hierarchy');

  const mapContainerRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string) => {
    setToastNotification(msg);
    setTimeout(() => setToastNotification(null), 3500);
  };

  // Synchronize initial project if changed from parent
  useEffect(() => {
    if (initialProject) {
      setCurrentProject(initialProject);
      if (initialProject.state && INDIAN_GEOGRAPHIC_DATA.states.some(s => s.name === initialProject.state)) {
        setSelectedState(initialProject.state);
        if (initialProject.district) {
          setSelectedDistrict(initialProject.district);
        }
      }
      if (initialProject.location) {
        setLocationName(initialProject.location);
      }
      if (initialProject.gisCoordinates) {
        setLat(initialProject.gisCoordinates.lat);
        setLng(initialProject.gisCoordinates.lng);
      }
    }
  }, [initialProject]);

  // Available districts for selected state
  const availableDistricts = useMemo(() => {
    return INDIAN_GEOGRAPHIC_DATA.districts[selectedState] || [];
  }, [selectedState]);

  // Available mandals for selected district
  const availableMandals = useMemo(() => {
    return INDIAN_GEOGRAPHIC_DATA.mandals[selectedDistrict] || [];
  }, [selectedDistrict]);

  // Available villages for selected mandal
  const availableVillages = useMemo(() => {
    return INDIAN_GEOGRAPHIC_DATA.villages[selectedMandal] || [];
  }, [selectedMandal]);

  // Some mandals have their village names in the administrative index before
  // detailed village metadata is available. Keep those names selectable too.
  const villageOptions = useMemo(() => {
    if (availableVillages.length > 0) return availableVillages.map((v) => ({ name: v.name, pincode: v.pincode }));
    const mandal = availableMandals.find((m) => m.name === selectedMandal);
    return (mandal?.villages || []).map((name) => ({ name, pincode: '—' }));
  }, [availableVillages, availableMandals, selectedMandal]);

  // Current Village Record metadata
  const currentVillageRecord: VillageRecord = useMemo(() => {
    const found = availableVillages.find((v) => v.name === selectedVillageName);
    if (found) return found;

    // Fallback default village object
    return {
      id: 'VIL-522503-01',
      name: selectedVillageName || 'Amaravati',
      mandal: selectedMandal || 'Thullur',
      district: selectedDistrict || 'Guntur',
      state: selectedState || 'Andhra Pradesh',
      pincode: '522503',
      lgdCode: '587642',
      lat: lat,
      lng: lng,
      elevationMeters: elevation,
      surveyAuthority: 'Directorate of Survey, Settlement & Land Records',
      toposheetNo: 'SOI-65D/10-SE',
      revenueDivision: `${selectedDistrict || 'Guntur'} Revenue Division`,
      subRegistrarOffice: `Sub-Registrar Office, ${selectedMandal || 'Thullur'}`,
      cadastralSheetsCount: 16,
      totalSurveyParcels: 1240,
      bbox: [lat - 0.03, lng - 0.03, lat + 0.03, lng + 0.03],
    };
  }, [availableVillages, selectedVillageName, selectedMandal, selectedDistrict, selectedState, lat, lng, elevation]);

  // State metadata
  const currentStateRecord = useMemo(() => {
    return INDIAN_GEOGRAPHIC_DATA.states.find((s) => s.name === selectedState) || {
      name: selectedState,
      code: 'AP',
      lgdCode: '28',
      districts: [],
    };
  }, [selectedState]);

  // District metadata
  const currentDistrictRecord = useMemo(() => {
    return availableDistricts.find((d) => d.name === selectedDistrict) || {
      name: selectedDistrict,
      state: selectedState,
      lgdCode: '506',
      headquarters: selectedDistrict,
      mandals: [],
      centerLat: lat,
      centerLng: lng,
    };
  }, [availableDistricts, selectedDistrict, selectedState, lat, lng]);

  // Mandal metadata
  const currentMandalRecord = useMemo(() => {
    return availableMandals.find((m) => m.name === selectedMandal) || {
      name: selectedMandal,
      district: selectedDistrict,
      state: selectedState,
      lgdCode: '4921',
      headquarters: selectedMandal,
      villages: [],
      lat: lat,
      lng: lng,
    };
  }, [availableMandals, selectedMandal, selectedDistrict, selectedState, lat, lng]);

  // Handle State Change
  const handleStateChange = (newState: string) => {
    setSelectedState(newState);
    const districts = INDIAN_GEOGRAPHIC_DATA.districts[newState] || [];
    if (districts.length > 0) {
      const firstDistrict = districts[0].name;
      setSelectedDistrict(firstDistrict);
      const mandals = INDIAN_GEOGRAPHIC_DATA.mandals[firstDistrict] || [];
      if (mandals.length > 0) {
        const firstMandal = mandals[0].name;
        setSelectedMandal(firstMandal);
        const villages = INDIAN_GEOGRAPHIC_DATA.villages[firstMandal] || [];
        if (villages.length > 0) {
          setSelectedVillageName(villages[0].name);
          setLat(villages[0].lat);
          setLng(villages[0].lng);
          setElevation(villages[0].elevationMeters);
        }
      }
    }
  };

  // Handle District Change
  const handleDistrictChange = (newDistrict: string) => {
    setSelectedDistrict(newDistrict);
    const mandals = INDIAN_GEOGRAPHIC_DATA.mandals[newDistrict] || [];
    if (mandals.length > 0) {
      const firstMandal = mandals[0].name;
      setSelectedMandal(firstMandal);
      const villages = INDIAN_GEOGRAPHIC_DATA.villages[firstMandal] || [];
      if (villages.length > 0) {
        setSelectedVillageName(villages[0].name);
        setLat(villages[0].lat);
        setLng(villages[0].lng);
        setElevation(villages[0].elevationMeters);
      }
    } else {
      setSelectedMandal('');
      setSelectedVillageName('');
    }
  };

  // Handle Mandal Change
  const handleMandalChange = (newMandal: string) => {
    setSelectedMandal(newMandal);
    const villages = INDIAN_GEOGRAPHIC_DATA.villages[newMandal] || [];
    if (villages.length > 0) {
      setSelectedVillageName(villages[0].name);
      setLat(villages[0].lat);
      setLng(villages[0].lng);
      setElevation(villages[0].elevationMeters);
    } else {
      setSelectedVillageName('');
    }
  };

  // Handle Village Change
  const handleVillageChange = (newVillageName: string) => {
    setSelectedVillageName(newVillageName);
    const found = availableVillages.find((v) => v.name === newVillageName);
    if (found) {
      setLat(found.lat);
      setLng(found.lng);
      setElevation(found.elevationMeters);
      showToast(`Location set to ${found.name}, ${found.mandal} Mandal (${found.lgdCode})`);
    }
  };

  // Match typed location text against the registry and synchronize all
  // geographic fields used by the map and the selected-location summary.
  useEffect(() => {
    const query = locationName.trim().toLowerCase();
    if (query.length < 3) {
      setManualLocationMessage('');
      return;
    }

    const villageRecords = Object.values(INDIAN_GEOGRAPHIC_DATA.villages).flat();
    const villageMatch = villageRecords.find((village) => query.includes(village.name.toLowerCase()));
    if (villageMatch) {
      setSelectedState(villageMatch.state);
      setSelectedDistrict(villageMatch.district);
      setSelectedMandal(villageMatch.mandal);
      setSelectedVillageName(villageMatch.name);
      setLat(villageMatch.lat);
      setLng(villageMatch.lng);
      setElevation(villageMatch.elevationMeters);
      setManualLocationMessage(`Location matched: ${villageMatch.name}. Coordinates updated.`);
      return;
    }

    const mandalMatch = Object.values(INDIAN_GEOGRAPHIC_DATA.mandals).flat().find((mandal) => query.includes(mandal.name.toLowerCase()));
    if (mandalMatch) {
      const firstVillage = villageRecords.find((village) => village.mandal === mandalMatch.name);
      setSelectedState(mandalMatch.state);
      setSelectedDistrict(mandalMatch.district);
      setSelectedMandal(mandalMatch.name);
      setSelectedVillageName(firstVillage?.name || '');
      setLat(firstVillage?.lat || mandalMatch.lat);
      setLng(firstVillage?.lng || mandalMatch.lng);
      setElevation(firstVillage?.elevationMeters || 0);
      setManualLocationMessage(`Mandal matched: ${mandalMatch.name}. Coordinates updated.`);
      return;
    }

    setManualLocationMessage('No registry match yet. Refine the location on the map if needed.');
  }, [locationName]);

  // Pincode is optional. When six digits are entered, suggest the first
  // matching village and synchronize the administrative hierarchy.
  const handlePincodeChange = (value: string) => {
    const nextValue = value.replace(/\D/g, '').slice(0, 6);
    setPincodeInput(nextValue);
    setPincodeMessage('');
    if (nextValue.length !== 6) return;

    const match = Object.values(INDIAN_GEOGRAPHIC_DATA.villages)
      .flat()
      .find((village) => village.pincode === nextValue);

    if (!match) {
      setPincodeMessage('No matching village found. You can continue with manual location selection.');
      return;
    }

    setSelectedState(match.state);
    setSelectedDistrict(match.district);
    setSelectedMandal(match.mandal);
    setSelectedVillageName(match.name);
    setLat(match.lat);
    setLng(match.lng);
    setElevation(match.elevationMeters);
    setPincodeMessage(`Suggested location: ${match.name}, ${match.mandal} Mandal, ${match.district}.`);
    showToast(`Location suggested from pincode ${nextValue}`);
  };

  // Global search autocomplete results
  const searchResults: LocationSearchResult[] = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const q = searchQuery.toLowerCase().trim();
    const results: LocationSearchResult[] = [];

    // Search across all villages
    Object.values(INDIAN_GEOGRAPHIC_DATA.villages).forEach((villageList) => {
      villageList.forEach((vil) => {
        if (
          vil.name.toLowerCase().includes(q) ||
          vil.mandal.toLowerCase().includes(q) ||
          vil.district.toLowerCase().includes(q) ||
          vil.pincode.includes(q) ||
          vil.lgdCode.includes(q)
        ) {
          results.push({
            title: `${vil.name} (${vil.mandal})`,
            subtitle: `${vil.district}, ${vil.state} • PIN: ${vil.pincode} • LGD: ${vil.lgdCode}`,
            type: 'village',
            state: vil.state,
            district: vil.district,
            mandal: vil.mandal,
            village: vil.name,
            lat: vil.lat,
            lng: vil.lng,
            pincode: vil.pincode,
            lgdCode: vil.lgdCode,
          });
        }
      });
    });

    // Search across mandals
    Object.values(INDIAN_GEOGRAPHIC_DATA.mandals).forEach((mandalList) => {
      mandalList.forEach((m) => {
        if (m.name.toLowerCase().includes(q) || m.district.toLowerCase().includes(q)) {
          results.push({
            title: `${m.name} Mandal`,
            subtitle: `HQ: ${m.headquarters}, ${m.district}, ${m.state} • LGD: ${m.lgdCode}`,
            type: 'mandal',
            state: m.state,
            district: m.district,
            mandal: m.name,
            village: m.villages[0] || m.name,
            lat: m.lat,
            lng: m.lng,
            pincode: '522001',
            lgdCode: m.lgdCode,
          });
        }
      });
    });

    // Check if query is coordinate format (e.g. 16.5131, 80.5165)
    const coordMatch = q.match(/^(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)$/);
    if (coordMatch) {
      const parsedLat = parseFloat(coordMatch[1]);
      const parsedLng = parseFloat(coordMatch[3]);
      results.unshift({
        title: `Custom Coordinates (${parsedLat.toFixed(4)}, ${parsedLng.toFixed(4)})`,
        subtitle: `User-defined pinpoint geodetic location`,
        type: 'survey',
        state: selectedState,
        district: selectedDistrict,
        mandal: selectedMandal,
        village: selectedVillageName,
        lat: parsedLat,
        lng: parsedLng,
        pincode: currentVillageRecord.pincode,
        lgdCode: 'MANUAL-GEO',
      });
    }

    return results.slice(0, 8);
  }, [searchQuery, selectedState, selectedDistrict, selectedMandal, selectedVillageName, currentVillageRecord]);

  // Apply a search selection
  const handleSelectSearchResult = (result: LocationSearchResult) => {
    setSelectedState(result.state);
    setSelectedDistrict(result.district);
    setSelectedMandal(result.mandal);
    setSelectedVillageName(result.village);
    setLat(result.lat);
    setLng(result.lng);
    setLocationName(`${result.village} Corridor Alignment`);
    setSearchQuery('');
    setIsSearchFocused(false);
    showToast(`Geographic context focused on ${result.village}, ${result.district}`);
  };

  // Apply a popular preset
  const handleSelectPreset = (preset: typeof POPULAR_LOCATION_PRESETS[0]) => {
    setSelectedState(preset.state);
    setSelectedDistrict(preset.district);
    setSelectedMandal(preset.mandal);
    setSelectedVillageName(preset.village);
    setLocationName(preset.locationName);
    setLat(preset.lat);
    setLng(preset.lng);
    showToast(`Preset loaded: ${preset.title}`);
  };

  // Interactive Map Canvas Click / Drag Handler
  const handleMapClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Relative map bounds to geo coordinates calculation
    // Base center = current village center
    const width = rect.width;
    const height = rect.height;

    // Delta span based on zoom level
    const spanLat = 0.12 / (zoomLevel / 10);
    const spanLng = 0.16 / (zoomLevel / 10);

    const newLng = lng + ((clickX - width / 2) / width) * spanLng;
    const newLat = lat - ((clickY - height / 2) / height) * spanLat;

    if (isEditingRequiredPositions) {
      setRequiredPositions((positions) => [
        ...positions,
        { x: clickX, y: clickY, lat: parseFloat(newLat.toFixed(5)), lng: parseFloat(newLng.toFixed(5)) },
      ]);
      showToast(`Required position added at ${newLat.toFixed(4)}° N, ${newLng.toFixed(4)}° E`);
      return;
    }

    setLat(parseFloat(newLat.toFixed(5)));
    setLng(parseFloat(newLng.toFixed(5)));

    // Estimate elevation delta slightly based on coordinates
    const estElev = Math.max(10, Math.round(24 + (Math.sin(newLat * 100) + Math.cos(newLng * 100)) * 6));
    setElevation(estElev);

    showToast(`Pin moved to: ${newLat.toFixed(4)}° N, ${newLng.toFixed(4)}° E`);
  };

  // Track hover coordinates for HUD
  const handleMapMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    const width = rect.width;
    const height = rect.height;

    const spanLat = 0.12 / (zoomLevel / 10);
    const spanLng = 0.16 / (zoomLevel / 10);

    const curLng = lng + ((clickX - width / 2) / width) * spanLng;
    const curLat = lat - ((clickY - height / 2) / height) * spanLat;

    setHoverCoords({ lat: parseFloat(curLat.toFixed(5)), lng: parseFloat(curLng.toFixed(5)) });
  };

  // Copy coordinates to clipboard
  const handleCopyCoords = () => {
    navigator.clipboard.writeText(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    setCopiedCoords(true);
    showToast('Geographic coordinates copied to clipboard (WGS-84)');
    setTimeout(() => setCopiedCoords(false), 2500);
  };

  // Final Action: Continue to GIS
  const handleContinueToGis = () => {
    const locationContext: SelectedLocationContext = {
      state: selectedState,
      stateCode: currentStateRecord.code,
      stateLgd: currentStateRecord.lgdCode,
      district: selectedDistrict,
      districtLgd: currentDistrictRecord.lgdCode,
      mandal: selectedMandal,
      mandalLgd: currentMandalRecord.lgdCode,
      village: selectedVillageName,
      villageLgd: currentVillageRecord.lgdCode,
      locationName: locationName || `${selectedVillageName} Project Alignment`,
      lat: lat,
      lng: lng,
      elevationMeters: elevation,
      pincode: pincodeInput || currentVillageRecord.pincode,
      surveyAuthority: currentVillageRecord.surveyAuthority,
      toposheetNo: currentVillageRecord.toposheetNo,
      revenueDivision: currentVillageRecord.revenueDivision,
      subRegistrarOffice: currentVillageRecord.subRegistrarOffice,
      cadastralSheetsCount: currentVillageRecord.cadastralSheetsCount,
      totalSurveyParcels: currentVillageRecord.totalSurveyParcels,
      bbox: currentVillageRecord.bbox,
      associatedProjectId: currentProject?.id,
      associatedProjectName: currentProject?.name,
    };

    if (onContinueToGis) {
      onContinueToGis(locationContext);
    } else {
      showToast('Proceeding to GIS Cadastral Mapping Engine...');
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Toast Notification */}
      {toastNotification && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0B3520] text-emerald-100 px-4 py-3 rounded-xl shadow-xl border border-[#EAB308]/60 flex items-center gap-3 animate-slideUp text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-[#EAB308] shrink-0" />
          <span>{toastNotification}</span>
        </div>
      )}

      {/* 1. Page Title & Operational Header */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-emerald-100 text-emerald-900 border border-emerald-300">
                Page 5 of 8
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] text-gray-500 font-medium">
                <Globe className="w-3.5 h-3.5 text-emerald-700" />
                Geographic Identification Phase
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-[#111827] tracking-tight flex items-center gap-2">
              <span>Location Selection</span>
              <span className="text-gray-400 font-normal text-lg">|</span>
              <span className="text-sm sm:text-base font-semibold text-emerald-800">
                Geographic Context &amp; Spatial Alignment
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-gray-600">
              Establish and verify the exact administrative and spatial jurisdiction before initiating parcel-level GIS acquisition boundaries.
            </p>
          </div>

          {/* Right Controls: Linked Project Selector + Fast Continue */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Project Picker dropdown */}
            <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-1.5 text-xs">
              <Building2 className="w-3.5 h-3.5 text-gray-500" />
              <span className="text-gray-500 font-medium">Project:</span>
              <select
                value={currentProject?.id || ''}
                onChange={(e) => {
                  const p = availableProjects.find((proj) => proj.id === e.target.value);
                  if (p) {
                    setCurrentProject(p);
                    if (onSelectProject) onSelectProject(p);
                    if (p.state) handleStateChange(p.state);
                    if (p.district) handleDistrictChange(p.district);
                    if (p.location) setLocationName(p.location);
                    showToast(`Context bound to Project ${p.id} - ${p.name}`);
                  }
                }}
                className="bg-transparent font-bold text-gray-900 focus:outline-none cursor-pointer"
              >
                {availableProjects.length === 0 ? (
                  <option value="">No registered projects</option>
                ) : (
                  availableProjects.map((proj) => (
                    <option key={proj.id} value={proj.id}>
                      {proj.id} - {proj.name}
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Quick Continue to GIS button in header */}
            <button
              type="button"
              id="header-continue-to-gis-btn"
              onClick={handleContinueToGis}
              className="px-4 py-2 rounded-xl bg-[#0B3520] hover:bg-[#06452F] text-white font-bold text-xs tracking-wide shadow-md flex items-center gap-2 border border-[#EAB308]/60 transition-all hover:scale-[1.02] cursor-pointer"
            >
              <span>Continue to GIS</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#EAB308]" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Crucial Distinction Banner: Location Selection ≠ GIS Mapping */}
      <div className="rounded-2xl bg-gradient-to-r from-[#0B3520] to-[#124D30] text-white p-5 border border-[#EAB308]/60 shadow-md">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#EAB308]/20 border border-[#EAB308]/50 flex items-center justify-center shrink-0 text-[#EAB308] mt-0.5">
            <Info className="w-5 h-5" />
          </div>
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-extrabold text-[#EAB308] uppercase tracking-wider">
                Crucial Statutory Distinction: Location Selection ≠ GIS Mapping
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="bg-black/25 rounded-xl p-3 border border-white/10 space-y-1">
                <div className="font-bold text-emerald-300 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#EAB308]" />
                  <span>1. Location Selection (This Screen)</span>
                </div>
                <p className="text-emerald-100/90 leading-relaxed">
                  Identifies <strong>WHERE</strong> the project is situated. Establishes the administrative hierarchy (State → District → Mandal/Taluk → Revenue Village), centroid coordinates, Local Government Directory (LGD) identifiers, and revenue division jurisdiction.
                </p>
              </div>

              <div className="bg-black/25 rounded-xl p-3 border border-white/10 space-y-1">
                <div className="font-bold text-emerald-300 flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-[#EAB308]" />
                  <span>2. GIS Mapping (Next Stage)</span>
                </div>
                <p className="text-emerald-100/90 leading-relaxed">
                  Defines the <strong>EXACT PROJECT &amp; ACQUISITION BOUNDARY</strong>. Ingests spatial cadastral shapefiles, delineates Khasra/Survey parcel polygons, calculates Right-of-Way (RoW) buffer lines, and evaluates high-risk land disputes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Multi-Mode Location Search Bar with Instant Autocomplete */}
      <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-2xs space-y-3">
        <div className="relative">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                id="location-global-search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                placeholder="Search by Village (e.g. Amaravati, Velagapudi), Mandal (e.g. Thullur), Pincode (522503), LGD Code (587642), or Lat/Lng (16.5131, 80.5165)..."
                className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-300 focus:border-[#0B3520] focus:bg-white rounded-xl text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Quick Geolocation button */}
            <button
              type="button"
              onClick={() => {
                showToast('Resolving GPS Node... Locked to Amaravati Region (16.5131° N, 80.5165° E)');
                setLat(16.5131);
                setLng(80.5165);
              }}
              title="Use Central Spatial Geodesic Node"
              className="px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 hover:bg-emerald-50 hover:border-emerald-300 text-gray-700 hover:text-emerald-800 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Navigation className="w-3.5 h-3.5 text-emerald-700" />
              <span className="hidden sm:inline">GPS Node</span>
            </button>
          </div>

          {/* Autocomplete Dropdown */}
          {isSearchFocused && searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-40 overflow-hidden max-h-72 overflow-y-auto">
              <div className="p-2 bg-gray-50 border-b border-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center justify-between">
                <span>Matching Revenue Jurisdictions &amp; Nodes ({searchResults.length})</span>
                <span>Select to Focus</span>
              </div>
              <div className="divide-y divide-gray-100">
                {searchResults.map((res, idx) => (
                  <button
                    key={`${res.title}-${idx}`}
                    type="button"
                    onClick={() => handleSelectSearchResult(res)}
                    className="w-full px-3.5 py-2.5 text-left hover:bg-emerald-50/80 transition-colors flex items-center justify-between gap-3 cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-900 flex items-center justify-center shrink-0 group-hover:bg-[#0B3520] group-hover:text-white transition-colors">
                        <MapPin className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-gray-900 group-hover:text-[#0B3520]">
                          {res.title}
                        </div>
                        <div className="text-[11px] text-gray-500">
                          {res.subtitle}
                        </div>
                      </div>
                    </div>
                    <div className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {res.lat.toFixed(4)}, {res.lng.toFixed(4)}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Popular Presets Chips Row */}
        <div className="flex items-center gap-2 flex-wrap text-xs pt-1 border-t border-gray-100">
          <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-[#EAB308]" />
            Quick Strategic Locations:
          </span>
          {POPULAR_LOCATION_PRESETS.map((preset, i) => (
            <button
              key={preset.title}
              type="button"
              onClick={() => handleSelectPreset(preset)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                selectedVillageName === preset.village && selectedDistrict === preset.district
                  ? 'bg-[#0B3520] text-white border-[#0B3520] font-bold shadow-xs'
                  : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-emerald-50 hover:border-emerald-300'
              }`}
            >
              {preset.title}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Main Two-Column Layout: Form Selection (Left) + Interactive Map & Selected Summary (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 Cols): Administrative Hierarchy Selection Form */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white rounded-2xl border border-gray-200/80 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#0B3520] text-white flex items-center justify-center">
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h2 className="text-sm font-extrabold text-gray-900">
                    Administrative Hierarchy
                  </h2>
                  <p className="text-[11px] text-gray-500">
                    Select State, District, Mandal &amp; Village
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                LGD Synced
              </span>
            </div>

            {/* Field 1: State */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 flex items-center justify-between">
                <span>1. State / Union Territory</span>
                <span className="text-[10px] text-gray-400 font-mono">LGD: {currentStateRecord.lgdCode}</span>
              </label>
              <select
                id="state-select-dropdown"
                value={selectedState}
                onChange={(e) => handleStateChange(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 focus:border-[#0B3520] focus:bg-white rounded-xl text-xs sm:text-sm font-semibold text-gray-900 focus:outline-none transition-all cursor-pointer"
              >
                {INDIAN_GEOGRAPHIC_DATA.states.map((st) => (
                  <option key={st.name} value={st.name}>
                    {st.name} ({st.code})
                  </option>
                ))}
              </select>
            </div>

            {/* Field 2: District */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 flex items-center justify-between">
                <span>2. District</span>
                <span className="text-[10px] text-gray-400 font-mono">LGD: {currentDistrictRecord.lgdCode}</span>
              </label>
              <select
                id="district-select-dropdown"
                value={selectedDistrict}
                onChange={(e) => handleDistrictChange(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 focus:border-[#0B3520] focus:bg-white rounded-xl text-xs sm:text-sm font-semibold text-gray-900 focus:outline-none transition-all cursor-pointer"
              >
                {availableDistricts.map((dst) => (
                  <option key={dst.name} value={dst.name}>
                    {dst.name} (HQ: {dst.headquarters})
                  </option>
                ))}
              </select>
            </div>

            {/* Field 3: Mandal / Taluk / Tahsil */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 flex items-center justify-between">
                <span>3. Mandal / Taluk / Tahsil</span>
                <span className="text-[10px] text-gray-400 font-mono">LGD: {currentMandalRecord.lgdCode}</span>
              </label>
              <select
                id="mandal-select-dropdown"
                value={selectedMandal}
                onChange={(e) => handleMandalChange(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 focus:border-[#0B3520] focus:bg-white rounded-xl text-xs sm:text-sm font-semibold text-gray-900 focus:outline-none transition-all cursor-pointer"
              >
                {availableMandals.map((mnd) => (
                  <option key={mnd.name} value={mnd.name}>
                    {mnd.name} Mandal (Sub-district)
                  </option>
                ))}
              </select>
            </div>

            {/* Field 4: Village / Revenue Village */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 flex items-center justify-between">
                <span>4. Village / Revenue Village</span>
                <span className="text-[10px] text-gray-400 font-mono">LGD: {currentVillageRecord.lgdCode}</span>
              </label>
              <select
                id="village-select-dropdown"
                value={selectedVillageName}
                onChange={(e) => handleVillageChange(e.target.value)}
                disabled={!selectedMandal || villageOptions.length === 0}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 focus:border-[#0B3520] focus:bg-white rounded-xl text-xs sm:text-sm font-semibold text-gray-900 focus:outline-none transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
              >
                {villageOptions.length === 0 && <option value="">Select a Mandal first</option>}
                {villageOptions.map((vil) => (
                  <option key={vil.name} value={vil.name}>
                    {vil.name} (PIN: {vil.pincode})
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-gray-400">Showing villages listed under {selectedMandal || 'the selected Mandal'}.</p>
            </div>

            {/* Field 5: Project Location / Landmark / Alignment */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 flex items-center justify-between">
                <span>5. Project Specific Alignment / Landmark</span>
                <span className="text-[10px] text-gray-400">Section / Chainage</span>
              </label>
              <input
                type="text"
                id="project-alignment-input"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                aria-describedby="manual-location-help"
                placeholder="e.g. Amaravati Seed Access Road Alignment - Sector 4"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 focus:border-[#0B3520] focus:bg-white rounded-xl text-xs sm:text-sm text-gray-900 focus:outline-none transition-all"
              />
            </div>

              <p id="manual-location-help" className={`text-[10px] ${manualLocationMessage.includes('updated') ? 'text-emerald-700' : 'text-gray-400'}`}>
                {manualLocationMessage || 'Matching village or Mandal names update the coordinates automatically.'}
              </p>

            {/* Optional postal lookup */}
            <div className="space-y-1.5">
              <label htmlFor="location-pincode" className="text-xs font-bold text-gray-700 flex items-center justify-between">
                <span>6. Pincode / Postal Code <span className="font-normal text-gray-400">(Optional)</span></span>
                <span className="text-[10px] text-gray-400">6 digits</span>
              </label>
              <input
                id="location-pincode"
                inputMode="numeric"
                maxLength={6}
                value={pincodeInput}
                onChange={(e) => handlePincodeChange(e.target.value)}
                placeholder="e.g. 522503"
                className="w-full px-3 py-2 bg-gray-50 border border-gray-300 focus:border-[#0B3520] focus:bg-white rounded-xl text-xs sm:text-sm font-semibold text-gray-900 focus:outline-none transition-all"
              />
              <p className={`text-[10px] ${pincodeMessage.startsWith('Suggested') ? 'text-emerald-700' : 'text-gray-400'}`}>
                {pincodeMessage || 'Enter a pincode to suggest a matching village, or leave it blank.'}
              </p>
            </div>

            {/* Field 6: Precise Coordinates & Elevation Grid */}
            <div className="p-3.5 bg-[#F8FAF9] rounded-xl border border-emerald-100 space-y-3">
              <div className="text-xs font-bold text-[#0B3520] flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Crosshair className="w-3.5 h-3.5 text-[#EAB308]" />
                  <span>Geodetic Coordinates (WGS-84)</span>
                </span>
                <button
                  type="button"
                  onClick={handleCopyCoords}
                  className="text-[10px] font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 cursor-pointer"
                >
                  {copiedCoords ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedCoords ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-[10px] text-gray-500 font-medium">Latitude (°N)</label>
                  <input
                    type="number"
                    step="0.00001"
                    value={lat}
                    onChange={(e) => setLat(parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg font-mono font-bold text-gray-900 text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 font-medium">Longitude (°E)</label>
                  <input
                    type="number"
                    step="0.00001"
                    value={lng}
                    onChange={(e) => setLng(parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 bg-white border border-gray-300 rounded-lg font-mono font-bold text-gray-900 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1 border-t border-gray-200/60 text-[11px]">
                <div className="bg-white p-2 rounded-lg border border-gray-200">
                  <div className="text-gray-400 text-[9px] uppercase font-bold">Elevation</div>
                  <div className="font-bold text-gray-900 font-mono">{elevation} m MSL</div>
                </div>
                <div className="bg-white p-2 rounded-lg border border-gray-200">
                  <div className="text-gray-400 text-[9px] uppercase font-bold">UTM Zone</div>
                  <div className="font-bold text-gray-900 font-mono">44N</div>
                </div>
                <div className="bg-white p-2 rounded-lg border border-gray-200">
                  <div className="text-gray-400 text-[9px] uppercase font-bold">Toposheet</div>
                  <div className="font-bold text-gray-900 font-mono truncate" title={currentVillageRecord.toposheetNo}>
                    {currentVillageRecord.toposheetNo}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Statutory Revenue Jurisdiction Card */}
          <div className="bg-white rounded-2xl border border-gray-200/80 p-4 shadow-2xs space-y-3 text-xs">
            <div className="font-bold text-gray-900 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-emerald-700" />
              <span>Revenue Administration &amp; Land Records Authority</span>
            </div>
            <div className="space-y-2 text-gray-600">
              <div className="flex items-center justify-between border-b border-gray-100 pb-1.5">
                <span className="text-gray-500">Revenue Division:</span>
                <span className="font-semibold text-gray-900">{currentVillageRecord.revenueDivision}</span>
              </div>
              <div className="flex items-center justify-between border-b border-gray-100 pb-1.5">
                <span className="text-gray-500">Sub-Registrar Office (SRO):</span>
                <span className="font-semibold text-gray-900">{currentVillageRecord.subRegistrarOffice}</span>
              </div>
              <div className="flex items-center justify-between border-b border-gray-100 pb-1.5">
                <span className="text-gray-500">Survey Authority:</span>
                <span className="font-semibold text-gray-900 text-right text-[11px]">
                  {currentVillageRecord.surveyAuthority}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Cadastral Sheets / Parcels:</span>
                <span className="font-mono font-bold text-emerald-800">
                  {currentVillageRecord.cadastralSheetsCount} sheets • ~{currentVillageRecord.totalSurveyParcels} survey parcels
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (7 Cols): Interactive Map Preview & Selected Location Summary */}
        <div className="lg:col-span-7 space-y-5">
          {/* Interactive Map Preview Card */}
          <div
            className={`bg-white rounded-2xl border border-gray-200/80 shadow-2xs overflow-hidden transition-all ${
              isMapFullscreen ? 'fixed inset-4 z-50 shadow-2xl flex flex-col' : 'relative'
            }`}
          >
            {/* Map Top Toolbar */}
            <div className="p-3.5 bg-[#F8FAF9] border-b border-gray-200 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#0B3520] text-white flex items-center justify-center">
                  <MapIcon className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-extrabold text-gray-900">
                    Geographic Context Map Preview
                  </h3>
                  <p className="text-[10px] text-gray-500">
                    Click anywhere on the map to pin-point &amp; update center coordinates
                  </p>
                </div>
              </div>

              {/* Layer Controls + Fullscreen */}
              <div className="flex items-center gap-2">
                {/* Base Layer Switcher */}
                <div className="inline-flex rounded-lg bg-gray-200/80 p-0.5 text-[11px] font-semibold text-gray-700">
                  <button
                    type="button"
                    onClick={() => setMapLayer('carto')}
                    className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                      mapLayer === 'carto'
                        ? 'bg-white text-[#0B3520] font-bold shadow-xs'
                        : 'hover:text-gray-900'
                    }`}
                  >
                    Roads
                  </button>
                  <button
                    type="button"
                    onClick={() => setMapLayer('satellite')}
                    className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                      mapLayer === 'satellite'
                        ? 'bg-[#0B3520] text-white font-bold shadow-xs'
                        : 'hover:text-gray-900'
                    }`}
                  >
                    Satellite
                  </button>
                  <button
                    type="button"
                    onClick={() => setMapLayer('terrain')}
                    className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                      mapLayer === 'terrain'
                        ? 'bg-white text-[#0B3520] font-bold shadow-xs'
                        : 'hover:text-gray-900'
                    }`}
                  >
                    Terrain
                  </button>
                  <button
                    type="button"
                    onClick={() => setMapLayer('bhuvan')}
                    className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                      mapLayer === 'bhuvan'
                        ? 'bg-emerald-800 text-white font-bold shadow-xs'
                        : 'hover:text-gray-900'
                    }`}
                  >
                    Bhuvan
                  </button>
                </div>

                {/* Fullscreen Button */}
                <button
                  type="button"
                  onClick={() => setIsMapFullscreen(!isMapFullscreen)}
                  className="p-1.5 rounded-lg border border-gray-300 bg-white hover:bg-gray-100 text-gray-700 cursor-pointer"
                  title={isMapFullscreen ? 'Exit Fullscreen' : 'Fullscreen Map'}
                >
                  {isMapFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Interactive SVG Canvas Viewport */}
            <div
              ref={mapContainerRef}
              className={`relative bg-[#0F2018] overflow-hidden select-none cursor-crosshair ${
                isMapFullscreen ? 'flex-1 min-h-[500px]' : 'h-[380px] sm:h-[420px]'
              }`}
            >
              {/* SVG Map Graphics Rendering */}
              <svg
                className="w-full h-full"
                viewBox="0 0 600 400"
                onClick={handleMapClick}
                onMouseMove={handleMapMouseMove}
              >
                <defs>
                  {/* Pattern for Cadastral Grid */}
                  <pattern id="cadastralGrid" width="30" height="30" patternUnits="userSpaceOnUse">
                    <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="0.75" />
                  </pattern>

                  {/* Satellite terrain gradient */}
                  <radialGradient id="satGlow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#1E3E2B" stopOpacity="1" />
                    <stop offset="60%" stopColor="#132B1E" stopOpacity="1" />
                    <stop offset="100%" stopColor="#0B1A12" stopOpacity="1" />
                  </radialGradient>

                  {/* River waterway gradient */}
                  <linearGradient id="riverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#0284C7" stopOpacity="0.8" />
                    <stop offset="50%" stopColor="#0EA5E9" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.8" />
                  </linearGradient>

                  {/* Pin Drop Shadow */}
                  <filter id="pinShadow" x="-20%" y="-20%" width="140%" height="140%">
                    <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#000000" floodOpacity="0.6" />
                  </filter>
                </defs>

                {/* Base Layer Canvas */}
                <rect width="600" height="400" fill="url(#satGlow)" />
                <rect width="600" height="400" fill="url(#cadastralGrid)" />

                {/* Acquisition intensity layer: helps edit the required area visually. */}
                {showHeatmap && (
                  <g opacity="0.78" pointerEvents="none">
                    <circle cx="245" cy="190" r="82" fill="#EF4444" opacity="0.18" />
                    <circle cx="245" cy="190" r="55" fill="#F59E0B" opacity="0.26" />
                    <circle cx="245" cy="190" r="28" fill="#EAB308" opacity="0.36" />
                    <circle cx="410" cy="158" r="66" fill="#F59E0B" opacity="0.2" />
                    <circle cx="410" cy="158" r="34" fill="#EAB308" opacity="0.3" />
                    <text x="16" y="52" fill="#FDE68A" fontSize="9" fontWeight="700" letterSpacing="1">HIGHER ACQUISITION IMPACT</text>
                  </g>
                )}

                {/* Topographic Contours / Terrain if enabled */}
                {(mapLayer === 'terrain' || mapLayer === 'bhuvan') && (
                  <g opacity="0.25">
                    <path d="M 0,80 Q 150,120 300,70 T 600,110" fill="none" stroke="#EAB308" strokeWidth="1" strokeDasharray="4 2" />
                    <path d="M 0,160 Q 200,210 400,150 T 600,190" fill="none" stroke="#EAB308" strokeWidth="1" strokeDasharray="4 2" />
                    <path d="M 0,260 Q 220,300 450,240 T 600,280" fill="none" stroke="#EAB308" strokeWidth="1" strokeDasharray="4 2" />
                  </g>
                )}

                {/* Krishna River Waterway (Amaravati / Andhra Pradesh geographic realism) */}
                {showRiverOverlay && (
                  <g>
                    <path
                      d="M -20,120 C 140,80 220,160 380,110 C 480,80 540,140 620,100 L 620,145 C 540,185 480,125 380,155 C 220,205 140,125 -20,165 Z"
                      fill="url(#riverGrad)"
                      opacity="0.75"
                    />
                    <text x="210" y="145" fill="#E0F2FE" fontSize="10" fontStyle="italic" fontWeight="600" letterSpacing="2">
                      KRISHNA RIVER WATERWAY
                    </text>
                  </g>
                )}

                {/* Administrative Boundaries (Mandal & Village Polygons) */}
                {showBoundaries && (
                  <g stroke="#10B981" strokeWidth="1.5" fill="none" opacity="0.65">
                    {/* Amaravati Mandal Polygon */}
                    <polygon points="120,40 260,30 310,130 180,180 90,120" stroke="#34D399" strokeDasharray="5 3" />
                    {/* Thullur Mandal Polygon */}
                    <polygon points="260,30 450,20 520,160 380,210 310,130" stroke="#EAB308" strokeWidth="2" fill="rgba(234, 179, 8, 0.04)" />
                    {/* Mangalagiri Mandal Polygon */}
                    <polygon points="380,210 520,160 580,290 420,340" stroke="#38BDF8" strokeDasharray="5 3" />
                    {/* Tadepalle Mandal Polygon */}
                    <polygon points="420,340 580,290 590,390 390,390" stroke="#A78BFA" strokeDasharray="5 3" />
                  </g>
                )}

                {/* User-defined positions for roads, facilities, or acquisition points. */}
                {requiredPositions.map((position, index) => (
                  <g key={`${position.x}-${position.y}-${index}`} transform={`translate(${position.x}, ${position.y})`} pointerEvents="none">
                    <circle r="9" fill="#EAB308" opacity="0.3" />
                    <circle r="4" fill="#EAB308" stroke="#0B3520" strokeWidth="1.5" />
                    <text x="8" y="4" fill="#FEF3C7" fontSize="9" fontWeight="700">Required {index + 1}</text>
                  </g>
                ))}

                {/* Major Road Arteries / Highway Corridor */}
                <g stroke="#94A3B8" strokeWidth="2" fill="none" opacity="0.8">
                  {/* Seed Access Road / Highway 16 */}
                  <path d="M 40,320 L 220,240 L 300,200 L 460,140 L 580,60" stroke="#E2E8F0" strokeWidth="3" />
                  {/* Outer Ring Road alignment */}
                  <path d="M 80,390 C 200,280 400,280 540,380" stroke="#F59E0B" strokeWidth="2.5" strokeDasharray="6 3" />
                </g>

                {/* Infrastructure Corridor Buffer Preview (500m RoW) */}
                {showCorridorBuffer && (
                  <g>
                    <path
                      d="M 40,320 L 220,240 L 300,200 L 460,140 L 580,60"
                      stroke="#EAB308"
                      strokeWidth="24"
                      strokeOpacity="0.2"
                      fill="none"
                      strokeLinecap="round"
                    />
                    <path
                      d="M 40,320 L 220,240 L 300,200 L 460,140 L 580,60"
                      stroke="#EF4444"
                      strokeWidth="1.2"
                      strokeDasharray="4 2"
                      fill="none"
                    />
                  </g>
                )}

                {/* Village / Landmark Nodes */}
                <g>
                  {/* Velagapudi Node */}
                  <circle cx="390" cy="180" r="4" fill="#34D399" />
                  <text x="398" y="184" fill="#D1FAE5" fontSize="10" fontWeight="bold">
                    Velagapudi (Secretariat)
                  </text>

                  {/* Mandadam Node */}
                  <circle cx="450" cy="160" r="4" fill="#34D399" />
                  <text x="458" y="164" fill="#D1FAE5" fontSize="10" fontWeight="bold">
                    Mandadam
                  </text>

                  {/* Tulluru Node */}
                  <circle cx="240" cy="190" r="4" fill="#34D399" />
                  <text x="248" y="194" fill="#D1FAE5" fontSize="10" fontWeight="bold">
                    Tulluru
                  </text>

                  {/* Rayapudi Node */}
                  <circle cx="360" cy="120" r="4" fill="#34D399" />
                  <text x="368" y="124" fill="#D1FAE5" fontSize="10" fontWeight="bold">
                    Rayapudi
                  </text>
                </g>

                {/* Center Pin Radar Pulse */}
                <circle cx="300" cy="200" r="28" fill="none" stroke="#EAB308" strokeWidth="1.5" opacity="0.6">
                  <animate attributeName="r" values="10;45" dur="2.2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="0.8;0" dur="2.2s" repeatCount="indefinite" />
                </circle>

                <circle cx="300" cy="200" r="60" fill="none" stroke="#10B981" strokeWidth="1" strokeDasharray="4 4" opacity="0.4" />

                {/* 5km Radius Context Range Ring */}
                <circle cx="300" cy="200" r="110" fill="none" stroke="#38BDF8" strokeWidth="1" strokeDasharray="3 3" opacity="0.35" />
                <text x="305" y="320" fill="#93C5FD" fontSize="8" fontStyle="italic">
                  5 km Geographic Acquisition Radius
                </text>

                {/* Center Primary Location Pin */}
                <g transform="translate(300, 200)" filter="url(#pinShadow)">
                  {/* Pin Point Marker */}
                  <path
                    d="M 0,0 C -8,-12 -12,-20 -12,-28 C -12,-36 -6,-42 0,-42 C 6,-42 12,-36 12,-28 C 12,-20 8,-12 0,0 Z"
                    fill="#EAB308"
                    stroke="#0B3520"
                    strokeWidth="2"
                  />
                  <circle cx="0" cy="-28" r="5" fill="#0B3520" />
                  <circle cx="0" cy="-28" r="2.5" fill="#FFFFFF" />
                </g>

                {/* Selected Village Label Tag Bubble */}
                <g transform="translate(300, 150)">
                  <rect x="-70" y="-22" width="140" height="22" rx="6" fill="#0B3520" stroke="#EAB308" strokeWidth="1.5" />
                  <text x="0" y="-8" fill="#FFFFFF" fontSize="10" fontWeight="bold" textAnchor="middle">
                    📍 {selectedVillageName || 'Selected Location'}
                  </text>
                </g>

                {/* Toposheet Grid overlay markings */}
                {showToposheetGrid && (
                  <g fill="#94A3B8" fontSize="8" fontFamily="monospace" opacity="0.6">
                    <text x="10" y="20">16°35'N</text>
                    <text x="10" y="200">16°31'N</text>
                    <text x="10" y="380">16°27'N</text>
                    <text x="100" y="390">80°28'E</text>
                    <text x="300" y="390">80°31'E (SOI 65D/10)</text>
                    <text x="500" y="390">80°35'E</text>
                  </g>
                )}
              </svg>

              {/* In-Map Controls Floating Overlay (Top Right) */}
              <div className="absolute top-3 right-3 flex flex-col gap-1.5 z-10">
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.min(z + 2, 22))}
                  className="w-8 h-8 rounded-lg bg-[#0B3520]/90 hover:bg-[#0B3520] text-white border border-[#EAB308]/60 flex items-center justify-center shadow-md cursor-pointer"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.max(z - 2, 8))}
                  className="w-8 h-8 rounded-lg bg-[#0B3520]/90 hover:bg-[#0B3520] text-white border border-[#EAB308]/60 flex items-center justify-center shadow-md cursor-pointer"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLat(16.5131);
                    setLng(80.5165);
                    setZoomLevel(14);
                    showToast('Map view reset to administrative centroid');
                  }}
                  className="w-8 h-8 rounded-lg bg-[#0B3520]/90 hover:bg-[#0B3520] text-white border border-[#EAB308]/60 flex items-center justify-center shadow-md cursor-pointer"
                  title="Reset Extent"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              {/* In-Map Layer Toggles Floating Overlay (Top Left) */}
              <div className="absolute top-3 left-3 bg-[#0B3520]/90 backdrop-blur-xs border border-[#EAB308]/50 rounded-xl p-2 text-white text-[10px] space-y-1.5 z-10 shadow-lg hidden sm:block">
                <div className="font-bold text-[#EAB308] uppercase tracking-wider text-[9px] pb-1 border-b border-white/10">
                  Spatial Layers
                </div>
                <label className="flex items-center gap-1.5 cursor-pointer hover:text-emerald-200">
                  <input
                    type="checkbox"
                    checked={showBoundaries}
                    onChange={(e) => setShowBoundaries(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-0 cursor-pointer"
                  />
                  <span>Mandal Boundaries</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer hover:text-emerald-200">
                  <input
                    type="checkbox"
                    checked={showCorridorBuffer}
                    onChange={(e) => setShowCorridorBuffer(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-0 cursor-pointer"
                  />
                  <span>RoW Corridor Buffer</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer hover:text-emerald-200">
                  <input
                    type="checkbox"
                    checked={showRiverOverlay}
                    onChange={(e) => setShowRiverOverlay(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-0 cursor-pointer"
                  />
                  <span>Waterway Alignment</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer hover:text-emerald-200">
                  <input
                    type="checkbox"
                    checked={showHeatmap}
                    onChange={(e) => setShowHeatmap(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-0 cursor-pointer"
                  />
                  <span>Acquisition Heatmap</span>
                </label>
                <button
                  type="button"
                  onClick={() => setIsEditingRequiredPositions((active) => !active)}
                  className={`w-full mt-1 px-2 py-1.5 rounded-lg text-left font-bold border ${isEditingRequiredPositions ? 'bg-[#EAB308] text-[#0B3520] border-[#EAB308]' : 'bg-white/10 text-white border-white/20'}`}
                >
                  {isEditingRequiredPositions ? '✓ Editing required positions' : '+ Edit required positions'}
                </button>
                {requiredPositions.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setRequiredPositions([])}
                    className="w-full text-left text-red-200 hover:text-white pt-0.5"
                  >
                    Clear {requiredPositions.length} position{requiredPositions.length === 1 ? '' : 's'}
                  </button>
                )}
              </div>

              {/* In-Map Bottom Coordinates HUD */}
              <div className="absolute bottom-2 left-2 right-2 bg-black/70 backdrop-blur-xs text-white px-3 py-1.5 rounded-lg text-[10px] font-mono flex items-center justify-between z-10 border border-white/10">
                <div className="flex items-center gap-3">
                  <span>
                    Pin: <strong className="text-[#EAB308]">{lat.toFixed(5)}° N, {lng.toFixed(5)}° E</strong>
                  </span>
                  {hoverCoords && (
                    <span className="hidden md:inline text-gray-400">
                      Cursor: {hoverCoords.lat.toFixed(4)}° N, {hoverCoords.lng.toFixed(4)}° E
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-emerald-300">Zoom: {zoomLevel}x</span>
                  <span className="text-gray-400">Datum: WGS 84 / UTM 44N</span>
                  <span className="hidden sm:inline text-gray-400">Tile: ISRO Bhuvan / DoLR Node</span>
                </div>
              </div>
            </div>
          </div>

          {/* Current Selected Location Summary Card (Dossier Panel) */}
          <div className="bg-white rounded-2xl border-2 border-[#0B3520] p-5 shadow-md space-y-4">
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-gray-100">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Finalized Geographic Context</span>
                </div>
                <h3 className="text-base sm:text-lg font-extrabold text-gray-900">
                  {selectedVillageName}, {selectedMandal} Mandal
                </h3>
                <p className="text-xs text-gray-500">
                  {selectedDistrict} District, {selectedState} (PIN: {currentVillageRecord.pincode})
                </p>
              </div>

              {/* LGD Verified Badge */}
              <div className="text-right">
                <span className="text-[10px] font-bold text-gray-500 uppercase block">Village LGD Code</span>
                <span className="text-sm font-mono font-extrabold text-[#0B3520] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 inline-block">
                  {currentVillageRecord.lgdCode}
                </span>
              </div>
            </div>

            {/* Structured Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-200">
                <div className="text-[10px] text-gray-400 font-bold uppercase">State</div>
                <div className="font-bold text-gray-900 truncate">{selectedState}</div>
                <div className="text-[9px] text-gray-500 font-mono">Code: {currentStateRecord.code} (LGD: {currentStateRecord.lgdCode})</div>
              </div>

              <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-200">
                <div className="text-[10px] text-gray-400 font-bold uppercase">District</div>
                <div className="font-bold text-gray-900 truncate">{selectedDistrict}</div>
                <div className="text-[9px] text-gray-500 font-mono">LGD: {currentDistrictRecord.lgdCode}</div>
              </div>

              <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-200">
                <div className="text-[10px] text-gray-400 font-bold uppercase">Mandal / Taluk</div>
                <div className="font-bold text-gray-900 truncate">{selectedMandal}</div>
                <div className="text-[9px] text-gray-500 font-mono">LGD: {currentMandalRecord.lgdCode}</div>
              </div>

              <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-200">
                <div className="text-[10px] text-gray-400 font-bold uppercase">Village</div>
                <div className="font-bold text-gray-900 truncate">{selectedVillageName}</div>
                <div className="text-[9px] text-gray-500 font-mono">LGD: {currentVillageRecord.lgdCode}</div>
              </div>
            </div>

            {/* Alignment Scope */}
            <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200 text-xs flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-emerald-900 uppercase">Target Project Alignment:</span>
                <div className="font-bold text-[#0B3520]">{locationName}</div>
              </div>
              <div className="font-mono text-emerald-800 font-bold text-right text-[11px]">
                {lat.toFixed(4)}° N, {lng.toFixed(4)}° E
              </div>
            </div>

            {/* Primary Call to Action Button: Continue to GIS */}
            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                id="main-continue-to-gis-btn"
                onClick={handleContinueToGis}
                className="w-full sm:flex-1 py-3.5 px-6 rounded-xl bg-[#0B3520] hover:bg-[#06452F] text-white font-extrabold text-sm tracking-wide shadow-lg flex items-center justify-center gap-2.5 border border-[#EAB308] transition-all hover:scale-[1.01] cursor-pointer"
              >
                <span>Continue to GIS Boundary Mapping</span>
                <ArrowRight className="w-4 h-4 text-[#EAB308]" />
              </button>

              <button
                type="button"
                onClick={() => {
                  showToast('Geographic context configuration saved to project registry.');
                }}
                className="w-full sm:w-auto px-4 py-3.5 rounded-xl bg-white hover:bg-gray-50 border border-gray-300 font-bold text-xs text-gray-700 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Bookmark className="w-3.5 h-3.5 text-gray-500" />
                <span>Save Context</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
