<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class CriminalBackgroundCheck extends Model
{
    protected $table = 'criminal_background_checks';
    
    protected $fillable = [
        'session_id',
        'application_id',
        'applicant_name',
        'social_security_no',
        'date_of_birth',
        'current_address',
        'dl_number',
        'today_date',
        'signature'
    ];

    protected $casts = [
        'date_of_birth' => 'date',
        'today_date' => 'date',
        'session_id' => 'string'
    ];
}