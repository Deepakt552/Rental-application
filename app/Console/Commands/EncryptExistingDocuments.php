<?php

namespace App\Console\Commands;

use App\Models\ApplicantDocument;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;

class EncryptExistingDocuments extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'documents:encrypt-existing';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Encrypt all existing uploaded applicant documents and move them to private storage';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting document encryption and migration to private storage...');

        $documents = ApplicantDocument::all();
        $migratedCount = 0;
        $alreadyEncrypted = 0;
        $notFoundCount = 0;

        foreach ($documents as $doc) {
            $filePath = $doc->file_path;
            if (!$filePath) {
                continue;
            }

            $rawContent = null;
            $sourceDisk = null;

            if (Storage::disk('public')->exists($filePath)) {
                $rawContent = Storage::disk('public')->get($filePath);
                $sourceDisk = 'public';
            } elseif (Storage::disk('local')->exists($filePath)) {
                $rawContent = Storage::disk('local')->get($filePath);
                $sourceDisk = 'local';
            }

            if ($rawContent === null) {
                $this->warn("File missing for Document ID #{$doc->id}: {$filePath}");
                $notFoundCount++;
                continue;
            }

            // Test if already encrypted
            $isEncrypted = false;
            try {
                Crypt::decrypt($rawContent);
                $isEncrypted = true;
            } catch (\Exception $e) {
                $isEncrypted = false;
            }

            if ($isEncrypted) {
                // Ensure it is on private local disk
                if ($sourceDisk === 'public') {
                    Storage::disk('local')->put($filePath, $rawContent);
                    Storage::disk('public')->delete($filePath);
                }
                $alreadyEncrypted++;
                continue;
            }

            // Encrypt and save to private disk
            $encryptedContent = Crypt::encrypt($rawContent);
            Storage::disk('local')->put($filePath, $encryptedContent);

            // Remove unencrypted file from public disk
            if (Storage::disk('public')->exists($filePath)) {
                Storage::disk('public')->delete($filePath);
            }

            $migratedCount++;
            $this->line("Encrypted & migrated: Document #{$doc->id} ({$doc->original_filename})");
        }

        // Clean up any remaining files or empty directories in storage/app/public/documents
        $publicDocsPath = storage_path('app/public/documents');
        if (File::exists($publicDocsPath)) {
            $files = File::allFiles($publicDocsPath);
            foreach ($files as $file) {
                $relativePath = 'documents/' . str_replace('\\', '/', $file->getRelativePathname());
                $content = File::get($file->getRealPath());

                try {
                    $test = Crypt::decrypt($content);
                    $enc = $content;
                } catch (\Exception $e) {
                    $enc = Crypt::encrypt($content);
                }

                Storage::disk('local')->put($relativePath, $enc);
                File::delete($file->getRealPath());
                $this->line("Purged public orphan file: {$relativePath}");
            }

            // Delete directories if empty
            $directories = File::directories($publicDocsPath);
            foreach ($directories as $dir) {
                if (count(File::allFiles($dir)) === 0) {
                    File::deleteDirectory($dir);
                }
            }
        }

        $this->info("Completed! Migrated & Encrypted: {$migratedCount}, Already encrypted: {$alreadyEncrypted}, Missing: {$notFoundCount}");

        return Command::SUCCESS;
    }
}
