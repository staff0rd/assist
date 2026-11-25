import { createAssistSession } from "./createAssistSession";
import { createRunSession } from "./createRunSession";
import { createSession, type Session } from "./createSession";
import type { PersistedSession } from "./loadPersistedSessions";

export function createHeld(
	id: string,
	persisted: PersistedSession,
): Session | undefined {
	if (persisted.commandType === "assist")
		return persisted.assistArgs
			? createAssistSession(
					id,
					persisted.assistArgs,
					persisted.cwd,
					undefined,
					true,
				)
			: undefined;
	if (persisted.commandType === "run" && persisted.runName)
		return createRunSession(
			id,
			{
				runName: persisted.runName,
				runArgs: persisted.runArgs ?? [],
				cwd: persisted.cwd,
			},
			true,
		);
	if (persisted.commandType === "claude")
		return createSession(id, {
			prompt: persisted.initialPrompt,
			cwd: persisted.cwd,
			design: persisted.design,
			auto: persisted.auto,
			harness: persisted.harness,
			model: persisted.model,
			holdPty: true,
		});
	return undefined;
}
