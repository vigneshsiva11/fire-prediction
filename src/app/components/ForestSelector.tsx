import { useMemo, useState } from 'react';
import { ChevronDown, Search } from 'lucide-react';

interface Forest {
  id: string;
  name: string;
  country: string;
  biome: string;
  priority: string;
}

interface ForestSelectorProps {
  forests: Forest[];
  activeForest: Forest;
  onSelect: (forest: Forest) => void;
}

export function ForestSelector({ forests, activeForest, onSelect }: ForestSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');

  const filteredForests = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return forests;
    }

    return forests.filter(
      (forest) =>
        forest.name.toLowerCase().includes(value) ||
        forest.country.toLowerCase().includes(value) ||
        forest.biome.toLowerCase().includes(value),
    );
  }, [forests, search]);

  return (
    <div className="relative w-[320px] mx-auto">
      <p className="mb-1 text-[11px] uppercase tracking-[0.18em] text-slate-400">
        Popular Forest Zones ({forests.length})
      </p>

      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex w-full items-center justify-between rounded-xl border border-slate-700/50 bg-slate-900 px-3 py-2 text-white hover:bg-slate-800"
      >
        <div className="text-left">
          <p className="font-semibold">{activeForest.name}</p>
          <p className="text-xs text-slate-400">{activeForest.country}</p>
        </div>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen ? (
        <div className="absolute z-50 mt-2 w-full rounded-xl border border-slate-700 bg-slate-900 p-2 shadow-2xl">
          <div className="mb-2 flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800 px-2 py-1.5">
            <Search className="h-3.5 w-3.5 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search forests"
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
            />
          </div>

          <div className="max-h-56 space-y-1 overflow-y-auto pr-1">
            {filteredForests.map((forest) => (
              <button
                type="button"
                key={forest.id}
                onClick={() => {
                  onSelect(forest);
                  setIsOpen(false);
                }}
                className="w-full rounded-lg border border-transparent px-3 py-2 text-left hover:bg-slate-800"
              >
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-white">{forest.name}</p>
                    <p className="text-xs text-slate-400">{forest.country}</p>
                  </div>
                  <span className="rounded-full border border-blue-400/50 px-2 py-0.5 text-[11px] text-blue-200">
                    {forest.biome}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
