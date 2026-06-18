"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { deleteFile, deleteFiles } from "@/lib/upload";
import type { Space, SpaceWithItems } from "@/lib/types";
import { customAlphabet } from "nanoid";
import { revalidatePath } from "next/cache";

const generateSlug = customAlphabet(
  "abcdefghijklmnopqrstuvwxyz0123456789",
  10
);

export async function createSpace(title?: string): Promise<Space> {
  const supabase = createAdminClient();
  const slug = generateSlug();

  const { data, error } = await supabase
    .from("spaces")
    .insert({
      slug,
      title: title?.trim() || "未命名空间",
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data as Space;
}

export async function getSpaceById(id: string): Promise<SpaceWithItems | null> {
  const supabase = createAdminClient();

  const { data: space, error: spaceError } = await supabase
    .from("spaces")
    .select("*")
    .eq("id", id)
    .single();

  if (spaceError || !space) return null;

  const { data: items, error: itemsError } = await supabase
    .from("items")
    .select("*")
    .eq("space_id", id)
    .order("sort_order", { ascending: true });

  if (itemsError) throw new Error(itemsError.message);

  return {
    ...(space as Space),
    items: (items ?? []).map((item) => ({
      ...item,
      position_x: Number(item.position_x),
      position_y: Number(item.position_y),
    })),
  };
}

export async function getPublishedSpaceBySlug(
  slug: string
): Promise<SpaceWithItems | null> {
  const supabase = createAdminClient();

  const { data: space, error: spaceError } = await supabase
    .from("spaces")
    .select("*")
    .eq("slug", slug)
    .eq("is_published", true)
    .single();

  if (spaceError || !space) return null;

  const { data: items, error: itemsError } = await supabase
    .from("items")
    .select("*")
    .eq("space_id", space.id)
    .order("sort_order", { ascending: true });

  if (itemsError) throw new Error(itemsError.message);

  return {
    ...(space as Space),
    items: (items ?? []).map((item) => ({
      ...item,
      position_x: Number(item.position_x),
      position_y: Number(item.position_y),
    })),
  };
}

export async function updateSpaceTitle(id: string, title: string) {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("spaces")
    .update({ title: title.trim() || "未命名空间" })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath(`/edit/${id}`);
}

export async function updateSpaceBackground(id: string, background_url: string) {
  const supabase = createAdminClient();

  const { data: space, error: fetchError } = await supabase
    .from("spaces")
    .select("background_url")
    .eq("id", id)
    .single();

  if (fetchError || !space) throw new Error("空间不存在");

  const { error } = await supabase
    .from("spaces")
    .update({ background_url })
    .eq("id", id);

  if (error) {
    await deleteFile(background_url);
    throw new Error(error.message);
  }

  if (space.background_url && space.background_url !== background_url) {
    await deleteFile(space.background_url);
  }

  revalidatePath(`/edit/${id}`);
}

export async function publishSpace(id: string) {
  const supabase = createAdminClient();

  const { data: space, error: fetchError } = await supabase
    .from("spaces")
    .select("slug, background_url")
    .eq("id", id)
    .single();

  if (fetchError || !space) throw new Error("空间不存在");
  if (!space.background_url) throw new Error("请先上传背景图");

  const { count, error: countError } = await supabase
    .from("items")
    .select("*", { count: "exact", head: true })
    .eq("space_id", id);

  if (countError) throw new Error(countError.message);
  if (!count) throw new Error("请至少添加一个物品");

  const { error } = await supabase
    .from("spaces")
    .update({ is_published: true })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath(`/edit/${id}`);
  revalidatePath(`/s/${space.slug}`);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return `${appUrl}/s/${space.slug}`;
}

export async function unpublishSpace(id: string) {
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("spaces")
    .update({ is_published: false })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath(`/edit/${id}`);
}

export async function deleteSpace(id: string) {
  const supabase = createAdminClient();

  const { data: space, error: spaceError } = await supabase
    .from("spaces")
    .select("background_url")
    .eq("id", id)
    .single();

  if (spaceError || !space) throw new Error("空间不存在");

  const { data: items, error: itemsError } = await supabase
    .from("items")
    .select("thumbnail_url")
    .eq("space_id", id);

  if (itemsError) throw new Error(itemsError.message);

  const { error: deleteError } = await supabase
    .from("spaces")
    .delete()
    .eq("id", id);

  if (deleteError) throw new Error(deleteError.message);

  await deleteFile(space.background_url);
  await deleteFiles((items ?? []).map((item) => item.thumbnail_url));

  revalidatePath(`/edit/${id}`);
}
