import type { AutoRestartTarget } from "./autoRestartTarget";

type AttemptDeps = {
	attempted: { set: (built: string) => void };
	restart: (target: AutoRestartTarget) => Promise<void>;
	log: (message: string) => void;
};

export async function attemptAutoRestart(
	deps: AttemptDeps,
	target: AutoRestartTarget,
	built: string,
): Promise<void> {
	deps.attempted.set(built);
	deps.log(`auto-restart: restarting ${target} to apply v${built}`);
	try {
		await deps.restart(target);
	} catch (error) {
		deps.log(
			`auto-restart: ${target} restart for v${built} failed: ${error instanceof Error ? error.message : String(error)}`,
		);
	}
}
