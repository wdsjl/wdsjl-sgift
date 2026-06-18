import { SpaceViewer } from "@/components/SpaceViewer";
import { getPublishedSpaceBySlug } from "@/lib/actions/spaces";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

interface ViewPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ViewPage({ params }: ViewPageProps) {
  const { slug } = await params;
  const space = await getPublishedSpaceBySlug(slug);

  if (!space) notFound();

  return <SpaceViewer space={space} />;
}
