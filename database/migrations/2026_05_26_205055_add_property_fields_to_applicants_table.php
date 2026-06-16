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
        Schema::table('applicants', function (Blueprint $table) {

            // Company Name
            $table->enum('company_name', ['triumph', 'Excel'])
                ->nullable()
                ->after('payment_status');

            // Selected Property ID
            $table->unsignedBigInteger('property_id')
                ->nullable()
                ->after('company_name');

            // Property Name
            $table->string('property_name')
                ->nullable()
                ->after('property_id');

            // Property Type
            $table->string('property_type')
                ->nullable()
                ->after('property_name');

            // Desired Move Date
            $table->date('desired_move_date')
                ->nullable()
                ->after('property_type');

            /*
            |--------------------------------------------------------------------------
            | Foreign Key
            |--------------------------------------------------------------------------
            */
            $table->foreign('property_id')
                ->references('id')
                ->on('properties')
                ->nullOnDelete();

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('applicants', function (Blueprint $table) {

            $table->dropForeign(['property_id']);

            $table->dropColumn([
                'company_name',
                'property_id',
                'property_name',
                'property_type',
                'desired_move_date',
            ]);
        });
    }
};