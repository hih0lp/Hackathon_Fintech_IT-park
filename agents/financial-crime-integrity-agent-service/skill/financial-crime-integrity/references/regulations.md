# Financial Crime & Integrity — Regulatory Reference

## EU / EEA

### AML Directives
- **AMLD4** (2015/849): Risk-based approach, beneficial ownership registers, enhanced due diligence
- **AMLD5** (2018/843): Crypto asset service providers (CASPs) now obliged entities; anonymous prepaid cards restricted; UBO register public access
- **AMLD6** (2018/1673): Criminal liability extension; 22 predicate offences; aiding & abetting included; min 4-year imprisonment

### AML Regulation (AMLR) — 2024
- Direct-application EU regulation (no national transposition needed)
- Covers CASPs, luxury goods dealers, crowdfunding platforms
- Mandatory transaction monitoring for all obliged entities
- Enhanced due diligence for high-risk third countries

### Travel Rule — Transfer of Funds Regulation (TFR / EU 2023/1113)
- Applies to all crypto-asset transfers regardless of amount (no de minimis)
- Originator VASP must transmit: name, account number/address, address/DOB/ID, LEI (if legal entity)
- Beneficiary VASP must verify and screen received data
- Unhosted wallet transfers: collect & verify originator/beneficiary info for transfers ≥ €1,000

### MiCA (Markets in Crypto-Assets Regulation)
- Authorization required for CASPs operating in EU
- Stablecoin issuers: capital requirements, reserve audits
- Market abuse / insider trading rules apply to crypto

### GDPR (2016/679)
- Tension with AML data retention: AML requires 5-year retention, GDPR requires minimization
- Legal basis for AML processing: legal obligation (Art. 6(1)(c))
- Data subject rights can be restricted when AML investigation is ongoing

---

## United States

### Bank Secrecy Act (BSA) / FinCEN
- Customer Identification Program (CIP): identity verification for all account holders
- Customer Due Diligence (CDD) Rule: beneficial ownership for legal entities (≥25% threshold)
- Suspicious Activity Reports (SARs): file within 30 days of detection; 90-day extension available
- Currency Transaction Reports (CTRs): cash transactions ≥ $10,000
- Travel Rule (31 CFR 103.33): transmit originator/beneficiary info for wire transfers ≥ $3,000

### OFAC Sanctions
- SDN (Specially Designated Nationals) List: real-time screening required
- Sectoral sanctions (SSI List): specific transaction types restricted, not full block
- 50% Rule: entities ≥50% owned by SDN are themselves blocked
- No de minimis exemption — any transaction with SDN is prohibited
- OFAC penalties: up to $1M+ per violation (civil); criminal exposure for willful violations

### FinCEN Crypto Guidance
- CVC (Convertible Virtual Currency) exchanges = Money Services Businesses (MSBs)
- Travel Rule applies to crypto transfers ≥ $3,000
- Unhosted wallet guidance: enhanced CDD for transfers >$3,000

---

## United Kingdom

### Money Laundering Regulations 2017 (MLR 2017, amended 2019/2022)
- Obliged entities must apply CDD, EDD, ongoing monitoring
- Risk assessment: firm-wide + individual customer
- Beneficial ownership: verification required (not just collection)
- PEP definition: broad — includes family members and known close associates
- HMRC / FCA as supervisors depending on entity type

### FCA Guidelines
- FG17/6: Financial Crime Guide — detailed AML/KYC expectations
- PS21/19: Crypto asset businesses must register with FCA (Temporary Registration Regime ended)
- Consumer Duty (PS22/9): fairness obligations — relevant to fraud prevention UX

---

## Global / FATF

### FATF 40 Recommendations

**Key recommendations for this domain:**

| # | Topic |
|---|---|
| R.1 | Risk-based approach |
| R.10 | Customer due diligence (CDD) |
| R.11 | Record keeping (5 years minimum) |
| R.12 | Politically Exposed Persons (PEPs) |
| R.13 | Correspondent banking |
| R.15 | New technologies — covers VASPs, crypto |
| R.16 | Wire transfers / Travel Rule |
| R.17 | Reliance on third parties for CDD |
| R.20 | STR reporting |
| R.21 | Tipping-off prohibition |
| R.29 | FIU powers |

### FATF Guidance on Virtual Assets (R.15)
- VASPs must be licensed/registered
- AML/CFT programs required: CDD, record-keeping, STR filing, Travel Rule
- Peer-to-peer (P2P) transactions: countries must assess and mitigate risks

### PEP Definition (FATF)
- **Foreign PEPs**: always EDD regardless of risk
- **Domestic PEPs**: risk-based EDD
- **International org PEPs**: risk-based
- Family members and close associates: include in screening
- De-PEPing: minimum 12–18 months after leaving office (varies by jurisdiction)

---

## Sanctions — Cross-Jurisdictional

### EU Sanctions (CFSP)
- Administered by European External Action Service (EEAS)
- Asset freeze + prohibition on making funds available
- Sectoral sanctions: financial, energy, transport (Russia regime, etc.)
- Dual-use goods: Export Control Regulation (2021/821)

### UN Sanctions
- Security Council resolutions — binding on all member states
- Consolidated UN Sanctions List
- Regimes: DPRK, Iran, Taliban, ISIL/Al-Qaida, etc.

### Screening Requirements (All Jurisdictions)
- Screen at onboarding AND on an ongoing basis (list updates can occur daily)
- Fuzzy matching: account for transliteration, name variants, aliases
- Match rate thresholds: typically 70–85% fuzzy match triggers manual review
- False positive management: document all dispositions

---

## Jurisdiction Risk Tiers (FATF)

| Tier | Status | Action Required |
|---|---|---|
| Black list | High-risk jurisdictions subject to a call for action (e.g., Iran, DPRK, Myanmar) | EDD mandatory; some jurisdictions require prohibition |
| Grey list | Increased monitoring (e.g., UAE historically, Bulgaria, etc.) | EDD recommended; enhanced monitoring |
| White list | Compliant / largely compliant | Standard CDD |

Always check current FATF list — it updates every February and June plenary.

---

## Common Cross-Regulation Conflicts

| Conflict | Resolution |
|---|---|
| GDPR data minimization vs AML 5-year retention | AML legal obligation overrides; document legal basis |
| Travel Rule originator data vs GDPR | Legitimate interest / legal obligation basis; data minimization in transit |
| US OFAC 50% rule vs EU sanctions (no equivalent) | Apply both; US rule is stricter — use it for global entities |
| KYC reliance (outsourcing) — AMLD vs local rules | Third-party reliance permitted under AMLD if provider is regulated in equivalent jurisdiction; document contractually |
