import chalk from "chalk";
import { recordGitRef } from "../../shared/db/recordGitRef";
import { gitRefUrl } from "../../shared/gitRefUrl";
import { formatItemId } from "./formatItemId";
import { findOneItem } from "./shared";
import { gitRefKindSchema } from "./types";

export async function addActivity(
	id: string,
	kind: string,
	ref: string,
	options: { title?: string; url?: string; state?: string },
): Promise<void> {
	const parsedKind = gitRefKindSchema.safeParse(kind);
	if (!parsedKind.success) {
		console.log(
			chalk.red(
				`Invalid kind "${kind}". Expected one of: ${gitRefKindSchema.options.join(", ")}.`,
			),
		);
		process.exitCode = 1;
		return;
	}

	const found = await findOneItem(id);
	if (!found) {
		process.exitCode = 1;
		return;
	}

	const { orm, item } = found;
	const url =
		options.url ??
		(parsedKind.data === "branch" || parsedKind.data === "commit"
			? gitRefUrl(parsedKind.data, ref)
			: undefined);

	await recordGitRef(orm, item.id, {
		kind: parsedKind.data,
		ref,
		title: options.title,
		url,
		state: options.state,
	});

	console.log(
		chalk.green(
			`Attached ${parsedKind.data} "${ref}" to item ${formatItemId(item.id)}.`,
		),
	);
}
