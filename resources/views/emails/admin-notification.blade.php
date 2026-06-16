<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>New Application #{{ $applicant->id }}</title>
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
            border-left: 4px solid #0e4a81;
        }
        .summary-box p {
            margin: 8px 0;
        }
        .button {
            display: inline-block;
            padding: 12px 24px;
            background: #0e4a81;
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
        .badge {
            display: inline-block;
            padding: 4px 8px;
            background: #4CAF50;
            color: white;
            border-radius: 3px;
            font-size: 11px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📄 New Rental Application</h1>
            <p>Application #{{ $applicant->id }}</p>
        </div>

        <div class="content">
            <h2>Hello Admin,</h2>
            
            <p>A new rental application has been submitted by <strong>
                {{ $applicant->personalInformation->first_name ?? '' }} 
                {{ $applicant->personalInformation->last_name ?? '' }}
            </strong>.</p>
            
            <div class="summary-box">
                <p><strong>📋 Application Summary:</strong></p>
                <p>• Application ID: <strong>#{{ $applicant->id }}</strong></p>
                <p>• Name: {{ $applicant->personalInformation->first_name ?? '' }} {{ $applicant->personalInformation->last_name ?? '' }}</p>
                <p>• Email: {{ $applicant->personalInformation->email ?? $applicant->email }}</p>
                <p>• Phone: {{ $applicant->personalInformation->phone ?? 'N/A' }}</p>
                <p>• Submitted: {{ $applicant->created_at->format('F j, Y, g:i a') }}</p>
            </div>
            
            <p>Please find attached the complete application form as a PDF document.</p>
            
            <div style="text-align: center;">
                <a href="{{ url('/admin/applications/' . $applicant->id) }}" class="button">
                    🔍 View Full Application
                </a>
            </div>
        </div>

        <div class="footer">
            <p>This is an automated notification from TriumphRent.</p>
            <p>© {{ date('Y') }} TriumphRent. All rights reserved.</p>
        </div>
    </div>
</body>
</html>