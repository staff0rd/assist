import {
	type ExecveFn,
	resolveExecve,
} from "../../commands/sessions/web/restartMenu/resolveExecve";
import {
	type DeclaredNode,
	declaredNode,
	NODE_VERSION_KEY,
} from "./declaredNode";
import { execOnNode } from "./execOnNode";
import { sameBinary } from "./sameBinary";

const REEXEC_ENV = "ASSIST_NODE_REEXEC";

type ReExecOnDeclaredNodeDeps = {
	declared?: DeclaredNode;
	log: (message: string) => void;
	execveFn?: ExecveFn | null;
	allowBlockingChild?: boolean;
};

export function reExecOnDeclaredNode(deps: ReExecOnDeclaredNodeDeps): void {
	const { log, execveFn = resolveExecve(), allowBlockingChild = true } = deps;
	const declared = "declared" in deps ? deps.declared : declaredNode();
	if (!declared) return;
	const running = `node ${process.version} (${process.execPath})`;
	if (!declared.ok) {
		log(
			`${NODE_VERSION_KEY} "${declared.spec}" could not be resolved: ${declared.error}; falling back to the current ${running}`,
		);
		return;
	}
	const target = declared.node.path;
	if (sameBinary(target, process.execPath)) return;
	if (process.env[REEXEC_ENV] === target) {
		log(
			`${NODE_VERSION_KEY} "${declared.spec}" resolves to ${target} but re-exec still landed on ${running}; staying on it`,
		);
		return;
	}
	if (!execveFn && !allowBlockingChild) {
		log(
			`${NODE_VERSION_KEY} "${declared.spec}" declares node v${declared.node.version} (${target}) but this process runs on ${running}`,
		);
		return;
	}
	log(
		`${NODE_VERSION_KEY} "${declared.spec}": re-executing on node v${declared.node.version} (${target}) instead of ${running}`,
	);
	execOnNode(target, { ...process.env, [REEXEC_ENV]: target }, execveFn);
}
