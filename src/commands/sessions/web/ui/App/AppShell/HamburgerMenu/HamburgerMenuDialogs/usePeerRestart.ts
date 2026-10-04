import { postRestart } from "../../postRestart";
import { useAwaitPeerReturn } from "./useAwaitPeerReturn";

const describeBack = (peer: string, version?: string) =>
	version ? `${peer} is back (v${version})` : `${peer} is back`;

export function usePeerRestart() {
	const { requestThenAwait, ...notices } = useAwaitPeerReturn();

	const restart = (peer: string): Promise<boolean> =>
		requestThenAwait(
			peer,
			`Restart ${peer}`,
			() => postRestart("both", peer),
			describeBack,
		);

	return { restart, ...notices };
}
