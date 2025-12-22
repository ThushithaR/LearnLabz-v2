"use client";

import { HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface ProgressBarProps extends HTMLAttributes<HTMLDivElement> {
    value: number; // 0 to 100
    color?: string;
}

const ProgressBar = forwardRef<HTMLDivElement, ProgressBarProps>(
    ({ className, value, color = "bg-accent", ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    "h-2 w-full overflow-hidden rounded-full bg-black/30",
                    className
                )}
                {...props}
            >
                <div
                    className={cn("h-full transition-all duration-500 ease-out", color)}
                    style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
                />
            </div>
        );
    }
);
ProgressBar.displayName = "ProgressBar";

export { ProgressBar };
