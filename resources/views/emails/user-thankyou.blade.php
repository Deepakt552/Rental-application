<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Thank You for Your Application</title>
    <style>
        body {
            font-family: 'Segoe UI', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 20px auto;
            background: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            background: linear-gradient(135deg, #0e4a81 0%, #1a5c9e 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
        }
        .header p {
            margin: 10px 0 0;
            opacity: 0.9;
        }
        .content {
            padding: 30px;
        }
        .thankyou-section {
            text-align: center;
            margin-bottom: 30px;
        }
        .thankyou-section h2 {
            color: #0e4a81;
            margin-bottom: 10px;
        }
        .property-details {
            background: #e8f4f8;
            padding: 20px;
            border-radius: 10px;
            margin: 20px 0;
        }
        .property-details h3 {
            margin: 0 0 15px 0;
            color: #0e4a81;
        }
        .detail-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            padding: 8px;
            border-bottom: 1px solid #cde5ef;
        }
        .detail-label {
            font-weight: bold;
            color: #555;
        }
        .detail-value {
            color: #333;
        }
        .next-steps {
            background: #f9f9f9;
            padding: 20px;
            border-radius: 10px;
            margin: 20px 0;
        }
        .next-steps h3 {
            color: #0e4a81;
            margin-bottom: 15px;
        }
        .step {
            display: flex;
            align-items: center;
            margin-bottom: 15px;
        }
        .step-number {
            width: 30px;
            height: 30px;
            background: #0e4a81;
            color: white;
            border-radius: 50%;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            margin-right: 15px;
            flex-shrink: 0;
        }
        .step-text {
            flex: 1;
        }
        .info-box {
            background: #fff3e0;
            border-left: 4px solid #ff9800;
            padding: 15px;
            margin: 20px 0;
            border-radius: 5px;
        }
        .button {
            display: inline-block;
            padding: 12px 30px;
            background: #0e4a81;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 20px;
            font-weight: bold;
        }
        .footer {
            background: #f4f4f4;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #777;
        }
        @media (max-width: 480px) {
            .detail-row {
                flex-direction: column;
            }
            .detail-label {
                margin-bottom: 5px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Thank You!</h1>
            <p>Your rental application has been received</p>
        </div>

        <div class="content">
            <div class="thankyou-section">
                <h2>Dear {{ $applicant->personalInformation->first_name ?? 'Valued Applicant' }},</h2>
                <p>Thank you for choosing TriumphRent for your rental needs. We have received your application and are excited to help you find your perfect home.</p>
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

            <div style="text-align: center;">
                <a href="{{ url('/') }}" class="button">
                    🏠 Browse More Properties
                </a>
            </div>
            
            <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #666;">
                <p>Please find attached your application form as a PDF document for your records.</p>
            </div>
        </div>

        <div class="footer">
            <p>Have questions? Contact our support team at <strong>support@triumphrent.com</strong> or call <strong>(555) 123-4567</strong></p>
            <p style="margin-top: 15px;">This is an automated message from TriumphRent. Please do not reply to this email.</p>
            <p>© {{ date('Y') }} TriumphRent. All rights reserved.</p>
        </div>
    </div>
</body>
</html>