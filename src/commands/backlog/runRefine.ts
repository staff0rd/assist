import { refine } from "./refine";
import { resolveHarness } from "./resolveHarness";

type RefineLaunchOpts = {
	once?: boolean;
	resumeSession?: string;
	harness?: string;
};

export function runRefine(
	id: string | undefined,
	opts: RefineLaunchOpts,
): Promise<void> {
	return refine(id, {
		once: opts.once,
		resumeSessionId: opts.resumeSession,
		harness: resolveHarness(opts.harness),
	});
}
