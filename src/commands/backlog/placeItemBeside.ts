import { sql } from "drizzle-orm";
import type { BacklogDatabase } from "../../shared/db/Db";

type OrderRow = { id: number; origin: string; priority: number };

export async function placeItemBeside(
	db: BacklogDatabase,
	movedId: number,
	target: OrderRow,
	side: "before" | "after",
): Promise<void> {
	const bias = side === "before" ? 0 : 2;
	await db.execute(sql`
		UPDATE items i
		SET priority = r.rn
		FROM (
			SELECT id, ROW_NUMBER() OVER (
				ORDER BY
					CASE WHEN id = ${movedId} THEN ${target.priority} ELSE priority END,
					CASE WHEN id = ${movedId} THEN ${target.id} ELSE id END,
					CASE WHEN id = ${movedId} THEN ${bias} ELSE 1 END
			) AS rn
			FROM items
			WHERE origin = ${target.origin}
		) r
		WHERE i.id = r.id AND i.priority <> r.rn
	`);
}
