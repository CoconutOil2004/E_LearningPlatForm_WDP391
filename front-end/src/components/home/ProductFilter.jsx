const ProductFilter = ({
  categories,
  selectedCategories,
  onCategoryChange,
  onResetCategories,
}) => {
  return (
    <section className="pt-8">
      <div className="grid grid-cols-1 mx-auto mt-10 max-w-7xl md:px-8 md:grid-cols-2">
        {/* Left Column - Title */}
        <div className="px-4 space-y-6 md:px-0">
          <h3 className="font-serif text-3xl md:text-4xl font-bold text-[#3D3528]">
            Discover Our
            <br className="hidden md:block" />
            Finest Product Selections
          </h3>
        </div>

        {/* Right Column - Description */}
        <div className="items-center justify-center hidden md:flex">
          <div className="relative">
            <h1 className="text-lg text-gray-600">
              Handcrafted from the best suppliers, our premium collection offers
              a variety of rich quality products. Find your perfect item!
            </h1>
          </div>
        </div>
      </div>

      {/* Category Filter Buttons */}
      <div className="flex flex-wrap gap-3 px-4 pb-2 mx-auto mt-10 overflow-x-auto max-w-7xl md:px-8">
        <button
          onClick={onResetCategories}
          className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
            selectedCategories.length === 0
              ? "bg-foreground text-background"
              : "bg-muted text-foreground hover:bg-secondary"
          }`}
        >
          All Products
        </button>

        {categories.map((category) => (
          <button
            key={category._id}
            onClick={() => onCategoryChange(category._id)}
            className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
              selectedCategories.includes(category._id)
                ? "bg-foreground text-background"
                : "bg-muted text-foreground hover:bg-secondary"
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>
    </section>
  );
};

export default ProductFilter;
