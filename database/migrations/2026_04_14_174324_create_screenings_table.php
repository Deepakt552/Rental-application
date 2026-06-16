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
        Schema::create('screenings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('applicant_id')->constrained()->onDelete('cascade');
            $table->date('date_of_birth')->required();
            $table->string('screening_country')->nullable();
            $table->boolean('has_ssn')->default(false);
            $table->string('ssn')->nullable();
            $table->string('government_id')->nullable();
            $table->string('issuing_entity')->nullable();
            $table->boolean('evicted')->default(false);
            $table->text('eviction_reason')->nullable();
            $table->boolean('felony')->default(false);
            $table->text('felony_reason')->nullable();
            $table->boolean('legal_case')->default(false);
            $table->text('legal_case_details')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('screenings');
    }
};
