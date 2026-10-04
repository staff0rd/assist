import { AddAgentButton } from "./SessionWorkspaceButtons/AddAgentButton";
import { OpenInCodeButton } from "../OpenInCodeButton";
import type { SessionInfo } from "../../types";

export function SessionWorkspaceButtons({
	session,
	topBar,
}: {
	session: SessionInfo;
	topBar: boolean;
}) {
	return (
		<>
			<AddAgentButton
				session={session}
				shortcut={topBar ? "focusAddAgent" : undefined}
			/>
			{session.cwd && (
				<OpenInCodeButton
					cwd={session.cwd}
					variant="card"
					shortcut={topBar ? "focusVsCode" : undefined}
				/>
			)}
		</>
	);
}
