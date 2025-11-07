<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\AddressUpdateRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Redirect;

class AddressController extends Controller
{
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





