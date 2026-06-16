<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ApplicantTenantConsent extends Model

{
    protected $table = 'applicant_tenant_consents';

    protected $fillable = [
        'session_id',
        'application_id',
        'applicant_name',
        'signature',
        'consent_date'
    ];

    protected $casts = [
        'consent_date' => 'date',
        'session_id' => 'string'
    ];

    public function application(): BelongsTo
    {
        return $this->belongsTo(Applicant::class);
    }
}
