<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TaxSettingResource extends JsonResource
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
            'type' => $this->type,
            'rate' => (float) $this->rate,
            'formatted_rate' => $this->formatted_rate,
            'description' => $this->description,
            'is_active' => (bool) $this->is_active,
            'country' => $this->country,
            'state' => $this->state,
            'city' => $this->city,
            'postal_code' => $this->postal_code,
            'priority' => (int) $this->priority,
            'compound' => (bool) $this->compound,
            'shipping_taxable' => (bool) $this->shipping_taxable,
            'tax_class' => $this->whenLoaded('taxClass', function () {
                return [
                    'id' => $this->taxClass->id,
                    'name' => $this->taxClass->name,
                    'slug' => $this->taxClass->slug,
                    'is_default' => (bool) $this->taxClass->is_default,
                ];
            }),
            'created_at' => $this->created_at?->toDateTimeString(),
            'updated_at' => $this->updated_at?->toDateTimeString(),
        ];
    }
}
