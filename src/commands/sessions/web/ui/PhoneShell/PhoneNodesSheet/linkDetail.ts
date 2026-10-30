import type { LinkStatus } from "../../../../daemon/links/LinkStatus";
import type { SessionInfo } from "../../types";
import { compareVersions } from "./compareVersions";

export function linkDetail(
	link: LinkStatus,
	sessions: SessionInfo[],
	homeVersion: string | undefined,
) {
	const count = sessions.filter((s) => s.node === link.name).length;
	const parts = [
		link.state,
		`${count} session${count === 1 ? "" : "s"}`,
		link.peerVersion && `v${link.peerVersion}`,
		link.state !== "connected" && link.error,
	];
	const cmp =
		link.peerVersion && homeVersion
			? compareVersions(link.peerVersion, homeVersion)
			: 0;
	return {
		text: parts.filter(Boolean).join(" · "),
		drift: cmp < 0 ? "behind" : cmp > 0 ? "ahead" : undefined,
	};
}
