

import HomeFeedServer from './HomeFeedServer';

// Main page: server component for PPR and server-driven feed
export default async function Page({ searchParams }: { searchParams?: Promise<Record<string, string | string[] | undefined>> }) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  return <HomeFeedServer searchParams={resolvedSearchParams} />;
}
