<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
   // php artisan make:migration add_file_hash_to_applicant_documents

public function up()
{
    Schema::table('applicant_documents', function (Blueprint $table) {
        $table->string('file_hash', 64)->nullable()->after('mime_type');
        $table->index(['applicant_id', 'document_type', 'file_hash']);
    });
}

public function down()
{
    Schema::table('applicant_documents', function (Blueprint $table) {
        $table->dropColumn('file_hash');
    });
}
};
