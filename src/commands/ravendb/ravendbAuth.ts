import chalk from "chalk";
import { createConnectionAuth } from "../../shared/createConnectionAuth";
import { loadConnections, saveConnections } from "./loadConnections";
import { promptConnection } from "./promptConnection";
import { ravendbSetConnection } from "./ravendbSetConnection";

export const ravendbAuth = createConnectionAuth({
	load: loadConnections,
	save: saveConnections,
	format: (c) =>
		`${chalk.bold(c.name)}  ${c.url}  db=${c.database}  key=${c.apiKeyRef}`,
	promptNew: promptConnection,
	onFirst: (c) => ravendbSetConnection(c.name),
});
