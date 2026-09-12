export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50" aria-label="Đang tải">
      <div className="h-9 bg-gray-800 animate-pulse" />
      <div className="h-20 bg-white border-b animate-pulse" />
      <div className="h-12 bg-gray-900 animate-pulse" />
      <div className="max-w-[1280px] mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }, (_, index) => <div key={index} className="bg-gray-200 rounded-lg h-72 animate-pulse" />)}
        </div>
      </div>
    </div>
  );
}
