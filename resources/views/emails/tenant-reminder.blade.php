@php
    $isExcel = (isset($applicant) && (($applicant->type ?? '') === 'superadmin' || str_contains(strtolower($applicant->company_name ?? ''), 'excel')));
    $brandName = $brandName ?? ($isExcel ? 'Excel Residential Services' : 'Triumph Residential Services');
    $primaryColor = $isExcel ? '#16a34a' : '#0e4a81';
    $secondaryColor = $isExcel ? '#15803d' : '#0a3d6a';
    $bgColor = $isExcel ? '#f0fdf4' : '#f0f7ff';
    $logoUrl = $isExcel ? 'https://ersila.com/Excel%20Residential%20-%20Icon.png' : 'https://ersila.com/Triumph%20Logo.png';
    $firstName = $applicant->personalInformation?->first_name ?? 'Applicant';
    $propertyName = $applicant->property_name ?? 'the selected property';

    $loginUrl = $loginUrl ?? url('/login');
    $optOutUrl = $optOutUrl ?? (isset($applicant) ? route('reminders.opt-out', ['applicant' => $applicant->id, 'token' => $applicant->getReminderOptOutToken()]) : null);
    $remCount = $reminderNumber ?? ($applicant->reminder_sent_count ?? 1);
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
        .reminder-pill {
            display: inline-block;
            background: rgba(255, 255, 255, 0.2);
            backdrop-filter: blur(4px);
            color: #ffffff;
            font-size: 11px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            padding: 4px 14px;
            border-radius: 9999px;
            margin-top: 10px;
            border: 1px solid rgba(255, 255, 255, 0.35);
        }
        .content {
            padding: 35px 30px;
        }
        .greeting {
            font-size: 18px;
            font-weight: 700;
            color: #111827;
            margin-bottom: 12px;
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
            margin: 26px 0 16px;
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
            box-shadow: 0 4px 8px -1px rgba(0,0,0,0.15);
        }
        .login-box {
            background: #ffffff;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 18px 20px;
            margin: 24px 0 16px;
            box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05);
        }
        .login-box h4 {
            margin: 0 0 6px;
            font-size: 13px;
            font-weight: 700;
            color: #0f172a;
            display: flex;
            align-items: center;
            gap: 6px;
        }
        .login-box p {
            margin: 0 0 12px;
            font-size: 12px;
            color: #64748b;
            line-height: 1.5;
        }
        .login-button {
            display: inline-block;
            background: #f8fafc;
            border: 1px solid #cbd5e1;
            color: #1e293b !important;
            text-decoration: none;
            padding: 9px 20px;
            border-radius: 8px;
            font-weight: 600;
            font-size: 13px;
            transition: all 0.2s ease;
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
        .opt-out-text {
            margin-top: 14px;
            padding-top: 12px;
            border-top: 1px dashed #e5e7eb;
            font-size: 11px;
            color: #9ca3af;
        }
        .opt-out-link {
            color: #6b7280;
            text-decoration: underline;
        }
        .opt-out-link:hover {
            color: #374151;
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
            <p>Application Notice &amp; Follow-up</p>
            @if($remCount > 0)
                <div class="reminder-pill">
                    @if($remCount >= 3)
                        Final Notice &bull; Reminder 3 of 3
                    @else
                        Reminder {{ $remCount }} of 3 &bull; 24h Interval
                    @endif
                </div>
            @endif
        </div>

        <div class="content">
            <div class="greeting">Hello {{ $firstName }},</div>

            <p style="font-size: 14px; color: #4b5563; margin-top: 0;">
                We are following up regarding your rental application for <strong>{{ $propertyName }}</strong> (Application #{{ $applicant->id }}).
            </p>

            <div class="message-box">
{!! nl2br(e($messageBody)) !!}
            </div>

            <div class="status-card">
                <div class="status-title">Current Application Checklist</div>
                <div class="status-row">
                    <span style="color: #4b5563; font-weight: 600;">1. Tenant Consent &amp; Background:</span>
                    @if($applicant->is_consent_completed)
                        <span class="badge badge-success">Completed</span>
                    @else
                        <span class="badge badge-danger">Incomplete</span>
                    @endif
                </div>
                <div class="status-row">
                    <span style="color: #4b5563; font-weight: 600;">2. Screening Application Fee:</span>
                    @if($applicant->payment_status === 'paid' || $applicant->payment_status === 'completed')
                        <span class="badge badge-success">Paid</span>
                    @else
                        <span class="badge badge-warning">Pending Payment</span>
                    @endif
                </div>
                <div class="status-row">
                    <span style="color: #4b5563; font-weight: 600;">3. Application Information &amp; Documents:</span>
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
                <p style="text-align: center; font-size: 11px; color: #9ca3af; margin-top: 4px; margin-bottom: 20px;">
                    Direct link: <a href="{{ $actionUrl }}" style="color: {{ $primaryColor }}; word-break: break-all;">{{ $actionUrl }}</a>
                </p>
            @endif

            <div class="login-box">
                <h4>🔐 Tenant Portal Login</h4>
                <p>
                    Already started? You can securely log in to your tenant account at any time using your registered email (<strong>{{ $applicant->email }}</strong>) to review your documents, complete pending tasks, or track your application status.
                </p>
                <div style="text-align: center;">
                    <a href="{{ $loginUrl }}" class="login-button" target="_blank">
                        Log In to Tenant Account &rarr;
                    </a>
                </div>
                <p style="text-align: center; font-size: 11px; color: #94a3b8; margin: 8px 0 0;">
                    Portal link: <a href="{{ $loginUrl }}" style="color: {{ $primaryColor }};">{{ $loginUrl }}</a>
                </p>
            </div>
        </div>

        <div class="footer">
            <p style="margin: 0 0 6px;">This email was sent by the management team at <strong>{{ $brandName }}</strong>.</p>
            <p style="margin: 0;">If you have already submitted your information or have questions, please reach out to our leasing team directly.</p>

            @if(!empty($optOutUrl))
                <div class="opt-out-text">
                    Don't wish to receive automated reminders for this application?
                    <a href="{{ $optOutUrl }}" class="opt-out-link">Click here to deactivate reminders</a>.
                </div>
            @endif
        </div>
    </div>
</body>
</html>
