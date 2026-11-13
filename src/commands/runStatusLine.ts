import { statusLine } from "./statusLine";

export async function runStatusLine(): Promise<void> {
	try {
		await statusLine();
	} catch (error) {
		console.error(error);
		process.exitCode = 1;
	}
}
