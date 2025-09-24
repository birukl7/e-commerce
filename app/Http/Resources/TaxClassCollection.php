<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;

class TaxClassCollection extends ResourceCollection
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
            'data' => $this->collection->map(function ($taxClass) {
                return [
                    'id' => $taxClass->id,
                    'name' => $taxClass->name,
                    'slug' => $taxClass->slug,
                    'description' => $taxClass->description,
                    'is_active' => $taxClass->is_active,
                    'is_default' => $taxClass->is_default,
                    'sort_order' => $taxClass->sort_order,
                    'created_at' => $taxClass->created_at?->toDateTimeString(),
                    'updated_at' => $taxClass->updated_at?->toDateTimeString(),
                    'tax_rates_count' => $taxClass->whenLoaded('taxRates', function () use ($taxClass) {
                        return $taxClass->taxRates->count();
                    }, 0),
                ];
            }),
            'meta' => [
                'total' => $this->total(),
                'count' => $this->count(),
                'per_page' => $this->perPage(),
                'current_page' => $this->currentPage(),
                'total_pages' => $this->lastPage(),
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
