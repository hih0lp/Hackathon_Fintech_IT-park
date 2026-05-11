# Regulations Quick Reference

## GDPR (General Data Protection Regulation) — EU 2016/679

### Key Articles
| Article | Topic | Penalty Risk |
|---|---|---|
| Art. 5 | Data principles (minimization, purpose limitation, accuracy) | Up to €20M or 4% global turnover |
| Art. 6 | Lawful basis for processing | Up to €20M or 4% |
| Art. 7 | Consent conditions | Up to €20M or 4% |
| Art. 9 | Special category data (health, biometric, etc.) | Up to €20M or 4% |
| Art. 13/14 | Transparency & privacy notices | Up to €10M or 2% |
| Art. 17 | Right to erasure ("right to be forgotten") | Up to €20M or 4% |
| Art. 20 | Data portability | Up to €20M or 4% |
| Art. 22 | Automated decision-making & profiling | Up to €20M or 4% |
| Art. 25 | Privacy by design & by default | Up to €10M or 2% |
| Art. 28 | Data processor agreements (DPA) | Up to €10M or 2% |
| Art. 32 | Security of processing | Up to €10M or 2% |
| Art. 33 | Breach notification to supervisory authority (72h) | Up to €10M or 2% |
| Art. 35 | Data Protection Impact Assessment (DPIA) | Up to €10M or 2% |
| Art. 44–49 | International data transfers | Up to €20M or 4% |

### When DPIA is mandatory (Art. 35)
- Large-scale processing of special category data
- Systematic monitoring of public areas
- Large-scale profiling
- Automated decision-making with significant effects
- New technologies with high risk

---

## ePrivacy Directive — 2002/58/EC (Cookie Law)

### Key Provisions
| Article | Topic |
|---|---|
| Art. 5(3) | Cookies & tracking — requires prior informed consent (opt-in) |
| Art. 6 | Traffic data — can only be processed for billing/network management |
| Art. 13 | Unsolicited communications (spam) — opt-in required |

### Important Notes
- Applies to ALL tracking (cookies, pixels, fingerprinting, local storage)
- Consent must be: freely given, specific, informed, unambiguous, prior to placement
- "Strictly necessary" cookies are exempt
- ePrivacy Regulation (replacing the Directive) is still pending as of 2025

---

## SCC — Standard Contractual Clauses (2021/914/EU)

### Context
- Required for data transfers from EEA to third countries without adequacy decision
- Replaces old SCCs invalidated by Schrems II (CJEU C-311/18, July 2020)
- USA: EU-US Data Privacy Framework (DPF) adopted July 2023 — adequacy decision in place
  - **BUT**: DPF faces ongoing legal challenges; fallback SCCs still recommended
- Key third countries without adequacy: India, China, Russia, Brazil (as of 2025)

### Modules
| Module | Scenario |
|---|---|
| Module 1 | Controller → Controller |
| Module 2 | Controller → Processor |
| Module 3 | Processor → Processor |
| Module 4 | Processor → Controller |

### Transfer Impact Assessment (TIA)
Required alongside SCCs to assess whether the third country's law undermines SCC protections.

---

## Data Act — EU 2023/2854 (in force Sept 2025)

### Scope
- Applies to IoT devices and related services placed on EU market
- Governs B2B and B2G data sharing rights

### Key Obligations
| Obligation | Who | When |
|---|---|---|
| Data sharing by design | Manufacturers of IoT devices | From product design stage |
| B2B data access | Data holders must share data with users upon request | Art. 4 |
| B2G data access | Data holders may be required to share data with public bodies | Art. 14–22 |
| Switching facilitation | Cloud/service providers must enable easy switching | Art. 23–31 |
| Unfair contract terms prohibition | B2B data sharing contracts | Art. 13 |

### Penalties
- Up to €20M or 4% of global turnover (member state enforcement)

---

## Common Vulnerability Patterns by Subdomain

### Personal Data Processing
- Missing lawful basis → GDPR Art. 6 blocker
- Collecting more data than needed → minimization violation Art. 5(1)(c)
- No retention schedule → Art. 5(1)(e) violation
- Special category data without explicit consent → Art. 9 blocker

### Consent & Tracking
- Pre-ticked checkboxes or bundled consent → invalid under Art. 7
- No consent before cookie placement → ePrivacy Art. 5(3) blocker
- No consent withdrawal mechanism → Art. 7(3) violation
- Dark patterns in consent UI → enforcement trend (CNIL, DPC, etc.)

### Profiling & Behavioral Analytics
- No opt-out for marketing profiling → Art. 21(2) violation
- Automated decisions without human review → Art. 22 blocker
- No disclosure of profiling logic → Art. 13/14 gap

### Data Retention
- Indefinite retention without justification → Art. 5(1)(e) violation
- No deletion triggers in system design → technical debt + legal risk
- Backup retention misaligned with main retention policy → common audit finding

### Cross-Border Transfers
- Data sent to US vendors without DPF/SCC verification → Art. 44 blocker
- Sub-processor chains with non-EEA entities not documented → Art. 28 gap
- No TIA conducted for high-risk countries → SCC implementation gap

### Third-Party Data Sharing
- No DPA with processors (analytics, cloud, CRM vendors) → Art. 28 blocker
- No record of processing activities (RoPA) → Art. 30 violation
- Joint controller arrangement undocumented → Art. 26 gap
