import '@testing-library/jest-dom';
import { afterEach, vi } from 'vitest';

// Clean mocks after each test
afterEach(() => {
  vi.clearAllMocks();
});
