@php
    $isExcel = (isset($applicant) && (($applicant->type ?? '') === 'superadmin' || str_contains(strtolower($applicant->company_name ?? ''), 'excel')));
    $brandName = $isExcel ? 'Excel Residential Services' : 'Triumph Residential Services';
    $primaryColor = $isExcel ? '#16a34a' : '#0e4a81';
    $secondaryColor = $isExcel ? '#15803d' : '#0a3d6a';
    $bgColor = $isExcel ? '#f0fdf4' : '#f0f7ff';
    $logoUrl = $isExcel ? 'https://ersila.com/Excel%20Residential%20-%20Icon.png' : 'https://ersila.com/Triumph%20Logo.png';
    $firstName = $applicant->personalInformation?->first_name ?? 'Applicant';
    $propertyName = $applicant->property_name ?? 'the selected property';
@endphp
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $subject ?? 'Rental Application Reminder' }}</title>
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
            background: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 10px 15px -3px rgba(0,0,0,0.08), 0 4px 6px -2px rgba(0,0,0,0.04);
            border: 1px solid #e5e7eb;
        }
        .header {
            background: linear-gradient(135deg, {{ $primaryColor }} 0%, {{ $secondaryColor }} 100%);
            color: #ffffff;
            padding: 35px 30px;
            text-align: center;
        }
        .header img {
            max-height: 48px;
            margin-bottom: 14px;
        }
        .header h1 {
            margin: 0;
            font-size: 22px;
            font-weight: 800;
            letter-spacing: -0.02em;
        }
        .header p {
            margin: 6px 0 0;
            font-size: 13px;
            opacity: 0.92;
        }
        .content {
            padding: 35px 30px;
        }
        .greeting {
            font-size: 17px;
            font-weight: 700;
            color: #111827;
            margin-bottom: 14px;
        }
        .message-box {
            background: #f9fafb;
            border-left: 4px solid {{ $primaryColor }};
            padding: 18px 20px;
            border-radius: 8px;
            margin: 20px 0;
            font-size: 14px;
            color: #374151;
            white-space: pre-wrap;
            line-height: 1.7;
        }
        .status-card {
            background: {{ $bgColor }};
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            padding: 18px 20px;
            margin: 24px 0;
        }
        .status-title {
            font-size: 11px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: #6b7280;
            margin-bottom: 12px;
        }
        .status-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 8px 0;
            border-bottom: 1px solid rgba(0,0,0,0.05);
            font-size: 13px;
        }
        .status-row:last-child {
            border-bottom: none;
            padding-bottom: 0;
        }
        .badge {
            display: inline-block;
            padding: 3px 10px;
            border-radius: 9999px;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
        }
        .badge-success {
            background-color: #d1fae5;
            color: #065f46;
        }
        .badge-warning {
            background-color: #fef3c7;
            color: #92400e;
        }
        .badge-danger {
            background-color: #fee2e2;
            color: #991b1b;
        }
        .button-wrapper {
            text-align: center;
            margin: 30px 0 20px;
        }
        .action-button {
            display: inline-block;
            background: linear-gradient(135deg, {{ $primaryColor }} 0%, {{ $secondaryColor }} 100%);
            color: #ffffff !important;
            text-decoration: none;
            padding: 14px 34px;
            border-radius: 10px;
            font-weight: 700;
            font-size: 14px;
            box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
        }
        .footer {
            background: #f9fafb;
            padding: 24px 30px;
            border-top: 1px solid #e5e7eb;
            font-size: 12px;
            color: #6b7280;
            text-align: center;
            line-height: 1.6;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            @if(!empty($logoUrl))
                <img src="{{ $logoUrl }}" alt="{{ $brandName }}" />
            @endif
            <h1>{{ $brandName }}</h1>
            <p>Application Notice &amp; Reminder</p>
        </div>

        <div class="content">
            <div class="greeting">Hello {{ $firstName }},</div>

            <p style="font-size: 14px; color: #4b5563; margin-top: 0;">
                We are reaching out regarding your rental application for <strong>{{ $propertyName }}</strong> (Application #{{ $applicant->id }}).
            </p>

            <div class="message-box">
{!! nl2br(e($messageBody)) !!}
            </div>

            <div class="status-card">
                <div class="status-title">Current Application Status</div>
                <div class="status-row">
                    <span style="color: #4b5563; font-weight: 600;">Consent Form:</span>
                    @if($applicant->is_consent_completed)
                        <span class="badge badge-success">Completed</span>
                    @else
                        <span class="badge badge-danger">Incomplete</span>
                    @endif
                </div>
                <div class="status-row">
                    <span style="color: #4b5563; font-weight: 600;">Application Fee:</span>
                    @if($applicant->payment_status === 'paid' || $applicant->payment_status === 'completed')
                        <span class="badge badge-success">Paid</span>
                    @else
                        <span class="badge badge-warning">Pending Payment</span>
                    @endif
                </div>
                <div class="status-row">
                    <span style="color: #4b5563; font-weight: 600;">Application Details:</span>
                    @if($applicant->status === 'submitted' || $applicant->status === 'approved')
                        <span class="badge badge-success">{{ ucfirst($applicant->status) }}</span>
                    @else
                        <span class="badge badge-warning">Draft / Incomplete</span>
                    @endif
                </div>
            </div>

            @if(!empty($actionUrl))
                <div class="button-wrapper">
                    <a href="{{ $actionUrl }}" class="action-button" target="_blank">
                        Complete Your Application Now &rarr;
                    </a>
                </div>
                <p style="text-align: center; font-size: 11px; color: #9ca3af; margin-top: 8px;">
                    If the button does not work, visit: <br>
                    <a href="{{ $actionUrl }}" style="color: {{ $primaryColor }}; word-break: break-all;">{{ $actionUrl }}</a>
                </p>
            @endif
        </div>

        <div class="footer">
            <p style="margin: 0 0 6px;">This email was sent by the management team at <strong>{{ $brandName }}</strong>.</p>
            <p style="margin: 0;">If you have already submitted your information or have any questions, please contact our leasing office directly.</p>
        </div>
    </div>
</body>
</html>
