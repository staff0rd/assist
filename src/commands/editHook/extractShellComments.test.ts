import { describe, expect, it } from "vitest";
import { extractShellComments } from "./extractShellComments";

describe("extractShellComments", () => {
	it("exempts the leading header block", () => {
		const text = "#!/bin/bash\n# describe this script\n\necho hi";
		expect(extractShellComments(text)).toEqual([]);
	});

	it("gates a full-line comment below the header", () => {
		const text = "#!/bin/bash\necho hi\n# stray note\necho bye";
		expect(extractShellComments(text)).toEqual(["# stray note"]);
	});

	it("gates a trailing comment below the header", () => {
		const text = "#!/bin/bash\necho hi # inline note";
		expect(extractShellComments(text)).toEqual(["# inline note"]);
	});

	it("ends the header at the first code line", () => {
		const text = "echo hi\n# not a header\necho bye";
		expect(extractShellComments(text)).toEqual(["# not a header"]);
	});

	it("ignores a # inside a quoted string", () => {
		const text = 'echo "#ff0000"';
		expect(extractShellComments(text)).toEqual([]);
	});
});
