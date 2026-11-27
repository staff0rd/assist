import { useSearchParams } from "react-router";
import type { NewSessionMode } from "./App/AppShell/AppOverlays/NewSessionLayer/newSessionModes";

type NewSessionRequest = {
	prompt: string;
	cwd: string;
	mode?: NewSessionMode;
	node?: string;
};

export function useRequestNewSession(): (request: NewSessionRequest) => void {
	const [, setSearchParams] = useSearchParams();
	return ({ prompt, cwd, mode, node }) =>
		setSearchParams(
			(params) => {
				params.set("new", prompt);
				params.set("newCwd", cwd);
				if (mode) params.set("newMode", mode);
				if (node) params.set("newNode", node);
				return params;
			},
			{ replace: true },
		);
}
