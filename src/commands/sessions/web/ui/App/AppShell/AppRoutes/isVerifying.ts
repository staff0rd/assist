import { displayStatus } from "./displayStatus";
import type { SessionInfo } from "../../../types";

export function isVerifying(session: SessionInfo): boolean {
	return session.verifying === true && displayStatus(session) === "running";
}
