import { describe, expect, it } from "vitest";
import { adfToText } from "./adfToText";

describe("adfToText", () => {
	describe("when given a plain text paragraph", () => {
		it("should return the text content", () => {
			const doc = {
				type: "doc",
				content: [
					{
						type: "paragraph",
						content: [{ type: "text", text: "Hello world" }],
					},
				],
			};

			const result = adfToText(doc);

			expect(result).toBe("Hello world");
		});
	});

	describe("when given multiple paragraphs", () => {
		it("should concatenate the text", () => {
			const doc = {
				type: "doc",
				content: [
					{
						type: "paragraph",
						content: [{ type: "text", text: "First" }],
					},
					{
						type: "paragraph",
						content: [{ type: "text", text: "Second" }],
					},
				],
			};

			const result = adfToText(doc);

			expect(result).toBe("FirstSecond");
		});
	});

	describe("when given a paragraph with inline code", () => {
		it("should wrap the text in backticks", () => {
			const doc = {
				type: "doc",
				content: [
					{
						type: "paragraph",
						content: [
							{ type: "text", text: "Run " },
							{
								type: "text",
								text: "npm install",
								marks: [{ type: "code" }],
							},
						],
					},
				],
			};

			const result = adfToText(doc);

			expect(result).toBe("Run `npm install`");
		});
	});

	describe("when given a text node with no marks", () => {
		it("should return plain text", () => {
			const doc = {
				type: "doc",
				content: [
					{
						type: "paragraph",
						content: [{ type: "text", text: "plain", marks: [] }],
					},
				],
			};

			const result = adfToText(doc);

			expect(result).toBe("plain");
		});
	});

	describe("when given a text node with non-code marks", () => {
		it("should return plain text", () => {
			const doc = {
				type: "doc",
				content: [
					{
						type: "paragraph",
						content: [
							{
								type: "text",
								text: "bold",
								marks: [{ type: "strong" }],
							},
						],
					},
				],
			};

			const result = adfToText(doc);

			expect(result).toBe("bold");
		});
	});

	describe("when given a bullet list", () => {
		it("should render items with dashes", () => {
			const doc = {
				type: "doc",
				content: [
					{
						type: "bulletList",
						content: [
							{
								type: "listItem",
								content: [
									{
										type: "paragraph",
										content: [{ type: "text", text: "Alpha" }],
									},
								],
							},
							{
								type: "listItem",
								content: [
									{
										type: "paragraph",
										content: [{ type: "text", text: "Beta" }],
									},
								],
							},
						],
					},
				],
			};

			const result = adfToText(doc);

			expect(result).toBe("- Alpha\n- Beta");
		});
	});

	describe("when given an ordered list", () => {
		it("should render items with numbers", () => {
			const doc = {
				type: "doc",
				content: [
					{
						type: "orderedList",
						content: [
							{
								type: "listItem",
								content: [
									{
										type: "paragraph",
										content: [{ type: "text", text: "First" }],
									},
								],
							},
							{
								type: "listItem",
								content: [
									{
										type: "paragraph",
										content: [{ type: "text", text: "Second" }],
									},
								],
							},
						],
					},
				],
			};

			const result = adfToText(doc);

			expect(result).toBe("1. First\n2. Second");
		});
	});

	describe("when given a nested bullet list", () => {
		it("should indent the nested items", () => {
			const doc = {
				type: "doc",
				content: [
					{
						type: "bulletList",
						content: [
							{
								type: "listItem",
								content: [
									{
										type: "paragraph",
										content: [{ type: "text", text: "Parent" }],
									},
									{
										type: "bulletList",
										content: [
											{
												type: "listItem",
												content: [
													{
														type: "paragraph",
														content: [{ type: "text", text: "Child" }],
													},
												],
											},
										],
									},
								],
							},
						],
					},
				],
			};

			const result = adfToText(doc);

			expect(result).toBe("- Parent\n  - Child");
		});
	});

	describe("when given a heading", () => {
		describe("when level is 1", () => {
			it("should render with a single hash", () => {
				const doc = {
					type: "doc",
					content: [
						{
							type: "heading",
							attrs: { level: 1 },
							content: [{ type: "text", text: "Title" }],
						},
					],
				};

				const result = adfToText(doc);

				expect(result).toBe("# Title");
			});
		});

		describe("when level is 3", () => {
			it("should render with three hashes", () => {
				const doc = {
					type: "doc",
					content: [
						{
							type: "heading",
							attrs: { level: 3 },
							content: [{ type: "text", text: "Subsection" }],
						},
					],
				};

				const result = adfToText(doc);

				expect(result).toBe("### Subsection");
			});
		});

		describe("when level is not specified", () => {
			it("should default to level 1", () => {
				const doc = {
					type: "doc",
					content: [
						{
							type: "heading",
							content: [{ type: "text", text: "Default" }],
						},
					],
				};

				const result = adfToText(doc);

				expect(result).toBe("# Default");
			});
		});
	});

	describe("when given an empty document", () => {
		it("should return an empty string", () => {
			const doc = { type: "doc", content: [] };

			const result = adfToText(doc);

			expect(result).toBe("");
		});
	});

	describe("when given a document with no content array", () => {
		it("should return an empty string", () => {
			const doc = { type: "doc" };

			const result = adfToText(doc);

			expect(result).toBe("");
		});
	});

	describe("when given a text node with no text property", () => {
		it("should return an empty string", () => {
			const doc = {
				type: "doc",
				content: [
					{
						type: "paragraph",
						content: [{ type: "text" }],
					},
				],
			};

			const result = adfToText(doc);

			expect(result).toBe("");
		});
	});

	describe("when given an unknown node type", () => {
		describe("when the node has content", () => {
			it("should render the children", () => {
				const doc = {
					type: "doc",
					content: [
						{
							type: "panel",
							content: [
								{
									type: "paragraph",
									content: [{ type: "text", text: "Inside panel" }],
								},
							],
						},
					],
				};

				const result = adfToText(doc);

				expect(result).toBe("Inside panel");
			});
		});

		describe("when the node has no content", () => {
			it("should return an empty string", () => {
				const doc = {
					type: "doc",
					content: [{ type: "rule" }],
				};

				const result = adfToText(doc);

				expect(result).toBe("");
			});
		});
	});

	describe("when given a list item with multiple paragraphs", () => {
		it("should render subsequent paragraphs indented without marker", () => {
			const doc = {
				type: "doc",
				content: [
					{
						type: "bulletList",
						content: [
							{
								type: "listItem",
								content: [
									{
										type: "paragraph",
										content: [{ type: "text", text: "First line" }],
									},
									{
										type: "paragraph",
										content: [{ type: "text", text: "Second line" }],
									},
								],
							},
						],
					},
				],
			};

			const result = adfToText(doc);

			expect(result).toBe("- First line\n  Second line");
		});
	});

	describe("when given a nested ordered list inside a bullet list", () => {
		it("should indent and number correctly", () => {
			const doc = {
				type: "doc",
				content: [
					{
						type: "bulletList",
						content: [
							{
								type: "listItem",
								content: [
									{
										type: "paragraph",
										content: [{ type: "text", text: "Outer" }],
									},
									{
										type: "orderedList",
										content: [
											{
												type: "listItem",
												content: [
													{
														type: "paragraph",
														content: [{ type: "text", text: "Inner" }],
													},
												],
											},
										],
									},
								],
							},
						],
					},
				],
			};

			const result = adfToText(doc);

			expect(result).toBe("- Outer\n  1. Inner");
		});
	});
});
