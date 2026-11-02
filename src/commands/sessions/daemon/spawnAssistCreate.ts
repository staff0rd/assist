import type { SessionManager } from "./SessionManager";
import { spawnContextFrom } from "./spawnContextFrom";
import { spawnTransferredRun } from "./transfer/spawnTransferredRun";
import { parseTransferSnapshot } from "./transfer/TransferSnapshot";
import { isPrCheckoutArgs } from "./worktree/isPrCheckoutArgs";
import { prCheckoutHolder } from "./worktree/prCheckoutHolder";

export function spawnAssistCreate(
	m: SessionManager,
	d: Record<string, unknown>,
): string | Promise<string> {
	const assistArgs = (d.assistArgs as string[]) ?? [];
	const cwd = d.cwd as string | undefined;
	const inPlace = d.inPlace === true;
	const meta = {
		title: d.title as string | undefined,
		subtitle: d.subtitle as string | undefined,
		...(d.autoApprove === true && { autoApprove: true }),
	};
	const snapshot = parseTransferSnapshot(d.transfer);
	if (snapshot)
		return spawnTransferredRun(
			m.treeCtx(),
			m.discardSession,
			{
				assistArgs,
				cwd,
				meta: { ...meta, inPlace },
				snapshot,
				traceId: d.traceId as string | undefined,
			},
			spawnContextFrom(d),
		);
	const spawn = (holder?: string) =>
		m.spawnAssist(
			assistArgs,
			holder ?? cwd,
			{ ...meta, inPlace: inPlace || holder !== undefined },
			spawnContextFrom(d),
		);
	if (inPlace || !isPrCheckoutArgs(assistArgs)) return spawn();
	return prCheckoutHolder(assistArgs, cwd).then(spawn);
}
