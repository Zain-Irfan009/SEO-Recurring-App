<?php

namespace App\Http\Controllers;

use App\Models\Charge;
use App\Models\Plan;
use App\Models\Rule;
use Illuminate\Http\Request;
use Shopify\Clients\Rest;

class DashboardController extends Controller
{

    public function index(Request $request)
    {

        $shop = getShop($request->get('shopifySession'));
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
