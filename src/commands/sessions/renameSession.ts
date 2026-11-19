import { actOnSession } from "./target/actOnSession";

export function renameSession(
	title: string,
	options: { id?: string } = {},
): Promise<void> {
	return actOnSession(options.id, "rename", (sessionId) => ({
		type: "rename",
		sessionId,
		title,
	}));
}
