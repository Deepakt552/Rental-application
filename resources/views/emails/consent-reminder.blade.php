@php
    $isExcel = ($formType === 'superadmin');
    $brandName = $isExcel ? 'Excel Residential Services' : 'Triumph Residential Services';
    $primaryColor = '#d32f2f'; // Red warning accent
    $secondaryColor = '#b71c1c';
    $bgColor = '#fdf2f2'; // Light red background
    $logoUrl = $isExcel ? 'https://ersila.com/Excel%20Residential%20-%20Icon.png' : 'https://ersila.com/Triumph%20Logo.png';
    $adminUrl = 'https://ersila.com/admin/applications/' . $applicant->id;
@endphp
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Follow-up: Incomplete Consent Form - {{ $brandName }}</title>
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
            font-size: 24px;
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
        .summary-box {
            background: {{ $bgColor }};
            padding: 24px;
            border-radius: 12px;
            margin: 24px 0;
            border-left: 4px solid {{ $primaryColor }};
            border-top: 1px solid {{ $primaryColor }}15;
            border-right: 1px solid {{ $primaryColor }}15;
            border-bottom: 1px solid {{ $primaryColor }}15;
        }
        .summary-box p {
            margin: 8px 0;
            color: #4b5563;
        }
        .summary-box strong {
            color: #1f2937;
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
        .footer {
            background: #f9fafb;
            padding: 30px;
            text-align: center;
            font-size: 13px;
            color: #6b7280;
            border-top: 1px solid #f3f4f6;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div style="background-color: white; display: inline-block; padding: 10px 20px; border-radius: 12px; margin-bottom: 15px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
                <img src="{{ $logoUrl }}" alt="{{ $brandName }}" style="max-height: 45px; display: block; margin: 0 auto;">
            </div>
            <h1>⚠️ Incomplete Application Reminder</h1>
            <p>Form Type: {{ $brandName }}</p>
        </div>

        <div class="content">
            <h2 style="margin-top: 0; color: #1f2937; font-size: 20px; font-weight: 700;">Hello Admin,</h2>
            
            <p style="color: #4b5563;">This is a follow-up reminder that a tenant has filled out the application form but has <strong>NOT completed the consent form</strong> yet. Please call them to verify why they left it incomplete.</p>
            
            <div class="summary-box">
                <p style="margin-top: 0; font-size: 16px; font-weight: 700; color: {{ $primaryColor }};">📋 Tenant Contact Information</p>
                <p>• Name: <strong>{{ $applicant->personalInformation->first_name ?? 'N/A' }} {{ $applicant->personalInformation->last_name ?? '' }}</strong></p>
                <p>• Email: <strong>{{ $applicant->personalInformation->email ?? $applicant->email }}</strong></p>
                <p>• Phone: <strong>{{ $applicant->personalInformation->phone ?? 'N/A' }}</strong></p>
                <p>• Application ID: <strong>#{{ $applicant->id }}</strong></p>
                <p>• Last Updated: <strong>{{ $applicant->updated_at->format('F j, Y, g:i a') }}</strong></p>
            </div>
            
            <p style="color: #4b5563; margin-bottom: 25px;">If the tenant is not interested or you have already reached out, you can add a comment in the application detail page to stop these automated reminders.</p>
            
            <div style="text-align: center;">
                <a href="{{ $adminUrl }}" class="button">
                    🔍 View Application & Add Comment
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
