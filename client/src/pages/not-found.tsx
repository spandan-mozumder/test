import { useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/components/base/buttons/button";
import { ArrowLeft } from "@untitledui/icons";
import { animate, createTimeline } from "animejs";

export function NotFound() {
    const router = useNavigate();
    const containerRef = useRef<HTMLElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const tl = createTimeline({ defaults: { ease: "outExpo" } });

        tl.add(containerRef.current.querySelectorAll(".nf-404"), {
            scale: [0.5, 1],
            opacity: [0, 1],
            duration: 800,
        })
            .add(
                containerRef.current.querySelectorAll(".nf-text"),
                {
                    opacity: [0, 1],
                    translateY: [30, 0],
                    duration: 600,
                },
                "-=400"
            )
            .add(
                containerRef.current.querySelectorAll(".nf-btn"),
                {
                    opacity: [0, 1],
                    translateY: [20, 0],
                    duration: 500,
                },
                "-=200"
            );

        // Floating background shapes
        const shapes = containerRef.current.querySelectorAll(".floating-shape");
        shapes.forEach((shape, i) => {
            animate(shape, {
                translateY: [0, -20, 0],
                translateX: [0, (i % 2 === 0 ? 10 : -10), 0],
                rotate: [0, (i % 2 === 0 ? 15 : -15), 0],
                duration: 3000 + i * 500,
                loop: true,
                ease: "inOutSine",
            });
        });
    }, []);

    return (
        <section
            className="relative flex min-h-screen items-start overflow-hidden bg-primary py-16 md:items-center md:py-24"
            ref={containerRef}
        >
            {/* Floating shapes */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {[...Array(6)].map((_, i) => (
                    <div
                        key={i}
                        className="floating-shape absolute rounded-full opacity-10"
                        style={{
                            width: `${40 + i * 20}px`,
                            height: `${40 + i * 20}px`,
                            background: `linear-gradient(135deg, #7c3aed, #6366f1)`,
                            top: `${10 + i * 15}%`,
                            left: `${5 + i * 16}%`,
                        }}
                    />
                ))}
            </div>

            <div className="relative mx-auto max-w-container grow px-4 md:px-8">
                <div className="flex w-full max-w-3xl flex-col items-center mx-auto gap-8 md:gap-12 text-center">
                    <div
                        className="nf-404 glitch text-[120px] font-bold leading-none text-brand-tertiary md:text-[180px]"
                        data-text="404"
                        style={{ opacity: 0 }}
                    >
                        404
                    </div>

                    <div className="flex flex-col gap-4 md:gap-6">
                        <div className="flex flex-col gap-3">
                            <span
                                className="nf-text text-md font-semibold text-brand-secondary"
                                style={{ opacity: 0 }}
                            >
                                Page not found
                            </span>
                            <h1
                                className="nf-text text-display-md font-semibold text-primary md:text-display-lg"
                                style={{ opacity: 0 }}
                            >
                                We can&apos;t find that page
                            </h1>
                        </div>
                        <p
                            className="nf-text text-lg text-tertiary md:text-xl"
                            style={{ opacity: 0 }}
                        >
                            Sorry, the page you are looking for doesn&apos;t exist or has been
                            moved.
                        </p>
                    </div>

                    <div className="nf-btn flex flex-col-reverse gap-3 sm:flex-row" style={{ opacity: 0 }}>
                        <Button
                            color="secondary"
                            size="xl"
                            iconLeading={ArrowLeft}
                            onClick={() => router(-1)}
                        >
                            Go back
                        </Button>
                        <Button size="xl" onClick={() => router("/" as any)}>
                            Take me home
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
}
