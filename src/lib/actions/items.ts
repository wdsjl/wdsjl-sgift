"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import {
  buildImagePath,
  getExtensionFromFile,
  getPublicImageUrl,
} from "@/lib/storage";
import type { Item } from "@/lib/types";
import { revalidatePath } from "next/cache";

export async function createItem(spaceId: string): Promise<Item> {
  const supabase = createAdminClient();

  const { count } = await supabase
    .from("items")
    .select("*", { count: "exact", head: true })
    .eq("space_id", spaceId);

  const { data, error } = await supabase
    .from("items")
    .insert({
      space_id: spaceId,
      title: "新物品",
      position_x: 50,
      position_y: 50,
      sort_order: count ?? 0,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  revalidatePath(`/edit/${spaceId}`);

  return {
    ...(data as Item),
    position_x: Number(data.position_x),
    position_y: Number(data.position_y),
  };
}

export async function updateItem(
  itemId: string,
  spaceId: string,
  updates: {
    title?: string;
    description?: string;
    position_x?: number;
    position_y?: number;
  }
) {
  const supabase = createAdminClient();

  const payload: Record<string, string | number> = {};
  if (updates.title !== undefined) payload.title = updates.title;
  if (updates.description !== undefined)
    payload.description = updates.description;
  if (updates.position_x !== undefined) payload.position_x = updates.position_x;
  if (updates.position_y !== undefined) payload.position_y = updates.position_y;

  const { error } = await supabase
    .from("items")
    .update(payload)
    .eq("id", itemId);

  if (error) throw new Error(error.message);
  revalidatePath(`/edit/${spaceId}`);
}

export async function uploadItemThumbnail(
  itemId: string,
  spaceId: string,
  formData: FormData
) {
  const file = formData.get("file") as File | null;
  if (!file) throw new Error("请选择图片文件");

  const supabase = createAdminClient();
  const extension = getExtensionFromFile(file);
  const path = buildImagePath("thumbnails", spaceId, extension);
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await supabase.storage
    .from("images")
    .upload(path, buffer, { contentType: file.type, upsert: false });

  if (uploadError) throw new Error(uploadError.message);

  const thumbnail_url = getPublicImageUrl(path);

  const { error } = await supabase
    .from("items")
    .update({ thumbnail_url })
    .eq("id", itemId);

  if (error) throw new Error(error.message);

  revalidatePath(`/edit/${spaceId}`);
  return thumbnail_url;
}

export async function deleteItem(itemId: string, spaceId: string) {
  const supabase = createAdminClient();

  const { error } = await supabase.from("items").delete().eq("id", itemId);

  if (error) throw new Error(error.message);
  revalidatePath(`/edit/${spaceId}`);
}
