import { prepareCodexHookTrust } from "../../../shared/prepareCodexHookTrust";
import { trustCodexProject } from "../../../shared/trustCodexProject";
import { daemonLog } from "./daemonLog";

export function prepareCodexLaunch(cwd: string | undefined): void {
	const trusted = trustCodexProject(cwd);
	if (trusted) daemonLog(`codex: trusted ${trusted} in config.toml`);
	const untrusted = prepareCodexHookTrust();
	if (untrusted) daemonLog(`codex: ${untrusted}`);
}
