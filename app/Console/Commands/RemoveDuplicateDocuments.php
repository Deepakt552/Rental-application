<?php

namespace App\Console\Commands;

use App\Models\ApplicantDocument;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class RemoveDuplicateDocuments extends Command
{
    /**
     * php artisan documents:remove-duplicates
     * php artisan documents:remove-duplicates --dry-run
     * php artisan documents:remove-duplicates --applicant=73
     */
    protected $signature = 'documents:remove-duplicates
                            {--dry-run : Show what would be deleted without actually deleting}
                            {--applicant= : Only clean up documents for a specific applicant_id}';

    protected $description = 'Find duplicate uploaded documents (same applicant + type + filename, or same file hash) and delete all but one copy';

    public function handle()
    {
        $isDryRun = $this->option('dry-run');
        $applicantId = $this->option('applicant');

        $query = ApplicantDocument::orderBy('id');

        if ($applicantId) {
            $query->where('applicant_id', $applicantId);
        }

        $documents = $query->get();

        if ($documents->isEmpty()) {
            $this->info('No documents found.');
            return self::SUCCESS;
        }

        // Group by applicant + document_type + identity key.
        // Prefer file_hash if the column/value exists (most reliable),
        // otherwise fall back to original_filename.
        $groups = $documents->groupBy(function ($doc) {
            $identity = $doc->file_hash ?: $doc->original_filename;
            return $doc->applicant_id . '|' . $doc->document_type . '|' . $identity;
        });

        $totalDuplicates = 0;
        $totalGroups = 0;

        foreach ($groups as $key => $group) {
            if ($group->count() <= 1) {
                continue;
            }

            $totalGroups++;

            // Keep the oldest record (first uploaded), remove the rest
            $sorted = $group->sortBy('id')->values();
            $keep = $sorted->first();
            $duplicates = $sorted->slice(1);

            $this->line("Duplicate group: applicant_id={$keep->applicant_id}, type={$keep->document_type}, file=\"{$keep->original_filename}\"");
            $this->line("  Keeping ID {$keep->id} ({$keep->file_path})");

            foreach ($duplicates as $dupe) {
                $totalDuplicates++;
                $this->line("  " . ($isDryRun ? 'Would delete' : 'Deleting') . " ID {$dupe->id} ({$dupe->file_path})");

                if (!$isDryRun) {
                    if ($dupe->file_path && Storage::disk('public')->exists($dupe->file_path)) {
                        Storage::disk('public')->delete($dupe->file_path);
                    }
                    $dupe->delete();
                }
            }
        }

        $this->newLine();

        if ($totalDuplicates === 0) {
            $this->info('No duplicate documents found. Nothing to clean up.');
            return self::SUCCESS;
        }

        if ($isDryRun) {
            $this->warn("DRY RUN: Found {$totalDuplicates} duplicate file(s) across {$totalGroups} group(s). Run without --dry-run to delete them.");
        } else {
            $this->info("Done. Removed {$totalDuplicates} duplicate file(s) across {$totalGroups} group(s).");
        }

        return self::SUCCESS;
    }
}