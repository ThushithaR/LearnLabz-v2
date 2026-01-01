"use client";

import { HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
    variant?: "default" | "accent" | "outline" | "success" | "warning" | "secondary";
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
    ({ className, variant = "default", ...props }, ref) => {
        return (
            <span
                ref={ref}
                className={cn(
                    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                    {
                        "bg-surface text-textPrimary": variant === "default",
                        "bg-accent text-background": variant === "accent",
                        "text-textPrimary border border-white/20": variant === "outline",
                        "bg-green-500/10 text-green-400 border border-green-500/20": variant === "success",
                        "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20": variant === "warning",
                        "bg-white/10 text-textSecondary border border-white/5": variant === "secondary",
                    },
                    className
                )}
                {...props}
            />
        );
    }
);
Badge.displayName = "Badge";

export { Badge };
