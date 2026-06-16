<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Rental Application</title>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
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
        .section {
            margin-bottom: 25px;
            border-bottom: 1px solid #e0e0e0;
            padding-bottom: 15px;
        }
        .section-title {
            font-size: 18px;
            font-weight: bold;
            color: #0e4a81;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
        }
        .section-title span {
            background: #0e4a81;
            color: white;
            width: 24px;
            height: 24px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            margin-right: 10px;
            font-size: 12px;
        }
        .info-row {
            display: flex;
            margin-bottom: 10px;
            padding: 8px;
            background: #f9f9f9;
            border-radius: 5px;
        }
        .info-label {
            font-weight: bold;
            width: 120px;
            color: #555;
        }
        .info-value {
            flex: 1;
            color: #333;
        }
        .badge {
            display: inline-block;
            padding: 5px 10px;
            background: #4CAF50;
            color: white;
            border-radius: 5px;
            font-size: 12px;
            font-weight: bold;
        }
        .footer {
            background: #f4f4f4;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #777;
        }
        .button {
            display: inline-block;
            padding: 12px 24px;
            background: #0e4a81;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin-top: 20px;
        }
        .stats {
            background: #e8f4f8;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🏠 New Rental Application</h1>
            <p>Application #{{ $applicant->id }} has been submitted</p>
        </div>

        <div class="content">
            <div class="stats">
                <strong>📊 Quick Stats</strong><br>
                Application ID: <strong>#{{ $applicant->id }}</strong><br>
                Submitted: <strong>{{ $applicant->created_at->format('F j, Y, g:i a') }}</strong><br>
                Status: <span class="badge">Pending Review</span>
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

            <div style="text-align: center;">
                <a href="{{ route('admin.applications.show', $applicant->id) }}" class="button">
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