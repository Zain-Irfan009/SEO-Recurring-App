<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreatePlansTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('plans', function (Blueprint $table) {
            $table->id();
            $table->string('type')->nullable();
            $table->string('name')->nullable();
            $table->double('price')->nullable();
            $table->text('interval')->nullable();
            $table->double('capped_amount')->nullable();
            $table->bigInteger('usage_limit')->nullable();
            $table->text('terms')->nullable();
            $table->integer('trial_days')->default(0);
            $table->integer('test')->default(0);
            $table->integer('on_install')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('plans');
    }
}
