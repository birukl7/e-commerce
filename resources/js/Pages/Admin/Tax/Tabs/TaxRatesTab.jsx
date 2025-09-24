import { useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import { Pencil, Trash, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function TaxRatesTab({ taxRates, taxClasses }) {
    const [showForm, setShowForm] = useState(false);
    const [editingRate, setEditingRate] = useState(null);
    
    const form = useForm({
        name: '',
        tax_class_id: '',
        rate: '',
        type: 'percentage',
        country: 'ET',
        state: '',
        city: '',
        postal_code: '',
        priority: 1,
        compound: false,
        shipping_taxable: true,
        is_active: true,
    });
    
    const handleSubmit = (e) => {
        e.preventDefault();
        const data = form.data();
        
        if (editingRate) {
            router.put(route('admin.tax.rates.update', editingRate.id), data, {
                onSuccess: () => {
                    setShowForm(false);
                    setEditingRate(null);
                    form.reset();
                },
            });
        } else {
            router.post(route('admin.tax.rates.store'), data, {
                onSuccess: () => {
                    setShowForm(false);
                    form.reset();
                },
            });
        }
    };
    
    const editRate = (rate) => {
        setEditingRate(rate);
        form.setData({
            name: rate.name,
            tax_class_id: rate.tax_class_id,
            rate: rate.rate,
            type: rate.type,
            country: rate.country,
            state: rate.state || '',
            city: rate.city || '',
            postal_code: rate.postal_code || '',
            priority: rate.priority,
            compound: rate.compound,
            shipping_taxable: rate.shipping_taxable,
            is_active: rate.is_active,
        });
        setShowForm(true);
    };
    
    const deleteRate = (id) => {
        if (confirm('Are you sure you want to delete this tax rate?')) {
            router.delete(route('admin.tax.rates.destroy', id));
        }
    };
    
    const toggleStatus = (rate) => {
        router.put(route('admin.tax.rates.toggle-status', rate.id), {
            is_active: !rate.is_active,
        });
    };
    
    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Tax Rates</h3>
                <Button
                    type="button"
                    onClick={() => {
                        setEditingRate(null);
                        form.reset();
                        setShowForm(!showForm);
                    }}
                >
                    Add Rate
                </Button>
            </div>
            
            {showForm && (
                <div className="rounded-lg border bg-gray-50 p-4 mb-6">
                    <h4 className="text-md font-medium mb-4">
                        {editingRate ? 'Edit Tax Rate' : 'Add New Tax Rate'}
                    </h4>
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                    Rate Name *
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                    value={form.data.name}
                                    onChange={(e) => form.setData('name', e.target.value)}
                                    required
                                />
                            </div>
                            
                            <div>
                                <label htmlFor="tax_class_id" className="block text-sm font-medium text-gray-700">
                                    Tax Class *
                                </label>
                                <select
                                    id="tax_class_id"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                    value={form.data.tax_class_id}
                                    onChange={(e) => form.setData('tax_class_id', e.target.value)}
                                    required
                                >
                                    <option value="">Select a tax class</option>
                                    {taxClasses.map((taxClass) => (
                                        <option key={taxClass.id} value={taxClass.id}>
                                            {taxClass.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            <div>
                                <label htmlFor="rate" className="block text-sm font-medium text-gray-700">
                                    Rate *
                                </label>
                                <div className="mt-1 relative rounded-md shadow-sm">
                                    <input
                                        type="number"
                                        id="rate"
                                        min="0"
                                        step="0.01"
                                        className="block w-full pr-12 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                        value={form.data.rate}
                                        onChange={(e) => form.setData('rate', e.target.value)}
                                        required
                                    />
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                        <span className="text-gray-500 sm:text-sm">
                                            {form.data.type === 'percentage' ? '%' : 'ETB'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            
                            <div>
                                <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                                    Type *
                                </label>
                                <select
                                    id="type"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                    value={form.data.type}
                                    onChange={(e) => form.setData('type', e.target.value)}
                                >
                                    <option value="percentage">Percentage</option>
                                    <option value="fixed">Fixed Amount</option>
                                </select>
                            </div>
                            
                            <div>
                                <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                                    Country *
                                </label>
                                <select
                                    id="country"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                    value={form.data.country}
                                    onChange={(e) => form.setData('country', e.target.value)}
                                    required
                                >
                                    <option value="ET">Ethiopia</option>
                                    <option value="US">United States</option>
                                    <option value="GB">United Kingdom</option>
                                    <option value="CA">Canada</option>
                                    <option value="">All Countries</option>
                                </select>
                            </div>
                            
                            <div>
                                <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                                    State/Region
                                </label>
                                <input
                                    type="text"
                                    id="state"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                    value={form.data.state}
                                    onChange={(e) => form.setData('state', e.target.value)}
                                />
                                <p className="mt-1 text-xs text-gray-500">Leave blank to apply to all states</p>
                            </div>
                            
                            <div>
                                <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                                    City
                                </label>
                                <input
                                    type="text"
                                    id="city"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                    value={form.data.city}
                                    onChange={(e) => form.setData('city', e.target.value)}
                                />
                                <p className="mt-1 text-xs text-gray-500">Leave blank to apply to all cities</p>
                            </div>
                            
                            <div>
                                <label htmlFor="postal_code" className="block text-sm font-medium text-gray-700">
                                    Postcode/ZIP
                                </label>
                                <input
                                    type="text"
                                    id="postal_code"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                    value={form.data.postal_code}
                                    onChange={(e) => form.setData('postal_code', e.target.value)}
                                />
                                <p className="mt-1 text-xs text-gray-500">Leave blank to apply to all postcodes</p>
                            </div>
                            
                            <div>
                                <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
                                    Priority
                                </label>
                                <input
                                    type="number"
                                    id="priority"
                                    min="0"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                    value={form.data.priority}
                                    onChange={(e) => form.setData('priority', parseInt(e.target.value) || 0)}
                                />
                                <p className="mt-1 text-xs text-gray-500">Enter a priority (1 is highest)</p>
                            </div>
                            
                            <div className="flex items-center space-x-4">
                                <div className="flex items-center">
                                    <input
                                        id="compound"
                                        type="checkbox"
                                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                        checked={form.data.compound}
                                        onChange={(e) => form.setData('compound', e.target.checked)}
                                    />
                                    <label htmlFor="compound" className="ml-2 block text-sm text-gray-700">
                                        Compound Tax
                                    </label>
                                </div>
                                
                                <div className="flex items-center">
                                    <input
                                        id="shipping_taxable"
                                        type="checkbox"
                                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                        checked={form.data.shipping_taxable}
                                        onChange={(e) => form.setData('shipping_taxable', e.target.checked)}
                                    />
                                    <label htmlFor="shipping_taxable" className="ml-2 block text-sm text-gray-700">
                                        Apply to Shipping
                                    </label>
                                </div>
                                
                                <div className="flex items-center">
                                    <input
                                        id="is_active"
                                        type="checkbox"
                                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                        checked={form.data.is_active}
                                        onChange={(e) => form.setData('is_active', e.target.checked)}
                                    />
                                    <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
                                        Enabled
                                    </label>
                                </div>
                            </div>
                        </div>
                        
                        <div className="mt-6 flex justify-end space-x-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setShowForm(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={form.processing}>
                                {form.processing ? 'Saving...' : 'Save Rate'}
                            </Button>
                        </div>
                    </form>
                </div>
            )}
            
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Name
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Tax Class
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Rate
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Location
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Priority
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th scope="col" className="relative px-6 py-3">
                                <span className="sr-only">Actions</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {taxRates.length > 0 ? (
                            taxRates.map((rate) => (
                                <tr key={rate.id}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{rate.name}</div>
                                        <div className="text-sm text-gray-500">
                                            {rate.compound && (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 mr-1">
                                                    Compound
                                                </span>
                                            )}
                                            {rate.shipping_taxable && (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                                    Shipping
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {rate.tax_class?.name || 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {rate.type === 'percentage' ? `${rate.rate}%` : `ETB ${parseFloat(rate.rate).toFixed(2)}`}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <div>
                                            {rate.country}
                                            {rate.state && `, ${rate.state}`}
                                            {rate.city && `, ${rate.city}`}
                                            {rate.postal_code && ` (${rate.postal_code})`}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {rate.priority}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <span
                                            onClick={() => toggleStatus(rate)}
                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer ${
                                                rate.is_active
                                                    ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                                    : 'bg-red-100 text-red-800 hover:bg-red-200'
                                            }`}
                                        >
                                            {rate.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex justify-end space-x-2">
                                            <button
                                                type="button"
                                                onClick={() => editRate(rate)}
                                                className="text-indigo-600 hover:text-indigo-900"
                                                title="Edit"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => deleteRate(rate.id)}
                                                className="text-red-600 hover:text-red-900"
                                                title="Delete"
                                            >
                                                <Trash className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                                    No tax rates found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
