import dynamic from 'next/dynamic';

const MasonryWrapper = dynamic(() => import('./MasonryWrapper'), {
  ssr: false,
  loading: () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-pulse">
      <div className="h-64 bg-gray-200 rounded"></div>
      <div className="h-64 bg-gray-200 rounded"></div>
      <div className="h-64 bg-gray-200 rounded"></div>
    </div>
  ),
});

export default MasonryWrapper;
