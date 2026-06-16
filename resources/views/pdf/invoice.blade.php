<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Invoice - {{ $payment->id }}</title>
    <style>
        @page {
            margin: 0cm 0cm;
        }
        body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            color: #1e293b;
            line-height: 1.5;
            margin: 0;
            padding: 0;
        }
        .header-stripe {
            height: 12px;
            background: linear-gradient(to right, #0e4a81, #1e40af);
        }
        .container {
            padding: 50px;
        }
        .logo {
            height: 70px;
            margin-bottom: 20px;
        }
        .invoice-header {
            width: 100%;
            margin-bottom: 50px;
        }
        .invoice-header td {
            vertical-align: top;
        }
        .invoice-meta {
            text-align: right;
        }
        .invoice-meta h1 {
            margin: 0;
            color: #0e4a81;
            font-size: 36px;
            font-weight: 900;
            letter-spacing: -1px;
        }
        .invoice-meta p {
            margin: 0;
            color: #64748b;
            font-size: 14px;
            font-weight: bold;
        }
        .billing-grid {
            width: 100%;
            margin-bottom: 40px;
        }
        .billing-grid td {
            width: 33%;
            vertical-align: top;
        }
        .label {
            font-size: 10px;
            font-weight: 800;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 8px;
        }
        .value {
            font-size: 13px;
            font-weight: 600;
            color: #0f172a;
        }
        .value-large {
            font-size: 16px;
            font-weight: 800;
            color: #0e4a81;
        }
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 40px;
        }
        .items-table th {
            text-align: left;
            padding: 15px;
            background: #f8fafc;
            color: #64748b;
            font-size: 11px;
            font-weight: 800;
            text-transform: uppercase;
            border-top: 1px solid #e2e8f0;
            border-bottom: 1px solid #e2e8f0;
        }
        .items-table td {
            padding: 20px 15px;
            border-bottom: 1px solid #f1f5f9;
            font-size: 14px;
        }
        .description-cell {
            font-weight: 700;
            color: #0f172a;
        }
        .amount-cell {
            text-align: right;
            font-weight: 800;
            color: #0f172a;
        }
        .totals-container {
            width: 100%;
        }
        .totals-table {
            width: 250px;
            float: right;
        }
        .totals-table td {
            padding: 10px 0;
            font-size: 14px;
        }
        .total-label {
            color: #64748b;
            font-weight: 600;
        }
        .total-value {
            text-align: right;
            font-weight: 800;
            color: #0f172a;
        }
        .grand-total {
            border-top: 2px solid #0e4a81;
            padding-top: 15px !important;
        }
        .grand-total .total-label {
            color: #0e4a81;
            font-size: 18px;
            font-weight: 900;
        }
        .grand-total .total-value {
            color: #0e4a81;
            font-size: 22px;
            font-weight: 900;
        }
        .paid-stamp {
            position: absolute;
            top: 250px;
            right: 50px;
            width: 150px;
            height: 60px;
            border: 4px solid #22c55e;
            color: #22c55e;
            text-align: center;
            font-size: 32px;
            font-weight: 900;
            line-height: 52px;
            text-transform: uppercase;
            transform: rotate(-15deg);
            opacity: 0.2;
            border-radius: 12px;
        }
        .verification-footer {
            margin-top: 100px;
            padding: 25px;
            background: #f8fafc;
            border-radius: 15px;
            border: 1px dashed #cbd5e1;
        }
        .footer-text {
            text-align: center;
            font-size: 11px;
            color: #94a3b8;
            margin-top: 40px;
        }
        .support-info {
            font-size: 10px;
            color: #64748b;
            margin-top: 10px;
        }
    </style>
</head>
<body>
    @php
        $primaryDob = $applicant->screening->date_of_birth ?? null;
        $adultsCount = 0;
        if ($primaryDob && \Carbon\Carbon::parse($primaryDob)->age >= 18) {
            $adultsCount++;
        }
        if ($applicant->householdMembers) {
            foreach ($applicant->householdMembers as $member) {
                if ($member->date_of_birth && \Carbon\Carbon::parse($member->date_of_birth)->age >= 18) {
                    $adultsCount++;
                }
            }
        }
        if ($adultsCount === 0) {
            $adultsCount = 1;
        }
        $unitPrice = $payment->amount / $adultsCount;
    @endphp
    <div class="header-stripe"></div>
    
    <div class="paid-stamp">PAID</div>

    <div class="container">
        <table class="invoice-header">
            <tr>
                <td>
                    @if($applicant->type === 'superadmin')
                        <img src="{{ public_path('Excel Residential - Icon.png') }}" class="logo">
                    @else
                        <img src="{{ public_path('Triumph Logo.png') }}" class="logo">
                    @endif
                    <div style="font-size: 12px; color: #64748b; font-weight: 600;">
                        {{ $applicant->type === 'superadmin' ? 'Excel Residential Services' : 'Triumph Residential Services' }}
                    </div>
                </td>
                <td class="invoice-meta">
                    <h1>INVOICE</h1>
                    <p>TRANS-ID: #PAY-{{ str_pad($payment->id, 6, '0', STR_PAD_LEFT) }}</p>
                    <div style="margin-top: 10px; font-size: 12px; color: #64748b;">
                        Date: {{ $payment->created_at->format('M d, Y') }}<br>
                        Time: {{ $payment->created_at->format('h:i A') }}
                    </div>
                </td>
            </tr>
        </table>

        <table class="billing-grid">
            <tr>
                <td>
                    <div class="label">Billed To</div>
                    <div class="value-large">{{ $applicant->personalInformation->first_name }} {{ $applicant->personalInformation->last_name }}</div>
                    <div class="value" style="margin-top: 4px;">{{ $applicant->email }}</div>
                    <div class="value">{{ $applicant->personalInformation->phone }}</div>
                </td>
                <td>
                    <div class="label">Payment Status</div>
                    <div class="value" style="color: #22c55e;">&bull; Transaction Successful</div>
                    <div class="value">Card Ending in: ****</div>
                </td>
                <td style="text-align: right;">
                    <div class="label">Total Amount Due</div>
                    <div class="value-large" style="font-size: 24px;">${{ number_format($payment->amount, 2) }}</div>
                    <div class="value" style="font-size: 10px;">All figures in USD</div>
                </td>
            </tr>
        </table>

        <table class="items-table">
            <thead>
                <tr>
                    <th style="width: 70%;">Description</th>
                    <th style="text-align: center;">Qty</th>
                    <th style="text-align: right;">Unit Price</th>
                    <th style="text-align: right;">Amount</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td class="description-cell">
                        Application Fees (${{ number_format($unitPrice, 2) }} per adult member)<br>
                        <span style="font-size: 11px; color: #64748b; font-weight: normal;">Non-refundable background and credit screening processing.</span>
                    </td>
                    <td style="text-align: center; font-weight: 600;">{{ $adultsCount }}</td>
                    <td style="text-align: right; font-weight: 600;">${{ number_format($unitPrice, 2) }}</td>
                    <td class="amount-cell">${{ number_format($payment->amount, 2) }}</td>
                </tr>
            </tbody>
        </table>

        <div class="totals-container">
            <table class="totals-table">
                <tr>
                    <td class="total-label">Subtotal</td>
                    <td class="total-value">${{ number_format($payment->amount, 2) }}</td>
                </tr>
                <tr>
                    <td class="total-label">Processing Fee</td>
                    <td class="total-value">$0.00</td>
                </tr>
                <tr class="grand-total">
                    <td class="total-label">Total Paid</td>
                    <td class="total-value">${{ number_format($payment->amount, 2) }}</td>
                </tr>
            </table>
            <div style="clear: both;"></div>
        </div>

        <div class="verification-footer">
            <div class="label" style="color: #0e4a81;">Electronic Verification Receipt</div>
            <div style="font-family: monospace; font-size: 12px; color: #475569; word-break: break-all;">
                STRIPE_AUTH_REF: {{ $payment->stripe_session_id }}
            </div>
            <div class="support-info">
                This document serves as an official receipt for your rental application. For any billing inquiries, please contact our support department with the Stripe Reference ID shown above.
            </div>
        </div>

        <div class="footer-text">
            &copy; {{ date('Y') }} {{ $applicant->type === 'superadmin' ? 'Excel Residential Services' : 'Triumph Residential Services' }}.
        </div>
    </div>
</body>
</html>
