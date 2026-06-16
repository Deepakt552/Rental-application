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
        Schema::create('current_addresses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('applicant_id')->constrained()->onDelete('cascade');
            $table->string('country')->required();
            $table->string('address_line_1')->required();
            $table->string('address_line_2')->nullable();
            $table->string('city')->required();
            $table->string('state')->required();
            $table->string('zip_code')->required();
            $table->string('apartment_community')->nullable();
            $table->string('management_company')->required();
            $table->string('management_phone')->nullable();
            $table->date('residency_from_date')->nullable();
            $table->decimal('monthly_rent', 10, 2)->nullable();
            $table->text('reason_for_moving')->nullable();
            $table->boolean('notice_given')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('current_addresses');
    }
};
