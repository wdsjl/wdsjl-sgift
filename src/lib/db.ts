import type { Item, Space } from "@/lib/types";
import { Pool } from "pg";

let pool: Pool | null = null;

export function getPool(): Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL 环境变量未配置");
    }

    pool = new Pool({ connectionString });
  }

  return pool;
}

export async function query<T extends Record<string, unknown> = Record<string, unknown>>(
  text: string,
  params: unknown[] = []
) {
  return getPool().query<T>(text, params);
}

function toIsoString(value: unknown): string {
  if (value instanceof Date) return value.toISOString();
  return String(value);
}

export function mapSpace(row: Record<string, unknown>): Space {
  return {
    id: String(row.id),
    slug: String(row.slug),
    title: String(row.title),
    background_url: row.background_url ? String(row.background_url) : null,
    is_published: Boolean(row.is_published),
    created_at: toIsoString(row.created_at),
    updated_at: toIsoString(row.updated_at),
  };
}

export function mapItem(row: Record<string, unknown>): Item {
  return {
    id: String(row.id),
    space_id: String(row.space_id),
    title: String(row.title),
    description: String(row.description ?? ""),
    thumbnail_url: row.thumbnail_url ? String(row.thumbnail_url) : null,
    position_x: Number(row.position_x),
    position_y: Number(row.position_y),
    sort_order: Number(row.sort_order),
    created_at: toIsoString(row.created_at),
    updated_at: toIsoString(row.updated_at),
  };
}
