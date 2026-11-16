export type DrivenTurnStatus = "running" | "waiting";

export type DrivenTurnEvent =
	| { kind: "status"; status: DrivenTurnStatus }
	| { kind: "activity"; text: string }
	| { kind: "elapsed"; seconds: number }
	| { kind: "background"; tasks: string[] }
	| { kind: "suggestion"; text: string | null }
	| { kind: "conversation"; id: string };
