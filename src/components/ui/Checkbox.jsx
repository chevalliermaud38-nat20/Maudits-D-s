import { cn } from "../../lib/utils"

export function Checkbox({ className, checked, onChange, ...props }) {
  return (
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className={cn(
        "h-4 w-4 rounded border border-input ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}
