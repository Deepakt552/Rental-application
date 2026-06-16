<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Employment extends Model
{
    protected $fillable = [
        'applicant_id',
        'employment_country',
        'employment_status',
        'job_title',
        'employer_name',
        'supervisor_name',
        'employed_since',
        'monthly_income',
        'additional_income',
        'additional_income_source',
        'employer_address_1',
        'employer_address_2',
        'employer_city',
        'employer_state',
        'employer_zip',
        'employer_phone',
    ];

    protected $casts = [
        'employed_since' => 'date',
        'monthly_income' => 'decimal:2',
        'additional_income' => 'decimal:2',
    ];

    public function applicant(): BelongsTo
    {
        return $this->belongsTo(Applicant::class);
    }
}