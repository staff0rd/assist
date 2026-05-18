import { checkCliAvailable } from "../../shared/checkCliAvailable";

export function assertCliExists(cli: string): void {
	if (checkCliAvailable(cli)) return;
	console.error(`CLI "${cli}" not found in PATH`);
	process.exit(1);
}
