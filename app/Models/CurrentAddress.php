<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CurrentAddress extends Model
{
    protected $fillable = [
        'applicant_id',
        'country',
        'address_line_1',
        'address_line_2',
        'city',
        'state',
        'zip_code',
        'apartment_community',
        'residency_from_date',
        'monthly_rent',
        'reason_for_moving',
        'notice_given',
    ];

    protected $casts = [
        'residency_from_date' => 'date',
        'monthly_rent' => 'decimal:2',
        'notice_given' => 'boolean',
    ];

    public function applicant(): BelongsTo
    {
        return $this->belongsTo(Applicant::class);
    }
}