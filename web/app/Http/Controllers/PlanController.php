<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\Charge;
use App\Models\Plan;
use App\Models\Session;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redirect;

class PlanController extends Controller
{


    public function plans(Request $request)
    {
        $plans = Plan::orderBy('priority', 'asc')->where('on_install', 0)->get();
//        $plans = Plan::where('on_install',0)->get();
        $active_plan = null;


        $session = Session::where('shop', $request['shop'])->first();

        if (isset($session)) {
            $charge = \App\Models\Charge::where('shop_id', $session->id)->where('status', 'active')->latest()->first();

            if (isset($charge) && strtoupper($charge->status) == 'ACTIVE') {
                if (isset($charge->plan_id)) {
                    $active_plan = Plan::find($charge->plan_id);
                }
            }

        }
        $plans_count = Plan::count();
//        $plans_count = Plan::where('on_install',0)->count();

        unset($session['password']);
        unset($session['email']);
        unset($session['name']);
        unset($session['contact_email']);

        $data = [
            'active_plan' => $active_plan,
            'plans' => $plans,
            'user' => $session,
            'plans_count' => $plans_count,
        ];

        return response()->json($data);
//        return view('module.plans', compact('plans'));
    }

//    public function active_plan(Request $request,$id,$shop,$host){
    public function active_plan(Request $request)
    {

        try {
            $id = $request['id'];
            $shop = $request['shop'];
            $host = $request['host'];

            $res = $this->PlanCreate($id, $shop, $host);
//            dd($res);
            $data = [
                'confirmation_url' => $res,
            ];

        } catch (\Exception $exception) {
            $data = [
                'error' => $exception->getMessage(),
            ];
        }

        return response($data);
    }

    public function active_free_plan(Request $request)
    {

        try {
            $shop = Session::where('shop', $request['shop'])->latest()->first();
            $active_plan_charge = Charge::where('shop_id', $shop->id)->where('status', 'active')->first();
            if (isset($active_plan_charge)) {
                getShopApi($shop->shop)->rest('delete', '/admin/api/2024-01/recurring_application_charges/' . $active_plan_charge->charge_id . '.json');
            }
            $this->check_app_active_plan($shop->name);

            $user = Session::where('shop', $request['shop'])->latest()->first();
            unset($user['password']);
            unset($user['email']);
            unset($user['name']);
            unset($user['contact_email']);
            $data = [
                'status' => 'success',
                'user' => $user,
            ];

        } catch (\Exception $exception) {
            $data = [
                'error' => $exception->getMessage(),
            ];
        }

        return response($data);
    }

    public function PlanCreate($shop)
    {
        $shop = Session::where('shop', $shop)->latest()->first();

        $plan = Plan::first();

//        $shop_url = env('APP_URL')."/api/billing/manual/process?host=$host&shop=$shop->name";
        $shop_url = env('APP_URL') . "api/check-charge?shop=$shop->shop";

        $plan_data = [
            "recurring_application_charge" => [
                "name" => $plan->name,
                "price" => $plan->price,
                "return_url" => $shop_url,
                "trial_days" => $plan->trial_days,
                "test" => ($plan->test == 0) ? false : true,
                "terms" => $plan->terms,
//                "capped_amount" => $plan->capped_amount,

            ]
        ];

        $response = getShopApi($shop->shop)->rest('post', '/admin/api/2024-01/recurring_application_charges.json', $plan_data);


        if ($response['errors'] == false) {
            $response = $response['body']['recurring_application_charge'];

            $plan = Plan::where('name', $response->name)->first();

            $charge = new Charge();
            $charge->name = $response->name;
            $charge->charge_id = $response->id;
            $charge->plan_id = isset($plan) ? $plan->id : null;
            $charge->status = $response->status;
            $charge->price = $response->price;
            $charge->type = "RECURRING";
            $charge->capped_amount = isset($response->capped_amount) ? $response->capped_amount : null;
            $charge->trial_days = $response->trial_days;
            $charge->billing_on = $response->billing_on;
            $charge->trial_ends_on = $response->trial_ends_on;
            $charge->test = $response->test;
            $charge->terms = isset($plan->terms) ? $plan->terms : null;
            $charge->activated_on = $response->activated_on;
            $charge->cancelled_on = $response->cancelled_on;
            $charge->shop_id = $shop->id;
            $charge->save();

            return ($response->confirmation_url);
        } else {
            return "error";
        }


    }

    public function CheckCharge(Request $request)
    {

        $shop = Session::where('shop', $request['shop'])->first();
        $host = $request->host;

        $response = getShopApi($shop->shop)->rest('GET', '/admin/api/2024-01/recurring_application_charges/' . $request['charge_id'] . '.json');

        if ($response['errors'] == false) {
            $response = $response['body']['recurring_application_charge'];

            if ($response->status == 'active') {
                $charge = Charge::where('charge_id', $response->id)->first();
                if ($charge == null) {
                    $charge = new Charge();
                }
                $charge->status = 'active';
                $charge->capped_amount = isset($response->capped_amount) ? $response->capped_amount : null;
                $charge->billing_on = $response->billing_on;
                $charge->activated_on = $response->activated_on;
                $charge->cancelled_on = $response->cancelled_on;
                $charge->trial_ends_on = $response->trial_ends_on;
                $charge->save();

            }
            $this->check_app_active_plan($shop['shop']);

        }

        return redirect("https://admin.shopify.com/store/".explode('.myshopify.com',$shop->shop)[0]."/apps/seo-app-25");
    }

    public function check_app_active_plan($shop)
    {
        $shop = Session::where('shop', $shop)->first();

        $response =getShopApi($shop->shop)->rest('get', '/admin/api/2024-01/recurring_application_charges.json');

        if ($response['errors'] == false) {
            $charges_response = $response['body']['recurring_application_charges'];
            foreach ($charges_response as $response) {
                $charge = Charge::where('charge_id', $response->id)->first();
                $plan = Plan::where('name', $response->name)->first();
                if ($charge == null) {
                    $charge = new Charge();
                }
                $charge->name = $response->name;
                $charge->charge_id = $response->id;
                $charge->plan_id = isset($plan) ? $plan->id : null;
                $charge->status = $response->status;
                $charge->price = $response->price;
                $charge->type = "RECURRING";
                $charge->capped_amount = isset($response->capped_amount) ? $response->capped_amount : null;
                $charge->trial_days = $response->trial_days;
                $charge->billing_on = $response->billing_on;
                $charge->trial_ends_on = $response->trial_ends_on;
                $charge->test = $response->test;
                $charge->terms = isset($plan->terms) ? $plan->terms : null;
                $charge->activated_on = $response->activated_on;
                $charge->cancelled_on = $response->cancelled_on;
                $charge->shop_id = $shop->id;
                $charge->created_at = Carbon::createFromTimeString($response->created_at)->format('Y-m-d H:i:s');;
                $charge->save();
            }

        }

        $active_charge = Charge::where('status', 'active')->where('shop_id', $shop->id)->first();
        if (isset($active_charge)) {
            $shop->plan_id = 1;
            $shop->save();
        } else {
            $shop->plan_id = null;
            $shop->save();
        }

        return $response;
    }

    public function billing_redirect_url($user){
        $charge = \App\Models\Charge::where('shop_id', $user->id)->latest()->first();

        $billing_page_url = null;

        if ($user->plan_id == null || $charge == null || $charge->status != 'active') {

            $check_active_plan = $this->check_app_active_plan($user->shop);

            $shop_to_check_plan = \App\Models\Session::where('shop',$user->shop)->first();

            if (isset($shop_to_check_plan) && isset($shop_to_check_plan->plan_id)) {

            } else {
                $billing_page_url = $this->PlanCreate($user->shop);

                if ($billing_page_url == 'error') {
                    $billing_page_url = null;
                }

            }
        }

        return $billing_page_url;


    }
}
