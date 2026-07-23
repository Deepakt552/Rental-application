@php
    $isExcel = (isset($applicant) && (($applicant->type ?? '') === 'superadmin' || str_contains(strtolower($applicant->company_name ?? ''), 'excel')));
    $brandName = $isExcel ? 'Excel Residential Services' : 'Triumph Residential Services';
    $primaryColor = $isExcel ? '#16a34a' : '#0e4a81';
    $secondaryColor = $isExcel ? '#15803d' : '#0a3d6a';
    $bgColor = $isExcel ? '#f0fdf4' : '#f0f7ff';
    $logoUrl = $isExcel ? 'https://ersila.com/Excel%20Residential%20-%20Icon.png' : 'https://ersila.com/Triumph%20Logo.png';
    $siteUrl = 'https://ersila.com';
    $appUrl = $isExcel ? 'https://ersila.com/rental-application-excel' : 'https://ersila.com/rental-application';
    $supportEmail = 'support@ersila.com';
@endphp
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Thank You for Your Application - {{ $brandName }}</title>
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
            font-size: 28px;
            font-weight: 800;
        }
        .header p {
            margin: 10px 0 0;
            font-size: 16px;
            opacity: 0.9;
        }
        .content {
            padding: 40px 30px;
        }
        .thankyou-section {
            text-align: left;
            margin-bottom: 30px;
        }
        .thankyou-section h2 {
            color: {{ $primaryColor }};
            margin-top: 0;
            margin-bottom: 15px;
            font-size: 22px;
            font-weight: 700;
        }
        .property-details {
            background: {{ $bgColor }};
            padding: 24px;
            border-radius: 12px;
            margin: 24px 0;
            border: 1px solid {{ $primaryColor }}20;
        }
        .property-details h3 {
            margin: 0 0 20px 0;
            color: {{ $primaryColor }};
            font-size: 18px;
            font-weight: 700;
        }
        .detail-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 12px;
            padding-bottom: 12px;
            border-bottom: 1px solid {{ $primaryColor }}15;
        }
        .detail-row:last-child {
            margin-bottom: 0;
            padding-bottom: 0;
            border-bottom: none;
        }
        .detail-label {
            font-weight: 600;
            color: #4b5563;
        }
        .detail-value {
            color: #1f2937;
            font-weight: 500;
        }
        .next-steps {
            background: #f9fafb;
            padding: 24px;
            border-radius: 12px;
            margin: 24px 0;
            border: 1px solid #f3f4f6;
        }
        .next-steps h3 {
            color: {{ $primaryColor }};
            margin-top: 0;
            margin-bottom: 20px;
            font-size: 18px;
            font-weight: 700;
        }
        .step {
            display: flex;
            align-items: flex-start;
            margin-bottom: 20px;
        }
        .step:last-child {
            margin-bottom: 0;
        }
        .step-number {
            width: 28px;
            height: 28px;
            background: {{ $primaryColor }};
            color: white;
            border-radius: 50%;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            margin-right: 16px;
            flex-shrink: 0;
            font-size: 14px;
        }
        .step-text {
            flex: 1;
            font-size: 14px;
            color: #4b5563;
        }
        .step-text strong {
            color: #1f2937;
            font-size: 15px;
        }
        .info-box {
            background: #fffbeb;
            border-left: 4px solid #f59e0b;
            padding: 20px;
            margin: 24px 0;
            border-radius: 8px;
            color: #78350f;
            font-size: 14px;
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
        }
        .footer {
            background: #f9fafb;
            padding: 30px;
            text-align: center;
            font-size: 13px;
            color: #6b7280;
            border-top: 1px solid #f3f4f6;
        }
        @media (max-width: 480px) {
            .detail-row {
                flex-direction: column;
            }
            .detail-label {
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
            <h1>🎉 Thank You!</h1>
            <p>Your rental application has been received</p>
        </div>

        <div class="content">
            <div class="thankyou-section">
                <h2>Dear {{ $applicant->personalInformation->first_name ?? 'Valued Applicant' }},</h2>
                <p>Thank you for choosing {{ $brandName }} for your rental needs. We have received your application and are excited to help you find your perfect home.</p>
            </div>

            <div class="property-details">
                <h3>🏠 Application Summary</h3>
                <div class="detail-row">
                    <span class="detail-label">Application ID:</span>
                    <span class="detail-value">#{{ $applicant->id }}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Full Name:</span>
                    <span class="detail-value">{{ $applicant->personalInformation->first_name ?? '' }} {{ $applicant->personalInformation->last_name ?? '' }}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Email:</span>
                    <span class="detail-value">{{ $applicant->personalInformation->email ?? $applicant->email }}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Phone:</span>
                    <span class="detail-value">{{ $applicant->personalInformation->phone ?? 'N/A' }}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Submission Date:</span>
                    <span class="detail-value">{{ $applicant->created_at->format('F j, Y, g:i a') }}</span>
                </div>
            </div>

            <div class="next-steps">
                <h3>📋 What's Next?</h3>
                <div class="step">
                    <div class="step-number">1</div>
                    <div class="step-text">
                        <strong>Application Review</strong><br>
                        Our team will review your application within 24-48 hours.
                    </div>
                </div>
                <div class="step">
                    <div class="step-number">2</div>
                    <div class="step-text">
                        <strong>Background Check</strong><br>
                        We'll process your background and credit screening.
                    </div>
                </div>
                <div class="step">
                    <div class="step-number">3</div>
                    <div class="step-text">
                        <strong>Notification</strong><br>
                        You'll receive an email with the decision and next steps.
                    </div>
                </div>
                <div class="step">
                    <div class="step-number">4</div>
                    <div class="step-text">
                        <strong>Lease Signing</strong><br>
                        If approved, we'll schedule a time for lease signing.
                    </div>
                </div>
            </div>

            <div class="info-box">
                <strong>💡 Quick Tip:</strong><br>
                Please keep your Application ID <strong>#{{ $applicant->id }}</strong> handy for any future correspondence. You may be asked to provide this ID when contacting our support team.
            </div>

            <div style="text-align: center; margin-top: 30px;">
                <a href="{{ $siteUrl }}" class="button">
                    🏠 Go to {{ $brandName }} Portal
                </a>
            </div>
            
            <div style="text-align: center; margin-top: 25px; font-size: 13px; color: #6b7280;">
                <p>Please find attached your application form as a PDF document for your records.</p>
            </div>
        </div>

        <div class="footer">
            <p>Have questions? Contact our support team at <strong>{{ $supportEmail }}</strong></p>
            <p style="margin-top: 15px;">This is an automated message from {{ $brandName }}. Please do not reply directly to this email.</p>
            <p>© {{ date('Y') }} {{ $brandName }}. All rights reserved.</p>
        </div>
    </div>
</body>
</html>