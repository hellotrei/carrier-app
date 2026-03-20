import React from 'react';

import { AppProviders } from './src/app/providers/app-providers';
import { RootApp } from './src/app/root-app';

function App(): React.JSX.Element {
  return (
    <AppProviders>
      <RootApp />
    </AppProviders>
  );
}

export default App;
