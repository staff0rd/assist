import type { IPty } from "node-pty";
import type { HarnessKind } from "../harnesses";
import type { SpinnerHandle } from "../../commands/review/MultiSpinner";
import type { ReviewerResult } from "../../commands/review/runStreamingChild";
import type { SpawnResult } from "../spawnInherit";
import type { CapabilityId } from "./capabilityDefinitions";

export type SdkProcessInfo = { command: string; ioBytesPerSec?: number };

export type SdkSessionEvent =
	| { kind: "status"; status: "running" | "waiting" }
	| { kind: "activity"; text: string | null }
	| { kind: "elapsed"; seconds: number | null }
	| { kind: "process"; process: SdkProcessInfo | null }
	| { kind: "queued"; texts: string[] }
	| { kind: "pending"; texts: string[] }
	| { kind: "background"; tasks: string[] }
	| { kind: "suggestion"; text: string | null }
	| { kind: "interrupting"; pending: boolean }
	| { kind: "resumed" };

type SdkSessionHandle = {
	onEvent: (listener: (event: SdkSessionEvent) => void) => void;
	send: (text: string) => void;
	interrupt: () => void;
	stopTask: (taskId: string) => Promise<void>;
	attach?: (query: SessionProcess, idle: boolean) => void;
};

export type SessionProcess = Pick<
	IPty,
	"pid" | "cols" | "rows" | "write" | "resize" | "kill" | "onData" | "onExit"
> & {
	sdk?: SdkSessionHandle;
};

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
	model?: string;
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
	resumeId?: string;
	prompt?: string;
	cwd?: string;
	appendSystemPromptFile?: string;
	auto?: boolean;
	model?: string;
};

export type ConversationRef = {
	cwd?: string;
	claudeSessionId?: string;
	harnessSessionId?: string;
};

export type ConversationLaunch = {
	cwd: string;
	launchedAt: number;
	sinceMs: number;
	claimed: ReadonlySet<string>;
};

export type ConversationEvent =
	| { kind: "message"; role: "user" | "assistant"; text: string; at?: string }
	| {
			kind: "tool";
			tool: string;
			target: string;
			description?: string;
			operations: ToolOperation[];
			at?: string;
	  }
	| { kind: "toolResult"; text: string; at?: string }
	| { kind: "interrupt"; at?: string };

type ConversationLifecycle = {
	status: "running" | "waiting" | null;
	asking: boolean;
};

type TranscriptEntry = Record<string, unknown>;

export type ConversationReader = {
	headBytes: number;
	locate: (ref: ConversationRef) => string | null;
	watchTarget: (ref: ConversationRef) => { dir: string; file: string } | null;
	events: (entries: TranscriptEntry[]) => ConversationEvent[];
	lifecycle: (
		entries: TranscriptEntry[],
		options?: { permissionActive?: boolean },
	) => ConversationLifecycle;
	fingerprint: (entries: TranscriptEntry[]) => string | null;
	unrecognised?: (entries: TranscriptEntry[]) => string[];
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
		boundId: (ref: ConversationRef) => string | undefined;
		toRef: (conversationId: string, cwd?: string) => ConversationRef;
		discover?: (launch: ConversationLaunch) => Promise<string | null>;
		relocate: (conversationId: string, fromCwd: string, toCwd: string) => void;
		reader?: ConversationReader;
		interruptedTasks?: (ref: ConversationRef) => string[];
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
	interactive: (launch: InteractiveLaunch) => SessionProcess;
	oneShot: (prompt: string, options: OneShotOptions) => Promise<string>;
	structured: (run: StructuredRun) => Promise<ReviewerResult>;
	connectorRun: (run: ConnectorRun) => Promise<ConnectorRunResult>;
	offerInstall?: () => Promise<boolean>;
	activityIdentity: (
		conversationId: string | undefined,
		resumedId?: string,
	) => HarnessActivityIdentity;
};
