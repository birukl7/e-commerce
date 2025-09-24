<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TaxClassResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'is_active' => $this->is_active,
            'is_default' => $this->is_default,
            'sort_order' => $this->sort_order,
            'created_at' => $this->created_at?->toDateTimeString(),
            'updated_at' => $this->updated_at?->toDateTimeString(),
            'deleted_at' => $this->whenNotNull($this->deleted_at?->toDateTimeString()),
            'tax_rates' => $this->whenLoaded('taxRates', function () {
                return $this->taxRates->map(function ($rate) {
                    return [
                        'id' => $rate->id,
                        'name' => $rate->name,
                        'rate' => $rate->rate,
                        'formatted_rate' => $rate->formatted_rate,
                        'is_active' => $rate->is_active,
                        'country' => $rate->country,
                        'state' => $rate->state,
                        'city' => $rate->city,
                        'postal_code' => $rate->postal_code,
                        'priority' => $rate->priority,
                        'compound' => $rate->compound,
                        'shipping_taxable' => $rate->shipping_taxable,
                        'created_at' => $rate->created_at?->toDateTimeString(),
                        'updated_at' => $rate->updated_at?->toDateTimeString(),
                    ];
                });
            }),
        ];
    }
}
