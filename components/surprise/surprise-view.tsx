"use client";

import type { SurprisePage } from "@/lib/types";
import { SurpriseReader } from "./surprise-reader";

export function SurpriseView({
  page,
  contactEmail,
}: {
  page: SurprisePage;
  contactEmail: string;
}) {
  return <SurpriseReader key={page.slug} page={page} contactEmail={contactEmail} />;
}
