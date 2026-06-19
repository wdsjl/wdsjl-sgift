"use server";

import { mapItem, mapSpace, query } from "@/lib/db";
import { deleteFile, deleteFiles } from "@/lib/upload";
import type { Space, SpaceWithItems } from "@/lib/types";
import { customAlphabet } from "nanoid";
import { revalidatePath } from "next/cache";

const generateSlug = customAlphabet(
  "abcdefghijklmnopqrstuvwxyz0123456789",
  10
);

export async function createSpace(title?: string): Promise<Space> {
  const slug = generateSlug();
  const spaceTitle = title?.trim() || "未命名空间";

  const { rows } = await query(
    `INSERT INTO spaces (slug, title)
     VALUES ($1, $2)
     RETURNING *`,
    [slug, spaceTitle]
  );

  return mapSpace(rows[0]);
}

export async function getSpaceById(id: string): Promise<SpaceWithItems | null> {
  const { rows: spaceRows } = await query(
    `SELECT * FROM spaces WHERE id = $1`,
    [id]
  );

  if (spaceRows.length === 0) return null;

  const { rows: itemRows } = await query(
    `SELECT * FROM items WHERE space_id = $1 ORDER BY sort_order ASC`,
    [id]
  );

  return {
    ...mapSpace(spaceRows[0]),
    items: itemRows.map(mapItem),
  };
}

export async function getPublishedSpaceBySlug(
  slug: string
): Promise<SpaceWithItems | null> {
  const { rows: spaceRows } = await query(
    `SELECT * FROM spaces WHERE slug = $1 AND is_published = true`,
    [slug]
  );

  if (spaceRows.length === 0) return null;

  const space = mapSpace(spaceRows[0]);

  const { rows: itemRows } = await query(
    `SELECT * FROM items WHERE space_id = $1 ORDER BY sort_order ASC`,
    [space.id]
  );

  return {
    ...space,
    items: itemRows.map(mapItem),
  };
}

export async function updateSpaceTitle(id: string, title: string) {
  const { rowCount } = await query(
    `UPDATE spaces SET title = $1 WHERE id = $2`,
    [title.trim() || "未命名空间", id]
  );

  if (!rowCount) throw new Error("空间不存在");
  revalidatePath(`/edit/${id}`);
}

export async function updateSpaceBackground(id: string, background_url: string) {
  const { rows } = await query(
    `SELECT background_url FROM spaces WHERE id = $1`,
    [id]
  );

  if (rows.length === 0) throw new Error("空间不存在");

  const oldUrl = rows[0].background_url as string | null;

  const { rowCount } = await query(
    `UPDATE spaces SET background_url = $1 WHERE id = $2`,
    [background_url, id]
  );

  if (!rowCount) {
    await deleteFile(background_url);
    throw new Error("空间不存在");
  }

  if (oldUrl && oldUrl !== background_url) {
    await deleteFile(oldUrl);
  }

  revalidatePath(`/edit/${id}`);
}

export async function publishSpace(id: string) {
  const { rows } = await query(
    `SELECT slug, background_url FROM spaces WHERE id = $1`,
    [id]
  );

  if (rows.length === 0) throw new Error("空间不存在");

  const space = rows[0];
  if (!space.background_url) throw new Error("请先上传背景图");

  const { rows: countRows } = await query<{ count: string }>(
    `SELECT COUNT(*)::text AS count FROM items WHERE space_id = $1`,
    [id]
  );

  const itemCount = Number(countRows[0]?.count ?? 0);
  if (!itemCount) throw new Error("请至少添加一个物品");

  await query(`UPDATE spaces SET is_published = true WHERE id = $1`, [id]);

  revalidatePath(`/edit/${id}`);
  revalidatePath(`/s/${space.slug}`);

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return `${appUrl}/s/${space.slug}`;
}

export async function unpublishSpace(id: string) {
  const { rowCount } = await query(
    `UPDATE spaces SET is_published = false WHERE id = $1`,
    [id]
  );

  if (!rowCount) throw new Error("空间不存在");
  revalidatePath(`/edit/${id}`);
}

export async function deleteSpace(id: string) {
  const { rows: spaceRows } = await query(
    `SELECT background_url FROM spaces WHERE id = $1`,
    [id]
  );

  if (spaceRows.length === 0) throw new Error("空间不存在");

  const { rows: itemRows } = await query(
    `SELECT thumbnail_url FROM items WHERE space_id = $1`,
    [id]
  );

  const { rowCount } = await query(`DELETE FROM spaces WHERE id = $1`, [id]);

  if (!rowCount) throw new Error("空间删除失败");

  await deleteFile(spaceRows[0].background_url as string | null);
  await deleteFiles(itemRows.map((row) => row.thumbnail_url as string | null));

  revalidatePath(`/edit/${id}`);
}
