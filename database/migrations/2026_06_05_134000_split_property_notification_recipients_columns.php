<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('properties', function (Blueprint $table) {
            $table->dropColumn('notification_recipients');
            $table->json('app_notification_recipients')->nullable()->after('address');
            $table->json('reminder_notification_recipients')->nullable()->after('app_notification_recipients');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('properties', function (Blueprint $table) {
            $table->dropColumn('app_notification_recipients');
            $table->dropColumn('reminder_notification_recipients');
            $table->json('notification_recipients')->nullable()->after('address');
        });
    }
};
