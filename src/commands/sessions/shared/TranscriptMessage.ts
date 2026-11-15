import type { ToolInputField } from "../../../shared/harnessAdapters/types";

export type TranscriptMessage =
	| { role: "user"; text: string }
	| { role: "assistant"; text: string }
	| {
			role: "tool";
			tool: string;
			target: string;
			description?: string;
			label?: string;
			fields?: ToolInputField[];
	  }
	| { role: "shell"; command: string; stdout: string; stderr: string }
	| { role: "interrupt" }
	| { role: "restart"; killed: number };
