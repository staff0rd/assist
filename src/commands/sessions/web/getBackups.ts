import type { IncomingMessage, ServerResponse } from "node:http";
import { getDb } from "../../../shared/db/getDb";
import { listBackups } from "../../../shared/db/listBackups";
import { respondJson } from "../../../shared/web";

/** Recorded database backups, newest first, for the backups page. */
export async function getBackups(
	_req: IncomingMessage,
	res: ServerResponse,
): Promise<void> {
	respondJson(res, 200, await listBackups(await getDb()));
}
