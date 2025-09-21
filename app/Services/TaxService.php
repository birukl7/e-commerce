<?php

namespace App\Services;

use App\Models\TaxSetting;
use Illuminate\Support\Collection;

class TaxService
{
    /**
     * Calculate all applicable taxes for a given amount
     */
    public function calculateTaxes(float $amount): array
    {
        $activeTaxes = TaxSetting::active()->get();
        $taxes = [];
        $totalTaxAmount = 0;

        foreach ($activeTaxes as $tax) {
            $taxAmount = $tax->calculateTax($amount);
            $taxes[] = [
                'id' => $tax->id,
                'name' => $tax->name,
                'type' => $tax->type,
                'rate' => $tax->rate,
                'amount' => $taxAmount,
                'formatted_rate' => $tax->formatted_rate,
                'description' => $tax->description,
            ];
            $totalTaxAmount += $taxAmount;
        }

        return [
            'taxes' => $taxes,
            'total_tax_amount' => $totalTaxAmount,
            'subtotal' => $amount,
            'total' => $amount + $totalTaxAmount,
        ];
    }

    /**
     * Get tax breakdown for display purposes
     */
    public function getTaxBreakdown(float $amount): Collection
    {
        $activeTaxes = TaxSetting::active()->get();
        
        return $activeTaxes->map(function ($tax) use ($amount) {
            return [
                'name' => $tax->name,
                'rate' => $tax->formatted_rate,
                'amount' => $tax->calculateTax($amount),
                'description' => $tax->description,
            ];
        });
    }

    /**
     * Calculate total amount including taxes
     */
    public function calculateTotalWithTaxes(float $amount): float
    {
        $taxCalculation = $this->calculateTaxes($amount);
        return $taxCalculation['total'];
    }

    /**
     * Get only the total tax amount
     */
    public function getTotalTaxAmount(float $amount): float
    {
        $taxCalculation = $this->calculateTaxes($amount);
        return $taxCalculation['total_tax_amount'];
    }

    /**
     * Get active tax settings for frontend
     */
    public function getActiveTaxSettings(): Collection
    {
        return TaxSetting::active()->get()->map(function ($tax) {
            return [
                'id' => $tax->id,
                'name' => $tax->name,
                'type' => $tax->type,
                'rate' => $tax->rate,
                'formatted_rate' => $tax->formatted_rate,
                'description' => $tax->description,
            ];
        });
    }
}
