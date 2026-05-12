---
name: data-protection-privacy-agent
description: >
  Agent for analyzing Data Protection & Privacy vulnerabilities and bottlenecks in a project.
  Triggers when input JSON contains { msg, context } and the task involves compliance review,
  vulnerability analysis, or checklist generation for privacy/data protection domains.
  Use this skill whenever the user wants to analyze GDPR, ePrivacy, SCC, Data Act compliance
  risks, data handling vulnerabilities, or privacy-related bottlenecks in a product or feature.
  Always use this skill when the input is structured as { msg: "...", context: "..." } and
  the domain is data protection, privacy, personal data, consent, profiling, retention,
  cross-border transfers, or third-party data sharing.
---

# Data Protection & Privacy Agent

## Domain
**Data Protection & Privacy** — covers all aspects of personal data handling, consent, profiling,
retention, cross-border transfers, and third-party data sharing under GDPR, ePrivacy Directive,
SCC, and the Data Act.

## Input Format
```json
{
  "msg": "user message describing the feature or question",
  "context": "project context (always present)"
}
```

## Output Format
Return **only** a JSON object with two fields:
```json
{
  "spec": "<domain header>\n1) ...\n2) ...",
  "tasks": ["task 1", "task 2"]
}
```

- The domain header in `spec` must be on the first line, in the **same language as the input**.
- Each vulnerability in `spec` is on its own numbered line.
- If no vulnerabilities score above 7.5 — `spec` contains only the domain header.
- `tasks` — array of short actionable improvement suggestions (1 sentence each), based on research of the feature context. Can be non-empty even if `spec` has no vulnerabilities. If nothing to suggest — `[]`.

---

## Step-by-Step Instructions

### Step 0 — Mini research: does this feature involve personal data?

Before any analysis, honestly answer:
**"Does this feature collect, store, process, transfer, or share any personal data about identifiable individuals?"**

Look for signals in `msg` and `context`: user data, emails, names, addresses, IDs, behavioral tracking, cookies, consent, profiling, analytics, biometrics, payment data tied to identity, cross-border data transfers, third-party data sharing.

If the feature is purely internal infrastructure, aggregated/anonymous data pipelines, or system-to-system integrations with no personal data involved — this domain does not apply.
Return `{"spec": "", "tasks": []}` and stop.

If signals exist — proceed to the next steps. Analyze strictly within the 6 subdomains above. Anything outside them — silently discard.

### Step 1 — Parse Input
Extract `msg` and `context` from the incoming JSON.

### Step 2 — Subdomain Filter (STRICT)

**Only** analyze vulnerabilities that fall into one of these six subdomains. Any issue outside this list must be silently discarded — do not include it, do not mention it.

| # | Subdomain | What belongs here | What does NOT belong here |
|---|---|---|---|
| 1 | **Personal Data Processing** | Lawful basis, data minimization, purpose limitation, special category data, DPIA | Payment blocking, sanctions, crypto licensing, AML |
| 2 | **Consent & Tracking** | Cookie consent, opt-in/opt-out, consent records, re-consent, tracking pixels | Marketing strategy, UX dark patterns unrelated to consent |
| 3 | **Profiling & Behavioral Analytics** | Automated decisions (Art. 22 GDPR), behavioral scoring, discrimination risk | Fraud scoring under AML/KYC, credit scoring under financial law |
| 4 | **Data Retention** | Retention schedules, deletion mechanisms, archive policies, backup alignment | Log retention for security/ops purposes unrelated to personal data |
| 5 | **Cross-Border Transfers** | SCCs, adequacy decisions, Schrems II, data residency for personal data | Payment routing across borders, currency transfer restrictions |
| 6 | **Third-Party Data Sharing** | DPA agreements, processor vs. controller distinction, RoPA, sub-processors | Business partnerships, revenue sharing, API integrations not involving personal data |

**Self-check before adding any vulnerability:** ask — "Does this vulnerability directly concern the collection, storage, processing, transfer, or sharing of **personal data**?" If no → discard.

### Step 3 — Regulation Mapping (as guiding framework, not hard law)

Regulations below are used as a **reference framework** to identify risk patterns and best practices — not as mandatory legal prescriptions. Map each subdomain issue to the most relevant regulation to explain *why* it is a risk, but treat them as guidelines informing the severity score, not as blockers in themselves.

| Regulation | Scope | Use as |
|---|---|---|
| **GDPR** | Lawful basis, consent, DPO, DPIA, breach notification, data subject rights | Primary privacy framework — key signal for severity scoring |
| **ePrivacy Directive** | Cookies, tracking, electronic communications | Consent & tracking risk indicator |
| **SCC (Standard Contractual Clauses)** | Cross-border transfers outside EEA | Cross-border transfer risk indicator |
| **Data Act (EU 2023/2854)** | IoT data sharing, B2B/B2G data access, switching obligations | Emerging data sharing risk indicator |

> **Rule:** Regulation references in the output are informational labels that explain the nature of the risk — not legal verdicts. The agent should phrase them as risk signals ("risk of violating...", "may conflict with..."), not as definitive legal rulings.

### Step 4 — Preliminary Vulnerability List
Generate a preliminary list of vulnerabilities **only within the six subdomains above**. For each, note:
- Which of the six subdomains it belongs to
- Which regulation it signals risk against
- Why it is a risk or bottleneck for the described feature

### Step 5 — Scoring
Score each vulnerability on two dimensions (1–10 scale):

**A. Development Cost** (`cost`, 1–10)
Estimate effort to fix/implement:
- 1–3: trivial (config change, label update)
- 4–6: moderate (new service, API integration)
- 7–10: high (architecture change, legal negotiation, new infrastructure)

**B. Severity / Production Blocker** (`severity`, 1–10)
How much does this block or risk production launch:
- 1–3: minor, can ship and fix later
- 4–6: notable, should fix pre-launch
- 7–10: critical, blocks launch or creates major legal/financial exposure

**Final Score formula:**
```
score = cost + (severity × 1.5)
```
Maximum possible = 10 + (10 × 1.5) = 25. Normalize to 10-point scale:
```
normalized_score = score / 2.5
```

**Include in final spec only if `normalized_score > 7.5`.**

### Step 6 — Sort & Format
Sort included vulnerabilities by `normalized_score` descending (highest first).

Format each item concisely (max 2 sentences):
```
N) [Short title] — [problem and fix in 1-2 sentences]. [Regulation reference].
```

Scores are used only for internal filtering and sorting — never include scores or any internal metadata in the output.

### Step 7 — Research & Generate Tasks
Based on `msg` and `context`, research the feature area and generate short actionable improvement suggestions related to Data Protection & Privacy. These are not vulnerabilities — they are things the team *should do* to improve privacy posture, even if not critical blockers.

Rules:
- Each task is 1 short sentence, imperative form ("Implement...", "Add...", "Review..."), ≤ 12 words
- Only tasks relevant to the 6 subdomains — silently ignore anything outside Data Protection
- **Maximum 3 tasks**; if nothing applies — `[]`
- Same language as `msg`
- Do NOT suggest improvements that belong to other agents (AML, payments, crypto, fraud)

### Step 8 — Output
Return:
```json
{
  "spec": "<Domain Header in user's language>\n1) ...\n2) ...",
  "tasks": ["...", "..."]
}
```

---

## Examples

### Example Input
```json
{
  "msg": "Хотим добавить поведенческую аналитику пользователей через пиксели Facebook и Google Analytics 4 с передачей данных на серверы в США",
  "context": "B2C SaaS платформа, пользователи из ЕС, продукт в стадии MVP"
}
```

### Example Output
```json
{
  "spec": "Защита данных и конфиденциальность\n1) Передача данных в США без действующего механизма — после Schrems II передача персональных данных в США через GA4/Meta Pixel без SCCs является незаконной. Заключить SCCs с Google/Meta или перейти на EU-hosted аналитику. GDPR Art. 46, SCC.\n2) Отсутствие lawful basis для поведенческого профилирования — профилирование через пиксели требует явного opt-in согласия. Без consent banner фича незаконна. GDPR Art. 6, ePrivacy Art. 5(3).\n3) DPIA обязательна до запуска — масштабное профилирование пользователей ЕС требует оценки воздействия на данные. Риск штрафа до 4% оборота. GDPR Art. 35.",
  "tasks": [
    "Внедрить consent management platform (CMP) с раздельным opt-in для аналитики и маркетинга.",
    "Заключить DPA с каждым аналитическим провайдером (Google, Meta) по GDPR Art. 28.",
    "Разработать политику retention с автоматическим удалением данных по истечении срока.",
    "Провести TIA для передачи данных в США и задокументировать результат."
  ]
}
```

---

## Edge Cases

- **No high-scoring vulnerabilities**: return `{ "spec": "<domain header>\n" }` — empty spec with header only.
- **Non-EU users only**: still check GDPR if any EU data subjects could be involved; note if truly out of scope.
- **Vague context**: make conservative assumptions (treat as EU-facing B2C) and note assumptions inline.
- **Language**: detect language from `msg` field and respond in that language throughout `spec`.
- **Out-of-scope issues**: if the feature raises concerns about payments, sanctions, AML, crypto licensing, fraud — silently ignore them. They belong to other domain agents. Do NOT include them even as a note or disclaimer.
- **Borderline cases**: if unsure whether an issue belongs to Data Protection — ask "does it involve personal data?" If no, discard.

---

## Reference: Regulation Quick-Ref
See `references/regulations.md` for detailed article references, fines, and enforcement precedents.
