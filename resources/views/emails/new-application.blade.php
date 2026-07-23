@php
    $isExcel = (isset($applicant) && (($applicant->type ?? '') === 'superadmin' || str_contains(strtolower($applicant->company_name ?? ''), 'excel')));
    $brandName = $isExcel ? 'Excel Residential Services' : 'Triumph Residential Services';
    $primaryColor = $isExcel ? '#16a34a' : '#0e4a81';
    $secondaryColor = $isExcel ? '#15803d' : '#0a3d6a';
    $bgColor = $isExcel ? '#f0fdf4' : '#f0f7ff';
    $logoUrl = $isExcel ? 'https://ersila.com/Excel%20Residential%20-%20Icon.png' : 'https://ersila.com/Triumph%20Logo.png';
    $adminUrl = 'https://ersila.com/admin/applications/' . $applicant->id;
@endphp
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Rental Application - {{ $brandName }}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Hanken Grotesk', 'Segoe UI', Arial, sans-serif;
            line-height: 1.6;
            color: #1f2937;
            background-color: #f3f4f6;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 30px auto;
            background: white;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05);
            border: 1px solid #e5e7eb;
        }
        .header {
            background: linear-gradient(135deg, {{ $primaryColor }} 0%, {{ $secondaryColor }} 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 26px;
            font-weight: 800;
        }
        .header p {
            margin: 10px 0 0;
            font-size: 15px;
            opacity: 0.9;
        }
        .content {
            padding: 40px 30px;
        }
        .section {
            margin-bottom: 25px;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 20px;
        }
        .section:last-of-type {
            border-bottom: none;
            margin-bottom: 15px;
        }
        .section-title {
            font-size: 18px;
            font-weight: 700;
            color: {{ $primaryColor }};
            margin-bottom: 15px;
            display: flex;
            align-items: center;
        }
        .section-title span {
            background: {{ $primaryColor }};
            color: white;
            width: 24px;
            height: 24px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            margin-right: 10px;
            font-size: 12px;
            font-weight: bold;
        }
        .info-row {
            display: flex;
            margin-bottom: 10px;
            padding: 10px 12px;
            background: #f9fafb;
            border-radius: 8px;
            border: 1px solid #f3f4f6;
        }
        .info-label {
            font-weight: 600;
            width: 140px;
            color: #4b5563;
        }
        .info-value {
            flex: 1;
            color: #1f2937;
            font-weight: 500;
        }
        .badge {
            display: inline-block;
            padding: 6px 12px;
            background: {{ $primaryColor }};
            color: white;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 700;
        }
        .footer {
            background: #f9fafb;
            padding: 30px;
            text-align: center;
            font-size: 13px;
            color: #6b7280;
            border-top: 1px solid #f3f4f6;
        }
        .button {
            display: inline-block;
            padding: 14px 32px;
            background: {{ $primaryColor }};
            color: white !important;
            text-decoration: none;
            border-radius: 10px;
            font-weight: 700;
            font-size: 16px;
            box-shadow: 0 4px 6px -1px {{ $primaryColor }}40;
            transition: all 0.2s ease-in-out;
            margin-top: 15px;
        }
        .stats {
            background: {{ $bgColor }};
            padding: 20px;
            border-radius: 12px;
            margin-bottom: 30px;
            border: 1px solid {{ $primaryColor }}20;
        }
        .stats p {
            margin: 6px 0;
            color: #4b5563;
        }
        .stats strong {
            color: #1f2937;
        }
        @media (max-width: 480px) {
            .info-row {
                flex-direction: column;
            }
            .info-label {
                width: 100%;
                margin-bottom: 4px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div style="background-color: white; display: inline-block; padding: 10px 20px; border-radius: 12px; margin-bottom: 15px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
                <img src="{{ $logoUrl }}" alt="{{ $brandName }}" style="max-height: 45px; display: block; margin: 0 auto;">
            </div>
            <h1>🏠 New Rental Application</h1>
            <p>Application #{{ $applicant->id }} has been submitted</p>
        </div>

        <div class="content">
            <div class="stats">
                <h3 style="margin-top: 0; margin-bottom: 12px; color: {{ $primaryColor }}; font-size: 16px; font-weight: 700;">📊 Application Info</h3>
                <p>Application ID: <strong>#{{ $applicant->id }}</strong></p>
                <p>Company: <strong>{{ $brandName }}</strong></p>
                <p>Submitted: <strong>{{ $applicant->created_at->format('F j, Y, g:i a') }}</strong></p>
                <p style="margin-top: 12px;">Status: <span class="badge">Pending Review</span></p>
            </div>

            <!-- Personal Information -->
            <div class="section">
                <div class="section-title">
                    <span>1</span> Personal Information
                </div>
                <div class="info-row">
                    <div class="info-label">Full Name:</div>
                    <div class="info-value">{{ $applicant->personalInformation->first_name ?? 'N/A' }} {{ $applicant->personalInformation->last_name ?? 'N/A' }}</div>
                </div>
                <div class="info-row">
                    <div class="info-label">Email:</div>
                    <div class="info-value">{{ $applicant->personalInformation->email ?? 'N/A' }}</div>
                </div>
                <div class="info-row">
                    <div class="info-label">Phone:</div>
                    <div class="info-value">{{ $applicant->personalInformation->phone ?? 'N/A' }}</div>
                </div>
                <div class="info-row">
                    <div class="info-label">Marital Status:</div>
                    <div class="info-value">{{ $applicant->personalInformation->marital_status ?? 'N/A' }}</div>
                </div>
            </div>

            <!-- Current Address -->
            <div class="section">
                <div class="section-title">
                    <span>2</span> Current Address
                </div>
                <div class="info-row">
                    <div class="info-label">Address:</div>
                    <div class="info-value">{{ $applicant->currentAddress->address_line_1 ?? 'N/A' }}</div>
                </div>
                <div class="info-row">
                    <div class="info-label">City:</div>
                    <div class="info-value">{{ $applicant->currentAddress->city ?? 'N/A' }}</div>
                </div>
                <div class="info-row">
                    <div class="info-label">State/ZIP:</div>
                    <div class="info-value">{{ $applicant->currentAddress->state ?? 'N/A' }} {{ $applicant->currentAddress->zip_code ?? 'N/A' }}</div>
                </div>
                <div class="info-row">
                    <div class="info-label">Monthly Rent:</div>
                    <div class="info-value">${{ number_format($applicant->currentAddress->monthly_rent ?? 0, 2) }}</div>
                </div>
            </div>

            <!-- Employment -->
            <div class="section">
                <div class="section-title">
                    <span>3</span> Employment
                </div>
                <div class="info-row">
                    <div class="info-label">Employer:</div>
                    <div class="info-value">{{ $applicant->employment->employer_name ?? 'N/A' }}</div>
                </div>
                <div class="info-row">
                    <div class="info-label">Job Title:</div>
                    <div class="info-value">{{ $applicant->employment->job_title ?? 'N/A' }}</div>
                </div>
                <div class="info-row">
                    <div class="info-label">Monthly Income:</div>
                    <div class="info-value">${{ number_format($applicant->employment->monthly_income ?? 0, 2) }}</div>
                </div>
            </div>

            <!-- Pets & Vehicles Summary -->
            <div class="section">
                <div class="section-title">
                    <span>4</span> Additional Information
                </div>
                <div class="info-row">
                    <div class="info-label">🐕 Pets:</div>
                    <div class="info-value">{{ $applicant->pets->count() }} pet(s)</div>
                </div>
                <div class="info-row">
                    <div class="info-label">🚗 Vehicles:</div>
                    <div class="info-value">{{ $applicant->vehicles->count() }} vehicle(s)</div>
                </div>
                <div class="info-row">
                    <div class="info-label">Emergency Contact:</div>
                    <div class="info-value">{{ $applicant->emergencyContact->full_name ?? 'N/A' }} ({{ $applicant->emergencyContact->relationship ?? 'N/A' }})</div>
                </div>
            </div>

            <div style="text-align: center; margin-top: 30px;">
                <a href="{{ $adminUrl }}" class="button">
                    🔍 View Full Application
                </a>
            </div>
        </div>

        <div class="footer">
            <p>This is an automated notification from {{ $brandName }}.</p>
            <p>© {{ date('Y') }} {{ $brandName }}. All rights reserved.</p>
        </div>
    </div>
</body>
</html>