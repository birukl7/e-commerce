import { useForm } from '@inertiajs/react';

export default function TaxSettingsTab({ settings, taxClasses }) {
    const form = useForm({
        pricesIncludeTax: settings.pricesIncludeTax || false,
        shippingTaxClass: settings.shippingTaxClass || '',
        displayPricesInShop: settings.displayPricesInShop || 'incl',
        displayPricesInCart: settings.displayPricesInCart || 'incl',
    });
    
    const handleSubmit = (e) => {
        e.preventDefault();
        form.put(route('admin.tax.settings.update'));
    };
    
    return (
        <div>
            <div className="mb-6">
                <h3 className="text-lg font-medium">Tax Settings</h3>
                <p className="mt-1 text-sm text-gray-500">
                    Configure how taxes are calculated and displayed on your store.
                </p>
            </div>
            
            <form onSubmit={handleSubmit}>
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <div className="px-4 py-5 sm:p-6">
                        <div className="space-y-6">
                            <div className="flex items-start">
                                <div className="flex items-center h-5">
                                    <input
                                        id="pricesIncludeTax"
                                        name="pricesIncludeTax"
                                        type="checkbox"
                                        className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                                        checked={form.data.pricesIncludeTax}
                                        onChange={(e) => form.setData('pricesIncludeTax', e.target.checked)}
                                    />
                                </div>
                                <div className="ml-3 text-sm">
                                    <label htmlFor="pricesIncludeTax" className="font-medium text-gray-700">
                                        Prices entered with tax
                                    </label>
                                    <p className="text-gray-500">
                                        This option affects how you enter prices. When enabled, the price you enter will include tax.
                                    </p>
                                </div>
                            </div>
                            
                            <div className="border-t border-gray-200 pt-4">
                                <label htmlFor="shippingTaxClass" className="block text-sm font-medium text-gray-700">
                                    Shipping tax class
                                </label>
                                <p className="text-xs text-gray-500 mb-2">
                                    Optionally control which tax class shipping gets, or leave it so shipping tax is based on the cart items themselves.
                                </p>
                                <select
                                    id="shippingTaxClass"
                                    name="shippingTaxClass"
                                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                                    value={form.data.shippingTaxClass}
                                    onChange={(e) => form.setData('shippingTaxClass', e.target.value)}
                                >
                                    <option value="">Shipping tax class based on cart items</option>
                                    {taxClasses.map((taxClass) => (
                                        <option key={taxClass.id} value={taxClass.id}>
                                            {taxClass.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            <div className="border-t border-gray-200 pt-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Display prices in the shop
                                </label>
                                <div className="space-y-2">
                                    <div className="flex items-center">
                                        <input
                                            id="displayPricesInShopIncl"
                                            name="displayPricesInShop"
                                            type="radio"
                                            className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                                            value="incl"
                                            checked={form.data.displayPricesInShop === 'incl'}
                                            onChange={(e) => form.setData('displayPricesInShop', e.target.value)}
                                        />
                                        <label htmlFor="displayPricesInShopIncl" className="ml-2 block text-sm text-gray-700">
                                            Including tax
                                        </label>
                                    </div>
                                    <div className="flex items-center">
                                        <input
                                            id="displayPricesInShopExcl"
                                            name="displayPricesInShop"
                                            type="radio"
                                            className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                                            value="excl"
                                            checked={form.data.displayPricesInShop === 'excl'}
                                            onChange={(e) => form.setData('displayPricesInShop', e.target.value)}
                                        />
                                        <label htmlFor="displayPricesInShopExcl" className="ml-2 block text-sm text-gray-700">
                                            Excluding tax
                                        </label>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="border-t border-gray-200 pt-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Display prices during cart and checkout
                                </label>
                                <div className="space-y-2">
                                    <div className="flex items-center">
                                        <input
                                            id="displayPricesInCartIncl"
                                            name="displayPricesInCart"
                                            type="radio"
                                            className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                                            value="incl"
                                            checked={form.data.displayPricesInCart === 'incl'}
                                            onChange={(e) => form.setData('displayPricesInCart', e.target.value)}
                                        />
                                        <label htmlFor="displayPricesInCartIncl" className="ml-2 block text-sm text-gray-700">
                                            Including tax
                                        </label>
                                    </div>
                                    <div className="flex items-center">
                                        <input
                                            id="displayPricesInCartExcl"
                                            name="displayPricesInCart"
                                            type="radio"
                                            className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                                            value="excl"
                                            checked={form.data.displayPricesInCart === 'excl'}
                                            onChange={(e) => form.setData('displayPricesInCart', e.target.value)}
                                        />
                                        <label htmlFor="displayPricesInCartExcl" className="ml-2 block text-sm text-gray-700">
                                            Excluding tax
                                        </label>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="border-t border-gray-200 pt-4 flex justify-end">
                                <button
                                    type="submit"
                                    className="inline-flex items-center px-4 py-2 bg-indigo-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-indigo-700 active:bg-indigo-900 focus:outline-none focus:border-indigo-900 focus:ring focus:ring-indigo-300 disabled:opacity-25 transition"
                                    disabled={form.processing}
                                >
                                    {form.processing ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </form>
            
            <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Tax Calculation
                    </h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">
                        How tax is calculated and applied to your products.
                    </p>
                </div>
                <div className="px-4 py-5 sm:p-6">
                    <div className="space-y-4">
                        <div>
                            <h4 className="text-sm font-medium text-gray-700">Tax Classes</h4>
                            <p className="mt-1 text-sm text-gray-500">
                                Products are grouped into tax classes. Each tax class can have multiple tax rates.
                            </p>
                        </div>
                        
                        <div>
                            <h4 className="text-sm font-medium text-gray-700">Tax Rates</h4>
                            <p className="mt-1 text-sm text-gray-500">
                                Tax rates are the actual percentage or fixed amount of tax applied to products in a tax class.
                            </p>
                        </div>
                        
                        <div>
                            <h4 className="text-sm font-medium text-gray-700">Compound Tax</h4>
                            <p className="mt-1 text-sm text-gray-500">
                                When multiple tax rates apply to the same product, compound tax means each tax is calculated on the price including previous taxes.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
