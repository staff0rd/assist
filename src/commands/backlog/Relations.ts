import type {
	CommentRow,
	GitRefRow,
	LinkRow,
	PhaseRow,
	PhaseUsageRow,
	SubtaskRow,
	TaskRow,
} from "../../shared/db/schema";

export type Relations = {
	comments: Map<number, CommentRow[]>;
	links: Map<number, LinkRow[]>;
	phases: Map<number, PhaseRow[]>;
	tasks: Map<number, TaskRow[]>;
	subtasks: Map<number, SubtaskRow[]>;
	usage: Map<number, PhaseUsageRow[]>;
	gitRefs: Map<number, GitRefRow[]>;
};

export type LoadRelationsOptions = {
	includeComments?: boolean;
	includeTasks?: boolean;
	includeSubtasks?: boolean;
	includeUsage?: boolean;
	includeGitRefs?: boolean;
};
