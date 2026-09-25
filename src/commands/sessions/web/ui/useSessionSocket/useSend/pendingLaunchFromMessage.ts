import type { NewLaunchInput } from "../../PendingLaunch";

export function pendingLaunchFromMessage(msg: object): NewLaunchInput | null {
	const m = msg as {
		type?: string;
		cwd?: string;
		prompt?: string;
		title?: string;
		design?: boolean;
	};
	if (m.type === "create")
		return {
			cwd: m.cwd,
			title:
				m.prompt?.trim() || (m.design ? "New design session" : "New session"),
		};
	if (m.type === "create-assist") {
		const title = m.title?.trim();
		return { cwd: m.cwd, title: title || "New session", named: !!title };
	}
	return null;
}
