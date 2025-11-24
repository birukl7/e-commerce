# E2E Testing Debug Guide

## Running Tests Verbosely

### 1. Verbose Mode (with console logs)
```bash
# Run with verbose logging
VERBOSE=true npm run test:e2e tests/E2E/example.spec.ts

# Or set it as environment variable
export VERBOSE=true
npm run test:e2e tests/E2E/example.spec.ts
```

### 2. UI Mode (Interactive)
```bash
# Opens Playwright UI for step-by-step debugging
npm run test:e2e:ui
```

### 3. Headed Mode (See Browser)
```bash
# Run tests with visible browser
npm run test:e2e:headed tests/E2E/example.spec.ts
```

### 4. Debug Mode (Step Through)
```bash
# Pauses execution and allows step-by-step debugging
npm run test:e2e:debug tests/E2E/example.spec.ts
```

### 5. Trace Mode (Full Recording)
```bash
# Records full trace for later analysis
npm run test:e2e:trace tests/E2E/example.spec.ts

# View trace
npx playwright show-trace test-results/trace.zip
```

## Debugging Specific Issues

### Login Issues

If login is failing, run with verbose mode:
```bash
VERBOSE=true npm run test:e2e tests/E2E/example.spec.ts
```

This will show:
- When navigation happens
- Which selectors are used
- Current URL at each step
- Any errors encountered

### View Screenshots

Screenshots are automatically captured on failure:
- Location: `test-results/`
- View in HTML report: `npm run test:e2e:report`

### View Videos

Videos are captured on failure:
- Location: `test-results/`
- Format: WebM

### Check Network Requests

Add this to your test:
```typescript
test('my test', async ({ page }) => {
  // Log all network requests
  page.on('request', request => console.log('→', request.method(), request.url()));
  page.on('response', response => console.log('←', response.status(), response.url()));
  
  // Your test code
});
```

### Check Console Logs

```typescript
test('my test', async ({ page }) => {
  // Log browser console
  page.on('console', msg => console.log('BROWSER:', msg.text()));
  
  // Your test code
});
```

### Pause Execution

Add breakpoints in your test:
```typescript
test('my test', async ({ page }) => {
  await page.pause(); // Opens Playwright Inspector
  // Your test code
});
```

## Common Debugging Commands

```bash
# Run single test file
npm run test:e2e tests/E2E/example.spec.ts

# Run specific test by name
npm run test:e2e -g "should be able to login"

# Run with specific browser
npm run test:e2e -- --project=chromium

# Run with retries disabled
npm run test:e2e -- --retries=0

# Run with longer timeout
npm run test:e2e -- --timeout=60000
```

## Environment Variables

```bash
# Enable verbose logging
VERBOSE=true npm run test:e2e

# Enable debug mode
DEBUG=true npm run test:e2e

# Set custom base URL
APP_URL=http://localhost:8001 npm run test:e2e
```

## Tips

1. **Use UI Mode First**: `npm run test:e2e:ui` is the easiest way to debug
2. **Check Screenshots**: Always check screenshots in `test-results/` after failures
3. **Use Trace Viewer**: For complex issues, use trace mode and view in trace viewer
4. **Add Console Logs**: Add `console.log()` in your test code to see what's happening
5. **Slow Down**: Use `await page.waitForTimeout(1000)` to slow down execution and see what's happening

