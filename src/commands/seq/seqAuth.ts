import chalk from "chalk";
import { createConnectionAuth } from "../../shared/createConnectionAuth";
import {
	loadConnections,
	saveConnections,
	setDefaultConnection,
} from "./loadConnections";
import { promptConnection } from "./promptConnection";

export const seqAuth = createConnectionAuth({
	load: loadConnections,
	save: saveConnections,
	format: (c) => `${chalk.bold(c.name)}  ${c.url}`,
	promptNew: promptConnection,
	onFirst: (c) => setDefaultConnection(c.name),
});
