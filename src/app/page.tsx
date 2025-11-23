
import HomeFeedServer from './HomeFeedServer';

// Main page: server component for PPR and server-driven feed
export default function Page({ searchParams }: { searchParams?: Record<string, string | string[] | undefined> }) {
  return <HomeFeedServer searchParams={searchParams} />;
}
