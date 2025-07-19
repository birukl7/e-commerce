
   PASS  Tests\Unit\ExampleTest
  ✓ that true is true

   FAIL  Tests\Feature\Auth\AuthenticationTest
  ⨯ login screen can be rendered                                                                                        0.39s  
  ✓ users can authenticate using the login screen                                                                       0.02s  
  ✓ users can not authenticate with invalid password                                                                    0.21s  
  ✓ users can logout                                                                                                    0.01s  

   FAIL  Tests\Feature\Auth\EmailVerificationTest
  ⨯ email verification screen can be rendered                                                                           0.25s  
  ✓ email can be verified                                                                                               0.01s  
  ✓ email is not verified with invalid hash                                                                             0.01s  

   FAIL  Tests\Feature\Auth\PasswordConfirmationTest
  ⨯ confirm password screen can be rendered                                                                             0.26s  
  ✓ password can be confirmed                                                                                           0.01s  
  ✓ password is not confirmed with invalid password                                                                     0.21s  

   FAIL  Tests\Feature\Auth\PasswordResetTest
  ⨯ reset password link screen can be rendered                                                                          0.24s  
  ✓ reset password link can be requested                                                                                0.21s  
  ⨯ reset password screen can be rendered                                                                               0.46s  
  ⨯ password can be reset with valid token                                                                              0.21s  

   FAIL  Tests\Feature\Auth\RegistrationTest
  ⨯ registration screen can be rendered                                                                                 0.30s  
  ⨯ new users can register                                                                                              0.01s  

   FAIL  Tests\Feature\DashboardTest
  ✓ guests are redirected to the login page                                                                             0.01s  
  ⨯ authenticated users can visit the dashboard                                                                         0.33s  

   FAIL  Tests\Feature\ExampleTest
  ⨯ it returns a successful response                                                                                    0.27s  

   PASS  Tests\Feature\Settings\PasswordUpdateTest
  ✓ password can be updated                                                                                             0.01s  
  ✓ correct password must be provided to update password                                                                0.01s  

   FAIL  Tests\Feature\Settings\ProfileUpdateTest
  ⨯ profile page is displayed                                                                                           0.25s  
  ⨯ profile information can be updated                                                                                  0.12s  
  ⨯ email verification status is unchanged when the email address is unchanged                                          0.13s  
  ✓ user can delete their account                                                                                       0.01s  
  ✓ correct password must be provided to delete account                                                                 0.01s  
  ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────  
   FAILED  Tests\Feature\Auth\AuthenticationTest > login screen can be rendered                                                
  Expected response status code [200] but received 500.
Failed asserting that 500 is identical to 200.

The following exception occurred during the last request:

Illuminate\Foundation\ViteManifestNotFoundException: Vite manifest not found at: /home/logos/Dev/Work/Laravel/e-commerce/public/build/manifest.json in /home/dechasa/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Vite.php:934
Stack trace:
#0 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Vite.php(384): Illuminate\Foundation\Vite->manifest('build')
#1 /home/logos/Dev/Work/Laravel/e-commerce/storage/framework/views/b9df1a3ec2d9260315df3e2c00636be7.php(44): Illuminate\Foundation\Vite->__invoke(Object(Illuminate\Support\Collection))
#2 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Filesystem/Filesystem.php(123): require('/home/dechasa/D...')
#3 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Filesystem/Filesystem.php(124): Illuminate\Filesystem\Filesystem::{closure:Illuminate\Filesystem\Filesystem::getRequire():120}()
#4 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/View/Engines/PhpEngine.php(57): Illuminate\Filesystem\Filesystem->getRequire('/home/dechasa/D...', Array)
#5 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/View/Engines/CompilerEngine.php(76): Illuminate\View\Engines\PhpEngine->evaluatePath('/home/dechasa/D...', Array)
#6 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/View/View.php(208): Illuminate\View\Engines\CompilerEngine->get('/home/dechasa/D...', Array)
#7 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/View/View.php(191): Illuminate\View\View->getContents()
#8 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/View/View.php(160): Illuminate\View\View->renderContents()
#9 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Http/Response.php(78): Illuminate\View\View->render()
#10 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Http/Response.php(34): Illuminate\Http\Response->setContent(Object(Illuminate\View\View))
#11 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/ResponseFactory.php(61): Illuminate\Http\Response->__construct(Object(Illuminate\View\View), 200, Array)
#12 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/ResponseFactory.php(91): Illuminate\Routing\ResponseFactory->make(Object(Illuminate\View\View), 200, Array)
#13 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Support/Facades/Facade.php(361): Illuminate\Routing\ResponseFactory->view('app', Array)
#14 /home/logos/Dev/Work/Laravel/e-commerce/vendor/inertiajs/inertia-laravel/src/Response.php(135): Illuminate\Support\Facades\Facade::__callStatic('view', Array)
#15 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/Router.php(906): Inertia\Response->toResponse(Object(Illuminate\Http\Request))
#16 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/Router.php(891): Illuminate\Routing\Router::toResponse(Object(Illuminate\Http\Request), Object(Inertia\Response))
#17 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/Router.php(807): Illuminate\Routing\Router->prepareResponse(Object(Illuminate\Http\Request), Object(Inertia\Response))
#18 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(169): Illuminate\Routing\Router->{closure:Illuminate\Routing\Router::runRouteWithinStack():807}(Object(Illuminate\Http\Request))
#19 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Auth/Middleware/RedirectIfAuthenticated.php(35): Illuminate\Pipeline\Pipeline->{closure:Illuminate\Pipeline\Pipeline::prepareDestination():167}(Object(Illuminate\Http\Request))
#20 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Auth\Middleware\RedirectIfAuthenticated->handle(Object(Illuminate\Http\Request), Object(Closure))
#21 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Http/Middleware/AddLinkHeadersForPreloadedAssets.php(32): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#22 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets->handle(Object(Illuminate\Http\Request), Object(Closure))
#23 /home/logos/Dev/Work/Laravel/e-commerce/vendor/inertiajs/inertia-laravel/src/Middleware.php(100): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#24 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Inertia\Middleware->handle(Object(Illuminate\Http\Request), Object(Closure))
#25 /home/logos/Dev/Work/Laravel/e-commerce/app/Http/Middleware/HandleAppearance.php(21): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#26 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): App\Http\Middleware\HandleAppearance->handle(Object(Illuminate\Http\Request), Object(Closure))
#27 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/Middleware/SubstituteBindings.php(50): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#28 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Routing\Middleware\SubstituteBindings->handle(Object(Illuminate\Http\Request), Object(Closure))
#29 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Http/Middleware/VerifyCsrfToken.php(87): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#30 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Foundation\Http\Middleware\VerifyCsrfToken->handle(Object(Illuminate\Http\Request), Object(Closure))


Next Illuminate\View\ViewException: Vite manifest not found at: /home/logos/Dev/Work/Laravel/e-commerce/public/build/manifest.json (View: /home/dechasa/Dev/Work/Laravel/e-commerce/resources/views/app.blade.php) in /home/dechasa/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Vite.php:934
Stack trace:
#0 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/View/Engines/PhpEngine.php(59): Illuminate\View\Engines\CompilerEngine->handleViewException(Object(Illuminate\Foundation\ViteManifestNotFoundException), 2)
#1 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/View/Engines/CompilerEngine.php(76): Illuminate\View\Engines\PhpEngine->evaluatePath('/home/dechasa/D...', Array)
#2 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/View/View.php(208): Illuminate\View\Engines\CompilerEngine->get('/home/dechasa/D...', Array)
#3 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/View/View.php(191): Illuminate\View\View->getContents()
#4 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/View/View.php(160): Illuminate\View\View->renderContents()
#5 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Http/Response.php(78): Illuminate\View\View->render()
#6 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Http/Response.php(34): Illuminate\Http\Response->setContent(Object(Illuminate\View\View))
#7 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/ResponseFactory.php(61): Illuminate\Http\Response->__construct(Object(Illuminate\View\View), 200, Array)
#8 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/ResponseFactory.php(91): Illuminate\Routing\ResponseFactory->make(Object(Illuminate\View\View), 200, Array)
#9 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Support/Facades/Facade.php(361): Illuminate\Routing\ResponseFactory->view('app', Array)
#10 /home/logos/Dev/Work/Laravel/e-commerce/vendor/inertiajs/inertia-laravel/src/Response.php(135): Illuminate\Support\Facades\Facade::__callStatic('view', Array)
#11 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/Router.php(906): Inertia\Response->toResponse(Object(Illuminate\Http\Request))
#12 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/Router.php(891): Illuminate\Routing\Router::toResponse(Object(Illuminate\Http\Request), Object(Inertia\Response))
#13 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/Router.php(807): Illuminate\Routing\Router->prepareResponse(Object(Illuminate\Http\Request), Object(Inertia\Response))
#14 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(169): Illuminate\Routing\Router->{closure:Illuminate\Routing\Router::runRouteWithinStack():807}(Object(Illuminate\Http\Request))
#15 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Auth/Middleware/RedirectIfAuthenticated.php(35): Illuminate\Pipeline\Pipeline->{closure:Illuminate\Pipeline\Pipeline::prepareDestination():167}(Object(Illuminate\Http\Request))
----------------------------------------------------------------------------------

Vite manifest not found at: /home/logos/Dev/Work/Laravel/e-commerce/public/build/manifest.json (View: /home/dechasa/Dev/Work/Laravel/e-commerce/resources/views/app.blade.php)

  at tests/Feature/Auth/AuthenticationTest.php:10
      6▕ 
      7▕ test('login screen can be rendered', function () {
      8▕     $response = $this->get('/login');
      9▕ 
  ➜  10▕     $response->assertStatus(200);
     11▕ });
     12▕ 
     13▕ test('users can authenticate using the login screen', function () {
     14▕     $user = User::factory()->create();

  ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────  
   FAILED  Tests\Feature\Auth\EmailVerificationTest > email verification screen can be rendered                                
  Expected response status code [200] but received 500.
Failed asserting that 500 is identical to 200.

The following exception occurred during the last request:

Illuminate\Foundation\ViteManifestNotFoundException: Vite manifest not found at: /home/logos/Dev/Work/Laravel/e-commerce/public/build/manifest.json in /home/dechasa/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Vite.php:934
Stack trace:
#0 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Vite.php(384): Illuminate\Foundation\Vite->manifest('build')
#1 /home/logos/Dev/Work/Laravel/e-commerce/storage/framework/views/b9df1a3ec2d9260315df3e2c00636be7.php(44): Illuminate\Foundation\Vite->__invoke(Object(Illuminate\Support\Collection))
#2 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Filesystem/Filesystem.php(123): require('/home/dechasa/D...')
#3 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Filesystem/Filesystem.php(124): Illuminate\Filesystem\Filesystem::{closure:Illuminate\Filesystem\Filesystem::getRequire():120}()
#4 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/View/Engines/PhpEngine.php(57): Illuminate\Filesystem\Filesystem->getRequire('/home/dechasa/D...', Array)
#5 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/View/Engines/CompilerEngine.php(76): Illuminate\View\Engines\PhpEngine->evaluatePath('/home/dechasa/D...', Array)
#6 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/View/View.php(208): Illuminate\View\Engines\CompilerEngine->get('/home/dechasa/D...', Array)
#7 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/View/View.php(191): Illuminate\View\View->getContents()
#8 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/View/View.php(160): Illuminate\View\View->renderContents()
#9 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Http/Response.php(78): Illuminate\View\View->render()
#10 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Http/Response.php(34): Illuminate\Http\Response->setContent(Object(Illuminate\View\View))
#11 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/ResponseFactory.php(61): Illuminate\Http\Response->__construct(Object(Illuminate\View\View), 200, Array)
#12 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/ResponseFactory.php(91): Illuminate\Routing\ResponseFactory->make(Object(Illuminate\View\View), 200, Array)
#13 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Support/Facades/Facade.php(361): Illuminate\Routing\ResponseFactory->view('app', Array)
#14 /home/logos/Dev/Work/Laravel/e-commerce/vendor/inertiajs/inertia-laravel/src/Response.php(135): Illuminate\Support\Facades\Facade::__callStatic('view', Array)
#15 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/Router.php(906): Inertia\Response->toResponse(Object(Illuminate\Http\Request))
#16 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/Router.php(891): Illuminate\Routing\Router::toResponse(Object(Illuminate\Http\Request), Object(Inertia\Response))
#17 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/Router.php(807): Illuminate\Routing\Router->prepareResponse(Object(Illuminate\Http\Request), Object(Inertia\Response))
#18 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(169): Illuminate\Routing\Router->{closure:Illuminate\Routing\Router::runRouteWithinStack():807}(Object(Illuminate\Http\Request))
#19 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Http/Middleware/AddLinkHeadersForPreloadedAssets.php(32): Illuminate\Pipeline\Pipeline->{closure:Illuminate\Pipeline\Pipeline::prepareDestination():167}(Object(Illuminate\Http\Request))
#20 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets->handle(Object(Illuminate\Http\Request), Object(Closure))


Next Illuminate\View\ViewException: Vite manifest not found at: /home/logos/Dev/Work/Laravel/e-commerce/public/build/manifest.json (View: /home/dechasa/Dev/Work/Laravel/e-commerce/resources/views/app.blade.php) in /home/dechasa/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Vite.php:934
Stack trace:
#0 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/View/Engines/PhpEngine.php(59): Illuminate\View\Engines\CompilerEngine->handleViewException(Object(Illuminate\Foundation\ViteManifestNotFoundException), 2)
#1 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/View/Engines/CompilerEngine.php(76): Illuminate\View\Engines\PhpEngine->evaluatePath('/home/dechasa/D...', Array)
#2 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/View/View.php(208): Illuminate\View\Engines\CompilerEngine->get('/home/dechasa/D...', Array)
#3 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/View/View.php(191): Illuminate\View\View->getContents()
#4 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/View/View.php(160): Illuminate\View\View->renderContents()
#5 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Http/Response.php(78): Illuminate\View\View->render()
#6 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Http/Response.php(34): Illuminate\Http\Response->setContent(Object(Illuminate\View\View))
#7 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/ResponseFactory.php(61): Illuminate\Http\Response->__construct(Object(Illuminate\View\View), 200, Array)
#8 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/ResponseFactory.php(91): Illuminate\Routing\ResponseFactory->make(Object(Illuminate\View\View), 200, Array)
#9 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Support/Facades/Facade.php(361): Illuminate\Routing\ResponseFactory->view('app', Array)
#10 /home/logos/Dev/Work/Laravel/e-commerce/vendor/inertiajs/inertia-laravel/src/Response.php(135): Illuminate\Support\Facades\Facade::__callStatic('view', Array)
#11 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/Router.php(906): Inertia\Response->toResponse(Object(Illuminate\Http\Request))
#12 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/Router.php(891): Illuminate\Routing\Router::toResponse(Object(Illuminate\Http\Request), Object(Inertia\Response))
#13 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/Router.php(807): Illuminate\Routing\Router->prepareResponse(Object(Illuminate\Http\Request), Object(Inertia\Response))
#14 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(169): Illuminate\Routing\Router->{closure:Illuminate\Routing\Router::runRouteWithinStack():807}(Object(Illuminate\Http\Request))
#15 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Http/Middleware/AddLinkHeadersForPreloadedAssets.php(32): Illuminate\Pipeline\Pipeline->{closure:Illuminate\Pipeline\Pipeline::prepareDestination():167}(Object(Illuminate\Http\Request))
#16 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets->handle(Object(Illuminate\Http\Request), Object(Closure))
#17 /home/logos/Dev/Work/Laravel/e-commerce/vendor/inertiajs/inertia-laravel/src/Middleware.php(100): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#18 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Inertia\Middleware->handle(Object(Illuminate\Http\Request), Object(Closure))
#19 /home/logos/Dev/Work/Laravel/e-commerce/app/Http/Middleware/HandleAppearance.php(21): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#20 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): App\Http\Middleware\HandleAppearance->handle(Object(Illuminate\Http\Request), Object(Closure))
#21 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/Middleware/SubstituteBindings.php(50): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#22 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Routing\Middleware\SubstituteBindings->handle(Object(Illuminate\Http\Request), Object(Closure))
#23 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Auth/Middleware/Authenticate.php(63): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#24 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Auth\Middleware\Authenticate->handle(Object(Illuminate\Http\Request), Object(Closure))
#25 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Http/Middleware/VerifyCsrfToken.php(87): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
----------------------------------------------------------------------------------

Vite manifest not found at: /home/logos/Dev/Work/Laravel/e-commerce/public/build/manifest.json (View: /home/dechasa/Dev/Work/Laravel/e-commerce/resources/views/app.blade.php)

  at tests/Feature/Auth/EmailVerificationTest.php:15
     11▕     $user = User::factory()->unverified()->create();
     12▕ 
     13▕     $response = $this->actingAs($user)->get('/verify-email');
     14▕ 
  ➜  15▕     $response->assertStatus(200);
     16▕ });
     17▕ 
     18▕ test('email can be verified', function () {
     19▕     $user = User::factory()->unverified()->create();

  ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────  
   FAILED  Tests\Feature\Auth\PasswordConfirmationTest > confirm password screen can be rendered                               
  Expected response status code [200] but received 500.
Failed asserting that 500 is identical to 200.

The following exception occurred during the last request:

Illuminate\Foundation\ViteManifestNotFoundException: Vite manifest not found at: /home/logos/Dev/Work/Laravel/e-commerce/public/build/manifest.json in /home/dechasa/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Vite.php:934
Stack trace:
#0 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Vite.php(384): Illuminate\Foundation\Vite->manifest('build')
#1 /home/logos/Dev/Work/Laravel/e-commerce/storage/framework/views/b9df1a3ec2d9260315df3e2c00636be7.php(44): Illuminate\Foundation\Vite->__invoke(Object(Illuminate\Support\Collection))
#2 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Filesystem/Filesystem.php(123): require('/home/dechasa/D...')
#3 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Filesystem/Filesystem.php(124): Illuminate\Filesystem\Filesystem::{closure:Illuminate\Filesystem\Filesystem::getRequire():120}()
#4 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/View/Engines/PhpEngine.php(57): Illuminate\Filesystem\Filesystem->getRequire('/home/dechasa/D...', Array)
#5 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/View/Engines/CompilerEngine.php(76): Illuminate\View\Engines\PhpEngine->evaluatePath('/home/dechasa/D...', Array)
#6 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/View/View.php(208): Illuminate\View\Engines\CompilerEngine->get('/home/dechasa/D...', Array)
#7 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/View/View.php(191): Illuminate\View\View->getContents()
#8 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/View/View.php(160): Illuminate\View\View->renderContents()
#9 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Http/Response.php(78): Illuminate\View\View->render()
#10 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Http/Response.php(34): Illuminate\Http\Response->setContent(Object(Illuminate\View\View))
#11 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/ResponseFactory.php(61): Illuminate\Http\Response->__construct(Object(Illuminate\View\View), 200, Array)
#12 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/ResponseFactory.php(91): Illuminate\Routing\ResponseFactory->make(Object(Illuminate\View\View), 200, Array)
#13 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Support/Facades/Facade.php(361): Illuminate\Routing\ResponseFactory->view('app', Array)
#14 /home/logos/Dev/Work/Laravel/e-commerce/vendor/inertiajs/inertia-laravel/src/Response.php(135): Illuminate\Support\Facades\Facade::__callStatic('view', Array)
#15 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/Router.php(906): Inertia\Response->toResponse(Object(Illuminate\Http\Request))
#16 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/Router.php(891): Illuminate\Routing\Router::toResponse(Object(Illuminate\Http\Request), Object(Inertia\Response))
#17 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/Router.php(807): Illuminate\Routing\Router->prepareResponse(Object(Illuminate\Http\Request), Object(Inertia\Response))
#18 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(169): Illuminate\Routing\Router->{closure:Illuminate\Routing\Router::runRouteWithinStack():807}(Object(Illuminate\Http\Request))
#19 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Http/Middleware/AddLinkHeadersForPreloadedAssets.php(32): Illuminate\Pipeline\Pipeline->{closure:Illuminate\Pipeline\Pipeline::prepareDestination():167}(Object(Illuminate\Http\Request))
#20 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets->handle(Object(Illuminate\Http\Request), Object(Closure))
#21 /home/logos/Dev/Work/Laravel/e-commerce/vendor/inertiajs/inertia-laravel/src/Middleware.php(100): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#22 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Inertia\Middleware->handle(Object(Illuminate\Http\Request), Object(Closure))
#23 /home/logos/Dev/Work/Laravel/e-commerce/app/Http/Middleware/HandleAppearance.php(21): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#24 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): App\Http\Middleware\HandleAppearance->handle(Object(Illuminate\Http\Request), Object(Closure))
#25 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/Middleware/SubstituteBindings.php(50): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
91 {main}

Next Illuminate\View\ViewException: Vite manifest not found at: /home/logos/Dev/Work/Laravel/e-commerce/public/build/manifest.json (View: /home/dechasa/Dev/Work/Laravel/e-commerce/resources/views/app.blade.php) in /home/dechasa/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Vite.php:934
Stack trace:
#0 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/View/Engines/PhpEngine.php(59): Illuminate\View\Engines\CompilerEngine->handleViewException(Object(Illuminate\Foundation\ViteManifestNotFoundException), 2)
#1 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/View/Engines/CompilerEngine.php(76): Illuminate\View\Engines\PhpEngine->evaluatePath('/home/dechasa/D...', Array)
#2 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/View/View.php(208): Illuminate\View\Engines\CompilerEngine->get('/home/dechasa/D...', Array)
#3 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/View/View.php(191): Illuminate\View\View->getContents()
#4 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/View/View.php(160): Illuminate\View\View->renderContents()
#5 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Http/Response.php(78): Illuminate\View\View->render()
#6 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Http/Response.php(34): Illuminate\Http\Response->setContent(Object(Illuminate\View\View))
#7 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/ResponseFactory.php(61): Illuminate\Http\Response->__construct(Object(Illuminate\View\View), 200, Array)
#8 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/ResponseFactory.php(91): Illuminate\Routing\ResponseFactory->make(Object(Illuminate\View\View), 200, Array)
#9 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Support/Facades/Facade.php(361): Illuminate\Routing\ResponseFactory->view('app', Array)
#10 /home/logos/Dev/Work/Laravel/e-commerce/vendor/inertiajs/inertia-laravel/src/Response.php(135): Illuminate\Support\Facades\Facade::__callStatic('view', Array)
#11 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/Router.php(906): Inertia\Response->toResponse(Object(Illuminate\Http\Request))
#12 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/Router.php(891): Illuminate\Routing\Router::toResponse(Object(Illuminate\Http\Request), Object(Inertia\Response))
#13 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/Router.php(807): Illuminate\Routing\Router->prepareResponse(Object(Illuminate\Http\Request), Object(Inertia\Response))
#14 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(169): Illuminate\Routing\Router->{closure:Illuminate\Routing\Router::runRouteWithinStack():807}(Object(Illuminate\Http\Request))
#15 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Http/Middleware/AddLinkHeadersForPreloadedAssets.php(32): Illuminate\Pipeline\Pipeline->{closure:Illuminate\Pipeline\Pipeline::prepareDestination():167}(Object(Illuminate\Http\Request))
---------------------------------------------------------------------------------

Vite manifest not found at: /home/logos/Dev/Work/Laravel/e-commerce/public/build/manifest.json (View: /home/dechasa/Dev/Work/Laravel/e-commerce/resources/views/app.blade.php)

  at tests/Feature/Auth/PasswordConfirmationTest.php:12
      8▕     $user = User::factory()->create();
      9▕ 
     10▕     $response = $this->actingAs($user)->get('/confirm-password');
     11▕ 
  ➜  12▕     $response->assertStatus(200);
     13▕ });
     14▕ 
     15▕ test('password can be confirmed', function () {
     16▕     $user = User::factory()->create();

  ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────  
   FAILED  Tests\Feature\Auth\PasswordResetTest > reset password link screen can be rendered                                   
  Expected response status code [200] but received 500.
Failed asserting that 500 is identical to 200.

The following exception occurred during the last request:

Illuminate\Foundation\ViteManifestNotFoundException: Vite manifest not found at: /home/logos/Dev/Work/Laravel/e-commerce/public/build/manifest.json in /home/dechasa/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Vite.php:934
Stack trace:
#0 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Vite.php(384): Illuminate\Foundation\Vite->manifest('build')
#1 /home/logos/Dev/Work/Laravel/e-commerce/storage/framework/views/b9df1a3ec2d9260315df3e2c00636be7.php(44): Illuminate\Foundation\Vite->__invoke(Object(Illuminate\Support\Collection))
#2 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Filesystem/Filesystem.php(123): require('/home/dechasa/D...')
#3 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Filesystem/Filesystem.php(124): Illuminate\Filesystem\Filesystem::{closure:Illuminate\Filesystem\Filesystem::getRequire():120}()
#4 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/View/Engines/PhpEngine.php(57): Illuminate\Filesystem\Filesystem->getRequire('/home/dechasa/D...', Array)
#5 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/View/Engines/CompilerEngine.php(76): Illuminate\View\Engines\PhpEngine->evaluatePath('/home/dechasa/D...', Array)
#6 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/View/View.php(208): Illuminate\View\Engines\CompilerEngine->get('/home/dechasa/D...', Array)
#7 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/View/View.php(191): Illuminate\View\View->getContents()
#8 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/View/View.php(160): Illuminate\View\View->renderContents()
#9 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Http/Response.php(78): Illuminate\View\View->render()
#10 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Http/Response.php(34): Illuminate\Http\Response->setContent(Object(Illuminate\View\View))
#11 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/ResponseFactory.php(61): Illuminate\Http\Response->__construct(Object(Illuminate\View\View), 200, Array)
#12 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/ResponseFactory.php(91): Illuminate\Routing\ResponseFactory->make(Object(Illuminate\View\View), 200, Array)
#13 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Support/Facades/Facade.php(361): Illuminate\Routing\ResponseFactory->view('app', Array)
#14 /home/logos/Dev/Work/Laravel/e-commerce/vendor/inertiajs/inertia-laravel/src/Response.php(135): Illuminate\Support\Facades\Facade::__callStatic('view', Array)
#15 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/Router.php(906): Inertia\Response->toResponse(Object(Illuminate\Http\Request))
#16 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/Router.php(891): Illuminate\Routing\Router::toResponse(Object(Illuminate\Http\Request), Object(Inertia\Response))
#17 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/Router.php(807): Illuminate\Routing\Router->prepareResponse(Object(Illuminate\Http\Request), Object(Inertia\Response))
#18 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(169): Illuminate\Routing\Router->{closure:Illuminate\Routing\Router::runRouteWithinStack():807}(Object(Illuminate\Http\Request))
#19 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Auth/Middleware/RedirectIfAuthenticated.php(35): Illuminate\Pipeline\Pipeline->{closure:Illuminate\Pipeline\Pipeline::prepareDestination():167}(Object(Illuminate\Http\Request))
#20 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Auth\Middleware\RedirectIfAuthenticated->handle(Object(Illuminate\Http\Request), Object(Closure))
#21 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Http/Middleware/AddLinkHeadersForPreloadedAssets.php(32): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#22 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets->handle(Object(Illuminate\Http\Request), Object(Closure))
#23 /home/logos/Dev/Work/Laravel/e-commerce/vendor/inertiajs/inertia-laravel/src/Middleware.php(100): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#24 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Inertia\Middleware->handle(Object(Illuminate\Http\Request), Object(Closure))
#25 /home/logos/Dev/Work/Laravel/e-commerce/app/Http/Middleware/HandleAppearance.php(21): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#26 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): App\Http\Middleware\HandleAppearance->handle(Object(Illuminate\Http\Request), Object(Closure))
#27 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/Middleware/SubstituteBindings.php(50): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#28 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Routing\Middleware\SubstituteBindings->handle(Object(Illuminate\Http\Request), Object(Closure))
#29 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Http/Middleware/VerifyCsrfToken.php(87): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#30 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Foundation\Http\Middleware\VerifyCsrfToken->handle(Object(Illuminate\Http\Request), Object(Closure))
#31 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/View/Middleware/ShareErrorsFromSession.php(48): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#32 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\View\Middleware\ShareErrorsFromSession->handle(Object(Illuminate\Http\Request), Object(Closure))
#33 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Session/Middleware/StartSession.php(120): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#34 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Session/Middleware/StartSession.php(63): Illuminate\Session\Middleware\StartSession->handleStatefulRequest(Object(Illuminate\Http\Request), Object(Illuminate\Session\Store), Object(Closure))
#35 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Session\Middleware\StartSession->handle(Object(Illuminate\Http\Request), Object(Closure))
#36 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Cookie/Middleware/AddQueuedCookiesToResponse.php(36): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#37 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse->handle(Object(Illuminate\Http\Request), Object(Closure))
#38 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Cookie/Middleware/EncryptCookies.php(74): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#39 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Cookie\Middleware\EncryptCookies->handle(Object(Illuminate\Http\Request), Object(Closure))
#40 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(126): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#41 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/Router.php(807): Illuminate\Pipeline\Pipeline->then(Object(Closure))
#42 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/Router.php(786): Illuminate\Routing\Router->runRouteWithinStack(Object(Illuminate\Routing\Route), Object(Illuminate\Http\Request))
#43 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/Router.php(750): Illuminate\Routing\Router->runRoute(Object(Illuminate\Http\Request), Object(Illuminate\Routing\Route))
#44 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/Router.php(739): Illuminate\Routing\Router->dispatchToRoute(Object(Illuminate\Http\Request))
#45 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Http/Kernel.php(200): Illuminate\Routing\Router->dispatch(Object(Illuminate\Http\Request))
#46 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(169): Illuminate\Foundation\Http\Kernel->{closure:Illuminate\Foundation\Http\Kernel::dispatchToRouter():197}(Object(Illuminate\Http\Request))
#47 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Http/Middleware/TransformsRequest.php(21): Illuminate\Pipeline\Pipeline->{closure:Illuminate\Pipeline\Pipeline::prepareDestination():167}(Object(Illuminate\Http\Request))
#48 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Http/Middleware/ConvertEmptyStringsToNull.php(31): Illuminate\Foundation\Http\Middleware\TransformsRequest->handle(Object(Illuminate\Http\Request), Object(Closure))
#49 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Foundation\Http\Middleware\ConvertEmptyStringsToNull->handle(Object(Illuminate\Http\Request), Object(Closure))
#50 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Http/Middleware/TransformsRequest.php(21): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#51 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Http/Middleware/TrimStrings.php(51): Illuminate\Foundation\Http\Middleware\TransformsRequest->handle(Object(Illuminate\Http\Request), Object(Closure))
#52 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Foundation\Http\Middleware\TrimStrings->handle(Object(Illuminate\Http\Request), Object(Closure))
#53 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Http/Middleware/ValidatePostSize.php(27): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#54 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Http\Middleware\ValidatePostSize->handle(Object(Illuminate\Http\Request), Object(Closure))
#55 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Http/Middleware/PreventRequestsDuringMaintenance.php(109): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#56 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Foundation\Http\Middleware\PreventRequestsDuringMaintenance->handle(Object(Illuminate\Http\Request), Object(Closure))
#57 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Http/Middleware/HandleCors.php(48): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#58 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Http\Middleware\HandleCors->handle(Object(Illuminate\Http\Request), Object(Closure))
#59 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Http/Middleware/TrustProxies.php(58): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#60 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Http\Middleware\TrustProxies->handle(Object(Illuminate\Http\Request), Object(Closure))
#61 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Http/Middleware/InvokeDeferredCallbacks.php(22): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#62 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Foundation\Http\Middleware\InvokeDeferredCallbacks->handle(Object(Illuminate\Http\Request), Object(Closure))
#63 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Http/Middleware/ValidatePathEncoding.php(26): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#64 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Http\Middleware\ValidatePathEncoding->handle(Object(Illuminate\Http\Request), Object(Closure))
#65 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(126): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#66 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Http/Kernel.php(175): Illuminate\Pipeline\Pipeline->then(Object(Closure))
#67 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Http/Kernel.php(144): Illuminate\Foundation\Http\Kernel->sendRequestThroughRouter(Object(Illuminate\Http\Request))
#68 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Testing/Concerns/MakesHttpRequests.php(607): Illuminate\Foundation\Http\Kernel->handle(Object(Illuminate\Http\Request))
#69 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Testing/Concerns/MakesHttpRequests.php(368): Illuminate\Foundation\Testing\TestCase->call('GET', '/forgot-passwor...', Array, Array, Array, Array)
#70 /home/logos/Dev/Work/Laravel/e-commerce/tests/Feature/Auth/PasswordResetTest.php(10): Illuminate\Foundation\Testing\TestCase->get('/forgot-passwor...')
#71 /home/logos/Dev/Work/Laravel/e-commerce/vendor/pestphp/pest/src/Factories/TestCaseMethodFactory.php(168): P\Tests\Feature\Auth\PasswordResetTest->{closure:/home/dechasa/Dev/Work/Laravel/e-commerce/tests/Feature/Auth/PasswordResetTest.php:9}()
#72 [internal function]: P\Tests\Feature\Auth\PasswordResetTest->{closure:Pest\Factories\TestCaseMethodFactory::getClosure():158}()
#73 /home/logos/Dev/Work/Laravel/e-commerce/vendor/pestphp/pest/src/Concerns/Testable.php(419): call_user_func_array(Object(Closure), Array)
#74 /home/logos/Dev/Work/Laravel/e-commerce/vendor/pestphp/pest/src/Support/ExceptionTrace.php(26): P\Tests\Feature\Auth\PasswordResetTest->{closure:Pest\Concerns\Testable::__callClosure():419}()
#75 /home/logos/Dev/Work/Laravel/e-commerce/vendor/pestphp/pest/src/Concerns/Testable.php(419): Pest\Support\ExceptionTrace::ensure(Object(Closure))
#76 /home/logos/Dev/Work/Laravel/e-commerce/vendor/pestphp/pest/src/Concerns/Testable.php(321): P\Tests\Feature\Auth\PasswordResetTest->__callClosure(Object(Closure), Array)
#77 /home/logos/Dev/Work/Laravel/e-commerce/vendor/pestphp/pest/src/Factories/TestCaseFactory.php(169) : eval()'d code(17): P\Tests\Feature\Auth\PasswordResetTest->__runTest(Object(Closure))
#78 /home/logos/Dev/Work/Laravel/e-commerce/vendor/phpunit/phpunit/src/Framework/TestCase.php(1240): P\Tests\Feature\Auth\PasswordResetTest->__pest_evaluable_reset_password_link_screen_can_be_rendered()
#79 /home/logos/Dev/Work/Laravel/e-commerce/vendor/phpunit/phpunit/src/Framework/TestCase.php(514): PHPUnit\Framework\TestCase->runTest()
#80 /home/logos/Dev/Work/Laravel/e-commerce/vendor/phpunit/phpunit/src/Framework/TestRunner/TestRunner.php(87): PHPUnit\Framework\TestCase->runBare()
#81 /home/logos/Dev/Work/Laravel/e-commerce/vendor/phpunit/phpunit/src/Framework/TestCase.php(361): PHPUnit\Framework\TestRunner->run(Object(P\Tests\Feature\Auth\PasswordResetTest))
#82 /home/logos/Dev/Work/Laravel/e-commerce/vendor/phpunit/phpunit/src/Framework/TestSuite.php(369): PHPUnit\Framework\TestCase->run()
#83 /home/logos/Dev/Work/Laravel/e-commerce/vendor/phpunit/phpunit/src/Framework/TestSuite.php(369): PHPUnit\Framework\TestSuite->run()
#84 /home/logos/Dev/Work/Laravel/e-commerce/vendor/phpunit/phpunit/src/Framework/TestSuite.php(369): PHPUnit\Framework\TestSuite->run()
#85 /home/logos/Dev/Work/Laravel/e-commerce/vendor/phpunit/phpunit/src/TextUI/TestRunner.php(64): PHPUnit\Framework\TestSuite->run()
#86 /home/logos/Dev/Work/Laravel/e-commerce/vendor/phpunit/phpunit/src/TextUI/Application.php(210): PHPUnit\TextUI\TestRunner->run(Object(PHPUnit\TextUI\Configuration\Configuration), Object(PHPUnit\Runner\ResultCache\DefaultResultCache), Object(PHPUnit\Framework\TestSuite))
#87 /home/logos/Dev/Work/Laravel/e-commerce/vendor/pestphp/pest/src/Kernel.php(103): PHPUnit\TextUI\Application->run(Array)
#88 /home/logos/Dev/Work/Laravel/e-commerce/vendor/pestphp/pest/bin/pest(184): Pest\Kernel->handle(Array, Array)
#89 /home/logos/Dev/Work/Laravel/e-commerce/vendor/pestphp/pest/bin/pest(192): {closure:/home/dechasa/Dev/Work/Laravel/e-commerce/vendor/pestphp/pest/bin/pest:18}()
#90 /home/logos/Dev/Work/Laravel/e-commerce/vendor/bin/pest(119): include('/home/dechasa/D...')
#91 {main}

Next Illuminate\View\ViewException: Vite manifest not found at: /home/logos/Dev/Work/Laravel/e-commerce/public/build/manifest.json (View: /home/dechasa/Dev/Work/Laravel/e-commerce/resources/views/app.blade.php) in /home/dechasa/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Vite.php:934
Stack trace:
#0 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/View/Engines/PhpEngine.php(59): Illuminate\View\Engines\CompilerEngine->handleViewException(Object(Illuminate\Foundation\ViteManifestNotFoundException), 2)
#1 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/View/Engines/CompilerEngine.php(76): Illuminate\View\Engines\PhpEngine->evaluatePath('/home/dechasa/D...', Array)
#2 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/View/View.php(208): Illuminate\View\Engines\CompilerEngine->get('/home/dechasa/D...', Array)
#3 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/View/View.php(191): Illuminate\View\View->getContents()
#4 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/View/View.php(160): Illuminate\View\View->renderContents()
#5 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Http/Response.php(78): Illuminate\View\View->render()
#6 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Http/Response.php(34): Illuminate\Http\Response->setContent(Object(Illuminate\View\View))
#7 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/ResponseFactory.php(61): Illuminate\Http\Response->__construct(Object(Illuminate\View\View), 200, Array)
#8 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/ResponseFactory.php(91): Illuminate\Routing\ResponseFactory->make(Object(Illuminate\View\View), 200, Array)
#9 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Support/Facades/Facade.php(361): Illuminate\Routing\ResponseFactory->view('app', Array)
#10 /home/logos/Dev/Work/Laravel/e-commerce/vendor/inertiajs/inertia-laravel/src/Response.php(135): Illuminate\Support\Facades\Facade::__callStatic('view', Array)
#11 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/Router.php(906): Inertia\Response->toResponse(Object(Illuminate\Http\Request))
#12 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/Router.php(891): Illuminate\Routing\Router::toResponse(Object(Illuminate\Http\Request), Object(Inertia\Response))
#13 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/Router.php(807): Illuminate\Routing\Router->prepareResponse(Object(Illuminate\Http\Request), Object(Inertia\Response))
#14 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(169): Illuminate\Routing\Router->{closure:Illuminate\Routing\Router::runRouteWithinStack():807}(Object(Illuminate\Http\Request))
#15 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Auth/Middleware/RedirectIfAuthenticated.php(35): Illuminate\Pipeline\Pipeline->{closure:Illuminate\Pipeline\Pipeline::prepareDestination():167}(Object(Illuminate\Http\Request))
#16 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Auth\Middleware\RedirectIfAuthenticated->handle(Object(Illuminate\Http\Request), Object(Closure))
#17 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Http/Middleware/AddLinkHeadersForPreloadedAssets.php(32): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#18 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets->handle(Object(Illuminate\Http\Request), Object(Closure))
#19 /home/logos/Dev/Work/Laravel/e-commerce/vendor/inertiajs/inertia-laravel/src/Middleware.php(100): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#20 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Inertia\Middleware->handle(Object(Illuminate\Http\Request), Object(Closure))
#21 /home/logos/Dev/Work/Laravel/e-commerce/app/Http/Middleware/HandleAppearance.php(21): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#22 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): App\Http\Middleware\HandleAppearance->handle(Object(Illuminate\Http\Request), Object(Closure))
#23 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/Middleware/SubstituteBindings.php(50): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#24 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Routing\Middleware\SubstituteBindings->handle(Object(Illuminate\Http\Request), Object(Closure))
#25 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Http/Middleware/VerifyCsrfToken.php(87): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#26 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Foundation\Http\Middleware\VerifyCsrfToken->handle(Object(Illuminate\Http\Request), Object(Closure))
#27 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/View/Middleware/ShareErrorsFromSession.php(48): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#28 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\View\Middleware\ShareErrorsFromSession->handle(Object(Illuminate\Http\Request), Object(Closure))
#29 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Session/Middleware/StartSession.php(120): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#30 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Session/Middleware/StartSession.php(63): Illuminate\Session\Middleware\StartSession->handleStatefulRequest(Object(Illuminate\Http\Request), Object(Illuminate\Session\Store), Object(Closure))
#31 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Session\Middleware\StartSession->handle(Object(Illuminate\Http\Request), Object(Closure))
#32 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Cookie/Middleware/AddQueuedCookiesToResponse.php(36): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#33 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse->handle(Object(Illuminate\Http\Request), Object(Closure))
#34 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Cookie/Middleware/EncryptCookies.php(74): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#35 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Cookie\Middleware\EncryptCookies->handle(Object(Illuminate\Http\Request), Object(Closure))
#36 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(126): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#37 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/Router.php(807): Illuminate\Pipeline\Pipeline->then(Object(Closure))
#38 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/Router.php(786): Illuminate\Routing\Router->runRouteWithinStack(Object(Illuminate\Routing\Route), Object(Illuminate\Http\Request))
#39 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/Router.php(750): Illuminate\Routing\Router->runRoute(Object(Illuminate\Http\Request), Object(Illuminate\Routing\Route))
#40 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/Router.php(739): Illuminate\Routing\Router->dispatchToRoute(Object(Illuminate\Http\Request))
#41 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Http/Kernel.php(200): Illuminate\Routing\Router->dispatch(Object(Illuminate\Http\Request))
#42 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(169): Illuminate\Foundation\Http\Kernel->{closure:Illuminate\Foundation\Http\Kernel::dispatchToRouter():197}(Object(Illuminate\Http\Request))
#43 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Http/Middleware/TransformsRequest.php(21): Illuminate\Pipeline\Pipeline->{closure:Illuminate\Pipeline\Pipeline::prepareDestination():167}(Object(Illuminate\Http\Request))
#44 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Http/Middleware/ConvertEmptyStringsToNull.php(31): Illuminate\Foundation\Http\Middleware\TransformsRequest->handle(Object(Illuminate\Http\Request), Object(Closure))
#45 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Foundation\Http\Middleware\ConvertEmptyStringsToNull->handle(Object(Illuminate\Http\Request), Object(Closure))
#46 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Http/Middleware/TransformsRequest.php(21): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#47 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Http/Middleware/TrimStrings.php(51): Illuminate\Foundation\Http\Middleware\TransformsRequest->handle(Object(Illuminate\Http\Request), Object(Closure))
#48 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Foundation\Http\Middleware\TrimStrings->handle(Object(Illuminate\Http\Request), Object(Closure))
#49 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Http/Middleware/ValidatePostSize.php(27): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#50 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Http\Middleware\ValidatePostSize->handle(Object(Illuminate\Http\Request), Object(Closure))
#51 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Http/Middleware/PreventRequestsDuringMaintenance.php(109): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#52 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Foundation\Http\Middleware\PreventRequestsDuringMaintenance->handle(Object(Illuminate\Http\Request), Object(Closure))
#53 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Http/Middleware/HandleCors.php(48): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#54 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Http\Middleware\HandleCors->handle(Object(Illuminate\Http\Request), Object(Closure))
#55 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Http/Middleware/TrustProxies.php(58): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#56 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Http\Middleware\TrustProxies->handle(Object(Illuminate\Http\Request), Object(Closure))
#57 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Http/Middleware/InvokeDeferredCallbacks.php(22): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#58 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Foundation\Http\Middleware\InvokeDeferredCallbacks->handle(Object(Illuminate\Http\Request), Object(Closure))
#59 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Http/Middleware/ValidatePathEncoding.php(26): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#60 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Http\Middleware\ValidatePathEncoding->handle(Object(Illuminate\Http\Request), Object(Closure))
#61 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(126): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#62 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Http/Kernel.php(175): Illuminate\Pipeline\Pipeline->then(Object(Closure))
#63 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Http/Kernel.php(144): Illuminate\Foundation\Http\Kernel->sendRequestThroughRouter(Object(Illuminate\Http\Request))
#64 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Testing/Concerns/MakesHttpRequests.php(607): Illuminate\Foundation\Http\Kernel->handle(Object(Illuminate\Http\Request))
#65 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Testing/Concerns/MakesHttpRequests.php(368): Illuminate\Foundation\Testing\TestCase->call('GET', '/forgot-passwor...', Array, Array, Array, Array)
#66 /home/logos/Dev/Work/Laravel/e-commerce/tests/Feature/Auth/PasswordResetTest.php(10): Illuminate\Foundation\Testing\TestCase->get('/forgot-passwor...')
#67 /home/logos/Dev/Work/Laravel/e-commerce/vendor/pestphp/pest/src/Factories/TestCaseMethodFactory.php(168): P\Tests\Feature\Auth\PasswordResetTest->{closure:/home/dechasa/Dev/Work/Laravel/e-commerce/tests/Feature/Auth/PasswordResetTest.php:9}()
#68 [internal function]: P\Tests\Feature\Auth\PasswordResetTest->{closure:Pest\Factories\TestCaseMethodFactory::getClosure():158}()
#69 /home/logos/Dev/Work/Laravel/e-commerce/vendor/pestphp/pest/src/Concerns/Testable.php(419): call_user_func_array(Object(Closure), Array)
#70 /home/logos/Dev/Work/Laravel/e-commerce/vendor/pestphp/pest/src/Support/ExceptionTrace.php(26): P\Tests\Feature\Auth\PasswordResetTest->{closure:Pest\Concerns\Testable::__callClosure():419}()
#71 /home/logos/Dev/Work/Laravel/e-commerce/vendor/pestphp/pest/src/Concerns/Testable.php(419): Pest\Support\ExceptionTrace::ensure(Object(Closure))
#72 /home/logos/Dev/Work/Laravel/e-commerce/vendor/pestphp/pest/src/Concerns/Testable.php(321): P\Tests\Feature\Auth\PasswordResetTest->__callClosure(Object(Closure), Array)
#73 /home/logos/Dev/Work/Laravel/e-commerce/vendor/pestphp/pest/src/Factories/TestCaseFactory.php(169) : eval()'d code(17): P\Tests\Feature\Auth\PasswordResetTest->__runTest(Object(Closure))
#74 /home/logos/Dev/Work/Laravel/e-commerce/vendor/phpunit/phpunit/src/Framework/TestCase.php(1240): P\Tests\Feature\Auth\PasswordResetTest->__pest_evaluable_reset_password_link_screen_can_be_rendered()
#75 /home/logos/Dev/Work/Laravel/e-commerce/vendor/phpunit/phpunit/src/Framework/TestCase.php(514): PHPUnit\Framework\TestCase->runTest()
#76 /home/logos/Dev/Work/Laravel/e-commerce/vendor/phpunit/phpunit/src/Framework/TestRunner/TestRunner.php(87): PHPUnit\Framework\TestCase->runBare()
#77 /home/logos/Dev/Work/Laravel/e-commerce/vendor/phpunit/phpunit/src/Framework/TestCase.php(361): PHPUnit\Framework\TestRunner->run(Object(P\Tests\Feature\Auth\PasswordResetTest))
#78 /home/logos/Dev/Work/Laravel/e-commerce/vendor/phpunit/phpunit/src/Framework/TestSuite.php(369): PHPUnit\Framework\TestCase->run()
#79 /home/logos/Dev/Work/Laravel/e-commerce/vendor/phpunit/phpunit/src/Framework/TestSuite.php(369): PHPUnit\Framework\TestSuite->run()
#80 /home/logos/Dev/Work/Laravel/e-commerce/vendor/phpunit/phpunit/src/Framework/TestSuite.php(369): PHPUnit\Framework\TestSuite->run()
#81 /home/logos/Dev/Work/Laravel/e-commerce/vendor/phpunit/phpunit/src/TextUI/TestRunner.php(64): PHPUnit\Framework\TestSuite->run()
#82 /home/logos/Dev/Work/Laravel/e-commerce/vendor/phpunit/phpunit/src/TextUI/Application.php(210): PHPUnit\TextUI\TestRunner->run(Object(PHPUnit\TextUI\Configuration\Configuration), Object(PHPUnit\Runner\ResultCache\DefaultResultCache), Object(PHPUnit\Framework\TestSuite))
#83 /home/logos/Dev/Work/Laravel/e-commerce/vendor/pestphp/pest/src/Kernel.php(103): PHPUnit\TextUI\Application->run(Array)
#84 /home/logos/Dev/Work/Laravel/e-commerce/vendor/pestphp/pest/bin/pest(184): Pest\Kernel->handle(Array, Array)
#85 /home/logos/Dev/Work/Laravel/e-commerce/vendor/pestphp/pest/bin/pest(192): {closure:/home/dechasa/Dev/Work/Laravel/e-commerce/vendor/pestphp/pest/bin/pest:18}()
#86 /home/logos/Dev/Work/Laravel/e-commerce/vendor/bin/pest(119): include('/home/dechasa/D...')
#87 {main}

----------------------------------------------------------------------------------

Vite manifest not found at: /home/logos/Dev/Work/Laravel/e-commerce/public/build/manifest.json (View: /home/dechasa/Dev/Work/Laravel/e-commerce/resources/views/app.blade.php)

  at tests/Feature/Auth/PasswordResetTest.php:12
      8▕ 
      9▕ test('reset password link screen can be rendered', function () {
     10▕     $response = $this->get('/forgot-password');
     11▕ 
  ➜  12▕     $response->assertStatus(200);
     13▕ });
     14▕ 
     15▕ test('reset password link can be requested', function () {
     16▕     Notification::fake();

  ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────  
   FAILED  Tests\Feature\Auth\PasswordResetTest > reset password screen can be rendered                                        
  Expected response status code [200] but received 500.
Failed asserting that 500 is identical to 200.

The following exception occurred during the last request:

Illuminate\Foundation\ViteManifestNotFoundException: Vite manifest not found at: /home/logos/Dev/Work/Laravel/e-commerce/public/build/manifest.json in /home/dechasa/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Vite.php:934
Stack trace:
#0 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Vite.php(384): Illuminate\Foundation\Vite->manifest('build')
#1 /home/logos/Dev/Work/Laravel/e-commerce/storage/framework/views/b9df1a3ec2d9260315df3e2c00636be7.php(44): Illuminate\Foundation\Vite->__invoke(Object(Illuminate\Support\Collection))
#2 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Filesystem/Filesystem.php(123): require('/home/dechasa/D...')
#3 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Filesystem/Filesystem.php(124): Illuminate\Filesystem\Filesystem::{closure:Illuminate\Filesystem\Filesystem::getRequire():120}()
#4 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/View/Engines/PhpEngine.php(57): Illuminate\Filesystem\Filesystem->getRequire('/home/dechasa/D...', Array)
#5 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/View/Engines/CompilerEngine.php(76): Illuminate\View\Engines\PhpEngine->evaluatePath('/home/dechasa/D...', Array)
#6 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/View/View.php(208): Illuminate\View\Engines\CompilerEngine->get('/home/dechasa/D...', Array)
#7 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/View/View.php(191): Illuminate\View\View->getContents()
#8 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/View/View.php(160): Illuminate\View\View->renderContents()
#9 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Http/Response.php(78): Illuminate\View\View->render()
#10 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Http/Response.php(34): Illuminate\Http\Response->setContent(Object(Illuminate\View\View))
#11 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/ResponseFactory.php(61): Illuminate\Http\Response->__construct(Object(Illuminate\View\View), 200, Array)
#12 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/ResponseFactory.php(91): Illuminate\Routing\ResponseFactory->make(Object(Illuminate\View\View), 200, Array)
#13 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Support/Facades/Facade.php(361): Illuminate\Routing\ResponseFactory->view('app', Array)
#14 /home/logos/Dev/Work/Laravel/e-commerce/vendor/inertiajs/inertia-laravel/src/Response.php(135): Illuminate\Support\Facades\Facade::__callStatic('view', Array)
#15 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/Router.php(906): Inertia\Response->toResponse(Object(Illuminate\Http\Request))
#16 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/Router.php(891): Illuminate\Routing\Router::toResponse(Object(Illuminate\Http\Request), Object(Inertia\Response))
#17 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/Router.php(807): Illuminate\Routing\Router->prepareResponse(Object(Illuminate\Http\Request), Object(Inertia\Response))
#18 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(169): Illuminate\Routing\Router->{closure:Illuminate\Routing\Router::runRouteWithinStack():807}(Object(Illuminate\Http\Request))
#19 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Auth/Middleware/RedirectIfAuthenticated.php(35): Illuminate\Pipeline\Pipeline->{closure:Illuminate\Pipeline\Pipeline::prepareDestination():167}(Object(Illuminate\Http\Request))
#20 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Auth\Middleware\RedirectIfAuthenticated->handle(Object(Illuminate\Http\Request), Object(Closure))
#21 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Http/Middleware/AddLinkHeadersForPreloadedAssets.php(32): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#22 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets->handle(Object(Illuminate\Http\Request), Object(Closure))
#23 /home/logos/Dev/Work/Laravel/e-commerce/vendor/inertiajs/inertia-laravel/src/Middleware.php(100): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#24 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Inertia\Middleware->handle(Object(Illuminate\Http\Request), Object(Closure))
#25 /home/logos/Dev/Work/Laravel/e-commerce/app/Http/Middleware/HandleAppearance.php(21): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#26 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): App\Http\Middleware\HandleAppearance->handle(Object(Illuminate\Http\Request), Object(Closure))
#27 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/Middleware/SubstituteBindings.php(50): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#28 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Routing\Middleware\SubstituteBindings->handle(Object(Illuminate\Http\Request), Object(Closure))
#29 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Http/Middleware/VerifyCsrfToken.php(87): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#30 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Foundation\Http\Middleware\VerifyCsrfToken->handle(Object(Illuminate\Http\Request), Object(Closure))
#31 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/View/Middleware/ShareErrorsFromSession.php(48): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#32 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\View\Middleware\ShareErrorsFromSession->handle(Object(Illuminate\Http\Request), Object(Closure))
#33 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Session/Middleware/StartSession.php(120): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#34 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Session/Middleware/StartSession.php(63): Illuminate\Session\Middleware\StartSession->handleStatefulRequest(Object(Illuminate\Http\Request), Object(Illuminate\Session\Store), Object(Closure))
#35 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Session\Middleware\StartSession->handle(Object(Illuminate\Http\Request), Object(Closure))
#36 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Cookie/Middleware/AddQueuedCookiesToResponse.php(36): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#37 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse->handle(Object(Illuminate\Http\Request), Object(Closure))
#38 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Cookie/Middleware/EncryptCookies.php(74): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#39 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Cookie\Middleware\EncryptCookies->handle(Object(Illuminate\Http\Request), Object(Closure))
#40 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(126): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#41 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/Router.php(807): Illuminate\Pipeline\Pipeline->then(Object(Closure))
#42 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/Router.php(786): Illuminate\Routing\Router->runRouteWithinStack(Object(Illuminate\Routing\Route), Object(Illuminate\Http\Request))
#43 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/Router.php(750): Illuminate\Routing\Router->runRoute(Object(Illuminate\Http\Request), Object(Illuminate\Routing\Route))
#44 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/Router.php(739): Illuminate\Routing\Router->dispatchToRoute(Object(Illuminate\Http\Request))
#45 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Http/Kernel.php(200): Illuminate\Routing\Router->dispatch(Object(Illuminate\Http\Request))
#46 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(169): Illuminate\Foundation\Http\Kernel->{closure:Illuminate\Foundation\Http\Kernel::dispatchToRouter():197}(Object(Illuminate\Http\Request))
#47 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Http/Middleware/TransformsRequest.php(21): Illuminate\Pipeline\Pipeline->{closure:Illuminate\Pipeline\Pipeline::prepareDestination():167}(Object(Illuminate\Http\Request))
#48 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Http/Middleware/ConvertEmptyStringsToNull.php(31): Illuminate\Foundation\Http\Middleware\TransformsRequest->handle(Object(Illuminate\Http\Request), Object(Closure))
#49 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Foundation\Http\Middleware\ConvertEmptyStringsToNull->handle(Object(Illuminate\Http\Request), Object(Closure))
#50 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Http/Middleware/TransformsRequest.php(21): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#51 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Http/Middleware/TrimStrings.php(51): Illuminate\Foundation\Http\Middleware\TransformsRequest->handle(Object(Illuminate\Http\Request), Object(Closure))
#52 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Foundation\Http\Middleware\TrimStrings->handle(Object(Illuminate\Http\Request), Object(Closure))
#53 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Http/Middleware/ValidatePostSize.php(27): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#54 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Http\Middleware\ValidatePostSize->handle(Object(Illuminate\Http\Request), Object(Closure))
#55 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Http/Middleware/PreventRequestsDuringMaintenance.php(109): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#56 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Foundation\Http\Middleware\PreventRequestsDuringMaintenance->handle(Object(Illuminate\Http\Request), Object(Closure))
#57 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Http/Middleware/HandleCors.php(48): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#58 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Http\Middleware\HandleCors->handle(Object(Illuminate\Http\Request), Object(Closure))
#59 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Http/Middleware/TrustProxies.php(58): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#60 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Http\Middleware\TrustProxies->handle(Object(Illuminate\Http\Request), Object(Closure))
#61 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Http/Middleware/InvokeDeferredCallbacks.php(22): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#62 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Foundation\Http\Middleware\InvokeDeferredCallbacks->handle(Object(Illuminate\Http\Request), Object(Closure))
#63 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Http/Middleware/ValidatePathEncoding.php(26): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#64 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Http\Middleware\ValidatePathEncoding->handle(Object(Illuminate\Http\Request), Object(Closure))
#65 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(126): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#66 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Http/Kernel.php(175): Illuminate\Pipeline\Pipeline->then(Object(Closure))
#67 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Http/Kernel.php(144): Illuminate\Foundation\Http\Kernel->sendRequestThroughRouter(Object(Illuminate\Http\Request))
#68 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Testing/Concerns/MakesHttpRequests.php(607): Illuminate\Foundation\Http\Kernel->handle(Object(Illuminate\Http\Request))
#69 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Testing/Concerns/MakesHttpRequests.php(368): Illuminate\Foundation\Testing\TestCase->call('GET', '/reset-password...', Array, Array, Array, Array)
#70 /home/logos/Dev/Work/Laravel/e-commerce/tests/Feature/Auth/PasswordResetTest.php(33): Illuminate\Foundation\Testing\TestCase->get('/reset-password...')
#71 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Support/Testing/Fakes/NotificationFake.php(257): P\Tests\Feature\Auth\PasswordResetTest->{closure:{closure:/home/dechasa/Dev/Work/Laravel/e-commerce/tests/Feature/Auth/PasswordResetTest.php:25}:32}(Object(Illuminate\Auth\Notifications\ResetPassword), Array, Object(App\Models\User), NULL)
#72 [internal function]: Illuminate\Support\Testing\Fakes\NotificationFake->{closure:Illuminate\Support\Testing\Fakes\NotificationFake::sent():257}(Array, 0)
#73 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Collections/Arr.php(1119): array_filter(Array, Object(Closure), 1)
#74 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Collections/Collection.php(404): Illuminate\Support\Arr::where(Array, Object(Closure))
#75 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Support/Testing/Fakes/NotificationFake.php(256): Illuminate\Support\Collection->filter(Object(Closure))
#76 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Support/Testing/Fakes/NotificationFake.php(90): Illuminate\Support\Testing\Fakes\NotificationFake->sent(Object(App\Models\User), 'Illuminate\\Auth...', Object(Closure))
#77 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Support/Facades/Facade.php(361): Illuminate\Support\Testing\Fakes\NotificationFake->assertSentTo(Object(App\Models\User), 'Illuminate\\Auth...', Object(Closure))
#78 /home/logos/Dev/Work/Laravel/e-commerce/tests/Feature/Auth/PasswordResetTest.php(32): Illuminate\Support\Facades\Facade::__callStatic('assertSentTo', Array)
#79 /home/logos/Dev/Work/Laravel/e-commerce/vendor/pestphp/pest/src/Factories/TestCaseMethodFactory.php(168): P\Tests\Feature\Auth\PasswordResetTest->{closure:/home/dechasa/Dev/Work/Laravel/e-commerce/tests/Feature/Auth/PasswordResetTest.php:25}()
#80 [internal function]: P\Tests\Feature\Auth\PasswordResetTest->{closure:Pest\Factories\TestCaseMethodFactory::getClosure():158}()
#81 /home/logos/Dev/Work/Laravel/e-commerce/vendor/pestphp/pest/src/Concerns/Testable.php(419): call_user_func_array(Object(Closure), Array)
#82 /home/logos/Dev/Work/Laravel/e-commerce/vendor/pestphp/pest/src/Support/ExceptionTrace.php(26): P\Tests\Feature\Auth\PasswordResetTest->{closure:Pest\Concerns\Testable::__callClosure():419}()
#83 /home/logos/Dev/Work/Laravel/e-commerce/vendor/pestphp/pest/src/Concerns/Testable.php(419): Pest\Support\ExceptionTrace::ensure(Object(Closure))
#84 /home/logos/Dev/Work/Laravel/e-commerce/vendor/pestphp/pest/src/Concerns/Testable.php(321): P\Tests\Feature\Auth\PasswordResetTest->__callClosure(Object(Closure), Array)
#85 /home/logos/Dev/Work/Laravel/e-commerce/vendor/pestphp/pest/src/Factories/TestCaseFactory.php(169) : eval()'d code(35): P\Tests\Feature\Auth\PasswordResetTest->__runTest(Object(Closure))
#86 /home/logos/Dev/Work/Laravel/e-commerce/vendor/phpunit/phpunit/src/Framework/TestCase.php(1240): P\Tests\Feature\Auth\PasswordResetTest->__pest_evaluable_reset_password_screen_can_be_rendered()
#87 /home/logos/Dev/Work/Laravel/e-commerce/vendor/phpunit/phpunit/src/Framework/TestCase.php(514): PHPUnit\Framework\TestCase->runTest()
#88 /home/logos/Dev/Work/Laravel/e-commerce/vendor/phpunit/phpunit/src/Framework/TestRunner/TestRunner.php(87): PHPUnit\Framework\TestCase->runBare()
#89 /home/logos/Dev/Work/Laravel/e-commerce/vendor/phpunit/phpunit/src/Framework/TestCase.php(361): PHPUnit\Framework\TestRunner->run(Object(P\Tests\Feature\Auth\PasswordResetTest))
#90 /home/logos/Dev/Work/Laravel/e-commerce/vendor/phpunit/phpunit/src/Framework/TestSuite.php(369): PHPUnit\Framework\TestCase->run()
#91 /home/logos/Dev/Work/Laravel/e-commerce/vendor/phpunit/phpunit/src/Framework/TestSuite.php(369): PHPUnit\Framework\TestSuite->run()
#92 /home/logos/Dev/Work/Laravel/e-commerce/vendor/phpunit/phpunit/src/Framework/TestSuite.php(369): PHPUnit\Framework\TestSuite->run()
#93 /home/logos/Dev/Work/Laravel/e-commerce/vendor/phpunit/phpunit/src/TextUI/TestRunner.php(64): PHPUnit\Framework\TestSuite->run()
#94 /home/logos/Dev/Work/Laravel/e-commerce/vendor/phpunit/phpunit/src/TextUI/Application.php(210): PHPUnit\TextUI\TestRunner->run(Object(PHPUnit\TextUI\Configuration\Configuration), Object(PHPUnit\Runner\ResultCache\DefaultResultCache), Object(PHPUnit\Framework\TestSuite))
#95 /home/logos/Dev/Work/Laravel/e-commerce/vendor/pestphp/pest/src/Kernel.php(103): PHPUnit\TextUI\Application->run(Array)
#96 /home/logos/Dev/Work/Laravel/e-commerce/vendor/pestphp/pest/bin/pest(184): Pest\Kernel->handle(Array, Array)
#97 /home/logos/Dev/Work/Laravel/e-commerce/vendor/pestphp/pest/bin/pest(192): {closure:/home/dechasa/Dev/Work/Laravel/e-commerce/vendor/pestphp/pest/bin/pest:18}()
#98 /home/logos/Dev/Work/Laravel/e-commerce/vendor/bin/pest(119): include('/home/dechasa/D...')
#99 {main}

Next Illuminate\View\ViewException: Vite manifest not found at: /home/logos/Dev/Work/Laravel/e-commerce/public/build/manifest.json (View: /home/dechasa/Dev/Work/Laravel/e-commerce/resources/views/app.blade.php) in /home/dechasa/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Vite.php:934
Stack trace:
#0 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/View/Engines/PhpEngine.php(59): Illuminate\View\Engines\CompilerEngine->handleViewException(Object(Illuminate\Foundation\ViteManifestNotFoundException), 2)
#1 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/View/Engines/CompilerEngine.php(76): Illuminate\View\Engines\PhpEngine->evaluatePath('/home/dechasa/D...', Array)
#2 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/View/View.php(208): Illuminate\View\Engines\CompilerEngine->get('/home/dechasa/D...', Array)
#3 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/View/View.php(191): Illuminate\View\View->getContents()
#4 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/View/View.php(160): Illuminate\View\View->renderContents()
#5 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Http/Response.php(78): Illuminate\View\View->render()
#6 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Http/Response.php(34): Illuminate\Http\Response->setContent(Object(Illuminate\View\View))
#7 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/ResponseFactory.php(61): Illuminate\Http\Response->__construct(Object(Illuminate\View\View), 200, Array)
#8 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/ResponseFactory.php(91): Illuminate\Routing\ResponseFactory->make(Object(Illuminate\View\View), 200, Array)
#9 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Support/Facades/Facade.php(361): Illuminate\Routing\ResponseFactory->view('app', Array)
#10 /home/logos/Dev/Work/Laravel/e-commerce/vendor/inertiajs/inertia-laravel/src/Response.php(135): Illuminate\Support\Facades\Facade::__callStatic('view', Array)
#11 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/Router.php(906): Inertia\Response->toResponse(Object(Illuminate\Http\Request))
#12 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/Router.php(891): Illuminate\Routing\Router::toResponse(Object(Illuminate\Http\Request), Object(Inertia\Response))
#13 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/Router.php(807): Illuminate\Routing\Router->prepareResponse(Object(Illuminate\Http\Request), Object(Inertia\Response))
#14 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(169): Illuminate\Routing\Router->{closure:Illuminate\Routing\Router::runRouteWithinStack():807}(Object(Illuminate\Http\Request))
#15 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Auth/Middleware/RedirectIfAuthenticated.php(35): Illuminate\Pipeline\Pipeline->{closure:Illuminate\Pipeline\Pipeline::prepareDestination():167}(Object(Illuminate\Http\Request))
#16 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Auth\Middleware\RedirectIfAuthenticated->handle(Object(Illuminate\Http\Request), Object(Closure))
#17 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Http/Middleware/AddLinkHeadersForPreloadedAssets.php(32): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#18 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets->handle(Object(Illuminate\Http\Request), Object(Closure))
#19 /home/logos/Dev/Work/Laravel/e-commerce/vendor/inertiajs/inertia-laravel/src/Middleware.php(100): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#20 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Inertia\Middleware->handle(Object(Illuminate\Http\Request), Object(Closure))
#21 /home/logos/Dev/Work/Laravel/e-commerce/app/Http/Middleware/HandleAppearance.php(21): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#22 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): App\Http\Middleware\HandleAppearance->handle(Object(Illuminate\Http\Request), Object(Closure))
#23 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/Middleware/SubstituteBindings.php(50): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#24 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Routing\Middleware\SubstituteBindings->handle(Object(Illuminate\Http\Request), Object(Closure))
#25 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Http/Middleware/VerifyCsrfToken.php(87): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#26 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Foundation\Http\Middleware\VerifyCsrfToken->handle(Object(Illuminate\Http\Request), Object(Closure))
#27 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/View/Middleware/ShareErrorsFromSession.php(48): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#28 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\View\Middleware\ShareErrorsFromSession->handle(Object(Illuminate\Http\Request), Object(Closure))
#29 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Session/Middleware/StartSession.php(120): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#30 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Session/Middleware/StartSession.php(63): Illuminate\Session\Middleware\StartSession->handleStatefulRequest(Object(Illuminate\Http\Request), Object(Illuminate\Session\Store), Object(Closure))
#31 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Session\Middleware\StartSession->handle(Object(Illuminate\Http\Request), Object(Closure))
#32 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Cookie/Middleware/AddQueuedCookiesToResponse.php(36): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#33 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse->handle(Object(Illuminate\Http\Request), Object(Closure))
#34 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Cookie/Middleware/EncryptCookies.php(74): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#35 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Cookie\Middleware\EncryptCookies->handle(Object(Illuminate\Http\Request), Object(Closure))
#36 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(126): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#37 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/Router.php(807): Illuminate\Pipeline\Pipeline->then(Object(Closure))
#38 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/Router.php(786): Illuminate\Routing\Router->runRouteWithinStack(Object(Illuminate\Routing\Route), Object(Illuminate\Http\Request))
#39 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/Router.php(750): Illuminate\Routing\Router->runRoute(Object(Illuminate\Http\Request), Object(Illuminate\Routing\Route))
#40 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/Router.php(739): Illuminate\Routing\Router->dispatchToRoute(Object(Illuminate\Http\Request))
#41 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Http/Kernel.php(200): Illuminate\Routing\Router->dispatch(Object(Illuminate\Http\Request))
#42 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(169): Illuminate\Foundation\Http\Kernel->{closure:Illuminate\Foundation\Http\Kernel::dispatchToRouter():197}(Object(Illuminate\Http\Request))
#43 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Http/Middleware/TransformsRequest.php(21): Illuminate\Pipeline\Pipeline->{closure:Illuminate\Pipeline\Pipeline::prepareDestination():167}(Object(Illuminate\Http\Request))
#44 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Http/Middleware/ConvertEmptyStringsToNull.php(31): Illuminate\Foundation\Http\Middleware\TransformsRequest->handle(Object(Illuminate\Http\Request), Object(Closure))
#45 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Foundation\Http\Middleware\ConvertEmptyStringsToNull->handle(Object(Illuminate\Http\Request), Object(Closure))
#46 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Http/Middleware/TransformsRequest.php(21): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#47 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Http/Middleware/TrimStrings.php(51): Illuminate\Foundation\Http\Middleware\TransformsRequest->handle(Object(Illuminate\Http\Request), Object(Closure))
#48 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Foundation\Http\Middleware\TrimStrings->handle(Object(Illuminate\Http\Request), Object(Closure))
#49 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Http/Middleware/ValidatePostSize.php(27): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#50 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Http\Middleware\ValidatePostSize->handle(Object(Illuminate\Http\Request), Object(Closure))
#51 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Http/Middleware/PreventRequestsDuringMaintenance.php(109): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#52 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Foundation\Http\Middleware\PreventRequestsDuringMaintenance->handle(Object(Illuminate\Http\Request), Object(Closure))
#53 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Http/Middleware/HandleCors.php(48): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#54 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Http\Middleware\HandleCors->handle(Object(Illuminate\Http\Request), Object(Closure))
#55 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Http/Middleware/TrustProxies.php(58): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#56 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Http\Middleware\TrustProxies->handle(Object(Illuminate\Http\Request), Object(Closure))
#57 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Http/Middleware/InvokeDeferredCallbacks.php(22): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#58 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Foundation\Http\Middleware\InvokeDeferredCallbacks->handle(Object(Illuminate\Http\Request), Object(Closure))
#59 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Http/Middleware/ValidatePathEncoding.php(26): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#60 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Http\Middleware\ValidatePathEncoding->handle(Object(Illuminate\Http\Request), Object(Closure))
#61 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(126): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#62 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Http/Kernel.php(175): Illuminate\Pipeline\Pipeline->then(Object(Closure))
#63 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Http/Kernel.php(144): Illuminate\Foundation\Http\Kernel->sendRequestThroughRouter(Object(Illuminate\Http\Request))
#64 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Testing/Concerns/MakesHttpRequests.php(607): Illuminate\Foundation\Http\Kernel->handle(Object(Illuminate\Http\Request))
#65 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Testing/Concerns/MakesHttpRequests.php(368): Illuminate\Foundation\Testing\TestCase->call('GET', '/reset-password...', Array, Array, Array, Array)
#66 /home/logos/Dev/Work/Laravel/e-commerce/tests/Feature/Auth/PasswordResetTest.php(33): Illuminate\Foundation\Testing\TestCase->get('/reset-password...')
#67 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Support/Testing/Fakes/NotificationFake.php(257): P\Tests\Feature\Auth\PasswordResetTest->{closure:{closure:/home/dechasa/Dev/Work/Laravel/e-commerce/tests/Feature/Auth/PasswordResetTest.php:25}:32}(Object(Illuminate\Auth\Notifications\ResetPassword), Array, Object(App\Models\User), NULL)
#68 [internal function]: Illuminate\Support\Testing\Fakes\NotificationFake->{closure:Illuminate\Support\Testing\Fakes\NotificationFake::sent():257}(Array, 0)
#69 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Collections/Arr.php(1119): array_filter(Array, Object(Closure), 1)
#70 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Collections/Collection.php(404): Illuminate\Support\Arr::where(Array, Object(Closure))
#71 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Support/Testing/Fakes/NotificationFake.php(256): Illuminate\Support\Collection->filter(Object(Closure))
#72 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Support/Testing/Fakes/NotificationFake.php(90): Illuminate\Support\Testing\Fakes\NotificationFake->sent(Object(App\Models\User), 'Illuminate\\Auth...', Object(Closure))
#73 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Support/Facades/Facade.php(361): Illuminate\Support\Testing\Fakes\NotificationFake->assertSentTo(Object(App\Models\User), 'Illuminate\\Auth...', Object(Closure))
#74 /home/logos/Dev/Work/Laravel/e-commerce/tests/Feature/Auth/PasswordResetTest.php(32): Illuminate\Support\Facades\Facade::__callStatic('assertSentTo', Array)
#75 /home/logos/Dev/Work/Laravel/e-commerce/vendor/pestphp/pest/src/Factories/TestCaseMethodFactory.php(168): P\Tests\Feature\Auth\PasswordResetTest->{closure:/home/dechasa/Dev/Work/Laravel/e-commerce/tests/Feature/Auth/PasswordResetTest.php:25}()
#76 [internal function]: P\Tests\Feature\Auth\PasswordResetTest->{closure:Pest\Factories\TestCaseMethodFactory::getClosure():158}()
#77 /home/logos/Dev/Work/Laravel/e-commerce/vendor/pestphp/pest/src/Concerns/Testable.php(419): call_user_func_array(Object(Closure), Array)
#78 /home/logos/Dev/Work/Laravel/e-commerce/vendor/pestphp/pest/src/Support/ExceptionTrace.php(26): P\Tests\Feature\Auth\PasswordResetTest->{closure:Pest\Concerns\Testable::__callClosure():419}()
#79 /home/logos/Dev/Work/Laravel/e-commerce/vendor/pestphp/pest/src/Concerns/Testable.php(419): Pest\Support\ExceptionTrace::ensure(Object(Closure))
#80 /home/logos/Dev/Work/Laravel/e-commerce/vendor/pestphp/pest/src/Concerns/Testable.php(321): P\Tests\Feature\Auth\PasswordResetTest->__callClosure(Object(Closure), Array)
#81 /home/logos/Dev/Work/Laravel/e-commerce/vendor/pestphp/pest/src/Factories/TestCaseFactory.php(169) : eval()'d code(35): P\Tests\Feature\Auth\PasswordResetTest->__runTest(Object(Closure))
#82 /home/logos/Dev/Work/Laravel/e-commerce/vendor/phpunit/phpunit/src/Framework/TestCase.php(1240): P\Tests\Feature\Auth\PasswordResetTest->__pest_evaluable_reset_password_screen_can_be_rendered()
#83 /home/logos/Dev/Work/Laravel/e-commerce/vendor/phpunit/phpunit/src/Framework/TestCase.php(514): PHPUnit\Framework\TestCase->runTest()
#84 /home/logos/Dev/Work/Laravel/e-commerce/vendor/phpunit/phpunit/src/Framework/TestRunner/TestRunner.php(87): PHPUnit\Framework\TestCase->runBare()
#85 /home/logos/Dev/Work/Laravel/e-commerce/vendor/phpunit/phpunit/src/Framework/TestCase.php(361): PHPUnit\Framework\TestRunner->run(Object(P\Tests\Feature\Auth\PasswordResetTest))
#86 /home/logos/Dev/Work/Laravel/e-commerce/vendor/phpunit/phpunit/src/Framework/TestSuite.php(369): PHPUnit\Framework\TestCase->run()
#87 /home/logos/Dev/Work/Laravel/e-commerce/vendor/phpunit/phpunit/src/Framework/TestSuite.php(369): PHPUnit\Framework\TestSuite->run()
#88 /home/logos/Dev/Work/Laravel/e-commerce/vendor/phpunit/phpunit/src/Framework/TestSuite.php(369): PHPUnit\Framework\TestSuite->run()
#89 /home/logos/Dev/Work/Laravel/e-commerce/vendor/phpunit/phpunit/src/TextUI/TestRunner.php(64): PHPUnit\Framework\TestSuite->run()
#90 /home/logos/Dev/Work/Laravel/e-commerce/vendor/phpunit/phpunit/src/TextUI/Application.php(210): PHPUnit\TextUI\TestRunner->run(Object(PHPUnit\TextUI\Configuration\Configuration), Object(PHPUnit\Runner\ResultCache\DefaultResultCache), Object(PHPUnit\Framework\TestSuite))
#91 /home/logos/Dev/Work/Laravel/e-commerce/vendor/pestphp/pest/src/Kernel.php(103): PHPUnit\TextUI\Application->run(Array)
#92 /home/logos/Dev/Work/Laravel/e-commerce/vendor/pestphp/pest/bin/pest(184): Pest\Kernel->handle(Array, Array)
#93 /home/logos/Dev/Work/Laravel/e-commerce/vendor/pestphp/pest/bin/pest(192): {closure:/home/dechasa/Dev/Work/Laravel/e-commerce/vendor/pestphp/pest/bin/pest:18}()
#94 /home/logos/Dev/Work/Laravel/e-commerce/vendor/bin/pest(119): include('/home/dechasa/D...')
#95 {main}

----------------------------------------------------------------------------------

Vite manifest not found at: /home/logos/Dev/Work/Laravel/e-commerce/public/build/manifest.json (View: /home/dechasa/Dev/Work/Laravel/e-commerce/resources/views/app.blade.php)

  at tests/Feature/Auth/PasswordResetTest.php:35
     31▕ 
     32▕     Notification::assertSentTo($user, ResetPassword::class, function ($notification) {
     33▕         $response = $this->get('/reset-password/'.$notification->token);
     34▕ 
  ➜  35▕         $response->assertStatus(200);
     36▕ 
     37▕         return true;
     38▕     });
     39▕ });

      [2m+6 vendor frames [22m
  7   tests/Feature/Auth/PasswordResetTest.php:32

  ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────  
   FAILED  Tests\Feature\Auth\PasswordResetTest > password can be reset with valid token                                       
  Session has unexpected errors: 

{
    "default": [
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character."
    ]
}
Failed asserting that true is false.

  at tests/Feature/Auth/PasswordResetTest.php:57
     53▕             'password_confirmation' => 'password',
     54▕         ]);
     55▕ 
     56▕         $response
  ➜  57▕             ->assertSessionHasNoErrors()
     58▕             ->assertRedirect(route('login'));
     59▕ 
     60▕         return true;
     61▕     });

      [2m+6 vendor frames [22m
  7   tests/Feature/Auth/PasswordResetTest.php:48

  ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────  
   FAILED  Tests\Feature\Auth\RegistrationTest > registration screen can be rendered                                           
  Expected response status code [200] but received 500.
Failed asserting that 500 is identical to 200.

The following exception occurred during the last request:

Illuminate\Foundation\ViteManifestNotFoundException: Vite manifest not found at: /home/logos/Dev/Work/Laravel/e-commerce/public/build/manifest.json in /home/dechasa/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Vite.php:934
Stack trace:
#0 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Vite.php(384): Illuminate\Foundation\Vite->manifest('build')
#1 /home/logos/Dev/Work/Laravel/e-commerce/storage/framework/views/b9df1a3ec2d9260315df3e2c00636be7.php(44): Illuminate\Foundation\Vite->__invoke(Object(Illuminate\Support\Collection))
#2 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Filesystem/Filesystem.php(123): require('/home/dechasa/D...')
#3 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Filesystem/Filesystem.php(124): Illuminate\Filesystem\Filesystem::{closure:Illuminate\Filesystem\Filesystem::getRequire():120}()
#4 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/View/Engines/PhpEngine.php(57): Illuminate\Filesystem\Filesystem->getRequire('/home/dechasa/D...', Array)
#5 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/View/Engines/CompilerEngine.php(76): Illuminate\View\Engines\PhpEngine->evaluatePath('/home/dechasa/D...', Array)
#6 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/View/View.php(208): Illuminate\View\Engines\CompilerEngine->get('/home/dechasa/D...', Array)
#7 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/View/View.php(191): Illuminate\View\View->getContents()
#8 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/View/View.php(160): Illuminate\View\View->renderContents()
#9 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Http/Response.php(78): Illuminate\View\View->render()
#10 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Http/Response.php(34): Illuminate\Http\Response->setContent(Object(Illuminate\View\View))
#11 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/ResponseFactory.php(61): Illuminate\Http\Response->__construct(Object(Illuminate\View\View), 200, Array)
#12 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/ResponseFactory.php(91): Illuminate\Routing\ResponseFactory->make(Object(Illuminate\View\View), 200, Array)
#13 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Support/Facades/Facade.php(361): Illuminate\Routing\ResponseFactory->view('app', Array)
#14 /home/logos/Dev/Work/Laravel/e-commerce/vendor/inertiajs/inertia-laravel/src/Response.php(135): Illuminate\Support\Facades\Facade::__callStatic('view', Array)
#15 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/Router.php(906): Inertia\Response->toResponse(Object(Illuminate\Http\Request))
#16 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/Router.php(891): Illuminate\Routing\Router::toResponse(Object(Illuminate\Http\Request), Object(Inertia\Response))
#17 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/Router.php(807): Illuminate\Routing\Router->prepareResponse(Object(Illuminate\Http\Request), Object(Inertia\Response))
#18 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(169): Illuminate\Routing\Router->{closure:Illuminate\Routing\Router::runRouteWithinStack():807}(Object(Illuminate\Http\Request))
#19 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Auth/Middleware/RedirectIfAuthenticated.php(35): Illuminate\Pipeline\Pipeline->{closure:Illuminate\Pipeline\Pipeline::prepareDestination():167}(Object(Illuminate\Http\Request))
#20 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Auth\Middleware\RedirectIfAuthenticated->handle(Object(Illuminate\Http\Request), Object(Closure))
#21 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Http/Middleware/AddLinkHeadersForPreloadedAssets.php(32): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#22 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets->handle(Object(Illuminate\Http\Request), Object(Closure))
#23 /home/logos/Dev/Work/Laravel/e-commerce/vendor/inertiajs/inertia-laravel/src/Middleware.php(100): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#24 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Inertia\Middleware->handle(Object(Illuminate\Http\Request), Object(Closure))
#25 /home/logos/Dev/Work/Laravel/e-commerce/app/Http/Middleware/HandleAppearance.php(21): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#26 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): App\Http\Middleware\HandleAppearance->handle(Object(Illuminate\Http\Request), Object(Closure))
#27 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/Middleware/SubstituteBindings.php(50): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#28 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Routing\Middleware\SubstituteBindings->handle(Object(Illuminate\Http\Request), Object(Closure))
#29 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Http/Middleware/VerifyCsrfToken.php(87): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#30 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Foundation\Http\Middleware\VerifyCsrfToken->handle(Object(Illuminate\Http\Request), Object(Closure))
#31 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/View/Middleware/ShareErrorsFromSession.php(48): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#32 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\View\Middleware\ShareErrorsFromSession->handle(Object(Illuminate\Http\Request), Object(Closure))
#33 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Session/Middleware/StartSession.php(120): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#34 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Session/Middleware/StartSession.php(63): Illuminate\Session\Middleware\StartSession->handleStatefulRequest(Object(Illuminate\Http\Request), Object(Illuminate\Session\Store), Object(Closure))
#35 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Session\Middleware\StartSession->handle(Object(Illuminate\Http\Request), Object(Closure))
#36 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Cookie/Middleware/AddQueuedCookiesToResponse.php(36): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#37 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse->handle(Object(Illuminate\Http\Request), Object(Closure))
#38 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Cookie/Middleware/EncryptCookies.php(74): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#39 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Cookie\Middleware\EncryptCookies->handle(Object(Illuminate\Http\Request), Object(Closure))
#40 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(126): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#41 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/Router.php(807): Illuminate\Pipeline\Pipeline->then(Object(Closure))
#42 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/Router.php(786): Illuminate\Routing\Router->runRouteWithinStack(Object(Illuminate\Routing\Route), Object(Illuminate\Http\Request))
#43 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/Router.php(750): Illuminate\Routing\Router->runRoute(Object(Illuminate\Http\Request), Object(Illuminate\Routing\Route))
#44 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/Router.php(739): Illuminate\Routing\Router->dispatchToRoute(Object(Illuminate\Http\Request))
#45 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Http/Kernel.php(200): Illuminate\Routing\Router->dispatch(Object(Illuminate\Http\Request))
#46 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(169): Illuminate\Foundation\Http\Kernel->{closure:Illuminate\Foundation\Http\Kernel::dispatchToRouter():197}(Object(Illuminate\Http\Request))
#47 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Http/Middleware/TransformsRequest.php(21): Illuminate\Pipeline\Pipeline->{closure:Illuminate\Pipeline\Pipeline::prepareDestination():167}(Object(Illuminate\Http\Request))
#48 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Http/Middleware/ConvertEmptyStringsToNull.php(31): Illuminate\Foundation\Http\Middleware\TransformsRequest->handle(Object(Illuminate\Http\Request), Object(Closure))
#49 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Foundation\Http\Middleware\ConvertEmptyStringsToNull->handle(Object(Illuminate\Http\Request), Object(Closure))
#50 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Http/Middleware/TransformsRequest.php(21): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#51 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Http/Middleware/TrimStrings.php(51): Illuminate\Foundation\Http\Middleware\TransformsRequest->handle(Object(Illuminate\Http\Request), Object(Closure))
#52 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Foundation\Http\Middleware\TrimStrings->handle(Object(Illuminate\Http\Request), Object(Closure))
#53 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Http/Middleware/ValidatePostSize.php(27): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#54 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Http\Middleware\ValidatePostSize->handle(Object(Illuminate\Http\Request), Object(Closure))
#55 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Http/Middleware/PreventRequestsDuringMaintenance.php(109): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#56 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Foundation\Http\Middleware\PreventRequestsDuringMaintenance->handle(Object(Illuminate\Http\Request), Object(Closure))
#57 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Http/Middleware/HandleCors.php(48): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#58 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Http\Middleware\HandleCors->handle(Object(Illuminate\Http\Request), Object(Closure))
#59 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Http/Middleware/TrustProxies.php(58): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#60 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Http\Middleware\TrustProxies->handle(Object(Illuminate\Http\Request), Object(Closure))
#61 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Http/Middleware/InvokeDeferredCallbacks.php(22): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#62 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Foundation\Http\Middleware\InvokeDeferredCallbacks->handle(Object(Illuminate\Http\Request), Object(Closure))
#63 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Http/Middleware/ValidatePathEncoding.php(26): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#64 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Http\Middleware\ValidatePathEncoding->handle(Object(Illuminate\Http\Request), Object(Closure))
#65 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(126): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#66 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Http/Kernel.php(175): Illuminate\Pipeline\Pipeline->then(Object(Closure))
#67 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Http/Kernel.php(144): Illuminate\Foundation\Http\Kernel->sendRequestThroughRouter(Object(Illuminate\Http\Request))
#68 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Testing/Concerns/MakesHttpRequests.php(607): Illuminate\Foundation\Http\Kernel->handle(Object(Illuminate\Http\Request))
#69 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Testing/Concerns/MakesHttpRequests.php(368): Illuminate\Foundation\Testing\TestCase->call('GET', '/register', Array, Array, Array, Array)
#70 /home/logos/Dev/Work/Laravel/e-commerce/tests/Feature/Auth/RegistrationTest.php(6): Illuminate\Foundation\Testing\TestCase->get('/register')
#71 /home/logos/Dev/Work/Laravel/e-commerce/vendor/pestphp/pest/src/Factories/TestCaseMethodFactory.php(168): P\Tests\Feature\Auth\RegistrationTest->{closure:/home/dechasa/Dev/Work/Laravel/e-commerce/tests/Feature/Auth/RegistrationTest.php:5}()
#72 [internal function]: P\Tests\Feature\Auth\RegistrationTest->{closure:Pest\Factories\TestCaseMethodFactory::getClosure():158}()
#73 /home/logos/Dev/Work/Laravel/e-commerce/vendor/pestphp/pest/src/Concerns/Testable.php(419): call_user_func_array(Object(Closure), Array)
#74 /home/logos/Dev/Work/Laravel/e-commerce/vendor/pestphp/pest/src/Support/ExceptionTrace.php(26): P\Tests\Feature\Auth\RegistrationTest->{closure:Pest\Concerns\Testable::__callClosure():419}()
#75 /home/logos/Dev/Work/Laravel/e-commerce/vendor/pestphp/pest/src/Concerns/Testable.php(419): Pest\Support\ExceptionTrace::ensure(Object(Closure))
#76 /home/logos/Dev/Work/Laravel/e-commerce/vendor/pestphp/pest/src/Concerns/Testable.php(321): P\Tests\Feature\Auth\RegistrationTest->__callClosure(Object(Closure), Array)
#77 /home/logos/Dev/Work/Laravel/e-commerce/vendor/pestphp/pest/src/Factories/TestCaseFactory.php(169) : eval()'d code(17): P\Tests\Feature\Auth\RegistrationTest->__runTest(Object(Closure))
#78 /home/logos/Dev/Work/Laravel/e-commerce/vendor/phpunit/phpunit/src/Framework/TestCase.php(1240): P\Tests\Feature\Auth\RegistrationTest->__pest_evaluable_registration_screen_can_be_rendered()
#79 /home/logos/Dev/Work/Laravel/e-commerce/vendor/phpunit/phpunit/src/Framework/TestCase.php(514): PHPUnit\Framework\TestCase->runTest()
#80 /home/logos/Dev/Work/Laravel/e-commerce/vendor/phpunit/phpunit/src/Framework/TestRunner/TestRunner.php(87): PHPUnit\Framework\TestCase->runBare()
#81 /home/logos/Dev/Work/Laravel/e-commerce/vendor/phpunit/phpunit/src/Framework/TestCase.php(361): PHPUnit\Framework\TestRunner->run(Object(P\Tests\Feature\Auth\RegistrationTest))
#82 /home/logos/Dev/Work/Laravel/e-commerce/vendor/phpunit/phpunit/src/Framework/TestSuite.php(369): PHPUnit\Framework\TestCase->run()
#83 /home/logos/Dev/Work/Laravel/e-commerce/vendor/phpunit/phpunit/src/Framework/TestSuite.php(369): PHPUnit\Framework\TestSuite->run()
#84 /home/logos/Dev/Work/Laravel/e-commerce/vendor/phpunit/phpunit/src/Framework/TestSuite.php(369): PHPUnit\Framework\TestSuite->run()
#85 /home/logos/Dev/Work/Laravel/e-commerce/vendor/phpunit/phpunit/src/TextUI/TestRunner.php(64): PHPUnit\Framework\TestSuite->run()
#86 /home/logos/Dev/Work/Laravel/e-commerce/vendor/phpunit/phpunit/src/TextUI/Application.php(210): PHPUnit\TextUI\TestRunner->run(Object(PHPUnit\TextUI\Configuration\Configuration), Object(PHPUnit\Runner\ResultCache\DefaultResultCache), Object(PHPUnit\Framework\TestSuite))
#87 /home/logos/Dev/Work/Laravel/e-commerce/vendor/pestphp/pest/src/Kernel.php(103): PHPUnit\TextUI\Application->run(Array)
#88 /home/logos/Dev/Work/Laravel/e-commerce/vendor/pestphp/pest/bin/pest(184): Pest\Kernel->handle(Array, Array)
#89 /home/logos/Dev/Work/Laravel/e-commerce/vendor/pestphp/pest/bin/pest(192): {closure:/home/dechasa/Dev/Work/Laravel/e-commerce/vendor/pestphp/pest/bin/pest:18}()
#90 /home/logos/Dev/Work/Laravel/e-commerce/vendor/bin/pest(119): include('/home/dechasa/D...')
#91 {main}

Next Illuminate\View\ViewException: Vite manifest not found at: /home/logos/Dev/Work/Laravel/e-commerce/public/build/manifest.json (View: /home/dechasa/Dev/Work/Laravel/e-commerce/resources/views/app.blade.php) in /home/dechasa/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Vite.php:934
Stack trace:
#0 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/View/Engines/PhpEngine.php(59): Illuminate\View\Engines\CompilerEngine->handleViewException(Object(Illuminate\Foundation\ViteManifestNotFoundException), 2)
#1 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/View/Engines/CompilerEngine.php(76): Illuminate\View\Engines\PhpEngine->evaluatePath('/home/dechasa/D...', Array)
#2 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/View/View.php(208): Illuminate\View\Engines\CompilerEngine->get('/home/dechasa/D...', Array)
#3 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/View/View.php(191): Illuminate\View\View->getContents()
#4 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/View/View.php(160): Illuminate\View\View->renderContents()
#5 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Http/Response.php(78): Illuminate\View\View->render()
#6 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Http/Response.php(34): Illuminate\Http\Response->setContent(Object(Illuminate\View\View))
#7 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/ResponseFactory.php(61): Illuminate\Http\Response->__construct(Object(Illuminate\View\View), 200, Array)
#8 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/ResponseFactory.php(91): Illuminate\Routing\ResponseFactory->make(Object(Illuminate\View\View), 200, Array)
#9 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Support/Facades/Facade.php(361): Illuminate\Routing\ResponseFactory->view('app', Array)
#10 /home/logos/Dev/Work/Laravel/e-commerce/vendor/inertiajs/inertia-laravel/src/Response.php(135): Illuminate\Support\Facades\Facade::__callStatic('view', Array)
#11 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/Router.php(906): Inertia\Response->toResponse(Object(Illuminate\Http\Request))
#12 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/Router.php(891): Illuminate\Routing\Router::toResponse(Object(Illuminate\Http\Request), Object(Inertia\Response))
#13 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/Router.php(807): Illuminate\Routing\Router->prepareResponse(Object(Illuminate\Http\Request), Object(Inertia\Response))
#14 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(169): Illuminate\Routing\Router->{closure:Illuminate\Routing\Router::runRouteWithinStack():807}(Object(Illuminate\Http\Request))
#15 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Auth/Middleware/RedirectIfAuthenticated.php(35): Illuminate\Pipeline\Pipeline->{closure:Illuminate\Pipeline\Pipeline::prepareDestination():167}(Object(Illuminate\Http\Request))
#16 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Auth\Middleware\RedirectIfAuthenticated->handle(Object(Illuminate\Http\Request), Object(Closure))
#17 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Http/Middleware/AddLinkHeadersForPreloadedAssets.php(32): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#18 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets->handle(Object(Illuminate\Http\Request), Object(Closure))
#19 /home/logos/Dev/Work/Laravel/e-commerce/vendor/inertiajs/inertia-laravel/src/Middleware.php(100): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#20 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Inertia\Middleware->handle(Object(Illuminate\Http\Request), Object(Closure))
#21 /home/logos/Dev/Work/Laravel/e-commerce/app/Http/Middleware/HandleAppearance.php(21): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#22 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): App\Http\Middleware\HandleAppearance->handle(Object(Illuminate\Http\Request), Object(Closure))
#23 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/Middleware/SubstituteBindings.php(50): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#24 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Routing\Middleware\SubstituteBindings->handle(Object(Illuminate\Http\Request), Object(Closure))
#25 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Http/Middleware/VerifyCsrfToken.php(87): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#26 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Foundation\Http\Middleware\VerifyCsrfToken->handle(Object(Illuminate\Http\Request), Object(Closure))
#27 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/View/Middleware/ShareErrorsFromSession.php(48): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#28 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\View\Middleware\ShareErrorsFromSession->handle(Object(Illuminate\Http\Request), Object(Closure))
#29 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Session/Middleware/StartSession.php(120): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#30 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Session/Middleware/StartSession.php(63): Illuminate\Session\Middleware\StartSession->handleStatefulRequest(Object(Illuminate\Http\Request), Object(Illuminate\Session\Store), Object(Closure))
#31 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Session\Middleware\StartSession->handle(Object(Illuminate\Http\Request), Object(Closure))
#32 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Cookie/Middleware/AddQueuedCookiesToResponse.php(36): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#33 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse->handle(Object(Illuminate\Http\Request), Object(Closure))
#34 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Cookie/Middleware/EncryptCookies.php(74): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#35 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Cookie\Middleware\EncryptCookies->handle(Object(Illuminate\Http\Request), Object(Closure))
#36 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(126): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#37 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/Router.php(807): Illuminate\Pipeline\Pipeline->then(Object(Closure))
#38 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/Router.php(786): Illuminate\Routing\Router->runRouteWithinStack(Object(Illuminate\Routing\Route), Object(Illuminate\Http\Request))
#39 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/Router.php(750): Illuminate\Routing\Router->runRoute(Object(Illuminate\Http\Request), Object(Illuminate\Routing\Route))
#40 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/Router.php(739): Illuminate\Routing\Router->dispatchToRoute(Object(Illuminate\Http\Request))
#41 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Http/Kernel.php(200): Illuminate\Routing\Router->dispatch(Object(Illuminate\Http\Request))
#42 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(169): Illuminate\Foundation\Http\Kernel->{closure:Illuminate\Foundation\Http\Kernel::dispatchToRouter():197}(Object(Illuminate\Http\Request))
#43 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Http/Middleware/TransformsRequest.php(21): Illuminate\Pipeline\Pipeline->{closure:Illuminate\Pipeline\Pipeline::prepareDestination():167}(Object(Illuminate\Http\Request))
#44 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Http/Middleware/ConvertEmptyStringsToNull.php(31): Illuminate\Foundation\Http\Middleware\TransformsRequest->handle(Object(Illuminate\Http\Request), Object(Closure))
#45 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Foundation\Http\Middleware\ConvertEmptyStringsToNull->handle(Object(Illuminate\Http\Request), Object(Closure))
#46 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Http/Middleware/TransformsRequest.php(21): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#47 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Http/Middleware/TrimStrings.php(51): Illuminate\Foundation\Http\Middleware\TransformsRequest->handle(Object(Illuminate\Http\Request), Object(Closure))
#48 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Foundation\Http\Middleware\TrimStrings->handle(Object(Illuminate\Http\Request), Object(Closure))
#49 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Http/Middleware/ValidatePostSize.php(27): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#50 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Http\Middleware\ValidatePostSize->handle(Object(Illuminate\Http\Request), Object(Closure))
#51 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Http/Middleware/PreventRequestsDuringMaintenance.php(109): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#52 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Foundation\Http\Middleware\PreventRequestsDuringMaintenance->handle(Object(Illuminate\Http\Request), Object(Closure))
#53 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Http/Middleware/HandleCors.php(48): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#54 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Http\Middleware\HandleCors->handle(Object(Illuminate\Http\Request), Object(Closure))
#55 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Http/Middleware/TrustProxies.php(58): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#56 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Http\Middleware\TrustProxies->handle(Object(Illuminate\Http\Request), Object(Closure))
#57 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Http/Middleware/InvokeDeferredCallbacks.php(22): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#58 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Foundation\Http\Middleware\InvokeDeferredCallbacks->handle(Object(Illuminate\Http\Request), Object(Closure))
#59 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Http/Middleware/ValidatePathEncoding.php(26): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#60 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Http\Middleware\ValidatePathEncoding->handle(Object(Illuminate\Http\Request), Object(Closure))
#61 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(126): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#62 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Http/Kernel.php(175): Illuminate\Pipeline\Pipeline->then(Object(Closure))
#63 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Http/Kernel.php(144): Illuminate\Foundation\Http\Kernel->sendRequestThroughRouter(Object(Illuminate\Http\Request))
#64 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Testing/Concerns/MakesHttpRequests.php(607): Illuminate\Foundation\Http\Kernel->handle(Object(Illuminate\Http\Request))
#65 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Testing/Concerns/MakesHttpRequests.php(368): Illuminate\Foundation\Testing\TestCase->call('GET', '/register', Array, Array, Array, Array)
#66 /home/logos/Dev/Work/Laravel/e-commerce/tests/Feature/Auth/RegistrationTest.php(6): Illuminate\Foundation\Testing\TestCase->get('/register')
#67 /home/logos/Dev/Work/Laravel/e-commerce/vendor/pestphp/pest/src/Factories/TestCaseMethodFactory.php(168): P\Tests\Feature\Auth\RegistrationTest->{closure:/home/dechasa/Dev/Work/Laravel/e-commerce/tests/Feature/Auth/RegistrationTest.php:5}()
#68 [internal function]: P\Tests\Feature\Auth\RegistrationTest->{closure:Pest\Factories\TestCaseMethodFactory::getClosure():158}()
#69 /home/logos/Dev/Work/Laravel/e-commerce/vendor/pestphp/pest/src/Concerns/Testable.php(419): call_user_func_array(Object(Closure), Array)
#70 /home/logos/Dev/Work/Laravel/e-commerce/vendor/pestphp/pest/src/Support/ExceptionTrace.php(26): P\Tests\Feature\Auth\RegistrationTest->{closure:Pest\Concerns\Testable::__callClosure():419}()
#71 /home/logos/Dev/Work/Laravel/e-commerce/vendor/pestphp/pest/src/Concerns/Testable.php(419): Pest\Support\ExceptionTrace::ensure(Object(Closure))
#72 /home/logos/Dev/Work/Laravel/e-commerce/vendor/pestphp/pest/src/Concerns/Testable.php(321): P\Tests\Feature\Auth\RegistrationTest->__callClosure(Object(Closure), Array)
#73 /home/logos/Dev/Work/Laravel/e-commerce/vendor/pestphp/pest/src/Factories/TestCaseFactory.php(169) : eval()'d code(17): P\Tests\Feature\Auth\RegistrationTest->__runTest(Object(Closure))
#74 /home/logos/Dev/Work/Laravel/e-commerce/vendor/phpunit/phpunit/src/Framework/TestCase.php(1240): P\Tests\Feature\Auth\RegistrationTest->__pest_evaluable_registration_screen_can_be_rendered()
#75 /home/logos/Dev/Work/Laravel/e-commerce/vendor/phpunit/phpunit/src/Framework/TestCase.php(514): PHPUnit\Framework\TestCase->runTest()
#76 /home/logos/Dev/Work/Laravel/e-commerce/vendor/phpunit/phpunit/src/Framework/TestRunner/TestRunner.php(87): PHPUnit\Framework\TestCase->runBare()
#77 /home/logos/Dev/Work/Laravel/e-commerce/vendor/phpunit/phpunit/src/Framework/TestCase.php(361): PHPUnit\Framework\TestRunner->run(Object(P\Tests\Feature\Auth\RegistrationTest))
#78 /home/logos/Dev/Work/Laravel/e-commerce/vendor/phpunit/phpunit/src/Framework/TestSuite.php(369): PHPUnit\Framework\TestCase->run()
#79 /home/logos/Dev/Work/Laravel/e-commerce/vendor/phpunit/phpunit/src/Framework/TestSuite.php(369): PHPUnit\Framework\TestSuite->run()
#80 /home/logos/Dev/Work/Laravel/e-commerce/vendor/phpunit/phpunit/src/Framework/TestSuite.php(369): PHPUnit\Framework\TestSuite->run()
#81 /home/logos/Dev/Work/Laravel/e-commerce/vendor/phpunit/phpunit/src/TextUI/TestRunner.php(64): PHPUnit\Framework\TestSuite->run()
#82 /home/logos/Dev/Work/Laravel/e-commerce/vendor/phpunit/phpunit/src/TextUI/Application.php(210): PHPUnit\TextUI\TestRunner->run(Object(PHPUnit\TextUI\Configuration\Configuration), Object(PHPUnit\Runner\ResultCache\DefaultResultCache), Object(PHPUnit\Framework\TestSuite))
#83 /home/logos/Dev/Work/Laravel/e-commerce/vendor/pestphp/pest/src/Kernel.php(103): PHPUnit\TextUI\Application->run(Array)
#84 /home/logos/Dev/Work/Laravel/e-commerce/vendor/pestphp/pest/bin/pest(184): Pest\Kernel->handle(Array, Array)
#85 /home/logos/Dev/Work/Laravel/e-commerce/vendor/pestphp/pest/bin/pest(192): {closure:/home/dechasa/Dev/Work/Laravel/e-commerce/vendor/pestphp/pest/bin/pest:18}()
#86 /home/logos/Dev/Work/Laravel/e-commerce/vendor/bin/pest(119): include('/home/dechasa/D...')
#87 {main}

----------------------------------------------------------------------------------

Vite manifest not found at: /home/logos/Dev/Work/Laravel/e-commerce/public/build/manifest.json (View: /home/dechasa/Dev/Work/Laravel/e-commerce/resources/views/app.blade.php)

  at tests/Feature/Auth/RegistrationTest.php:8
      4▕ 
      5▕ test('registration screen can be rendered', function () {
      6▕     $response = $this->get('/register');
      7▕ 
  ➜   8▕     $response->assertStatus(200);
      9▕ });
     10▕ 
     11▕ test('new users can register', function () {
     12▕     $response = $this->post('/register', [

  ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────  
   FAILED  Tests\Feature\Auth\RegistrationTest > new users can register                                                        
  The user is not authenticated
Failed asserting that false is true.

  at tests/Feature/Auth/RegistrationTest.php:19
     15▕         'password' => 'password',
     16▕         'password_confirmation' => 'password',
     17▕     ]);
     18▕ 
  ➜  19▕     $this->assertAuthenticated();
     20▕     $response->assertRedirect(route('dashboard', absolute: false));
     21▕ });

  ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────  
   FAILED  Tests\Feature\DashboardTest > authenticated users can visit the dashboard                                           
  Expected response status code [200] but received 500.
Failed asserting that 500 is identical to 200.

The following exception occurred during the last request:

Illuminate\Foundation\ViteManifestNotFoundException: Vite manifest not found at: /home/logos/Dev/Work/Laravel/e-commerce/public/build/manifest.json in /home/dechasa/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Vite.php:934
Stack trace:
#0 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Vite.php(384): Illuminate\Foundation\Vite->manifest('build')
#1 /home/logos/Dev/Work/Laravel/e-commerce/storage/framework/views/b9df1a3ec2d9260315df3e2c00636be7.php(44): Illuminate\Foundation\Vite->__invoke(Object(Illuminate\Support\Collection))
#2 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Filesystem/Filesystem.php(123): require('/home/dechasa/D...')
#3 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Filesystem/Filesystem.php(124): Illuminate\Filesystem\Filesystem::{closure:Illuminate\Filesystem\Filesystem::getRequire():120}()
#4 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/View/Engines/PhpEngine.php(57): Illuminate\Filesystem\Filesystem->getRequire('/home/dechasa/D...', Array)
#5 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/View/Engines/CompilerEngine.php(76): Illuminate\View\Engines\PhpEngine->evaluatePath('/home/dechasa/D...', Array)
#6 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/View/View.php(208): Illuminate\View\Engines\CompilerEngine->get('/home/dechasa/D...', Array)
#7 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/View/View.php(191): Illuminate\View\View->getContents()
#8 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/View/View.php(160): Illuminate\View\View->renderContents()
#9 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Http/Response.php(78): Illuminate\View\View->render()
#10 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Http/Response.php(34): Illuminate\Http\Response->setContent(Object(Illuminate\View\View))
#11 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/ResponseFactory.php(61): Illuminate\Http\Response->__construct(Object(Illuminate\View\View), 200, Array)
#12 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/ResponseFactory.php(91): Illuminate\Routing\ResponseFactory->make(Object(Illuminate\View\View), 200, Array)
#13 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Support/Facades/Facade.php(361): Illuminate\Routing\ResponseFactory->view('app', Array)
#14 /home/logos/Dev/Work/Laravel/e-commerce/vendor/inertiajs/inertia-laravel/src/Response.php(135): Illuminate\Support\Facades\Facade::__callStatic('view', Array)
#15 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/Router.php(906): Inertia\Response->toResponse(Object(Illuminate\Http\Request))
#16 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/Router.php(891): Illuminate\Routing\Router::toResponse(Object(Illuminate\Http\Request), Object(Inertia\Response))
#17 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/Router.php(807): Illuminate\Routing\Router->prepareResponse(Object(Illuminate\Http\Request), Object(Inertia\Response))
#18 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(169): Illuminate\Routing\Router->{closure:Illuminate\Routing\Router::runRouteWithinStack():807}(Object(Illuminate\Http\Request))
#19 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Auth/Middleware/EnsureEmailIsVerified.php(41): Illuminate\Pipeline\Pipeline->{closure:Illuminate\Pipeline\Pipeline::prepareDestination():167}(Object(Illuminate\Http\Request))
#20 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Auth\Middleware\EnsureEmailIsVerified->handle(Object(Illuminate\Http\Request), Object(Closure))
#21 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Http/Middleware/AddLinkHeadersForPreloadedAssets.php(32): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#22 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets->handle(Object(Illuminate\Http\Request), Object(Closure))
#23 /home/logos/Dev/Work/Laravel/e-commerce/vendor/inertiajs/inertia-laravel/src/Middleware.php(100): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#24 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Inertia\Middleware->handle(Object(Illuminate\Http\Request), Object(Closure))
#25 /home/logos/Dev/Work/Laravel/e-commerce/app/Http/Middleware/HandleAppearance.php(21): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#26 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): App\Http\Middleware\HandleAppearance->handle(Object(Illuminate\Http\Request), Object(Closure))
#27 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/Middleware/SubstituteBindings.php(50): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#28 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Routing\Middleware\SubstituteBindings->handle(Object(Illuminate\Http\Request), Object(Closure))
#29 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Auth/Middleware/Authenticate.php(63): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#30 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Auth\Middleware\Authenticate->handle(Object(Illuminate\Http\Request), Object(Closure))
#31 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Http/Middleware/VerifyCsrfToken.php(87): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#32 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Foundation\Http\Middleware\VerifyCsrfToken->handle(Object(Illuminate\Http\Request), Object(Closure))
#33 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/View/Middleware/ShareErrorsFromSession.php(48): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#34 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\View\Middleware\ShareErrorsFromSession->handle(Object(Illuminate\Http\Request), Object(Closure))
#35 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Session/Middleware/StartSession.php(120): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#36 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Session/Middleware/StartSession.php(63): Illuminate\Session\Middleware\StartSession->handleStatefulRequest(Object(Illuminate\Http\Request), Object(Illuminate\Session\Store), Object(Closure))
#37 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Session\Middleware\StartSession->handle(Object(Illuminate\Http\Request), Object(Closure))
#38 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Cookie/Middleware/AddQueuedCookiesToResponse.php(36): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#39 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse->handle(Object(Illuminate\Http\Request), Object(Closure))
#40 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Cookie/Middleware/EncryptCookies.php(74): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#41 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Cookie\Middleware\EncryptCookies->handle(Object(Illuminate\Http\Request), Object(Closure))
#42 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(126): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#43 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/Router.php(807): Illuminate\Pipeline\Pipeline->then(Object(Closure))
#44 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/Router.php(786): Illuminate\Routing\Router->runRouteWithinStack(Object(Illuminate\Routing\Route), Object(Illuminate\Http\Request))
#45 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/Router.php(750): Illuminate\Routing\Router->runRoute(Object(Illuminate\Http\Request), Object(Illuminate\Routing\Route))
#46 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/Router.php(739): Illuminate\Routing\Router->dispatchToRoute(Object(Illuminate\Http\Request))
#47 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Http/Kernel.php(200): Illuminate\Routing\Router->dispatch(Object(Illuminate\Http\Request))
#48 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(169): Illuminate\Foundation\Http\Kernel->{closure:Illuminate\Foundation\Http\Kernel::dispatchToRouter():197}(Object(Illuminate\Http\Request))
#49 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Http/Middleware/TransformsRequest.php(21): Illuminate\Pipeline\Pipeline->{closure:Illuminate\Pipeline\Pipeline::prepareDestination():167}(Object(Illuminate\Http\Request))
#50 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Http/Middleware/ConvertEmptyStringsToNull.php(31): Illuminate\Foundation\Http\Middleware\TransformsRequest->handle(Object(Illuminate\Http\Request), Object(Closure))
#51 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Foundation\Http\Middleware\ConvertEmptyStringsToNull->handle(Object(Illuminate\Http\Request), Object(Closure))
#52 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Http/Middleware/TransformsRequest.php(21): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#53 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Http/Middleware/TrimStrings.php(51): Illuminate\Foundation\Http\Middleware\TransformsRequest->handle(Object(Illuminate\Http\Request), Object(Closure))
#54 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Foundation\Http\Middleware\TrimStrings->handle(Object(Illuminate\Http\Request), Object(Closure))
#55 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Http/Middleware/ValidatePostSize.php(27): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#56 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Http\Middleware\ValidatePostSize->handle(Object(Illuminate\Http\Request), Object(Closure))
#57 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Http/Middleware/PreventRequestsDuringMaintenance.php(109): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#58 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Foundation\Http\Middleware\PreventRequestsDuringMaintenance->handle(Object(Illuminate\Http\Request), Object(Closure))
#59 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Http/Middleware/HandleCors.php(48): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#60 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Http\Middleware\HandleCors->handle(Object(Illuminate\Http\Request), Object(Closure))
#61 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Http/Middleware/TrustProxies.php(58): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#62 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Http\Middleware\TrustProxies->handle(Object(Illuminate\Http\Request), Object(Closure))
#63 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Http/Middleware/InvokeDeferredCallbacks.php(22): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#64 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Foundation\Http\Middleware\InvokeDeferredCallbacks->handle(Object(Illuminate\Http\Request), Object(Closure))
#65 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Http/Middleware/ValidatePathEncoding.php(26): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#66 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Http\Middleware\ValidatePathEncoding->handle(Object(Illuminate\Http\Request), Object(Closure))
#67 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(126): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#68 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Http/Kernel.php(175): Illuminate\Pipeline\Pipeline->then(Object(Closure))
#69 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Http/Kernel.php(144): Illuminate\Foundation\Http\Kernel->sendRequestThroughRouter(Object(Illuminate\Http\Request))
#70 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Testing/Concerns/MakesHttpRequests.php(607): Illuminate\Foundation\Http\Kernel->handle(Object(Illuminate\Http\Request))
#71 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Testing/Concerns/MakesHttpRequests.php(368): Illuminate\Foundation\Testing\TestCase->call('GET', '/dashboard', Array, Array, Array, Array)
#72 /home/logos/Dev/Work/Laravel/e-commerce/tests/Feature/DashboardTest.php(14): Illuminate\Foundation\Testing\TestCase->get('/dashboard')
#73 /home/logos/Dev/Work/Laravel/e-commerce/vendor/pestphp/pest/src/Factories/TestCaseMethodFactory.php(168): P\Tests\Feature\DashboardTest->{closure:/home/dechasa/Dev/Work/Laravel/e-commerce/tests/Feature/DashboardTest.php:11}()
#74 [internal function]: P\Tests\Feature\DashboardTest->{closure:Pest\Factories\TestCaseMethodFactory::getClosure():158}()
#75 /home/logos/Dev/Work/Laravel/e-commerce/vendor/pestphp/pest/src/Concerns/Testable.php(419): call_user_func_array(Object(Closure), Array)
#76 /home/logos/Dev/Work/Laravel/e-commerce/vendor/pestphp/pest/src/Support/ExceptionTrace.php(26): P\Tests\Feature\DashboardTest->{closure:Pest\Concerns\Testable::__callClosure():419}()
#77 /home/logos/Dev/Work/Laravel/e-commerce/vendor/pestphp/pest/src/Concerns/Testable.php(419): Pest\Support\ExceptionTrace::ensure(Object(Closure))
#78 /home/logos/Dev/Work/Laravel/e-commerce/vendor/pestphp/pest/src/Concerns/Testable.php(321): P\Tests\Feature\DashboardTest->__callClosure(Object(Closure), Array)
#79 /home/logos/Dev/Work/Laravel/e-commerce/vendor/pestphp/pest/src/Factories/TestCaseFactory.php(169) : eval()'d code(26): P\Tests\Feature\DashboardTest->__runTest(Object(Closure))
#80 /home/logos/Dev/Work/Laravel/e-commerce/vendor/phpunit/phpunit/src/Framework/TestCase.php(1240): P\Tests\Feature\DashboardTest->__pest_evaluable_authenticated_users_can_visit_the_dashboard()
#81 /home/logos/Dev/Work/Laravel/e-commerce/vendor/phpunit/phpunit/src/Framework/TestCase.php(514): PHPUnit\Framework\TestCase->runTest()
#82 /home/logos/Dev/Work/Laravel/e-commerce/vendor/phpunit/phpunit/src/Framework/TestRunner/TestRunner.php(87): PHPUnit\Framework\TestCase->runBare()
#83 /home/logos/Dev/Work/Laravel/e-commerce/vendor/phpunit/phpunit/src/Framework/TestCase.php(361): PHPUnit\Framework\TestRunner->run(Object(P\Tests\Feature\DashboardTest))
#84 /home/logos/Dev/Work/Laravel/e-commerce/vendor/phpunit/phpunit/src/Framework/TestSuite.php(369): PHPUnit\Framework\TestCase->run()
#85 /home/logos/Dev/Work/Laravel/e-commerce/vendor/phpunit/phpunit/src/Framework/TestSuite.php(369): PHPUnit\Framework\TestSuite->run()
#86 /home/logos/Dev/Work/Laravel/e-commerce/vendor/phpunit/phpunit/src/Framework/TestSuite.php(369): PHPUnit\Framework\TestSuite->run()
#87 /home/logos/Dev/Work/Laravel/e-commerce/vendor/phpunit/phpunit/src/TextUI/TestRunner.php(64): PHPUnit\Framework\TestSuite->run()
#88 /home/logos/Dev/Work/Laravel/e-commerce/vendor/phpunit/phpunit/src/TextUI/Application.php(210): PHPUnit\TextUI\TestRunner->run(Object(PHPUnit\TextUI\Configuration\Configuration), Object(PHPUnit\Runner\ResultCache\DefaultResultCache), Object(PHPUnit\Framework\TestSuite))
#89 /home/logos/Dev/Work/Laravel/e-commerce/vendor/pestphp/pest/src/Kernel.php(103): PHPUnit\TextUI\Application->run(Array)
#90 /home/logos/Dev/Work/Laravel/e-commerce/vendor/pestphp/pest/bin/pest(184): Pest\Kernel->handle(Array, Array)
#91 /home/logos/Dev/Work/Laravel/e-commerce/vendor/pestphp/pest/bin/pest(192): {closure:/home/dechasa/Dev/Work/Laravel/e-commerce/vendor/pestphp/pest/bin/pest:18}()
#92 /home/logos/Dev/Work/Laravel/e-commerce/vendor/bin/pest(119): include('/home/dechasa/D...')
#93 {main}

Next Illuminate\View\ViewException: Vite manifest not found at: /home/logos/Dev/Work/Laravel/e-commerce/public/build/manifest.json (View: /home/dechasa/Dev/Work/Laravel/e-commerce/resources/views/app.blade.php) in /home/dechasa/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Vite.php:934
Stack trace:
#0 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/View/Engines/PhpEngine.php(59): Illuminate\View\Engines\CompilerEngine->handleViewException(Object(Illuminate\Foundation\ViteManifestNotFoundException), 2)
#1 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/View/Engines/CompilerEngine.php(76): Illuminate\View\Engines\PhpEngine->evaluatePath('/home/dechasa/D...', Array)
#2 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/View/View.php(208): Illuminate\View\Engines\CompilerEngine->get('/home/dechasa/D...', Array)
#3 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/View/View.php(191): Illuminate\View\View->getContents()
#4 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/View/View.php(160): Illuminate\View\View->renderContents()
#5 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Http/Response.php(78): Illuminate\View\View->render()
#6 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Http/Response.php(34): Illuminate\Http\Response->setContent(Object(Illuminate\View\View))
#7 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/ResponseFactory.php(61): Illuminate\Http\Response->__construct(Object(Illuminate\View\View), 200, Array)
#8 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/ResponseFactory.php(91): Illuminate\Routing\ResponseFactory->make(Object(Illuminate\View\View), 200, Array)
#9 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Support/Facades/Facade.php(361): Illuminate\Routing\ResponseFactory->view('app', Array)
#10 /home/logos/Dev/Work/Laravel/e-commerce/vendor/inertiajs/inertia-laravel/src/Response.php(135): Illuminate\Support\Facades\Facade::__callStatic('view', Array)
#11 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/Router.php(906): Inertia\Response->toResponse(Object(Illuminate\Http\Request))
#12 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/Router.php(891): Illuminate\Routing\Router::toResponse(Object(Illuminate\Http\Request), Object(Inertia\Response))
#13 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/Router.php(807): Illuminate\Routing\Router->prepareResponse(Object(Illuminate\Http\Request), Object(Inertia\Response))
#14 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(169): Illuminate\Routing\Router->{closure:Illuminate\Routing\Router::runRouteWithinStack():807}(Object(Illuminate\Http\Request))
#15 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Auth/Middleware/EnsureEmailIsVerified.php(41): Illuminate\Pipeline\Pipeline->{closure:Illuminate\Pipeline\Pipeline::prepareDestination():167}(Object(Illuminate\Http\Request))
#16 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Auth\Middleware\EnsureEmailIsVerified->handle(Object(Illuminate\Http\Request), Object(Closure))
#17 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Http/Middleware/AddLinkHeadersForPreloadedAssets.php(32): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#18 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets->handle(Object(Illuminate\Http\Request), Object(Closure))
#19 /home/logos/Dev/Work/Laravel/e-commerce/vendor/inertiajs/inertia-laravel/src/Middleware.php(100): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#20 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Inertia\Middleware->handle(Object(Illuminate\Http\Request), Object(Closure))
#21 /home/logos/Dev/Work/Laravel/e-commerce/app/Http/Middleware/HandleAppearance.php(21): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#22 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): App\Http\Middleware\HandleAppearance->handle(Object(Illuminate\Http\Request), Object(Closure))
#23 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/Middleware/SubstituteBindings.php(50): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#24 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Routing\Middleware\SubstituteBindings->handle(Object(Illuminate\Http\Request), Object(Closure))
#25 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Auth/Middleware/Authenticate.php(63): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#26 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Auth\Middleware\Authenticate->handle(Object(Illuminate\Http\Request), Object(Closure))
#27 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Http/Middleware/VerifyCsrfToken.php(87): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#28 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Foundation\Http\Middleware\VerifyCsrfToken->handle(Object(Illuminate\Http\Request), Object(Closure))
#29 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/View/Middleware/ShareErrorsFromSession.php(48): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#30 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\View\Middleware\ShareErrorsFromSession->handle(Object(Illuminate\Http\Request), Object(Closure))
#31 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Session/Middleware/StartSession.php(120): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#32 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Session/Middleware/StartSession.php(63): Illuminate\Session\Middleware\StartSession->handleStatefulRequest(Object(Illuminate\Http\Request), Object(Illuminate\Session\Store), Object(Closure))
#33 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Session\Middleware\StartSession->handle(Object(Illuminate\Http\Request), Object(Closure))
#34 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Cookie/Middleware/AddQueuedCookiesToResponse.php(36): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#35 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse->handle(Object(Illuminate\Http\Request), Object(Closure))
#36 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Cookie/Middleware/EncryptCookies.php(74): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#37 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Cookie\Middleware\EncryptCookies->handle(Object(Illuminate\Http\Request), Object(Closure))
#38 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(126): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#39 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/Router.php(807): Illuminate\Pipeline\Pipeline->then(Object(Closure))
#40 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/Router.php(786): Illuminate\Routing\Router->runRouteWithinStack(Object(Illuminate\Routing\Route), Object(Illuminate\Http\Request))
#41 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/Router.php(750): Illuminate\Routing\Router->runRoute(Object(Illuminate\Http\Request), Object(Illuminate\Routing\Route))
#42 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/Router.php(739): Illuminate\Routing\Router->dispatchToRoute(Object(Illuminate\Http\Request))
#43 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Http/Kernel.php(200): Illuminate\Routing\Router->dispatch(Object(Illuminate\Http\Request))
#44 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(169): Illuminate\Foundation\Http\Kernel->{closure:Illuminate\Foundation\Http\Kernel::dispatchToRouter():197}(Object(Illuminate\Http\Request))
#45 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Http/Middleware/TransformsRequest.php(21): Illuminate\Pipeline\Pipeline->{closure:Illuminate\Pipeline\Pipeline::prepareDestination():167}(Object(Illuminate\Http\Request))
#46 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Http/Middleware/ConvertEmptyStringsToNull.php(31): Illuminate\Foundation\Http\Middleware\TransformsRequest->handle(Object(Illuminate\Http\Request), Object(Closure))
#47 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Foundation\Http\Middleware\ConvertEmptyStringsToNull->handle(Object(Illuminate\Http\Request), Object(Closure))
#48 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Http/Middleware/TransformsRequest.php(21): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#49 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Http/Middleware/TrimStrings.php(51): Illuminate\Foundation\Http\Middleware\TransformsRequest->handle(Object(Illuminate\Http\Request), Object(Closure))
#50 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Foundation\Http\Middleware\TrimStrings->handle(Object(Illuminate\Http\Request), Object(Closure))
#51 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Http/Middleware/ValidatePostSize.php(27): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#52 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Http\Middleware\ValidatePostSize->handle(Object(Illuminate\Http\Request), Object(Closure))
#53 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Http/Middleware/PreventRequestsDuringMaintenance.php(109): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#54 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Foundation\Http\Middleware\PreventRequestsDuringMaintenance->handle(Object(Illuminate\Http\Request), Object(Closure))
#55 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Http/Middleware/HandleCors.php(48): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#56 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Http\Middleware\HandleCors->handle(Object(Illuminate\Http\Request), Object(Closure))
#57 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Http/Middleware/TrustProxies.php(58): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#58 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Http\Middleware\TrustProxies->handle(Object(Illuminate\Http\Request), Object(Closure))
#59 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Http/Middleware/InvokeDeferredCallbacks.php(22): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#60 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Foundation\Http\Middleware\InvokeDeferredCallbacks->handle(Object(Illuminate\Http\Request), Object(Closure))
#61 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Http/Middleware/ValidatePathEncoding.php(26): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#62 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Http\Middleware\ValidatePathEncoding->handle(Object(Illuminate\Http\Request), Object(Closure))
#63 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(126): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#64 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Http/Kernel.php(175): Illuminate\Pipeline\Pipeline->then(Object(Closure))
#65 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Http/Kernel.php(144): Illuminate\Foundation\Http\Kernel->sendRequestThroughRouter(Object(Illuminate\Http\Request))
#66 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Testing/Concerns/MakesHttpRequests.php(607): Illuminate\Foundation\Http\Kernel->handle(Object(Illuminate\Http\Request))
#67 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Testing/Concerns/MakesHttpRequests.php(368): Illuminate\Foundation\Testing\TestCase->call('GET', '/dashboard', Array, Array, Array, Array)
#68 /home/logos/Dev/Work/Laravel/e-commerce/tests/Feature/DashboardTest.php(14): Illuminate\Foundation\Testing\TestCase->get('/dashboard')
#69 /home/logos/Dev/Work/Laravel/e-commerce/vendor/pestphp/pest/src/Factories/TestCaseMethodFactory.php(168): P\Tests\Feature\DashboardTest->{closure:/home/dechasa/Dev/Work/Laravel/e-commerce/tests/Feature/DashboardTest.php:11}()
#70 [internal function]: P\Tests\Feature\DashboardTest->{closure:Pest\Factories\TestCaseMethodFactory::getClosure():158}()
#71 /home/logos/Dev/Work/Laravel/e-commerce/vendor/pestphp/pest/src/Concerns/Testable.php(419): call_user_func_array(Object(Closure), Array)
#72 /home/logos/Dev/Work/Laravel/e-commerce/vendor/pestphp/pest/src/Support/ExceptionTrace.php(26): P\Tests\Feature\DashboardTest->{closure:Pest\Concerns\Testable::__callClosure():419}()
#73 /home/logos/Dev/Work/Laravel/e-commerce/vendor/pestphp/pest/src/Concerns/Testable.php(419): Pest\Support\ExceptionTrace::ensure(Object(Closure))
#74 /home/logos/Dev/Work/Laravel/e-commerce/vendor/pestphp/pest/src/Concerns/Testable.php(321): P\Tests\Feature\DashboardTest->__callClosure(Object(Closure), Array)
#75 /home/logos/Dev/Work/Laravel/e-commerce/vendor/pestphp/pest/src/Factories/TestCaseFactory.php(169) : eval()'d code(26): P\Tests\Feature\DashboardTest->__runTest(Object(Closure))
#76 /home/logos/Dev/Work/Laravel/e-commerce/vendor/phpunit/phpunit/src/Framework/TestCase.php(1240): P\Tests\Feature\DashboardTest->__pest_evaluable_authenticated_users_can_visit_the_dashboard()
#77 /home/logos/Dev/Work/Laravel/e-commerce/vendor/phpunit/phpunit/src/Framework/TestCase.php(514): PHPUnit\Framework\TestCase->runTest()
#78 /home/logos/Dev/Work/Laravel/e-commerce/vendor/phpunit/phpunit/src/Framework/TestRunner/TestRunner.php(87): PHPUnit\Framework\TestCase->runBare()
#79 /home/logos/Dev/Work/Laravel/e-commerce/vendor/phpunit/phpunit/src/Framework/TestCase.php(361): PHPUnit\Framework\TestRunner->run(Object(P\Tests\Feature\DashboardTest))
#80 /home/logos/Dev/Work/Laravel/e-commerce/vendor/phpunit/phpunit/src/Framework/TestSuite.php(369): PHPUnit\Framework\TestCase->run()
#81 /home/logos/Dev/Work/Laravel/e-commerce/vendor/phpunit/phpunit/src/Framework/TestSuite.php(369): PHPUnit\Framework\TestSuite->run()
#82 /home/logos/Dev/Work/Laravel/e-commerce/vendor/phpunit/phpunit/src/Framework/TestSuite.php(369): PHPUnit\Framework\TestSuite->run()
#83 /home/logos/Dev/Work/Laravel/e-commerce/vendor/phpunit/phpunit/src/TextUI/TestRunner.php(64): PHPUnit\Framework\TestSuite->run()
#84 /home/logos/Dev/Work/Laravel/e-commerce/vendor/phpunit/phpunit/src/TextUI/Application.php(210): PHPUnit\TextUI\TestRunner->run(Object(PHPUnit\TextUI\Configuration\Configuration), Object(PHPUnit\Runner\ResultCache\DefaultResultCache), Object(PHPUnit\Framework\TestSuite))
#85 /home/logos/Dev/Work/Laravel/e-commerce/vendor/pestphp/pest/src/Kernel.php(103): PHPUnit\TextUI\Application->run(Array)
#86 /home/logos/Dev/Work/Laravel/e-commerce/vendor/pestphp/pest/bin/pest(184): Pest\Kernel->handle(Array, Array)
#87 /home/logos/Dev/Work/Laravel/e-commerce/vendor/pestphp/pest/bin/pest(192): {closure:/home/dechasa/Dev/Work/Laravel/e-commerce/vendor/pestphp/pest/bin/pest:18}()
#88 /home/logos/Dev/Work/Laravel/e-commerce/vendor/bin/pest(119): include('/home/dechasa/D...')
#89 {main}

----------------------------------------------------------------------------------

Vite manifest not found at: /home/logos/Dev/Work/Laravel/e-commerce/public/build/manifest.json (View: /home/dechasa/Dev/Work/Laravel/e-commerce/resources/views/app.blade.php)

  at tests/Feature/DashboardTest.php:14
     10▕ 
     11▕ test('authenticated users can visit the dashboard', function () {
     12▕     $this->actingAs($user = User::factory()->create());
     13▕ 
  ➜  14▕     $this->get('/dashboard')->assertOk();
     15▕ });

  ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────  
   FAILED  Tests\Feature\ExampleTest > it returns a successful response                                                        
  Expected response status code [200] but received 500.
Failed asserting that 500 is identical to 200.

The following exception occurred during the last request:

Illuminate\Foundation\ViteManifestNotFoundException: Vite manifest not found at: /home/logos/Dev/Work/Laravel/e-commerce/public/build/manifest.json in /home/dechasa/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Vite.php:934
Stack trace:
#0 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Vite.php(384): Illuminate\Foundation\Vite->manifest('build')
#1 /home/logos/Dev/Work/Laravel/e-commerce/storage/framework/views/b9df1a3ec2d9260315df3e2c00636be7.php(44): Illuminate\Foundation\Vite->__invoke(Object(Illuminate\Support\Collection))
#2 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Filesystem/Filesystem.php(123): require('/home/dechasa/D...')
#3 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Filesystem/Filesystem.php(124): Illuminate\Filesystem\Filesystem::{closure:Illuminate\Filesystem\Filesystem::getRequire():120}()
#4 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/View/Engines/PhpEngine.php(57): Illuminate\Filesystem\Filesystem->getRequire('/home/dechasa/D...', Array)
#5 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/View/Engines/CompilerEngine.php(76): Illuminate\View\Engines\PhpEngine->evaluatePath('/home/dechasa/D...', Array)
#6 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/View/View.php(208): Illuminate\View\Engines\CompilerEngine->get('/home/dechasa/D...', Array)
#7 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/View/View.php(191): Illuminate\View\View->getContents()
#8 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/View/View.php(160): Illuminate\View\View->renderContents()
#9 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Http/Response.php(78): Illuminate\View\View->render()
#10 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Http/Response.php(34): Illuminate\Http\Response->setContent(Object(Illuminate\View\View))
#11 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/ResponseFactory.php(61): Illuminate\Http\Response->__construct(Object(Illuminate\View\View), 200, Array)
#12 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/ResponseFactory.php(91): Illuminate\Routing\ResponseFactory->make(Object(Illuminate\View\View), 200, Array)
#13 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Support/Facades/Facade.php(361): Illuminate\Routing\ResponseFactory->view('app', Array)
#14 /home/logos/Dev/Work/Laravel/e-commerce/vendor/inertiajs/inertia-laravel/src/Response.php(135): Illuminate\Support\Facades\Facade::__callStatic('view', Array)
#15 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/Router.php(906): Inertia\Response->toResponse(Object(Illuminate\Http\Request))
#16 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/Router.php(891): Illuminate\Routing\Router::toResponse(Object(Illuminate\Http\Request), Object(Inertia\Response))
#17 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/Router.php(807): Illuminate\Routing\Router->prepareResponse(Object(Illuminate\Http\Request), Object(Inertia\Response))
#18 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(169): Illuminate\Routing\Router->{closure:Illuminate\Routing\Router::runRouteWithinStack():807}(Object(Illuminate\Http\Request))
#19 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Http/Middleware/AddLinkHeadersForPreloadedAssets.php(32): Illuminate\Pipeline\Pipeline->{closure:Illuminate\Pipeline\Pipeline::prepareDestination():167}(Object(Illuminate\Http\Request))
#20 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets->handle(Object(Illuminate\Http\Request), Object(Closure))
#21 /home/logos/Dev/Work/Laravel/e-commerce/vendor/inertiajs/inertia-laravel/src/Middleware.php(100): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#22 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Inertia\Middleware->handle(Object(Illuminate\Http\Request), Object(Closure))
#23 /home/logos/Dev/Work/Laravel/e-commerce/app/Http/Middleware/HandleAppearance.php(21): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#24 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): App\Http\Middleware\HandleAppearance->handle(Object(Illuminate\Http\Request), Object(Closure))
#25 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/Middleware/SubstituteBindings.php(50): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#26 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Routing\Middleware\SubstituteBindings->handle(Object(Illuminate\Http\Request), Object(Closure))
#27 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Http/Middleware/VerifyCsrfToken.php(87): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#28 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Foundation\Http\Middleware\VerifyCsrfToken->handle(Object(Illuminate\Http\Request), Object(Closure))
#29 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/View/Middleware/ShareErrorsFromSession.php(48): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#30 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\View\Middleware\ShareErrorsFromSession->handle(Object(Illuminate\Http\Request), Object(Closure))
#31 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Session/Middleware/StartSession.php(120): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#32 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Session/Middleware/StartSession.php(63): Illuminate\Session\Middleware\StartSession->handleStatefulRequest(Object(Illuminate\Http\Request), Object(Illuminate\Session\Store), Object(Closure))
#33 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Session\Middleware\StartSession->handle(Object(Illuminate\Http\Request), Object(Closure))
#34 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Cookie/Middleware/AddQueuedCookiesToResponse.php(36): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#35 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse->handle(Object(Illuminate\Http\Request), Object(Closure))
#36 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Cookie/Middleware/EncryptCookies.php(74): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#37 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Cookie\Middleware\EncryptCookies->handle(Object(Illuminate\Http\Request), Object(Closure))
#38 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(126): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#39 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/Router.php(807): Illuminate\Pipeline\Pipeline->then(Object(Closure))
#40 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/Router.php(786): Illuminate\Routing\Router->runRouteWithinStack(Object(Illuminate\Routing\Route), Object(Illuminate\Http\Request))
#41 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/Router.php(750): Illuminate\Routing\Router->runRoute(Object(Illuminate\Http\Request), Object(Illuminate\Routing\Route))
#42 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/Router.php(739): Illuminate\Routing\Router->dispatchToRoute(Object(Illuminate\Http\Request))
#43 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Http/Kernel.php(200): Illuminate\Routing\Router->dispatch(Object(Illuminate\Http\Request))
#44 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(169): Illuminate\Foundation\Http\Kernel->{closure:Illuminate\Foundation\Http\Kernel::dispatchToRouter():197}(Object(Illuminate\Http\Request))
#45 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Http/Middleware/TransformsRequest.php(21): Illuminate\Pipeline\Pipeline->{closure:Illuminate\Pipeline\Pipeline::prepareDestination():167}(Object(Illuminate\Http\Request))
#46 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Http/Middleware/ConvertEmptyStringsToNull.php(31): Illuminate\Foundation\Http\Middleware\TransformsRequest->handle(Object(Illuminate\Http\Request), Object(Closure))
#47 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Foundation\Http\Middleware\ConvertEmptyStringsToNull->handle(Object(Illuminate\Http\Request), Object(Closure))
#48 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Http/Middleware/TransformsRequest.php(21): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#49 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Http/Middleware/TrimStrings.php(51): Illuminate\Foundation\Http\Middleware\TransformsRequest->handle(Object(Illuminate\Http\Request), Object(Closure))
#50 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Foundation\Http\Middleware\TrimStrings->handle(Object(Illuminate\Http\Request), Object(Closure))
#51 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Http/Middleware/ValidatePostSize.php(27): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#52 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Http\Middleware\ValidatePostSize->handle(Object(Illuminate\Http\Request), Object(Closure))
#53 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Http/Middleware/PreventRequestsDuringMaintenance.php(109): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#54 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Foundation\Http\Middleware\PreventRequestsDuringMaintenance->handle(Object(Illuminate\Http\Request), Object(Closure))
#55 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Http/Middleware/HandleCors.php(48): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#56 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Http\Middleware\HandleCors->handle(Object(Illuminate\Http\Request), Object(Closure))
#57 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Http/Middleware/TrustProxies.php(58): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#58 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Http\Middleware\TrustProxies->handle(Object(Illuminate\Http\Request), Object(Closure))
#59 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Http/Middleware/InvokeDeferredCallbacks.php(22): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#60 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Foundation\Http\Middleware\InvokeDeferredCallbacks->handle(Object(Illuminate\Http\Request), Object(Closure))
#61 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Http/Middleware/ValidatePathEncoding.php(26): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#62 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Http\Middleware\ValidatePathEncoding->handle(Object(Illuminate\Http\Request), Object(Closure))
#63 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(126): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#64 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Http/Kernel.php(175): Illuminate\Pipeline\Pipeline->then(Object(Closure))
#65 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Http/Kernel.php(144): Illuminate\Foundation\Http\Kernel->sendRequestThroughRouter(Object(Illuminate\Http\Request))
#66 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Testing/Concerns/MakesHttpRequests.php(607): Illuminate\Foundation\Http\Kernel->handle(Object(Illuminate\Http\Request))
#67 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Testing/Concerns/MakesHttpRequests.php(368): Illuminate\Foundation\Testing\TestCase->call('GET', '/', Array, Array, Array, Array)
#68 /home/logos/Dev/Work/Laravel/e-commerce/tests/Feature/ExampleTest.php(4): Illuminate\Foundation\Testing\TestCase->get('/')
#69 /home/logos/Dev/Work/Laravel/e-commerce/vendor/pestphp/pest/src/Factories/TestCaseMethodFactory.php(168): P\Tests\Feature\ExampleTest->{closure:/home/dechasa/Dev/Work/Laravel/e-commerce/tests/Feature/ExampleTest.php:3}()
#70 [internal function]: P\Tests\Feature\ExampleTest->{closure:Pest\Factories\TestCaseMethodFactory::getClosure():158}()
#71 /home/logos/Dev/Work/Laravel/e-commerce/vendor/pestphp/pest/src/Concerns/Testable.php(419): call_user_func_array(Object(Closure), Array)
#72 /home/logos/Dev/Work/Laravel/e-commerce/vendor/pestphp/pest/src/Support/ExceptionTrace.php(26): P\Tests\Feature\ExampleTest->{closure:Pest\Concerns\Testable::__callClosure():419}()
#73 /home/logos/Dev/Work/Laravel/e-commerce/vendor/pestphp/pest/src/Concerns/Testable.php(419): Pest\Support\ExceptionTrace::ensure(Object(Closure))
#74 /home/logos/Dev/Work/Laravel/e-commerce/vendor/pestphp/pest/src/Concerns/Testable.php(321): P\Tests\Feature\ExampleTest->__callClosure(Object(Closure), Array)
#75 /home/logos/Dev/Work/Laravel/e-commerce/vendor/pestphp/pest/src/Factories/TestCaseFactory.php(169) : eval()'d code(17): P\Tests\Feature\ExampleTest->__runTest(Object(Closure))
#76 /home/logos/Dev/Work/Laravel/e-commerce/vendor/phpunit/phpunit/src/Framework/TestCase.php(1240): P\Tests\Feature\ExampleTest->__pest_evaluable_it_returns_a_successful_response()
#77 /home/logos/Dev/Work/Laravel/e-commerce/vendor/phpunit/phpunit/src/Framework/TestCase.php(514): PHPUnit\Framework\TestCase->runTest()
#78 /home/logos/Dev/Work/Laravel/e-commerce/vendor/phpunit/phpunit/src/Framework/TestRunner/TestRunner.php(87): PHPUnit\Framework\TestCase->runBare()
#79 /home/logos/Dev/Work/Laravel/e-commerce/vendor/phpunit/phpunit/src/Framework/TestCase.php(361): PHPUnit\Framework\TestRunner->run(Object(P\Tests\Feature\ExampleTest))
#80 /home/logos/Dev/Work/Laravel/e-commerce/vendor/phpunit/phpunit/src/Framework/TestSuite.php(369): PHPUnit\Framework\TestCase->run()
#81 /home/logos/Dev/Work/Laravel/e-commerce/vendor/phpunit/phpunit/src/Framework/TestSuite.php(369): PHPUnit\Framework\TestSuite->run()
#82 /home/logos/Dev/Work/Laravel/e-commerce/vendor/phpunit/phpunit/src/Framework/TestSuite.php(369): PHPUnit\Framework\TestSuite->run()
#83 /home/logos/Dev/Work/Laravel/e-commerce/vendor/phpunit/phpunit/src/TextUI/TestRunner.php(64): PHPUnit\Framework\TestSuite->run()
#84 /home/logos/Dev/Work/Laravel/e-commerce/vendor/phpunit/phpunit/src/TextUI/Application.php(210): PHPUnit\TextUI\TestRunner->run(Object(PHPUnit\TextUI\Configuration\Configuration), Object(PHPUnit\Runner\ResultCache\DefaultResultCache), Object(PHPUnit\Framework\TestSuite))
#85 /home/logos/Dev/Work/Laravel/e-commerce/vendor/pestphp/pest/src/Kernel.php(103): PHPUnit\TextUI\Application->run(Array)
#86 /home/logos/Dev/Work/Laravel/e-commerce/vendor/pestphp/pest/bin/pest(184): Pest\Kernel->handle(Array, Array)
#87 /home/logos/Dev/Work/Laravel/e-commerce/vendor/pestphp/pest/bin/pest(192): {closure:/home/dechasa/Dev/Work/Laravel/e-commerce/vendor/pestphp/pest/bin/pest:18}()
#88 /home/logos/Dev/Work/Laravel/e-commerce/vendor/bin/pest(119): include('/home/dechasa/D...')
#89 {main}

Next Illuminate\View\ViewException: Vite manifest not found at: /home/logos/Dev/Work/Laravel/e-commerce/public/build/manifest.json (View: /home/dechasa/Dev/Work/Laravel/e-commerce/resources/views/app.blade.php) in /home/dechasa/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Vite.php:934
Stack trace:
#0 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/View/Engines/PhpEngine.php(59): Illuminate\View\Engines\CompilerEngine->handleViewException(Object(Illuminate\Foundation\ViteManifestNotFoundException), 2)
#1 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/View/Engines/CompilerEngine.php(76): Illuminate\View\Engines\PhpEngine->evaluatePath('/home/dechasa/D...', Array)
#2 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/View/View.php(208): Illuminate\View\Engines\CompilerEngine->get('/home/dechasa/D...', Array)
#3 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/View/View.php(191): Illuminate\View\View->getContents()
#4 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/View/View.php(160): Illuminate\View\View->renderContents()
#5 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Http/Response.php(78): Illuminate\View\View->render()
#6 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Http/Response.php(34): Illuminate\Http\Response->setContent(Object(Illuminate\View\View))
#7 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/ResponseFactory.php(61): Illuminate\Http\Response->__construct(Object(Illuminate\View\View), 200, Array)
#8 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/ResponseFactory.php(91): Illuminate\Routing\ResponseFactory->make(Object(Illuminate\View\View), 200, Array)
#9 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Support/Facades/Facade.php(361): Illuminate\Routing\ResponseFactory->view('app', Array)
#10 /home/logos/Dev/Work/Laravel/e-commerce/vendor/inertiajs/inertia-laravel/src/Response.php(135): Illuminate\Support\Facades\Facade::__callStatic('view', Array)
#11 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/Router.php(906): Inertia\Response->toResponse(Object(Illuminate\Http\Request))
#12 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/Router.php(891): Illuminate\Routing\Router::toResponse(Object(Illuminate\Http\Request), Object(Inertia\Response))
#13 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/Router.php(807): Illuminate\Routing\Router->prepareResponse(Object(Illuminate\Http\Request), Object(Inertia\Response))
#14 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(169): Illuminate\Routing\Router->{closure:Illuminate\Routing\Router::runRouteWithinStack():807}(Object(Illuminate\Http\Request))
#15 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Http/Middleware/AddLinkHeadersForPreloadedAssets.php(32): Illuminate\Pipeline\Pipeline->{closure:Illuminate\Pipeline\Pipeline::prepareDestination():167}(Object(Illuminate\Http\Request))
#16 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets->handle(Object(Illuminate\Http\Request), Object(Closure))
#17 /home/logos/Dev/Work/Laravel/e-commerce/vendor/inertiajs/inertia-laravel/src/Middleware.php(100): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#18 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Inertia\Middleware->handle(Object(Illuminate\Http\Request), Object(Closure))
#19 /home/logos/Dev/Work/Laravel/e-commerce/app/Http/Middleware/HandleAppearance.php(21): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#20 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): App\Http\Middleware\HandleAppearance->handle(Object(Illuminate\Http\Request), Object(Closure))
#21 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/Middleware/SubstituteBindings.php(50): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#22 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Routing\Middleware\SubstituteBindings->handle(Object(Illuminate\Http\Request), Object(Closure))
#23 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Http/Middleware/VerifyCsrfToken.php(87): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#24 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Foundation\Http\Middleware\VerifyCsrfToken->handle(Object(Illuminate\Http\Request), Object(Closure))
#25 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/View/Middleware/ShareErrorsFromSession.php(48): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#26 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\View\Middleware\ShareErrorsFromSession->handle(Object(Illuminate\Http\Request), Object(Closure))
#27 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Session/Middleware/StartSession.php(120): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#28 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Session/Middleware/StartSession.php(63): Illuminate\Session\Middleware\StartSession->handleStatefulRequest(Object(Illuminate\Http\Request), Object(Illuminate\Session\Store), Object(Closure))
#29 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Session\Middleware\StartSession->handle(Object(Illuminate\Http\Request), Object(Closure))
#30 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Cookie/Middleware/AddQueuedCookiesToResponse.php(36): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#31 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse->handle(Object(Illuminate\Http\Request), Object(Closure))
#32 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Cookie/Middleware/EncryptCookies.php(74): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#33 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Cookie\Middleware\EncryptCookies->handle(Object(Illuminate\Http\Request), Object(Closure))
#34 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(126): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#35 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/Router.php(807): Illuminate\Pipeline\Pipeline->then(Object(Closure))
#36 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/Router.php(786): Illuminate\Routing\Router->runRouteWithinStack(Object(Illuminate\Routing\Route), Object(Illuminate\Http\Request))
#37 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/Router.php(750): Illuminate\Routing\Router->runRoute(Object(Illuminate\Http\Request), Object(Illuminate\Routing\Route))
#38 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/Router.php(739): Illuminate\Routing\Router->dispatchToRoute(Object(Illuminate\Http\Request))
#39 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Http/Kernel.php(200): Illuminate\Routing\Router->dispatch(Object(Illuminate\Http\Request))
#40 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(169): Illuminate\Foundation\Http\Kernel->{closure:Illuminate\Foundation\Http\Kernel::dispatchToRouter():197}(Object(Illuminate\Http\Request))
#41 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Http/Middleware/TransformsRequest.php(21): Illuminate\Pipeline\Pipeline->{closure:Illuminate\Pipeline\Pipeline::prepareDestination():167}(Object(Illuminate\Http\Request))
#42 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Http/Middleware/ConvertEmptyStringsToNull.php(31): Illuminate\Foundation\Http\Middleware\TransformsRequest->handle(Object(Illuminate\Http\Request), Object(Closure))
#43 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Foundation\Http\Middleware\ConvertEmptyStringsToNull->handle(Object(Illuminate\Http\Request), Object(Closure))
#44 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Http/Middleware/TransformsRequest.php(21): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#45 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Http/Middleware/TrimStrings.php(51): Illuminate\Foundation\Http\Middleware\TransformsRequest->handle(Object(Illuminate\Http\Request), Object(Closure))
#46 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Foundation\Http\Middleware\TrimStrings->handle(Object(Illuminate\Http\Request), Object(Closure))
#47 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Http/Middleware/ValidatePostSize.php(27): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#48 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Http\Middleware\ValidatePostSize->handle(Object(Illuminate\Http\Request), Object(Closure))
#49 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Http/Middleware/PreventRequestsDuringMaintenance.php(109): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#50 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Foundation\Http\Middleware\PreventRequestsDuringMaintenance->handle(Object(Illuminate\Http\Request), Object(Closure))
#51 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Http/Middleware/HandleCors.php(48): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#52 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Http\Middleware\HandleCors->handle(Object(Illuminate\Http\Request), Object(Closure))
#53 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Http/Middleware/TrustProxies.php(58): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#54 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Http\Middleware\TrustProxies->handle(Object(Illuminate\Http\Request), Object(Closure))
#55 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Http/Middleware/InvokeDeferredCallbacks.php(22): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#56 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Foundation\Http\Middleware\InvokeDeferredCallbacks->handle(Object(Illuminate\Http\Request), Object(Closure))
#57 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Http/Middleware/ValidatePathEncoding.php(26): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#58 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Http\Middleware\ValidatePathEncoding->handle(Object(Illuminate\Http\Request), Object(Closure))
#59 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(126): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#60 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Http/Kernel.php(175): Illuminate\Pipeline\Pipeline->then(Object(Closure))
#61 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Http/Kernel.php(144): Illuminate\Foundation\Http\Kernel->sendRequestThroughRouter(Object(Illuminate\Http\Request))
#62 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Testing/Concerns/MakesHttpRequests.php(607): Illuminate\Foundation\Http\Kernel->handle(Object(Illuminate\Http\Request))
#63 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Testing/Concerns/MakesHttpRequests.php(368): Illuminate\Foundation\Testing\TestCase->call('GET', '/', Array, Array, Array, Array)
#64 /home/logos/Dev/Work/Laravel/e-commerce/tests/Feature/ExampleTest.php(4): Illuminate\Foundation\Testing\TestCase->get('/')
#65 /home/logos/Dev/Work/Laravel/e-commerce/vendor/pestphp/pest/src/Factories/TestCaseMethodFactory.php(168): P\Tests\Feature\ExampleTest->{closure:/home/dechasa/Dev/Work/Laravel/e-commerce/tests/Feature/ExampleTest.php:3}()
#66 [internal function]: P\Tests\Feature\ExampleTest->{closure:Pest\Factories\TestCaseMethodFactory::getClosure():158}()
#67 /home/logos/Dev/Work/Laravel/e-commerce/vendor/pestphp/pest/src/Concerns/Testable.php(419): call_user_func_array(Object(Closure), Array)
#68 /home/logos/Dev/Work/Laravel/e-commerce/vendor/pestphp/pest/src/Support/ExceptionTrace.php(26): P\Tests\Feature\ExampleTest->{closure:Pest\Concerns\Testable::__callClosure():419}()
#69 /home/logos/Dev/Work/Laravel/e-commerce/vendor/pestphp/pest/src/Concerns/Testable.php(419): Pest\Support\ExceptionTrace::ensure(Object(Closure))
#70 /home/logos/Dev/Work/Laravel/e-commerce/vendor/pestphp/pest/src/Concerns/Testable.php(321): P\Tests\Feature\ExampleTest->__callClosure(Object(Closure), Array)
#71 /home/logos/Dev/Work/Laravel/e-commerce/vendor/pestphp/pest/src/Factories/TestCaseFactory.php(169) : eval()'d code(17): P\Tests\Feature\ExampleTest->__runTest(Object(Closure))
#72 /home/logos/Dev/Work/Laravel/e-commerce/vendor/phpunit/phpunit/src/Framework/TestCase.php(1240): P\Tests\Feature\ExampleTest->__pest_evaluable_it_returns_a_successful_response()
#73 /home/logos/Dev/Work/Laravel/e-commerce/vendor/phpunit/phpunit/src/Framework/TestCase.php(514): PHPUnit\Framework\TestCase->runTest()
#74 /home/logos/Dev/Work/Laravel/e-commerce/vendor/phpunit/phpunit/src/Framework/TestRunner/TestRunner.php(87): PHPUnit\Framework\TestCase->runBare()
#75 /home/logos/Dev/Work/Laravel/e-commerce/vendor/phpunit/phpunit/src/Framework/TestCase.php(361): PHPUnit\Framework\TestRunner->run(Object(P\Tests\Feature\ExampleTest))
#76 /home/logos/Dev/Work/Laravel/e-commerce/vendor/phpunit/phpunit/src/Framework/TestSuite.php(369): PHPUnit\Framework\TestCase->run()
#77 /home/logos/Dev/Work/Laravel/e-commerce/vendor/phpunit/phpunit/src/Framework/TestSuite.php(369): PHPUnit\Framework\TestSuite->run()
#78 /home/logos/Dev/Work/Laravel/e-commerce/vendor/phpunit/phpunit/src/Framework/TestSuite.php(369): PHPUnit\Framework\TestSuite->run()
#79 /home/logos/Dev/Work/Laravel/e-commerce/vendor/phpunit/phpunit/src/TextUI/TestRunner.php(64): PHPUnit\Framework\TestSuite->run()
#80 /home/logos/Dev/Work/Laravel/e-commerce/vendor/phpunit/phpunit/src/TextUI/Application.php(210): PHPUnit\TextUI\TestRunner->run(Object(PHPUnit\TextUI\Configuration\Configuration), Object(PHPUnit\Runner\ResultCache\DefaultResultCache), Object(PHPUnit\Framework\TestSuite))
#81 /home/logos/Dev/Work/Laravel/e-commerce/vendor/pestphp/pest/src/Kernel.php(103): PHPUnit\TextUI\Application->run(Array)
#82 /home/logos/Dev/Work/Laravel/e-commerce/vendor/pestphp/pest/bin/pest(184): Pest\Kernel->handle(Array, Array)
#83 /home/logos/Dev/Work/Laravel/e-commerce/vendor/pestphp/pest/bin/pest(192): {closure:/home/dechasa/Dev/Work/Laravel/e-commerce/vendor/pestphp/pest/bin/pest:18}()
#84 /home/logos/Dev/Work/Laravel/e-commerce/vendor/bin/pest(119): include('/home/dechasa/D...')
#85 {main}

----------------------------------------------------------------------------------

Vite manifest not found at: /home/logos/Dev/Work/Laravel/e-commerce/public/build/manifest.json (View: /home/dechasa/Dev/Work/Laravel/e-commerce/resources/views/app.blade.php)

  at tests/Feature/ExampleTest.php:6
      2▕ 
      3▕ it('returns a successful response', function () {
      4▕     $response = $this->get('/');
      5▕ 
  ➜   6▕     $response->assertStatus(200);
      7▕ });
      8▕

  ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────  
   FAILED  Tests\Feature\Settings\ProfileUpdateTest > profile page is displayed                                                
  Expected response status code [200] but received 500.
Failed asserting that 500 is identical to 200.

The following exception occurred during the last request:

Illuminate\Foundation\ViteManifestNotFoundException: Vite manifest not found at: /home/logos/Dev/Work/Laravel/e-commerce/public/build/manifest.json in /home/dechasa/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Vite.php:934
Stack trace:
#0 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Vite.php(384): Illuminate\Foundation\Vite->manifest('build')
#1 /home/logos/Dev/Work/Laravel/e-commerce/storage/framework/views/b9df1a3ec2d9260315df3e2c00636be7.php(44): Illuminate\Foundation\Vite->__invoke(Object(Illuminate\Support\Collection))
#2 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Filesystem/Filesystem.php(123): require('/home/dechasa/D...')
#3 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Filesystem/Filesystem.php(124): Illuminate\Filesystem\Filesystem::{closure:Illuminate\Filesystem\Filesystem::getRequire():120}()
#4 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/View/Engines/PhpEngine.php(57): Illuminate\Filesystem\Filesystem->getRequire('/home/dechasa/D...', Array)
#5 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/View/Engines/CompilerEngine.php(76): Illuminate\View\Engines\PhpEngine->evaluatePath('/home/dechasa/D...', Array)
#6 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/View/View.php(208): Illuminate\View\Engines\CompilerEngine->get('/home/dechasa/D...', Array)
#7 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/View/View.php(191): Illuminate\View\View->getContents()
#8 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/View/View.php(160): Illuminate\View\View->renderContents()
#9 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Http/Response.php(78): Illuminate\View\View->render()
#10 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Http/Response.php(34): Illuminate\Http\Response->setContent(Object(Illuminate\View\View))
#11 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/ResponseFactory.php(61): Illuminate\Http\Response->__construct(Object(Illuminate\View\View), 200, Array)
#12 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/ResponseFactory.php(91): Illuminate\Routing\ResponseFactory->make(Object(Illuminate\View\View), 200, Array)
#13 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Support/Facades/Facade.php(361): Illuminate\Routing\ResponseFactory->view('app', Array)
#14 /home/logos/Dev/Work/Laravel/e-commerce/vendor/inertiajs/inertia-laravel/src/Response.php(135): Illuminate\Support\Facades\Facade::__callStatic('view', Array)
#15 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/Router.php(906): Inertia\Response->toResponse(Object(Illuminate\Http\Request))
#16 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/Router.php(891): Illuminate\Routing\Router::toResponse(Object(Illuminate\Http\Request), Object(Inertia\Response))
#17 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/Router.php(807): Illuminate\Routing\Router->prepareResponse(Object(Illuminate\Http\Request), Object(Inertia\Response))
#18 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(169): Illuminate\Routing\Router->{closure:Illuminate\Routing\Router::runRouteWithinStack():807}(Object(Illuminate\Http\Request))
#19 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Http/Middleware/AddLinkHeadersForPreloadedAssets.php(32): Illuminate\Pipeline\Pipeline->{closure:Illuminate\Pipeline\Pipeline::prepareDestination():167}(Object(Illuminate\Http\Request))
#20 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets->handle(Object(Illuminate\Http\Request), Object(Closure))
#21 /home/logos/Dev/Work/Laravel/e-commerce/vendor/inertiajs/inertia-laravel/src/Middleware.php(100): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#22 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Inertia\Middleware->handle(Object(Illuminate\Http\Request), Object(Closure))
#23 /home/logos/Dev/Work/Laravel/e-commerce/app/Http/Middleware/HandleAppearance.php(21): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#24 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): App\Http\Middleware\HandleAppearance->handle(Object(Illuminate\Http\Request), Object(Closure))
#25 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/Middleware/SubstituteBindings.php(50): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#26 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Routing\Middleware\SubstituteBindings->handle(Object(Illuminate\Http\Request), Object(Closure))
#27 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Auth/Middleware/Authenticate.php(63): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#28 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Auth\Middleware\Authenticate->handle(Object(Illuminate\Http\Request), Object(Closure))
#29 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Http/Middleware/VerifyCsrfToken.php(87): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#30 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Foundation\Http\Middleware\VerifyCsrfToken->handle(Object(Illuminate\Http\Request), Object(Closure))
#31 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/View/Middleware/ShareErrorsFromSession.php(48): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#32 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\View\Middleware\ShareErrorsFromSession->handle(Object(Illuminate\Http\Request), Object(Closure))
#33 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Session/Middleware/StartSession.php(120): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#34 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Session/Middleware/StartSession.php(63): Illuminate\Session\Middleware\StartSession->handleStatefulRequest(Object(Illuminate\Http\Request), Object(Illuminate\Session\Store), Object(Closure))
#35 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Session\Middleware\StartSession->handle(Object(Illuminate\Http\Request), Object(Closure))
#36 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Cookie/Middleware/AddQueuedCookiesToResponse.php(36): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#37 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse->handle(Object(Illuminate\Http\Request), Object(Closure))
#38 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Cookie/Middleware/EncryptCookies.php(74): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#39 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Cookie\Middleware\EncryptCookies->handle(Object(Illuminate\Http\Request), Object(Closure))
#40 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(126): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#41 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/Router.php(807): Illuminate\Pipeline\Pipeline->then(Object(Closure))
#42 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/Router.php(786): Illuminate\Routing\Router->runRouteWithinStack(Object(Illuminate\Routing\Route), Object(Illuminate\Http\Request))
#43 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/Router.php(750): Illuminate\Routing\Router->runRoute(Object(Illuminate\Http\Request), Object(Illuminate\Routing\Route))
#44 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/Router.php(739): Illuminate\Routing\Router->dispatchToRoute(Object(Illuminate\Http\Request))
#45 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Http/Kernel.php(200): Illuminate\Routing\Router->dispatch(Object(Illuminate\Http\Request))
#46 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(169): Illuminate\Foundation\Http\Kernel->{closure:Illuminate\Foundation\Http\Kernel::dispatchToRouter():197}(Object(Illuminate\Http\Request))
#47 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Http/Middleware/TransformsRequest.php(21): Illuminate\Pipeline\Pipeline->{closure:Illuminate\Pipeline\Pipeline::prepareDestination():167}(Object(Illuminate\Http\Request))
#48 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Http/Middleware/ConvertEmptyStringsToNull.php(31): Illuminate\Foundation\Http\Middleware\TransformsRequest->handle(Object(Illuminate\Http\Request), Object(Closure))
#49 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Foundation\Http\Middleware\ConvertEmptyStringsToNull->handle(Object(Illuminate\Http\Request), Object(Closure))
#50 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Http/Middleware/TransformsRequest.php(21): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#51 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Http/Middleware/TrimStrings.php(51): Illuminate\Foundation\Http\Middleware\TransformsRequest->handle(Object(Illuminate\Http\Request), Object(Closure))
#52 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Foundation\Http\Middleware\TrimStrings->handle(Object(Illuminate\Http\Request), Object(Closure))
#53 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Http/Middleware/ValidatePostSize.php(27): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#54 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Http\Middleware\ValidatePostSize->handle(Object(Illuminate\Http\Request), Object(Closure))
#55 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Http/Middleware/PreventRequestsDuringMaintenance.php(109): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#56 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Foundation\Http\Middleware\PreventRequestsDuringMaintenance->handle(Object(Illuminate\Http\Request), Object(Closure))
#57 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Http/Middleware/HandleCors.php(48): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#58 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Http\Middleware\HandleCors->handle(Object(Illuminate\Http\Request), Object(Closure))
#59 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Http/Middleware/TrustProxies.php(58): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#60 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Http\Middleware\TrustProxies->handle(Object(Illuminate\Http\Request), Object(Closure))
#61 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Http/Middleware/InvokeDeferredCallbacks.php(22): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#62 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Foundation\Http\Middleware\InvokeDeferredCallbacks->handle(Object(Illuminate\Http\Request), Object(Closure))
#63 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Http/Middleware/ValidatePathEncoding.php(26): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#64 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Http\Middleware\ValidatePathEncoding->handle(Object(Illuminate\Http\Request), Object(Closure))
#65 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(126): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#66 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Http/Kernel.php(175): Illuminate\Pipeline\Pipeline->then(Object(Closure))
#67 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Http/Kernel.php(144): Illuminate\Foundation\Http\Kernel->sendRequestThroughRouter(Object(Illuminate\Http\Request))
#68 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Testing/Concerns/MakesHttpRequests.php(607): Illuminate\Foundation\Http\Kernel->handle(Object(Illuminate\Http\Request))
#69 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Testing/Concerns/MakesHttpRequests.php(368): Illuminate\Foundation\Testing\TestCase->call('GET', '/settings/profi...', Array, Array, Array, Array)
#70 /home/logos/Dev/Work/Laravel/e-commerce/tests/Feature/Settings/ProfileUpdateTest.php(12): Illuminate\Foundation\Testing\TestCase->get('/settings/profi...')
#71 /home/logos/Dev/Work/Laravel/e-commerce/vendor/pestphp/pest/src/Factories/TestCaseMethodFactory.php(168): P\Tests\Feature\Settings\ProfileUpdateTest->{closure:/home/dechasa/Dev/Work/Laravel/e-commerce/tests/Feature/Settings/ProfileUpdateTest.php:7}()
#72 [internal function]: P\Tests\Feature\Settings\ProfileUpdateTest->{closure:Pest\Factories\TestCaseMethodFactory::getClosure():158}()
#73 /home/logos/Dev/Work/Laravel/e-commerce/vendor/pestphp/pest/src/Concerns/Testable.php(419): call_user_func_array(Object(Closure), Array)
#74 /home/logos/Dev/Work/Laravel/e-commerce/vendor/pestphp/pest/src/Support/ExceptionTrace.php(26): P\Tests\Feature\Settings\ProfileUpdateTest->{closure:Pest\Concerns\Testable::__callClosure():419}()
#75 /home/logos/Dev/Work/Laravel/e-commerce/vendor/pestphp/pest/src/Concerns/Testable.php(419): Pest\Support\ExceptionTrace::ensure(Object(Closure))
#76 /home/logos/Dev/Work/Laravel/e-commerce/vendor/pestphp/pest/src/Concerns/Testable.php(321): P\Tests\Feature\Settings\ProfileUpdateTest->__callClosure(Object(Closure), Array)
#77 /home/logos/Dev/Work/Laravel/e-commerce/vendor/pestphp/pest/src/Factories/TestCaseFactory.php(169) : eval()'d code(17): P\Tests\Feature\Settings\ProfileUpdateTest->__runTest(Object(Closure))
#78 /home/logos/Dev/Work/Laravel/e-commerce/vendor/phpunit/phpunit/src/Framework/TestCase.php(1240): P\Tests\Feature\Settings\ProfileUpdateTest->__pest_evaluable_profile_page_is_displayed()
#79 /home/logos/Dev/Work/Laravel/e-commerce/vendor/phpunit/phpunit/src/Framework/TestCase.php(514): PHPUnit\Framework\TestCase->runTest()
#80 /home/logos/Dev/Work/Laravel/e-commerce/vendor/phpunit/phpunit/src/Framework/TestRunner/TestRunner.php(87): PHPUnit\Framework\TestCase->runBare()
#81 /home/logos/Dev/Work/Laravel/e-commerce/vendor/phpunit/phpunit/src/Framework/TestCase.php(361): PHPUnit\Framework\TestRunner->run(Object(P\Tests\Feature\Settings\ProfileUpdateTest))
#82 /home/logos/Dev/Work/Laravel/e-commerce/vendor/phpunit/phpunit/src/Framework/TestSuite.php(369): PHPUnit\Framework\TestCase->run()
#83 /home/logos/Dev/Work/Laravel/e-commerce/vendor/phpunit/phpunit/src/Framework/TestSuite.php(369): PHPUnit\Framework\TestSuite->run()
#84 /home/logos/Dev/Work/Laravel/e-commerce/vendor/phpunit/phpunit/src/Framework/TestSuite.php(369): PHPUnit\Framework\TestSuite->run()
#85 /home/logos/Dev/Work/Laravel/e-commerce/vendor/phpunit/phpunit/src/TextUI/TestRunner.php(64): PHPUnit\Framework\TestSuite->run()
#86 /home/logos/Dev/Work/Laravel/e-commerce/vendor/phpunit/phpunit/src/TextUI/Application.php(210): PHPUnit\TextUI\TestRunner->run(Object(PHPUnit\TextUI\Configuration\Configuration), Object(PHPUnit\Runner\ResultCache\DefaultResultCache), Object(PHPUnit\Framework\TestSuite))
#87 /home/logos/Dev/Work/Laravel/e-commerce/vendor/pestphp/pest/src/Kernel.php(103): PHPUnit\TextUI\Application->run(Array)
#88 /home/logos/Dev/Work/Laravel/e-commerce/vendor/pestphp/pest/bin/pest(184): Pest\Kernel->handle(Array, Array)
#89 /home/logos/Dev/Work/Laravel/e-commerce/vendor/pestphp/pest/bin/pest(192): {closure:/home/dechasa/Dev/Work/Laravel/e-commerce/vendor/pestphp/pest/bin/pest:18}()
#90 /home/logos/Dev/Work/Laravel/e-commerce/vendor/bin/pest(119): include('/home/dechasa/D...')
#91 {main}

Next Illuminate\View\ViewException: Vite manifest not found at: /home/logos/Dev/Work/Laravel/e-commerce/public/build/manifest.json (View: /home/dechasa/Dev/Work/Laravel/e-commerce/resources/views/app.blade.php) in /home/dechasa/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Vite.php:934
Stack trace:
#0 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/View/Engines/PhpEngine.php(59): Illuminate\View\Engines\CompilerEngine->handleViewException(Object(Illuminate\Foundation\ViteManifestNotFoundException), 2)
#1 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/View/Engines/CompilerEngine.php(76): Illuminate\View\Engines\PhpEngine->evaluatePath('/home/dechasa/D...', Array)
#2 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/View/View.php(208): Illuminate\View\Engines\CompilerEngine->get('/home/dechasa/D...', Array)
#3 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/View/View.php(191): Illuminate\View\View->getContents()
#4 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/View/View.php(160): Illuminate\View\View->renderContents()
#5 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Http/Response.php(78): Illuminate\View\View->render()
#6 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Http/Response.php(34): Illuminate\Http\Response->setContent(Object(Illuminate\View\View))
#7 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/ResponseFactory.php(61): Illuminate\Http\Response->__construct(Object(Illuminate\View\View), 200, Array)
#8 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/ResponseFactory.php(91): Illuminate\Routing\ResponseFactory->make(Object(Illuminate\View\View), 200, Array)
#9 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Support/Facades/Facade.php(361): Illuminate\Routing\ResponseFactory->view('app', Array)
#10 /home/logos/Dev/Work/Laravel/e-commerce/vendor/inertiajs/inertia-laravel/src/Response.php(135): Illuminate\Support\Facades\Facade::__callStatic('view', Array)
#11 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/Router.php(906): Inertia\Response->toResponse(Object(Illuminate\Http\Request))
#12 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/Router.php(891): Illuminate\Routing\Router::toResponse(Object(Illuminate\Http\Request), Object(Inertia\Response))
#13 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/Router.php(807): Illuminate\Routing\Router->prepareResponse(Object(Illuminate\Http\Request), Object(Inertia\Response))
#14 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(169): Illuminate\Routing\Router->{closure:Illuminate\Routing\Router::runRouteWithinStack():807}(Object(Illuminate\Http\Request))
#15 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Http/Middleware/AddLinkHeadersForPreloadedAssets.php(32): Illuminate\Pipeline\Pipeline->{closure:Illuminate\Pipeline\Pipeline::prepareDestination():167}(Object(Illuminate\Http\Request))
#16 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets->handle(Object(Illuminate\Http\Request), Object(Closure))
#17 /home/logos/Dev/Work/Laravel/e-commerce/vendor/inertiajs/inertia-laravel/src/Middleware.php(100): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#18 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Inertia\Middleware->handle(Object(Illuminate\Http\Request), Object(Closure))
#19 /home/logos/Dev/Work/Laravel/e-commerce/app/Http/Middleware/HandleAppearance.php(21): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#20 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): App\Http\Middleware\HandleAppearance->handle(Object(Illuminate\Http\Request), Object(Closure))
#21 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/Middleware/SubstituteBindings.php(50): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#22 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Routing\Middleware\SubstituteBindings->handle(Object(Illuminate\Http\Request), Object(Closure))
#23 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Auth/Middleware/Authenticate.php(63): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#24 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Auth\Middleware\Authenticate->handle(Object(Illuminate\Http\Request), Object(Closure))
#25 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Http/Middleware/VerifyCsrfToken.php(87): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#26 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Foundation\Http\Middleware\VerifyCsrfToken->handle(Object(Illuminate\Http\Request), Object(Closure))
#27 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/View/Middleware/ShareErrorsFromSession.php(48): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#28 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\View\Middleware\ShareErrorsFromSession->handle(Object(Illuminate\Http\Request), Object(Closure))
#29 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Session/Middleware/StartSession.php(120): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#30 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Session/Middleware/StartSession.php(63): Illuminate\Session\Middleware\StartSession->handleStatefulRequest(Object(Illuminate\Http\Request), Object(Illuminate\Session\Store), Object(Closure))
#31 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Session\Middleware\StartSession->handle(Object(Illuminate\Http\Request), Object(Closure))
#32 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Cookie/Middleware/AddQueuedCookiesToResponse.php(36): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#33 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse->handle(Object(Illuminate\Http\Request), Object(Closure))
#34 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Cookie/Middleware/EncryptCookies.php(74): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#35 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Cookie\Middleware\EncryptCookies->handle(Object(Illuminate\Http\Request), Object(Closure))
#36 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(126): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#37 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/Router.php(807): Illuminate\Pipeline\Pipeline->then(Object(Closure))
#38 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/Router.php(786): Illuminate\Routing\Router->runRouteWithinStack(Object(Illuminate\Routing\Route), Object(Illuminate\Http\Request))
#39 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/Router.php(750): Illuminate\Routing\Router->runRoute(Object(Illuminate\Http\Request), Object(Illuminate\Routing\Route))
#40 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/Router.php(739): Illuminate\Routing\Router->dispatchToRoute(Object(Illuminate\Http\Request))
#41 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Http/Kernel.php(200): Illuminate\Routing\Router->dispatch(Object(Illuminate\Http\Request))
#42 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(169): Illuminate\Foundation\Http\Kernel->{closure:Illuminate\Foundation\Http\Kernel::dispatchToRouter():197}(Object(Illuminate\Http\Request))
#43 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Http/Middleware/TransformsRequest.php(21): Illuminate\Pipeline\Pipeline->{closure:Illuminate\Pipeline\Pipeline::prepareDestination():167}(Object(Illuminate\Http\Request))
#44 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Http/Middleware/ConvertEmptyStringsToNull.php(31): Illuminate\Foundation\Http\Middleware\TransformsRequest->handle(Object(Illuminate\Http\Request), Object(Closure))
#45 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Foundation\Http\Middleware\ConvertEmptyStringsToNull->handle(Object(Illuminate\Http\Request), Object(Closure))
#46 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Http/Middleware/TransformsRequest.php(21): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#47 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Http/Middleware/TrimStrings.php(51): Illuminate\Foundation\Http\Middleware\TransformsRequest->handle(Object(Illuminate\Http\Request), Object(Closure))
#48 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Foundation\Http\Middleware\TrimStrings->handle(Object(Illuminate\Http\Request), Object(Closure))
#49 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Http/Middleware/ValidatePostSize.php(27): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#50 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Http\Middleware\ValidatePostSize->handle(Object(Illuminate\Http\Request), Object(Closure))
#51 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Http/Middleware/PreventRequestsDuringMaintenance.php(109): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#52 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Foundation\Http\Middleware\PreventRequestsDuringMaintenance->handle(Object(Illuminate\Http\Request), Object(Closure))
#53 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Http/Middleware/HandleCors.php(48): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#54 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Http\Middleware\HandleCors->handle(Object(Illuminate\Http\Request), Object(Closure))
#55 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Http/Middleware/TrustProxies.php(58): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#56 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Http\Middleware\TrustProxies->handle(Object(Illuminate\Http\Request), Object(Closure))
#57 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Http/Middleware/InvokeDeferredCallbacks.php(22): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#58 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Foundation\Http\Middleware\InvokeDeferredCallbacks->handle(Object(Illuminate\Http\Request), Object(Closure))
#59 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Http/Middleware/ValidatePathEncoding.php(26): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#60 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Http\Middleware\ValidatePathEncoding->handle(Object(Illuminate\Http\Request), Object(Closure))
#61 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(126): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#62 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Http/Kernel.php(175): Illuminate\Pipeline\Pipeline->then(Object(Closure))
#63 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Http/Kernel.php(144): Illuminate\Foundation\Http\Kernel->sendRequestThroughRouter(Object(Illuminate\Http\Request))
#64 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Testing/Concerns/MakesHttpRequests.php(607): Illuminate\Foundation\Http\Kernel->handle(Object(Illuminate\Http\Request))
#65 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Testing/Concerns/MakesHttpRequests.php(368): Illuminate\Foundation\Testing\TestCase->call('GET', '/settings/profi...', Array, Array, Array, Array)
#66 /home/logos/Dev/Work/Laravel/e-commerce/tests/Feature/Settings/ProfileUpdateTest.php(12): Illuminate\Foundation\Testing\TestCase->get('/settings/profi...')
#67 /home/logos/Dev/Work/Laravel/e-commerce/vendor/pestphp/pest/src/Factories/TestCaseMethodFactory.php(168): P\Tests\Feature\Settings\ProfileUpdateTest->{closure:/home/dechasa/Dev/Work/Laravel/e-commerce/tests/Feature/Settings/ProfileUpdateTest.php:7}()
#68 [internal function]: P\Tests\Feature\Settings\ProfileUpdateTest->{closure:Pest\Factories\TestCaseMethodFactory::getClosure():158}()
#69 /home/logos/Dev/Work/Laravel/e-commerce/vendor/pestphp/pest/src/Concerns/Testable.php(419): call_user_func_array(Object(Closure), Array)
#70 /home/logos/Dev/Work/Laravel/e-commerce/vendor/pestphp/pest/src/Support/ExceptionTrace.php(26): P\Tests\Feature\Settings\ProfileUpdateTest->{closure:Pest\Concerns\Testable::__callClosure():419}()
#71 /home/logos/Dev/Work/Laravel/e-commerce/vendor/pestphp/pest/src/Concerns/Testable.php(419): Pest\Support\ExceptionTrace::ensure(Object(Closure))
#72 /home/logos/Dev/Work/Laravel/e-commerce/vendor/pestphp/pest/src/Concerns/Testable.php(321): P\Tests\Feature\Settings\ProfileUpdateTest->__callClosure(Object(Closure), Array)
#73 /home/logos/Dev/Work/Laravel/e-commerce/vendor/pestphp/pest/src/Factories/TestCaseFactory.php(169) : eval()'d code(17): P\Tests\Feature\Settings\ProfileUpdateTest->__runTest(Object(Closure))
#74 /home/logos/Dev/Work/Laravel/e-commerce/vendor/phpunit/phpunit/src/Framework/TestCase.php(1240): P\Tests\Feature\Settings\ProfileUpdateTest->__pest_evaluable_profile_page_is_displayed()
#75 /home/logos/Dev/Work/Laravel/e-commerce/vendor/phpunit/phpunit/src/Framework/TestCase.php(514): PHPUnit\Framework\TestCase->runTest()
#76 /home/logos/Dev/Work/Laravel/e-commerce/vendor/phpunit/phpunit/src/Framework/TestRunner/TestRunner.php(87): PHPUnit\Framework\TestCase->runBare()
#77 /home/logos/Dev/Work/Laravel/e-commerce/vendor/phpunit/phpunit/src/Framework/TestCase.php(361): PHPUnit\Framework\TestRunner->run(Object(P\Tests\Feature\Settings\ProfileUpdateTest))
#78 /home/logos/Dev/Work/Laravel/e-commerce/vendor/phpunit/phpunit/src/Framework/TestSuite.php(369): PHPUnit\Framework\TestCase->run()
#79 /home/logos/Dev/Work/Laravel/e-commerce/vendor/phpunit/phpunit/src/Framework/TestSuite.php(369): PHPUnit\Framework\TestSuite->run()
#80 /home/logos/Dev/Work/Laravel/e-commerce/vendor/phpunit/phpunit/src/Framework/TestSuite.php(369): PHPUnit\Framework\TestSuite->run()
#81 /home/logos/Dev/Work/Laravel/e-commerce/vendor/phpunit/phpunit/src/TextUI/TestRunner.php(64): PHPUnit\Framework\TestSuite->run()
#82 /home/logos/Dev/Work/Laravel/e-commerce/vendor/phpunit/phpunit/src/TextUI/Application.php(210): PHPUnit\TextUI\TestRunner->run(Object(PHPUnit\TextUI\Configuration\Configuration), Object(PHPUnit\Runner\ResultCache\DefaultResultCache), Object(PHPUnit\Framework\TestSuite))
#83 /home/logos/Dev/Work/Laravel/e-commerce/vendor/pestphp/pest/src/Kernel.php(103): PHPUnit\TextUI\Application->run(Array)
#84 /home/logos/Dev/Work/Laravel/e-commerce/vendor/pestphp/pest/bin/pest(184): Pest\Kernel->handle(Array, Array)
#85 /home/logos/Dev/Work/Laravel/e-commerce/vendor/pestphp/pest/bin/pest(192): {closure:/home/dechasa/Dev/Work/Laravel/e-commerce/vendor/pestphp/pest/bin/pest:18}()
#86 /home/logos/Dev/Work/Laravel/e-commerce/vendor/bin/pest(119): include('/home/dechasa/D...')
#87 {main}

----------------------------------------------------------------------------------

Vite manifest not found at: /home/logos/Dev/Work/Laravel/e-commerce/public/build/manifest.json (View: /home/dechasa/Dev/Work/Laravel/e-commerce/resources/views/app.blade.php)

  at tests/Feature/Settings/ProfileUpdateTest.php:14
     10▕     $response = $this
     11▕         ->actingAs($user)
     12▕         ->get('/settings/profile');
     13▕ 
  ➜  14▕     $response->assertOk();
     15▕ });
     16▕ 
     17▕ test('profile information can be updated', function () {
     18▕     $user = User::factory()->create();

  ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────  
   FAILED  Tests\Feature\Settings\ProfileUpdateTest > profile information can be updated                                       
  Expected response status code [201, 301, 302, 303, 307, 308] but received 500.
Failed asserting that false is true.

The following exception occurred during the last request:

ReflectionException: Class "App\Http\Requests\ProfileUpdateRequest" does not exist in /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/ResolvesRouteDependencies.php:88
Stack trace:
#0 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/ResolvesRouteDependencies.php(88): ReflectionClass->__construct('App\\Http\\Reques...')
#1 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/ResolvesRouteDependencies.php(51): Illuminate\Routing\ControllerDispatcher->transformDependency(Object(ReflectionParameter), Array, Object(stdClass))
#2 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/ResolvesRouteDependencies.php(30): Illuminate\Routing\ControllerDispatcher->resolveMethodDependencies(Array, Object(ReflectionMethod))
#3 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/ControllerDispatcher.php(59): Illuminate\Routing\ControllerDispatcher->resolveClassMethodDependencies(Array, Object(App\Http\Controllers\Settings\ProfileController), 'update')
#4 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/ControllerDispatcher.php(40): Illuminate\Routing\ControllerDispatcher->resolveParameters(Object(Illuminate\Routing\Route), Object(App\Http\Controllers\Settings\ProfileController), 'update')
#5 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/Route.php(265): Illuminate\Routing\ControllerDispatcher->dispatch(Object(Illuminate\Routing\Route), Object(App\Http\Controllers\Settings\ProfileController), 'update')
#6 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/Route.php(211): Illuminate\Routing\Route->runController()
#7 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/Router.php(808): Illuminate\Routing\Route->run()
#8 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(169): Illuminate\Routing\Router->{closure:Illuminate\Routing\Router::runRouteWithinStack():807}(Object(Illuminate\Http\Request))
#9 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Http/Middleware/AddLinkHeadersForPreloadedAssets.php(32): Illuminate\Pipeline\Pipeline->{closure:Illuminate\Pipeline\Pipeline::prepareDestination():167}(Object(Illuminate\Http\Request))
#10 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets->handle(Object(Illuminate\Http\Request), Object(Closure))
#11 /home/logos/Dev/Work/Laravel/e-commerce/vendor/inertiajs/inertia-laravel/src/Middleware.php(100): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#12 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Inertia\Middleware->handle(Object(Illuminate\Http\Request), Object(Closure))
#13 /home/logos/Dev/Work/Laravel/e-commerce/app/Http/Middleware/HandleAppearance.php(21): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#14 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): App\Http\Middleware\HandleAppearance->handle(Object(Illuminate\Http\Request), Object(Closure))
#15 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/Middleware/SubstituteBindings.php(50): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#16 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Routing\Middleware\SubstituteBindings->handle(Object(Illuminate\Http\Request), Object(Closure))
#17 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Auth/Middleware/Authenticate.php(63): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#18 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Auth\Middleware\Authenticate->handle(Object(Illuminate\Http\Request), Object(Closure))
#19 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Http/Middleware/VerifyCsrfToken.php(87): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#20 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Foundation\Http\Middleware\VerifyCsrfToken->handle(Object(Illuminate\Http\Request), Object(Closure))
#21 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/View/Middleware/ShareErrorsFromSession.php(48): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#22 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\View\Middleware\ShareErrorsFromSession->handle(Object(Illuminate\Http\Request), Object(Closure))
#23 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Session/Middleware/StartSession.php(120): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#24 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Session/Middleware/StartSession.php(63): Illuminate\Session\Middleware\StartSession->handleStatefulRequest(Object(Illuminate\Http\Request), Object(Illuminate\Session\Store), Object(Closure))
#25 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Session\Middleware\StartSession->handle(Object(Illuminate\Http\Request), Object(Closure))
#26 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Cookie/Middleware/AddQueuedCookiesToResponse.php(36): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#27 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse->handle(Object(Illuminate\Http\Request), Object(Closure))
#28 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Cookie/Middleware/EncryptCookies.php(74): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#29 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Cookie\Middleware\EncryptCookies->handle(Object(Illuminate\Http\Request), Object(Closure))
#30 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(126): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#31 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/Router.php(807): Illuminate\Pipeline\Pipeline->then(Object(Closure))
#32 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/Router.php(786): Illuminate\Routing\Router->runRouteWithinStack(Object(Illuminate\Routing\Route), Object(Illuminate\Http\Request))
#33 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/Router.php(750): Illuminate\Routing\Router->runRoute(Object(Illuminate\Http\Request), Object(Illuminate\Routing\Route))
#34 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/Router.php(739): Illuminate\Routing\Router->dispatchToRoute(Object(Illuminate\Http\Request))
#35 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Http/Kernel.php(200): Illuminate\Routing\Router->dispatch(Object(Illuminate\Http\Request))
#36 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(169): Illuminate\Foundation\Http\Kernel->{closure:Illuminate\Foundation\Http\Kernel::dispatchToRouter():197}(Object(Illuminate\Http\Request))
#37 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Http/Middleware/TransformsRequest.php(21): Illuminate\Pipeline\Pipeline->{closure:Illuminate\Pipeline\Pipeline::prepareDestination():167}(Object(Illuminate\Http\Request))
#38 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Http/Middleware/ConvertEmptyStringsToNull.php(31): Illuminate\Foundation\Http\Middleware\TransformsRequest->handle(Object(Illuminate\Http\Request), Object(Closure))
#39 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Foundation\Http\Middleware\ConvertEmptyStringsToNull->handle(Object(Illuminate\Http\Request), Object(Closure))
#40 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Http/Middleware/TransformsRequest.php(21): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#41 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Http/Middleware/TrimStrings.php(51): Illuminate\Foundation\Http\Middleware\TransformsRequest->handle(Object(Illuminate\Http\Request), Object(Closure))
#42 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Foundation\Http\Middleware\TrimStrings->handle(Object(Illuminate\Http\Request), Object(Closure))
#43 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Http/Middleware/ValidatePostSize.php(27): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#44 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Http\Middleware\ValidatePostSize->handle(Object(Illuminate\Http\Request), Object(Closure))
#45 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Http/Middleware/PreventRequestsDuringMaintenance.php(109): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#46 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Foundation\Http\Middleware\PreventRequestsDuringMaintenance->handle(Object(Illuminate\Http\Request), Object(Closure))
#47 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Http/Middleware/HandleCors.php(48): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#48 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Http\Middleware\HandleCors->handle(Object(Illuminate\Http\Request), Object(Closure))
#49 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Http/Middleware/TrustProxies.php(58): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#50 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Http\Middleware\TrustProxies->handle(Object(Illuminate\Http\Request), Object(Closure))
#51 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Http/Middleware/InvokeDeferredCallbacks.php(22): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#52 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Foundation\Http\Middleware\InvokeDeferredCallbacks->handle(Object(Illuminate\Http\Request), Object(Closure))
#53 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Http/Middleware/ValidatePathEncoding.php(26): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#54 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Http\Middleware\ValidatePathEncoding->handle(Object(Illuminate\Http\Request), Object(Closure))
#55 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(126): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#56 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Http/Kernel.php(175): Illuminate\Pipeline\Pipeline->then(Object(Closure))
#57 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Http/Kernel.php(144): Illuminate\Foundation\Http\Kernel->sendRequestThroughRouter(Object(Illuminate\Http\Request))
#58 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Testing/Concerns/MakesHttpRequests.php(607): Illuminate\Foundation\Http\Kernel->handle(Object(Illuminate\Http\Request))
#59 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Testing/Concerns/MakesHttpRequests.php(457): Illuminate\Foundation\Testing\TestCase->call('PATCH', '/settings/profi...', Array, Array, Array, Array)
#60 /home/logos/Dev/Work/Laravel/e-commerce/tests/Feature/Settings/ProfileUpdateTest.php(22): Illuminate\Foundation\Testing\TestCase->patch('/settings/profi...', Array)
#61 /home/logos/Dev/Work/Laravel/e-commerce/vendor/pestphp/pest/src/Factories/TestCaseMethodFactory.php(168): P\Tests\Feature\Settings\ProfileUpdateTest->{closure:/home/dechasa/Dev/Work/Laravel/e-commerce/tests/Feature/Settings/ProfileUpdateTest.php:17}()
#62 [internal function]: P\Tests\Feature\Settings\ProfileUpdateTest->{closure:Pest\Factories\TestCaseMethodFactory::getClosure():158}()
#63 /home/logos/Dev/Work/Laravel/e-commerce/vendor/pestphp/pest/src/Concerns/Testable.php(419): call_user_func_array(Object(Closure), Array)
#64 /home/logos/Dev/Work/Laravel/e-commerce/vendor/pestphp/pest/src/Support/ExceptionTrace.php(26): P\Tests\Feature\Settings\ProfileUpdateTest->{closure:Pest\Concerns\Testable::__callClosure():419}()
#65 /home/logos/Dev/Work/Laravel/e-commerce/vendor/pestphp/pest/src/Concerns/Testable.php(419): Pest\Support\ExceptionTrace::ensure(Object(Closure))
#66 /home/logos/Dev/Work/Laravel/e-commerce/vendor/pestphp/pest/src/Concerns/Testable.php(321): P\Tests\Feature\Settings\ProfileUpdateTest->__callClosure(Object(Closure), Array)
#67 /home/logos/Dev/Work/Laravel/e-commerce/vendor/pestphp/pest/src/Factories/TestCaseFactory.php(169) : eval()'d code(26): P\Tests\Feature\Settings\ProfileUpdateTest->__runTest(Object(Closure))
#68 /home/logos/Dev/Work/Laravel/e-commerce/vendor/phpunit/phpunit/src/Framework/TestCase.php(1240): P\Tests\Feature\Settings\ProfileUpdateTest->__pest_evaluable_profile_information_can_be_updated()
#69 /home/logos/Dev/Work/Laravel/e-commerce/vendor/phpunit/phpunit/src/Framework/TestCase.php(514): PHPUnit\Framework\TestCase->runTest()
#70 /home/logos/Dev/Work/Laravel/e-commerce/vendor/phpunit/phpunit/src/Framework/TestRunner/TestRunner.php(87): PHPUnit\Framework\TestCase->runBare()
#71 /home/logos/Dev/Work/Laravel/e-commerce/vendor/phpunit/phpunit/src/Framework/TestCase.php(361): PHPUnit\Framework\TestRunner->run(Object(P\Tests\Feature\Settings\ProfileUpdateTest))
#72 /home/logos/Dev/Work/Laravel/e-commerce/vendor/phpunit/phpunit/src/Framework/TestSuite.php(369): PHPUnit\Framework\TestCase->run()
#73 /home/logos/Dev/Work/Laravel/e-commerce/vendor/phpunit/phpunit/src/Framework/TestSuite.php(369): PHPUnit\Framework\TestSuite->run()
#74 /home/logos/Dev/Work/Laravel/e-commerce/vendor/phpunit/phpunit/src/Framework/TestSuite.php(369): PHPUnit\Framework\TestSuite->run()
#75 /home/logos/Dev/Work/Laravel/e-commerce/vendor/phpunit/phpunit/src/TextUI/TestRunner.php(64): PHPUnit\Framework\TestSuite->run()
#76 /home/logos/Dev/Work/Laravel/e-commerce/vendor/phpunit/phpunit/src/TextUI/Application.php(210): PHPUnit\TextUI\TestRunner->run(Object(PHPUnit\TextUI\Configuration\Configuration), Object(PHPUnit\Runner\ResultCache\DefaultResultCache), Object(PHPUnit\Framework\TestSuite))
#77 /home/logos/Dev/Work/Laravel/e-commerce/vendor/pestphp/pest/src/Kernel.php(103): PHPUnit\TextUI\Application->run(Array)
#78 /home/logos/Dev/Work/Laravel/e-commerce/vendor/pestphp/pest/bin/pest(184): Pest\Kernel->handle(Array, Array)
#79 /home/logos/Dev/Work/Laravel/e-commerce/vendor/pestphp/pest/bin/pest(192): {closure:/home/dechasa/Dev/Work/Laravel/e-commerce/vendor/pestphp/pest/bin/pest:18}()
#80 /home/logos/Dev/Work/Laravel/e-commerce/vendor/bin/pest(119): include('/home/dechasa/D...')
#81 {main}

----------------------------------------------------------------------------------

Class "App\Http\Requests\ProfileUpdateRequest" does not exist

  at tests/Feature/Settings/ProfileUpdateTest.php:29
     25▕         ]);
     26▕ 
     27▕     $response
     28▕         ->assertSessionHasNoErrors()
  ➜  29▕         ->assertRedirect('/settings/profile');
     30▕ 
     31▕     $user->refresh();
     32▕ 
     33▕     expect($user->name)->toBe('Test User');

  ───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────  
   FAILED  Tests\Feature\Settings\ProfileUpdateTest > email verification status is unchanged when the email address is unch…   
  Expected response status code [201, 301, 302, 303, 307, 308] but received 500.
Failed asserting that false is true.

The following exception occurred during the last request:

ReflectionException: Class "App\Http\Requests\ProfileUpdateRequest" does not exist in /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/ResolvesRouteDependencies.php:88
Stack trace:
#0 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/ResolvesRouteDependencies.php(88): ReflectionClass->__construct('App\\Http\\Reques...')
#1 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/ResolvesRouteDependencies.php(51): Illuminate\Routing\ControllerDispatcher->transformDependency(Object(ReflectionParameter), Array, Object(stdClass))
#2 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/ResolvesRouteDependencies.php(30): Illuminate\Routing\ControllerDispatcher->resolveMethodDependencies(Array, Object(ReflectionMethod))
#3 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/ControllerDispatcher.php(59): Illuminate\Routing\ControllerDispatcher->resolveClassMethodDependencies(Array, Object(App\Http\Controllers\Settings\ProfileController), 'update')
#4 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/ControllerDispatcher.php(40): Illuminate\Routing\ControllerDispatcher->resolveParameters(Object(Illuminate\Routing\Route), Object(App\Http\Controllers\Settings\ProfileController), 'update')
#5 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/Route.php(265): Illuminate\Routing\ControllerDispatcher->dispatch(Object(Illuminate\Routing\Route), Object(App\Http\Controllers\Settings\ProfileController), 'update')
#6 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/Route.php(211): Illuminate\Routing\Route->runController()
#7 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/Router.php(808): Illuminate\Routing\Route->run()
#8 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(169): Illuminate\Routing\Router->{closure:Illuminate\Routing\Router::runRouteWithinStack():807}(Object(Illuminate\Http\Request))
#9 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Http/Middleware/AddLinkHeadersForPreloadedAssets.php(32): Illuminate\Pipeline\Pipeline->{closure:Illuminate\Pipeline\Pipeline::prepareDestination():167}(Object(Illuminate\Http\Request))
#10 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets->handle(Object(Illuminate\Http\Request), Object(Closure))
#11 /home/logos/Dev/Work/Laravel/e-commerce/vendor/inertiajs/inertia-laravel/src/Middleware.php(100): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#12 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Inertia\Middleware->handle(Object(Illuminate\Http\Request), Object(Closure))
#13 /home/logos/Dev/Work/Laravel/e-commerce/app/Http/Middleware/HandleAppearance.php(21): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#14 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): App\Http\Middleware\HandleAppearance->handle(Object(Illuminate\Http\Request), Object(Closure))
#15 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/Middleware/SubstituteBindings.php(50): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#16 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Routing\Middleware\SubstituteBindings->handle(Object(Illuminate\Http\Request), Object(Closure))
#17 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Auth/Middleware/Authenticate.php(63): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#18 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Auth\Middleware\Authenticate->handle(Object(Illuminate\Http\Request), Object(Closure))
#19 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Http/Middleware/VerifyCsrfToken.php(87): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#20 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Foundation\Http\Middleware\VerifyCsrfToken->handle(Object(Illuminate\Http\Request), Object(Closure))
#21 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/View/Middleware/ShareErrorsFromSession.php(48): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#22 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\View\Middleware\ShareErrorsFromSession->handle(Object(Illuminate\Http\Request), Object(Closure))
#23 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Session/Middleware/StartSession.php(120): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#24 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Session/Middleware/StartSession.php(63): Illuminate\Session\Middleware\StartSession->handleStatefulRequest(Object(Illuminate\Http\Request), Object(Illuminate\Session\Store), Object(Closure))
#25 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Session\Middleware\StartSession->handle(Object(Illuminate\Http\Request), Object(Closure))
#26 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Cookie/Middleware/AddQueuedCookiesToResponse.php(36): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#27 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Cookie\Middleware\AddQueuedCookiesToResponse->handle(Object(Illuminate\Http\Request), Object(Closure))
#28 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Cookie/Middleware/EncryptCookies.php(74): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#29 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Cookie\Middleware\EncryptCookies->handle(Object(Illuminate\Http\Request), Object(Closure))
#30 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(126): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#31 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/Router.php(807): Illuminate\Pipeline\Pipeline->then(Object(Closure))
#32 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/Router.php(786): Illuminate\Routing\Router->runRouteWithinStack(Object(Illuminate\Routing\Route), Object(Illuminate\Http\Request))
#33 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/Router.php(750): Illuminate\Routing\Router->runRoute(Object(Illuminate\Http\Request), Object(Illuminate\Routing\Route))
#34 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Routing/Router.php(739): Illuminate\Routing\Router->dispatchToRoute(Object(Illuminate\Http\Request))
#35 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Http/Kernel.php(200): Illuminate\Routing\Router->dispatch(Object(Illuminate\Http\Request))
#36 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(169): Illuminate\Foundation\Http\Kernel->{closure:Illuminate\Foundation\Http\Kernel::dispatchToRouter():197}(Object(Illuminate\Http\Request))
#37 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Http/Middleware/TransformsRequest.php(21): Illuminate\Pipeline\Pipeline->{closure:Illuminate\Pipeline\Pipeline::prepareDestination():167}(Object(Illuminate\Http\Request))
#38 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Http/Middleware/ConvertEmptyStringsToNull.php(31): Illuminate\Foundation\Http\Middleware\TransformsRequest->handle(Object(Illuminate\Http\Request), Object(Closure))
#39 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Foundation\Http\Middleware\ConvertEmptyStringsToNull->handle(Object(Illuminate\Http\Request), Object(Closure))
#40 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Http/Middleware/TransformsRequest.php(21): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#41 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Http/Middleware/TrimStrings.php(51): Illuminate\Foundation\Http\Middleware\TransformsRequest->handle(Object(Illuminate\Http\Request), Object(Closure))
#42 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Foundation\Http\Middleware\TrimStrings->handle(Object(Illuminate\Http\Request), Object(Closure))
#43 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Http/Middleware/ValidatePostSize.php(27): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#44 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Http\Middleware\ValidatePostSize->handle(Object(Illuminate\Http\Request), Object(Closure))
#45 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Http/Middleware/PreventRequestsDuringMaintenance.php(109): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#46 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Foundation\Http\Middleware\PreventRequestsDuringMaintenance->handle(Object(Illuminate\Http\Request), Object(Closure))
#47 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Http/Middleware/HandleCors.php(48): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#48 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Http\Middleware\HandleCors->handle(Object(Illuminate\Http\Request), Object(Closure))
#49 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Http/Middleware/TrustProxies.php(58): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#50 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Http\Middleware\TrustProxies->handle(Object(Illuminate\Http\Request), Object(Closure))
#51 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Http/Middleware/InvokeDeferredCallbacks.php(22): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#52 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Foundation\Http\Middleware\InvokeDeferredCallbacks->handle(Object(Illuminate\Http\Request), Object(Closure))
#53 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Http/Middleware/ValidatePathEncoding.php(26): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#54 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(208): Illuminate\Http\Middleware\ValidatePathEncoding->handle(Object(Illuminate\Http\Request), Object(Closure))
#55 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Pipeline/Pipeline.php(126): Illuminate\Pipeline\Pipeline->{closure:{closure:Illuminate\Pipeline\Pipeline::carry():183}:184}(Object(Illuminate\Http\Request))
#56 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Http/Kernel.php(175): Illuminate\Pipeline\Pipeline->then(Object(Closure))
#57 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Http/Kernel.php(144): Illuminate\Foundation\Http\Kernel->sendRequestThroughRouter(Object(Illuminate\Http\Request))
#58 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Testing/Concerns/MakesHttpRequests.php(607): Illuminate\Foundation\Http\Kernel->handle(Object(Illuminate\Http\Request))
#59 /home/logos/Dev/Work/Laravel/e-commerce/vendor/laravel/framework/src/Illuminate/Foundation/Testing/Concerns/MakesHttpRequests.php(457): Illuminate\Foundation\Testing\TestCase->call('PATCH', '/settings/profi...', Array, Array, Array, Array)
#60 /home/logos/Dev/Work/Laravel/e-commerce/tests/Feature/Settings/ProfileUpdateTest.php(43): Illuminate\Foundation\Testing\TestCase->patch('/settings/profi...', Array)
#61 /home/logos/Dev/Work/Laravel/e-commerce/vendor/pestphp/pest/src/Factories/TestCaseMethodFactory.php(168): P\Tests\Feature\Settings\ProfileUpdateTest->{closure:/home/dechasa/Dev/Work/Laravel/e-commerce/tests/Feature/Settings/ProfileUpdateTest.php:38}()
#62 [internal function]: P\Tests\Feature\Settings\ProfileUpdateTest->{closure:Pest\Factories\TestCaseMethodFactory::getClosure():158}()
#63 /home/logos/Dev/Work/Laravel/e-commerce/vendor/pestphp/pest/src/Concerns/Testable.php(419): call_user_func_array(Object(Closure), Array)
#64 /home/logos/Dev/Work/Laravel/e-commerce/vendor/pestphp/pest/src/Support/ExceptionTrace.php(26): P\Tests\Feature\Settings\ProfileUpdateTest->{closure:Pest\Concerns\Testable::__callClosure():419}()
#65 /home/logos/Dev/Work/Laravel/e-commerce/vendor/pestphp/pest/src/Concerns/Testable.php(419): Pest\Support\ExceptionTrace::ensure(Object(Closure))
#66 /home/logos/Dev/Work/Laravel/e-commerce/vendor/pestphp/pest/src/Concerns/Testable.php(321): P\Tests\Feature\Settings\ProfileUpdateTest->__callClosure(Object(Closure), Array)
#67 /home/logos/Dev/Work/Laravel/e-commerce/vendor/pestphp/pest/src/Factories/TestCaseFactory.php(169) : eval()'d code(35): P\Tests\Feature\Settings\ProfileUpdateTest->__runTest(Object(Closure))
#68 /home/logos/Dev/Work/Laravel/e-commerce/vendor/phpunit/phpunit/src/Framework/TestCase.php(1240): P\Tests\Feature\Settings\ProfileUpdateTest->__pest_evaluable_email_verification_status_is_unchanged_when_the_email_address_is_unchanged()
#69 /home/logos/Dev/Work/Laravel/e-commerce/vendor/phpunit/phpunit/src/Framework/TestCase.php(514): PHPUnit\Framework\TestCase->runTest()
#70 /home/logos/Dev/Work/Laravel/e-commerce/vendor/phpunit/phpunit/src/Framework/TestRunner/TestRunner.php(87): PHPUnit\Framework\TestCase->runBare()
#71 /home/logos/Dev/Work/Laravel/e-commerce/vendor/phpunit/phpunit/src/Framework/TestCase.php(361): PHPUnit\Framework\TestRunner->run(Object(P\Tests\Feature\Settings\ProfileUpdateTest))
#72 /home/logos/Dev/Work/Laravel/e-commerce/vendor/phpunit/phpunit/src/Framework/TestSuite.php(369): PHPUnit\Framework\TestCase->run()
#73 /home/logos/Dev/Work/Laravel/e-commerce/vendor/phpunit/phpunit/src/Framework/TestSuite.php(369): PHPUnit\Framework\TestSuite->run()
#74 /home/logos/Dev/Work/Laravel/e-commerce/vendor/phpunit/phpunit/src/Framework/TestSuite.php(369): PHPUnit\Framework\TestSuite->run()
#75 /home/logos/Dev/Work/Laravel/e-commerce/vendor/phpunit/phpunit/src/TextUI/TestRunner.php(64): PHPUnit\Framework\TestSuite->run()
#76 /home/logos/Dev/Work/Laravel/e-commerce/vendor/phpunit/phpunit/src/TextUI/Application.php(210): PHPUnit\TextUI\TestRunner->run(Object(PHPUnit\TextUI\Configuration\Configuration), Object(PHPUnit\Runner\ResultCache\DefaultResultCache), Object(PHPUnit\Framework\TestSuite))
#77 /home/logos/Dev/Work/Laravel/e-commerce/vendor/pestphp/pest/src/Kernel.php(103): PHPUnit\TextUI\Application->run(Array)
#78 /home/logos/Dev/Work/Laravel/e-commerce/vendor/pestphp/pest/bin/pest(184): Pest\Kernel->handle(Array, Array)
#79 /home/logos/Dev/Work/Laravel/e-commerce/vendor/pestphp/pest/bin/pest(192): {closure:/home/dechasa/Dev/Work/Laravel/e-commerce/vendor/pestphp/pest/bin/pest:18}()
#80 /home/logos/Dev/Work/Laravel/e-commerce/vendor/bin/pest(119): include('/home/dechasa/D...')
#81 {main}

----------------------------------------------------------------------------------

Class "App\Http\Requests\ProfileUpdateRequest" does not exist

  at tests/Feature/Settings/ProfileUpdateTest.php:50
     46▕         ]);
     47▕ 
     48▕     $response
     49▕         ->assertSessionHasNoErrors()
  ➜  50▕         ->assertRedirect('/settings/profile');
     51▕ 
     52▕     expect($user->refresh()->email_verified_at)->not->toBeNull();
     53▕ });
     54▕


  Tests:    13 failed, 14 passed (52 assertions)
  Duration: 4.03s


   PASS  Tests\Unit\ExampleTest
  ✓ that true is true

   FAIL  Tests\Feature\Auth\AuthenticationTest
  ⨯ login screen can be rendered                                                                                        0.41s  
  ✓ users can authenticate using the login screen                                                                       0.03s  
  ✓ users can not authenticate with invalid password                                                                    0.21s  
  ✓ users can logout                                                                                                    0.01s  

   FAIL  Tests\Feature\Auth\EmailVerificationTest
  ⨯ email verification screen can be rendered                                                                           0.25s  
  ✓ email can be verified                                                                                               0.01s  
  ✓ email is not verified with invalid hash                                                                             0.01s  

   FAIL  Tests\Feature\Auth\PasswordConfirmationTest
  ⨯ confirm password screen can be rendered                                                                             0.24s  
  ✓ password can be confirmed                                                                                           0.01s  
  ✓ password is not confirmed with invalid password                                                                     0.21s  
