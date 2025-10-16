@extends('layouts.app')

@section('content')
<div class="container py-4">
    <div class="row">
        <div class="col-md-3">
            <div class="card mb-4">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <h5 class="card-title mb-0">Supplier Dashboard</h5>
                        <span class="badge bg-{{ $supplier->isApproved() ? 'success' : 'warning' }}">
                            {{ $supplier->verification_status }}
                        </span>
                    </div>
                    
                    <div class="list-group list-group-flush">
                        <a href="#overview" class="list-group-item list-group-item-action active">
                            <i class="fas fa-tachometer-alt me-2"></i> Overview
                        </a>
                        <a href="#products" class="list-group-item list-group-item-action">
                            <i class="fas fa-box me-2"></i> Products
                        </a>
                        <a href="#orders" class="list-group-item list-group-item-action">
                            <i class="fas fa-shopping-cart me-2"></i> Orders
                        </a>
                        <a href="#earnings" class="list-group-item list-group-item-action">
                            <i class="fas fa-money-bill-wave me-2"></i> Earnings
                        </a>
                        <a href="#settings" class="list-group-item list-group-item-action">
                            <i class="fas fa-cog me-2"></i> Settings
                        </a>
                    </div>
                </div>
            </div>
        </div>

        <div class="col-md-9">
            @if (session('success'))
                <div class="alert alert-success">
                    {{ session('success') }}
                </div>
            @endif

            @if (!$isApproved)
                <div class="alert alert-warning">
                    <h5 class="alert-heading">Your supplier account is pending approval</h5>
                    <p class="mb-0">
                        Your application is under review. You'll be able to add products once your account is approved.
                    </p>
                </div>
            @endif

            <div class="card mb-4">
                <div class="card-body">
                    <h5 class="card-title">Business Overview</h5>
                    <div class="row">
                        <div class="col-md-4">
                            <div class="card bg-light">
                                <div class="card-body text-center">
                                    <h2 class="display-6">0</h2>
                                    <p class="text-muted mb-0">Products</p>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="card bg-light">
                                <div class="card-body text-center">
                                    <h2 class="display-6">0</h2>
                                    <p class="text-muted mb-0">Orders</p>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="card bg-light">
                                <div class="card-body text-center">
                                    <h2 class="display-6">$0.00</h2>
                                    <p class="text-muted mb-0">Earnings</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="card">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center mb-4">
                        <h5 class="card-title mb-0">Recent Activity</h5>
                        <a href="#" class="btn btn-sm btn-outline-primary">View All</a>
                    </div>
                    
                    <div class="list-group">
                        <div class="list-group-item">
                            <div class="d-flex w-100 justify-content-between">
                                <h6 class="mb-1">Account Created</h6>
                                <small>{{ $supplier->created_at->diffForHumans() }}</small>
                            </div>
                            <p class="mb-1">Your supplier account was created successfully.</p>
                        </div>
                        
                        @if($supplier->verification_status === 'approved')
                            <div class="list-group-item">
                                <div class="d-flex w-100 justify-content-between">
                                    <h6 class="mb-1">Account Approved</h6>
                                    <small>{{ $supplier->updated_at->diffForHumans() }}</small>
                                </div>
                                <p class="mb-1">Your supplier account has been approved. You can now add products.</p>
                            </div>
                        @endif
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
@endsection

@push('styles')
<style>
    .card {
        border-radius: 0.5rem;
        box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
    }
    
    .list-group-item {
        border-left: none;
        border-right: none;
    }
    
    .list-group-item:first-child {
        border-top: none;
    }
    
    .list-group-item:last-child {
        border-bottom: none;
    }
</style>
@endpush
