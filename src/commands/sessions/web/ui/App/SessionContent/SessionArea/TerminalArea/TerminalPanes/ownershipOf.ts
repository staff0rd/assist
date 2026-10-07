import type { Ownership } from "./Ownership";
import { viewerId } from "../../../../../viewerId";

export function ownershipOf(activeViewer: string | undefined): Ownership {
	if (activeViewer === undefined) return "free";
	return activeViewer === viewerId ? "mine" : "other";
}
