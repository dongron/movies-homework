'use client';

import { useEffect, useState } from 'react';

import { useTheme } from 'next-themes';
import { type LucideIcon, Monitor, Moon, Sun } from 'lucide-react';

type SwitchOption = {
  name: string;
  value: string;
  icon: LucideIcon;
};

const SWITCH_DATA: SwitchOption[] = [
  { name: 'System', value: 'system', icon: Monitor },
  { name: 'Light', value: 'light', icon: Sun },
  { name: 'Dark', value: 'dark', icon: Moon },
];

const ThemeSwitch: React.FC = () => {
  const { theme, setTheme } = useTheme();

  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <div className='w-fit' role='group' aria-label='Theme'>
      <div className='flex w-auto flex-row justify-center overflow-hidden rounded-3xl border border-neutral-200 sm:flex-row dark:border-neutral-700'>
        {SWITCH_DATA.map((data) => {
          const active = mounted && theme === data.value;
          return (
            <button
              key={data.value}
              aria-label={data.name}
              aria-pressed={active}
              className={`flex items-center gap-2 px-4 py-2 text-black dark:text-white ${
                active ? 'bg-neutral-200 dark:bg-neutral-700' : 'bg-transparent'
              } dark:hover:bg-neutral-800`}
              onClick={() => setTheme(data.value)}>
              <data.icon className='size-4' aria-hidden='true' />
              <span className='hidden sm:block'>{data.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ThemeSwitch;
