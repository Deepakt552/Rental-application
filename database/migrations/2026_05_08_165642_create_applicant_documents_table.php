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
        Schema::create('applicant_documents', function (Blueprint $table) {
            $table->id();

            // Link to applicant (nullable because file may be uploaded before applicant is created)
            $table->foreignId('applicant_id')
                ->nullable()
                ->constrained('applicants')
                ->onDelete('cascade');

            // Session ID to associate documents before applicant record exists
            $table->string('session_id')->nullable()->index();

            // Document type (matches your frontend document keys)
            $table->enum('document_type', [
                'driving_license',
                'pay_check',
                'bank_statement',
                'social_security_card',
                'other_source_of_income',
                'other'
            ]);

           
            $table->string('file_path');              // stored path (e.g., documents/xxx.pdf)
            $table->string('original_filename');      // user's original file name
            $table->string('mime_type');              // e.g., application/pdf
            $table->unsignedInteger('size');          

           
            $table->text('description')->nullable();

            $table->timestamps();

            
            $table->index(['applicant_id', 'document_type']);
            $table->index(['session_id', 'document_type']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('applicant_documents');
    }
};
