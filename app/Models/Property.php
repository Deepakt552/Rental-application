<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Property extends Model
{
    protected $fillable = [
        'property_name',
        'company_name',
        'property_type',
        'address',
        'added_by',
        'app_notification_recipients',
        'reminder_notification_recipients',
    ];

    protected $casts = [
        'property_type' => 'array',
        'app_notification_recipients' => 'array',
        'reminder_notification_recipients' => 'array',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'added_by');
    }
}