# Study Flow

Study Flow is a learning app that helps children study school lessons in a more structured, visual and active way.

The app transforms a lesson into simple learning cards, questions and review flows. It is designed with special care for children who need clearer structure, less visual noise and more support when they study alone.

## Purpose

Many children do not know how to study from a textbook.

They read the lesson, but they do not always know:

* what is important
* what they should remember
* how ideas are connected
* what they did not understand
* how to review before a test

Study Flow helps by turning a lesson into smaller learning steps.

The goal is not to replace the textbook or the teacher. The goal is to help the child work with the lesson in a calmer and more guided way.

## Main idea

Study Flow takes lesson content and creates a study flow with:

* clear concepts
* short explanations
* learning cards
* questions
* quiz flow
* review of wrong answers
* visual prompts for educational images
* support for dyslexia-friendly learning design

The app focuses on clarity, repetition, curiosity and active recall.

## Current product direction

The app is built around several principles:

1. Break lessons into small parts.
2. Show only the most important concepts.
3. Use simple language.
4. Prefer visual learning when it helps understanding.
5. Use questions to check real understanding.
6. Help the child return to mistakes in the next session.
7. Keep the interface calm and mobile-friendly.

## Key features

### Lesson processing

The app can process a school lesson and transform it into structured learning content.

The generated content may include:

* modules
* cards
* key concepts
* explanations
* examples
* quiz questions
* prompts for images

### Learning cards

Lessons are presented as cards so the child can focus on one idea at a time.

The card format supports:

* short text
* clear titles
* simple explanations
* examples close to the child’s world
* swipe-based mobile navigation

### Quiz and review

The app supports quiz-based learning.

The goal is to help the child check what they understand, not only read the lesson.

A future direction is to start the next study session with the questions the child got wrong before.

### Visual learning support

Study Flow can help generate prompts for educational illustrations.

The preferred visual style is:

* simple
* clean
* vertical
* mobile-friendly
* no unnecessary details
* suitable for children with dyslexia
* based on familiar school and everyday objects

### Dyslexia-aware design

The app is developed with attention to children who may need:

* clearer structure
* less dense text
* fewer distractions
* more repetition
* stronger visual support
* simple step-by-step flow

## Technology

Study Flow is built with:

* Next.js
* React
* TypeScript
* Tailwind CSS
* Anthropic SDK
* Vitest
* Playwright
* next-intl

## Project scripts

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Run unit tests:

```bash
npm run test
```

Run end-to-end tests:

```bash
npm run test:e2e
```

Build the app:

```bash
npm run build
```

Start the production build:

```bash
npm run start
```

## Environment variables

The app requires API keys for AI generation.

Create a local environment file:

```bash
.env.local
```

Do not commit this file.

Example:

```bash
ANTHROPIC_API_KEY=your_key_here
```

## Security notes

Never commit:

* API tokens
* `.env` files
* local debug files
* generated private lesson files
* personal user data

If an API token was committed or shared by mistake, rotate it immediately.

## Repository structure

The project uses the Next.js App Router.

Important areas of the codebase include:

```text
src/app
src/app/api
src/lib
docs
tests
```

The `docs` folder contains product, architecture, design and development notes.

## Development notes

Before making larger changes, read the project documentation in `docs`.

Recommended reading order:

1. `docs/product.md`
2. `docs/project.md`
3. `docs/design-system.md`
4. `docs/dev-notes.md`

## Status

Study Flow is an early product prototype.

The current focus is to stabilize the learning generation flow, improve the study experience and make the app easier to test and maintain.

## Product vision

Study Flow aims to help children study with more confidence.

The app should support the child in understanding the lesson, remembering the important ideas and seeing what needs more practice.

The long-term direction is to combine AI, learning science and calm product design into a practical tool for school learning.
