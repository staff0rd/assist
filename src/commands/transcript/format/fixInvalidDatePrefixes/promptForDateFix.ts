import { renameSync } from "node:fs";
import { join } from "node:path";
import type readline from "node:readline";
import {
	askQuestion,
	createReadlineInterface,
	getDatePrefix,
} from "../../shared";

async function resolveDate(
	rl: readline.Interface,
	choice: string,
): Promise<string | null> {
	if (choice === "1") return getDatePrefix(0);
	if (choice === "2") return getDatePrefix(-1);
	if (choice === "3") {
		const customDate = await askQuestion(rl, "Enter date (YYYY-MM-DD): ");
		if (/^\d{4}-\d{2}-\d{2}$/.test(customDate)) return customDate;
		console.log("Invalid date format. Cancelling.");
		return null;
	}
	console.log("Cancelled.");
	return null;
}

function renameWithPrefix(
	vttDir: string,
	vttFile: string,
	prefix: string,
): string {
	const newFilename = `${prefix}.${vttFile}`;
	renameSync(join(vttDir, vttFile), join(vttDir, newFilename));
	console.log(`Renamed to: ${newFilename}`);
	return newFilename;
}

export async function promptForDateFix(
	vttFile: string,
	vttDir: string,
): Promise<string | null> {
	const rl = createReadlineInterface();

	console.log(
		`\nError: File "${vttFile}" does not start with YYYY-MM-DD format.`,
	);
	console.log("\nOptions:");
	console.log("  1. Use today's date");
	console.log("  2. Use yesterday's date");
	console.log("  3. Enter your own date");
	console.log("  4. Cancel");

	try {
		const choice = await askQuestion(rl, "\nSelect an option (1/2/3/4): ");
		const prefix = await resolveDate(rl, choice);
		rl.close();

		return prefix ? renameWithPrefix(vttDir, vttFile, prefix) : null;
	} catch (error) {
		rl.close();
		throw error;
	}
}
