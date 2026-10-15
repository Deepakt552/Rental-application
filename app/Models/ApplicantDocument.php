<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Storage;

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

    /**
     * Generate HMAC secure hash for URL protection and tamper prevention.
     */
    public function generateSecureHash(): string
    {
        return substr(hash_hmac('sha256', 'doc-' . $this->id . '-' . $this->session_id, config('app.key')), 0, 32);
    }

    /**
     * Secure route URL instead of direct public storage link.
     */
    public function getUrlAttribute()
    {
        return route('documents.secure-view', [
            'id' => $this->id,
            'hash' => $this->generateSecureHash()
        ]);
    }

    /**
     * Decrypt and return file content from private or legacy public disk.
     */
    public function getDecryptedContent(): ?string
    {
        $raw = null;

        // Check private local disk first
        if ($this->file_path && Storage::disk('local')->exists($this->file_path)) {
            $raw = Storage::disk('local')->get($this->file_path);
        }
        // Fallback to public disk (for legacy unmigrated files)
        elseif ($this->file_path && Storage::disk('public')->exists($this->file_path)) {
            $raw = Storage::disk('public')->get($this->file_path);
        }

        if ($raw === null) {
            return null;
        }

        // Try decrypting with AES-256
        try {
            return Crypt::decrypt($raw);
        } catch (\Illuminate\Contracts\Encryption\DecryptException $e) {
            // If already unencrypted (e.g. legacy file before migration), return raw bytes
            return $raw;
        }
    }

    /**
     * Safely delete physical file from both local and public disks.
     */
    public function deletePhysicalFile(): void
    {
        if ($this->file_path) {
            if (Storage::disk('local')->exists($this->file_path)) {
                Storage::disk('local')->delete($this->file_path);
            }
            if (Storage::disk('public')->exists($this->file_path)) {
                Storage::disk('public')->delete($this->file_path);
            }
        }
    }

    public function applicant()
    {
        return $this->belongsTo(Applicant::class);
    }
}