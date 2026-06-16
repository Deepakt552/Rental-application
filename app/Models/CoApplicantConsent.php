<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CoApplicantConsent extends Model
{
    protected $table = 'co_applicant_consents';
    
    protected $fillable = [
        'session_id',
        'application_id',
        'name',
        'signature',
        'consent_date'
    ];

    protected $casts = [
        'consent_date' => 'date',
        'session_id' => 'string'
    ];
}
