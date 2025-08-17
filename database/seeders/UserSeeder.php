<?php

namespace Database\Seeders;

use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Ethiopian names data
        $ethiopianNames = [
            ['first' => 'Abebe', 'last' => 'Tadesse'],
            ['first' => 'Almaz', 'last' => 'Kebede'],
            ['first' => 'Dawit', 'last' => 'Mengistu'],
            ['first' => 'Hanna', 'last' => 'Wolde'],
            ['first' => 'Tekle', 'last' => 'Haile'],
            ['first' => 'Meron', 'last' => 'Girma'],
            ['first' => 'Yohannes', 'last' => 'Desta'],
            ['first' => 'Selamawit', 'last' => 'Negash'],
            ['first' => 'Getachew', 'last' => 'Bekele'],
            ['first' => 'Tigist', 'last' => 'Tesfaye'],
            ['first' => 'Solomon', 'last' => 'Alemayehu'],
            ['first' => 'Bethlehem', 'last' => 'Mekonnen'],
            ['first' => 'Mulugeta', 'last' => 'Worku'],
            ['first' => 'Rahel', 'last' => 'Assefa'],
            ['first' => 'Berhanu', 'last' => 'Teshome'],
            ['first' => 'Hiwot', 'last' => 'Addisu'],
            ['first' => 'Tadesse', 'last' => 'Demeke'],
            ['first' => 'Mahlet', 'last' => 'Gebre'],
            ['first' => 'Henok', 'last' => 'Yilma'],
            ['first' => 'Kidist', 'last' => 'Fekadu'],
        ];

        // Ethiopian cities and addresses
        $ethiopianAddresses = [
            ['city' => 'Addis Ababa', 'state' => 'Addis Ababa', 'area' => 'Bole', 'street' => 'Bole Road'],
            ['city' => 'Addis Ababa', 'state' => 'Addis Ababa', 'area' => 'Piazza', 'street' => 'Churchill Avenue'],
            ['city' => 'Addis Ababa', 'state' => 'Addis Ababa', 'area' => 'Merkato', 'street' => 'Merkato Square'],
            ['city' => 'Addis Ababa', 'state' => 'Addis Ababa', 'area' => 'Kazanchis', 'street' => 'Kazanchis Street'],
            ['city' => 'Addis Ababa', 'state' => 'Addis Ababa', 'area' => 'CMC', 'street' => 'CMC Road'],
            ['city' => 'Bahir Dar', 'state' => 'Amhara', 'area' => 'Kebele 01', 'street' => 'Lake Tana Road'],
            ['city' => 'Bahir Dar', 'state' => 'Amhara', 'area' => 'Kebele 02', 'street' => 'Blue Nile Street'],
            ['city' => 'Gondar', 'state' => 'Amhara', 'area' => 'Azezo', 'street' => 'Castle Road'],
            ['city' => 'Gondar', 'state' => 'Amhara', 'area' => 'Maraki', 'street' => 'University Road'],
            ['city' => 'Hawassa', 'state' => 'SNNPR', 'area' => 'Tabor', 'street' => 'Lake Shore Drive'],
            ['city' => 'Hawassa', 'state' => 'SNNPR', 'area' => 'Hayek Dar', 'street' => 'Industrial Road'],
            ['city' => 'Mekelle', 'state' => 'Tigray', 'area' => 'Adi Haki', 'street' => 'Emperor Yohannes Street'],
            ['city' => 'Mekelle', 'state' => 'Tigray', 'area' => 'Quiha', 'street' => 'Airport Road'],
            ['city' => 'Dire Dawa', 'state' => 'Dire Dawa', 'area' => 'Kezira', 'street' => 'Railway Street'],
            ['city' => 'Dire Dawa', 'state' => 'Dire Dawa', 'area' => 'Sabian', 'street' => 'Market Street'],
            ['city' => 'Jimma', 'state' => 'Oromia', 'area' => 'Kito', 'street' => 'Coffee Road'],
            ['city' => 'Jimma', 'state' => 'Oromia', 'area' => 'Mentina', 'street' => 'University Street'],
            ['city' => 'Dessie', 'state' => 'Amhara', 'area' => 'Kebele 10', 'street' => 'Hospital Road'],
            ['city' => 'Adama', 'state' => 'Oromia', 'area' => 'Kebele 03', 'street' => 'Adama-Addis Road'],
            ['city' => 'Jigjiga', 'state' => 'Somali', 'area' => 'Kebele 01', 'street' => 'Central Street'],
        ];

        // Ethiopian phone number prefixes
        $phonePrefix = ['0911', '0912', '0913', '0914', '0921', '0922', '0923', '0924', '0931', '0932', '0933', '0934'];

        // Get roles
        $userRole = Role::where('name', 'user')->first();
        $customerRole = Role::where('name', 'customer')->first();
        $supplierRole = Role::where('name', 'supplier')->first();

        for ($i = 0; $i < 20; $i++) {
            $name = $ethiopianNames[$i];
            $address = $ethiopianAddresses[$i];
            $fullName = $name['first'] . ' ' . $name['last'];
            $email = strtolower($name['first'] . '.' . $name['last']) . '@email.com';
            
            // Generate Ethiopian phone number
            $phoneNumber = $phonePrefix[array_rand($phonePrefix)] . rand(100000, 999999);
            
            // Create user
            $user = User::create([
                'name' => $fullName,
                'email' => $email,
                'password' => Hash::make('12345678'),
                'phone' => $phoneNumber,
                'status' => 'active',
                'email_verified_at' => Carbon::now()->subDays(rand(1, 30)),
                'created_at' => Carbon::now()->subDays(rand(1, 90)),
                'updated_at' => Carbon::now()->subDays(rand(1, 30)),
            ]);

            // Assign roles
            // All users get 'user' role
            if ($userRole) {
                $user->assignRole($userRole);
            }

            // First 10 users get 'customer' role
            if ($i < 10 && $customerRole) {
                $user->assignRole($customerRole);
            }
            
            // Last 10 users get 'supplier' role  
            if ($i >= 10 && $supplierRole) {
                $user->assignRole($supplierRole);
            }

            // Create address for user
            $user->addresses()->create([
                'type' => 'home',
                'address_line_1' => $address['street'] . ', ' . $address['area'],
                'address_line_2' => 'House No. ' . rand(100, 999),
                'city' => $address['city'],
                'state' => $address['state'],
                'postal_code' => sprintf('%04d', rand(1000, 9999)),
                'country' => 'Ethiopia',
                'phone' => $phoneNumber,
                'is_default' => true,
            ]);
        }

        $this->command->info('Successfully created 20 Ethiopian users with addresses!');
        $this->command->info('- 10 users with customer role');
        $this->command->info('- 10 users with supplier role');
        $this->command->info('- All users have "user" role as base');
        $this->command->info('- All passwords are: 12345678');
    }
}
