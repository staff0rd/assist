import chalk from "chalk";
import { eq } from "drizzle-orm";
import { items } from "../../../shared/db/schema";
import { normalizeOrigin } from "../getCurrentOrigin";
import { getOrigin, getReady } from "../shared";
import { confirmMove, pluralItems } from "./confirmMove";
import { countByOrigin } from "./countByOrigin";
import { resolveOldOrigin } from "./resolveOldOrigin";

type MoveRepoOptions = { yes?: boolean };

function fail(message: string): void {
	console.log(chalk.red(message));
	process.exitCode = 1;
}

/**
 * Retag every backlog item from one origin to another, reconciling items
 * stranded under a stale origin after a repository rename. When the
 * destination is omitted it is inferred from the current repository's remote.
 * A bare repo name is accepted for the old origin when it unambiguously
 * matches a single stored origin.
 */
export async function moveRepo(
	oldOriginRaw: string,
	newOriginRaw: string | undefined,
	options: MoveRepoOptions = {},
): Promise<void> {
	const newOrigin = newOriginRaw ? normalizeOrigin(newOriginRaw) : getOrigin();

	const { orm } = await getReady();
	const resolved = await resolveOldOrigin(orm, normalizeOrigin(oldOriginRaw));
	if ("error" in resolved) return fail(resolved.error);

	const oldOrigin = resolved.origin;
	if (oldOrigin === newOrigin) {
		return fail(
			`Old and new origins both resolve to "${oldOrigin}"; nothing to move.`,
		);
	}
	const cnt = await countByOrigin(orm, oldOrigin);

	if (!options.yes && !(await confirmMove(cnt, oldOrigin, newOrigin))) {
		console.log(chalk.yellow("Move cancelled; no changes made."));
		return;
	}

	await orm
		.update(items)
		.set({ origin: newOrigin })
		.where(eq(items.origin, oldOrigin));

	console.log(
		chalk.green(
			`Moved ${pluralItems(cnt)} from "${oldOrigin}" to "${newOrigin}".`,
		),
	);
}
