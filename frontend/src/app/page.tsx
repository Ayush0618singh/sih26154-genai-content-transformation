import {
  LandingPage,
} from "@/components/landing/landing-page";

import {
  createClient,
} from "@/lib/supabase/server";


export const dynamic =
  "force-dynamic";


export default async function HomePage() {
  let signedIn =
    false;

  try {
    const supabase =
      await createClient();

    const {
      data,
    } =
      await supabase.auth.getClaims();

    signedIn =
      Boolean(
        data?.claims?.sub
      );
  } catch {
    signedIn =
      false;
  }

  return (
    <LandingPage
      signedIn={
        signedIn
      }
    />
  );
}