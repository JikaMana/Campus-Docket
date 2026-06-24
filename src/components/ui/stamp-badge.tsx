import { cn } from "@/lib/utils"

export type ComplaintStatus =
  | "open"
  | "in_review"
  | "pending_info"
  | "resolved"
  | "closed"
  | "escalated"

interface StampBadgeProps {
  status: ComplaintStatus
  animate?: boolean
  size?: "sm" | "md" | "lg"
  className?: string
}

const statusConfig: Record<ComplaintStatus, { label: string; active: boolean }> = {
  open:         { label: "OPEN",        active: true  },
  in_review:    { label: "IN REVIEW",   active: true  },
  pending_info: { label: "PENDING",     active: true  },
  escalated:    { label: "ESCALATED",   active: true  },
  resolved:     { label: "RESOLVED",   active: false },
  closed:       { label: "CLOSED",      active: false },
}

const sizeConfig = {
  sm: { outer: "w-16 h-16", text: "text-[9px]", border: "border-[2.5px]", gap: "gap-0.5" },
  md: { outer: "w-24 h-24", text: "text-[11px]", border: "border-[3px]", gap: "gap-1" },
  lg: { outer: "w-32 h-32", text: "text-[13px]", border: "border-[4px]", gap: "gap-1.5" },
}

export function StampBadge({ status, animate = false, size = "md", className }: StampBadgeProps) {
  const { label, active } = statusConfig[status]
  const sz = sizeConfig[size]

  const activeColor = "border-terracotta-600 text-terracotta-600"
  const inactiveColor = "border-ink-700 text-ink-700"
  const colorClass = active ? activeColor : inactiveColor

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center select-none",
        sz.outer,
        animate && "stamp-animate",
        className
      )}
      style={{ clipPath: "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)" }}
    >
      {/* Outer stamp ring */}
      <div
        className={cn(
          "absolute inset-0 rounded-sm",
          sz.border,
          colorClass,
          "opacity-80"
        )}
        style={{ clipPath: "inherit" }}
      />
      {/* Inner ring */}
      <div
        className={cn(
          "absolute inset-[6px] rounded-sm",
          "border",
          colorClass,
          "opacity-40"
        )}
        style={{ clipPath: "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)" }}
      />
      {/* Label */}
      <span
        className={cn(
          "relative z-10 font-mono font-bold tracking-widest uppercase leading-tight text-center",
          sz.text,
          colorClass
        )}
        style={{ wordBreak: "break-word", maxWidth: "70%" }}
      >
        {label}
      </span>
    </div>
  )
}

/* Inline pill variant for table rows / compact views */
export function StatusPill({ status, className }: { status: ComplaintStatus; className?: string }) {
  const { label, active } = statusConfig[status]
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm px-2 py-0.5 text-[10px] font-mono font-semibold tracking-widest uppercase border",
        active
          ? "border-terracotta-600/60 text-terracotta-400 bg-terracotta-600/10"
          : "border-ink-700 text-text-muted bg-ink-800",
        className
      )}
    >
      {label}
    </span>
  )
}
