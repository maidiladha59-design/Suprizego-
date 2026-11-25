import Link from "next/link";
import { ArrowRightIcon, SparkleIcon } from "@/components/ui/icons";

export function AnnouncementBar() {
  return (
    <div className="border-b-[3px] border-ink bg-sun">
      <Link
        href="/buat"
        className="mx-auto flex min-h-11 w-full max-w-6xl items-center justify-center gap-2 px-4 py-2.5 text-center text-[12px] font-semibold leading-snug text-ink sm:text-sm"
      >
        <SparkleIcon className="size-3.5 shrink-0" />
        <span>Tanggal penting sudah dekat? Siapkan kejutannya dari sekarang.</span>
        <ArrowRightIcon className="hidden size-4 shrink-0 sm:block" />
      </Link>
    </div>
  );
}
