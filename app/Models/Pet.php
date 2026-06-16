<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Pet extends Model
{
    protected $fillable = [
        'applicant_id',
        'pet_type',
        'pet_name',
        'breed',
        'age',
        'weight',
        'color',
        'vaccinated',
        'special_notes',
    ];

    protected $casts = [
        'age' => 'integer',
        'weight' => 'decimal:2',
        'vaccinated' => 'boolean',
    ];

    public function applicant(): BelongsTo
    {
        return $this->belongsTo(Applicant::class);
    }
}