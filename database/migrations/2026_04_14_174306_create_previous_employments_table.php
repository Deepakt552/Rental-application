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
        Schema::create('previous_employments', function (Blueprint $table) {
            $table->id();
             $table->foreignId('applicant_id')->constrained()->onDelete('cascade');
            $table->string('previous_employer_name')->nullable();
            $table->string('previous_supervisor_name')->nullable();
            $table->string('previous_job_title')->nullable();
            $table->decimal('previous_monthly_income', 10, 2)->nullable();
            $table->decimal('previous_additional_income', 10, 2)->nullable();
            $table->string('previous_income_source')->nullable();
            $table->date('previous_start_date')->nullable();
            $table->date('previous_end_date')->nullable();
            $table->string('previous_employer_address_1')->nullable();
            $table->string('previous_employer_address_2')->nullable();
            $table->string('previous_employer_city')->nullable();
            $table->string('previous_employer_state')->nullable();
            $table->string('previous_employer_zip')->nullable();
            $table->string('previous_employer_phone')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('previous_employments');
    }
};
