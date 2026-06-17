import { getDb } from "../../shared/db/getDb";
import { getCurrentOrigin } from "../backlog/getCurrentOrigin";
import { listPendingHandovers } from "./listPendingHandovers";

/** Print unrecalled handovers for the cwd's origin, one tab-separated row each. */
export async function printPendingHandovers(): Promise<void> {
	const orm = await getDb();
	const rows = await listPendingHandovers(orm, getCurrentOrigin(process.cwd()));
	for (const row of rows) {
		console.log(`${row.id}\t${row.createdAt.toISOString()}\t${row.summary}`);
	}
}
