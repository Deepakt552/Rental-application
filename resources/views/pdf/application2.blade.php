<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <title>Rental Application - {{ $application_id }}</title>
    <style>
        @page {
            margin: 1cm 1cm 2cm 1cm;
        }

        body {
            font-family: Arial, Helvetica, sans-serif;
            line-height: 1.6;
            color: #000;
            margin: 0;
            padding: 0;
            font-size: 11px;
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
            content: "Page " counter(page);
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
            font-size: 18px;
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
            text-align: left;
            font-weight: bold;
            text-transform: uppercase;
            margin: 20px 0 10px 0;
            font-size: 14px;
            padding-bottom: 3px;
            border-bottom: 1px solid #000;
        }

        .row-table {
            width: 100%;
            margin-bottom: 6px;
            border-collapse: collapse;
        }

        .row-table td {
            vertical-align: bottom;
            padding-bottom: 2px;
        }

        .label-cell {
            white-space: nowrap;
            font-weight: bold;
            padding-right: 5px;
            width: 1%;
        }

        .value-cell {
            border-bottom: 1px solid #000;
            padding-left: 5px;
            font-weight: bold;
        }

        .spacer {
            width: 20px;
        }

        .empty-value {
            color: #ccc;
            font-style: italic;
            font-weight: normal;
        }

        .horizontal-line {
            border-bottom: 1px dashed #ccc;
            margin: 15px 0;
            width: 100%;
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
    @endphp

    <footer>
        Rental Application Summary | &copy; {{ date('Y') }} {{ $applicant->type === 'superadmin' ? 'Excel Residential Services' : 'Triumph Residential Services' }} | <span class="page-number"></span>
    </footer>

    <div class="container">
        <table class="header-table">
            <tr>
                <td style="width: 25%; vertical-align: top;">
                    @if($applicant->type === 'superadmin')
                    <img src="{{ public_path('Excel Residential - Icon.png') }}" style="height: 50px;">
                    @else
                    <img src="{{ public_path('Triumph Logo.png') }}" style="height: 50px;">
                    @endif
                </td>
                <td style="width: 50%; vertical-align: middle; text-align: center;">
                    <div class="title">Rental Application Form</div>
                </td>
                <td style="width: 25%; vertical-align: top; text-align: right;">
                    <div class="timestamp-box">
                        {{ $generated_date }}
                    </div>
                </td>
            </tr>
        </table>
        <!-- PROPERTY INFORMATION -->
        <div class="section-header"> Property Information</div>

        <table class="row-table">
            {{-- <tr>
                <td class="label-cell">Company Name:</td>
                <td class="value-cell">
                    {!! displayVal($applicant->company_name) !!}
                </td>

                <td class="spacer"></td>
            </tr> --}}
        </table>

        <table class="row-table">
            <tr>
                <td class="label-cell">Property Name:</td>
                <td class="value-cell">
                    {!! displayVal($applicant->property_name) !!}
                </td>

                <td class="spacer"></td>

                <td class="label-cell">Property Type:</td>
                <td class="value-cell" style="width: 20%;">
                    {!! displayVal($applicant->property_type) !!}
                </td>
            </tr>
        </table>

        <table class="row-table">
            <tr>
                <td class="label-cell">Desired Move-in Date:</td>
                <td class="value-cell" style="width: 25%;">
                    {!! displayVal(
                    !empty($applicant->desired_move_date)
                    ? \Carbon\Carbon::parse($applicant->desired_move_date)->format('m/d/Y')
                    : null
                    ) !!}
                </td>
            </tr>
        </table>
        <!-- 1. PERSONAL INFORMATION -->
        <div class="section-header">1. Personal Information</div>
        @php $personal = $applicant->personalInformation; @endphp
        <table class="row-table">
            <tr>
                <td class="label-cell">Full Name:</td>
                <td class="value-cell">{!! displayVal(($personal->title ? $personal->title . ' ' : '') . $personal->first_name . ' ' . $personal->last_name) !!}</td>
                <td class="spacer"></td>
                {{-- <td class="label-cell">Preferred Name:</td> --}}
                <td class="value-cell" style="width: 30%;">{!! displayVal($personal->preferred_name) !!}</td>
            </tr>
        </table>
        <table class="row-table">
            <tr>
                <td class="label-cell">Email:</td>
                <td class="value-cell">{!! displayVal($personal->email ?? $applicant->email) !!}</td>
                <td class="spacer"></td>
                <td class="label-cell">Phone:</td>
                <td class="value-cell" style="width: 20%;">{!! displayVal($personal->phone) !!}</td>
                <td class="spacer"></td>
                <td class="label-cell">DOB:</td>
                <td class="value-cell" style="width: 15%;">
                    {!! displayVal(
                    !empty($personal->date_of_birth)
                    ? \Carbon\Carbon::parse($personal->date_of_birth)->format('d/m/Y')
                    : null
                    ) !!}
                </td>

                <td class="spacer"></td>
                <td class="label-cell">Marital Status:</td>
                <td class="value-cell" style="width: 15%;">{!! displayVal($personal->marital_status) !!}</td>
            </tr>
        </table>

        <!-- 2. HOUSEHOLD MEMBERS -->
        <div class="section-header">2. Household Members</div>
        @php $householdMembers = $applicant->householdMembers ?? collect(); @endphp
        @forelse($householdMembers as $member)
        <table class="row-table">
            <tr>
                <td class="label-cell">Member Name:</td>
                <td class="value-cell">{!! displayVal($member->full_name) !!}</td>
                <td class="spacer"></td>
                <td class="label-cell">Relationship:</td>
                <td class="value-cell" style="width: 20%;">{!! displayVal($member->relationship) !!}</td>
                <td class="spacer"></td>
                <td class="label-cell">DOB:</td>
                <td class="value-cell" style="width: 15%;">{!! displayVal($member->date_of_birth ? date('m/d/Y', strtotime($member->date_of_birth)) : null) !!}</td>
            </tr>
        </table>
        @empty
        <div style="padding: 5px; color: #999; font-style: italic;">No additional household members listed.</div>
        @endforelse

        <!-- 3. RESIDENCY HISTORY -->
        <div class="section-header">3. Residency History</div>
        @php $current = $applicant->currentAddress; @endphp
        <table class="row-table">
            <tr>
                <td class="label-cell">Current Address:</td>
                <td class="value-cell">
                    {{
        collect([
            $current->address_line_1,
            $current->address_line_2,
            $current->city,
            $current->state,
            $current->zip_code
        ])->filter(function ($value) {
            return !empty($value) && $value !== 'null';
        })->implode(', ')
    }}
                </td>
            </tr>
        </table>
        <table class="row-table">
            <tr>
                <td class="label-cell">Rent:</td>
                <td class="value-cell" style="width: 15%;">{!! displayVal($current->monthly_rent ? '$' . number_format($current->monthly_rent, 2) : null) !!}</td>
            </tr>
        </table>

        <div class="horizontal-line"></div>
        @php $prev = $applicant->previousAddress; @endphp
        @if($prev && ($prev->previous_address_line_1 || $prev->previous_city))
        <table class="row-table">
            <tr>
                <td class="label-cell">Previous Address:</td>
                <td class="value-cell">{!! displayVal($prev->previous_address_line_1) !!} {!! displayVal($prev->previous_address_line_2) !!}, {!! displayVal($prev->previous_city) !!}, {!! displayVal($prev->previous_state) !!} {!! displayVal($prev->previous_zip_code) !!}</td>
            </tr>
        </table>
        <table class="row-table">
            <tr>
                <td class="label-cell">Rent:</td>
                <td class="value-cell" style="width: 15%;">{!! displayVal($prev->previous_rent ? '$' . number_format($prev->previous_rent, 2) : null) !!}</td>
            </tr>
        </table>
        @endif

        <!-- 4. EMPLOYMENT & INCOME -->
        <div class="section-header">4. Employment & Income</div>
        @php $emp = $applicant->employment ?? new \stdClass(); @endphp
        <table class="row-table">
            <tr>
                <td class="label-cell">Employer Name:</td>
                <td class="value-cell">{!! displayVal($emp->employer_name ?? null) !!}</td>
                <td class="spacer"></td>
                <td class="label-cell">Job Title:</td>
                <td class="value-cell" style="width: 40%;">{!! displayVal($emp->job_title ?? null) !!}</td>
            </tr>
        </table>
        <table class="row-table">
            <tr>
                <td class="label-cell">Monthly Income:</td>
                <td class="value-cell">{!! displayVal(isset($emp->monthly_income) ? '$' . number_format($emp->monthly_income, 2) : null) !!}</td>
                <td class="spacer"></td>
                <td class="label-cell">Employed Since:</td>
                <td class="value-cell" style="width: 20%;">
                    {!! displayVal(
                    !empty($emp->employed_since)
                    ? \Carbon\Carbon::parse($emp->employed_since)->format('m/d/Y')
                    : null
                    ) !!}
                </td>
                <td class="spacer"></td>
                <td class="label-cell">Supervisor:</td>
                <td class="value-cell" style="width: 20%;">{!! displayVal($emp->supervisor_name ?? null) !!}</td>
            </tr>
        </table>

        <!-- 5. SCREENING & SECURITY -->
        <div class="section-header">5. Screening & Security</div>
        @php $screen = $applicant->screening ?? new \stdClass(); @endphp
        <table class="row-table">
            <tr>
                <td class="label-cell">Date of Birth:</td>
                <td class="value-cell">{!! displayVal($screen->date_of_birth ? date('m/d/Y', strtotime($screen->date_of_birth)) : null) !!}</td>
                <td class="spacer"></td>
                <td class="label-cell">SSN/TIN:</td>
                <td class="value-cell">{!! displayVal($screen->ssn ?? null) !!}</td>
                <td class="spacer"></td>
                <td class="label-cell">Gov ID #:</td>
                <td class="value-cell">{!! displayVal($screen->government_id ?? null) !!}</td>
            </tr>
        </table>
        <table class="row-table">
            <tr>
                <td class="label-cell">Ever Evicted:</td>
                <td class="value-cell" style="width: 15%;">{{ $screen->evicted ? 'YES' : 'NO' }}</td>
                <td class="spacer"></td>
                <td class="label-cell">Felony Conviction:</td>
                <td class="value-cell" style="width: 15%;">{{ $screen->felony ? 'YES' : 'NO' }}</td>
                <td class="spacer"></td>
                <td class="label-cell">Legal Case:</td>
                <td class="value-cell" style="width: 15%;">{{ $screen->legal_case ? 'YES' : 'NO' }}</td>
            </tr>
        </table>

        <!-- 6. PETS & VEHICLES -->
        <div class="section-header">6. Pets & Vehicles</div>
        <table class="row-table">
            <tr>
                <td class="label-cell">Pets:</td>
                <td class="value-cell">
                    @forelse($applicant->pets as $pet)
                    {{ $pet->pet_name }} ({{ $pet->pet_type }}){{ !$loop->last ? ', ' : '' }}
                    @empty
                    None
                    @endforelse
                </td>
                <td class="spacer"></td>
                <td class="label-cell">Vehicles:</td>
                <td class="value-cell">
                    @forelse($applicant->vehicles as $vehicle)
                    {{ $vehicle->model }} ({{ $vehicle->plate_number }}){{ !$loop->last ? ', ' : '' }}
                    @empty
                    None
                    @endforelse
                </td>
            </tr>
        </table>

        <!-- 7. EMERGENCY CONTACT -->
        <div class="section-header">7. Emergency Contact</div>
        @php $emergency = $applicant->emergencyContact; @endphp
        <table class="row-table">
            <tr>
                <td class="label-cell">Name:</td>
                <td class="value-cell">{!! displayVal($emergency->full_name) !!}</td>
                <td class="spacer"></td>
                <td class="label-cell">Phone:</td>
                <td class="value-cell" style="width: 25%;">{!! displayVal($emergency->phone) !!}</td>
                <td class="spacer"></td>
                <td class="label-cell">Relationship:</td>
                <td class="value-cell" style="width: 20%;">{!! displayVal($emergency->relationship) !!}</td>
            </tr>
        </table>

    </div>
</body>

</html>