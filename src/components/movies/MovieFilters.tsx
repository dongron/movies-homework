'use client';

import { useEffect, useRef, useState } from 'react';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';

import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { setGridFilter } from '@/lib/grid-params';
import { ANY, TYPE_LABELS, TYPE_OPTIONS, yearOptions } from '@/lib/movie-filters';
import type { MovieType } from '@/types/Movie';

const DEBOUNCE_MS = 500;
const years = yearOptions();

type MovieFiltersProps = {
  searchTerm: string;
  type?: MovieType;
  year?: number;
};

const MovieFilters = ({ searchTerm: initialSearch, type: initialType, year: initialYear }: MovieFiltersProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentType = searchParams.get('type') ?? (initialType ?? ANY);
  const currentYear = searchParams.get('y') ?? (initialYear ? String(initialYear) : ANY);
  const currentSearch = searchParams.get('s') ?? initialSearch;

  const [searchValue, setSearchValue] = useState(currentSearch);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setSearchValue(currentSearch);
  }, [currentSearch]);

  const updateFilter = (key: string, value: string | null) => {
    const next = setGridFilter(searchParams, key, value);
    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname);
  };

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      updateFilter('s', value.trim() || null);
    }, DEBOUNCE_MS);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div className='grid grid-cols-2 items-center gap-3 lg:grid-cols-4'>
      <Input
        type='search'
        aria-label='Search'
        placeholder='Search movies...'
        value={searchValue}
        onChange={(e) => handleSearchChange(e.target.value)}
        className='col-span-2 lg:col-span-2'
      />

      <Select value={currentType} onValueChange={(value) => updateFilter('type', value === ANY ? null : value)}>
        <SelectTrigger aria-label='Type' className='w-full'>
          <SelectValue placeholder='Any type' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ANY}>Any type</SelectItem>
          {TYPE_OPTIONS.map((type) => (
            <SelectItem key={type} value={type}>
              {TYPE_LABELS[type]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={currentYear} onValueChange={(value) => updateFilter('y', value === ANY ? null : value)}>
        <SelectTrigger aria-label='Year' className='w-full'>
          <SelectValue placeholder='Any year' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ANY}>Any year</SelectItem>
          {years.map((y) => (
            <SelectItem key={y} value={String(y)}>
              {y}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default MovieFilters;
