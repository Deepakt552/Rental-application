<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmergencyContact extends Model
{
    protected $fillable = [
        'applicant_id',
        'full_name',
        'relationship',
        'phone',
        'email',
        'country',
        'address_line_1',
        'address_line_2',
        'city',
        'state',
        'zip_code',
    ];

    public function applicant(): BelongsTo
    {
        return $this->belongsTo(Applicant::class);
    }
}