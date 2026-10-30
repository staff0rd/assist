import chalk from "chalk";
import { getDb } from "../../shared/db/getDb";
import { dbBackedConfigKeys, dbBackedRepoError } from "./dbBackedConfigKeys";
import { exitWithConfigErrors } from "./exitWithConfigErrors";

export async function unsetDbBackedConfigKey(
	key: string,
	useRepo: boolean,
): Promise<void> {
	if (useRepo) exitWithConfigErrors([dbBackedRepoError(key)]);
	const removed = await dbBackedConfigKeys[key].unset(await getDb());
	console.log(
		removed
			? chalk.green(`Unset ${key} (user (db))`)
			: chalk.yellow(`${key} is not set in user (db)`),
	);
}
