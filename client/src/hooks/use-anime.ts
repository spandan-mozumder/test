import { useEffect, useRef, useCallback } from "react";
import { animate, stagger, createTimeline, type Animation } from "animejs";

export function useAnimeOnMount(
    selector: string,
    props: Record<string, any>,
    deps: any[] = []
) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;
        const targets = containerRef.current.querySelectorAll(selector);
        if (targets.length === 0) return;
        const anim = animate(targets, {
            ...props,
            autoplay: true,
        });
        return () => {
            anim.pause();
        };
    }, deps);

    return containerRef;
}

export function useStaggerReveal(
    selector: string,
    options?: { delay?: number; duration?: number; from?: string }
) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current) return;
        const targets = containerRef.current.querySelectorAll(selector);
        if (targets.length === 0) return;
        const anim = animate(targets, {
            opacity: [0, 1],
            translateY: [40, 0],
            delay: stagger(options?.delay ?? 80),
            duration: options?.duration ?? 700,
            ease: "outExpo",
        });
        return () => {
            anim.pause();
        };
    }, []);

    return containerRef;
}

export function useCountUp(
    targetValue: number,
    duration = 1500,
    prefix = ""
) {
    const ref = useRef<HTMLSpanElement>(null);
    const hasAnimated = useRef(false);

    useEffect(() => {
        if (!ref.current || hasAnimated.current) return;
        if (targetValue === 0 || isNaN(targetValue)) return;
        hasAnimated.current = true;

        const obj = { value: 0 };
        animate(obj, {
            value: targetValue,
            duration,
            ease: "outExpo",
            onUpdate: () => {
                if (ref.current) {
                    ref.current.textContent =
                        prefix + obj.value.toFixed(2);
                }
            },
        });
    }, [targetValue, duration, prefix]);

    return ref;
}

export function useScrollReveal(selector: string) {
    const containerRef = useRef<HTMLDivElement>(null);
    const hasRevealed = useRef(false);

    useEffect(() => {
        if (!containerRef.current || hasRevealed.current) return;
        const targets = containerRef.current.querySelectorAll(selector);
        if (targets.length === 0) return;

        // Set initial state
        targets.forEach((t) => {
            (t as HTMLElement).style.opacity = "0";
            (t as HTMLElement).style.transform = "translateY(30px)";
        });

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && !hasRevealed.current) {
                        hasRevealed.current = true;
                        animate(targets, {
                            opacity: [0, 1],
                            translateY: [30, 0],
                            delay: stagger(100),
                            duration: 800,
                            ease: "outExpo",
                        });
                        observer.disconnect();
                    }
                });
            },
            { threshold: 0.15 }
        );

        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    return containerRef;
}

export { animate, stagger, createTimeline };
