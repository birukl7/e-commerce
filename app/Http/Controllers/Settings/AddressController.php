<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\AddressUpdateRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Redirect;

class AddressController extends Controller
{
    /**
     * Get all addresses for the authenticated user.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $addresses = $user->addresses()
            ->orderBy('is_default', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($addresses);
    }

    /**
     * Create or update the authenticated user's primary address.
     */
    public function upsert(AddressUpdateRequest $request): RedirectResponse
    {
        $user = $request->user();
        $data = $request->validated();

        $address = $user->addresses()
            ->where('type', 'home')
            ->where('is_default', true)
            ->first();

        $payload = array_merge($data, [
            'type' => 'home',
            'is_default' => true,
        ]);

        if ($address) {
            $address->update($payload);
        } else {
            $address = $user->addresses()->create($payload);
        }

        // Ensure no other address remains marked as default
        $user->addresses()
            ->where('id', '!=', $address->id)
            ->where('is_default', true)
            ->update(['is_default' => false]);

        return Redirect::route('profile.edit')->with('status', 'address-updated');
    }
}








