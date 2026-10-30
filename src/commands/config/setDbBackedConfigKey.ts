import chalk from "chalk";
import { getDb } from "../../shared/db/getDb";
import { dbBackedConfigKeys, dbBackedRepoError } from "./dbBackedConfigKeys";
import { exitWithConfigErrors } from "./exitWithConfigErrors";

export async function setDbBackedConfigKey(
	key: string,
	value: unknown,
	useRepo: boolean,
): Promise<void> {
	if (useRepo) exitWithConfigErrors([dbBackedRepoError(key)]);
	await dbBackedConfigKeys[key].write(await getDb(), value);
	console.log(chalk.green(`Set ${key} = ${JSON.stringify(value)} (user (db))`));
}
