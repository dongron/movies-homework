import NavigationLinks from '@/app/(frontend)/NavigationLinks';

const Footer = () => {
  return (
    <div className='mt-20 bg-neutral-300 dark:bg-neutral-800'>
      <div className='mx-auto flex w-full max-w-7xl flex-row items-center justify-between gap-6 px-3 py-2 sm:px-0'>
        <div>
          <div className='px-3 py-2'>Links:</div>
          <NavigationLinks footer />
        </div>
      </div>
    </div>
  );
};

export default Footer;
