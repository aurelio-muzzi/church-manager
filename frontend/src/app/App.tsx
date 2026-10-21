import { AppProviders } from './providers';
import { AppRoutes } from './router/routes';

export function App() {
  return (
    <AppProviders>
      <AppRoutes />
    </AppProviders>
  );
}

export default App;
