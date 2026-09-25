// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { configEntryNode } from "../../../../../../../../../../config/configEntryNode";
import { describeConfigNode } from "../../../../../../../../../../../shared/describeConfigNode";
import { assistConfigSchema } from "../../../../../../../../../../../shared/types";
import { ConfigNodeEditor } from "./ConfigNodeEditor";

afterEach(cleanup);

const schema = describeConfigNode(assistConfigSchema);

function nodeFor(key: string) {
	const node = configEntryNode(schema, key);
	if (!node) throw new Error(`No node at ${key}`);
	return node;
}

function Harness({ nodeKey, initial }: { nodeKey: string; initial: unknown }) {
	const [value, setValue] = useState<unknown>(initial);
	return (
		<>
			<ConfigNodeEditor
				node={nodeFor(nodeKey)}
				label={nodeKey}
				value={value}
				disabled={false}
				onChange={setValue}
			/>
			<pre data-testid="value">{JSON.stringify(value)}</pre>
		</>
	);
}

function edited(): unknown {
	return JSON.parse(screen.getByTestId("value").textContent ?? "null");
}

function type(label: string, value: string) {
	fireEvent.change(screen.getByLabelText(label), { target: { value } });
}

function click(name: string) {
	fireEvent.click(screen.getByRole("button", { name }));
}

describe("ConfigNodeEditor", () => {
	it("adds an entry to an array of objects and types into its fields", () => {
		render(<Harness nodeKey="subtasks" initial={undefined} />);

		click("Add subtasks entry");
		type("subtasks[0].title", "Write the walker");
		type("subtasks[0].description", "recursive");

		expect(edited()).toEqual([
			{ title: "Write the walker", description: "recursive" },
		]);
	});

	it("opens one entry at a time, summarising the rest", () => {
		render(
			<Harness
				nodeKey="subtasks"
				initial={[{ title: "first" }, { title: "second" }]}
			/>,
		);

		expect(screen.getByText("first")).toBeTruthy();
		expect(screen.queryByLabelText("subtasks[0].title")).toBeNull();

		click("Edit subtasks[1]");
		expect(screen.getByLabelText("subtasks[1].title")).toHaveProperty(
			"value",
			"second",
		);
		expect(screen.queryByLabelText("subtasks[0].title")).toBeNull();

		click("Edit subtasks[0]");
		expect(screen.queryByLabelText("subtasks[1].title")).toBeNull();

		click("Done editing subtasks[0]");
		expect(screen.queryByLabelText("subtasks[0].title")).toBeNull();
	});

	it("drops a field again when its input is cleared", () => {
		render(
			<Harness
				nodeKey="subtasks"
				initial={[{ title: "a", description: "b" }]}
			/>,
		);

		click("Edit subtasks[0]");
		type("subtasks[0].description", "");

		expect(edited()).toEqual([{ title: "a" }]);
	});

	it("reorders and removes entries in an array of objects", () => {
		render(
			<Harness
				nodeKey="subtasks"
				initial={[{ title: "first" }, { title: "second" }]}
			/>,
		);

		click("Move subtasks[1] up");
		expect(edited()).toEqual([{ title: "second" }, { title: "first" }]);

		click("Remove subtasks[0]");
		expect(edited()).toEqual([{ title: "first" }]);
	});

	it("keeps only the picked variant's fields when a run entry changes shape", () => {
		render(
			<Harness nodeKey="run" initial={[{ name: "build", command: "npm" }]} />,
		);

		click("Edit run[0]");
		fireEvent.mouseDown(screen.getByLabelText("run[0] type"));
		fireEvent.click(screen.getByRole("option", { name: "link + prefix" }));
		type("run[0].link", "shared.yml");

		expect(edited()).toEqual([{ link: "shared.yml" }]);
		expect(screen.queryByLabelText("run[0].command")).toBeNull();
	});

	it("edits a params array and an env record nested in a run entry", () => {
		render(
			<Harness nodeKey="run" initial={[{ name: "deploy", command: "sh" }]} />,
		);

		click("Edit run[0]");
		click("Add run[0].params entry");
		type("run[0].params[0].name", "stage");
		fireEvent.click(screen.getByLabelText("run[0].params[0].required value"));
		click("Add run[0].env entry");
		type("run[0].env key 1", "LOG");
		type("run[0].env.LOG", "debug");

		expect(edited()).toEqual([
			{
				name: "deploy",
				command: "sh",
				params: [{ name: "stage", required: true }],
				env: { LOG: "debug" },
			},
		]);
	});

	it("keeps trailing spaces and newlines while typing a scalar list", () => {
		render(
			<Harness nodeKey="run" initial={[{ name: "build", command: "npm" }]} />,
		);

		click("Edit run[0]");
		type("run[0].args", "run ");
		expect(screen.getByLabelText("run[0].args")).toHaveProperty(
			"value",
			"run ",
		);
		expect(edited()).toEqual([
			{ name: "build", command: "npm", args: ["run"] },
		]);

		type("run[0].args", "run\n");
		expect(screen.getByLabelText("run[0].args")).toHaveProperty(
			"value",
			"run\n",
		);

		type("run[0].args", "run\nbuild");
		expect(edited()).toEqual([
			{ name: "build", command: "npm", args: ["run", "build"] },
		]);
	});

	it("loads an existing scalar list one entry per line", () => {
		render(
			<Harness
				nodeKey="run"
				initial={[{ name: "build", command: "npm", args: ["run", "build"] }]}
			/>,
		);

		click("Edit run[0]");
		expect(screen.getByLabelText("run[0].args")).toHaveProperty(
			"value",
			"run\nbuild",
		);
	});

	it("adds, renames and removes record entries", () => {
		render(<Harness nodeKey="cliReadVerbs" initial={{ docker: ["ps"] }} />);

		click("Add cliReadVerbs entry");
		type("cliReadVerbs key 2", "kubectl");
		type("cliReadVerbs.kubectl", "get\ndescribe");
		expect(edited()).toEqual({
			docker: ["ps"],
			kubectl: ["get", "describe"],
		});

		click("Remove cliReadVerbs entry 1");
		expect(edited()).toEqual({ kubectl: ["get", "describe"] });
	});
});
