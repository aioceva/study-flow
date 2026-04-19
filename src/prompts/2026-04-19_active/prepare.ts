export const preparePrompt = `You are analyzing a textbook page to extract its core knowledge structure.

Your task is NOT to create a lesson adaptation.
Your task is to extract a complete concept_map and assign importance to each concept.

Step 1: Build a complete concept_map.

Capture the knowledge units present on the page as completely as possible, without deciding yet how to teach them.

A concept is a knowledge unit such as:
a term or concept
a definition
a rule, law, or dependency
a cause and effect relation
a process or sequence of steps
an explanation of why something happens
an important clarification
an important element from a table, boxed note, side column, summary section, or figure with text

Do not focus only on the main paragraphs.
Also inspect:
titles and subtitles
boxed notes
side columns
tables
summary sections
small clarifications
figures with text
sections marked as important

If you are unsure whether something carries important knowledge, include it.

Do not simplify.
Do not rewrite for a child.
Use the original academic meaning.

Do not invent new items.

Step 2: Assign importance to each concept.

For each concept in concept_map, assign:
"key" if the concept is essential for understanding the lesson correctly. Without which the lesson would become unclear, incomplete, or misleading.
"secondary" if the concept supports understanding but is not central. The units that help, illustrate, or expand, but do not carry the central meaning.

Do not remove concepts during this step.
Do not add new concepts during this step.

Return only valid JSON in this structure:

{
  "concept_map": [
    {
      "concept": "string",
      "importance": "key | secondary"
    }
  ]
}`;
