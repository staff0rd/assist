import { missingToolMessage } from "./missingToolMessage";

export function closeFailure(
	command: string,
	code: number | null,
	signal: NodeJS.Signals | null,
): string {
	if (signal) return `signal ${signal}`;
	const missing = missingToolMessage(command, code);
	return missing ? `exit ${code}: ${missing}` : `exit ${code}`;
}
