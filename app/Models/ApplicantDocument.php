<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ApplicantDocument extends Model
{
    protected $fillable = [
        'applicant_id',
        'session_id',
        'document_type',
        'file_path',
        'original_filename',
        'mime_type',
        'size',
        'description'
    ];

    protected $appends = ['url'];

    public function getUrlAttribute()
    {
        return asset('storage/' . $this->file_path);
    }

    public function applicant()
    {
        return $this->belongsTo(Applicant::class);
    }
}