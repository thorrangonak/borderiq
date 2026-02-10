"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { geoNaturalEarth1, geoPath, type GeoPermissibleObjects } from "d3-geo";
import { feature } from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";
import type { FeatureCollection, Feature, Geometry } from "geojson";
import { COUNTRIES } from "@/lib/countries";
import { ISO_NUMERIC_TO_ALPHA3 } from "@/lib/iso-numeric";
import Image from "next/image";
import { Search, X, MapPin, RotateCcw, Info } from "lucide-react";

const GEO_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

type VisaCategory = "visa-free" | "voa" | "eta" | "e-visa" | "visa-required" | "no-admission" | "home";

const VISA_COLORS: Record<VisaCategory | "default", string> = {
  "visa-free": "#10b981",
  voa: "#14b8a6",
  eta: "#3b82f6",
  "e-visa": "#f59e0b",
  "visa-required": "#ef4444",
  "no-admission": "#6b7280",
  home: "#8b5cf6",
  default: "#1e293b",
};

const VISA_LABELS: Record<VisaCategory, string> = {
  "visa-free": "Visa Free",
  voa: "Visa on Arrival",
  eta: "ETA",
  "e-visa": "e-Visa",
  "visa-required": "Visa Required",
  "no-admission": "No Admission",
  home: "Home Country",
};

interface MapData {
  [iso3: string]: { requirement: VisaCategory; code: string };
}

interface CountryFeature extends Feature<Geometry> {
  id: string;
  properties: { name: string };
}

const countryList = Object.entries(COUNTRIES)
  .map(([name, meta]) => ({ name, code: meta.code, code3: meta.code3 }))
  .sort((a, b) => a.name.localeCompare(b.name));

export default function WorldMap() {
  const [selectedCountry, setSelectedCountry] = useState("");
  const [mapData, setMapData] = useState<MapData>({});
  const [loading, setLoading] = useState(false);
  const [geoData, setGeoData] = useState<CountryFeature[] | null>(null);
  const [hoveredCountry, setHoveredCountry] = useState<{ name: string; req: string; x: number; y: number } | null>(null);
  const [search, setSearch] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Load geo data once
  useEffect(() => {
    fetch(GEO_URL)
      .then((res) => res.json())
      .then((topology: Topology) => {
        const countriesGeo = feature(
          topology,
          topology.objects.countries as GeometryCollection
        ) as FeatureCollection;
        setGeoData(countriesGeo.features as CountryFeature[]);
      })
      .catch(() => {});
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredCountries = useMemo(() => {
    if (!search) return countryList;
    const q = search.toLowerCase();
    return countryList.filter(
      (c) => c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)
    );
  }, [search]);

  const handleCountrySelect = useCallback(async (countryName: string) => {
    setSelectedCountry(countryName);
    setSearch("");
    setDropdownOpen(false);

    if (!countryName) {
      setMapData({});
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/visa-map?country=${encodeURIComponent(countryName)}`);
      if (res.ok) {
        setMapData(await res.json());
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, []);

  const handleReset = () => {
    setSelectedCountry("");
    setMapData({});
    setSearch("");
  };

  const stats = useMemo(() => {
    if (!Object.keys(mapData).length) return null;
    const counts: Record<string, number> = {};
    for (const val of Object.values(mapData)) {
      if (val.requirement === "home") continue;
      counts[val.requirement] = (counts[val.requirement] || 0) + 1;
    }
    return counts;
  }, [mapData]);

  const getVisaStatus = useCallback(
    (geoId: string): VisaCategory | null => {
      if (!Object.keys(mapData).length) return null;
      const alpha3 = ISO_NUMERIC_TO_ALPHA3[geoId];
      if (alpha3 && mapData[alpha3]) return mapData[alpha3].requirement as VisaCategory;
      return null;
    },
    [mapData]
  );

  // Projection & path generator
  const width = 960;
  const height = 500;
  const projection = useMemo(
    () => geoNaturalEarth1().scale(160).translate([width / 2, height / 2]),
    []
  );
  const pathGenerator = useMemo(() => geoPath().projection(projection), [projection]);

  return (
    <div className="w-full">
      {/* Country Selector */}
      <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="relative flex-1 w-full sm:max-w-md" ref={dropdownRef}>
          <div
            className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-3 cursor-text hover:border-teal-500/50 transition-colors"
            onClick={() => setDropdownOpen(true)}
          >
            <Search size={18} className="text-gray-400 shrink-0" />
            {selectedCountry && !dropdownOpen ? (
              <div className="flex items-center gap-2 flex-1">
                <Image
                  src={`https://flagcdn.com/w40/${COUNTRIES[selectedCountry]?.code.toLowerCase()}.png`}
                  alt=""
                  width={24}
                  height={16}
                  className="rounded-sm"
                />
                <span className="text-white">{selectedCountry}</span>
              </div>
            ) : (
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setDropdownOpen(true); }}
                onFocus={() => setDropdownOpen(true)}
                placeholder="Select your passport country..."
                className="flex-1 bg-transparent text-white placeholder-gray-500 outline-none"
              />
            )}
            {selectedCountry && (
              <button onClick={(e) => { e.stopPropagation(); handleReset(); }} className="text-gray-400 hover:text-white">
                <X size={16} />
              </button>
            )}
          </div>

          {dropdownOpen && (
            <div className="absolute z-50 top-full mt-2 w-full bg-slate-800 border border-white/10 rounded-xl shadow-2xl max-h-72 overflow-y-auto">
              {filteredCountries.map((c) => (
                <button
                  key={c.code}
                  onClick={() => handleCountrySelect(c.name)}
                  className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 transition-colors text-left ${
                    selectedCountry === c.name ? "bg-teal-500/20 text-teal-400" : "text-white"
                  }`}
                >
                  <Image src={`https://flagcdn.com/w40/${c.code.toLowerCase()}.png`} alt="" width={24} height={16} className="rounded-sm shrink-0" />
                  <span className="truncate">{c.name}</span>
                  <span className="text-gray-500 text-xs ml-auto">{c.code}</span>
                </button>
              ))}
              {filteredCountries.length === 0 && (
                <div className="px-4 py-6 text-gray-500 text-center text-sm">No countries found</div>
              )}
            </div>
          )}
        </div>

        {selectedCountry && (
          <button onClick={handleReset} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
            <RotateCcw size={14} /> Reset
          </button>
        )}
      </div>

      {/* Legend */}
      {selectedCountry && (
        <div className="mb-4 flex flex-wrap gap-x-3 sm:gap-x-4 gap-y-2 overflow-x-auto">
          {(Object.entries(VISA_COLORS) as [VisaCategory | "default", string][])
            .filter(([key]) => key !== "default")
            .map(([key, color]) => (
              <div key={key} className="flex items-center gap-1.5 text-xs text-gray-300">
                <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: color }} />
                <span>{VISA_LABELS[key as VisaCategory]}</span>
                {stats && stats[key] !== undefined && (
                  <span className="text-gray-500">({stats[key]})</span>
                )}
              </div>
            ))}
        </div>
      )}

      {/* Map */}
      <div className="relative w-full bg-slate-900/50 rounded-xl sm:rounded-2xl border border-white/10 overflow-hidden">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm">
            <div className="flex items-center gap-3 text-teal-400">
              <div className="w-5 h-5 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
              Loading visa data...
            </div>
          </div>
        )}

        {!selectedCountry && !geoData && (
          <div className="absolute inset-0 z-10 flex items-center justify-center">
            <div className="flex items-center gap-3 text-gray-500">
              <div className="w-5 h-5 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" />
              Loading world map...
            </div>
          </div>
        )}

        {!selectedCountry && geoData && (
          <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
            <div className="flex flex-col items-center gap-2 text-gray-500 bg-slate-900/80 px-4 sm:px-6 py-3 sm:py-4 rounded-xl backdrop-blur-sm mx-4">
              <MapPin size={24} className="text-gray-500 sm:w-7 sm:h-7" />
              <p className="text-xs sm:text-sm text-center">Select a passport to see visa access on the map</p>
            </div>
          </div>
        )}

        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto"
          style={{ minHeight: "200px", touchAction: "manipulation" }}
        >
          {/* Ocean background */}
          <rect width={width} height={height} fill="#0f172a" />

          {/* Country paths */}
          {geoData?.map((geo) => {
            const visaStatus = getVisaStatus(geo.id);
            const fillColor = visaStatus ? VISA_COLORS[visaStatus] : VISA_COLORS.default;
            const d = pathGenerator(geo as GeoPermissibleObjects);
            if (!d) return null;

            return (
              <path
                key={geo.id}
                d={d}
                fill={fillColor}
                stroke="#0f172a"
                strokeWidth={0.5}
                className="transition-all duration-300 hover:brightness-125 hover:stroke-white cursor-pointer"
                onMouseEnter={(e) => {
                  const name = geo.properties?.name || "Unknown";
                  const req = visaStatus ? VISA_LABELS[visaStatus] : selectedCountry ? "No data" : "";
                  const rect = svgRef.current?.getBoundingClientRect();
                  if (rect) {
                    setHoveredCountry({ name, req, x: e.clientX - rect.left, y: e.clientY - rect.top });
                  }
                }}
                onMouseMove={(e) => {
                  const rect = svgRef.current?.getBoundingClientRect();
                  if (rect) {
                    setHoveredCountry((prev) => prev ? { ...prev, x: e.clientX - rect.left, y: e.clientY - rect.top } : null);
                  }
                }}
                onMouseLeave={() => setHoveredCountry(null)}
              />
            );
          })}
        </svg>

        {/* Tooltip */}
        {hoveredCountry && (
          <div
            className="absolute z-20 pointer-events-none bg-slate-800/95 border border-white/20 rounded-lg px-3 py-2 shadow-xl backdrop-blur-sm"
            style={{ left: hoveredCountry.x + 12, top: hoveredCountry.y - 40 }}
          >
            <p className="text-white text-sm font-medium">{hoveredCountry.name}</p>
            {hoveredCountry.req && (
              <p className="text-gray-400 text-xs mt-0.5">{hoveredCountry.req}</p>
            )}
          </div>
        )}
      </div>

      {/* Stats Summary */}
      {selectedCountry && stats && (
        <div className="mt-4 sm:mt-6 grid grid-cols-3 sm:grid-cols-3 md:grid-cols-6 gap-2 sm:gap-3">
          {([
            ["visa-free", "Visa Free", "#10b981"],
            ["voa", "VOA", "#14b8a6"],
            ["eta", "ETA", "#3b82f6"],
            ["e-visa", "e-Visa", "#f59e0b"],
            ["visa-required", "Visa Req.", "#ef4444"],
            ["no-admission", "No Admit.", "#6b7280"],
          ] as const).map(([key, label, color]) => (
            <div key={key} className="bg-white/5 border border-white/10 rounded-lg sm:rounded-xl p-2 sm:p-3 text-center">
              <div className="text-lg sm:text-2xl font-bold" style={{ color }}>{stats[key] || 0}</div>
              <div className="text-[10px] sm:text-xs text-gray-400 mt-0.5 sm:mt-1">{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Info */}
      {selectedCountry && (
        <div className="mt-4 flex items-start gap-2 text-xs text-gray-500">
          <Info size={14} className="shrink-0 mt-0.5" />
          <p>Data based on latest visa policies. Some small territories may not be shown separately.</p>
        </div>
      )}
    </div>
  );
}
