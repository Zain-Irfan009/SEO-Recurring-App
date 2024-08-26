<?php

namespace App\Jobs;

use App\Http\Controllers\ProductController;
use App\Models\Session;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class UpdateSEOProductJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;


    public $shop;
    public $seo_title;
    public $seo_description;

    public $timeout = 100000;
    /**
     * Create a new job instance.
     *
     * @return void
     */
    public function __construct($shop,$seo_title,$seo_description)
    {
        $this->shop=$shop;
        $this->seo_title=$seo_title;
        $this->seo_description=$seo_description;
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        $user=Session::first();
        $productController=new ProductController();
        $productController->UpdateAllProducts($this->shop,$this->seo_title,$this->seo_description);
    }
}
