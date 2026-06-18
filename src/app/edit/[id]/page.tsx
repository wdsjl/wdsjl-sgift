import { SpaceEditor } from "@/components/SpaceEditor";
import { getSpaceById } from "@/lib/actions/spaces";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

interface EditPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPage({ params }: EditPageProps) {
  const { id } = await params;
  const space = await getSpaceById(id);

  if (!space) notFound();

  return <SpaceEditor space={space} />;
}
