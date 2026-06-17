import { readStdin } from "../../lib/readStdin";
import { getDb } from "../../shared/db/getDb";
import { getCurrentOrigin } from "../backlog/getCurrentOrigin";
import { saveHandover } from "./saveHandover";

/** Read handover content from stdin and save it for the cwd's origin. */
export async function saveHandoverFromStdin(summary: string): Promise<void> {
	const content = await readStdin();
	const orm = await getDb();
	await saveHandover(orm, {
		origin: getCurrentOrigin(process.cwd()),
		summary,
		content,
	});
}
