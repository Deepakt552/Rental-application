<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ConsentRecord extends Model
{
    //
    protected $fillable = [
        'session_id',
        'applicant_id',
        'consent_pdf_path',
        'status',
        'completed_at',
    ];

    public function applicant()
    {
        return $this->belongsTo(Applicant::class);
    }
}
