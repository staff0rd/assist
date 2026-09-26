import { DiffContent } from "../../../DiffContent";
import { PageShell } from "../../../PageShell";
import type { SessionInfo } from "../../../../types";
import { useDiffTarget } from "./DiffView/useDiffTarget";

export function DiffView({
	sessions,
	sendInput,
}: {
	sessions: SessionInfo[];
	sendInput: (sessionId: string, data: string) => void;
}) {
	const { cwd, sessionId, scope, setScope } = useDiffTarget();

	return (
		<PageShell maxWidth={false}>
			<DiffContent
				cwd={cwd}
				sessionId={sessionId}
				scope={scope}
				onScopeChange={setScope}
				sessions={sessions}
				sendInput={sendInput}
			/>
		</PageShell>
	);
}
