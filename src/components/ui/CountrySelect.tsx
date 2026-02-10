"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import CountryFlag from "./CountryFlag";

interface Country {
  name: string;
  code: string;
}

interface CountrySelectProps {
  value: string;
  onChange: (value: string) => void;
  countries: Country[];
  placeholder?: string;
  exclude?: string[];
}

export default function CountrySelect({
  value,
  onChange,
  countries,
  placeholder = "Select a country...",
  exclude = [],
}: CountrySelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filteredCountries = countries.filter(
    (c) =>
      !exclude.includes(c.name) &&
      c.name.toLowerCase().includes(search.toLowerCase())
  );

  const selectedCountry = countries.find((c) => c.name === value);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        setSearch("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          setSearch("");
        }}
        className="w-full flex items-center gap-3 px-3 sm:px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-left hover:border-white/20 transition-colors duration-200 cursor-pointer"
      >
        {selectedCountry ? (
          <>
            <CountryFlag code={selectedCountry.code} size="sm" />
            <span className="text-white flex-1 truncate">
              {selectedCountry.name}
            </span>
          </>
        ) : (
          <span className="text-gray-500 flex-1">{placeholder}</span>
        )}
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-2 w-full rounded-xl bg-gray-900 border border-white/10 shadow-xl overflow-hidden">
          {/* Search input */}
          <div className="p-2 border-b border-white/10">
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search countries..."
              className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm outline-none focus:border-blue-500/50 transition-colors"
            />
          </div>

          {/* Options list */}
          <div className="max-h-60 overflow-y-auto overscroll-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
            {filteredCountries.length === 0 ? (
              <div className="px-4 py-3 text-gray-500 text-sm text-center">
                No countries found
              </div>
            ) : (
              filteredCountries.map((country) => (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => {
                    onChange(country.name);
                    setIsOpen(false);
                    setSearch("");
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/10 active:bg-white/15 transition-colors cursor-pointer ${
                    value === country.name
                      ? "bg-blue-500/10 text-blue-300"
                      : "text-white"
                  }`}
                >
                  <CountryFlag code={country.code} size="sm" />
                  <span className="truncate text-sm">{country.name}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
