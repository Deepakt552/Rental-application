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
        Schema::table('criminal_background_checks', function (Blueprint $table) {
            $table->string('current_address')->nullable()->after('date_of_birth');
            $table->string('dl_number')->nullable()->after('current_address');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('criminal_background_checks', function (Blueprint $table) {
            //
        });
    }
};
