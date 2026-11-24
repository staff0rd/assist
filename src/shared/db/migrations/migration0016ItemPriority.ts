import type { Migration } from "./Migration";

const sql = `
	ALTER TABLE items ADD COLUMN IF NOT EXISTS priority INTEGER;

	UPDATE items i SET priority = r.rn
	FROM (
		SELECT id, ROW_NUMBER() OVER (PARTITION BY origin ORDER BY id) AS rn
		FROM items
	) r
	WHERE i.id = r.id AND i.priority IS NULL;

	CREATE SEQUENCE IF NOT EXISTS items_priority_seq OWNED BY items.priority;
	SELECT setval(
		'items_priority_seq',
		GREATEST(
			COALESCE((SELECT MAX(priority) FROM items), 0) + 1,
			(SELECT CASE WHEN is_called THEN last_value + 1 ELSE last_value END FROM items_priority_seq)
		),
		false
	);

	ALTER TABLE items ALTER COLUMN priority SET DEFAULT nextval('items_priority_seq');
	ALTER TABLE items ALTER COLUMN priority SET NOT NULL;
	CREATE INDEX IF NOT EXISTS items_origin_priority_idx ON items (origin, priority);
`;

export const migration0016ItemPriority: Migration = {
	id: 16,
	name: "item-priority",
	sql,
};
