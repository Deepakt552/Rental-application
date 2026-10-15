<?php

namespace App\Http\Controllers;

use App\Models\ApplicantDocument;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class SecureDocumentController extends Controller
{
    /**
     * Securely stream an encrypted document with strict authorization check.
     */
    public function show(Request $request, $id, $hash)
    {
        try {
            $document = ApplicantDocument::with('applicant')->findOrFail($id);

            // 1. Verify tamper-proof HMAC hash signature
            if (!hash_equals($document->generateSecureHash(), (string) $hash)) {
                Log::warning("Unauthorized document access attempt with invalid signature for Document #{$id}");
                abort(403, 'Invalid document security signature.');
            }

            // 2. Strict authorization check
            $user = $request->user();
            $authorized = false;

            // Admin / Superadmin is authorized
            if ($user && in_array(strtolower($user->role ?? ''), ['admin', 'superadmin'])) {
                $authorized = true;
            }

            // Tenant user who owns this application is authorized (by user_id or email)
            if (!$authorized && $user && $document->applicant) {
                if (($document->applicant->user_id && (int) $document->applicant->user_id === (int) $user->id) ||
                    (!empty($document->applicant->email) && strtolower(trim($document->applicant->email)) === strtolower(trim($user->email ?? '')))) {
                    $authorized = true;
                }
            }

            // Active session during application flow
            $sessionAppId = session('current_applicant_id');
            $sessionAppSessionId = session('applicant_session_id');

            if (!$authorized && (
                ($sessionAppSessionId && $sessionAppSessionId === $document->session_id) ||
                ($sessionAppId && (int) $sessionAppId === (int) $document->applicant_id)
            )) {
                $authorized = true;
            }

            // Valid cryptographic signed HMAC allows applicant to view their own documents during draft/application flow
            if (!$authorized && $document->applicant && $document->applicant->status === 'draft') {
                $authorized = true;
            }

            if (!$authorized) {
                Log::warning("Unauthorized document access attempt: User " . ($user ? $user->id : 'Guest') . " tried to access Document #{$id}");
                abort(403, 'Unauthorized access. This document is encrypted and protected.');
            }

            // 3. Retrieve and decrypt file content in memory
            $content = $document->getDecryptedContent();

            if ($content === null) {
                abort(404, 'Document file not found.');
            }

            // 4. Determine mime type and filename
            $mimeType = $document->mime_type ?: 'application/octet-stream';
            $filename = $document->original_filename ?: ('document_' . $document->id);

            return response($content, 200, [
                'Content-Type' => $mimeType,
                'Content-Disposition' => 'inline; filename="' . addslashes($filename) . '"',
                'Cache-Control' => 'no-store, no-cache, must-revalidate, max-age=0, private',
                'Pragma' => 'no-cache',
                'Expires' => '0',
                'X-Content-Type-Options' => 'nosniff',
            ]);
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            abort(404, 'Document not found.');
        } catch (\Symfony\Component\HttpKernel\Exception\HttpException $e) {
            throw $e;
        } catch (\Exception $e) {
            Log::error("Error serving secure document #{$id}: " . $e->getMessage());
            abort(500, 'Unable to decrypt and serve document.');
        }
    }
}
