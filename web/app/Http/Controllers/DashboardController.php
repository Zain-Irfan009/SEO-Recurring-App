<?php

namespace App\Http\Controllers;

use App\Models\Charge;
use App\Models\Log;
use App\Models\Plan;
use App\Models\Rule;
use App\Models\Session;
use Illuminate\Http\Request;
use Shopify\Clients\Rest;

class DashboardController extends Controller
{

    public function index(Request $request)
    {

        $shop = getShop($request->get('shopifySession'));
//        $shop=Session::where('shop','testing-store334.myshopify.com')->first();
        try {
            if ($shop) {

                $charge=Charge::where('status','active')->where('shop_id',$shop->id)->latest()->first();
                $subscribed=true;
                $billing_url=null;
                if($charge==null){
                    $subscribed=false;
                    $plan_controller = new PlanController();
                    $billing_url = $plan_controller->billing_redirect_url($shop);


                }

                $data = [
                    'success' => true,
                    'subscribed'=>$subscribed,
                    'billing_url'=>$billing_url,
                    'shopname'=>$shop->shop,


                ];

            }
        } catch (\Exception $exception) {
            $data = [
                'error' => $exception->getMessage(),
                'success' => false
            ];
        }
        return response()->json($data);
    }


    public function Logs(Request $request){

        $shop = getShop($request->get('shopifySession'));
        try {
            if ($shop) {
                $logs = Log::where('shop_id', $shop->id)->orderBy('id', 'Desc')->paginate(20);
                $data = [
                    'success' => true,
                    'data' => $logs,
                ];

            }
        } catch (\Exception $exception) {
            $data = [
                'error' => $exception->getMessage(),
                'success' => false
            ];
        }
        return response()->json($data);
    }

    public function CheckStatus(Request $request){
        $shop = getShop($request->get('shopifySession'));
        try {
            if ($shop) {
                $log=Log::where('shop_id',$shop->id)->first();
                $show_banner=false;
                if($log) {
                    $logs_count = Log::where('shop_id', $shop->id)->where('is_complete', 0)->count();
                    if($logs_count > 0){
                        $show_banner=true;
                    }
                }
                $data = [
                    'success' => true,
                    'show_banner' => $show_banner,
                ];

            }
        } catch (\Exception $exception) {
            $data = [
                'error' => $exception->getMessage(),
                'success' => false
            ];
        }
        return response()->json($data);
    }



}
