import { useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import { Pencil, Trash } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function TaxClassesTab({ classes, taxClasses }) {
    const [showForm, setShowForm] = useState(false);
    const [editingClass, setEditingClass] = useState(null);
    
    const form = useForm({
        name: '',
        description: '',
    });
    
    const handleSubmit = (e) => {
        e.preventDefault();
        const data = form.data();
        
        if (editingClass) {
            router.put(route('admin.tax.classes.update', editingClass.id), data, {
                onSuccess: () => {
                    setShowForm(false);
                    setEditingClass(null);
                    form.reset();
                },
            });
        } else {
            router.post(route('admin.tax.classes.store'), data, {
                onSuccess: () => {
                    setShowForm(false);
                    form.reset();
                },
            });
        }
    };
    
    const editClass = (taxClass) => {
        setEditingClass(taxClass);
        form.setData({
            name: taxClass.name,
            description: taxClass.description || '',
        });
        setShowForm(true);
    };
    
    const deleteClass = (id) => {
        if (confirm('Are you sure you want to delete this tax class?')) {
            router.delete(route('admin.tax.classes.destroy', id));
        }
    };
    
    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Tax Classes</h3>
                <Button
                    type="button"
                    onClick={() => {
                        setEditingClass(null);
                        form.reset();
                        setShowForm(!showForm);
                    }}
                >
                    Add Class
                </Button>
            </div>
            
            {showForm && (
                <div className="rounded-lg border bg-gray-50 p-4 mb-6">
                    <h4 className="text-md font-medium mb-4">
                        {editingClass ? 'Edit Tax Class' : 'Add New Tax Class'}
                    </h4>
                    <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                    Name *
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                    value={form.data.name}
                                    onChange={(e) => form.setData('name', e.target.value)}
                                    required
                                />
                                {form.errors.name && (
                                    <p className="mt-1 text-sm text-red-600">{form.errors.name}</p>
                                )}
                            </div>
                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                                    Description
                                </label>
                                <input
                                    type="text"
                                    id="description"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                    value={form.data.description}
                                    onChange={(e) => form.setData('description', e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="mt-4 flex justify-end space-x-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setShowForm(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={form.processing}>
                                {form.processing ? (
                                    'Saving...'
                                ) : (
                                    <>{editingClass ? 'Update' : 'Create'} Class</>
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            )}
            
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                    {classes.length > 0 ? (
                        classes.map((taxClass) => (
                            <li key={taxClass.id}>
                                <div className="px-4 py-4 sm:px-6 flex items-center justify-between">
                                    <div>
                                        <div className="flex items-center">
                                            <p className="text-sm font-medium text-indigo-600 truncate">
                                                {taxClass.name}
                                            </p>
                                            {taxClass.is_default && (
                                                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    Default
                                                </span>
                                            )}
                                        </div>
                                        {taxClass.description && (
                                            <p className="mt-1 text-sm text-gray-500">
                                                {taxClass.description}
                                            </p>
                                        )}
                                        <div className="mt-1 text-sm text-gray-500">
                                            {taxClass.tax_settings_count} {taxClass.tax_settings_count === 1 ? 'rate' : 'rates'}
                                        </div>
                                    </div>
                                    <div className="ml-4 flex-shrink-0 flex space-x-2">
                                        {!taxClass.is_default && (
                                            <>
                                                <button
                                                    type="button"
                                                    onClick={() => editClass(taxClass)}
                                                    className="text-indigo-600 hover:text-indigo-900"
                                                    title="Edit"
                                                >
                                                    <Pencil className="h-5 w-5" />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => deleteClass(taxClass.id)}
                                                    className="text-red-600 hover:text-red-900"
                                                    title="Delete"
                                                >
                                                    <Trash className="h-5 w-5" />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </li>
                        ))
                    ) : (
                        <li className="px-4 py-4 sm:px-6 text-center text-gray-500">
                            No tax classes found.
                        </li>
                    )}
                </ul>
            </div>
        </div>
    );
}
