"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { deleteFile } from "@/lib/upload";
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

export async function updateItemThumbnail(
  itemId: string,
  spaceId: string,
  thumbnail_url: string
) {
  const supabase = createAdminClient();

  const { data: item, error: fetchError } = await supabase
    .from("items")
    .select("thumbnail_url")
    .eq("id", itemId)
    .single();

  if (fetchError || !item) throw new Error("物品不存在");

  const { error } = await supabase
    .from("items")
    .update({ thumbnail_url })
    .eq("id", itemId);

  if (error) {
    await deleteFile(thumbnail_url);
    throw new Error(error.message);
  }

  if (item.thumbnail_url && item.thumbnail_url !== thumbnail_url) {
    await deleteFile(item.thumbnail_url);
  }

  revalidatePath(`/edit/${spaceId}`);
}

export async function deleteItem(itemId: string, spaceId: string) {
  const supabase = createAdminClient();

  const { data: item, error: fetchError } = await supabase
    .from("items")
    .select("thumbnail_url")
    .eq("id", itemId)
    .single();

  if (fetchError) throw new Error(fetchError.message);

  const { error } = await supabase.from("items").delete().eq("id", itemId);

  if (error) throw new Error(error.message);

  await deleteFile(item?.thumbnail_url);
  revalidatePath(`/edit/${spaceId}`);
}
