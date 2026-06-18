import NavigationLinks from '@/app/(frontend)/NavigationLinks';
import ThemeSwitch from '@/app/(frontend)/ThemeSwitch';

const NavigationBar = () => {
  return (
    <header className='bg-neutral-300 dark:bg-neutral-800'>
      <nav aria-label='Main' className='mx-auto flex w-full max-w-7xl flex-row items-center justify-between gap-6 px-3 py-2 sm:px-0'>
        <NavigationLinks />
        <ThemeSwitch />
      </nav>
    </header>
  );
};

export default NavigationBar;
