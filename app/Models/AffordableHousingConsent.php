<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AffordableHousingConsent extends Model
{
    protected $table = 'affordable_housing_consents';

    protected $fillable = [
        'session_id',
        'application_id',
        'member_type',
        'name',
        'signature',
        'consent_date'
    ];

    protected $casts = [
        'consent_date' => 'date',
        'session_id' => 'string'
    ];
}
