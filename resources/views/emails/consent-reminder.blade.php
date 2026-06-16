<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Follow-up: Incomplete Consent Form</title>
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
            background: linear-gradient(135deg, #d32f2f 0%, #b71c1c 100%);
            color: white;
            padding: 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
        }
        .header p {
            margin: 10px 0 0;
            opacity: 0.9;
        }
        .content {
            padding: 30px;
        }
        .summary-box {
            background: #f5f5f5;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #d32f2f;
        }
        .summary-box p {
            margin: 8px 0;
        }
        .button {
            display: inline-block;
            padding: 12px 24px;
            background: #d32f2f;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin: 20px 0;
        }
        .footer {
            background: #f4f4f4;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #777;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>⚠️ Incomplete Application Reminder</h1>
            <p>Form Type: {{ $formType === 'superadmin' ? 'Excel' : 'Triumph' }}</p>
        </div>

        <div class="content">
            <h2>Hello Admin,</h2>
            
            <p>This is a follow-up reminder that a tenant has filled out the application form but has <strong>NOT completed the consent form</strong> yet. Please call them to verify why they left it incomplete.</p>
            
            <div class="summary-box">
                <p><strong>📋 Tenant Contact Information:</strong></p>
                <p>• Name: <strong>{{ $applicant->personalInformation->first_name ?? 'N/A' }} {{ $applicant->personalInformation->last_name ?? '' }}</strong></p>
                <p>• Email: {{ $applicant->personalInformation->email ?? $applicant->email }}</p>
                <p>• Phone: {{ $applicant->personalInformation->phone ?? 'N/A' }}</p>
                <p>• Application ID: #{{ $applicant->id }}</p>
                <p>• Last Updated: {{ $applicant->updated_at->format('F j, Y, g:i a') }}</p>
            </div>
            
            <p>If the tenant is not interested or you have already reached out, you can add a comment in the application detail page to stop these automated reminders.</p>
            
            <div style="text-align: center;">
                <a href="{{ url('/admin/applications/' . $applicant->id) }}" class="button">
                    🔍 View Application & Add Comment
                </a>
            </div>
        </div>

        <div class="footer">
            <p>This is an automated notification from {{ $formType === 'superadmin' ? 'Excel' : 'Triumph' }}.</p>
            <p>© {{ date('Y') }} {{ $formType === 'superadmin' ? 'Excel' : 'Triumph' }}. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
