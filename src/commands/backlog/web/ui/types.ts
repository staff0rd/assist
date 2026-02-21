export type BacklogItem = {
	id: number;
	name: string;
	description?: string;
	acceptanceCriteria: string[];
	status: "todo" | "in-progress" | "done";
};
