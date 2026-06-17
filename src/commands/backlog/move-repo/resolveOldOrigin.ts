import type { Db } from "../../../shared/db/Db";
import { items } from "../../../shared/db/schema";

type Resolution = { origin: string } | { error: string };

/**
 * Resolve user input to a single stored origin. An exact match wins; otherwise
 * a bare repo name resolves when exactly one stored origin ends with
 * `/<input>` (case-insensitive, since stored paths preserve case).
 */
export async function resolveOldOrigin(
	orm: Db,
	input: string,
): Promise<Resolution> {
	const rows = await orm.selectDistinct({ origin: items.origin }).from(items);
	const origins = rows.map((r) => r.origin);
	if (origins.includes(input)) return { origin: input };

	const suffix = `/${input.toLowerCase()}`;
	const candidates = origins.filter((o) => o.toLowerCase().endsWith(suffix));
	if (candidates.length === 1) return { origin: candidates[0] };
	if (candidates.length > 1) {
		return {
			error: `Multiple origins match "${input}":\n  ${candidates.join("\n  ")}\nPass the full origin.`,
		};
	}
	return { error: `No backlog items found under origin "${input}".` };
}
