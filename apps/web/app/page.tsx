import { SectionRenderer } from "@/components/SectionRenderer";
import { getSiteShellData } from "@/lib/shell";
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";

export default async function HomePage() {
  const preview = (await draftMode()).isEnabled;
  const shell = await getSiteShellData(preview);

  if (!shell.homePage) {
    notFound();
  }

  return <SectionRenderer sections={shell.homePage.sections} />;
}
