import { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router";
import { useAppDispatch } from "@/store/hooks";
import { verifyPayment } from "@/store/orderSlice";
import { clearCart } from "@/store/cartSlice";
import { Button } from "@/components/base/buttons/button";
import { LoadingIndicator } from "@/components/application/loading-indicator/loading-indicator";
import { CheckCircle, ShoppingBag01 } from "@untitledui/icons";
import { animate, createTimeline } from "animejs";

export const CheckoutSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [verified, setVerified] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const successRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sessionId = searchParams.get("session_id");
    if (sessionId) {
      dispatch(verifyPayment(sessionId)).then((result) => {
        if (verifyPayment.fulfilled.match(result)) {
          setVerified(true);
          dispatch(clearCart());
        }
        setVerifying(false);
      });
    } else {
      setVerifying(false);
    }
  }, [searchParams, dispatch]);

  useEffect(() => {
    if (!verified || !successRef.current) return;

    const tl = createTimeline({ defaults: { ease: "outExpo" } });
    tl.add(successRef.current.querySelectorAll(".success-icon"), {
      scale: [0, 1.2, 1],
      opacity: [0, 1],
      duration: 800,
      ease: "outBack",
    })
      .add(
        successRef.current.querySelectorAll(".success-text"),
        {
          opacity: [0, 1],
          translateY: [20, 0],
          duration: 600,
        },
        "-=300"
      )
      .add(
        successRef.current.querySelectorAll(".success-btn"),
        {
          opacity: [0, 1],
          translateY: [15, 0],
          duration: 500,
        },
        "-=200"
      );

    // Confetti-like particles
    const container = successRef.current;
    const particles: HTMLDivElement[] = [];
    for (let i = 0; i < 20; i++) {
      const p = document.createElement("div");
      p.style.cssText = `position:absolute;width:8px;height:8px;border-radius:50%;top:50%;left:50%;pointer-events:none;`;
      p.style.background = ["#7c3aed", "#a78bfa", "#6366f1", "#22c55e", "#f59e0b"][
        i % 5
      ];
      container.appendChild(p);
      particles.push(p);
    }

    animate(particles, {
      translateX: () => (Math.random() - 0.5) * 300,
      translateY: () => (Math.random() - 0.5) * 300,
      scale: [1, 0],
      opacity: [1, 0],
      duration: () => 800 + Math.random() * 600,
      delay: () => Math.random() * 200,
      ease: "outExpo",
    });

    return () => {
      particles.forEach((p) => p.remove());
    };
  }, [verified]);

  return (
    <div
      className="relative mx-auto flex max-w-lg flex-col items-center px-4 py-20 text-center sm:px-6"
      ref={successRef}
    >
      {verifying ? (
        <>
          <LoadingIndicator size="lg" />
          <p className="mt-4 text-md text-tertiary">
            Verifying your payment...
          </p>
        </>
      ) : verified ? (
        <>
          <div
            className="success-icon mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-success-primary"
            style={{ opacity: 0 }}
          >
            <CheckCircle className="size-8 text-white" />
          </div>
          <h1
            className="success-text text-display-xs font-semibold text-primary"
            style={{ opacity: 0 }}
          >
            Payment Successful!
          </h1>
          <p
            className="success-text mt-3 text-md text-tertiary"
            style={{ opacity: 0 }}
          >
            Thank you for your purchase. Your order has been confirmed and
            will be processed shortly.
          </p>
          <div className="success-btn mt-8 flex gap-3" style={{ opacity: 0 }}>
            <Button
              color="primary"
              size="md"
              onClick={() => navigate("/orders")}
              iconLeading={ShoppingBag01}
            >
              View Orders
            </Button>
            <Button
              color="secondary-gray"
              size="md"
              onClick={() => navigate("/products")}
            >
              Continue Shopping
            </Button>
          </div>
        </>
      ) : (
        <>
          <h1 className="text-display-xs font-semibold text-primary">
            Payment Verification Failed
          </h1>
          <p className="mt-3 text-md text-tertiary">
            We could not verify your payment. If you were charged, please
            contact support.
          </p>
          <Button
            color="primary"
            size="md"
            className="mt-8"
            onClick={() => navigate("/products")}
          >
            Back to Products
          </Button>
        </>
      )}
    </div>
  );
};
