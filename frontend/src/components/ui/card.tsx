import * as React from "react";

import {
  cn,
} from "cn";


function Card({
  className,
  size = "default",
  ...props
}: React.ComponentProps<"div"> & {
  size?:
    | "default"
    | "sm";
}) {
  return (
    <div
      data-slot="card"
      data-size={size}
      className={cn(
        [
          "group/card",
          "flex",
          "flex-col",
          "gap-(--card-spacing)",
          "overflow-hidden",

          "rounded-2xl",

          "border",
          "border-border/80",

          "bg-card/92",
          "text-card-foreground",

          "shadow-[0_18px_60px_-42px_rgba(0,0,0,0.45)]",

          "backdrop-blur-xl",

          "transition-[border-color,box-shadow,transform]",
          "duration-300",

          "[--card-spacing:--spacing(5)]",

          "has-data-[slot=card-footer]:pb-0",

          "has-[>img:first-child]:pt-0",

          "data-[size=sm]:[--card-spacing:--spacing(4)]",

          "*:[img:first-child]:rounded-t-2xl",
          "*:[img:last-child]:rounded-b-2xl",
        ].join(" "),

        className
      )}
      {...props}
    />
  );
}


function CardHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        [
          "group/card-header",
          "@container/card-header",

          "grid",
          "auto-rows-min",
          "items-start",
          "gap-1.5",

          "px-(--card-spacing)",

          "has-data-[slot=card-action]:grid-cols-[1fr_auto]",
          "has-data-[slot=card-description]:grid-rows-[auto_auto]",

          "[.border-b]:pb-(--card-spacing)",
        ].join(" "),

        className
      )}
      {...props}
    />
  );
}


function CardTitle({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn(
        [
          "font-heading",
          "text-base",
          "font-semibold",
          "leading-snug",
          "tracking-[-0.02em]",

          "group-data-[size=sm]/card:text-sm",
        ].join(" "),

        className
      )}
      {...props}
    />
  );
}


function CardDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn(
        "text-sm leading-6 text-muted-foreground",
        className
      )}
      {...props}
    />
  );
}


function CardAction({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        [
          "col-start-2",
          "row-span-2",
          "row-start-1",
          "self-start",
          "justify-self-end",
        ].join(" "),

        className
      )}
      {...props}
    />
  );
}


function CardContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn(
        "px-(--card-spacing)",
        className
      )}
      {...props}
    />
  );
}


function CardFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn(
        [
          "flex",
          "items-center",

          "border-t",
          "border-border/70",

          "bg-muted/30",

          "p-(--card-spacing)",
        ].join(" "),

        className
      )}
      {...props}
    />
  );
}


export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
};