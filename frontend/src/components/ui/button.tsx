import {
  Button as ButtonPrimitive,
} from "@base-ui/react/button";

import {
  cva,
  type VariantProps,
} from "class-variance-authority";

import {
  cn,
} from "cn";


const buttonVariants = cva(
  [
    "group/button",
    "relative",
    "inline-flex",
    "shrink-0",
    "items-center",
    "justify-center",
    "whitespace-nowrap",
    "rounded-xl",
    "border",
    "border-transparent",
    "text-sm",
    "font-semibold",
    "tracking-[-0.01em]",
    "transition-all",
    "duration-200",
    "outline-none",
    "select-none",

    "focus-visible:border-ring",
    "focus-visible:ring-4",
    "focus-visible:ring-ring/20",

    "active:not-aria-[haspopup]:translate-y-px",

    "disabled:pointer-events-none",
    "disabled:opacity-50",

    "aria-invalid:border-destructive",
    "aria-invalid:ring-4",
    "aria-invalid:ring-destructive/15",

    "[&_svg]:pointer-events-none",
    "[&_svg]:shrink-0",
    "[&_svg:not([class*='size-'])]:size-4",
  ].join(" "),
  {
    variants: {
      variant: {
        default: [
          "border-primary/30",
          "bg-primary",
          "text-primary-foreground",

          "shadow-[0_10px_30px_-16px_var(--primary)]",

          "hover:-translate-y-0.5",
          "hover:bg-primary/90",
          "hover:shadow-[0_16px_38px_-18px_var(--primary)]",

          "active:translate-y-0",
        ].join(" "),

        outline: [
          "border-border",
          "bg-background/70",
          "text-foreground",
          "backdrop-blur-xl",

          "hover:border-primary/40",
          "hover:bg-primary/8",
          "hover:text-foreground",

          "dark:bg-background/40",
        ].join(" "),

        secondary: [
          "border-border/70",
          "bg-secondary",
          "text-secondary-foreground",

          "hover:bg-accent",
        ].join(" "),

        ghost: [
          "bg-transparent",
          "text-muted-foreground",

          "hover:bg-primary/8",
          "hover:text-foreground",
        ].join(" "),

        destructive: [
          "border-destructive/15",
          "bg-destructive/10",
          "text-destructive",

          "hover:bg-destructive/18",

          "focus-visible:border-destructive/40",
          "focus-visible:ring-destructive/15",
        ].join(" "),

        link: [
          "h-auto",
          "border-transparent",
          "bg-transparent",
          "px-0",
          "text-primary",

          "underline-offset-4",

          "hover:underline",
        ].join(" "),
      },

      size: {
        default:
          "h-10 gap-2 px-4",

        xs:
          "h-7 gap-1.5 rounded-lg px-2.5 text-xs [&_svg:not([class*='size-'])]:size-3",

        sm:
          "h-8 gap-1.5 rounded-lg px-3 text-xs [&_svg:not([class*='size-'])]:size-3.5",

        lg:
          "h-11 gap-2 px-5 text-sm",

        icon:
          "size-10",

        "icon-xs":
          "size-7 rounded-lg [&_svg:not([class*='size-'])]:size-3",

        "icon-sm":
          "size-8 rounded-lg [&_svg:not([class*='size-'])]:size-3.5",

        "icon-lg":
          "size-11",
      },
    },

    defaultVariants: {
      variant:
        "default",

      size:
        "default",
    },
  }
);


function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props &
  VariantProps<
    typeof buttonVariants
  >) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(
        buttonVariants({
          variant,
          size,
          className,
        })
      )}
      {...props}
    />
  );
}


export {
  Button,
  buttonVariants,
};