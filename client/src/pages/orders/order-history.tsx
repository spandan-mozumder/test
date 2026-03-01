import { useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchOrderHistory } from "@/store/orderSlice";
import { Button } from "@/components/base/buttons/button";
import { Badge } from "@/components/base/badges/badges";
import { LoadingIndicator } from "@/components/application/loading-indicator/loading-indicator";
import { EmptyState } from "@/components/application/empty-state/empty-state";
import { useNavigate } from "react-router";
import { ShoppingBag01 } from "@untitledui/icons";
import { animate, stagger } from "animejs";

const statusColors: Record<string, "success" | "warning" | "error" | "gray"> = {
  paid: "success",
  pending: "warning",
  failed: "error",
  refunded: "gray",
};

export const OrderHistoryPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { orders, loading, pagination } = useAppSelector(
    (state) => state.orders
  );
  const listRef = useRef<HTMLDivElement>(null);
  const prevOrderIds = useRef<string>("");

  useEffect(() => {
    dispatch(fetchOrderHistory(1));
  }, [dispatch]);

  useEffect(() => {
    if (!listRef.current || loading || orders.length === 0) return;
    const currentIds = orders.map((o) => o._id).join(",");
    if (currentIds === prevOrderIds.current) return;
    prevOrderIds.current = currentIds;

    animate(listRef.current.querySelectorAll(".order-card"), {
      opacity: [0, 1],
      translateY: [30, 0],
      delay: stagger(100),
      duration: 700,
      ease: "outExpo",
    });
  }, [orders, loading]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-display-sm font-semibold text-primary">
        Order History
      </h1>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <LoadingIndicator size="lg" />
        </div>
      ) : orders.length === 0 ? (
        <div>
          <EmptyState
            title="No orders yet"
            description="Start shopping to see your order history here."
          />
          <div className="mt-6 text-center">
            <Button
              color="primary"
              size="md"
              iconLeading={ShoppingBag01}
              onClick={() => navigate("/products")}
            >
              Browse Products
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4" ref={listRef}>
          {orders.map((order) => (
            <div
              key={order._id}
              className="order-card card-hover rounded-xl border border-secondary bg-primary p-6 shadow-xs"
              style={{ opacity: 0 }}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-md font-semibold text-primary">
                      Order #{order._id.slice(-8).toUpperCase()}
                    </h3>
                    <Badge
                      size="sm"
                      color={statusColors[order.paymentStatus] || "gray"}
                      type="pill-color"
                    >
                      {order.paymentStatus.charAt(0).toUpperCase() +
                        order.paymentStatus.slice(1)}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-tertiary">
                    {new Date(order.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-primary">
                    ${order.totalAmount.toFixed(2)}
                  </p>
                  <p className="text-sm text-tertiary">
                    {order.items.length} item
                    {order.items.length > 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              <hr className="my-4 border-secondary" />

              <div className="space-y-3">
                {order.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-3"
                  >
                    <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-secondary">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm">
                          🎵
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-primary">
                        {item.title}
                      </p>
                      <p className="text-xs text-tertiary">
                        Qty: {item.quantity} × ${item.price.toFixed(2)}
                      </p>
                    </div>
                    <p className="text-sm font-medium text-primary">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {pagination && pagination.totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              <Button
                color="secondary-gray"
                size="sm"
                isDisabled={pagination.currentPage <= 1}
                onClick={() =>
                  dispatch(fetchOrderHistory(pagination.currentPage - 1))
                }
              >
                Previous
              </Button>
              <span className="text-sm text-tertiary">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              <Button
                color="secondary-gray"
                size="sm"
                isDisabled={
                  pagination.currentPage >= pagination.totalPages
                }
                onClick={() =>
                  dispatch(fetchOrderHistory(pagination.currentPage + 1))
                }
              >
                Next
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
