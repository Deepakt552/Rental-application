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
        if (Schema::hasTable('properties') && !Schema::hasColumn('properties', 'property_code')) {
            Schema::table('properties', function (Blueprint $table) {
                $table->string('property_code')->nullable()->after('property_name');
            });
        }

        if (Schema::hasTable('applicants') && !Schema::hasColumn('applicants', 'property_code')) {
            Schema::table('applicants', function (Blueprint $table) {
                $table->string('property_code')->nullable()->after('property_id');
            });
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (Schema::hasTable('properties') && Schema::hasColumn('properties', 'property_code')) {
            Schema::table('properties', function (Blueprint $table) {
                $table->dropColumn('property_code');
            });
        }

        if (Schema::hasTable('applicants') && Schema::hasColumn('applicants', 'property_code')) {
            Schema::table('applicants', function (Blueprint $table) {
                $table->dropColumn('property_code');
            });
        }
    }
};
