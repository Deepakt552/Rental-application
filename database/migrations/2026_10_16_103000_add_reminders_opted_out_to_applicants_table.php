<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('applicants', function (Blueprint $table) {
            $table->boolean('reminders_opted_out')->default(false)->after('reminder_sent_count');
            $table->timestamp('reminder_opt_out_at')->nullable()->after('reminders_opted_out');
        });
    }

    public function down(): void
    {
        Schema::table('applicants', function (Blueprint $table) {
            $table->dropColumn(['reminders_opted_out', 'reminder_opt_out_at']);
        });
    }
};
