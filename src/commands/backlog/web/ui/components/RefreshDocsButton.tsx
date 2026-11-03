import { useApiNode } from "../../../../sessions/web/ui/useApiNode";
import { itemDetailPath } from "../itemDetailPath";
import { useDocsRefreshState } from "../useDocsRefreshState";
import { useRepoCwd } from "../useRepoCwd";
import { OpenRefreshDocsLink } from "./OpenRefreshDocsLink";
import { RefreshDocsMenu } from "./RefreshDocsMenu";

export function RefreshDocsButton({ revision }: { revision: unknown }) {
	const cwd = useRepoCwd();
	const node = useApiNode();
	const state = useDocsRefreshState(cwd, node, revision);
	if (!state) return null;
	if (state.openId !== undefined)
		return (
			<OpenRefreshDocsLink
				id={state.openId}
				to={itemDetailPath(state.openId, cwd, node)}
			/>
		);
	if (!state.enabled) return null;
	return <RefreshDocsMenu stories={state.unswept} cwd={cwd} node={node} />;
}
