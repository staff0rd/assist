import { createProgram } from "./createProgram";
import { loadedDb } from "./shared/db/loadedDb";
import { isHelpRequested } from "./shared/isHelpRequested";
import { preloadHelpText } from "./shared/lazyHelpText";

async function parse(): Promise<void> {
	const program = createProgram();
	if (isHelpRequested(process.argv.slice(2))) await preloadHelpText();
	await program.parseAsync();
}

export function runCli(): Promise<void> {
	return parse()
		.catch(async (error: unknown) => {
			const { reportCliError } = await import("./reportCliError");
			reportCliError(error);
		})
		.finally(() => loadedDb.close?.());
}
