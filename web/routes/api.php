<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

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
Route::group(['middleware' => ['shopify.auth']], function () {


    Route::get('dashboard', [\App\Http\Controllers\DashboardController::class, 'index']);


});
Route::get('check-charge', [\App\Http\Controllers\PlanController::class, 'CheckCharge']);
Route::any('return-url', [\App\Http\Controllers\PlanController::class, 'ReturnUrl']);

Route::post('/webhooks/app-uninstall', function (Request $request) {
    try {
        $product=json_decode($request->getContent());
        $shop=$request->header('x-shopify-shop-domain');
        $shop=\App\Models\Session::where('shop',$shop)->first();
        \App\Models\Charge::where('shop_id',$shop->id)->delete();


        $shop->forceDelete();

    } catch (\Exception $e) {
    }
});
