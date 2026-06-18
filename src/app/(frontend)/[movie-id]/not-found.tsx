import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = { title: 'Movie not found' };

const NotFound = () => {
  return (
    <main
      id='main-content'
      className='mx-auto mt-6 flex max-w-7xl flex-col items-center justify-center gap-6 px-3 py-24 font-[family-name:var(--font-geist-sans)]'>
      <h1 className='text-3xl font-bold'>Movie not found</h1>
      <p className='text-muted-foreground'>The movie you're looking for doesn't exist.</p>
      <Link href='/' className='text-muted-foreground text-sm hover:underline'>
        &larr; Back to movies
      </Link>
    </main>
  );
};

export default NotFound;
