import NavigationLinks from '@/app/(frontend)/NavigationLinks';
import { SITE_NAME } from '@/lib/site';

const Footer = () => {
  return (
    <footer className='mt-20 bg-neutral-300 dark:bg-neutral-800'>
      <div className='mx-auto flex w-full max-w-7xl flex-col items-center gap-4 px-3 py-6 sm:px-0'>
        <nav aria-label='Footer'>
          <NavigationLinks footer />
        </nav>
        <p className='text-xs text-neutral-500 dark:text-neutral-400'>
          &copy; {new Date().getFullYear()} {SITE_NAME}
        </p>
      </div>
    </footer>
  );
};

export default Footer;
