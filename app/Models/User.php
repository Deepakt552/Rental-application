<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
        'can_edit_applications',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'can_edit_applications' => 'boolean',
        ];
    }
     public function isAdmin()
    {
        return $this->role === 'admin';
    }

    public function isSuperAdmin()
    {
        return $this->role === 'superadmin';
    }

    public function isPropertyManager()
    {
        return $this->role === 'property_manager';
    }

    public function canEditApplications(): bool
    {
        if ($this->isAdmin() || $this->isSuperAdmin()) {
            return true;
        }
        if ($this->isPropertyManager()) {
            return (bool) $this->can_edit_applications;
        }
        return false;
    }

    public function properties()
    {
        return $this->belongsToMany(Property::class, 'property_user')->withTimestamps();
    }

    public function getAssignedPropertyIds(): array
    {
        if ($this->isPropertyManager()) {
            return $this->properties()->pluck('properties.id')->toArray();
        }
        return [];
    }

    public function getAssignedPropertyNames(): array
    {
        if ($this->isPropertyManager()) {
            return $this->properties()->pluck('properties.property_name')->toArray();
        }
        return [];
    }

    public function applicants()
    {
        return $this->hasMany(Applicant::class);
    }

    protected static function booted()
    {
        static::deleting(function ($user) {
            $user->applicants()->get()->each(function ($applicant) {
                $applicant->delete();
            });
        });
    }
}
