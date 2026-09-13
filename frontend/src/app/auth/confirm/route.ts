import {
  NextResponse,
} from "next/server";

import type {
  EmailOtpType,
} from "@supabase/supabase-js";

import {
  createClient,
} from "@/lib/supabase/server";


export async function GET(
  request: Request
) {
  const requestUrl =
    new URL(
      request.url
    );

  const tokenHash =
    requestUrl.searchParams.get(
      "token_hash"
    );

  const type =
    requestUrl.searchParams.get(
      "type"
    ) as EmailOtpType | null;

  const next =
    requestUrl.searchParams.get(
      "next"
    ) ?? "/dashboard";

  if (
    tokenHash &&
    type
  ) {
    const supabase =
      await createClient();

    const {
      error,
    } =
      await supabase.auth.verifyOtp(
        {
          type,
          token_hash:
            tokenHash,
        }
      );

    if (!error) {
      const safeNext =
        next.startsWith("/") &&
        !next.startsWith("//")
          ? next
          : "/dashboard";

      return NextResponse.redirect(
        new URL(
          safeNext,
          requestUrl.origin
        )
      );
    }
  }

  return NextResponse.redirect(
    new URL(
      "/login?error=confirmation_failed",
      requestUrl.origin
    )
  );
}