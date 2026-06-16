<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class CleanupConsentRecords extends Command
{
    protected $signature = 'consent:cleanup';
    protected $description = 'Remove stale pending consent_records where a completed record exists';

    public function handle()
    {
        // Delete pending rows where same applicant_id already has a completed row
        $affected1 = DB::delete("
            DELETE cr1 FROM consent_records cr1
            INNER JOIN consent_records cr2
                ON cr1.applicant_id = cr2.applicant_id
                AND cr2.status = 'completed'
                AND cr2.id != cr1.id
            WHERE cr1.status = 'pending'
              AND cr1.applicant_id IS NOT NULL
        ");
        $this->info("Deleted {$affected1} stale pending rows (same applicant_id as completed).");

        // Delete pending rows with NULL applicant_id where the same session already has a completed entry
        $affected2 = DB::delete("
            DELETE cr1 FROM consent_records cr1
            INNER JOIN consent_records cr2
                ON cr1.session_id = cr2.session_id
                AND cr2.status = 'completed'
            WHERE cr1.status = 'pending'
              AND cr1.applicant_id IS NULL
        ");
        $this->info("Deleted {$affected2} orphan pending rows (null applicant_id, same session as completed).");

        $this->info('Done!');
    }
}
