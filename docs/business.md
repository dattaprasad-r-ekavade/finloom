# Finloom business model and product strategy

Working strategy — updated 23 September 2026.

This document captures the founder's confirmed model and recommendations from the product discussion. It distinguishes decisions from proposals and unresolved questions. It is not evidence of regulatory approval, signed provider contracts, accreditation or existing hiring capacity. Engineering findings and implementation release gates remain in [PLAN.md](../PLAN.md) and [release-review-2026-09.md](./release-review-2026-09.md).

## 1. What Finloom is building

**Finloom helps aspiring trading professionals learn market concepts, practise in a simulation, demonstrate their skills, and become eligible to apply for a separate prop-desk role.**

The business should deliver worthwhile education and assessment even to a customer who never obtains employment. That is the central product and commercial test.

### Confirmed by the founder

- Users pay a subscription to participate in simulated trading assessments.
- All trading profits, losses and account balances in this application are virtual. They are not withdrawable and do not result in participant payouts.
- Passing all required stages earns a Finloom approval certificate.
- This certificate is a prerequisite to applying for the firm's prop-desk job. It is not a job offer, automatic employment or an allocation of real capital.
- Any subsequent work with real capital happens through the separately operated prop desk after hiring.
- Historical replay charts and paper trades on old sessions are now a planned core product. Production will use appropriately licensed NSE historical data, directly or through an authorized provider, with every released session at least 30 full days old. This replaces the earlier short-delay feed proposal. Contractual permissions remain to be obtained; no license has been verified.
- Angel One is for internal development/testing only; the launch product does not depend on a live broker feed.

### Proposed additions, not yet committed

- Free foundational education and independent NISM examination preparation.
- Optional paid structured preparation, original mock examinations, explanations and instructor support.
- A learning dashboard, practice journal, verifiable assessment certificates and a separate recruitment workflow.
- Later, an employer-paid assessment service if demand and legal/provider permissions support it.

**Not part of the confirmed application:** cash rewards for simulated profits, customer deposits for trading, simulated-profit withdrawals, or selling immediate access to institutional capital.

## 2. Who the product serves

| Audience | Their main problem | Finloom's useful outcome | Initial priority |
| --- | --- | --- | --- |
| Beginners exploring securities-market careers | Unsure what to learn or which exam fits | Foundations, career/exam guide and a realistic study plan | High |
| Equity-derivatives learners | Difficulty connecting concepts with practical risk | Worked examples, independent Series VIII preparation and controlled practice | Highest |
| Aspiring prop-desk applicants | Need credible evidence of discipline and decision-making | Auditable assessment report and Finloom certificate | High, after assessment integrity is proven |
| Existing NISM-certified candidates | Exam knowledge does not demonstrate practical performance | Optional practice and the same published assessment criteria | Medium |
| Other employers/training institutions | Need consistent candidate assessment | Employer-paid assessment/reporting | Later discovery only |

Initial target: adult Indian learners preparing for equity-derivatives-related careers. Start with English content and validate demand for Hindi explanations before committing to a multilingual catalogue. Do not imply that certification alone makes someone job-ready or guarantees a trading career.

## 3. The product journey

```text
Discover Finloom
      |
      v
Free foundations + diagnostic
      |
      +--> Optional independent NISM preparation
      |            |
      |            +--> Official NISM registration/examination outside Finloom
      |
      v
Practice + feedback
      |
      v
Paid assessment subscription, if customer chooses
      |
      +--> Not yet passed --> report + learning recommendations + optional retry
      |
      v
Pass all required stages --> Finloom assessment certificate
      |
      v
Separate application when relevant vacancies exist
      |
      v
Employer screening/interview --> possible offer --> separate desk onboarding
```

This is not a mandatory sales funnel. Learners may stop after free education, buy only exam preparation, or enter assessment without buying a course. Paid preparation must not change assessment rules or hiring priority. Whether an official NISM qualification is required for a specific vacancy must follow the actual role and applicable requirements.

## 4. How each offering should be used

| Offering | Purpose | What to include | What to measure |
| --- | --- | --- | --- |
| Free learning | Help beginners and establish teaching quality | Glossary, foundations, official-resource links, diagnostic quiz, sample lessons | Diagnostic completion, return visits, learning improvement |
| Paid NISM preparation | Save learners time through better instruction | Original explanations, study plan, original question bank, timed mocks, feedback | Completion, topic mastery, support cost, voluntarily reported exam outcomes |
| Practice environment | Develop skills without assessment pressure, at any time of day | Historical replay, virtual orders, pause/speed/step controls, journal, risk exercises and post-session review | Completed sessions, repeat practice, fewer repeated mistakes, risk understanding |
| Assessment subscription | Evaluate skills consistently | Versioned rules, fixed evaluation windows, auditable decisions, detailed results and appeal path | Completion, scoring consistency, appeals, integrity incidents |
| Finloom certificate | Communicate what the candidate demonstrated | Unique ID, issuer, assessment version, issue date, status, limited verification | Verification success, correction requests, employer usefulness |
| Recruitment | Select suitable people for real work | Actual vacancies, duties, screening, interview and separate offer | Qualified applicants per vacancy, selection outcomes, subsequent job performance |

Avoid making profit target the only definition of skill. Proposed assessment dimensions include risk-limit adherence, position sizing, consistency, drawdown management, decision explanations and operational discipline. Publish objective scoring rules before payment and validate that they predict useful work. Do not silently alter standards to manage the pass rate.

## 5. NISM preparation strategy

### Start narrow

1. **Series VIII: Equity Derivatives** — the first focused preparation track for the proposed audience. Its subject matter aligns with derivatives, risk, settlement and trading concepts. [Official examination description](https://www.nism.ac.in/revamp-nism/nism-series-viii-equity-derivatives-certification-examination/)
2. **Series XII: Securities Markets Foundation** — a beginner learning path; build full preparation only after demand is demonstrated. It targets entry-level securities-market career aspirants. [Official examination description](https://www.nism.ac.in/securities-markets-foundation)

Do not start with every NISM examination. Course maintenance, expert review and question quality are ongoing costs. Add further tracks only when users or real vacancies justify them.

### Free versus paid

| Free access | Optional paid access |
| --- | --- |
| Exam-selection guide and links to official syllabi/workbooks | Structured sequence of original lessons |
| Introductory concepts and glossary | Original question bank with explanations |
| One diagnostic and sample questions | Timed mock exams and topic analysis |
| Sample worked risk/payoff exercises | Detailed exercises and instructor support |
| Clear explanation of official exam registration | Revision planning and progress tracking |

NISM makes official workbook access available through its site. Finloom should monetize its own teaching and feedback, not simply put an official PDF behind a paywall. [NISM resources and disclaimer](https://www.nism.ac.in/disclaimer/)

### Content production and maintenance

- Map lessons/questions to the current official syllabus and test objectives.
- Create original text, diagrams, examples and practice questions. Link to official materials; obtain appropriate permission before reproducing, translating or redistributing protected material.
- Do not use leaked, recalled confidential or purported actual examination questions.
- Assign a named subject-matter reviewer. AI may assist drafting, but unreviewed generated answers are not publishable teaching material.
- Record source references, syllabus version, author/reviewer and last-review date.
- Review official changes before each course release and at least monthly while selling access. Withdraw or correct affected questions when an error is found.
- Provide an easy error-report mechanism and an explanation for each answer, including why plausible alternatives are wrong.
- Keep factual corrections free for learners who bought the affected material; define course-access duration and future-version entitlement at purchase.

### Brand and credential distinction

NISM's published disclaimer states that it has not authorized exam-preparation training partners. Do not describe Finloom as an official or authorized preparation partner or imply endorsement. [NISM disclaimer](https://www.nism.ac.in/disclaimer/)

Use three clearly distinct labels:

| Credential | Issuer | Meaning |
| --- | --- | --- |
| Finloom course-completion record | Finloom | Completed a Finloom learning programme |
| Finloom trading-assessment certificate | Finloom | Met a particular version of Finloom's assessment standard |
| NISM certification | NISM | Obtained through the applicable official NISM process |

Suggested preparation disclosure: **“Independent preparation for the NISM Series VIII examination. Finloom is not affiliated with or endorsed by NISM. Official examination registration, fees and certification are separate.”** Review final branding and any logo use before publication.

## 6. Revenue and pricing design

### Recommended initial approach

- Keep introductory education free.
- Test a fixed-duration preparation pass before adding recurring billing. Exam preparation has a natural end point; permanent auto-renewal may provide poor value.
- Keep the founder's assessment subscription as a separately priced product, with explicit duration, number of attempts, renewal behaviour and cancellation terms.
- Offer a transparent optional bundle only after both products independently provide value. List the standalone prices and what is included.
- Do not charge another mandatory fee just to download a certificate that the customer has already earned.
- Keep job applications separate from checkout; proposed policy is no additional job-application fee.

No numeric price is approved in this strategy. Existing challenge prices must not be treated as validated willingness to pay. Test prices only after knowing content, data, payment and support costs and explaining exactly what learners receive.

### Define before any paid launch

| Decision | Required clarity |
| --- | --- |
| Subscription period | When access starts/ends; calendar period versus assessment period |
| Renewal | Manual renewal for the pilot is recommended; explicit consent and easy cancellation if automatic later |
| Attempts | Number included; whether a retry is free or paid; no surprise fees |
| Platform/data outage | Extension/refund policy; no penalty for Finloom-caused failure |
| Failure | Learning report and appeal rights; no automatic repeated billing to retry |
| Refunds | Eligibility, request channel, response time and processing method |
| Taxes | Display and invoice treatment determined with the CA |
| Official NISM examination | Not included unless explicitly arranged and disclosed; no implied official exam entitlement |

### Unit economics

Track learning and assessment as separate product lines:

```text
Net recognized revenue
  = billed revenue excluding applicable indirect taxes
    - discounts - refunds/credits

Contribution before acquisition
  = net recognized revenue
    - payment processing - variable data/infrastructure
    - variable teaching/support - assessment review cost

Contribution after acquisition
  = contribution before acquisition - attributable acquisition cost

Business result
  = total contribution after acquisition
    - fixed content maintenance - engineering - legal/compliance - other overhead
```

Have finance define allocation and recognition rules. Do not double-count refunds. Measure acquisition payback using contribution, not gross revenue, and use observed cohort retention rather than optimistic lifetime-value assumptions.

Maintain a separate desk budget for real capital, salaries and trading risk. Do not present learner subscriptions as customer trading deposits. Model stressed refund demand and support costs; a business that only works with constant paid retries is poorly aligned with student success.

## 7. Certification and hiring need credible boundaries

The certificate is currently a mandatory prerequisite for applying to the firm's desk. This creates a commercial conflict: Finloom earns money from applicants while the related employer controls hiring. Address that openly.

Recommended policies:

- Disclose the relationship between platform and employer, actual employer identity, vacancy availability and further selection steps.
- State prominently that neither payment nor certification guarantees an interview, offer, salary or trading capital.
- Do not promote a specific available job when no such vacancy exists. If no vacancies exist, sell education/assessment only on its own disclosed value.
- Separate assessment decisions from sales incentives and recruiting quotas. Keep reasons for overrides and revocations auditable.
- Give candidates a result report, appeal procedure and published fraud/misconduct rules.
- Do not imply that a private Finloom certificate has industry-wide recognition. Obtain employer validation before making recognition claims.
- Show fees, expected time commitment and certificate validity rules before enrolment.
- Consider an accessible free-assessment or scholarship route after legal/business review; this is a proposal, not a change to the founder's current mandatory-certificate model.

Certificate implementation should include unique identifiers, evidence and rule-version references, issuance/revocation records, corrections and minimal-data verification. Public verification must not reveal DOB, PAN, address or full trading history. Publish performance details only with appropriate user choice and access controls.

## 8. Market-data strategy and assessment integrity

**Chosen direction:** historical replay charts with paper trading on sessions at least 30 full days old. Treat “one month delayed” as a precise minimum age, not “previous calendar month,” which can be less than 30 days. Use a conservative release buffer and enforce any stricter contractual delay. **Unresolved:** the license for this precise paid learning/assessment use and the recruitment-linked assessment classification.

SEBI's 8 May 2026 circular, effective 1 July 2026, sets a 30-day lag for educational sharing under the described framework, without monetary incentives, and requires appropriate agreements and audit trails. A short commercial delay does not meet that educational condition where applicable. NISM's specific exception does not extend to independent preparation providers. [Official circular](https://www.sebi.gov.in/sebi_data/attachdocs/may-2026/1778242522289.pdf)

NSE offers paid historical products, including order/trade data. Its data policy requires an agreement covering intended use and permits redistribution only as agreed. Purchasing files is not automatically permission to display them to paying subscribers. Request written terms covering charts, replay, paper fills, paid assessment, subscriber distribution, storage, derived bars/analytics, exports, attribution, user limits and audits. [NSE historical products](https://www.nseindia.com/static/market-data/eod-historical-data-subscription), [NSE data policy](https://www.nseindia.com/static/market-data/nse-data-policy)

Specify the actual data resolution before buying: daily OHLC cannot reconstruct intraday replay. Request sample coverage and costs for the proposed instruments, dates and intraday granularity. One-minute bars can support an explicitly simplified simulator; realistic spread/liquidity modelling may need quotes or order/trade data. Do not invent intrabar ticks and present them as observed trades. Confirm any separate index-data rights where needed.

### Use the right data for each activity

| Activity | Recommended design |
| --- | --- |
| NISM conceptual lessons | Original synthetic numerical examples; no live feed needed |
| Payoff/margin/risk exercises | Controlled scenarios with documented assumptions |
| Ungraded practice | Licensed sessions at least 30 days old; visible historical timestamps, pause, step, speed adjustment and explicit restart |
| Certificate assessment | Same eligible archive, separate unseen session pool, authoritative replay clock, immutable attempts and leakage controls |
| Real desk activity | Separate approved brokerage/data environment after hiring |

Historical replay still allows outcome lookup if users identify the date/security. The entire dataset is old in wall-clock time, but future bars relative to an attempt's replay clock must remain inaccessible. Randomized sessions, separate practice/assessment pools and supplementary decision explanations reduce dependence on memorized outcomes; they do not prove someone traded unaided. Any masking must comply with attribution/data terms and must not silently misrepresent instruments. Treat replay performance as one input to recruitment, not definitive evidence of live trading ability.

Store the input prices and timestamps used for every scored decision. Use consistent fill/slippage/cost rules. Never substitute entry prices during feed failures or penalize students for platform outages. Simulation P&L is evidence within an assessment, not evidence that a learner can reproduce the result with real money.

### Why this is a stronger business direction

- Students can practise after college/work or on weekends, without waiting for exchange hours.
- Instructors can teach specific market conditions and review decisions against a known session.
- A reusable archive supports structured exercises and repeatable debugging. Cost savings versus live feeds are a hypothesis until license, storage and support quotations are known.
- Paid value can come from the replay experience, journaling, explanation and feedback rather than from proximity to live prices.
- It fits the stated virtual-P&L model and the educational data-delay direction more closely. It does not by itself clear the mandatory paid certificate/recruitment model.

### Practice and assessment must behave differently

| Behaviour | Practice | Scored assessment |
| --- | --- | --- |
| Pause/speed | Learner controls, within supported limits | Published, standardized policy; server controls advancement |
| Rewind | Separate learning branch/reset, excluded from assessment | No rewind or revision of executed decisions |
| Session selection | Learner chooses a lesson/session | Assigned from an eligible holdout pool |
| Future chart | Revealed only as replay advances; full review after completion | Never sent to client before authorized advancement; review only after terminal state |
| Restart | Freely available within product entitlement | New audited attempt under published retry rules |
| Success measure | Understanding and improved decisions | Consistent risk/scoring rubric plus integrity review |

Initial commercial packaging: free sample replay sessions alongside lessons; optional paid access to a larger licensed library, journal and feedback; separately priced assessment subscription. Unlimited replay access is a pricing proposal subject to license and infrastructure limits, not a promise.

### Small replay pilot

1. Obtain sample data and written scope/price terms before buying a large archive.
2. Start with a narrow instrument set and approximately 20–30 quality-checked sessions spanning different conditions. This is a pilot target, not a representative statistical sample or a current inventory.
3. Launch practice first: chart, virtual order entry, replay controls, journal and end-of-session report.
4. Run an adult learner cohort and measure completed sessions, repeat use, concept improvement, support burden and willingness to pay.
5. Add scored replay only after future-data leakage, fill assumptions and consistent evaluation are tested. Use separate unseen sessions for scoring.

For a first equities replay release, keep NISM derivatives teaching in synthetic exercises until proper historical derivative contracts, expiry/lot metadata and suitable data are supported. Do not promise realistic options replay from underlying price candles alone.

## 9. Positioning and acquisition

Suggested headline: **“Learn market fundamentals. Practise risk management. Demonstrate your trading skills.”**

Suggested assessment description: **“Complete Finloom's simulated assessment to earn a private assessment certificate. Certification is required to apply for our prop-desk roles; selection depends on vacancies and further evaluation.”**

Every purchase page should explain virtual balances, the absence of simulation payouts, data mode, scoring rules, all fees and the outcome being purchased. Replace existing immediate-funding and profit-share claims in the application to match the confirmed model.

Initial acquisition experiments:

1. Publish a useful original beginner guide and sample Series VIII lesson.
2. Invite adult learners from college finance communities and relevant professional groups through transparent outreach.
3. Run a free diagnostic and ask where learners struggle; use this to choose the next lesson.
4. Demonstrate realistic risk exercises and assessment reports rather than profit screenshots.
5. Request testimonials about learning/support only with permission and without editing them into job or earnings promises.

Avoid paid affiliates and broad acquisition spend until completion, refunds and support economics are understood. Do not use guaranteed pass/job/return claims or fabricated scarcity.

## 10. What to validate before expanding

Targets below are proposed pilot decision criteria, not existing performance or industry benchmarks.

| Hypothesis | Experiment | Evidence to seek | Decision |
| --- | --- | --- | --- |
| Students need this learning approach | Interview 10–15 target learners; observe a lesson and diagnostic | Repeated learning problems and improved comprehension | Build one focused module or revise teaching |
| Original explanations justify payment | Offer a small, clearly scoped paid prep pilot after readiness checks | Willingness to pay, completion, low avoidable refunds | Expand only with repeatable value |
| Assessment measures useful skill | Have a desk expert review anonymized reports and benchmark scenarios | Consistent scoring and agreement on candidate strengths/weaknesses | Revise rubric before issuing recruitment-linked certificates |
| Certificates have a credible employment purpose | Compare certificate criteria against real job duties and vacancies | Employer can explain how results affect selection | Narrow claims or redesign certification |
| Customers understand the offer | Ask pilot users to explain fees, certificate and hiring outcome before purchase | At least 90% correctly distinguish preparation, assessment, certification and hiring | Fix wording/flow if misunderstood |
| Operations are viable | Invite-only cohort of roughly 25–50 users | Measured support burden, contribution and reliable results | Expand cautiously or change pricing/scope |

Report exam outcomes only from consented, verified or clearly labelled self-reported data. Show the denominator and missing responses; do not turn a small, selected group into an advertised universal pass rate.

Main dashboard: learning activation, lesson completion, topic improvement, preparation conversion, assessment completion, appeal outcomes, refunds, support response, contribution per customer and hiring outcomes by actual vacancy. Revenue alone does not show whether the model works.

## 11. Execution sequence

### Stage A — Clarify and validate

Owner: founder with counsel, CA and prospective data provider.

- [ ] Document subscription/certificate/application terms and actual employer arrangements.
- [ ] Obtain model-specific legal review, including mandatory paid certification/recruitment and relevant gaming/consumer questions.
- [ ] Obtain historical NSE replay/display/assessment rights and quotations; confirm the minimum 30-day age policy and required intraday resolution.
- [ ] Interview learners and identify a qualified content reviewer.

Exit: a precise offer, known unresolved risks and an evidence-based initial audience. Adding education does not itself settle the assessment-model classification. The [PROG Act](https://www.meity.gov.in/static/uploads/2025/08/4f673438a686e3fa81dd2d277b445f42.pdf) is one relevant input for counsel, not a conclusion that this particular certificate model is prohibited.

### Stage B — Free learning pilot and technical repairs

Owner: content reviewer + product/engineering.

- [ ] Publish one original Series VIII module, a beginner bridge and diagnostic.
- [ ] Pilot a small licensed historical replay library with virtual trades, journaling and post-session review; keep unlicensed sample data out of public delivery.
- [ ] Link official resources and apply independent-provider branding.
- [ ] Measure comprehension and revise explanations.
- [ ] Fix build, security, payment and scoring blockers in `PLAN.md` / `docs/release-review-2026-09.md` before paid assessment.

Exit: useful reviewed learning content, understood customer needs and a reproducible application foundation.

### Stage C — Paid preparation, then controlled assessment

Owner: founder + engineering + support/finance.

- [ ] Test separately priced fixed-duration preparation and the clearly defined assessment subscription.
- [ ] Implement refunds, support, result reports, certificate verification and appeals.
- [ ] Validate assessment against concurrency bugs, bad data and look-ahead exploitation.
- [ ] Run a small invite-only cohort within the approved scope.

Exit: customers understand the offer, results are trustworthy, provider/legal gates are satisfied and unit economics are measured.

### Stage D — Recruitment integration and selective expansion

Owner: desk hiring manager + product.

- [ ] Publish genuine vacancies and separate application stages.
- [ ] Test whether assessment evidence helps interview and hiring decisions.
- [ ] Add further content, languages or employer customers only from demonstrated demand.

Exit: an operating learning-and-assessment business with a credible recruitment connection. Separate real-capital desk onboarding remains subject to its own approvals and controls.

## 12. Decisions still needed

| Decision | Owner | Status |
| --- | --- | --- |
| Legal entity/employer identity and relationship | Founder + counsel | Not verified |
| Exact desk duties, vacancies and selection criteria | Desk manager | Not specified |
| Legality/terms of mandatory paid certification for application | Counsel | Open |
| Historical replay and minimum 30-day-old sessions | Founder/product | Chosen direction; not implemented |
| Provider contract, intraday resolution, archive coverage and replay/distribution rights | Founder + provider + counsel | Open |
| Assessment duration, attempts, renewals and refunds | Product + finance | Open |
| Certificate validity, revocation and appeals | Assessment lead | Open |
| First content reviewer and syllabus version | Content lead | Open |
| Whether to offer Hindi content or scholarships | Product | Pilot decision |
| Initial prices and sustainable cost structure | Founder + finance | Unvalidated |
| Role-specific official certification requirements | Employer + compliance | Must be determined per vacancy |

The most valuable near-term combination is **free foundational learning, one high-quality optional preparation track, and a trustworthy assessment with a clearly limited certificate outcome**. Broader features should follow evidence that students learn, assessment scores mean something, and customers understand what they are buying.
