import { type Activity, emitActivity } from "../../shared/emitActivity";

export function emitWatchState(
	watchState: NonNullable<Activity["watchState"]>,
): void {
	emitActivity({ kind: "command", name: "watch", watchState });
}
