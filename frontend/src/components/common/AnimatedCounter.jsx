import { useEffect, useRef, useState } from "react";

export default function AnimatedCounter({ value, duration = 1000, suffix = "", prefix = "" }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const start = performance.now();
          const numericTarget = parseFloat(value);
          const animate = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setDisplay(numericTarget * eased);
            if (progress < 1) requestAnimationFrame(animate);
            else setDisplay(numericTarget);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value, duration]);

  const isDecimal = String(value).includes(".");
  const formatted = isDecimal ? display.toFixed(1) : Math.round(display).toLocaleString();

  return (
    <span ref={ref}>
      {prefix}{formatted}{suffix}
    </span>
  );
}