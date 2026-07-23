import chalk from "chalk";
import { applyAcMutations, hasAcMutations } from "./applyAcMutations";

type AcOptions = {
	ac?: string[];
	addAc?: string[];
	editAc?: string[];
	removeAc?: string;
};

type AcResolution = { ok: false } | { ok: true; ac: string[] | undefined };

export function resolveAcUpdate(
	options: AcOptions,
	currentCriteria: string[],
): AcResolution {
	if (!hasAcMutations(options)) return { ok: true, ac: options.ac };

	if (options.ac) {
		console.log(
			chalk.red("Cannot combine --ac with --add-ac/--edit-ac/--remove-ac."),
		);
		process.exitCode = 1;
		return { ok: false };
	}

	const mutation = applyAcMutations(currentCriteria, options);
	if (!mutation.ok) {
		console.log(chalk.red(mutation.error));
		process.exitCode = 1;
		return { ok: false };
	}

	return { ok: true, ac: mutation.criteria };
}
