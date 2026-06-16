<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Screening extends Model
{
    protected $fillable = [
        'applicant_id',
        'date_of_birth',
        'screening_country',
        'has_ssn',
        'ssn',
        'government_id',
        'issuing_entity',
        'evicted',
        'eviction_reason',
        'felony',
        'felony_reason',
        'legal_case',
        'legal_case_details',
    ];

    protected $casts = [
        'date_of_birth' => 'date',
        'has_ssn' => 'boolean',
        'evicted' => 'boolean',
        'felony' => 'boolean',
        'legal_case' => 'boolean',
    ];

    public function applicant(): BelongsTo
    {
        return $this->belongsTo(Applicant::class);
    }
}