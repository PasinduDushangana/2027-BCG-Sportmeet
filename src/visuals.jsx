import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";

export function AnimatedScore({ value }) {
  const element = useRef(null);
  const previous = useRef(0);
  const [shown, setShown] = useState(value);
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame;
    let observer;
    const finish = () => {
      cancelAnimationFrame(frame);
      previous.current = value;
      setShown(value);
    };
    if (preference.matches || document.documentElement.dataset.motion === "paused") {
      finish();
      return;
    }
    const animate = () => {
      const from = previous.current;
      const started = performance.now();
      const step = (now) => {
        const progress = Math.min((now - started) / 900, 1);
        setShown(
          Math.round(from + (value - from) * (1 - Math.pow(1 - progress, 3))),
        );
        if (progress < 1) frame = requestAnimationFrame(step);
        else previous.current = value;
      };
      frame = requestAnimationFrame(step);
    };
    observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          observer.disconnect();
          animate();
        }
      },
      { threshold: 0.2 },
    );
    observer.observe(element.current);
    preference.addEventListener("change", finish);
    window.addEventListener("bcg-motion-change", finish);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      preference.removeEventListener("change", finish);
      window.removeEventListener("bcg-motion-change", finish);
    };
  }, [value]);
  return (
    <span className="animated-score" ref={element} aria-label={String(value)}>
      <span aria-hidden="true">{shown}</span>
    </span>
  );
}

export function MotionEffects() {
  const location = useLocation();
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const targets = [
      ...document.querySelectorAll(
        ".section-heading, .championship-grid, .meet-numbers, .latest-card, .house-card, .event-card, .result-card, .insight-card, .standings-full, .next-event-inner",
      ),
    ];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.dataset.reveal = "visible";
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px 30px 0px" },
    );
    targets.forEach((element, index) => {
      element.dataset.reveal = "waiting";
      element.style.setProperty("--reveal-delay", `${(index % 3) * 55}ms`);
      observer.observe(element);
    });
    return () => {
      observer.disconnect();
      targets.forEach((element) => {
        delete element.dataset.reveal;
      });
    };
  }, [location.pathname, location.search]);
  useEffect(() => {
    let frame;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const length =
          document.documentElement.scrollHeight - window.innerHeight;
        document.documentElement.style.setProperty(
          "--page-progress",
          length > 0 ? String(window.scrollY / length) : "0",
        );
      });
    };
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [location.pathname]);
  return <div className="reading-progress" aria-hidden="true" />;
}
