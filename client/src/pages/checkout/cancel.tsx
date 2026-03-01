import { useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/components/base/buttons/button";
import { XCircle, ShoppingCart01 } from "@untitledui/icons";
import { animate, createTimeline } from "animejs";

export const CheckoutCancelPage = () => {
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const tl = createTimeline({ defaults: { ease: "outExpo" } });

    tl.add(containerRef.current.querySelectorAll(".cancel-icon"), {
      scale: [0, 1],
      opacity: [0, 1],
      duration: 600,
      ease: "outBack",
    })
      .add(
        containerRef.current.querySelectorAll(".cancel-icon"),
        {
          translateX: [-10, 10, -8, 8, -4, 0],
          duration: 500,
          ease: "inOutQuad",
        },
        "-=100"
      )
      .add(
        containerRef.current.querySelectorAll(".cancel-text"),
        {
          opacity: [0, 1],
          translateY: [20, 0],
          duration: 600,
        },
        "-=300"
      )
      .add(
        containerRef.current.querySelectorAll(".cancel-btn"),
        {
          opacity: [0, 1],
          translateY: [15, 0],
          duration: 500,
        },
        "-=200"
      );
  }, []);

  return (
    <div
      className="mx-auto flex max-w-lg flex-col items-center px-4 py-20 text-center sm:px-6"
      ref={containerRef}
    >
      <div
        className="cancel-icon mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-error-primary"
        style={{ opacity: 0 }}
      >
        <XCircle className="size-8 text-white" />
      </div>
      <h1
        className="cancel-text text-display-xs font-semibold text-primary"
        style={{ opacity: 0 }}
      >
        Checkout Cancelled
      </h1>
      <p
        className="cancel-text mt-3 text-md text-tertiary"
        style={{ opacity: 0 }}
      >
        Your payment was cancelled. Your cart items are still saved.
      </p>
      <div className="cancel-btn mt-8 flex gap-3" style={{ opacity: 0 }}>
        <Button
          color="primary"
          size="md"
          onClick={() => navigate("/cart")}
          iconLeading={ShoppingCart01}
        >
          Return to Cart
        </Button>
        <Button
          color="secondary-gray"
          size="md"
          onClick={() => navigate("/products")}
        >
          Continue Shopping
        </Button>
      </div>
    </div>
  );
};
