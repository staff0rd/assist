import { getDb } from "../../shared/db/getDb";
import type { ConfigWriteScope } from "./ConfigWriteScope";
import { configScopeNames } from "./configScopeNames";
import { dbBackedConfigKeys } from "./dbBackedConfigKeys";

type DbBackedConfigWriteResult =
	| { ok: true; payload: Record<string, unknown> }
	| { ok: false; errors: string[] };

export async function applyDbBackedConfigWrite(
	key: string,
	scope: ConfigWriteScope,
	write: { value: unknown } | { unset: true },
): Promise<DbBackedConfigWriteResult> {
	const target = configScopeNames.user;
	if (scope !== "user")
		return {
			ok: false,
			errors: [`"${key}" is stored in ${target}; save it there`],
		};
	const handler = dbBackedConfigKeys[key];
	const db = await getDb();
	if ("unset" in write)
		return {
			ok: true,
			payload: { target, removed: await handler.unset(db) },
		};
	await handler.write(db, write.value);
	return { ok: true, payload: { target } };
}
