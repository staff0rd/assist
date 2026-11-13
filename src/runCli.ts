import { createProgram } from "./createProgram";
import { reportCliError } from "./reportCliError";
import { closeDb } from "./shared/db/getDb";

export function runCli(): Promise<void> {
	return createProgram()
		.parseAsync()
		.then(() => undefined)
		.catch(reportCliError)
		.finally(() => closeDb());
}
