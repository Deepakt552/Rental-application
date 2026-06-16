<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PreviousEmployment extends Model
{
    protected $fillable = [
        'applicant_id',
        'previous_employer_name',
        'previous_supervisor_name',
        'previous_job_title',
        'previous_monthly_income',
        'previous_additional_income',
        'previous_income_source',
        'previous_start_date',
        'previous_end_date',
        'previous_employer_address_1',
        'previous_employer_address_2',
        'previous_employer_city',
        'previous_employer_state',
        'previous_employer_zip',
        'previous_employer_phone',
    ];

    protected $casts = [
        'previous_start_date' => 'date',
        'previous_end_date' => 'date',
        'previous_monthly_income' => 'decimal:2',
        'previous_additional_income' => 'decimal:2',
    ];

    public function applicant(): BelongsTo
    {
        return $this->belongsTo(Applicant::class);
    }
}