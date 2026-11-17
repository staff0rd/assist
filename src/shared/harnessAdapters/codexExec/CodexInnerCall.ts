import type { JsLiteral } from "./readJsLiteral";

export type CodexInnerCall = {
	tool: "exec_command" | "write_stdin";
	args: Record<string, JsLiteral>;
};
