<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Jobs\UpdateSEOProductJob;
use App\Models\Log;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Http\Request;
use Shopify\Clients\Rest;

class ProductController extends Controller
{
    public function ProductsSync(Request $request){
        $shop = getShop($request->get('shopifySession'));
        $this->syncProducts($shop);
    }
    public function syncProducts($session, $nextPage = null)
    {
        $client = new Rest($session->shop, $session->access_token);
        $result = $client->get('products', [], [
            'limit' => 250,
            'page_info' => $nextPage,
        ]);

        $products = $result->getDecodedBody()['products'];

        foreach ($products as $product) {
            $this->createUpdateProduct($product, $session);
        }
        if (isset($result)) {
            if ($result->getPageInfo() ? true : false) {
                $nextUrl = $result->getPageInfo()->getNextPageUrl();
                if (isset($nextUrl)) {
                    $arr = explode('page_info=', $result->getPageInfo()->getNextPageUrl());
                    $this->syncProducts($session,$arr[count($arr) - 1]);
                }
            }
        }
    }

    public function createUpdateProduct($product, $shop)
    {
        $product = json_decode(json_encode($product), false);
        $p = Product::where([
            'shop_id' => $shop->id,
            'shopify_id' => $product->id
        ])->first();
        if ($p === null) {
            $p = new Product();
        }
        if ($product->images) {
            $image = $product->images[0]->src;
        } else {
            $image = '';
        }
        $p->shopify_id = $product->id;
        $p->shop_id = $shop->id;
        $p->title = $product->title;
        $p->description = $product->body_html;
        $p->handle = $product->handle;
        $p->vendor = $product->vendor;
        $p->type = $product->product_type;
        $p->featured_image = $image;
        $p->tags = $product->tags;
        $p->options = json_encode($product->options);
        $p->status = $product->status;
        $p->published_at = $product->published_at;
        $p->save();
        if (count($product->variants) >= 1) {
            foreach ($product->variants as $variant) {
                $v = ProductVariant::where('shopify_id', $variant->id)->first();
                if ($v === null) {
                    $v = new ProductVariant();
                }
                $v->shop_id = $shop->id;
                $v->shopify_id = $variant->id;
                $v->shopify_product_id = $variant->product_id;
                $v->title = $variant->title;
                $v->option1 = $variant->option1;
                $v->option2 = $variant->option2;
                $v->option3 = $variant->option3;
                $v->sku = $variant->sku;
//                $v->requires_shipping = $variant->requires_shipping;
//                $v->fulfillment_service = $variant->fulfillment_service;
                $v->taxable = $variant->taxable;
                if (isset($product->images)) {
                    foreach ($product->images as $image) {
                        if (isset($variant->image_id)) {
                            if ($image->id == $variant->image_id) {
                                $v->image = $image->src;
                            }
                        } else {
                            $v->image = "";
                        }
                    }
                }
                $v->price = $variant->price;
                $v->compare_at_price = $variant->compare_at_price;
//                $v->weight = $variant->weight;
//                $v->grams = $variant->grams;
//                $v->weight_unit = $variant->weight_unit;
//                $v->inventory_item_id = $variant->inventory_item_id;
//                $v->inventory_management = $variant->inventory_management;
//                $v->inventory_quantity = $variant->inventory_quantity;
//                $v->inventory_policy = $variant->inventory_policy;
                $v->save();
            }
        }
    }

    public function DeleteProduct($product, $shop)
    {
        $prod = Product::where('shopify_id', $product->id)->where('shop_id',$shop->id)->first();
        if(isset($prod)){
            $variants = ProductVariant::where('shopify_product_id', $prod->id)->get();
            if($variants->count()){
                foreach ($variants as $variant){
                    $variant->delete();
                }
            }
            $prod->delete();
        }

    }


    public function Products(Request $request){
        try {
            $shop = getShop($request->get('shopifySession'));
            if($shop){
                $products=Product::query();
                if($request->search){
                    $products = $products->where('title', 'like', '%' . $request->search . '%');
                }
                $products=$products->get();
                $data = [
                    'data' => $products,
                    'success'=>true
                ];
            }
        }catch (\Exception $exception){
            $data=[
                'error'=>$exception->getMessage(),
                'success'=>false
            ];
        }
        return response()->json($data);
    }


    public function UpdateProducts(Request $request){
        try {
            $session = getShop($request->get('shopifySession'));
            $products_count = Product::where('shop_id',$session->id)->count();
            $log=new Log();
            $log->shop_id=$session->id;
            $log->title='Product SEO Title/Description Update';
            $log->total_products=$products_count;
            $log->save();
            UpdateSEOProductJob::dispatch($session, $request->seo_title,$request->seo_description,$log->id);
            $data = [
                'success' => true,
                'message' => 'SEO Updation is In-Progress',

            ];
        }catch (\Exception $exception){
            $data = [
                'error' => $exception->getMessage(),
                'success' => false
            ];
        }
        return response()->json($data);
    }

    public function UpdateAllProducts($session,$seo_title,$seo_description,$log_id){
        $client = new Rest($session->shop, $session->access_token);
        $products = Product::where('shop_id',$session->id)->get();


        $log=Log::find($log_id);
        if($log) {
            foreach ($products as $product) {
                $productdata = [
                    "product" => [
                        'metafields_global_title_tag' => $seo_title,
                        'metafields_global_description_tag' => $seo_description,
                    ]
                ];

                $response = $client->put('/products/' . $product->shopify_id . '.json', $productdata);
                $response = $response->getDecodedBody();


                $response = $response['product'];

                $response = json_decode(json_encode($response));

                $product->seo_update = 1;
                $product->save();

                $log->products_complete=$log->products_complete + 1;
                $log->save();
            }
            $log->is_complete=1;
            $log->save();
        }
        }
}
