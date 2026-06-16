// database/migrations/2024_01_01_000004_create_affordable_housing_consents_table.php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('affordable_housing_consents', function (Blueprint $table) {
            $table->id();
            $table->uuid('session_id');
            $table->unsignedBigInteger('application_id')->nullable();
            $table->enum('member_type', ['head_household', 'co_head', 'adult_member']);
            $table->string('name');
            $table->text('signature');
            $table->date('consent_date');
            $table->timestamps();
            
            $table->index('session_id');
            // $table->foreign('application_id')->references('id')->on('applications')->onDelete('set null');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('affordable_housing_consents');
    }
};