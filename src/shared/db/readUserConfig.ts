import type { BacklogDatabase } from "./Db";
import { userConfig } from "./userConfig";

export async function readUserConfig(
	orm: BacklogDatabase,
): Promise<Record<string, unknown>> {
	const [row] = await orm.select().from(userConfig);
	return row?.config ?? {};
}
