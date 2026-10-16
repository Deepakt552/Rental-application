@php
    $primaryColor = $isExcel ? '#16a34a' : '#0e4a81';
    $primaryHover = $isExcel ? '#15803d' : '#0a3d6a';
    $logoUrl = $isExcel ? 'https://ersila.com/Excel%20Residential%20-%20Icon.png' : 'https://ersila.com/Triumph%20Logo.png';
    $isDeactivated = ($action === 'deactivated');
@endphp
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{ $isDeactivated ? 'Reminders Deactivated' : 'Reminders Re-activated' }} - {{ $brandName }}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }
        body {
            font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 24px 16px;
            color: #1e293b;
        }
        .card {
            background: #ffffff;
            border-radius: 24px;
            max-width: 520px;
            width: 100%;
            padding: 44px 36px;
            box-shadow: 0 25px 50px -12px rgba(15, 23, 42, 0.12), 0 0 0 1px rgba(15, 23, 42, 0.05);
            text-align: center;
            position: relative;
            overflow: hidden;
        }
        .card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 6px;
            background: linear-gradient(90deg, {{ $primaryColor }}, {{ $isExcel ? '#4ade80' : '#38bdf8' }});
        }
        .logo-wrap {
            margin-bottom: 24px;
        }
        .logo-wrap img {
            max-height: 48px;
            max-width: 220px;
            object-fit: contain;
        }
        .icon-circle {
            width: 72px;
            height: 72px;
            border-radius: 50%;
            margin: 0 auto 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 32px;
        }
        .icon-circle.deactivated {
            background: #fef2f2;
            color: #dc2626;
            border: 2px solid #fee2e2;
        }
        .icon-circle.reactivated {
            background: #ecfdf5;
            color: #16a34a;
            border: 2px solid #d1fae5;
        }
        h1 {
            font-size: 24px;
            font-weight: 800;
            color: #0f172a;
            letter-spacing: -0.02em;
            margin-bottom: 10px;
        }
        .subtitle {
            font-size: 14px;
            color: #64748b;
            line-height: 1.6;
            margin-bottom: 24px;
        }
        .details-box {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 14px;
            padding: 16px 20px;
            margin-bottom: 28px;
            text-align: left;
            font-size: 13px;
        }
        .detail-row {
            display: flex;
            justify-content: space-between;
            padding: 6px 0;
            border-bottom: 1px dashed #e2e8f0;
        }
        .detail-row:last-child {
            border-bottom: none;
        }
        .detail-label {
            color: #64748b;
            font-weight: 500;
        }
        .detail-value {
            color: #0f172a;
            font-weight: 700;
        }
        .btn-primary {
            display: inline-block;
            width: 100%;
            background: {{ $primaryColor }};
            color: #ffffff;
            text-decoration: none;
            padding: 14px 24px;
            border-radius: 12px;
            font-weight: 700;
            font-size: 15px;
            transition: all 0.2s ease;
            box-shadow: 0 4px 12px -2px {{ $primaryColor }}40;
        }
        .btn-primary:hover {
            background: {{ $primaryHover }};
            transform: translateY(-1px);
        }
        .undo-link {
            display: inline-block;
            margin-top: 18px;
            font-size: 12px;
            color: #64748b;
            text-decoration: none;
        }
        .undo-link a {
            color: {{ $primaryColor }};
            font-weight: 600;
            text-decoration: underline;
        }
        .footer-note {
            margin-top: 28px;
            font-size: 11px;
            color: #94a3b8;
            border-top: 1px solid #f1f5f9;
            padding-top: 16px;
        }
    </style>
</head>
<body>
    <div class="card">
        <div class="logo-wrap">
            <img src="{{ $logoUrl }}" alt="{{ $brandName }}" />
        </div>

        @if($isDeactivated)
            <div class="icon-circle deactivated">
                <svg width="36" height="36" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
            </div>
            <h1>Reminders Deactivated</h1>
            <p class="subtitle">
                Automated email reminders for your rental application have been successfully turned off. You will not receive any further reminder notifications.
            </p>
        @else
            <div class="icon-circle reactivated">
                <svg width="36" height="36" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                </svg>
            </div>
            <h1>Reminders Re-activated</h1>
            <p class="subtitle">
                Automated email reminders for your rental application have been re-enabled. We will notify you with updates to help complete your application.
            </p>
        @endif

        <div class="details-box">
            <div class="detail-row">
                <span class="detail-label">Application ID:</span>
                <span class="detail-value">#{{ $applicant->id }}</span>
            </div>
            @if($applicant->property_name)
            <div class="detail-row">
                <span class="detail-label">Property:</span>
                <span class="detail-value">{{ $applicant->property_name }}</span>
            </div>
            @endif
            <div class="detail-row">
                <span class="detail-label">Status:</span>
                <span class="detail-value" style="color: {{ $isDeactivated ? '#dc2626' : '#16a34a' }};">
                    {{ $isDeactivated ? 'Notifications Muted' : 'Reminders Active' }}
                </span>
            </div>
        </div>

        <a href="{{ $loginUrl }}" class="btn-primary">
            🔐 Log In to Tenant Portal
        </a>

        @if($isDeactivated && !empty($reactivateUrl))
            <p class="undo-link">
                Clicked by mistake? <a href="{{ $reactivateUrl }}">Click here to turn reminders back on</a>.
            </p>
        @elseif(!$isDeactivated && !empty($deactivateUrl))
            <p class="undo-link">
                Prefer not to receive emails? <a href="{{ $deactivateUrl }}">Turn reminders off</a>.
            </p>
        @endif

        <div class="footer-note">
            {{ $brandName }} &bull; Secure Rental Application Services
        </div>
    </div>
</body>
</html>
