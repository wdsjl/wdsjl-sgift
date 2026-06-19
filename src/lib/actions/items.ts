"use server";

import { mapItem, query } from "@/lib/db";
import { deleteFile } from "@/lib/upload";
import type { Item } from "@/lib/types";
import { revalidatePath } from "next/cache";

export async function createItem(spaceId: string): Promise<Item> {
  const { rows: countRows } = await query<{ count: string }>(
    `SELECT COUNT(*)::text AS count FROM items WHERE space_id = $1`,
    [spaceId]
  );

  const sortOrder = Number(countRows[0]?.count ?? 0);

  const { rows } = await query(
    `INSERT INTO items (space_id, title, position_x, position_y, sort_order)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [spaceId, "新物品", 50, 50, sortOrder]
  );

  revalidatePath(`/edit/${spaceId}`);
  return mapItem(rows[0]);
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
  const fields: string[] = [];
  const values: unknown[] = [];
  let index = 1;

  if (updates.title !== undefined) {
    fields.push(`title = $${index++}`);
    values.push(updates.title);
  }
  if (updates.description !== undefined) {
    fields.push(`description = $${index++}`);
    values.push(updates.description);
  }
  if (updates.position_x !== undefined) {
    fields.push(`position_x = $${index++}`);
    values.push(updates.position_x);
  }
  if (updates.position_y !== undefined) {
    fields.push(`position_y = $${index++}`);
    values.push(updates.position_y);
  }

  if (fields.length === 0) return;

  values.push(itemId);

  const { rowCount } = await query(
    `UPDATE items SET ${fields.join(", ")} WHERE id = $${index}`,
    values
  );

  if (!rowCount) throw new Error("物品不存在");
  revalidatePath(`/edit/${spaceId}`);
}

export async function updateItemThumbnail(
  itemId: string,
  spaceId: string,
  thumbnail_url: string
) {
  const { rows } = await query(
    `SELECT thumbnail_url FROM items WHERE id = $1`,
    [itemId]
  );

  if (rows.length === 0) throw new Error("物品不存在");

  const oldUrl = rows[0].thumbnail_url as string | null;

  const { rowCount } = await query(
    `UPDATE items SET thumbnail_url = $1 WHERE id = $2`,
    [thumbnail_url, itemId]
  );

  if (!rowCount) {
    await deleteFile(thumbnail_url);
    throw new Error("物品不存在");
  }

  if (oldUrl && oldUrl !== thumbnail_url) {
    await deleteFile(oldUrl);
  }

  revalidatePath(`/edit/${spaceId}`);
}

export async function deleteItem(itemId: string, spaceId: string) {
  const { rows } = await query(
    `SELECT thumbnail_url FROM items WHERE id = $1`,
    [itemId]
  );

  const { rowCount } = await query(`DELETE FROM items WHERE id = $1`, [itemId]);

  if (!rowCount) throw new Error("物品不存在");

  await deleteFile(rows[0]?.thumbnail_url as string | null);
  revalidatePath(`/edit/${spaceId}`);
}
