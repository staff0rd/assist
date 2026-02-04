# Summarise Meeting Transcripts

Run the summarise command to list transcripts that need summaries:

```bash
assist transcript summarise
```
For each transcript file listed that does not have a summary:

1. Use a sub-agent (Task tool) to generate a summary of the meeting
2. Read the transcript file from the transcripts directory
3. The summary should follow this format:
   - Title as H1 heading
   - Date and Participants metadata
   - Key sections with H2 headings covering:
     - Key Outcomes/Decisions
     - Discussion Topics
     - Action Items (if any)
     - Important Insights
   - Use bullet points for readability
   - Keep it concise but comprehensive
4. Write the summary to the summary directory with the filename matching the date prefix but using a cleaner title (remove "Transcription" suffix if present)

Run each sub-agent in parallel for efficiency if there are multiple transcripts to summarise.
