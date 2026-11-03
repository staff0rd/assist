// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { z } from "zod";
import { configEntryNode } from "../../../../../../config/configEntryNode";
import { describeConfigNode } from "../../../../../../../shared/describeConfigNode";
import { assistConfigSchema } from "../../../../../../../shared/types";
import { ConfigNodeEditor } from "./ConfigNodeEditor";

afterEach(cleanup);

const schema = describeConfigNode(
	assistConfigSchema.extend({
		aliases: z.record(z.string(), z.array(z.string())).optional(),
	}),
);

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
		render(<Harness nodeKey="deny" initial={undefined} />);

		click("Add deny entry");
		type("deny[0].pattern", "rm -rf");
		type("deny[0].message", "no");

		expect(edited()).toEqual([{ pattern: "rm -rf", message: "no" }]);
	});

	it("opens one entry at a time, summarising the rest", () => {
		render(
			<Harness
				nodeKey="deny"
				initial={[{ pattern: "first" }, { pattern: "second" }]}
			/>,
		);

		expect(screen.getByText("first")).toBeTruthy();
		expect(screen.queryByLabelText("deny[0].pattern")).toBeNull();

		click("Edit deny[1]");
		expect(screen.getByLabelText("deny[1].pattern")).toHaveProperty(
			"value",
			"second",
		);
		expect(screen.queryByLabelText("deny[0].pattern")).toBeNull();

		click("Edit deny[0]");
		expect(screen.queryByLabelText("deny[1].pattern")).toBeNull();

		click("Done editing deny[0]");
		expect(screen.queryByLabelText("deny[0].pattern")).toBeNull();
	});

	it("drops a field again when its input is cleared", () => {
		render(
			<Harness nodeKey="deny" initial={[{ pattern: "a", message: "b" }]} />,
		);

		click("Edit deny[0]");
		type("deny[0].message", "");

		expect(edited()).toEqual([{ pattern: "a" }]);
	});

	it("reorders and removes entries in an array of objects", () => {
		render(
			<Harness
				nodeKey="deny"
				initial={[{ pattern: "first" }, { pattern: "second" }]}
			/>,
		);

		click("Move deny[1] up");
		expect(edited()).toEqual([{ pattern: "second" }, { pattern: "first" }]);

		click("Remove deny[0]");
		expect(edited()).toEqual([{ pattern: "first" }]);
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
		render(<Harness nodeKey="aliases" initial={{ docker: ["ps"] }} />);

		click("Add aliases entry");
		type("aliases key 2", "kubectl");
		type("aliases.kubectl", "get\ndescribe");
		expect(edited()).toEqual({
			docker: ["ps"],
			kubectl: ["get", "describe"],
		});

		click("Remove aliases entry 1");
		expect(edited()).toEqual({ kubectl: ["get", "describe"] });
	});
});
