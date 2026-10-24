import { cn } from "@/lib/utils";

/** Rounded green square with a smiling plate. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground",
        className,
      )}
      aria-hidden="true"
    >
      <svg viewBox="0 0 32 32" className="size-[62%]" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
        <path d="M4 13h24" />
        <path d="M6 13a10 10 0 0 0 20 0" />
        <circle cx="12" cy="8" r="0.6" fill="currentColor" />
        <circle cx="20" cy="8" r="0.6" fill="currentColor" />
        <path d="M12.5 17.5c1.9 1.6 5.1 1.6 7 0" />
      </svg>
    </span>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-3", className)}>
      <LogoMark />
      <span className="font-serif text-2xl font-semibold tracking-tight text-primary">VitalStim</span>
    </span>
  );
}
