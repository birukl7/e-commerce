<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;

class TaxSettingCollection extends ResourceCollection
{
    /**
     * Transform the resource collection into an array.
     *
     * @return array<int|string, mixed>
     */
    /**
     * Transform the resource collection into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'data' => $this->collection->map(function ($taxSetting) {
                return [
                    'id' => $taxSetting->id,
                    'name' => $taxSetting->name,
                    'type' => $taxSetting->type,
                    'rate' => (float) $taxSetting->rate,
                    'formatted_rate' => $taxSetting->formatted_rate,
                    'is_active' => (bool) $taxSetting->is_active,
                    'country' => $taxSetting->country,
                    'state' => $taxSetting->state,
                    'city' => $taxSetting->city,
                    'tax_class' => $taxSetting->whenLoaded('taxClass', function () use ($taxSetting) {
                        return [
                            'id' => $taxSetting->taxClass->id,
                            'name' => $taxSetting->taxClass->name,
                            'is_default' => (bool) $taxSetting->taxClass->is_default,
                        ];
                    }),
                    'created_at' => $taxSetting->created_at?->toDateTimeString(),
                ];
            }),
            'meta' => [
                'total' => $this->total(),
                'per_page' => $this->perPage(),
                'current_page' => $this->currentPage(),
                'last_page' => $this->lastPage(),
                'from' => $this->firstItem(),
                'to' => $this->lastItem(),
                'links' => [
                    'first' => $this->url(1),
                    'last' => $this->url($this->lastPage()),
                    'prev' => $this->previousPageUrl(),
                    'next' => $this->nextPageUrl(),
                ],
            ],
        ];
    }
}
