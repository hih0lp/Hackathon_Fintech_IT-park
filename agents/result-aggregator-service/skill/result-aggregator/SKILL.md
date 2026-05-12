---
name: result-aggregator
description: >
  Aggregates and deduplicates results from all parallel compliance research agents
  (financial_crime, data_protection, payments_vulnerability, consumer_protection,
  ai_governance, crypto_domain) into a single unified JSON output.
  Use this skill whenever you receive a dict of agent results keyed by domain name,
  each containing {spec, tasks}, and need to produce one merged {spec, tasks} JSON.
---

# Result Aggregator

## Purpose

You receive output from multiple domain-specific compliance agents that ran in parallel.
Your job is to merge them into one clean, deduplicated response — the same `{spec, tasks}` shape
that each individual agent returns, just unified across all domains.

## Input Format

```json
{
  "agents": {
    "financial_crime":        {"spec": "Финансовые преступления\n1) ...", "tasks": ["..."]},
    "data_protection":        {"spec": "Защита данных\n1) ...",            "tasks": ["..."]},
    "payments_vulnerability": {"spec": "Платёжные уязвимости\n1) ...",     "tasks": ["..."]},
    "consumer_protection":    {"spec": "Защита потребителей\n1) ...",       "tasks": ["..."]},
    "ai_governance":          {"spec": "AI-управление\n1) ...",             "tasks": ["..."]},
    "crypto_domain":          {"spec": "Крипто-домен\n1) ...",              "tasks": ["..."]}
  }
}
```

Each agent's `spec` starts with a domain header on the first line, then numbered vulnerability items.
If an agent found nothing relevant, its `spec` is either `""` or contains only the domain header with no numbered items.

## Step 0 — Normalize non-standard agent outputs

Some agents (especially user-defined custom agents) may return data in a format other than `{spec, tasks}`.
Before any merging, iterate over every agent result and normalize it:

| What you received | How to normalize |
|---|---|
| `{"spec": "...", "tasks": [...]}` | Already standard — use as-is. |
| A plain string (no JSON structure) | Treat as `{"spec": "<agent_name>\n1) <the string>", "tasks": []}`. |
| A JSON object without `spec`/`tasks` keys (e.g. `{"findings": [...], "recommendations": [...]}`) | Convert: join all finding/recommendation/issue values into numbered `spec` lines under a header derived from the agent name; extract any actionable items into `tasks`. |
| A JSON array of strings | Treat each string as a numbered `spec` line; `tasks` = `[]`. |
| `null`, empty object `{}`, or empty string `""` | Treat as empty domain — `{"spec": "", "tasks": []}`. |

After normalization, every agent result is guaranteed to be `{spec: string, tasks: string[]}`.

## Step 1 — Filter empty domains

Iterate over all (now normalized) agent results. A domain is **empty** if its `spec`:
- is an empty string `""`
- contains no numbered lines (no `1)`, `2)`, etc.)

Collect only the non-empty domains. If ALL domains are empty, return `{"type": "done", "spec": "", "tasks": []}` and stop.

## Step 2 — Deduplicate vulnerabilities across domains

Before merging, identify vulnerabilities that describe **the same underlying risk** from different angles.
Signals of duplication:
- Virtually identical recommendation (e.g., "implement two-factor auth" appears in two domains)
- The same regulatory article cited for the same gap (e.g., GDPR Art. 6 mentioned twice for the same missing consent mechanism)
- Near-identical problem statements reworded for a different domain

When two items are duplicates, keep the one from the domain where it fits more naturally (usually the one with the more specific regulation reference). Silently drop the duplicate from the other domain — do not mention the deduplication in the output.

If two items overlap partially but each has unique information, keep both.

## Step 3 — Build the merged spec

Concatenate the non-empty domain sections in this order (skip missing ones):

1. Financial Crime & Integrity (`financial_crime`)
2. Data Protection & Privacy (`data_protection`)
3. Payments Vulnerability (`payments_vulnerability`)
4. Consumer Protection (`consumer_protection`)
5. AI Governance (`ai_governance`)
6. Crypto Domain (`crypto_domain`)
7. Any remaining agents not in the list above — these are **custom agents**. Output them in alphabetical order by agent name, after the built-in domains.

For each domain: output the domain header as-is (first line of that agent's spec), then its numbered items re-numbered starting from 1 within that section.

Separate domains with a blank line.

The final `spec` is one string. Example shape:
```
Financial Crime & Integrity
1) Missing STR triggers — ...
2) Sanctions screening only at onboarding — ...

Data Protection & Privacy
1) No lawful basis for behavioral profiling — ...
```

## Step 4 — Deduplicate and merge tasks

Collect all tasks from all agents into one flat list.
Remove tasks that are:
- Exact duplicates (same wording)
- Semantically equivalent (same action, different phrasing — keep the most specific version)

Keep all unique tasks. Do not cap the number — return everything that survived deduplication.
Preserve the original language (detect from the task strings themselves).

## Output Format

Your entire response is the JSON object and nothing else.

```json
{
  "type": "done",
  "spec": "<merged domain sections separated by blank lines>",
  "tasks": ["unique task 1", "unique task 2", "..."]
}
```

### Output contract — these rules are absolute, no exceptions

- **No wrapping**: do not wrap the JSON in ```json … ``` fences, backticks, or any other markup.
- **No prefix / suffix**: do not write anything before the opening `{` or after the closing `}` — no "Here is", no "Result:", no explanations.
- **No extra quotes**: newlines inside `spec` must be encoded as `\n` (the JSON escape), not as literal line breaks that would break string parsing.
- **Valid JSON only**: the output must parse cleanly with `json.loads()`. If you are unsure, mentally validate: every string is double-quoted, commas separate array/object entries but there is no trailing comma, all backslashes inside strings are properly escaped.
- **Exact keys**: the top-level object has exactly three keys — `"type"` (always the string `"done"`), `"spec"` (string), and `"tasks"` (array of strings). No additional keys.
- **`type` is always `"done"`**: if the request reached you, every upstream step succeeded. Always set `"type": "done"`. Never use any other type value — no `"error"`, no `"partial"`, no `"pending"`.

If something goes wrong and no spec can be built, return the minimal valid object: `{"type": "done", "spec": "", "tasks": []}`.

The output language must match the language of the input content (Russian if agents wrote in Russian, English if in English, etc.).
