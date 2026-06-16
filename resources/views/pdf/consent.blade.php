{{-- resources/views/pdfs/consent-form.blade.php --}}
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Triumph Residential Services – Consent Forms</title>
    <style>
        /* ── Reset & Base ─────────────────────────────── */
        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
            font-family: 'DejaVu Sans', Arial, 'Helvetica Neue', sans-serif;
            font-size: 10pt;
            color: #000000;
            background: #ffffff;
            line-height: 1.5;
        }

        /* ── Page Layout ──────────────────────────────── */
        .page {
            width: 100%;
            padding: 40px 45px;
            position: relative;
        }
        .page-break { page-break-before: always; }

        /* ── Global Header (professional strip) ───────── */
        .doc-header {
            border-top: 4px solid #000000;
            border-bottom: 2px solid #000000;
            padding: 8px 0 6px;
            margin-bottom: 28px;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            flex-wrap: wrap;
        }
        .doc-header .org-name {
            font-size: 13pt;
            font-weight: 700;
            letter-spacing: 0.3px;
        }
        .doc-header .meta {
            font-size: 8pt;
            color: #2c3e50;
            text-align: right;
        }

        /* ── Section Title ────────────────────────────── */
        .section-heading {
            text-align: center;
            margin-bottom: 20px;
        }
        .section-heading h2 {
            font-size: 14pt;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.6px;
            border-bottom: 2px solid #000000;
            display: inline-block;
            padding-bottom: 5px;
        }
        .section-heading .form-ref {
            font-size: 8pt;
            color: #2c3e50;
            margin-top: 4px;
        }

        /* ── Body Text / Legal Copy (aligned & justified) ─ */
        .legal-text {
            font-size: 9.6pt;
            text-align: justify;
            margin-bottom: 16px;
            line-height: 1.55;
        }
        .legal-text p { margin-bottom: 10px; }

        /* info rows (clean field lines) */
        .info-grid {
            width: 100%;
            margin-bottom: 20px;
            border-collapse: collapse;
        }
        .info-grid td {
            padding: 4px 6px;
            vertical-align: bottom;
            font-size: 9.5pt;
        }
        .info-grid .lbl {
            font-weight: 700;
            white-space: nowrap;
            width: 150px;
        }
        .info-grid .val {
            border-bottom: 1px solid #000000;
            min-width: 200px;
        }

        /* Signature rows (exact positioning like original pdf but cleaner) */
        .sig-section {
            margin-top: 20px;
        }
        .sig-row {
            display: flex;
            gap: 28px;
            margin-bottom: 28px;
            align-items: flex-end;
            flex-wrap: wrap;
        }
        .sig-field {
            flex: 2;
            min-width: 150px;
        }
        .sig-field .line {
            border-bottom: 1px solid #000000;
            min-height: 38px;
            margin-bottom: 3px;
            display: flex;
            align-items: flex-end;
            padding-bottom: 4px;
        }
        .sig-field .line img {
            max-height: 36px;
            max-width: 100%;
            object-fit: contain;
        }
        .sig-field .field-label {
            font-size: 8pt;
            font-weight: 600;
            color: #1e293b;
            letter-spacing: 0.3px;
        }
        .date-field {
            flex: 1.2;
            min-width: 110px;
        }

        /* Consent disclosure note */
        .policy-alert {
            border-left: 3px solid #b91c1c;
            background: #fef9e3;
            padding: 8px 14px;
            font-size: 8.5pt;
            margin: 14px 0 10px;
        }

        /* Criminal grid - perfectly aligned boxes (like original document style) */
        .crim-grid {
            display: flex;
            flex-wrap: wrap;
            gap: 24px;
            margin-top: 18px;
        }
        .crim-box {
            width: calc(50% - 12px);
            border: 1px solid #888888;
            padding: 14px 18px 16px;
            background: #ffffff;
            box-shadow: none;
        }
        .crim-box .box-num {
            font-weight: 700;
            font-size: 10pt;
            margin-bottom: 12px;
            border-bottom: 1px solid #cccccc;
            padding-bottom: 5px;
        }
        .crim-box .crim-field {
            margin-bottom: 12px;
        }
        .crim-box .crim-field .crim-line {
            border-bottom: 1px solid #000000;
            min-height: 24px;
            font-size: 9.5pt;
            padding: 2px 0;
        }
        .crim-box .crim-field .crim-lbl {
            font-size: 7.5pt;
            color: #2d3e50;
            font-weight: 500;
            margin-top: 3px;
        }
        .sig-line-wrap {
            margin-top: 16px;
        }
        .sig-line-wrap .sig-line {
            border-bottom: 2px solid #111111;
            min-height: 44px;
            display: flex;
            align-items: flex-end;
        }
        .sig-line-wrap .sig-line img {
            max-height: 40px;
            max-width: 100%;
        }
        .sig-line-wrap .sig-lbl {
            font-size: 8pt;
            font-weight: 700;
            margin-top: 4px;
        }

        /* Notice box for criminal page */
        .notice-box {
            border: 1px solid #2c3e50;
            background: #f8fafc;
            padding: 10px 14px;
            font-size: 8.6pt;
            margin: 16px 0 20px;
        }

        /* Member table for affordable housing (clean & structured) */
        .member-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 18px;
        }
        .member-table th {
            background: #000000;
            color: #ffffff;
            padding: 8px 10px;
            font-size: 8.5pt;
            text-align: left;
            font-weight: 600;
        }
        .member-table td {
            border-bottom: 1px solid #cccccc;
            padding: 10px 10px;
            vertical-align: middle;
        }
        .member-table .sig-cell img {
            max-width: 150px;
            max-height: 44px;
            object-fit: contain;
        }
        .member-table tr:last-child td {
            border-bottom: 2px solid #000000;
        }

        /* Footer styling */
        .doc-footer {
            margin-top: 42px;
            border-top: 1px solid #aaaaaa;
            padding-top: 8px;
            display: flex;
            justify-content: space-between;
            font-size: 7.5pt;
            color: #2c3e50;
        }

        .bold { font-weight: 700; }
        .mt-20 { margin-top: 20px; }
        .mt-10 { margin-top: 10px; }
    </style>
</head>
<body>

{{-- ══════════════════════════════════════════════════════════════
     PAGE 1 — APPLICANT / TENANT CONSENT (exact field matching)
══════════════════════════════════════════════════════════════════ --}}
<div class="page">

    {{-- Document Header --}}
    <div class="doc-header">
        <div class="org-name">Triumph Residential Services Inc.</div>
        <div class="meta">
            Session ID: {{ $session_id ?? 'N/A' }}<br>
            Generated: {{ $generated_date ?? now()->format('F j, Y  g:i A') }}
        </div>
    </div>

    <div class="section-heading">
        <h2>Applicant / Tenant Consent</h2>
        <div class="form-ref">Form 1 of 3 – Consumer Report Authorization</div>
    </div>

    <div class="legal-text">
        <p>
            I hereby consent to allow <strong>{{ $org_name ?? 'Triumph Residential Services Inc.' }}</strong>,
            through its designated agent/employee, to obtain and verify my consumer reports, including but not
            limited to, my credit report, criminal information, and eviction information for the purpose of
            determining my eligibility to lease an apartment.
        </p>
        <p>
            I further understand if I lease an apartment, I consent to allow
            <strong>{{ $org_name ?? 'Triumph Residential Services Inc.' }}</strong> and its designated
            agent/employee, for the duration of my lease, to review the following information to assess
            risk, for analytics, for process improvement, and other uses: my consumer reports, including but not
            limited to my credit report, criminal information, eviction information, my rental payment history,
            and occupancy history, and other information.
        </p>
        <p>
            The facts set forth in my application for residency are true and complete. <strong>False,
            fraudulent or misleading information on an application may be grounds for denial of residency
            or subsequent eviction.</strong>
        </p>
    </div>

    {{-- Primary Applicant (always visible with proper null fallback) --}}
    <div class="sig-section">
        <div class="sig-row">
            <div class="sig-field" style="flex:2;">
                <div class="line">{{ $applicant_tenant->applicant_name ?? '' }}</div>
                <div class="field-label">Applicant Name (Printed)</div>
            </div>
            <div class="sig-field" style="flex:2;">
                <div class="line">
                    @if(isset($applicant_tenant->signature) && $applicant_tenant->signature)
                        <img src="{{ $applicant_tenant->signature }}" alt="Signature">
                    @endif
                </div>
                <div class="field-label">Signature</div>
            </div>
            <div class="sig-field date-field">
                <div class="line">
                    {{ isset($applicant_tenant->consent_date) ? \Carbon\Carbon::parse($applicant_tenant->consent_date)->format('m/d/Y') : '' }}
                </div>
                <div class="field-label">Date</div>
            </div>
        </div>
    </div>

    {{-- Co-Applicants / Guarantors loop (dynamic) --}}
    @if(isset($co_applicants) && $co_applicants->count() > 0)
        @foreach($co_applicants as $co)
        <div class="sig-row">
            <div class="sig-field" style="flex:2;">
                <div class="line">{{ $co->name ?? '' }}</div>
                <div class="field-label">Co-Applicant / Guarantor Name (Printed)</div>
            </div>
            <div class="sig-field" style="flex:2;">
                <div class="line">
                    @if(isset($co->signature) && $co->signature)
                        <img src="{{ $co->signature }}" alt="Signature">
                    @endif
                </div>
                <div class="field-label">Signature</div>
            </div>
            <div class="sig-field date-field">
                <div class="line">
                    {{ isset($co->consent_date) ? \Carbon\Carbon::parse($co->consent_date)->format('m/d/Y') : '' }}
                </div>
                <div class="field-label">Date</div>
            </div>
        </div>
        @endforeach
    @else
        {{-- If no co-applicants stored, show one empty row to maintain layout consistency --}}
        <div class="sig-row">
            <div class="sig-field" style="flex:2;"><div class="line"></div><div class="field-label">Co-Applicant/Guarantor Name (Printed)</div></div>
            <div class="sig-field" style="flex:2;"><div class="line"></div><div class="field-label">Signature</div></div>
            <div class="sig-field date-field"><div class="line"></div><div class="field-label">Date</div></div>
        </div>
    @endif

    <div class="doc-footer">
        <span>Triumph Residential Services Inc. – Confidential</span>
        <span>Page 1 of 3</span>
    </div>
</div>

{{-- ══════════════════════════════════════════════════════════════
     PAGE 2 — CRIMINAL BACKGROUND CHECK (waiver & records)
══════════════════════════════════════════════════════════════════ --}}
<div class="page page-break">

    <div class="doc-header">
        <div class="org-name">Triumph Residential Services Inc.</div>
        <div class="meta">TR-4 Criminal Release (Rev. 03/2022)</div>
    </div>

    <div class="section-heading">
        <h2>Applicant's Consent and Release for Criminal Background Check</h2>
        <div class="form-ref">Form 2 of 3 – FCRA Disclosure & Release</div>
    </div>

    <div class="legal-text">
        <p>
            I / We, the undersigned, hereby authorize <strong>Triumph Residential Services</strong> and their
            agents, to conduct a criminal record check on me in connection with a pending application for an
            apartment rental.
        </p>
        <p>
            I / We hereby waive and release any and all claims, causes of actions and demands of every kind,
            nature, and description, arising from any request for and release of criminal records and information.
        </p>
        <p>
            I / We also agree that a photocopy or fax copy of this document shall be valid as the original and
            will suffice as an authorized signature to release information and records, as requested by
            Triumph Residential Services.
        </p>
        <p>
            Applicant acknowledges that it is the policy of the proposed lessor to screen applications for
            convictions of certain felonies within <strong>five (5) years</strong> from the date of conviction,
            and certain misdemeanors involving bodily harm within <strong>three (3) years</strong> from the date
            of conviction. The number of convictions within a particular time period, not to exceed five years,
            will also be considered. Outstanding bench warrants must be reported and will be considered. Due to
            the nature of the housing program, applicants who have been convicted of offenses involving
            <strong>forgery and/or welfare fraud will be denied</strong>.
        </p>
        <p>
            Per federal statute, applicants subject to a <strong>lifetime registration requirement under a State
            Sex Offender Registration Program will be automatically denied</strong>. Felony convictions for the
            sale, manufacture, or distribution of controlled substances will result in denial of the application.
        </p>
    </div>

    <div class="notice-box">
        <strong>✔ ALL ADULT HOUSEHOLD MEMBERS MUST SIGN BELOW.</strong> Failure to sign will result in automatic denial.
    </div>

    {{-- Criminal record boxes — each applicant record is shown in a card style, aligned precisely --}}
    @if(isset($criminal_checks) && $criminal_checks->count() > 0)
    <div class="crim-grid">
        @foreach($criminal_checks as $idx => $check)
        <div class="crim-box">
            <div class="box-num">Applicant {{ $idx + 1 }}</div>
            <div class="crim-field">
                <div class="crim-line">{{ $check->applicant_name ?? '' }}</div>
                <div class="crim-lbl">Full Name (Printed)</div>
            </div>
            <div class="crim-field">
                <div class="crim-line">{{ $check->social_security_no ?? '' }}</div>
                <div class="crim-lbl">Social Security Number</div>
            </div>
            <div class="crim-field">
                <div class="crim-line">
                    {{ isset($check->date_of_birth) ? \Carbon\Carbon::parse($check->date_of_birth)->format('m/d/Y') : '' }}
                </div>
                <div class="crim-lbl">Date of Birth</div>
            </div>
            <div class="crim-field">
                <div class="crim-line">
                    {{ isset($check->today_date) ? \Carbon\Carbon::parse($check->today_date)->format('m/d/Y') : '' }}
                </div>
                <div class="crim-lbl">Today's Date</div>
            </div>
            <div class="sig-line-wrap">
                <div class="sig-line">
                    @if(isset($check->signature) && $check->signature)
                        <img src="{{ $check->signature }}" alt="Signature">
                    @endif
                </div>
                <div class="sig-lbl">Applicant's Signature</div>
            </div>
        </div>
        @endforeach
    </div>
    @else
        {{-- Fallback: show two empty boxes to reflect document structure --}}
        <div class="crim-grid">
            <div class="crim-box"><div class="box-num">Applicant 1</div><div class="crim-field"><div class="crim-line"></div><div class="crim-lbl">Full Name (Printed)</div></div><div class="crim-field"><div class="crim-line"></div><div class="crim-lbl">SSN</div></div><div class="crim-field"><div class="crim-line"></div><div class="crim-lbl">DOB</div></div><div class="crim-field"><div class="crim-line"></div><div class="crim-lbl">Today's Date</div></div><div class="sig-line-wrap"><div class="sig-line"></div><div class="sig-lbl">Signature</div></div></div>
            <div class="crim-box"><div class="box-num">Applicant 2</div><div class="crim-field"><div class="crim-line"></div><div class="crim-lbl">Full Name (Printed)</div></div><div class="crim-field"><div class="crim-line"></div><div class="crim-lbl">SSN</div></div><div class="crim-field"><div class="crim-line"></div><div class="crim-lbl">DOB</div></div><div class="crim-field"><div class="crim-line"></div><div class="crim-lbl">Today's Date</div></div><div class="sig-line-wrap"><div class="sig-line"></div><div class="sig-lbl">Signature</div></div></div>
        </div>
    @endif

    <div class="doc-footer">
        <span>Triumph Residential Services – Criminal Disclosure</span>
        <span>Page 2 of 3</span>
    </div>
</div>

{{-- ══════════════════════════════════════════════════════════════
     PAGE 3 — AFFORDABLE HOUSING CONSENT (TR-6)
══════════════════════════════════════════════════════════════════ --}}
<div class="page page-break">

    <div class="doc-header">
        <div class="org-name">Triumph Residential Services Inc.</div>
        <div class="meta">TR-6 Resident Selection Criteria Acknowledgment</div>
    </div>

    <div class="section-heading">
        <h2>Information to Applicants for <br>Affordable Rental Housing</h2>
        <div class="form-ref">Form 3 of 3 – TR 6 Resident Selection Criteria</div>
    </div>

    <div class="legal-text">
        <p>
            This signature page acknowledges that I / we have been given a copy of the
            <strong>Information to Applicants for Affordable Rental Housing</strong>
            (TR 6 – Resident Selection Criteria). Each adult household member confirms receipt
            of the criteria and understands the application screening process.
        </p>
        <p>
            <strong>All adult members in the household must sign below. Failure to sign will result in automatic denial.</strong>
        </p>
    </div>

    @php
        $headOfHousehold = isset($housing_consents) ? $housing_consents->where('member_type', 'head_household')->first() : null;
        $coHead          = isset($housing_consents) ? $housing_consents->where('member_type', 'co_head')->first() : null;
        $adultMembers    = isset($housing_consents) ? $housing_consents->where('member_type', 'adult_member') : collect();
    @endphp

    <table class="member-table">
        <thead>
            <tr>
                <th style="width:32%;">Household Member Name</th>
                <th style="width:20%;">Role</th>
                <th style="width:33%;">Signature</th>
                <th style="width:15%;">Date</th>
            </tr>
        </thead>
        <tbody>
            @if($headOfHousehold)
            <tr>
                <td>{{ $headOfHousehold->name ?? '' }}</td>
                <td class="bold">Head of Household</td>
                <td class="sig-cell">
                    @if(isset($headOfHousehold->signature) && $headOfHousehold->signature)
                        <img src="{{ $headOfHousehold->signature }}" alt="Signature">
                    @endif
                </td>
                <td>
                    {{ isset($headOfHousehold->consent_date) ? \Carbon\Carbon::parse($headOfHousehold->consent_date)->format('m/d/Y') : '' }}
                </td>
            </tr>
            @endif

            @if($coHead)
            <tr>
                <td>{{ $coHead->name ?? '' }}</td>
                <td class="bold">Co-Head</td>
                <td class="sig-cell">
                    @if(isset($coHead->signature) && $coHead->signature)
                        <img src="{{ $coHead->signature }}" alt="Signature">
                    @endif
                </td>
                <td>
                    {{ isset($coHead->consent_date) ? \Carbon\Carbon::parse($coHead->consent_date)->format('m/d/Y') : '' }}
                </td>
            </tr>
            @endif

            @forelse($adultMembers as $member)
            <tr>
                <td>{{ $member->name ?? '' }}</td>
                <td>Adult Member</td>
                <td class="sig-cell">
                    @if(isset($member->signature) && $member->signature)
                        <img src="{{ $member->signature }}" alt="Signature">
                    @endif
                </td>
                <td>
                    {{ isset($member->consent_date) ? \Carbon\Carbon::parse($member->consent_date)->format('m/d/Y') : '' }}
                </td>
            </tr>
            @empty
                <tr><td colspan="4" style="text-align:center; color:#555;">— No adult members recorded —</td></tr>
            @endforelse
        </tbody>
    </table>

    <div class="doc-footer">
        <span>Triumph Residential Services Inc. – TR-6 Criteria Acknowledgment</span>
        <span>Page 3 of 3</span>
    </div>
</div>

</body>
</html>