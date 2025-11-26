
import HomeFeedServer from './HomeFeedServer';
import { Suspense } from 'react';

export const experimental_ppr = true;

// Main page: server component for PPR and server-driven feed
export default async function Page({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  return (
    <Suspense fallback={<div>Loading feed...</div>}>
      <HomeFeedServer searchParams={Promise.resolve(resolvedSearchParams)} />
    </Suspense>
  );
}
