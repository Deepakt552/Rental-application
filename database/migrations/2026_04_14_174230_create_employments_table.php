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
        Schema::create('employments', function (Blueprint $table) {
            $table->id();
             $table->foreignId('applicant_id')->constrained()->onDelete('cascade');
            $table->string('employment_country')->required();
            $table->string('employment_status')->nullable();
            $table->string('job_title')->nullable();
            $table->string('employer_name')->nullable();
            $table->string('supervisor_name')->nullable();
            $table->date('employed_since')->nullable();
            $table->decimal('monthly_income', 10, 2)->nullable();
            $table->decimal('additional_income', 10, 2)->nullable();
            $table->string('additional_income_source')->nullable();
            $table->string('employer_address_1')->nullable();
            $table->string('employer_address_2')->nullable();
            $table->string('employer_city')->nullable();
            $table->string('employer_state')->nullable();
            $table->string('employer_zip')->nullable();
            $table->string('employer_phone')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('employments');
    }
};
