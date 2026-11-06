---
title: Commenting code
when: always
---

Do not include comments for standard logic or syntax. Only comment if the specific line involves unintuitive complexity or a hack. A trailing comment naming the tag/version on a SHA-pinned GitHub Actions `uses:` ref (e.g. `uses: owner/repo/.github/workflows/review.yml@<sha> # review-v0.17.1`) is allowed.
