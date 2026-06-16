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
        Schema::table('current_addresses', function (Blueprint $table) {
            $table->dropColumn(['management_company', 'management_phone']);
        });

        Schema::table('previous_addresses', function (Blueprint $table) {
            $table->dropColumn(['previous_management_company', 'previous_management_phone']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('current_addresses', function (Blueprint $table) {
            $table->string('management_company')->nullable();
            $table->string('management_phone')->nullable();
        });

        Schema::table('previous_addresses', function (Blueprint $table) {
            $table->string('previous_management_company')->nullable();
            $table->string('previous_management_phone')->nullable();
        });
    }
};
