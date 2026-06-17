import { getDb } from "../../shared/db/getDb";
import { getCurrentOrigin } from "../backlog/getCurrentOrigin";
import { recallHandover } from "./recallHandover";

/**
 * Recall an unrecalled handover for the cwd's origin and print its content.
 * Recalls the most recent note by default, or the one with `id` when given.
 */
export async function recallAndPrint(id?: number): Promise<void> {
	const orm = await getDb();
	const content = await recallHandover(
		orm,
		getCurrentOrigin(process.cwd()),
		id,
	);
	if (content !== undefined) console.log(content);
}
