<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Consent Form (Excel) - {{ $session_id }}</title>
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
        .notice-box {
            background: #f8fafc;
            border: 1px solid #000;
            padding: 12px;
            font-weight: bold;
            margin-bottom: 20px;
            font-size: 10px;
            text-align: center;
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
    </style>
</head>
<body>
    @php
        $org_name = "Excel Residential Services";
        $isExcel = true;
    @endphp

    <footer>
        Electronic Consent Record - Generated for {{ $org_name }} | <span class="page-number"></span>
    </footer>

    <div class="container">
        <table class="header-table">
            <tr>
                <td style="width: 25%; vertical-align: top;">
                    <img src="{{ public_path('Excel Residential - Icon.png') }}" style="height: 50px;">
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

        <div class="notice-box">
            <strong>NOTICE:</strong> All applicants and co-applicants/guarantors must sign below. Electronic signatures are considered legally binding.
        </div>

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
            <div style="font-weight: bold; margin-bottom: 10px;">Primary Applicant / Tenant:</div>
            <table class="sig-row">
                <tr>
                    <td class="sig-field" style="width: 45%;">
                        <div class="sig-line" style="padding-top: 25px;">
                            {{ $applicant_tenant->applicant_name ?? $applicant_tenant['applicant_name'] ?? '' }}
                        </div>
                        <div class="field-label">Applicant Name (Printed)</div>
                    </td>
                    <td class="sig-field" style="width: 35%;">
                        <div class="sig-line">
                            @php
                                $signature = $applicant_tenant->signature ?? $applicant_tenant['signature'] ?? '';
                            @endphp
                            @if($signature)
                                <img src="{{ $signature }}" style="max-height: 50px; max-width: 180px; display: block; margin: 0 auto;">
                            @endif
                        </div>
                        <div class="field-label">Signature</div>
                    </td>
                    <td class="sig-field" style="width: 20%;">
                        <div class="sig-line" style="padding-top: 25px;">
                            @php
                                $consentDate = $applicant_tenant->consent_date ?? $applicant_tenant['consent_date'] ?? '';
                            @endphp
                            {{ $consentDate ? \Carbon\Carbon::parse($consentDate)->format('m/d/Y') : '' }}
                        </div>
                        <div class="field-label">Date</div>
                    </td>
                </tr>
            </table>

            @php
                $coApplicants = $co_applicants ?? [];
                if ($coApplicants instanceof \Illuminate\Support\Collection) {
                    $coApplicants = $coApplicants->toArray();
                }
            @endphp

            @if(count($coApplicants) > 0)
                <div class="section-header">Co-Applicant(s) / Guarantor(s)</div>
                @foreach($coApplicants as $co)
                    <table class="sig-row">
                        <tr>
                            <td class="sig-field" style="width: 45%;">
                                <div class="sig-line" style="padding-top: 25px;">
                                    {{ $co['name'] ?? $co->name ?? '' }}
                                </div>
                                <div class="field-label">Co-Applicant Name (Printed)</div>
                            </td>
                            <td class="sig-field" style="width: 35%;">
                                <div class="sig-line">
                                    @php
                                        $coSignature = $co['signature'] ?? $co->signature ?? '';
                                    @endphp
                                    @if($coSignature)
                                        <img src="{{ $coSignature }}" style="max-height: 50px; max-width: 180px; display: block; margin: 0 auto;">
                                    @endif
                                </div>
                                <div class="field-label">Signature</div>
                            </td>
                            <td class="sig-field" style="width: 20%;">
                                <div class="sig-line" style="padding-top: 25px;">
                                    @php
                                        $coDate = $co['consent_date'] ?? $co->consent_date ?? '';
                                    @endphp
                                    {{ $coDate ? \Carbon\Carbon::parse($coDate)->format('m/d/Y') : '' }}
                                </div>
                                <div class="field-label">Date</div>
                            </td>
                        </tr>
                    </table>
                @endforeach
            @endif
        </div>

         <!-- Footer handled by fixed footer --> 
    </div>
</body>
</html>