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
        Schema::create('previous_addresses', function (Blueprint $table) {
            $table->id();
             $table->foreignId('applicant_id')->constrained()->onDelete('cascade');
            $table->string('previous_country')->nullable();
            $table->string('previous_address_line_1')->nullable();
            $table->string('previous_address_line_2')->nullable();
            $table->string('previous_city')->nullable();
            $table->string('previous_state')->nullable();
            $table->string('previous_zip_code')->nullable();
            $table->string('previous_apartment')->nullable();
            $table->string('previous_management_company')->nullable();
            $table->string('previous_management_phone')->nullable();
            $table->date('previous_from_date')->nullable();
            $table->date('previous_to_date')->nullable();
            $table->decimal('previous_rent', 10, 2)->nullable();
            $table->text('previous_reason')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('previous_addresses');
    }
};
