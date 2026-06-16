<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PreviousAddress extends Model
{
    protected $fillable = [
        'applicant_id',
        'previous_country',
        'previous_address_line_1',
        'previous_address_line_2',
        'previous_city',
        'previous_state',
        'previous_zip_code',
        'previous_apartment',
        'previous_from_date',
        'previous_to_date',
        'previous_rent',
        'previous_reason',
    ];

    protected $casts = [
        'previous_from_date' => 'date',
        'previous_to_date' => 'date',
        'previous_rent' => 'decimal:2',
    ];

    public function applicant(): BelongsTo
    {
        return $this->belongsTo(Applicant::class);
    }
}