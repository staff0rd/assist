---
description: Review existing tests for quality, coverage gaps, and adherence to conventions
allowed_args: "[file or directory path to review, default: all test files]"
---

You are reviewing existing tests for quality. Your goal is to identify tests that are weak, misleading, or missing important coverage — and to recommend specific improvements.

## Step 1: Find test files

If `$ARGUMENTS` specifies a path, scope to that. Otherwise, find all `*.test.ts` files under `src/`.

## Step 2: Read each test file and its source

For each test file, read both the test and the source file it covers. You need both to judge whether the tests are adequate.

## Step 3: Evaluate each test file

Assess each test file against these criteria:

### Correctness
- Do assertions actually verify the behaviour, or are they tautological (e.g., testing that a mock returns what you told it to)?
- Are expected values correct and meaningful, not just copied from implementation output?
- Do tests assert the right thing — return values, side effects, thrown errors — for each scenario?

### Coverage of behaviour
- Are all exported functions tested?
- Are conditional branches exercised (if/else, switch, early returns, error paths)?
- Are edge cases covered (empty input, null/undefined, boundary values, large input)?
- Are error cases tested (invalid arguments, missing data, thrown exceptions)?

### Test independence
- Can each test run in isolation, or do tests depend on shared mutable state or execution order?
- Are mocks reset properly between tests?

### BDD structure and Arrange-Act-Assert
- Does the outer `describe` name the function or module under test?
- Do inner `describe("when ...")` blocks group tests by shared setup/scenario?
- Do `it` blocks use `should` phrasing (e.g., `it("should return empty array when no matches")`)?
- Does each test follow Arrange, Act, Assert ordering (without comments labelling the sections)?
- Are assertions minimal per test — ideally one, at most two closely related? If multiple things are asserted about the same action, are they split into separate `it` blocks under the same `describe("when ...")`?

### Mocking discipline
- Are mocks used only when necessary (external I/O, complex dependencies)?
- Do mocks faithfully represent the real dependency's contract, or do they mask bugs?
- Is there a risk that mocked tests pass but real integration would fail?

### Missing tests
- Are there exported functions or significant code paths with no corresponding test?
- Are there recently added functions (check git log) that lack tests?

## Step 4: Report findings

For each test file, report:

**File:** `path/to/file.test.ts`

**Verdict:** Good / Needs improvement / Weak

**Strengths:**
- (what the tests do well)

**Issues:**
- (specific problems, each with a concrete recommendation)

**Missing coverage:**
- (untested functions or paths, with suggested test cases)

## Step 5: Summary

End with an overall summary:

- Total test files reviewed
- Breakdown by verdict (Good / Needs improvement / Weak)
- Top 3 highest-priority improvements across all files
- Whether any tests risk giving false confidence (passing despite bugs)
