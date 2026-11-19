export type BuildOutcome =
	| { kind: "built" }
	| {
			kind: "failed";
			exitCode: number;
			output: string;
			missingTool?: string;
	  };
