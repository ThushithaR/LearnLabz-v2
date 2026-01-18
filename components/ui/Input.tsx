"use client";

import { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
    ({ className, ...props }, ref) => {
        return (
            <input
                ref={ref}
                className={cn(
                    "flex h-10 w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm text-textPrimary placeholder:text-white/30 focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:cursor-not-allowed disabled:opacity-50 transition-all",
                    className
                )}
                {...props}
            />
        );
    }
);
Input.displayName = "Input";

export { Input };
