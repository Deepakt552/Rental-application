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
        Schema::create('personal_information', function (Blueprint $table) {
            $table->id();
            $table->foreignId('applicant_id')->constrained()->onDelete('cascade');
            $table->string('title')->nullable();
            $table->string('first_name')->required();
            $table->string('middle_name')->nullable();
            $table->string('last_name')->required();
            $table->string('preferred_name')->nullable();
            $table->string('marital_status')->nullable();
            $table->string('phone')->required();
            $table->string('email')->required();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('personal_information');
    }
};
