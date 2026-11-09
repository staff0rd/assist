import type { IPty } from "node-pty";
import type { HarnessKind } from "../harnesses";

type InteractivePty = IPty;
import type { SpinnerHandle } from "../../commands/review/MultiSpinner";
import type { ReviewerResult } from "../../commands/review/runStreamingChild";
import type { SpawnResult } from "../spawnInherit";
import type { CapabilityId } from "./capabilityDefinitions";

export type CapabilityStatus =
	| { supported: true }
	| {
			supported: false;
			reason: string;
			remediation: string;
			followUp?: string;
	  };

type CapabilityDeclaration = CapabilityStatus | (() => CapabilityStatus);

export type CapabilityDeclarations = Record<
	CapabilityId,
	CapabilityDeclaration
>;

export type HarnessCapabilitySource = {
	label: string;
	capabilities: CapabilityDeclarations;
	detect?: () => CapabilityStatus;
};

export type HarnessFeature = {
	id: string;
	label: string;
	requires: CapabilityId[];
};

export type Unavailability = {
	capability: CapabilityId | "harness.detected" | "harness.enabled";
	reason: string;
	remediation: string;
	followUp?: string;
};

export type FeatureResolution =
	| { available: true }
	| { available: false; reasons: Unavailability[] };

export type HarnessActivityIdentity = {
	harness?: HarnessKind;
	claudeSessionId?: string;
	harnessSessionId?: string;
};

type LaunchOptions = {
	conversationId?: string;
	cwd: string;
	allowEdits?: boolean;
};

type ResumeOptions = { cwd: string; allowEdits?: boolean };

export type OneShotOptions = {
	timeout: number;
	effort?: "low" | "medium";
	cwd?: string;
};

export type StructuredRun = {
	name: string;
	stdin: string;
	outputPath: string;
	readDir: string;
	model?: string;
	spinner?: (model: string | undefined) => SpinnerHandle | undefined;
};

type InteractiveLaunch = {
	sessionId: string;
	conversationId?: string;
	prompt?: string;
	cwd?: string;
	design?: boolean;
	auto?: boolean;
};

export type ConversationRef = {
	cwd?: string;
	claudeSessionId?: string;
	harnessSessionId?: string;
};

export type ConnectorTool =
	| "gmail.searchThreads"
	| "gmail.getThread"
	| "slack.search"
	| "slack.readThread";

export type RunUsage = {
	input: number;
	output: number;
	cacheRead: number;
	cacheWrite: number;
	costUsd: number | null;
	durationMs: number | null;
};

export type ConnectorRunEvent =
	| { type: "model"; model: string }
	| {
			type: "toolCall";
			callId: string;
			tool?: ConnectorTool;
			label: string;
			input: Record<string, unknown>;
			tokens?: number;
	  }
	| { type: "toolResult"; callId: string; text: string }
	| { type: "text"; text: string; tokens?: number }
	| { type: "usage"; usage: RunUsage };

export type ConnectorRun = {
	prompt: string;
	schema: Record<string, unknown>;
	tools: ConnectorTool[];
	timeoutMs: number;
	onEvent: (event: ConnectorRunEvent) => void;
};

export type ConnectorRunResult = { output: unknown; usage: RunUsage };

export type ToolOperation =
	| { kind: "command"; tool: string; command: string }
	| { kind: "fileRead"; tool: string; paths: string[] }
	| { kind: "fileWrite"; tool: string; path: string; contents: string[] }
	| { kind: "question"; tool: string; questionsJson: string };

export type ExecutionIdentity = {
	harness: string;
	conversationId?: string;
	itemId: number | null;
};

export type NativeToolCall = {
	toolName: string;
	toolInput: Record<string, unknown>;
};

export type HarnessAdapter = HarnessCapabilitySource & {
	kind: string;
	detect: () => CapabilityStatus;
	conversation: {
		idName: string;
		findResumable: (ref: ConversationRef) => string | undefined;
		locate: (conversationId: string) => Promise<string | null>;
		current: () => string | undefined;
	};
	toolOperations: (call: NativeToolCall) => ToolOperation[];
	permissionRules?: (key: "allow" | "deny") => string[];
	launchSkill: (
		skill: string,
		args: string | undefined,
		options: LaunchOptions,
	) => SpawnResult;
	launchPrompt: (prompt: string, options: LaunchOptions) => SpawnResult;
	resume: (
		conversationId: string,
		nudge: string,
		options: ResumeOptions,
	) => SpawnResult;
	interactive: (launch: InteractiveLaunch) => InteractivePty;
	oneShot: (prompt: string, options: OneShotOptions) => Promise<string>;
	structured: (run: StructuredRun) => Promise<ReviewerResult>;
	connectorRun: (run: ConnectorRun) => Promise<ConnectorRunResult>;
	offerInstall?: () => Promise<boolean>;
	activityIdentity: (
		conversationId: string | undefined,
		resumedId?: string,
	) => HarnessActivityIdentity;
};
