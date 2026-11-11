import { inArray } from "drizzle-orm";
import { formatItemId, parseItemId } from "../backlog/formatItemId";
import { getReady } from "../backlog/shared";
import { items } from "../../shared/db/items";
import { harnessCapabilityDeclarations } from "../../shared/harnessAdapters/harnessCapabilityDeclarations";
import {
	harnessFollowUpCells,
	harnessFollowUpProblems,
} from "./harnessFollowUpProblems";
import { reportVerifyProblems } from "./reportVerifyProblems";

export async function harnessFollowUps(): Promise<void> {
	const cells = harnessFollowUpCells(harnessCapabilityDeclarations);
	const { orm } = await getReady();
	const rows = await orm
		.select({ id: items.id, status: items.status })
		.from(items)
		.where(inArray(items.id, [...cells.keys()].map(parseItemId)));
	const statuses = new Map(
		rows.map((row) => [formatItemId(row.id), row.status]),
	);
	reportVerifyProblems(
		harnessFollowUpProblems(cells, statuses),
		`All ${cells.size} follow-up items named by unsupported harness capabilities are open.`,
	);
}
