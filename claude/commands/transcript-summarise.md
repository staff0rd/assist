# Summarise Meeting Transcripts

Run the summarise command:

```bash
assist transcript summarise
```

This command operates in two modes:

## Mode 1: Process Staged Summary

If a file exists in `./.assist/transcript/`, the command validates and moves it:
- Checks the first line has `[Full Transcript](<path>)` linking to the original transcript
- Checks there is summary content after the link
- Moves the file to the configured summary directory, preserving the folder structure

## Mode 2: Present Next Transcript

If no staged file exists, the command shows:
- The next transcript that needs summarising
- The path where you should write the summary

When summarising:

1. Read the transcript file shown in the output
2. Write a summary to the staging path shown, with this format:
   - First line MUST be: `[Full Transcript](<absolute-path-to-transcript>)`
   - Then a blank line
   - Then the summary content:
     - Title as H1 heading
     - Date and Participants metadata
     - Key sections with H2 headings covering:
       - Key Outcomes/Decisions
       - Discussion Topics
       - Action Items (if any)
       - Important Insights
     - Use bullet points for readability
     - Keep it concise but comprehensive
3. Run `assist transcript summarise` again to validate and move the summary to its final location
