// database/migrations/2024_01_01_000001_create_applicant_tenant_consents_table.php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('applicant_tenant_consents', function (Blueprint $table) {
            $table->id();
            $table->uuid('session_id');
            $table->unsignedBigInteger('application_id')->nullable();
            $table->string('applicant_name');
            $table->text('signature');
            $table->date('consent_date');
            $table->timestamps();
            
            $table->index('session_id');
            // $table->foreign('application_id')->references('id')->on('applications')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('applicant_tenant_consents');
    }
};