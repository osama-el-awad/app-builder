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
        Schema::table('app_builds', function (Blueprint $table) {
            $table->string('download_url')->nullable()->after('artifact_url');
            $table->text('log')->nullable()->after('download_url');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('app_builds', function (Blueprint $table) {
            $table->dropColumn(['download_url', 'log']);
        });
    }
};
