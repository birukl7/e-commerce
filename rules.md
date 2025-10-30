## Framework Version
- This is a Laravel 12 application. When there is any ambiguity or anomaly, consult the official Laravel 12 documentation first.

## Testing & Queues (Laravel 12)
- For queued jobs (implementing `ShouldQueue`), prefer `Queue::fake()` and `Queue::assertPushed()`.
- For domain events, use `Event::fake()` and `Event::assertDispatched()`.
- Register listeners in `App\Providers\EventServiceProvider` and ensure the provider is listed in `bootstrap/providers.php`.
- you must follow these rules when you implement code in this codebase
- this is a strictly laravel+react+inertia project, with typescript. 
- the ui views are found in resources/js, and its sub directories.
- all the files and folders in under resources/js have small letter words, with hyphens for multiple words.
- do not, absolutely do not, name files or folders with capitalization, if or when you need to create new ones, or need to rename new ones.
- always refer to global app.css to update styles, and do not update styles in other files.:w
