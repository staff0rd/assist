import { findAssistClone } from "../../../../../AppShell/AppStatusBar/ClientFailuresBadge/findAssistClone";
import { useModifiersHeld } from "../../../../../../useModifiersHeld";
import { useNodeSelectionContext } from "../../../../../../useNodeSelectionContext";
import { useRepoSelectionContext } from "../../../../../../useRepoSelectionContext";
import type { SessionInfo } from "../../../../../../types";
import { AssistNewSessionButtons } from "./CardAssistButtons/AssistNewSessionButtons";
import { isAssistChord } from "./CardAssistButtons/isAssistChord";

export function CardAssistButtons({ session }: { session: SessionInfo }) {
	const held = useModifiersHeld(isAssistChord);
	const { repos, originOf, cloneOn } = useRepoSelectionContext();
	const { nodes } = useNodeSelectionContext();
	if (!held) return null;
	const clone = findAssistClone(repos, originOf);
	const cwd = clone && cloneOn(clone, session.node);
	if (!cwd) return null;
	return (
		<AssistNewSessionButtons
			id={session.id}
			cwd={cwd}
			node={session.node ?? nodes?.local}
		/>
	);
}
