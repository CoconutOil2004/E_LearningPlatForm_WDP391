const ProductSkeleton = ({ count = 5 }) => {
  return (
    <>
      {Array.from(new Array(count)).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden bg-white border border-gray-200 rounded-lg shadow-md animate-pulse"
        >
          <div className="bg-gray-200 h-60"></div>
          <div className="p-4 space-y-3">
            <div className="w-24 h-6 bg-gray-200 rounded-full"></div>
            <div className="w-full h-6 bg-gray-200 rounded"></div>
            <div className="w-3/4 h-4 bg-gray-200 rounded"></div>
            <div className="w-full h-4 bg-gray-200 rounded"></div>
            <div className="flex justify-between">
              <div className="w-20 h-8 bg-gray-200 rounded"></div>
              <div className="w-24 h-8 bg-gray-200 rounded"></div>
            </div>
            <div className="w-full h-12 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      ))}
    </>
  );
};

export default ProductSkeleton;
