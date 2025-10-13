<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductRequestResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'product_name' => $this->product_name,
            'product_url' => $this->product_url,
            'description' => $this->description,
            'image_url' => $this->image ? asset('storage/' . $this->image) : null,
            'brand' => $this->brand,
            'model' => $this->model,
            'color' => $this->color,
            'size' => $this->size,
            'quantity' => $this->quantity,
            'max_budget' => $this->max_budget,
            'shipping_address' => $this->shipping_address,
            'shipping_method' => $this->shipping_method,
            'shipping_cost' => $this->shipping_cost,
            'desired_delivery_date' => $this->desired_delivery_date?->toDateString(),
            'additional_notes' => $this->additional_notes,
            'specifications' => $this->specifications ?? [],
            'status' => $this->status,
            'fulfillment_status' => $this->fulfillment_status,
            'admin_response' => $this->admin_response,
            'amount' => $this->amount,
            'estimated_price' => $this->estimated_price,
            'currency' => $this->currency,
            'payment_status' => $this->payment_status,
            'payment_method' => $this->payment_method,
            'paid_at' => $this->paid_at?->toDateTimeString(),
            'tracking_number' => $this->tracking_number,
            'tracking_url' => $this->tracking_url,
            'created_at' => $this->created_at->toDateTimeString(),
            'updated_at' => $this->updated_at->toDateTimeString(),
            'user' => $this->whenLoaded('user', function () {
                return [
                    'id' => $this->user->id,
                    'name' => $this->user->name,
                    'email' => $this->user->email,
                ];
            }),
            'admin' => $this->whenLoaded('admin', function () {
                return $this->admin ? [
                    'id' => $this->admin->id,
                    'name' => $this->admin->name,
                    'email' => $this->admin->email,
                ] : null;
            }),
            'order' => $this->whenLoaded('order', function () {
                return $this->order ? [
                    'id' => $this->order->id,
                    'order_number' => $this->order->order_number,
                    'status' => $this->order->status,
                    'total' => $this->order->total,
                ] : null;
            }),
        ];
    }
}
