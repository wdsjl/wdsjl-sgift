import { createSpace } from "@/lib/actions/spaces";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function CreatePage() {
  const space = await createSpace();
  redirect(`/edit/${space.id}`);
}
