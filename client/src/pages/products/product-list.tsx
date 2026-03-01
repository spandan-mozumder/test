import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchProducts, setFilters } from "@/store/productSlice";
import { addToCart } from "@/store/cartSlice";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { Badge } from "@/components/base/badges/badges";
import { LoadingIndicator } from "@/components/application/loading-indicator/loading-indicator";
import { EmptyState } from "@/components/application/empty-state/empty-state";
import { SearchMd, ShoppingCart01 } from "@untitledui/icons";
import toast from "react-hot-toast";
import { animate, stagger } from "animejs";

const categories = [
  { id: "", label: "All Categories" },
  { id: "vinyl", label: "Vinyl Records" },
  { id: "cd", label: "CDs" },
  { id: "cassette", label: "Cassettes" },
  { id: "merchandise", label: "Merchandise" },
  { id: "equipment", label: "Equipment" },
  { id: "accessories", label: "Accessories" },
];

const sortOptions = [
  { id: "createdAt-desc", label: "Newest First" },
  { id: "createdAt-asc", label: "Oldest First" },
  { id: "price-asc", label: "Price: Low to High" },
  { id: "price-desc", label: "Price: High to Low" },
  { id: "title-asc", label: "Name: A to Z" },
  { id: "title-desc", label: "Name: Z to A" },
];

function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export const ProductListPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { products, pagination, loading, filters } = useAppSelector(
    (state) => state.products
  );
  const [searchInput, setSearchInput] = useState(filters.search);
  const debouncedSearch = useDebounce(searchInput, 400);
  const gridRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const prevProductIds = useRef<string>("");

  useEffect(() => {
    dispatch(
      fetchProducts({
        page: filters.page,
        search: debouncedSearch,
        category: filters.category,
        sortBy: filters.sortBy,
        order: filters.order,
      })
    );
  }, [
    dispatch,
    filters.page,
    debouncedSearch,
    filters.category,
    filters.sortBy,
    filters.order,
  ]);

  useEffect(() => {
    dispatch(setFilters({ search: debouncedSearch, page: 1 }));
  }, [debouncedSearch, dispatch]);

  useEffect(() => {
    if (!headerRef.current) return;
    animate(headerRef.current.querySelectorAll(".header-el"), {
      opacity: [0, 1],
      translateY: [20, 0],
      delay: stagger(60),
      duration: 600,
      ease: "outExpo",
    });
  }, []);

  useEffect(() => {
    if (!gridRef.current || loading || products.length === 0) return;
    const currentIds = products.map((p) => p._id).join(",");
    if (currentIds === prevProductIds.current) return;
    prevProductIds.current = currentIds;

    const cards = gridRef.current.querySelectorAll(".product-card");
    animate(cards, {
      opacity: [0, 1],
      translateY: [30, 0],
      scale: [0.95, 1],
      delay: stagger(50),
      duration: 600,
      ease: "outExpo",
    });
  }, [products, loading]);

  const handleCategoryChange = (value: string) => {
    dispatch(setFilters({ category: value, page: 1 }));
  };

  const handleSortChange = (value: string) => {
    const [sortBy, order] = value.split("-");
    dispatch(setFilters({ sortBy, order, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    dispatch(setFilters({ page }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleAddToCart = (product: any) => {
    if (product.stockQuantity === 0) {
      toast.error("This product is out of stock");
      return;
    }
    dispatch(
      addToCart({
        productId: product._id,
        title: product.title,
        price: product.price,
        quantity: 1,
        image: product.image,
        stockQuantity: product.stockQuantity,
      })
    );
    toast.success(`${product.title} added to cart`);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8" ref={headerRef}>
        <h1 className="header-el text-display-sm font-semibold text-primary" style={{ opacity: 0 }}>
          Products
        </h1>
        <p className="header-el mt-1 text-md text-tertiary" style={{ opacity: 0 }}>
          Browse our collection of premium music records and gear
        </p>
      </div>

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="flex-1">
          <Input
            placeholder="Search products..."
            value={searchInput}
            onChange={(v) => setSearchInput(v)}
            iconLeading={SearchMd}
            size="md"
          />
        </div>
        <div className="flex gap-3">
          <select
            className="rounded-lg border border-primary bg-primary px-3 py-2.5 text-sm text-primary focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand"
            value={filters.category}
            onChange={(e) => handleCategoryChange(e.target.value)}
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.label}
              </option>
            ))}
          </select>
          <select
            className="rounded-lg border border-primary bg-primary px-3 py-2.5 text-sm text-primary focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand"
            value={`${filters.sortBy}-${filters.order}`}
            onChange={(e) => handleSortChange(e.target.value)}
          >
            {sortOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <LoadingIndicator size="lg" />
        </div>
      ) : products.length === 0 ? (
        <EmptyState
          title="No products found"
          description="Try adjusting your search or filter criteria."
        />
      ) : (
        <>
          <div
            className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            ref={gridRef}
          >
            {products.map((product) => (
              <div
                key={product._id}
                className="product-card card-hover group cursor-pointer overflow-hidden rounded-xl border border-secondary bg-primary shadow-xs"
                style={{ opacity: 0 }}
              >
                <div
                  className="relative aspect-square overflow-hidden bg-secondary"
                  onClick={() => navigate(`/products/${product._id}`)}
                >
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-quaternary">
                      <span className="text-4xl">🎵</span>
                    </div>
                  )}
                  {product.stockQuantity === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                      <Badge size="md" color="error" type="pill-color">
                        Out of Stock
                      </Badge>
                    </div>
                  )}
                  {product.stockQuantity > 0 &&
                    product.stockQuantity <= 5 && (
                      <div className="absolute right-2 top-2">
                        <Badge size="sm" color="warning" type="pill-color">
                          Low Stock
                        </Badge>
                      </div>
                    )}
                </div>
                <div className="p-4">
                  <div className="mb-2 flex items-start justify-between">
                    <Badge size="sm" color="brand" type="pill-color">
                      {product.category}
                    </Badge>
                    <span className="text-lg font-semibold text-primary">
                      ${product.price.toFixed(2)}
                    </span>
                  </div>
                  <h3
                    className="mb-1 line-clamp-1 text-md font-semibold text-primary cursor-pointer hover:text-brand-secondary transition-colors"
                    onClick={() => navigate(`/products/${product._id}`)}
                  >
                    {product.title}
                  </h3>
                  <p className="mb-4 line-clamp-2 text-sm text-tertiary">
                    {product.description}
                  </p>
                  <Button
                    color="primary"
                    size="sm"
                    className="w-full"
                    iconLeading={ShoppingCart01}
                    isDisabled={product.stockQuantity === 0}
                    onClick={() => handleAddToCart(product)}
                  >
                    {product.stockQuantity === 0
                      ? "Out of Stock"
                      : "Add to Cart"}
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {pagination && pagination.totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <Button
                color="secondary-gray"
                size="sm"
                isDisabled={!pagination.hasPrevPage}
                onClick={() => handlePageChange(pagination.currentPage - 1)}
              >
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {Array.from(
                  { length: Math.min(pagination.totalPages, 5) },
                  (_, i) => {
                    let pageNum: number;
                    if (pagination.totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (pagination.currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (
                      pagination.currentPage >=
                      pagination.totalPages - 2
                    ) {
                      pageNum = pagination.totalPages - 4 + i;
                    } else {
                      pageNum = pagination.currentPage - 2 + i;
                    }
                    return (
                      <Button
                        key={pageNum}
                        color={
                          pageNum === pagination.currentPage
                            ? "primary"
                            : "tertiary-gray"
                        }
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                      >
                        {pageNum}
                      </Button>
                    );
                  }
                )}
              </div>
              <Button
                color="secondary-gray"
                size="sm"
                isDisabled={!pagination.hasNextPage}
                onClick={() => handlePageChange(pagination.currentPage + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
