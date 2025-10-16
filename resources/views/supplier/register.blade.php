@extends('layouts.app')

@section('content')
<div class="container py-5">
    <div class="row justify-content-center">
        <div class="col-md-8">
            <div class="card">
                <div class="card-header">{{ __('Become a Supplier') }}</div>

                <div class="card-body">
                    <form method="POST" action="{{ route('supplier.register.submit') }}" id="supplierRegistrationForm">
                        @csrf

                        <div class="mb-4">
                            <h5 class="mb-3">Business Information</h5>
                            
                            <div class="mb-3">
                                <label for="business_name" class="form-label">Business Name *</label>
                                <input id="business_name" type="text" 
                                       class="form-control @error('business_name') is-invalid @enderror" 
                                       name="business_name" 
                                       value="{{ old('business_name') }}" 
                                       required autocomplete="business-name" autofocus>
                                @error('business_name')
                                    <span class="invalid-feedback" role="alert">
                                        <strong>{{ $message }}</strong>
                                    </span>
                                @enderror
                            </div>

                            <div class="mb-3">
                                <label for="business_email" class="form-label">Business Email *</label>
                                <input id="business_email" type="email" 
                                       class="form-control @error('business_email') is-invalid @enderror" 
                                       name="business_email" 
                                       value="{{ old('business_email') }}" 
                                       required autocomplete="business-email">
                                @error('business_email')
                                    <span class="invalid-feedback" role="alert">
                                        <strong>{{ $message }}</strong>
                                    </span>
                                @enderror
                            </div>

                            <div class="mb-3">
                                <label for="phone" class="form-label">Phone Number *</label>
                                <input id="phone" type="tel" 
                                       class="form-control @error('phone') is-invalid @enderror" 
                                       name="phone" 
                                       value="{{ old('phone') }}" 
                                       required>
                                @error('phone')
                                    <span class="invalid-feedback" role="alert">
                                        <strong>{{ $message }}</strong>
                                    </span>
                                @enderror
                            </div>

                            <div class="mb-3">
                                <label for="tax_id" class="form-label">Tax ID (Optional)</label>
                                <input id="tax_id" type="text" 
                                       class="form-control @error('tax_id') is-invalid @enderror" 
                                       name="tax_id" 
                                       value="{{ old('tax_id') }}">
                                @error('tax_id')
                                    <span class="invalid-feedback" role="alert">
                                        <strong>{{ $message }}</strong>
                                    </span>
                                @enderror
                            </div>
                        </div>

                        <div class="mb-4">
                            <h5 class="mb-3">Business Address</h5>
                            
                            <div class="row">
                                <div class="col-md-8 mb-3">
                                    <label for="address_street" class="form-label">Street Address *</label>
                                    <input id="address_street" type="text" 
                                           class="form-control @error('address.street') is-invalid @enderror" 
                                           name="address[street]" 
                                           value="{{ old('address.street') }}" required>
                                    @error('address.street')
                                        <span class="invalid-feedback" role="alert">
                                            <strong>{{ $message }}</strong>
                                        </span>
                                    @enderror
                                </div>

                                <div class="col-md-4 mb-3">
                                    <label for="address_postal_code" class="form-label">Postal Code *</label>
                                    <input id="address_postal_code" type="text" 
                                           class="form-control @error('address.postal_code') is-invalid @enderror" 
                                           name="address[postal_code]" 
                                           value="{{ old('address.postal_code') }}" required>
                                    @error('address.postal_code')
                                        <span class="invalid-feedback" role="alert">
                                            <strong>{{ $message }}</strong>
                                        </span>
                                    @enderror
                                </div>
                            </div>

                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label for="address_city" class="form-label">City *</label>
                                    <input id="address_city" type="text" 
                                           class="form-control @error('address.city') is-invalid @enderror" 
                                           name="address[city]" 
                                           value="{{ old('address.city') }}" required>
                                    @error('address.city')
                                        <span class="invalid-feedback" role="alert">
                                            <strong>{{ $message }}</strong>
                                        </span>
                                    @enderror
                                </div>

                                <div class="col-md-3 mb-3">
                                    <label for="address_state" class="form-label">State/Province *</label>
                                    <input id="address_state" type="text" 
                                           class="form-control @error('address.state') is-invalid @enderror" 
                                           name="address[state]" 
                                           value="{{ old('address.state') }}" required>
                                    @error('address.state')
                                        <span class="invalid-feedback" role="alert">
                                            <strong>{{ $message }}</strong>
                                        </span>
                                    @enderror
                                </div>

                                <div class="col-md-3 mb-3">
                                    <label for="address_country" class="form-label">Country *</label>
                                    <select id="address_country" 
                                            class="form-select @error('address.country') is-invalid @enderror" 
                                            name="address[country]" required>
                                        <option value="">Select Country</option>
                                        @foreach(\App\Helpers\Countries::getCountries() as $code => $name)
                                            <option value="{{ $code }}" {{ old('address.country') == $code ? 'selected' : '' }}>
                                                {{ $name }}
                                            </option>
                                        @endforeach
                                    </select>
                                    @error('address.country')
                                        <span class="invalid-feedback" role="alert">
                                            <strong>{{ $message }}</strong>
                                        </span>
                                    @enderror
                                </div>
                            </div>
                        </div>

                        <div class="mb-4">
                            <h5 class="mb-3">Payout Information</h5>
                            <p class="text-muted small">You can add or update your payout method later in your supplier dashboard.</p>
                            
                            <div class="mb-3">
                                <label class="form-label">Payout Method</label>
                                <div class="form-check">
                                    <input class="form-check-input" type="radio" name="payout_method[type]" id="payout_bank" value="bank_transfer" {{ old('payout_method.type') == 'bank_transfer' ? 'checked' : '' }}>
                                    <label class="form-check-label" for="payout_bank">
                                        Bank Transfer
                                    </label>
                                </div>
                                <div class="form-check">
                                    <input class="form-check-input" type="radio" name="payout_method[type]" id="payout_paypal" value="paypal" {{ old('payout_method.type') == 'paypal' ? 'checked' : '' }}>
                                    <label class="form-check-label" for="payout_paypal">
                                        PayPal
                                    </label>
                                </div>
                                <div class="form-check">
                                    <input class="form-check-input" type="radio" name="payout_method[type]" id="payout_other" value="other" {{ !in_array(old('payout_method.type'), ['bank_transfer', 'paypal']) ? 'checked' : '' }}>
                                    <label class="form-check-label" for="payout_other">
                                        Other
                                    </label>
                                </div>
                                @error('payout_method.type')
                                    <span class="invalid-feedback d-block" role="alert">
                                        <strong>{{ $message }}</strong>
                                    </span>
                                @enderror
                            </div>
                        </div>

                        <div class="form-check mb-4">
                            <input class="form-check-input @error('terms') is-invalid @enderror" 
                                   type="checkbox" 
                                   name="terms" 
                                   id="terms" 
                                   {{ old('terms') ? 'checked' : '' }} 
                                   required>
                            <label class="form-check-label" for="terms">
                                I agree to the <a href="{{ route('terms') }}" target="_blank">Terms of Service</a> and 
                                <a href="{{ route('privacy') }}" target="_blank">Privacy Policy</a>
                            </label>
                            @error('terms')
                                <span class="invalid-feedback d-block" role="alert">
                                    <strong>{{ $message }}</strong>
                                </span>
                            @enderror
                        </div>

                        <div class="d-grid">
                            <button type="submit" class="btn btn-primary btn-lg">
                                {{ __('Submit Application') }}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection

@push('scripts')
<script>
    document.addEventListener('DOMContentLoaded', function() {
        // Add any client-side validation or interactivity here
    });
</script>
@endpush
