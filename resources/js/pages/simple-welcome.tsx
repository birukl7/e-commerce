import React from 'react';
import { Head } from '@inertiajs/react';

export default function SimpleWelcome() {
  return (
    <div className="min-h-screen bg-white">
      <Head title="Welcome" />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center">Welcome to Our Store</h1>
        <p className="text-center mt-4">This is a simple welcome page to test the setup.</p>
      </div>
    </div>
  );
}
