<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title>Consent Forms - {{ $session_id }}</title>
    <style>
        @page {
            margin: 1cm 1cm 2cm 1cm;
        }

        body {
            font-family: Arial, Helvetica, sans-serif;
            line-height: 1.4;
            color: #000;
            margin: 0;
            padding: 0;
            font-size: 11px;
        }

        .container {
            width: 100%;
            margin: 0 auto;
        }

        .header-table {
            width: 100%;
            margin-bottom: 20px;
            border-bottom: 2px solid #000;
            padding-bottom: 10px;
        }

        .title {
            font-size: 16px;
            font-weight: bold;
            text-transform: uppercase;
            text-align: center;
        }

        .timestamp-box {
            border: 1px solid #ccc;
            padding: 4px 8px;
            font-size: 10px;
            color: #666;
            text-align: center;
            display: inline-block;
        }

        .section-header {
            text-align: center;
            font-weight: bold;
            text-transform: uppercase;
            margin: 25px 0 15px 0;
            font-size: 12px;
            padding: 5px;
            border-top: 1px dashed #000;
            border-bottom: 1px dashed #000;
        }

        .legal-text {
            text-align: justify;
            margin-bottom: 20px;
            color: #000;
            font-size: 10.5px;
        }

        .legal-text p {
            margin-bottom: 10px;
        }

        .sig-row {
            width: 100%;
            margin-bottom: 20px;
            border-collapse: collapse;
        }

        .sig-field {
            vertical-align: bottom;
            padding: 0 10px;
        }

        .sig-line {
            border-bottom: 1px solid #000;
            min-height: 40px;
            margin-bottom: 4px;
            position: relative;
            color: #0047AB;
            font-weight: bold;
            padding-left: 5px;
        }

        .sig-line img {
            max-height: 45px;
            max-width: 100%;
            display: block;
            margin-bottom: 8px;
        }

        .field-label {
            font-size: 9px;
            font-weight: bold;
            color: #000;
            text-transform: uppercase;
        }

        .crim-grid {
            width: 100%;
            border-collapse: separate;
            border-spacing: 10px;
        }

        .crim-box {
            border: 1px solid #000;
            padding: 12px;
            background: #fff;
        }

        .box-num {
            font-weight: bold;
            color: #000;
            font-size: 10px;
            margin-bottom: 8px;
            border-bottom: 1px solid #eee;
            padding-bottom: 3px;
        }

        .crim-line {
            border-bottom: 1px solid #000;
            min-height: 18px;
            padding: 2px 0;
            font-weight: bold;
            color: #0047AB;
        }

        .crim-lbl {
            font-size: 8px;
            color: #000;
            font-weight: bold;
            text-transform: uppercase;
            margin-top: 2px;
        }

        .member-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
        }

        .member-table th {
            background: #f0f0f0;
            color: #000;
            padding: 8px;
            font-size: 9px;
            text-align: left;
            font-weight: bold;
            text-transform: uppercase;
            border: 1px solid #000;
        }

        .member-table td {
            padding: 10px 8px;
            border: 1px solid #000;
            font-size: 10px;
            color: #0047AB;
            font-weight: bold;
        }

        footer {
            position: fixed;
            bottom: -1cm;
            left: 0px;
            right: 0px;
            height: 1cm;
            text-align: center;
            font-size: 8px;
            color: #666;
            font-style: italic;
            border-top: 1px solid #ccc;
            padding-top: 5px;
        }

        .page-number:after {
            /* Page number disabled in template because it's added during PDF merge */
        }

        .page-break {
            page-break-after: always;
        }
    </style>
</head>

<body>
    @php
    $org_name = $org_name ?? "Triumph Residential Services Inc.";
    $isExcel = $isExcel ?? false;

    // Fallback for safety if not passed
    if (!isset($org_name) || $org_name == "Triumph Residential Services Inc.") {
    $applicant = \App\Models\Applicant::where('session_id', $session_id)->first();
    if($applicant && $applicant->type === 'superadmin') {
    $isExcel = true;
    $org_name = "Excel Residential Services";
    }
    }
    @endphp

    <footer>
        Electronic Consent Record - Generated for {{ $org_name }} | <span class="page-number"></span>
    </footer>

    {{-- PAGE 1 — APPLICANT / TENANT CONSENT --}}
    <div class="container">
        <table class="header-table">
            <tr>
                <td style="width: 25%; vertical-align: top;">
                    @if($isExcel)
                    <img src="{{ public_path('Excel Residential - Icon.png') }}" style="height: 50px;">
                    @else
                    <img src="{{ public_path('Triumph Logo.png') }}" style="height: 50px;">
                    @endif
                </td>
                <td style="width: 50%; vertical-align: middle; text-align: center;">
                    <div class="title">Applicant / Tenant Consent</div>
                </td>
                <td style="width: 25%; vertical-align: top; text-align: right;">
                    <div class="timestamp-box">
                        {{ $generated_date }}
                    </div>
                </td>
            </tr>
        </table>

        <div class="legal-text">
            <p>
                I hereby consent to allow <strong>{{ $org_name }}</strong>, through its designated agent/employee, to obtain and verify my consumer reports, including but not limited to, my credit report, criminal information, and eviction information for the purpose of determining my eligibility to lease an apartment.
            </p>
            <p>
                I further understand if I lease an apartment, I consent to allow <strong>{{ $org_name }}</strong> and its designated agent/employee, for the duration of my lease, to review the following information to assess risk, for analytics, for process improvement, and other uses: my consumer reports, including but not limited to my credit report, criminal information, eviction information, my rental payment history, and occupancy history, and other information.
            </p>
            <p>
                The facts set forth in my application for residency are true and complete. <strong>False, fraudulent or misleading information on an application may be grounds for denial of residency or subsequent eviction.</strong>
            </p>
        </div>

        <div class="sig-section">
            <table class="sig-row">
                <tr>
                    <td class="sig-field" style="width: 45%;">
                        <div class="sig-line" style="padding-top: 25px;">{{ $applicant_tenant->applicant_name ?? '' }}</div>
                        <div class="field-label">Applicant Name (Printed)</div>
                    </td>
                    <td class="sig-field" style="width: 35%;">
                        <div class="sig-line">
                            @php
                            $sig = $applicant_tenant->signature ?? $applicant_tenant['signature'] ?? null;
                            @endphp
                            @if($sig)
                            <img src="{{ $sig }}" style="max-height: 50px; max-width: 180px; display: block; margin: 0 auto;">
                            @endif
                        </div>
                        <div class="field-label">Signature</div>
                    </td>
                    <td class="sig-field" style="width: 20%;">
                        <div class="sig-line" style="padding-top: 25px;">
                            {{ isset($applicant_tenant->consent_date) ? \Carbon\Carbon::parse($applicant_tenant->consent_date)->format('m/d/Y') : '' }}
                        </div>
                        <div class="field-label">Date</div>
                    </td>
                </tr>
            </table>
        </div>

        @if(count($co_applicants ?? []) > 0)
        <div class="section-header">Co-Applicant(s) / Guarantor(s)</div>
        @foreach($co_applicants as $co)
        <table class="sig-row">
            <tr>
                <td class="sig-field" style="width: 45%;">
                    <div class="sig-line" style="padding-top: 25px;">{{ $co['name'] ?? '' }}</div>
                    <div class="field-label">Co-Applicant Name (Printed)</div>
                </td>
                <td class="sig-field" style="width: 35%;">
                    <div class="sig-line">
                        @php
                        $coSig = $co['signature'] ?? $co->signature ?? null;
                        @endphp
                        @if($coSig)
                        <img src="{{ $coSig }}" style="max-height: 50px; max-width: 180px; display: block; margin: 0 auto;">
                        @endif
                    </div>
                    <div class="field-label">Signature</div>
                </td>
                <td class="sig-field" style="width: 20%;">
                    <div class="sig-line" style="padding-top: 25px;">
                        {{ isset($co['consent_date']) ? \Carbon\Carbon::parse($co['consent_date'])->format('m/d/Y') : '' }}
                    </div>
                    <div class="field-label">Date</div>
                </td>
            </tr>
        </table>
        @endforeach
        @endif

        <!-- Footer handled by fixed footer -->
    </div>

    <div class="page-break"></div>

    {{-- PAGE 2 — CRIMINAL RECORD FORM --}}
    <div class="container">
        <table class="header-table">
            <tr>
                <td style="width: 25%; vertical-align: top;">
                    @if($isExcel)
                    <img src="{{ public_path('Excel Residential - Icon.png') }}" style="height: 50px;">
                    @else
                    <img src="{{ public_path('Triumph Logo.png') }}" style="height: 50px;">
                    @endif
                </td>
                <td style="width: 50%; vertical-align: middle; text-align: center;">
                    <div class="title">APPLICANT'S CONSENT AND RELEASE FOR CRIMINAL BACKGROUND CHECK</div>
                </td>
                <td style="width: 25%; vertical-align: top; text-align: right;">
                    <div class="timestamp-box">
                        {{ $generated_date }}
                    </div>
                </td>
            </tr>
        </table>

        <div class="legal-text" style="margin-top: 15px; font-size: 9pt;">
            <p style="margin-bottom: 8px;">
                I / We, the undersigned, hereby authorize <strong>{{ $org_name }}</strong> and their agents,
                to conduct a criminal record check on me in connection with a pending application for an apartment rental.
            </p>
            <p style="margin-bottom: 8px;">
                I / We hereby waive and release any and all claims, causes of actions and demands of every kind, nature, and description,
                arising from any request for and release of criminal records and information.
            </p>
            <p style="margin-bottom: 8px;">
                I / We also agree that a photocopy or fax copy of this document shall be valid as the original and will suffice as an
                authorized signature to release information and records, as requested by {{ $org_name }}.
            </p>
            <div style="background-color: #f9fafb; padding: 10px; border-left: 3px solid #1a202c; margin-top: 10px;">
                <p style="margin-bottom: 5px;">
                    Applicant acknowledges that it is the policy of the proposed lessor to screen applications for convictions
                    of certain felonies within <strong>five (5) years</strong> from the date of conviction, and certain misdemeanors
                    involving bodily harm within <strong>three (3) years</strong> from the date of conviction.
                </p>
                <p style="margin-bottom: 5px;">
                    The number of convictions within a particular time period, not to exceed five years, will also be considered.
                    Outstanding bench warrants must be reported and will be considered. Due to the nature of the housing program,
                    applicants who have been convicted of offenses involving <strong>forgery and/or welfare fraud will be denied</strong>.
                </p>
                <p>
                    Per federal statute, applicants subject to a <strong>lifetime registration requirement under a State Sex Offender
                        Registration Program will be automatically denied</strong>. Felony convictions for the sale, manufacture, or
                    distribution of controlled substances will result in denial of the application.
                </p>
            </div>
        </div>

        @php
        $checks = $criminal_checks ?? [];
        // If it's a collection, use it, if it's an array, it's already fine.
        @endphp

        @foreach($checks as $index => $crim)
        <div style="margin-top: 20px; border-top: 1px solid #000; padding-top: 10px;">
            <div style="font-weight: bold; font-size: 10pt; margin-bottom: 10px;">Applicant #{{ $index + 1 }} Details:</div>
            <table class="crim-grid">
                <tr>
                    <td style="width: 60%;">
                        <div class="crim-box">
                            <div class="box-num">1. FULL NAME</div>
                            <div class="crim-line">{{ $crim['applicant_name'] ?? $crim->applicant_name ?? '' }}</div>
                            <div class="crim-lbl">Last Name, First Name, Middle Initial</div>
                        </div>
                    </td>
                    <td style="width: 40%;">
                        <div class="crim-box">
                            <div class="box-num">2. DATE OF BIRTH</div>
                            <div class="crim-line">
                                @php $dob = $crim['date_of_birth'] ?? $crim->date_of_birth ?? null; @endphp
                                {{ $dob ? \Carbon\Carbon::parse($dob)->format('m/d/Y') : '' }}
                            </div>
                            <div class="crim-lbl">MM/DD/YYYY</div>
                        </div>
                    </td>
                </tr>
                <tr>
                    <td colspan="2">
                        <div class="crim-box">
                            <div class="box-num">3. SOCIAL SECURITY #</div>
                            <div class="crim-line">{{ $crim['social_security_no'] ?? $crim->social_security_no ?? '' }}</div>
                            <div class="crim-lbl">XXX-XX-XXXX</div>
                        </div>
                    </td>
                </tr>
            </table>

            <table class="sig-row" style="margin-top: 15px;">
                <tr>
                    <td class="sig-field" style="width: 70%;">
                        <div class="sig-line">
                            @php
                            $sig = $crim['signature'] ?? $crim->signature ?? null;
                            @endphp
                            @if($sig)
                            <img src="{{ $sig }}" style="max-height: 40px;">
                            @endif
                        </div>
                        <div class="field-label">Applicant Signature</div>
                    </td>
                    <td class="sig-field" style="width: 30%;">
                        <div class="sig-line">
                            @php $td = $crim['today_date'] ?? $crim->today_date ?? null; @endphp
                            {{ $td ? \Carbon\Carbon::parse($td)->format('m/d/Y') : '' }}
                        </div>
                        <div class="field-label">Date</div>
                    </td>
                </tr>
            </table>
        </div>
        @endforeach

        <!-- Footer handled by fixed footer -->
    </div>

    <div class="page-break"></div>

    {{-- PAGE 3 — HOUSEHOLD MEMBERS --}}
    <div class="container">

        <table class="header-table">
            <tr>
                <td style="width: 25%; vertical-align: top;">
                    @if($isExcel)
                    <img src="{{ public_path('Excel Residential - Icon.png') }}" style="height: 50px;">
                    @else
                    <img src="{{ public_path('Triumph Logo.png') }}" style="height: 50px;">
                    @endif
                </td>

                <td style="width: 50%; vertical-align: middle; text-align: center;">
                    <div class="title">
                        INFORMATION TO APPLICANTS FOR AFFORDABLE RENTAL HOUSING
                    </div>
                </td>

                <td style="width: 25%; vertical-align: top; text-align: right;">
                    <div class="timestamp-box">
                        {{ $generated_date }}
                    </div>
                </td>
            </tr>
        </table>

        <div class="legal-text">
            <p>
                I hereby certify that the following persons will be the only
                individuals occupying the apartment unit:
            </p>
        </div>

        <table
            class="row-table"
            style="width:100%; border-collapse: collapse; margin-top:20px;">
            <thead>
                <tr>
                    <th
                        style="
                        border:1px solid #ccc;
                        padding:8px;
                        background:#f3f3f3;
                        text-align:left;
                    ">
                        Name
                    </th>

                    <th
                        style="
                        border:1px solid #ccc;
                        padding:8px;
                        background:#f3f3f3;
                        text-align:left;
                    ">
                        Date
                    </th>

                    <th
                        style="
                        border:1px solid #ccc;
                        padding:8px;
                        background:#f3f3f3;
                        text-align:center;
                    ">
                        Signature
                    </th>
                </tr>
            </thead>

            <tbody>
                @forelse($housing_consents ?? [] as $m)
                <tr>

                    <td style="border:1px solid #ccc; padding:8px;">
                        {{ $m->name ?? '' }}
                    </td>

                    <td style="border:1px solid #ccc; padding:8px;">
                        {{
                            !empty($m->consent_date)
                                ? \Carbon\Carbon::parse($m->consent_date)->format('m/d/Y')
                                : ''
                        }}
                    </td>

                    <td
                        style="
                            border:1px solid #ccc;
                            padding:8px;
                            text-align:center;
                        ">
                        @if(!empty($m->signature))

                        {{-- IF BASE64 --}}
                        @if(str_contains($m->signature, 'data:image'))

                        <img
                            src="{{ $m->signature }}"
                            alt="Signature"
                            style="height:40px; max-width:120px;">

                        @else

                        {{-- IF STORAGE PATH --}}
                        <img
                            src="{{ public_path('storage/' . $m->signature) }}"
                            alt="Signature"
                            style="height:40px; max-width:120px;">

                        @endif

                        @else
                        N/A
                        @endif
                    </td>

                </tr>
                @empty

                <tr>
                    <td
                        colspan="3"
                        style="
                            text-align:center;
                            color:#999;
                            padding:10px;
                            border:1px solid #ccc;
                        ">
                        No other household members listed.
                    </td>
                </tr>

                @endforelse
            </tbody>
        </table>

        <div class="sig-section" style="margin-top: 40px;">

            <table class="sig-row">
                <tr>

                    <td class="sig-field" style="width: 60%;">

                        <div class="sig-line">

                            @php
                            $headSig =
                            $applicant_tenant->signature
                            ?? $applicant_tenant['signature']
                            ?? null;
                            @endphp

                            @if($headSig)

                            @if(str_contains($headSig, 'data:image'))

                            <img
                                src="{{ $headSig }}"
                                style="
                                        max-height: 50px;
                                        max-width: 180px;
                                        display: block;
                                        margin: 0 auto;
                                    ">

                            @else

                            <img
                                src="{{ public_path('storage/' . $headSig) }}"
                                style="
                                        max-height: 50px;
                                        max-width: 180px;
                                        display: block;
                                        margin: 0 auto;
                                    ">

                            @endif

                            @endif

                        </div>

                        <div class="field-label">
                            Applicant/Tenant Signature
                        </div>

                    </td>

                    <td class="sig-field" style="width: 40%;">

                        <div class="sig-line" style="padding-top: 25px;">

                            {{
                            isset($applicant_tenant->consent_date)
                                ? \Carbon\Carbon::parse(
                                    $applicant_tenant->consent_date
                                  )->format('m/d/Y')
                                : ''
                        }}

                        </div>

                        <div class="field-label">
                            Date Signed
                        </div>

                    </td>

                </tr>
            </table>

        </div>

    </div>
</body>

</html>