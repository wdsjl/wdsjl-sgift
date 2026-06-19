export interface Space {
  id: string;
  slug: string;
  title: string;
  background_url: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface Item {
  id: string;
  space_id: string;
  title: string;
  description: string;
  thumbnail_url: string | null;
  position_x: number;
  position_y: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface SpaceWithItems extends Space {
  items: Item[];
}
