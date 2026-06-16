<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PersonalInformation extends Model
{
    protected $table = 'personal_information';
    
    protected $fillable = [
        'applicant_id',
        'title',
        'first_name',
        'middle_name',
        'last_name',
        'preferred_name',
        'marital_status',
        'date_of_birth',
        'phone',
        'email',
    ];

    public function applicant(): BelongsTo
    {
        return $this->belongsTo(Applicant::class);
    }
}