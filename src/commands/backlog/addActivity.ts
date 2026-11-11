import chalk from "chalk";
import { recordGitRef } from "../../shared/db/recordGitRef";
import { activityLink } from "./activityLink";
import { formatItemId } from "./formatItemId";
import { findOneItem } from "./shared";
import { gitRefKindSchema } from "./types";

const kindsAddableWithoutHumanApproval = gitRefKindSchema.exclude([
	"docs-unlock",
	"schema-unlock",
]);

export async function addActivity(
	id: string,
	kind: string,
	ref: string,
	options: { title?: string; url?: string; state?: string },
): Promise<void> {
	const parsedKind = kindsAddableWithoutHumanApproval.safeParse(kind);
	if (!parsedKind.success) {
		console.log(
			chalk.red(
				`Invalid kind "${kind}". Expected one of: ${kindsAddableWithoutHumanApproval.options.join(", ")}.`,
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
	await recordGitRef(orm, item.id, {
		kind: parsedKind.data,
		ref,
		...(await activityLink(parsedKind.data, ref, options)),
		state: options.state,
	});

	console.log(
		chalk.green(
			`Attached ${parsedKind.data} "${ref}" to item ${formatItemId(item.id)}.`,
		),
	);
}
