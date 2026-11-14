import type { Location } from "react-router";
import { sessionTitle } from "../../App/sessionTitle";
import type { SessionSocket } from "../../useSessionSocket";
import { backlogPageTitles } from "../PhoneBacklog/backlogPageTitles";
import { activePhoneTab } from "../PhoneTabBar/activePhoneTab";
import { transcriptTitle } from "../transcriptTitle";

type Sources = Pick<SessionSocket, "sessions" | "history">;

export function phonePageLabel(
	{ pathname, search }: Location,
	{ sessions, history }: Sources,
): string {
	const tab = activePhoneTab(pathname);
	if (tab) return tab.label;
	const [, section, id = "", page] = pathname.split("/");
	if (section === "session") {
		const session = sessions.find((s) => s.id === id);
		return session ? sessionTitle(session) : "Session";
	}
	if (section === "history") {
		const node = new URLSearchParams(search).get("node") ?? undefined;
		return transcriptTitle(
			history.find((h) => h.sessionId === id && h.node === node),
		);
	}
	if (page === "description" || page === "criteria")
		return backlogPageTitles[page];
	return id;
}
