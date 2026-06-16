<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <title>Rental Application - {{ $application_id }}</title>
    <style>
        /* PDF Page Setup */
        @page {
            margin: 1.2cm 1.2cm 1.8cm 1.2cm;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.4;
            color: #0f172a;
            margin: 0;
            padding: 0;
            font-size: 11px;
            background-color: #ffffff;
            -webkit-print-color-adjust: exact;
        }

        /* Running Page Footer */
        footer {
            position: fixed;
            bottom: -1cm;
            left: 0px;
            right: 0px;
            height: 1cm;
            text-align: center;
            font-size: 8.5px;
            color: #64748b;
            border-top: 2px solid #e2e8f0;
            padding-top: 6px;
        }

        .container {
            width: 100%;
            margin: 0 auto;
        }

        /* Master Balance Column Header */
        .header-table {
            width: 100%;
            margin-bottom: 25px;
            border-collapse: collapse;
            border-bottom: 4px solid #114a7f;
        }

        .header-table td {
            padding-bottom: 15px;
        }

        .logo-cell {
            width: 30%; 
            vertical-align: middle;
            text-align: left;
        }

        .logo-img {
            height: 65px; 
            max-width: 200px;
        }

        .title-cell {
            width: 40%; 
            vertical-align: middle; 
            text-align: center;
        }

        .title {
            font-size: 24px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: -0.2px;
            color: #114a7f;
            margin: 0;
            padding: 0;
            line-height: 1.1;
        }

        .meta-cell {
            width: 30%; 
            vertical-align: middle; 
            text-align: right;
        }

        .timestamp-box {
            background-color: #f0f4f8;
            border: 1px solid #d9e2ec;
            border-radius: 6px;
            padding: 8px 12px;
            font-size: 10px;
            color: #102a43;
            font-weight: 700;
            display: inline-block;
            text-align: right;
        }

        /* Section Layouts */
        .section-block {
            margin-bottom: 20px;
            page-break-inside: avoid;
        }

        .section-header {
            background-color: #114a7f;
            color: #ffffff;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.8px;
            padding: 6px 10px;
            font-size: 11px;
            border-radius: 4px;
            margin-bottom: 8px;
        }

        /* Data Grid Structuring */
        .data-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 0px;
        }

        .data-table td {
            padding: 6px 10px;
            vertical-align: top;
        }

        /* Box Container Wrappers */
        .card-wrapper {
            border: 1px solid #e2e8f0;
            border-radius: 6px;
            background-color: #ffffff;
        }

        .card-row-divider {
            border-bottom: 1px solid #e2e8f0;
        }

        .label-text {
            font-size: 8.5px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #475569;
            font-weight: 700;
            display: block;
            margin-bottom: 2px;
        }

        .value-text {
            font-size: 11.5px;
            color: #0f172a;
            font-weight: 700;
            display: block;
        }

        .empty-value {
            color: #94a3b8;
            font-style: italic;
            font-weight: 500;
        }

        /* Badges */
        .badge {
            display: inline-block;
            padding: 3px 10px;
            font-size: 9.5px;
            font-weight: 800;
            border-radius: 12px;
            text-align: center;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .badge-danger {
            background-color: #fee2e2;
            color: #b91c1c;
            border: 1px solid #fca5a5;
        }

        .badge-success {
            background-color: #dcfce7;
            color: #15803d;
            border: 1px solid #86efac;
        }

        /* Table Column Grid Sizing Rules */
        .col-16 { width: 16.66%; }
        .col-20 { width: 20%; }
        .col-25 { width: 25%; }
        .col-30 { width: 30%; }
        .col-33 { width: 33.33%; }
        .col-40 { width: 40%; }
        .col-50 { width: 50%; }
        .col-75 { width: 75%; }
        .col-100 { width: 100%; }

        /* Dynamic Bordered Tables */
        .inner-border-table {
            width: 100%;
            border-collapse: collapse;
            border: 1px solid #e2e8f0;
        }
        .inner-border-table th {
            background-color: #f1f5f9;
            text-align: left;
            font-size: 9px;
            text-transform: uppercase;
            color: #334155;
            font-weight: 700;
            padding: 8px 10px;
            border-bottom: 2px solid #cbd5e1;
        }
        .inner-border-table td {
            padding: 8px 10px;
            border-bottom: 1px solid #e2e8f0;
            background-color: #ffffff;
            font-size: 11px;
            font-weight: 700;
            color: #0f172a;
        }
        .inner-border-table tr:last-child td {
            border-bottom: none;
        }
    </style>
</head>

<body>
    @php
    if (!function_exists('displayVal')) {
        function displayVal($value) {
            if (is_null($value) || $value === '' || $value === 'null' || $value === 'N/A') {
                return '<span class="empty-value">N/A</span>';
            }
            return htmlspecialchars($value, ENT_QUOTES, 'UTF-8');
        }
    }
    
    $personal = $applicant->personalInformation ?? new \stdClass(); 
    $current = $applicant->currentAddress ?? new \stdClass();
    $prev = $applicant->previousAddress ?? null;
    $emp = $applicant->employment ?? new \stdClass();
    $prevEmp = $applicant->previousEmployment ?? null;
    $screen = $applicant->screening ?? new \stdClass();
    @endphp

    <footer>
        Rental Application Summary | &copy; {{ date('Y') }} {{ ($applicant->type ?? '') === 'superadmin' ? 'Excel Residential Services' : 'Triumph Residential Services' }} | <span class="page-number"></span>
    </footer>

    <div class="container">
        <table class="header-table">
            <tr>
                <td class="logo-cell">
                    @if(($applicant->type ?? '') === 'superadmin')
                        <img src="{{ public_path('Excel Residential - Icon.png') }}" class="logo-img">
                    @else
                        <img src="{{ public_path('Triumph Logo.png') }}" class="logo-img">
                    @endif
                </td>
                <td class="title-cell">
                    <h1 class="title">Rental Application</h1>
                </td>
                <td class="meta-cell">
                    <div class="timestamp-box">
                        <span style="font-weight: normal; font-size: 9.5px; color: #486581; display:block;">{{ $generated_date }}</span>
                    </div>
                </td>
            </tr>
        </table>

        <div class="section-block">
            <div class="section-header">Property Information</div>
            <div class="card-wrapper" style="background-color: #f8fafc;">
                <table class="data-table">
                    <tr>
                        <td class="col-50">
                            <span class="label-text">Property Name</span>
                            <span class="value-text" style="color: #114a7f; font-size: 12px;">{!! displayVal($applicant->property_name ?? null) !!}</span>
                        </td>
                        <td class="col-25">
                            <span class="label-text">Property Type</span>
                            <span class="value-text">{!! displayVal($applicant->property_type ?? null) !!}</span>
                        </td>
                        <td class="col-25">
                            <span class="label-text">Desired Move-in Date</span>
                            <span class="value-text" style="color: #114a7f;">
                                {!! displayVal(!empty($applicant->desired_move_date) ? \Carbon\Carbon::parse($applicant->desired_move_date)->format('m/d/Y') : null) !!}
                            </span>
                        </td>
                    </tr>
                </table>
            </div>
        </div>

        <div class="section-block">
            <div class="section-header">Personal Info</div>
            <div class="card-wrapper">
                <table class="data-table card-row-divider">
                    <tr>
                        <td class="col-50">
                            <span class="label-text">Full Name</span>
                            <span class="value-text" style="font-size: 12px; color: #114a7f;">
                                {!! displayVal(((!empty($personal->title) ? $personal->title . ' ' : '') . ($personal->first_name ?? '') . (!empty($personal->middle_name) ? ' ' . $personal->middle_name . ' ' : ' ') . ($personal->last_name ?? ''))) !!}
                            </span>
                        </td>
                        <td class="col-50" style="border-left: 1px solid #e2e8f0;">
                            <span class="label-text">Preferred Name</span>
                            <span class="value-text">{!! displayVal($personal->preferred_name ?? null) !!}</span>
                        </td>
                    </tr>
                </table>
                <table class="data-table">
                    <tr>
                        <td class="col-33">
                            <span class="label-text">Email Address</span>
                            <span class="value-text" style="color: #114a7f;">{!! displayVal($personal->email ?? ($applicant->email ?? null)) !!}</span>
                        </td>
                        <td class="col-25">
                            <span class="label-text">Phone Number</span>
                            <span class="value-text">{!! displayVal($personal->phone ?? null) !!}</span>
                        </td>
                        <td class="col-25">
                            <span class="label-text">Date of Birth</span>
                            <span class="value-text">
                                {!! displayVal(!empty($personal->date_of_birth) ? \Carbon\Carbon::parse($personal->date_of_birth)->format('m/d/Y') : null) !!}
                            </span>
                        </td>
                        <td class="col-16">
                            <span class="label-text">Marital Status</span>
                            <span class="value-text">{!! displayVal($personal->marital_status ?? null) !!}</span>
                        </td>
                    </tr>
                </table>
            </div>
        </div>

        <div class="section-block">
            <div class="section-header">Household Co-Applicants / Members</div>
            @php $householdMembers = collect($applicant->householdMembers ?? []); @endphp
            @if($householdMembers->isNotEmpty())
            <div class="card-wrapper" style="border-radius: 6px; overflow: hidden;">
                <table class="inner-border-table">
                    <thead>
                        <tr>
                            <th>Full Name</th>
                            <th style="width: 30%;">Relationship</th>
                            <th style="width: 25%;">Date of Birth</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach($householdMembers as $member)
                        <tr>
                            <td>{!! displayVal($member->full_name ?? null) !!}</td>
                            <td>{!! displayVal($member->relationship ?? null) !!}</td>
                            <td>{!! displayVal(!empty($member->date_of_birth) ? \Carbon\Carbon::parse($member->date_of_birth)->format('m/d/Y') : null) !!}</td>
                        </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
            @else
            <div style="padding: 12px; color: #64748b; font-style: italic; background-color: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 6px;">No additional household members listed on application.</div>
            @endif
        </div>

        <div class="section-block">
            <div class="section-header">Current Address</div>
            <div class="card-wrapper">
                <table class="data-table card-row-divider" style="background-color: #f0fdf4;">
                    <tr>
                        <td class="col-40">
                            <span class="label-text" style="color: #166534;">Street Address</span>
                            <span class="value-text" style="font-size: 12px; color: #114a7f;">
                                {!! displayVal($current->address_line_1 ?? null) !!} 
                                @if(!empty($current->address_line_2) && $current->address_line_2 !== 'null')
                                    , {!! displayVal($current->address_line_2) !!}
                                @endif
                            </span>
                        </td>
                        <td class="col-20" style="border-left: 1px solid #bbf7d0;">
                            <span class="label-text" style="color: #166534;">City</span>
                            <span class="value-text">{!! displayVal($current->city ?? null) !!}</span>
                        </td>
                        <td class="col-16" style="border-left: 1px solid #bbf7d0;">
                            <span class="label-text" style="color: #166534;">State</span>
                            <span class="value-text">{!! displayVal($current->state ?? null) !!}</span>
                        </td>
                        <td class="col-16" style="border-left: 1px solid #bbf7d0;">
                            <span class="label-text" style="color: #166534;">Zip</span>
                            <span class="value-text">{!! displayVal($current->zip_code ?? null) !!}</span>
                        </td>
                    </tr>
                </table>
                <table class="data-table card-row-divider" style="background-color: #f0fdf4;">
                    <tr>
                        <td class="col-33">
                            <span class="label-text" style="color: #166534;">Country</span>
                            <span class="value-text">{!! displayVal($current->country ?? null) !!}</span>
                        </td>
                        <td class="col-33" style="border-left: 1px solid #bbf7d0;">
                            <span class="label-text" style="color: #166534;">Apt Community</span>
                            <span class="value-text">{!! displayVal($current->apartment_community ?? null) !!}</span>
                        </td>
                        <td class="col-33" style="border-left: 1px solid #bbf7d0;">
                            <span class="label-text" style="color: #166534;">Residency From Date</span>
                            <span class="value-text">{!! displayVal(!empty($current->residency_from_date) ? \Carbon\Carbon::parse($current->residency_from_date)->format('m/d/Y') : null) !!}</span>
                        </td>
                    </tr>
                </table>
                <table class="data-table">
                    <tr>
                        <td class="col-33">
                            <span class="label-text">Monthly Financial Rent</span>
                            <span class="value-text" style="color: #15803d; font-size: 12px;">{!! displayVal(!empty($current->monthly_rent) ? '$' . number_format($current->monthly_rent, 2) : null) !!}</span>
                        </td>
                        <td class="col-33" style="border-left: 1px solid #e2e8f0;">
                            <span class="label-text">Reason for Moving</span>
                            <span class="value-text">{!! displayVal($current->reason_for_moving ?? null) !!}</span>
                        </td>
                        <td class="col-33" style="border-left: 1px solid #e2e8f0;">
                            <span class="label-text">Notice Given?</span>
                            <span class="value-text">{!! displayVal(isset($current->notice_given) ? ($current->notice_given ? 'Yes' : 'No') : null) !!}</span>
                        </td>
                    </tr>
                </table>
            </div>
        </div>

        <div class="section-block">
            <div class="section-header">Previous Address <span style="font-size:9px; font-weight:normal; text-transform:none; color:#cbd5e1;">(Optional)</span></div>
            @if($prev && ($prev->previous_address_line_1 || $prev->previous_city))
            <div class="card-wrapper">
                <table class="data-table card-row-divider" style="background-color: #fafafa;">
                    <tr>
                        <td class="col-40">
                            <span class="label-text">Street Address</span>
                            <span class="value-text" style="font-size: 12px;">
                                {!! displayVal($prev->previous_address_line_1) !!}
                                @if(!empty($prev->previous_address_line_2) && $prev->previous_address_line_2 !== 'null')
                                    , {!! displayVal($prev->previous_address_line_2) !!}
                                @endif
                            </span>
                        </td>
                        <td class="col-20" style="border-left: 1px solid #e2e8f0;">
                            <span class="label-text">City</span>
                            <span class="value-text">{!! displayVal($prev->previous_city) !!}</span>
                        </td>
                        <td class="col-16" style="border-left: 1px solid #e2e8f0;">
                            <span class="label-text">State</span>
                            <span class="value-text">{!! displayVal($prev->previous_state) !!}</span>
                        </td>
                        <td class="col-16" style="border-left: 1px solid #e2e8f0;">
                            <span class="label-text">Zip</span>
                            <span class="value-text">{!! displayVal($prev->previous_zip_code) !!}</span>
                        </td>
                    </tr>
                </table>
                <table class="data-table card-row-divider" style="background-color: #fafafa;">
                    <tr>
                        <td class="col-50">
                            <span class="label-text">Country</span>
                            <span class="value-text">{!! displayVal($prev->previous_country) !!}</span>
                        </td>
                        <td class="col-50" style="border-left: 1px solid #e2e8f0;">
                            <span class="label-text">Apt / Community</span>
                            <span class="value-text">{!! displayVal($prev->previous_apartment) !!}</span>
                        </td>
                    </tr>
                </table>
                <table class="data-table" style="background-color: #ffffff;">
                    <tr>
                        <td class="col-25">
                            <span class="label-text">Residency From Date</span>
                            <span class="value-text">{!! displayVal(!empty($prev->previous_from_date) ? \Carbon\Carbon::parse($prev->previous_from_date)->format('m/d/Y') : null) !!}</span>
                        </td>
                        <td class="col-25" style="border-left: 1px solid #e2e8f0;">
                            <span class="label-text">Residency To Date</span>
                            <span class="value-text">{!! displayVal(!empty($prev->previous_to_date) ? \Carbon\Carbon::parse($prev->previous_to_date)->format('m/d/Y') : null) !!}</span>
                        </td>
                        <td class="col-20" style="border-left: 1px solid #e2e8f0;">
                            <span class="label-text">Previous Rent</span>
                            <span class="value-text" style="color: #475569;">{!! displayVal($prev->previous_rent ? '$' . number_format($prev->previous_rent, 2) : null) !!}</span>
                        </td>
                        <td class="col-30" style="border-left: 1px solid #e2e8f0;">
                            <span class="label-text">Reason for Moving</span>
                            <span class="value-text">{!! displayVal($prev->previous_reason) !!}</span>
                        </td>
                    </tr>
                </table>
            </div>
            @else
            <div style="padding: 12px; color: #94a3b8; font-style: italic; background-color: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 6px;">No historical legacy addresses declared.</div>
            @endif
        </div>

        <div class="section-block">
            <div class="section-header">Employment</div>
            <div class="card-wrapper">
                <table class="data-table card-row-divider">
                    <tr>
                        <td class="col-33">
                            <span class="label-text">Employer Name</span>
                            <span class="value-text" style="font-size: 12px; color: #114a7f;">{!! displayVal($emp->employer_name ?? null) !!}</span>
                        </td>
                        <td class="col-33" style="border-left: 1px solid #e2e8f0;">
                            <span class="label-text">Job Position Title</span>
                            <span class="value-text" style="font-size: 12px;">{!! displayVal($emp->job_title ?? null) !!}</span>
                        </td>
                        <td class="col-33" style="border-left: 1px solid #e2e8f0;">
                            <span class="label-text">Employment Status</span>
                            <span class="value-text" style="font-size: 12px;">{!! displayVal($emp->employment_status ?? null) !!}</span>
                        </td>
                    </tr>
                </table>
                <table class="data-table card-row-divider" style="background-color: #fafafa;">
                    <tr>
                        <td class="col-40">
                            <span class="label-text">Employer Address</span>
                            <span class="value-text" style="font-size: 11.5px;">
                                {!! displayVal($emp->employer_address_1 ?? null) !!} 
                                @if(!empty($emp->employer_address_2) && $emp->employer_address_2 !== 'null')
                                    , {!! displayVal($emp->employer_address_2) !!}
                                @endif
                            </span>
                        </td>
                        <td class="col-20" style="border-left: 1px solid #e2e8f0;">
                            <span class="label-text">City</span>
                            <span class="value-text">{!! displayVal($emp->employer_city ?? null) !!}</span>
                        </td>
                        <td class="col-16" style="border-left: 1px solid #e2e8f0;">
                            <span class="label-text">State</span>
                            <span class="value-text">{!! displayVal($emp->employer_state ?? null) !!}</span>
                        </td>
                        <td class="col-16" style="border-left: 1px solid #e2e8f0;">
                            <span class="label-text">Zip</span>
                            <span class="value-text">{!! displayVal($emp->employer_zip ?? null) !!}</span>
                        </td>
                    </tr>
                </table>
                <table class="data-table card-row-divider" style="background-color: #fafafa;">
                    <tr>
                        <td class="col-50">
                            <span class="label-text">Country</span>
                            <span class="value-text">{!! displayVal($emp->employment_country ?? null) !!}</span>
                        </td>
                        <td class="col-50" style="border-left: 1px solid #e2e8f0;">
                            <span class="label-text">Employer Phone</span>
                            <span class="value-text">{!! displayVal($emp->employer_phone ?? null) !!}</span>
                        </td>
                    </tr>
                </table>
                <table class="data-table" style="background-color: #f0fdf4;">
                    <tr>
                        <td class="col-20">
                            <span class="label-text" style="color: #166534;">Gross Income</span>
                            <span class="value-text" style="color: #15803d; font-size: 12px;">{!! displayVal(isset($emp->monthly_income) ? '$' . number_format($emp->monthly_income, 2) : null) !!}</span>
                        </td>
                        <td class="col-20" style="border-left: 1px solid #bbf7d0;">
                            <span class="label-text" style="color: #166534;">Add. Income</span>
                            <span class="value-text" style="color: #15803d; font-size: 12px;">{!! displayVal(isset($emp->additional_income) ? '$' . number_format($emp->additional_income, 2) : null) !!}</span>
                        </td>
                        <td class="col-20" style="border-left: 1px solid #bbf7d0;">
                            <span class="label-text" style="color: #166534;">Income Source</span>
                            <span class="value-text">{!! displayVal($emp->additional_income_source ?? null) !!}</span>
                        </td>
                        <td class="col-20" style="border-left: 1px solid #bbf7d0;">
                            <span class="label-text" style="color: #166534;">Employed Since</span>
                            <span class="value-text">
                                {!! displayVal(!empty($emp->employed_since) ? \Carbon\Carbon::parse($emp->employed_since)->format('m/d/Y') : null) !!}
                            </span>
                        </td>
                        <td class="col-20" style="border-left: 1px solid #bbf7d0;">
                            <span class="label-text" style="color: #166534;">Supervisor Ref.</span>
                            <span class="value-text">{!! displayVal($emp->supervisor_name ?? null) !!}</span>
                        </td>
                    </tr>
                </table>
            </div>
        </div>

        <div class="section-block">
            <div class="section-header">Previous Employment <span style="font-size:9px; font-weight:normal; text-transform:none; color:#cbd5e1;">(Optional)</span></div>
            @if($prevEmp && !empty($prevEmp->previous_employer_name))
            <div class="card-wrapper">
                <table class="data-table card-row-divider" style="background-color: #fafafa;">
                    <tr>
                        <td class="col-50">
                            <span class="label-text">Past Employer Name</span>
                            <span class="value-text" style="font-size: 11.5px;">{!! displayVal($prevEmp->previous_employer_name) !!}</span>
                        </td>
                        <td class="col-50" style="border-left: 1px solid #e2e8f0;">
                            <span class="label-text">Former Job Title</span>
                            <span class="value-text" style="font-size: 11.5px;">{!! displayVal($prevEmp->previous_job_title) !!}</span>
                        </td>
                    </tr>
                </table>
                <table class="data-table card-row-divider" style="background-color: #fafafa;">
                    <tr>
                        <td class="col-40">
                            <span class="label-text">Employer Address</span>
                            <span class="value-text" style="font-size: 11.5px;">
                                {!! displayVal($prevEmp->previous_employer_address_1 ?? null) !!} 
                                @if(!empty($prevEmp->previous_employer_address_2) && $prevEmp->previous_employer_address_2 !== 'null')
                                    , {!! displayVal($prevEmp->previous_employer_address_2) !!}
                                @endif
                            </span>
                        </td>
                        <td class="col-20" style="border-left: 1px solid #e2e8f0;">
                            <span class="label-text">City</span>
                            <span class="value-text">{!! displayVal($prevEmp->previous_employer_city ?? null) !!}</span>
                        </td>
                        <td class="col-16" style="border-left: 1px solid #e2e8f0;">
                            <span class="label-text">State</span>
                            <span class="value-text">{!! displayVal($prevEmp->previous_employer_state ?? null) !!}</span>
                        </td>
                        <td class="col-16" style="border-left: 1px solid #e2e8f0;">
                            <span class="label-text">Zip</span>
                            <span class="value-text">{!! displayVal($prevEmp->previous_employer_zip ?? null) !!}</span>
                        </td>
                    </tr>
                </table>
                <table class="data-table card-row-divider" style="background-color: #fafafa;">
                    <tr>
                        <td class="col-100">
                            <span class="label-text">Employer Phone</span>
                            <span class="value-text">{!! displayVal($prevEmp->previous_employer_phone ?? null) !!}</span>
                        </td>
                    </tr>
                </table>
                <table class="data-table" style="background-color: #ffffff;">
                    <tr>
                        <td class="col-16">
                            <span class="label-text">Start Date</span>
                            <span class="value-text">{!! displayVal(!empty($prevEmp->previous_start_date) ? \Carbon\Carbon::parse($prevEmp->previous_start_date)->format('m/d/Y') : null) !!}</span>
                        </td>
                        <td class="col-16" style="border-left: 1px solid #e2e8f0;">
                            <span class="label-text">End Date</span>
                            <span class="value-text">{!! displayVal(!empty($prevEmp->previous_end_date) ? \Carbon\Carbon::parse($prevEmp->previous_end_date)->format('m/d/Y') : null) !!}</span>
                        </td>
                        <td class="col-16" style="border-left: 1px solid #e2e8f0;">
                            <span class="label-text">Monthly Inc.</span>
                            <span class="value-text" style="color: #475569;">{!! displayVal(isset($prevEmp->previous_monthly_income) ? '$' . number_format($prevEmp->previous_monthly_income, 2) : null) !!}</span>
                        </td>
                        <td class="col-16" style="border-left: 1px solid #e2e8f0;">
                            <span class="label-text">Add. Inc.</span>
                            <span class="value-text" style="color: #475569;">{!! displayVal(isset($prevEmp->previous_additional_income) ? '$' . number_format($prevEmp->previous_additional_income, 2) : null) !!}</span>
                        </td>
                        <td class="col-16" style="border-left: 1px solid #e2e8f0;">
                            <span class="label-text">Income Source</span>
                            <span class="value-text">{!! displayVal($prevEmp->previous_income_source ?? null) !!}</span>
                        </td>
                        <td class="col-20" style="border-left: 1px solid #e2e8f0;">
                            <span class="label-text">Supervisor</span>
                            <span class="value-text">{!! displayVal($prevEmp->previous_supervisor_name ?? null) !!}</span>
                        </td>
                    </tr>
                </table>
            </div>
            @else
            <div style="padding: 12px; color: #94a3b8; font-style: italic; background-color: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 6px;">No historical background employment logs provided.</div>
            @endif
        </div>

        <div class="section-block">
            <div class="section-header">Screening</div>
            <div class="card-wrapper">
                <table class="data-table card-row-divider" style="background-color: #fafafa;">
                    <tr>
                        <td class="col-25">
                            <span class="label-text">DOB</span>
                            <span class="value-text" style="font-size: 11.5px; color: #114a7f;">{!! displayVal(!empty($screen->date_of_birth) ? \Carbon\Carbon::parse($screen->date_of_birth)->format('m/d/Y') : null) !!}</span>
                        </td>
                        <td class="col-25" style="border-left: 1px solid #e2e8f0;">
                            <span class="label-text">SSN/TIN</span>
                            <span class="value-text" style="font-size: 11.5px; letter-spacing: 0.5px;">{!! displayVal($screen->ssn ?? (!empty($screen->has_ssn) ? 'Yes' : 'No')) !!}</span>
                        </td>
                        <td class="col-25" style="border-left: 1px solid #e2e8f0;">
                            <span class="label-text">Gov Issued ID</span>
                            <span class="value-text" style="font-size: 11.5px;">{!! displayVal($screen->government_id ?? null) !!}</span>
                        </td>
                        <td class="col-25" style="border-left: 1px solid #e2e8f0;">
                            <span class="label-text">Issuing Entity</span>
                            <span class="value-text" style="font-size: 11.5px;">{!! displayVal($screen->issuing_entity ?? null) !!}</span>
                        </td>
                    </tr>
                </table>
                <table class="data-table card-row-divider" style="background-color: #f8fafc;">
                    <tr>
                        <td class="col-33" style="text-align: center; padding: 12px 5px;">
                            <span class="label-text" style="margin-bottom: 4px;">Eviction History</span>
                            <span class="badge {{ !empty($screen->evicted) ? 'badge-danger' : 'badge-success' }}">
                                {{ !empty($screen->evicted) ? 'Eviction Logged' : 'Clean Record' }}
                            </span>
                        </td>
                        <td class="col-33" style="text-align: center; padding: 12px 5px; border-left: 1px solid #e2e8f0; border-right: 1px solid #e2e8f0;">
                            <span class="label-text" style="margin-bottom: 4px;">Felony Convictions</span>
                            <span class="badge {{ !empty($screen->felony) ? 'badge-danger' : 'badge-success' }}">
                                {{ !empty($screen->felony) ? 'Record Found' : 'Clean Record' }}
                            </span>
                        </td>
                        <td class="col-33" style="text-align: center; padding: 12px 5px;">
                            <span class="label-text" style="margin-bottom: 4px;">Pending Litigation</span>
                            <span class="badge {{ !empty($screen->legal_case) ? 'badge-danger' : 'badge-success' }}">
                                {{ !empty($screen->legal_case) ? 'Action Pending' : 'No Action' }}
                            </span>
                        </td>
                    </tr>
                </table>
                @if(!empty($screen->evicted) || !empty($screen->felony) || !empty($screen->legal_case))
                <table class="data-table" style="background-color: #fff1f2;">
                    <tr>
                        @if(!empty($screen->evicted))
                        <td class="col-33">
                            <span class="label-text" style="color: #9f1239;">Eviction Reason</span>
                            <span class="value-text">{!! displayVal($screen->eviction_reason ?? null) !!}</span>
                        </td>
                        @endif
                        @if(!empty($screen->felony))
                        <td class="col-33">
                            <span class="label-text" style="color: #9f1239;">Felony Reason</span>
                            <span class="value-text">{!! displayVal($screen->felony_reason ?? null) !!}</span>
                        </td>
                        @endif
                        @if(!empty($screen->legal_case))
                        <td class="col-33">
                            <span class="label-text" style="color: #9f1239;">Legal Case Details</span>
                            <span class="value-text">{!! displayVal($screen->legal_case_details ?? null) !!}</span>
                        </td>
                        @endif
                    </tr>
                </table>
                @endif
            </div>
        </div>

        <div class="section-block">
            <div class="section-header">Pets <span style="font-size:9px; font-weight:normal; text-transform:none; color:#cbd5e1;">(Optional)</span></div>
            @php $pets = collect($applicant->pets ?? []); @endphp
            @if($pets->isNotEmpty())
            <div class="card-wrapper" style="border-radius:6px; overflow:hidden;">
                <table class="inner-border-table">
                    <thead>
                        <tr>
                            <th>Pet Name</th>
                            <th>Type</th>
                            <th>Breed</th>
                            <th>Age</th>
                            <th>Weight</th>
                            <th>Color</th>
                            <th>Vaccinated?</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach($pets as $pet)
                        <tr>
                            <td style="color: #114a7f;">{!! displayVal($pet->pet_name ?? null) !!}</td>
                            <td>{!! displayVal($pet->pet_type ?? null) !!}</td>
                            <td>{!! displayVal($pet->breed ?? null) !!}</td>
                            <td>{!! displayVal($pet->age ?? null) !!}</td>
                            <td>{!! displayVal($pet->weight ?? null) !!}</td>
                            <td>{!! displayVal($pet->color ?? null) !!}</td>
                            <td>{!! displayVal(isset($pet->vaccinated) ? ($pet->vaccinated ? 'Yes' : 'No') : null) !!}</td>
                        </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
            @else
            <div style="padding: 12px; color: #94a3b8; font-style: italic; background-color: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 6px;">No pets declared on profile metadata.</div>
            @endif
        </div>

        <div class="section-block">
            <div class="section-header">Vehicles <span style="font-size:9px; font-weight:normal; text-transform:none; color:#cbd5e1;">(Optional)</span></div>
            @php $vehicles = collect($applicant->vehicles ?? []); @endphp
            @if($vehicles->isNotEmpty())
            <div class="card-wrapper" style="border-radius:6px; overflow:hidden;">
                <table class="inner-border-table">
                    <thead>
                        <tr>
                            <th>Type</th>
                            <th>Model / Make</th>
                            <th>License Plate</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach($vehicles as $vehicle)
                        <tr>
                            <td>{!! displayVal($vehicle->vehicle_type ?? null) !!}</td>
                            <td style="color: #114a7f;">{!! displayVal($vehicle->model ?? null) !!}</td>
                            <td>{!! displayVal($vehicle->plate_number ?? null) !!}</td>
                        </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
            @else
            <div style="padding: 12px; color: #94a3b8; font-style: italic; background-color: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 6px;">No logistical vehicles declared.</div>
            @endif
        </div>

        <div class="section-block">
            <div class="section-header">Emergency Contact</div>
            @php $emergency = $applicant->emergencyContact ?? new \stdClass(); @endphp
            <div class="card-wrapper" style="background-color: #fffaf0; border-left: 4px solid #f59e0b;">
                <table class="data-table card-row-divider">
                    <tr>
                        <td class="col-40">
                            <span class="label-text">Contact Full Name</span>
                            <span class="value-text" style="color: #78350f;">{!! displayVal($emergency->full_name ?? null) !!}</span>
                        </td>
                        <td class="col-30">
                            <span class="label-text">Relationship Profile</span>
                            <span class="value-text" style="color: #78350f;">{!! displayVal($emergency->relationship ?? null) !!}</span>
                        </td>
                        <td class="col-30">
                            <span class="label-text">Primary Phone</span>
                            <span class="value-text" style="color: #78350f;">{!! displayVal($emergency->phone ?? null) !!}</span>
                        </td>
                    </tr>
                </table>
                <table class="data-table card-row-divider">
                    <tr>
                        <td class="col-40">
                            <span class="label-text">Address</span>
                            <span class="value-text">
                                {!! displayVal($emergency->address_line_1 ?? null) !!}
                                @if(!empty($emergency->address_line_2) && $emergency->address_line_2 !== 'null')
                                    , {!! displayVal($emergency->address_line_2) !!}
                                @endif
                            </span>
                        </td>
                        <td class="col-20" style="border-left: 1px solid #fde68a;">
                            <span class="label-text">City</span>
                            <span class="value-text">{!! displayVal($emergency->city ?? null) !!}</span>
                        </td>
                        <td class="col-16" style="border-left: 1px solid #fde68a;">
                            <span class="label-text">State</span>
                            <span class="value-text">{!! displayVal($emergency->state ?? null) !!}</span>
                        </td>
                        <td class="col-16" style="border-left: 1px solid #fde68a;">
                            <span class="label-text">Zip</span>
                            <span class="value-text">{!! displayVal($emergency->zip_code ?? null) !!}</span>
                        </td>
                    </tr>
                </table>
                <table class="data-table">
                    <tr>
                        <td class="col-50">
                            <span class="label-text">Email Address</span>
                            <span class="value-text">{!! displayVal($emergency->email ?? null) !!}</span>
                        </td>
                        <td class="col-50" style="border-left: 1px solid #fde68a;">
                            <span class="label-text">Country</span>
                            <span class="value-text">{!! displayVal($emergency->country ?? null) !!}</span>
                        </td>
                    </tr>
                </table>
            </div>
        </div>

    </div>
</body>
</html>