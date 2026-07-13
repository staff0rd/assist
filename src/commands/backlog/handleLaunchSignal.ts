import chalk from "chalk";
import { next } from "./next";
import { readSignal } from "./readSignal";
import { cleanupSignal } from "./resolvePhaseResult";
import { surfaceCreatedItem } from "./surfaceCreatedItem";
import { tryRunById } from "./tryRunById";

// Acts on the signal a launched run leaves behind: surface a created item, or
// chain into the next item (by id when known, otherwise `assist next`).
export async function handleLaunchSignal(
	slashCommand: string,
	once?: boolean,
): Promise<void> {
	const signal = readSignal();
	cleanupSignal();

	try {
		if (
			signal?.event === "done" &&
			typeof signal.id === "string" &&
			signal.id
		) {
			await surfaceCreatedItem(slashCommand, signal.id);
		}

		if (signal?.event === "next") {
			if (typeof signal.id === "string" && signal.id) {
				if (await tryRunById(signal.id, { allowEdits: true })) return;
			}
			console.log(chalk.bold("\nChaining into assist next...\n"));
			await next({ allowEdits: true, once });
		}
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		console.error(
			chalk.yellow(
				`\nCould not complete post-run step (${message}).\nThis is usually a transient database/network blip — the work is saved and the session is safe to resume.`,
			),
		);
	}
}
