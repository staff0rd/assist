import { repoNode } from "../shared/nodeRuntime/repoNode";
import { withHarnessPath } from "../shared/nodeRuntime/withHarnessPath";

export function installDirEnv(installDir: string): NodeJS.ProcessEnv {
	const repo = repoNode(installDir);
	if (!repo) return process.env;
	if (!repo.ok) {
		console.warn(
			`${repo.pin.file} wants node "${repo.pin.spec}" but ${repo.error}; continuing on node ${process.version}`,
		);
		return process.env;
	}
	console.log(`Using node ${repo.node.version} pinned by ${repo.pin.file}`);
	return withHarnessPath(process.env as Record<string, string>, [
		repo.node.binDir,
	]);
}
