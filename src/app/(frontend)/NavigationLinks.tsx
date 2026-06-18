'use client';

import { FC } from 'react';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAVIGATION_LINKS = [{ href: '/', label: 'Home' }];

type NavigationLinksType = {
  footer?: boolean;
};

const NavigationLinks: FC<NavigationLinksType> = (props) => {
  const { footer } = props;
  const pathname = usePathname();

  return (
    <div className='flex items-center gap-3'>
      {NAVIGATION_LINKS.map((link) => {
        const active = link.href === '/' ? pathname === link.href : pathname.includes(link.href);

        return footer ? (
          <Link className={'px-3 py-2 text-sm'} key={link.href} href={link.href}>
            {link.label}
          </Link>
        ) : (
          <Link
            aria-current={active ? 'page' : undefined}
            className={`${active ? 'border-neutral-900 dark:border-neutral-100' : 'border-transparent'} border-b-1 border-solid px-3 py-2`}
            key={link.href}
            href={link.href}>
            {link.label}
          </Link>
        );
      })}
    </div>
  );
};

export default NavigationLinks;
