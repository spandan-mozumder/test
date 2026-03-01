import { useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { removeFromCart, updateQuantity, clearCart } from "@/store/cartSlice";
import { createCheckoutSession } from "@/store/orderSlice";
import { Button } from "@/components/base/buttons/button";
import { EmptyState } from "@/components/application/empty-state/empty-state";
import { Trash01, Plus, Minus, ShoppingCart01, ArrowLeft } from "@untitledui/icons";
import toast from "react-hot-toast";
import { animate, stagger } from "animejs";

export const CartPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { items, totalItems, totalPrice } = useAppSelector(
    (state) => state.cart
  );
  const { user } = useAppSelector((state) => state.auth);
  const { checkoutLoading } = useAppSelector((state) => state.orders);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!listRef.current || items.length === 0) return;
    animate(listRef.current.querySelectorAll(".cart-item"), {
      opacity: [0, 1],
      translateX: [-30, 0],
      delay: stagger(80),
      duration: 600,
      ease: "outExpo",
    });
  }, []);

  const handleCheckout = async () => {
    if (!user) {
      toast.error("Please sign in to checkout");
      navigate("/login");
      return;
    }

    const cartItems = items.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
    }));

    const result = await dispatch(createCheckoutSession(cartItems));
    if (createCheckoutSession.fulfilled.match(result)) {
      window.location.href = result.payload.url;
    } else {
      toast.error(result.payload as string);
    }
  };

  if (items.length === 0) {
    return (
      <>
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <EmptyState
            title="Your cart is empty"
            description="Add some products to your cart to get started."
          />
          <div className="mt-6 text-center">
            <Button
              color="primary"
              size="md"
              iconLeading={ShoppingCart01}
              onClick={() => navigate("/products")}
            >
              Browse Products
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Button
          color="link-gray"
          size="sm"
          iconLeading={ArrowLeft}
          className="mb-6"
          onClick={() => navigate("/products")}
        >
          Continue Shopping
        </Button>

        <h1 className="mb-8 text-display-sm font-semibold text-primary">
          Shopping Cart ({totalItems} items)
        </h1>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2" ref={listRef}>
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.productId}
                  className="cart-item card-hover flex gap-4 rounded-xl border border-secondary bg-primary p-4 shadow-xs"
                  style={{ opacity: 0 }}
                >
                  <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-secondary">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-2xl">
                        📦
                      </div>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <h3 className="text-md font-semibold text-primary">
                        {item.title}
                      </h3>
                      <p className="text-sm text-brand-secondary font-semibold">
                        ${item.price.toFixed(2)}
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          color="secondary-gray"
                          size="sm"
                          iconLeading={Minus}
                          isDisabled={item.quantity <= 1}
                          onClick={() =>
                            dispatch(
                              updateQuantity({
                                productId: item.productId,
                                quantity: item.quantity - 1,
                              })
                            )
                          }
                        />
                        <span className="w-8 text-center text-sm font-medium text-primary">
                          {item.quantity}
                        </span>
                        <Button
                          color="secondary-gray"
                          size="sm"
                          iconLeading={Plus}
                          isDisabled={item.quantity >= item.stockQuantity}
                          onClick={() =>
                            dispatch(
                              updateQuantity({
                                productId: item.productId,
                                quantity: item.quantity + 1,
                              })
                            )
                          }
                        />
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-primary">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                        <Button
                          color="tertiary-destructive"
                          size="sm"
                          iconLeading={Trash01}
                          onClick={() =>
                            dispatch(removeFromCart(item.productId))
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="rounded-xl border border-secondary bg-primary p-6 shadow-xs glow-border">
              <h2 className="text-lg font-semibold text-primary">
                Order Summary
              </h2>

              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-tertiary">Subtotal</span>
                  <span className="text-primary">
                    ${totalPrice.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-tertiary">Shipping</span>
                  <span className="text-success-primary">Free</span>
                </div>
                <hr className="border-secondary" />
                <div className="flex items-center justify-between">
                  <span className="text-md font-semibold text-primary">
                    Total
                  </span>
                  <span className="text-lg font-bold text-primary">
                    ${totalPrice.toFixed(2)}
                  </span>
                </div>
              </div>

              <Button
                color="primary"
                size="lg"
                className="mt-6 w-full"
                onClick={handleCheckout}
                isDisabled={checkoutLoading}
              >
                {checkoutLoading ? "Processing..." : "Proceed to Checkout"}
              </Button>

              <Button
                color="tertiary-destructive"
                size="sm"
                className="mt-3 w-full"
                onClick={() => {
                  dispatch(clearCart());
                  toast.success("Cart cleared");
                }}
              >
                Clear Cart
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
