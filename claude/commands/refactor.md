---
description: Run refactoring checks for code quality
---

Run `assist refactor check $ARGUMENTS`. If it fails, fix all errors and run again until it passes.

## Extracting Code to New Files

When extracting logic from one file to another, consider where the extracted code belongs:

1. **Keep related logic together**: If the extracted code is tightly coupled to the original file's domain, create a new folder containing both the original and extracted files.

2. **Share common utilities**: If the extracted code can be reused across multiple domains, move it to a common/shared folder.
