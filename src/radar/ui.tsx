import {
  useEffect,
  useRef,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";
import { X } from "lucide-react";
import { useStore } from "./store";

/* -------------------------------------------------------------------- Button */

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "tertiary" | "destructive";
  size?: "default" | "lg" | "sm";
  block?: boolean;
  loading?: boolean;
  icon?: ReactNode;
};

export function Button({
  variant = "primary",
  size = "default",
  block,
  loading,
  icon,
  children,
  className = "",
  disabled,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={`btn btn--${variant} ${size === "lg" ? "btn--lg" : size === "sm" ? "btn--sm" : ""} ${
        block ? "btn--block" : ""
      } ${loading ? "btn--loading" : ""} ${className}`}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? <span className="spinner" aria-hidden /> : icon}
      {children}
    </button>
  );
}

/* -------------------------------------------------------------------- IconButton */

export function IconButton({
  label,
  badge,
  children,
  className = "",
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { label: string; badge?: number }) {
  return (
    <button
      className={`iconbtn ${badge ? "iconbtn--rel" : ""} ${className}`}
      aria-label={label}
      {...rest}
    >
      {children}
      {badge ? (
        <span className="iconbtn__badge" aria-hidden>
          {badge}
        </span>
      ) : null}
    </button>
  );
}

/* -------------------------------------------------------------------- Chip */

export function Chip({
  pressed,
  onToggle,
  children,
  disabled,
  ...rest
}: {
  pressed?: boolean;
  onToggle?: () => void;
  children: ReactNode;
  disabled?: boolean;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className="chip"
      aria-pressed={pressed}
      onClick={onToggle}
      disabled={disabled}
      {...rest}
    >
      {children}
    </button>
  );
}

/* -------------------------------------------------------------------- Sheet */

export function Sheet({
  title,
  onClose,
  children,
  labelledBy,
}: {
  title?: string;
  onClose: () => void;
  children: ReactNode;
  labelledBy?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const opener = useRef<Element | null>(null);

  useEffect(() => {
    opener.current = document.activeElement;
    const node = ref.current;
    // Focus first focusable element inside the sheet.
    const focusables = node?.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    focusables?.[0]?.focus();

    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
      if (e.key === "Tab" && focusables && focusables.length) {
        const list = Array.from(focusables);
        const first = list[0];
        const last = list[list.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    document.addEventListener("keydown", onKey, true);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey, true);
      document.body.style.overflow = "";
      (opener.current as HTMLElement | null)?.focus?.();
    };
  }, [onClose]);

  return (
    <div
      className="overlay"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        aria-label={labelledBy ? undefined : title}
        ref={ref}
      >
        <div className="sheet__grip" aria-hidden />
        {title ? (
          <div className="sheet__head">
            <h2 className="sheet__title" id={labelledBy}>
              {title}
            </h2>
            <IconButton label="Close" onClick={onClose}>
              <X size={20} aria-hidden />
            </IconButton>
          </div>
        ) : null}
        {children}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------- Skeleton */

export function Skeleton({ h = "1rem", w = "100%", radius }: { h?: string; w?: string; radius?: string }) {
  return (
    <span
      className="skeleton"
      aria-hidden
      style={{ display: "block", height: h, width: w, borderRadius: radius }}
    />
  );
}

/* -------------------------------------------------------------------- Feedback */

export function Feedback({
  icon,
  title,
  text,
  action,
  secondary,
}: {
  icon?: ReactNode;
  title: string;
  text?: string;
  action?: ReactNode;
  secondary?: ReactNode;
}) {
  return (
    <div className="feedback" role="status">
      {icon}
      <p className="feedback__title">{title}</p>
      {text ? <p className="feedback__text">{text}</p> : null}
      {action}
      {secondary}
    </div>
  );
}

/* -------------------------------------------------------------------- Toasts + live region */

export function ToastHost() {
  const { toasts, dismissToast, liveMessage } = useStore();
  return (
    <>
      <div className="visually-hidden" aria-live="polite" role="status">
        {liveMessage}
      </div>
      <div className="toastwrap">
        {toasts.map((t) => (
          <div className="toast" key={t.id}>
            <span>{t.message}</span>
            {t.undo ? (
              <button
                className="toast__undo"
                onClick={() => {
                  t.undo?.();
                  dismissToast(t.id);
                }}
              >
                Undo
              </button>
            ) : null}
          </div>
        ))}
      </div>
    </>
  );
}

/* -------------------------------------------------------------------- Radar mark */

export function RadarMark({ size = 32 }: { size?: number }) {
  return (
    <svg
      className="radarmark"
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden
      role="img"
    >
      <path
        d="M27 25A20 20 0 0 0 7 5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.45"
      />
      <path
        d="M20 25A13 13 0 0 0 7 12"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinecap="round"
        opacity="0.75"
      />
      <path
        d="M13 25A6 6 0 0 0 7 19"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinecap="round"
      />
      <circle className="signal" cx="7" cy="25" r="2.75" />
    </svg>
  );
}
