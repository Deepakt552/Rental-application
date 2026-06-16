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
        Schema::table('applicants', function (Blueprint $table) {
            //
            $table->integer('current_step')
                ->default(1)
                ->after('consent_status');

            $table->string('type')
                ->nullable()
                ->after('current_step');

            $table->enum('status', [
                'draft',
                'submitted'
            ])->default('draft')
                ->after('type');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('applicants', function (Blueprint $table) {
            //
        });
    }
};
