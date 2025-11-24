<?php

namespace Database\Seeders;

use App\Models\User;
use Carbon\Carbon;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class DatabaseSeeder extends Seeder
{
    /**

     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();
        $this->call([
            RoleAndPermissionSeeder::class,
            CategorySeeder::class,
            BrandSeeder::class,
            TagSeeder::class,
            ProductSeeder::class,
            ProductImageSeeder::class,
            UserSeeder::class,
            OfflinePaymentMethodSeeder::class,
            ChapaPaymentMethodSeeder::class,
            TaxClassSeeder::class,
            TaxSettingSeeder::class,
        ]);

        $user = User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => Hash::make('test1234'),
            'email_verified_at' => Carbon::now()
        ]);
        
        $user->addresses()->create([
            'address_line_1' => '123 Main St',
            'city' => 'Anytown',
            'state' => 'CA',
            'postal_code' => '12345',
            'phone' => '0944055361',
            'country' => 'USA',
        ]);

        // Admin user is now created in UserSeeder with admin1@email.com
    }
}
