<?php

use App\Models\User;
use App\Models\ProductRequest;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\PaymentTransaction;
use App\Services\PaymentFinalizer;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Storage;

uses(RefreshDatabase::class);

// ============================================================================
// PRODUCT REQUEST ORDER ITEMS BREAKAGE TESTS
// Group: product-request-order-items-breakage
// 
// Run with: php artisan test --group=product-request-order-items-breakage
// ============================================================================

uses()->group('product-request-order-items-breakage');

test('order created from product request has zero items', function () {
    $user = User::factory()->create();
    
    $productRequest = ProductRequest::factory()->create([
        'user_id' => $user->id,
        'status' => 'approved',
        'advance_amount' => 1000,
        'final_amount' => 2000,
        'amount' => 3000,
        'product_name' => 'Test Product Request',
        'image' => 'products/test-image.jpg',
        'description' => 'Test description',
        'quantity' => 1,
        'advance_payment_status' => 'processing',
        'customer_willing_to_buy' => true,
        'currency' => 'ETB',
        'order_id' => null,
    ]);

    // Create order from product request
    $order = $productRequest->createOrder(markPaid: false);
    
    // Refresh to get latest data
    $order->refresh();
    $productRequest->refresh();
    
    // BREAKAGE: Order should have items, not zero
    expect($order->items()->count())->toBeGreaterThan(0)
        ->and($order->items()->count())->toBe(1);
    
    // Verify order item exists
    $orderItem = $order->items()->first();
    expect($orderItem)->not->toBeNull();
});

test('order item for product request has correct data in snapshot', function () {
    $user = User::factory()->create();
    
    $productRequest = ProductRequest::factory()->create([
        'user_id' => $user->id,
        'status' => 'approved',
        'advance_amount' => 1000,
        'final_amount' => 2000,
        'amount' => 3000,
        'product_name' => 'Custom Product Name',
        'image' => 'products/custom-image.jpg',
        'description' => 'Custom description for testing',
        'quantity' => 2,
        'advance_payment_status' => 'processing',
        'customer_willing_to_buy' => true,
        'currency' => 'ETB',
        'order_id' => null,
    ]);

    // Create order from product request
    $order = $productRequest->createOrder(markPaid: false);
    
    // Get the order item
    $orderItem = $order->items()->first();
    
    expect($orderItem)->not->toBeNull();
    
    // Verify product_id is null for product requests
    expect($orderItem->product_id)->toBeNull();
    
    // Verify snapshot contains correct data
    $snapshot = $orderItem->product_snapshot;
    expect($snapshot)->toBeArray()
        ->and($snapshot['name'])->toBe('Custom Product Name')
        ->and($snapshot['product_request_id'])->toBe($productRequest->id)
        ->and($snapshot['description'])->toBe('Custom description for testing')
        ->and((float)$snapshot['price'])->toBe(3000.0);
    
    // Verify quantity and price
    expect($orderItem->quantity)->toBe(2)
        ->and((float)$orderItem->price)->toBe(3000.0)
        ->and((float)$orderItem->total)->toBe(6000.0);
});

test('order item snapshot contains product request image', function () {
    $user = User::factory()->create();
    
    $productRequest = ProductRequest::factory()->create([
        'user_id' => $user->id,
        'status' => 'approved',
        'advance_amount' => 1000,
        'final_amount' => 2000,
        'amount' => 3000,
        'product_name' => 'Product With Image',
        'image' => 'products/uploaded-image.jpg',
        'advance_payment_status' => 'processing',
        'customer_willing_to_buy' => true,
        'currency' => 'ETB',
        'order_id' => null,
    ]);

    // Create order from product request
    $order = $productRequest->createOrder(markPaid: false);
    
    // Get the order item
    $orderItem = $order->items()->first();
    $snapshot = $orderItem->product_snapshot;
    
    // BREAKAGE: Image should be in snapshot and properly formatted
    expect($snapshot)->toHaveKey('image')
        ->and($snapshot['image'])->not->toBeNull()
        ->and($snapshot['image'])->toContain('products/uploaded-image.jpg');
});

test('order list shows zero items for product request orders', function () {
    $user = User::factory()->create();
    $admin = User::factory()->create();
    
    // Assign admin role
    if (class_exists(\Spatie\Permission\Models\Role::class)) {
        $adminRole = \Spatie\Permission\Models\Role::where('name', 'admin')->first();
        if (!$adminRole) {
            $adminRole = \Spatie\Permission\Models\Role::where('name', 'super_admin')->first();
        }
        if ($adminRole) {
            $admin->assignRole($adminRole);
        }
    }
    
    $productRequest = ProductRequest::factory()->create([
        'user_id' => $user->id,
        'status' => 'approved',
        'advance_amount' => 1000,
        'final_amount' => 2000,
        'amount' => 3000,
        'product_name' => 'Test Product',
        'image' => 'products/test.jpg',
        'advance_payment_status' => 'processing',
        'customer_willing_to_buy' => true,
        'currency' => 'ETB',
        'order_id' => null,
    ]);

    // Create order and approve payment
    $advanceTransaction = PaymentTransaction::factory()->create([
        'product_request_id' => $productRequest->id,
        'tx_ref' => 'ADV-' . $productRequest->id . '-123456',
        'gateway_status' => 'paid',
        'admin_status' => 'unseen',
        'payment_method' => 'chapa',
        'amount' => 1150,
        'currency' => 'ETB',
        'customer_email' => $user->email,
        'customer_name' => $user->name,
        'order_id' => null,
        'gateway_payload' => ['payment_type' => 'advance'],
    ]);

    $paymentFinalizer = app(PaymentFinalizer::class);
    $paymentFinalizer->handleAdminApproval($advanceTransaction, $admin, 'Approved');
    
    $productRequest->refresh();
    $order = Order::find($productRequest->order_id);
    
    // Get orders list data (simulating UserDashboardController::orders())
    $response = $this->actingAs($user)
        ->get(route('user.orders'));
    
    $response->assertInertia(fn ($page) => 
        $page->component('user/orders')
            ->has('orders', 1)
            ->where('orders.0.items', function ($items) {
                // BREAKAGE: Items should not be empty
                // Items might be array or collection, so check if it's iterable
                expect($items)->toBeIterable()
                    ->and(is_countable($items) ? count($items) : iterator_count($items))->toBeGreaterThan(0);
                return true;
            })
    );
});

test('order list does not show product request image', function () {
    $user = User::factory()->create();
    $admin = User::factory()->create();
    
    // Assign admin role
    if (class_exists(\Spatie\Permission\Models\Role::class)) {
        $adminRole = \Spatie\Permission\Models\Role::where('name', 'admin')->first();
        if (!$adminRole) {
            $adminRole = \Spatie\Permission\Models\Role::where('name', 'super_admin')->first();
        }
        if ($adminRole) {
            $admin->assignRole($adminRole);
        }
    }
    
    $productRequest = ProductRequest::factory()->create([
        'user_id' => $user->id,
        'status' => 'approved',
        'advance_amount' => 1000,
        'final_amount' => 2000,
        'amount' => 3000,
        'product_name' => 'Product With Image',
        'image' => 'products/user-uploaded-image.jpg',
        'advance_payment_status' => 'processing',
        'customer_willing_to_buy' => true,
        'currency' => 'ETB',
        'order_id' => null,
    ]);

    // Create order and approve payment
    $advanceTransaction = PaymentTransaction::factory()->create([
        'product_request_id' => $productRequest->id,
        'tx_ref' => 'ADV-' . $productRequest->id . '-123456',
        'gateway_status' => 'paid',
        'admin_status' => 'unseen',
        'payment_method' => 'chapa',
        'amount' => 1150,
        'currency' => 'ETB',
        'customer_email' => $user->email,
        'customer_name' => $user->name,
        'order_id' => null,
        'gateway_payload' => ['payment_type' => 'advance'],
    ]);

    $paymentFinalizer = app(PaymentFinalizer::class);
    $paymentFinalizer->handleAdminApproval($advanceTransaction, $admin, 'Approved');
    
    $productRequest->refresh();
    $order = Order::find($productRequest->order_id);
    
    // Get orders list data
    $response = $this->actingAs($user)
        ->get(route('user.orders'));
    
    $response->assertInertia(fn ($page) => 
        $page->component('user/orders')
            ->has('orders', 1)
            ->where('orders.0.first_item_image', function ($image) {
                // BREAKAGE: Image should be present and not null
                expect($image)->not->toBeNull()
                    ->and($image)->toBeString()
                    ->and($image)->not->toBeEmpty();
                return true;
            })
            ->where('orders.0.items.0.primary_image', function ($image) {
                // BREAKAGE: Item image should be present
                expect($image)->not->toBeNull()
                    ->and($image)->toBeString();
                return true;
            })
    );
});

test('order details page shows zero items for product request order', function () {
    $user = User::factory()->create();
    $admin = User::factory()->create();
    
    // Assign admin role
    if (class_exists(\Spatie\Permission\Models\Role::class)) {
        $adminRole = \Spatie\Permission\Models\Role::where('name', 'admin')->first();
        if (!$adminRole) {
            $adminRole = \Spatie\Permission\Models\Role::where('name', 'super_admin')->first();
        }
        if ($adminRole) {
            $admin->assignRole($adminRole);
        }
    }
    
    $productRequest = ProductRequest::factory()->create([
        'user_id' => $user->id,
        'status' => 'approved',
        'advance_amount' => 1000,
        'final_amount' => 2000,
        'amount' => 3000,
        'product_name' => 'Detailed Product',
        'image' => 'products/detailed-image.jpg',
        'description' => 'This is a detailed product description',
        'advance_payment_status' => 'processing',
        'customer_willing_to_buy' => true,
        'currency' => 'ETB',
        'order_id' => null,
    ]);

    // Create order and approve payment
    $advanceTransaction = PaymentTransaction::factory()->create([
        'product_request_id' => $productRequest->id,
        'tx_ref' => 'ADV-' . $productRequest->id . '-123456',
        'gateway_status' => 'paid',
        'admin_status' => 'unseen',
        'payment_method' => 'chapa',
        'amount' => 1150,
        'currency' => 'ETB',
        'customer_email' => $user->email,
        'customer_name' => $user->name,
        'order_id' => null,
        'gateway_payload' => ['payment_type' => 'advance'],
    ]);

    $paymentFinalizer = app(PaymentFinalizer::class);
    $paymentFinalizer->handleAdminApproval($advanceTransaction, $admin, 'Approved');
    
    $productRequest->refresh();
    $order = Order::find($productRequest->order_id);
    
    // Get order details
    $response = $this->actingAs($user)
        ->get(route('user.orders.show', $order->id));
    
    $response->assertInertia(fn ($page) => 
        $page->component('user/order-details')
            ->has('order')
            ->where('order.items', function ($items) {
                // BREAKAGE: Items should not be empty
                // Items might be array or collection
                $itemCount = is_countable($items) ? count($items) : iterator_count($items);
                expect($itemCount)->toBeGreaterThan(0);
                
                // Get first item (handle both array and collection)
                $firstItem = is_array($items) ? $items[0] : $items->first();
                expect($firstItem)->toHaveKey('product_name')
                    ->and($firstItem)->toHaveKey('primary_image');
                return true;
            })
    );
});

test('order details page does not show product request image', function () {
    $user = User::factory()->create();
    $admin = User::factory()->create();
    
    // Assign admin role
    if (class_exists(\Spatie\Permission\Models\Role::class)) {
        $adminRole = \Spatie\Permission\Models\Role::where('name', 'admin')->first();
        if (!$adminRole) {
            $adminRole = \Spatie\Permission\Models\Role::where('name', 'super_admin')->first();
        }
        if ($adminRole) {
            $admin->assignRole($adminRole);
        }
    }
    
    $productRequest = ProductRequest::factory()->create([
        'user_id' => $user->id,
        'status' => 'approved',
        'advance_amount' => 1000,
        'final_amount' => 2000,
        'amount' => 3000,
        'product_name' => 'Image Product',
        'image' => 'products/showcase-image.jpg',
        'advance_payment_status' => 'processing',
        'customer_willing_to_buy' => true,
        'currency' => 'ETB',
        'order_id' => null,
    ]);

    // Create order and approve payment
    $advanceTransaction = PaymentTransaction::factory()->create([
        'product_request_id' => $productRequest->id,
        'tx_ref' => 'ADV-' . $productRequest->id . '-123456',
        'gateway_status' => 'paid',
        'admin_status' => 'unseen',
        'payment_method' => 'chapa',
        'amount' => 1150,
        'currency' => 'ETB',
        'customer_email' => $user->email,
        'customer_name' => $user->name,
        'order_id' => null,
        'gateway_payload' => ['payment_type' => 'advance'],
    ]);

    $paymentFinalizer = app(PaymentFinalizer::class);
    $paymentFinalizer->handleAdminApproval($advanceTransaction, $admin, 'Approved');
    
    $productRequest->refresh();
    $order = Order::find($productRequest->order_id);
    
    // Get order details
    $response = $this->actingAs($user)
        ->get(route('user.orders.show', $order->id));
    
    $response->assertInertia(fn ($page) => 
        $page->component('user/order-details')
            ->has('order')
            ->where('order.items.0.primary_image', function ($image) {
                // BREAKAGE: Image should be present and formatted
                expect($image)->not->toBeNull()
                    ->and($image)->toBeString()
                    ->and($image)->toContain('products/showcase-image.jpg');
                return true;
            })
    );
});

test('order item has null product_id for product requests', function () {
    $user = User::factory()->create();
    
    $productRequest = ProductRequest::factory()->create([
        'user_id' => $user->id,
        'status' => 'approved',
        'advance_amount' => 1000,
        'final_amount' => 2000,
        'amount' => 3000,
        'product_name' => 'Null Product ID Test',
        'advance_payment_status' => 'processing',
        'customer_willing_to_buy' => true,
        'currency' => 'ETB',
        'order_id' => null,
    ]);

    // Create order from product request
    $order = $productRequest->createOrder(markPaid: false);
    
    // Get the order item
    $orderItem = $order->items()->first();
    
    // BREAKAGE: product_id should be null for product requests
    expect($orderItem->product_id)->toBeNull();
    
    // Verify snapshot has the product request data
    $snapshot = $orderItem->product_snapshot;
    expect($snapshot)->toHaveKey('product_request_id')
        ->and($snapshot['product_request_id'])->toBe($productRequest->id);
});

test('order item snapshot image is properly formatted', function () {
    $user = User::factory()->create();
    
    $productRequest = ProductRequest::factory()->create([
        'user_id' => $user->id,
        'status' => 'approved',
        'advance_amount' => 1000,
        'final_amount' => 2000,
        'amount' => 3000,
        'product_name' => 'Formatted Image Test',
        'image' => 'products/raw-image.jpg', // Raw storage path
        'advance_payment_status' => 'processing',
        'customer_willing_to_buy' => true,
        'currency' => 'ETB',
        'order_id' => null,
    ]);

    // Create order from product request
    $order = $productRequest->createOrder(markPaid: false);
    
    // Get the order item
    $orderItem = $order->items()->first();
    $snapshot = $orderItem->product_snapshot;
    
    // BREAKAGE: Image should be formatted using ImageUrlService
    expect($snapshot)->toHaveKey('image')
        ->and($snapshot['image'])->not->toBeNull()
        ->and($snapshot['image'])->toContain('products/raw-image.jpg');
    
    // Image should be formatted (should have /storage/ prefix if needed)
    // The exact format depends on ImageUrlService implementation
    expect($snapshot['image'])->toBeString();
});

test('order created from advance payment has order items', function () {
    $user = User::factory()->create();
    $admin = User::factory()->create();
    
    // Assign admin role
    if (class_exists(\Spatie\Permission\Models\Role::class)) {
        $adminRole = \Spatie\Permission\Models\Role::where('name', 'admin')->first();
        if (!$adminRole) {
            $adminRole = \Spatie\Permission\Models\Role::where('name', 'super_admin')->first();
        }
        if ($adminRole) {
            $admin->assignRole($adminRole);
        }
    }
    
    $productRequest = ProductRequest::factory()->create([
        'user_id' => $user->id,
        'status' => 'approved',
        'advance_amount' => 1000,
        'final_amount' => 2000,
        'amount' => 3000,
        'product_name' => 'Advance Payment Product',
        'image' => 'products/advance-image.jpg',
        'advance_payment_status' => 'processing',
        'customer_willing_to_buy' => true,
        'currency' => 'ETB',
        'order_id' => null,
    ]);

    $advanceTransaction = PaymentTransaction::factory()->create([
        'product_request_id' => $productRequest->id,
        'tx_ref' => 'ADV-' . $productRequest->id . '-123456',
        'gateway_status' => 'paid',
        'admin_status' => 'unseen',
        'payment_method' => 'chapa',
        'amount' => 1150,
        'currency' => 'ETB',
        'customer_email' => $user->email,
        'customer_name' => $user->name,
        'order_id' => null,
        'gateway_payload' => ['payment_type' => 'advance'],
    ]);

    $paymentFinalizer = app(PaymentFinalizer::class);
    $paymentFinalizer->handleAdminApproval($advanceTransaction, $admin, 'Approved');
    
    $productRequest->refresh();
    $order = Order::find($productRequest->order_id);
    
    // BREAKAGE: Order should have items after advance payment approval
    expect($order)->not->toBeNull()
        ->and($order->items()->count())->toBeGreaterThan(0)
        ->and($order->items()->count())->toBe(1);
    
    $orderItem = $order->items()->first();
    expect($orderItem->product_id)->toBeNull()
        ->and($orderItem->product_snapshot)->toHaveKey('product_request_id');
});

test('order items query handles null product_id correctly', function () {
    $user = User::factory()->create();
    
    // Create a product request order with order item
    $productRequest = ProductRequest::factory()->create([
        'user_id' => $user->id,
        'status' => 'approved',
        'advance_amount' => 1000,
        'final_amount' => 2000,
        'amount' => 3000,
        'product_name' => 'Query Test Product',
        'image' => 'products/query-test.jpg',
        'advance_payment_status' => 'processing',
        'customer_willing_to_buy' => true,
        'currency' => 'ETB',
        'order_id' => null,
    ]);

    $order = $productRequest->createOrder(markPaid: false);
    
    // Simulate the query from UserDashboardController
    $orderItems = \Illuminate\Support\Facades\DB::table('order_items as oi')
        ->leftJoin('products as p', 'oi.product_id', '=', 'p.id')
        ->leftJoin('product_images as pi', function($join) {
            $join->on('p.id', '=', 'pi.product_id')
                ->where('pi.is_primary', true);
        })
        ->select([
            'oi.order_id',
            'oi.id as item_id',
            'oi.quantity',
            'oi.price as item_price',
            'oi.product_snapshot',
            'p.name as product_name',
            'p.slug as product_slug',
            'pi.image_path as primary_image',
        ])
        ->whereIn('oi.order_id', [$order->id])
        ->get();
    
    // BREAKAGE: Query should return items even with null product_id
    expect($orderItems)->not->toBeEmpty()
        ->and($orderItems->count())->toBe(1);
    
    $item = $orderItems->first();
    expect($item->product_name)->toBeNull() // Product name from join will be null
        ->and($item->product_snapshot)->not->toBeNull(); // But snapshot should have data
    
    // Verify snapshot extraction works
    $snapshot = is_string($item->product_snapshot) 
        ? json_decode($item->product_snapshot, true) 
        : $item->product_snapshot;
    
    expect($snapshot)->toBeArray()
        ->and($snapshot['name'])->toBe('Query Test Product')
        ->and($snapshot)->toHaveKey('image');
});

