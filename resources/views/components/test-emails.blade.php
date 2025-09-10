<div class="test-emails bg-white p-6 rounded-lg shadow-md">
    <h2 class="text-xl font-semibold mb-4">Test Email Notifications</h2>
    
    <div class="space-y-4">
        <div class="test-buttons flex flex-wrap gap-4">
            <button 
                @click="testEmail('order')"
                class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
                Test Order Confirmation
            </button>
            
            <button 
                @click="testEmail('status')"
                class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
            >
                Test Status Update
            </button>
            
            <button 
                @click="testEmail('payment')"
                class="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition"
            >
                Test Payment Confirmation
            </button>
            
            <button 
                @click="testEmail('account')"
                class="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition"
            >
                Test Account Activity
            </button>
        </div>
        
        <div x-data="{ showMessage: false, message: '', isError: false }">
            <div 
                x-show="showMessage" 
                x-text="message"
                :class="{
                    'text-green-600': !isError,
                    'text-red-600': isError
                }"
                class="mt-4 p-3 rounded"
                x-init="
                    $watch('showMessage', value => {
                        if (value) {
                            setTimeout(() => showMessage = false, 5000);
                        }
                    })"
            ></div>
        </div>
    </div>
</div>

@once
@push('scripts')
<script>
    function testEmail(type) {
        axios.post('/test-email', { type })
            .then(response => {
                const el = document.querySelector('[x-data]').__x.$data;
                el.message = response.data.message;
                el.isError = !response.data.success;
                el.showMessage = true;
            })
            .catch(error => {
                const el = document.querySelector('[x-data]').__x.$data;
                el.message = error.response?.data?.message || 'An error occurred';
                el.isError = true;
                el.showMessage = true;
            });
    }
</script>
@endpush
@endonce
