# Social Media Posts for Claude Code Skills

## Reddit (r/ClaudeAI)

**Subreddit:** r/ClaudeAI
**Flair:** Resource / Tool

---

**Title:** I open-sourced my Claude Code CLI skills collection (TypeScript, Quality Gates, Multi-LLM)

**Body:**

After 6 months of building a B2B SaaS with Claude Code, I extracted the skills that saved me the most time into a public repo.

**What's included:**

- **code-quality-gate** - 5-stage pipeline that blocks deploys on TypeScript/test failures. Caught 3 production incidents before they happened.
- **strict-typescript-mode** - Enforces no `any`, explicit types on exports, generic constraints. Reduced runtime errors by ~80%.
- **multi-llm-advisor** - Calls OpenAI Codex + Gemini for architecture decisions, then Claude synthesizes. Surprisingly useful for "should I use X or Y" questions.
- **gemini-image-gen** - Generate images directly from CLI using Gemini API. I use it for dashboard visuals in PPTX exports.
- **social-media-content** - Platform-specific templates for LinkedIn, X, Reddit (yes, the irony).

**Repo:** https://github.com/Svenja-dev/claude-code-skills

**Installation:**
```bash
mkdir -p ~/.claude/skills/code-quality-gate
# copy SKILL.md content
```

These are battle-tested from building [fabrikIQ](https://app.fabrikiq.com) (manufacturing analytics). Not perfect, but they work.

What skills do you use daily? Looking for inspiration to add more.

---

## X / Twitter

**Thread (3 tweets):**

---

**Tweet 1:**
```
I've been using Claude Code CLI for 6 months.

These 5 custom skills saved me the most time:

1. code-quality-gate (blocks bad deploys)
2. strict-typescript-mode (no more `any`)
3. multi-llm-advisor (Claude + Codex + Gemini)
4. gemini-image-gen
5. social-media-content

Open-sourced: 🧵
```

**Tweet 2:**
```
The multi-llm-advisor is wild.

It sends your architecture question to Codex AND Gemini, then Claude synthesizes both responses.

Three AI perspectives > one.

Saved me from 2 bad database decisions already.
```

**Tweet 3:**
```
Repo: github.com/Svenja-dev/claude-code-skills

MIT license. Copy what you need.

Built while making @fababorat (manufacturing analytics).

What Claude Code skills do you use?
```

---

## Discord (Claude AI Server)

**Channel:** #general (NOT #showcase - too thin for showcase)

**Message:**

---

Hey everyone 👋

Quick question for Claude Code CLI users:

I've been collecting my custom skills in a repo and wondering if anyone has done something similar. Mine are mostly around:

- TypeScript enforcement (blocking `any`, requiring explicit types)
- Multi-LLM consultation (sending architecture questions to Codex + Gemini, then having Claude synthesize)
- Quality gates before deploy

Nothing fancy - just SKILL.md files, no hooks or MCP integration yet.

Repo if curious: <https://github.com/Svenja-dev/claude-code-skills>

**Question:** Has anyone built skills with actual hook integration? I'm thinking about adding pre-commit hooks that auto-trigger the quality gate skill. Would love to see examples.

---

## Alternative Discord Post (if you want #showcase)

**Only use this if you add hook integration first!**

---

**Channel:** #showcase

**Message:**

Built a Multi-LLM Advisor skill for Claude Code CLI.

**What it does:**
- Sends your architecture/debugging question to OpenAI Codex + Google Gemini
- Claude synthesizes both responses with its own recommendation
- Full transparency: shows exactly what context was sent to each LLM

**Why:** Sometimes you want multiple AI perspectives before making a decision. This automates the "let me also ask ChatGPT" workflow.

**Technical:** Uses PreToolUse hook to detect architecture/review/debug keywords, then triggers the advisor.

Repo: <https://github.com/Svenja-dev/claude-code-skills>

Would love feedback on the prompt templates. Are there other modes besides architecture/review/debug that would be useful?

---

## Posting Strategy

| Platform | When | Expected Reach |
|----------|------|----------------|
| Reddit r/ClaudeAI | Tue-Thu, 9-11 AM EST | 50-200 upvotes if useful |
| X/Twitter | Any day, morning | Depends on retweets |
| Discord #general | Anytime | 5-20 replies |

**Tip for Reddit:** Don't post and disappear. Reply to every comment within 2 hours. Algorithm rewards engagement.

**Tip for X:** No link in first tweet. Put repo link in reply or tweet 3.

**Tip for Discord:** Ask a genuine question. "Has anyone done X?" gets more engagement than "Look what I made."
