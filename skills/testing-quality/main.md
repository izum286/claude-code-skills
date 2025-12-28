# Testing & Quality Assurance Skill

Dieser Skill hilft bei der Erstellung und Pflege von Tests für deine React/TypeScript-Projekte mit Vitest und Playwright.

## Wann wird dieser Skill aktiviert?

- Du erwähnst: test, testing, Vitest, Playwright, coverage, E2E
- Du arbeitest in `tests/`, `__tests__/`, `*.test.ts`, `*.spec.ts` Dateien
- Du fragst nach Test-Strategien oder Quality Assurance

## Test-Pyramide

```
       /\
      /E2E\        (Wenige, kritische User-Journeys)
     /______\
    /  Inte- \     (Mittel, Feature-Tests)
   / gration  \
  /____________\
 /    Unit      \  (Viele, schnelle Component-Tests)
/________________\
```

**Regel:** 70% Unit, 20% Integration, 10% E2E

---

## 1. Unit & Component Tests (Vitest + React Testing Library)

### Setup

```bash
npm install -D vitest @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom
```

**vitest.config.ts:**
```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './tests/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', 'tests/']
    }
  }
});
```

**tests/setup.ts:**
```ts
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => {
  cleanup();
});
```

### Component Testing Best Practices

**✅ GUT - Test User Behavior:**
```tsx
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { Button } from './Button';

describe('Button', () => {
  it('calls onClick when clicked', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();

    render(<Button onClick={onClick}>Click me</Button>);

    await user.click(screen.getByRole('button', { name: /click me/i }));

    expect(onClick).toHaveBeenCalledOnce();
  });

  it('shows loading state', () => {
    render(<Button loading>Submit</Button>);

    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });
});
```

**❌ SCHLECHT - Test Implementation Details:**
```tsx
// ❌ Testet interne State-Namen
expect(component.state.isLoading).toBe(true);

// ❌ Testet CSS-Klassen
expect(button).toHaveClass('btn-primary');

// ✅ Besser: Test sichtbares Verhalten
expect(screen.getByRole('button')).toBeDisabled();
```

### Testing-Patterns

**1. Query-Prioritäten (getBy > queryBy > findBy):**
```ts
// ✅ Für Elemente, die da sein müssen
const button = screen.getByRole('button');

// ✅ Für Elemente, die vielleicht fehlen
const error = screen.queryByText(/error/i);
expect(error).not.toBeInTheDocument();

// ✅ Für async Elemente (wartet automatisch)
const result = await screen.findByText(/success/i);
```

**2. User-Events statt fireEvent:**
```ts
// ❌ Zu low-level
fireEvent.change(input, { target: { value: 'test' } });

// ✅ Simuliert echte User-Interaktion
const user = userEvent.setup();
await user.type(input, 'test');
```

**3. Mock API Calls:**
```ts
import { vi } from 'vitest';

// Mock fetch globally
global.fetch = vi.fn();

beforeEach(() => {
  (fetch as any).mockResolvedValue({
    ok: true,
    json: async () => ({ data: 'mocked' })
  });
});

afterEach(() => {
  vi.clearAllMocks();
});

it('loads data on mount', async () => {
  render(<DataComponent />);

  await screen.findByText('mocked');
  expect(fetch).toHaveBeenCalledWith('/api/data');
});
```

---

## 2. E2E Tests (Playwright)

### Setup

```bash
npm init playwright@latest
```

**playwright.config.ts:**
```ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30000,
  retries: process.env.CI ? 2 : 0,
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } }
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI
  }
});
```

### E2E Testing Best Practices

**Page Object Pattern:**
```ts
// e2e/pages/LoginPage.ts
export class LoginPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/login');
  }

  async login(email: string, password: string) {
    await this.page.getByLabel('Email').fill(email);
    await this.page.getByLabel('Password').fill(password);
    await this.page.getByRole('button', { name: 'Login' }).click();
  }

  async expectErrorMessage(message: string) {
    await expect(this.page.getByText(message)).toBeVisible();
  }
}

// e2e/auth.spec.ts
import { test } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';

test('login with valid credentials', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login('user@test.com', 'password123');

  await expect(page).toHaveURL('/dashboard');
});
```

**Kritische User-Journeys:**
```ts
// ManufacturingInsideAnalyzer: File Upload → Analysis → Result
test('complete analysis flow', async ({ page }) => {
  await page.goto('/');

  // Upload file
  const fileInput = page.locator('input[type="file"]');
  await fileInput.setInputFiles('test-data/sample.csv');

  // Wait for analysis
  await expect(page.getByText('Analyzing...')).toBeVisible();
  await expect(page.getByText('Analysis Complete')).toBeVisible({ timeout: 15000 });

  // Verify results
  const kpis = page.locator('[data-testid="kpi-card"]');
  await expect(kpis).toHaveCount(5);
});
```

---

## 3. Coverage-Ziele

### Projekt-spezifische Targets

**ManufacturingInsideAnalyzer:** 90% (Production-ready)
**digitalTwin:** 80% (MVP)
**DresdenAIInsights:** 70% (Marketing Site)

### Coverage-Prüfung

```bash
# Unit Tests
npm run test -- --coverage

# Coverage-Gates in CI
# package.json
{
  "scripts": {
    "test:coverage": "vitest run --coverage --coverage.lines=80 --coverage.functions=80"
  }
}
```

**Was NICHT testen:**
- Third-Party Libraries (Radix UI, Gemini SDK)
- Triviale Getter/Setter
- Types & Interfaces
- Mock-Daten

---

## 4. Mocking-Strategien

### API Mocks (MSW - Mock Service Worker)

```ts
// tests/mocks/handlers.ts
import { http, HttpResponse } from 'msw';

export const handlers = [
  http.get('/api/user', () => {
    return HttpResponse.json({ name: 'Test User' });
  }),

  http.post('/api/analyze', async ({ request }) => {
    const data = await request.json();
    return HttpResponse.json({ result: 'mocked analysis' });
  })
];

// tests/setup.ts
import { setupServer } from 'msw/node';
import { handlers } from './mocks/handlers';

const server = setupServer(...handlers);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

### Environment Variables

```ts
// tests/setup.ts
process.env.VITE_API_URL = 'http://localhost:3000';
process.env.VITE_GEMINI_API_KEY = 'test-key';
```

### React Context Mocks

```ts
const MockThemeProvider = ({ children }) => (
  <ThemeContext.Provider value={{ theme: 'dark', setTheme: vi.fn() }}>
    {children}
  </ThemeContext.Provider>
);

render(
  <MockThemeProvider>
    <MyComponent />
  </MockThemeProvider>
);
```

---

## 5. CI/CD Integration

### GitHub Actions Example

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'

      - run: npm ci
      - run: npm run test:coverage
      - run: npx playwright install --with-deps
      - run: npm run test:e2e

      - uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
```

---

## 6. Projekt-spezifische Patterns

### digitalTwin (Camera + AI)

```ts
describe('CameraView', () => {
  it('handles camera permission denial', async () => {
    // Mock denied permission
    const mockGetUserMedia = vi.fn().mockRejectedValue(new Error('Permission denied'));
    Object.defineProperty(navigator, 'mediaDevices', {
      value: { getUserMedia: mockGetUserMedia },
      writable: true
    });

    render(<CameraView />);

    await expect(screen.findByText(/camera access denied/i)).resolves.toBeInTheDocument();
    expect(screen.getByTestId('mock-camera-view')).toBeInTheDocument();
  });

  it('sends frame to Gemini API', async () => {
    const mockAnalyze = vi.fn().mockResolvedValue({ rebaScore: 3 });

    render(<CameraView onAnalyze={mockAnalyze} />);

    await userEvent.click(screen.getByRole('button', { name: /analyze/i }));

    expect(mockAnalyze).toHaveBeenCalled();
  });
});
```

### ManufacturingInsideAnalyzer (DSGVO + Large Data)

```ts
describe('Anonymizer', () => {
  it('redacts PII before analysis', async () => {
    const input = 'Email: test@example.com, Phone: +49123456789';
    const { result } = renderHook(() => useAnonymizer());

    const anonymized = await result.current.anonymize(input);

    expect(anonymized).not.toContain('test@example.com');
    expect(anonymized).not.toContain('+49123456789');
    expect(anonymized).toContain('[EMAIL]');
    expect(anonymized).toContain('[PHONE]');
  });

  it('handles large datasets with smart sampling', async () => {
    const largeData = Array.from({ length: 10000 }, () => ({ col: 'value' }));

    const { result } = renderHook(() => useSmartSampling());
    const sampled = result.current.sample(largeData);

    expect(sampled.length).toBeLessThanOrEqual(5000); // Smart sample
    expect(sampled[0]).toHaveProperty('col');
  });
});
```

---

## 7. Debugging-Tipps

### Test läuft nicht?

```bash
# Verbose mode
npm run test -- --reporter=verbose

# Single file
npm run test -- Button.test.tsx

# Watch mode
npm run test -- --watch

# UI mode (interaktiv)
npx vitest --ui
```

### Playwright Debug

```bash
# Headed mode (sichtbarer Browser)
npx playwright test --headed

# Debug mode (Pause bei Failures)
npx playwright test --debug

# Trace Viewer
npx playwright show-trace trace.zip
```

---

## Checkliste vor Commit

- [ ] Alle Tests passing: `npm test`
- [ ] Coverage ≥ 80%: `npm run test:coverage`
- [ ] E2E Tests passing: `npm run test:e2e`
- [ ] Keine `it.skip` oder `it.only`
- [ ] Keine `console.log` in Tests
- [ ] Test-Namen beschreiben Verhalten, nicht Implementation

---

## Ressourcen

- [Testing Library Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Playwright Docs](https://playwright.dev/)
- [Vitest Docs](https://vitest.dev/)
