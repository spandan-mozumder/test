import { useEffect, useState, useRef, type FormEvent } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchAnalytics, fetchAllOrders } from "@/store/adminSlice";
import {
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "@/store/productSlice";
import { Button } from "@/components/base/buttons/button";
import { Input } from "@/components/base/input/input";
import { Badge } from "@/components/base/badges/badges";
import { LoadingIndicator } from "@/components/application/loading-indicator/loading-indicator";
import {
  BarChartSquare02,
  CurrencyDollar,
  Package,
  ShoppingBag01,
  Plus,
  Edit01,
  Trash01,
  AlertTriangle,
} from "@untitledui/icons";
import toast from "react-hot-toast";
import { animate, stagger } from "animejs";

const categories = [
  "vinyl",
  "cd",
  "cassette",
  "merchandise",
  "equipment",
  "accessories",
];

const statusColors: Record<string, "success" | "warning" | "error" | "gray"> = {
  paid: "success",
  pending: "warning",
  failed: "error",
  refunded: "gray",
};

export const AdminDashboard = () => {
  const dispatch = useAppDispatch();
  const { analytics, allOrders, loading: adminLoading, ordersPagination } =
    useAppSelector((state) => state.admin);
  const { products, pagination: productPagination, loading: productLoading } =
    useAppSelector((state) => state.products);
  const [activeTab, setActiveTab] = useState<"overview" | "products" | "orders">(
    "overview"
  );
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [productForm, setProductForm] = useState({
    title: "",
    description: "",
    price: "",
    category: "vinyl",
    stockQuantity: "",
    image: "",
  });
  const statsRef = useRef<HTMLDivElement>(null);
  const tabContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    dispatch(fetchAnalytics());
    dispatch(fetchProducts({ page: 1, limit: 20 }));
    dispatch(fetchAllOrders({ page: 1 }));
  }, [dispatch]);

  useEffect(() => {
    if (!statsRef.current || !analytics) return;
    const cards = statsRef.current.querySelectorAll(".stat-card");
    animate(cards, {
      opacity: [0, 1],
      translateY: [30, 0],
      scale: [0.95, 1],
      delay: stagger(100),
      duration: 700,
      ease: "outExpo",
    });

    // Animate stat numbers
    const statValues = statsRef.current.querySelectorAll(".stat-value");
    statValues.forEach((el) => {
      const target = parseFloat(el.getAttribute("data-value") || "0");
      const isPrice = el.getAttribute("data-price") === "true";
      if (isNaN(target)) return;
      const obj = { value: 0 };
      animate(obj, {
        value: target,
        duration: 1500,
        ease: "outExpo",
        onUpdate: () => {
          (el as HTMLElement).textContent = isPrice
            ? `$${obj.value.toFixed(2)}`
            : Math.round(obj.value).toString();
        },
      });
    });
  }, [analytics]);

  useEffect(() => {
    if (!tabContentRef.current) return;
    animate(tabContentRef.current, {
      opacity: [0, 1],
      translateY: [15, 0],
      duration: 400,
      ease: "outExpo",
    });
  }, [activeTab]);

  const resetForm = () => {
    setProductForm({
      title: "",
      description: "",
      price: "",
      category: "vinyl",
      stockQuantity: "",
      image: "",
    });
    setEditingProduct(null);
  };

  const handleOpenCreate = () => {
    resetForm();
    setShowProductModal(true);
  };

  const handleOpenEdit = (product: any) => {
    setEditingProduct(product);
    setProductForm({
      title: product.title,
      description: product.description,
      price: product.price.toString(),
      category: product.category,
      stockQuantity: product.stockQuantity.toString(),
      image: product.image || "",
    });
    setShowProductModal(true);
  };

  const handleSubmitProduct = async (e: FormEvent) => {
    e.preventDefault();
    const data = {
      title: productForm.title,
      description: productForm.description,
      price: parseFloat(productForm.price),
      category: productForm.category,
      stockQuantity: parseInt(productForm.stockQuantity),
      image: productForm.image,
    };

    if (editingProduct) {
      const result = await dispatch(
        updateProduct({ id: editingProduct._id, data })
      );
      if (updateProduct.fulfilled.match(result)) {
        toast.success("Product updated successfully");
        setShowProductModal(false);
        resetForm();
        dispatch(fetchProducts({ page: 1, limit: 20 }));
      } else {
        toast.error("Failed to update product");
      }
    } else {
      const result = await dispatch(createProduct(data));
      if (createProduct.fulfilled.match(result)) {
        toast.success("Product created successfully");
        setShowProductModal(false);
        resetForm();
        dispatch(fetchProducts({ page: 1, limit: 20 }));
      } else {
        toast.error("Failed to create product");
      }
    }
  };

  const handleDeleteProduct = async (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"?`)) {
      const result = await dispatch(deleteProduct(id));
      if (deleteProduct.fulfilled.match(result)) {
        toast.success("Product deleted");
        dispatch(fetchProducts({ page: 1, limit: 20 }));
        dispatch(fetchAnalytics());
      } else {
        toast.error("Failed to delete product");
      }
    }
  };

  const tabs = [
    { id: "overview" as const, label: "Overview", icon: BarChartSquare02 },
    { id: "products" as const, label: "Products", icon: Package },
    { id: "orders" as const, label: "Orders", icon: ShoppingBag01 },
  ];

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-display-sm font-semibold text-primary">
              Admin Dashboard
            </h1>
            <p className="mt-1 text-md text-tertiary">
              Manage your store
            </p>
          </div>
          <Button
            color="primary"
            size="md"
            iconLeading={Plus}
            onClick={handleOpenCreate}
            className="glow-border"
          >
            Add Product
          </Button>
        </div>

        <div className="mb-8 flex gap-1 rounded-lg border border-secondary bg-secondary p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`flex flex-1 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all duration-300 cursor-pointer ${activeTab === tab.id
                  ? "bg-primary text-primary shadow-xs"
                  : "text-tertiary hover:text-secondary"
                }`}
              onClick={() => setActiveTab(tab.id)}
            >
              <tab.icon className="size-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {adminLoading && !analytics ? (
          <div className="flex items-center justify-center py-20">
            <LoadingIndicator size="lg" />
          </div>
        ) : (
          <div ref={tabContentRef} key={activeTab}>
            {activeTab === "overview" && analytics && (
              <div>
                <div
                  className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
                  ref={statsRef}
                >
                  <div className="stat-card card-hover rounded-xl border border-secondary bg-primary p-6 shadow-xs" style={{ opacity: 0 }}>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-primary">
                        <CurrencyDollar className="size-5 text-brand-600" />
                      </div>
                      <div>
                        <p className="text-sm text-tertiary">Total Revenue</p>
                        <p
                          className="stat-value text-display-xs font-semibold text-primary"
                          data-value={analytics.overview.totalRevenue}
                          data-price="true"
                        >
                          $0.00
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="stat-card card-hover rounded-xl border border-secondary bg-primary p-6 shadow-xs" style={{ opacity: 0 }}>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success-primary">
                        <ShoppingBag01 className="size-5 text-success-600" />
                      </div>
                      <div>
                        <p className="text-sm text-tertiary">Total Sales</p>
                        <p
                          className="stat-value text-display-xs font-semibold text-primary"
                          data-value={analytics.overview.totalSales}
                        >
                          0
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="stat-card card-hover rounded-xl border border-secondary bg-primary p-6 shadow-xs" style={{ opacity: 0 }}>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning-primary">
                        <BarChartSquare02 className="size-5 text-warning-600" />
                      </div>
                      <div>
                        <p className="text-sm text-tertiary">
                          Avg Order Value
                        </p>
                        <p
                          className="stat-value text-display-xs font-semibold text-primary"
                          data-value={analytics.overview.avgOrderValue}
                          data-price="true"
                        >
                          $0.00
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="stat-card card-hover rounded-xl border border-secondary bg-primary p-6 shadow-xs" style={{ opacity: 0 }}>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                        <Package className="size-5 text-gray-600" />
                      </div>
                      <div>
                        <p className="text-sm text-tertiary">
                          Total Products
                        </p>
                        <p
                          className="stat-value text-display-xs font-semibold text-primary"
                          data-value={analytics.overview.totalProducts}
                        >
                          0
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {analytics.salesByCategory.length > 0 && (
                  <div className="mb-8 rounded-xl border border-secondary bg-primary p-6 shadow-xs">
                    <h3 className="mb-4 text-lg font-semibold text-primary">
                      Sales by Category
                    </h3>
                    <div className="space-y-3">
                      {analytics.salesByCategory.map((cat: any) => (
                        <div
                          key={cat._id}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <Badge
                              size="sm"
                              color="brand"
                              type="pill-color"
                            >
                              {cat._id}
                            </Badge>
                            <span className="text-sm text-tertiary">
                              {cat.totalSales} sold
                            </span>
                          </div>
                          <span className="text-sm font-semibold text-primary">
                            ${cat.totalRevenue.toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {analytics.lowStockProducts.length > 0 && (
                  <div className="mb-8 rounded-xl border border-warning bg-warning-primary p-6">
                    <div className="mb-4 flex items-center gap-2">
                      <AlertTriangle className="size-5 text-warning-600" />
                      <h3 className="text-lg font-semibold text-primary">
                        Low Stock Alert
                      </h3>
                    </div>
                    <div className="space-y-2">
                      {analytics.lowStockProducts.map((product: any) => (
                        <div
                          key={product._id}
                          className="flex items-center justify-between rounded-lg bg-primary p-3"
                        >
                          <span className="text-sm font-medium text-primary">
                            {product.title}
                          </span>
                          <Badge
                            size="sm"
                            color={
                              product.stockQuantity === 0
                                ? "error"
                                : "warning"
                            }
                            type="pill-color"
                          >
                            {product.stockQuantity === 0
                              ? "Out of Stock"
                              : `${product.stockQuantity} left`}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {analytics.recentOrders.length > 0 && (
                  <div className="rounded-xl border border-secondary bg-primary p-6 shadow-xs">
                    <h3 className="mb-4 text-lg font-semibold text-primary">
                      Recent Orders
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-secondary text-left text-sm text-tertiary">
                            <th className="pb-3 font-medium">Order</th>
                            <th className="pb-3 font-medium">Customer</th>
                            <th className="pb-3 font-medium">Amount</th>
                            <th className="pb-3 font-medium">Status</th>
                            <th className="pb-3 font-medium">Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {analytics.recentOrders.map((order: any) => (
                            <tr
                              key={order._id}
                              className="border-b border-secondary last:border-0"
                            >
                              <td className="py-3 text-sm font-medium text-primary">
                                #{order._id.slice(-8).toUpperCase()}
                              </td>
                              <td className="py-3 text-sm text-secondary">
                                {order.user?.name || "N/A"}
                              </td>
                              <td className="py-3 text-sm font-medium text-primary">
                                ${order.totalAmount.toFixed(2)}
                              </td>
                              <td className="py-3">
                                <Badge
                                  size="sm"
                                  color={
                                    statusColors[order.paymentStatus] ||
                                    "gray"
                                  }
                                  type="pill-color"
                                >
                                  {order.paymentStatus}
                                </Badge>
                              </td>
                              <td className="py-3 text-sm text-tertiary">
                                {new Date(
                                  order.createdAt
                                ).toLocaleDateString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {analytics.dailySales.length > 0 && (
                  <div className="mt-8 rounded-xl border border-secondary bg-primary p-6 shadow-xs">
                    <h3 className="mb-4 text-lg font-semibold text-primary">
                      Last 7 Days
                    </h3>
                    <div className="space-y-2">
                      {analytics.dailySales.map((day: any) => (
                        <div
                          key={day._id}
                          className="flex items-center justify-between rounded-lg bg-secondary p-3"
                        >
                          <span className="text-sm text-secondary">
                            {new Date(day._id).toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                          <div className="flex items-center gap-4">
                            <span className="text-sm text-tertiary">
                              {day.sales} orders
                            </span>
                            <span className="text-sm font-semibold text-primary">
                              ${day.revenue.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "products" && (
              <div>
                <div className="overflow-x-auto rounded-xl border border-secondary bg-primary shadow-xs">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-secondary bg-secondary text-left text-sm text-tertiary">
                        <th className="px-4 py-3 font-medium">Product</th>
                        <th className="px-4 py-3 font-medium">Category</th>
                        <th className="px-4 py-3 font-medium">Price</th>
                        <th className="px-4 py-3 font-medium">Stock</th>
                        <th className="px-4 py-3 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((product) => (
                        <tr
                          key={product._id}
                          className="border-b border-secondary last:border-0 transition-colors hover:bg-secondary/50"
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-secondary">
                                {product.image ? (
                                  <img
                                    src={product.image}
                                    alt={product.title}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="flex h-full items-center justify-center text-sm">
                                    🎵
                                  </div>
                                )}
                              </div>
                              <span className="text-sm font-medium text-primary">
                                {product.title}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <Badge
                              size="sm"
                              color="brand"
                              type="pill-color"
                            >
                              {product.category}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-primary">
                            ${product.price.toFixed(2)}
                          </td>
                          <td className="px-4 py-3">
                            <Badge
                              size="sm"
                              color={
                                product.stockQuantity === 0
                                  ? "error"
                                  : product.stockQuantity <= 5
                                    ? "warning"
                                    : "success"
                              }
                              type="pill-color"
                            >
                              {product.stockQuantity}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              <Button
                                color="tertiary-gray"
                                size="sm"
                                iconLeading={Edit01}
                                onClick={() => handleOpenEdit(product)}
                              />
                              <Button
                                color="tertiary-destructive"
                                size="sm"
                                iconLeading={Trash01}
                                onClick={() =>
                                  handleDeleteProduct(
                                    product._id,
                                    product.title
                                  )
                                }
                              />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "orders" && (
              <div className="overflow-x-auto rounded-xl border border-secondary bg-primary shadow-xs">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-secondary bg-secondary text-left text-sm text-tertiary">
                      <th className="px-4 py-3 font-medium">Order ID</th>
                      <th className="px-4 py-3 font-medium">Customer</th>
                      <th className="px-4 py-3 font-medium">Items</th>
                      <th className="px-4 py-3 font-medium">Total</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allOrders.map((order: any) => (
                      <tr
                        key={order._id}
                        className="border-b border-secondary last:border-0 transition-colors hover:bg-secondary/50"
                      >
                        <td className="px-4 py-3 text-sm font-medium text-primary">
                          #{order._id.slice(-8).toUpperCase()}
                        </td>
                        <td className="px-4 py-3 text-sm text-secondary">
                          {order.user?.name || "N/A"}
                          <br />
                          <span className="text-xs text-tertiary">
                            {order.user?.email || ""}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-secondary">
                          {order.items?.length || 0} items
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-primary">
                          ${order.totalAmount?.toFixed(2)}
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            size="sm"
                            color={
                              statusColors[order.paymentStatus] || "gray"
                            }
                            type="pill-color"
                          >
                            {order.paymentStatus}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-sm text-tertiary">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {ordersPagination && ordersPagination.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 border-t border-secondary p-4">
                    <Button
                      color="secondary-gray"
                      size="sm"
                      isDisabled={ordersPagination.currentPage <= 1}
                      onClick={() =>
                        dispatch(
                          fetchAllOrders({
                            page: ordersPagination.currentPage - 1,
                          })
                        )
                      }
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-tertiary">
                      Page {ordersPagination.currentPage} of{" "}
                      {ordersPagination.totalPages}
                    </span>
                    <Button
                      color="secondary-gray"
                      size="sm"
                      isDisabled={
                        ordersPagination.currentPage >=
                        ordersPagination.totalPages
                      }
                      onClick={() =>
                        dispatch(
                          fetchAllOrders({
                            page: ordersPagination.currentPage + 1,
                          })
                        )
                      }
                    >
                      Next
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-secondary bg-primary shadow-xl">
            <div className="border-b border-secondary p-6">
              <h2 className="text-lg font-semibold text-primary">
                {editingProduct ? "Edit Product" : "Add New Product"}
              </h2>
            </div>
            <form onSubmit={handleSubmitProduct}>
              <div className="max-h-[60vh] overflow-y-auto p-6">
                <div className="space-y-4">
                  <Input
                    label="Title"
                    value={productForm.title}
                    onChange={(v) =>
                      setProductForm({ ...productForm, title: v })
                    }
                    placeholder="Product title"
                    isRequired
                  />
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-secondary">
                      Description *
                    </label>
                    <textarea
                      className="w-full rounded-lg border border-primary bg-primary px-3 py-2.5 text-sm text-primary placeholder:text-placeholder focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand"
                      rows={3}
                      value={productForm.description}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          description: e.target.value,
                        })
                      }
                      placeholder="Product description"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Price ($)"
                      type="number"
                      value={productForm.price}
                      onChange={(v) =>
                        setProductForm({ ...productForm, price: v })
                      }
                      placeholder="0.00"
                      isRequired
                    />
                    <Input
                      label="Stock Quantity"
                      type="number"
                      value={productForm.stockQuantity}
                      onChange={(v) =>
                        setProductForm({
                          ...productForm,
                          stockQuantity: v,
                        })
                      }
                      placeholder="0"
                      isRequired
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-secondary">
                      Category *
                    </label>
                    <select
                      className="w-full rounded-lg border border-primary bg-primary px-3 py-2.5 text-sm text-primary focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand"
                      value={productForm.category}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          category: e.target.value,
                        })
                      }
                      required
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <Input
                    label="Image URL"
                    value={productForm.image}
                    onChange={(v) =>
                      setProductForm({ ...productForm, image: v })
                    }
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 border-t border-secondary p-6">
                <Button
                  color="secondary-gray"
                  size="md"
                  onClick={() => {
                    setShowProductModal(false);
                    resetForm();
                  }}
                  type="button"
                >
                  Cancel
                </Button>
                <Button color="primary" size="md" type="submit">
                  {editingProduct ? "Update Product" : "Create Product"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
