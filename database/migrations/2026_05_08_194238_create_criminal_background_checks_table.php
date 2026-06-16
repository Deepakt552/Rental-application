// database/migrations/2024_01_01_000003_create_criminal_background_checks_table.php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('criminal_background_checks', function (Blueprint $table) {
            $table->id();
            $table->uuid('session_id');
            $table->unsignedBigInteger('application_id')->nullable();
            $table->string('applicant_name');
            $table->string('social_security_no');
            $table->date('date_of_birth');
            $table->date('today_date');
            $table->text('signature');
            $table->timestamps();
            
            $table->index('session_id');
            // $table->foreign('application_id')->references('id')->on('applications')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('criminal_background_checks');
    }
};