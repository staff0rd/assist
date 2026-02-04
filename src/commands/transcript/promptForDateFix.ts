import { renameSync } from "node:fs";
import { join } from "node:path";
import * as readline from "node:readline";
import { getDatePrefix } from "./shared";

function createReadlineInterface(): readline.Interface {
	return readline.createInterface({
		input: process.stdin,
		output: process.stdout,
	});
}

function askQuestion(
	rl: readline.Interface,
	question: string,
): Promise<string> {
	return new Promise((resolve) => {
		rl.question(question, (answer) => {
			resolve(answer.trim());
		});
	});
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

		let newPrefix: string | null = null;

		switch (choice) {
			case "1":
				newPrefix = getDatePrefix(0);
				break;
			case "2":
				newPrefix = getDatePrefix(-1);
				break;
			case "3": {
				const customDate = await askQuestion(rl, "Enter date (YYYY-MM-DD): ");
				if (/^\d{4}-\d{2}-\d{2}$/.test(customDate)) {
					newPrefix = customDate;
				} else {
					console.log("Invalid date format. Cancelling.");
					rl.close();
					return null;
				}
				break;
			}
			default:
				console.log("Cancelled.");
				rl.close();
				return null;
		}

		rl.close();

		if (newPrefix) {
			const newFilename = `${newPrefix}.${vttFile}`;
			const oldPath = join(vttDir, vttFile);
			const newPath = join(vttDir, newFilename);

			renameSync(oldPath, newPath);
			console.log(`Renamed to: ${newFilename}`);
			return newFilename;
		}

		return null;
	} catch (error) {
		rl.close();
		throw error;
	}
}
