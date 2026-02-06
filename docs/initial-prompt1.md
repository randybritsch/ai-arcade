You are an autonomous technical editor and system designer.



Your task is to initialize the complete “project brain” for a new codebase called \*\*AI Arcade\*\*, following spec-driven development.



You must:

1\) Create a comprehensive source-of-truth spec in `docs/project_spec.md`

2\) Create a compact re-importable bootstrap summary in `docs/bootstrap_summary.md`



Do NOT ask questions. Make reasonable decisions and proceed.



Project inputs:

\- Primary goal: Build a simple, shared “Class Arcade” web app that lets learners submit links to the games they vibe-coded and browse everyone’s creations in one place. The focus is on speed, clarity, and modular design—showing how agents can autonomously turn intent into a useful, working product.

\- Tech stack: TypeScript + React (Vite) + HTML/CSS, localStorage for persistence, optional GitHub Copilot (Claude) agents for scaffolding/refactoring, ESLint/Prettier (optional).

\- Deployment: Cloud static hosting (Vercel or Netlify) with CI/CD from GitHub (auto-deploy on main); no backend services required for MVP.

\- Constraints:

&nbsp; - Performance: fast load, handle ~100–300 submissions smoothly

&nbsp; - Security: validate/normalize URLs, basic iframe sandboxing if embedding, no secrets in client

&nbsp; - Compliance/Data residency: store only non-sensitive public links; keep PII minimal (display name optional)

&nbsp; - Cost: near-zero (static hosting free tier)

\- Users \& personas:

&nbsp; - Learners (submitters): add game title + URL + brief details

&nbsp; - Attendees (players): browse and play games

&nbsp; - Facilitator (admin/light moderator): clear/reset and optionally feature entries



Spec requirements for `docs/project_spec.md`:

Include:

1\) Executive summary

2\) Architecture (logical + runtime)

3\) Directory structure (proposed initial tree)

4\) Module inventory (name, purpose, inputs/outputs, boundaries)

5\) Data \& schemas

6\) API surface (internal/external)

7\) Decision log (ADR-style)

8\) Non-functional requirements

9\) Testing strategy

10\) Operational runbook

11\) Coding conventions

12\) Risks/unknowns/assumptions

13\) Roadmap (short/mid-term)

14\) Glossary



Bootstrap requirements for `docs/bootstrap_summary.md`:

\- 1-line purpose

\- Architecture overview (3–6 bullets)

\- Key modules

\- Top data/contracts

\- Key APIs

\- Mandatory coding rules

\- Current priorities (Top 5)

\- Open risks (Top 5)

\- Links/paths to full docs



Output valid Markdown. Be concise, structured, and authoritative.

Create or overwrite the files as specified.