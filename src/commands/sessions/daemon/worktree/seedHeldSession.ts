import type { Session } from "../createSession";
import { failHeldStart } from "../failHeldStart";
import { installFailureMessage } from "./installFailureMessage";
import { seedWorktree } from "./seedWorktree";

type StartHeld = (session: Session, failure?: string) => void;

export function seedHeldSession(
	session: Session,
	path: string,
	clone: string,
	notify: () => void,
	startHeld: StartHeld,
): void {
	seedWorktree(
		path,
		clone,
		(outcome) => {
			session.seeding = undefined;
			if (outcome.ok) {
				startHeld(session);
				return;
			}
			const failure = installFailureMessage(path, outcome);
			failHeldStart(session, failure);
			startHeld(session, failure);
		},
		(installPath) => {
			session.seeding = `Installing dependencies${installPath ? ` in ${installPath}` : ""}…`;
			notify();
		},
	);
}
