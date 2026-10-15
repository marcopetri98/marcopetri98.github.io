# Introduction

This project is about a personal website aimed at both being a portfolio and a
blog with articles. Specifically, articles will be divided into tech articles
ranging from software engineering to AI research, and opinion articles in which
I express myself with debatable ideas regarding some topic. It is a classic
Astro project that is then published automatically through CI/CD to GitHub.

## Project structure

- `public`: contains the static files that need to be copied plainly.
- `src`: contains the code of the web page.
  - `assets`: contains images, videos, and eventually other similar files.
  - `components`: contains reusable Astro components.
  - `content`: contains the articles.
  - `layouts`: contains the reusable layouts.
  - `pages`: contains the pages of the website.
  - `styles`: contains the CSS code styling the website.
  - `utils`: contains typescript constants and other useful things.

## Tools

- `npm` tool used to manage packages and run the development server.
- **Astro** is the static site generator used for creating the website.

## Coding standards

- Always place type hints on all functions and methods both on input and output.
- Never place `#noqa` to avoid linter complaining.
- No bare `try/except` unless the failure is genuinely recoverable. Let it crash.
- No new dependency without asking.
- When a part of the web page is present multiple times, prefer the usage of a
  component rather then reimplementing it two times.
- Use layouts when you need to generate two layouts that represent either
  important pages of the website, of when that page needs to be repeated.

## Scope

- Never git commit, git push, git stash or stuff like that. Only git fetch and
  git log (and commands that does not change history) are allowed.
- Do what was asked, nothing adjacent. No speculative abstractions,
  no unrequested refactors, no extra tests.
- Prefer editing an existing module over creating a new file.
- Don't refactor duplication unless asked — propose it instead. Prefer
  composition over inheritance. Never unify code across experiment variants.
- Uncertain about an architectural choice? Stop and ask.
