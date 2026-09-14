"use client";

import {
  Laptop,
  Moon,
  Sun,
} from "lucide-react";

import {
  useTheme,
} from "next-themes";

import {
  Button,
} from "@/components/ui/button";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


export function ThemeToggle() {
  const {
    setTheme,
  } = useTheme();


  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            size="icon"
            className={[
              "relative",
              "overflow-hidden",
              "border-primary/20",
              "bg-card/70",
              "shadow-sm",
              "backdrop-blur-xl",
              "hover:border-primary/40",
              "hover:bg-primary/8",
            ].join(" ")}
            aria-label="Change application theme"
          />
        }
      >
        <Sun
          className={[
            "size-4",
            "text-primary",
            "scale-100",
            "rotate-0",
            "transition-all",
            "duration-300",

            "dark:scale-0",
            "dark:-rotate-90",
          ].join(" ")}
        />

        <Moon
          className={[
            "absolute",
            "size-4",
            "text-primary",
            "scale-0",
            "rotate-90",
            "transition-all",
            "duration-300",

            "dark:scale-100",
            "dark:rotate-0",
          ].join(" ")}
        />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-40 rounded-xl border-border/80 p-1.5 shadow-xl"
      >
        <DropdownMenuItem
          className="rounded-lg"
          onClick={() =>
            setTheme(
              "light"
            )
          }
        >
          <Sun className="mr-2 size-4 text-primary" />

          Light
        </DropdownMenuItem>

        <DropdownMenuItem
          className="rounded-lg"
          onClick={() =>
            setTheme(
              "dark"
            )
          }
        >
          <Moon className="mr-2 size-4 text-primary" />

          Dark
        </DropdownMenuItem>

        <DropdownMenuItem
          className="rounded-lg"
          onClick={() =>
            setTheme(
              "system"
            )
          }
        >
          <Laptop className="mr-2 size-4 text-primary" />

          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}