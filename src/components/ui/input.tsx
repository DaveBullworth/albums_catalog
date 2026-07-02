import { forwardRef } from "react";
import { cn } from "@/lib/utils";

const base =
  "w-full rounded-xl border border-line bg-bg-2/60 px-3.5 text-sm text-text placeholder:text-dim " +
  "transition outline-none focus:border-accent/60 focus:ring-2 focus:ring-accent/25 " +
  "disabled:opacity-50";

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return <input ref={ref} className={cn(base, "h-11", className)} {...props} />;
  },
);

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className, ...props }, ref) {
  return (
    <textarea ref={ref} className={cn(base, "min-h-24 resize-y py-2.5", className)} {...props} />
  );
});
