<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Models\Session;
use Shopify\Clients\Rest;
/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Route::get('/', function () {
    return "Hello API";
});
Route::get('32', [\App\Http\Controllers\ProductController::class, 'ProductsSync']);
Route::group(['middleware' => ['shopify.auth']], function () {


    Route::get('dashboard', [\App\Http\Controllers\DashboardController::class, 'index']);
    Route::post('update-products', [\App\Http\Controllers\ProductController::class, 'UpdateProducts']);
    Route::get('logs', [\App\Http\Controllers\DashboardController::class, 'Logs']);
    Route::get('check-status', [\App\Http\Controllers\DashboardController::class, 'CheckStatus']);

});
Route::get('check-charge', [\App\Http\Controllers\PlanController::class, 'CheckCharge']);
Route::any('return-url', [\App\Http\Controllers\PlanController::class, 'ReturnUrl']);

Route::post('/webhooks/app-uninstall', function (Request $request) {
    try {
        $product=json_decode($request->getContent());
        $shop=$request->header('x-shopify-shop-domain');
        $shop=\App\Models\Session::where('shop',$shop)->first();
        \App\Models\Charge::where('shop_id',$shop->id)->delete();
        \App\Models\Product::where('shop_id',$shop->id)->delete();
        \App\Models\ProductVariant::where('shop_id',$shop->id)->delete();
        \App\Models\Log::where('shop_id',$shop->id)->delete();


        $shop->forceDelete();

    } catch (\Exception $e) {
    }
});

//Product Webhook
Route::post('/webhooks/product-create', function (Request $request) {
    try {

        $product=json_decode($request->getContent());
        $shop=$request->header('x-shopify-shop-domain');
        $shop=\App\Models\Session::where('shop',$shop)->first();
        \App\Jobs\ProductWebhookJob::dispatch($product,$shop);

    } catch (\Exception $e) {

    }
});

Route::post('/webhooks/product-update', function (Request $request) {
    try {

        $product=json_decode($request->getContent());

        $shop=$request->header('x-shopify-shop-domain');
        $shop=\App\Models\Session::where('shop',$shop)->first();
        \App\Jobs\ProductWebhookJob::dispatch($product,$shop);

    } catch (\Exception $e) {

    }
});

Route::post('/webhooks/product-delete', function (Request $request) {
    try {
        $product=json_decode($request->getContent());
        $shop=$request->header('x-shopify-shop-domain');
        $shop=\App\Models\Session::where('shop',$shop)->first();
        $product_controller=new \App\Http\Controllers\ProductController();
        $product_controller->DeleteProduct($product,$shop);

    } catch (\Exception $e) {

    }
});


Route::get('/testing', function() {


    $session=Session::where('shop','testing-store334.myshopify.com')->first();

    $client = new Rest($session->shop, $session->access_token);

    $response = $client->get('/webhooks.json');
    dd($response->getDecodedBody());



})->name('getwebbhook');
