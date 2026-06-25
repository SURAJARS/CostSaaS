import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { I18nextProvider } from 'react-i18next';
import i18n from './locales/i18n';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider as CustomThemeProvider } from './context/ThemeContext';
import { useTheme } from './hooks/useTheme';

// Components
import Navigation from './components/Navigation';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import IngredientsPage from './pages/IngredientsPage';
import MenusPage from './pages/MenusPage';
import RecipesPage from './pages/RecipesPage';
import EstimationsPage from './pages/EstimationsPage';
import ExpensesPage from './pages/ExpensesPage';
import ReportsPage from './pages/ReportsPage';

// Placeholder pages
import ProfilePage from './pages/ProfilePage';
import UnauthorizedPage from './pages/UnauthorizedPage';

const AppContent = () => {
  const { isDarkMode } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const theme = createTheme({
    palette: {
      mode: isDarkMode ? 'dark' : 'light',
      primary: {
        main: '#1976d2',
      },
      secondary: {
        main: '#dc004e',
      },
      success: {
        main: '#4caf50',
      },
      error: {
        main: '#f44336',
      },
    },
    typography: {
      fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<AuthPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* Protected Routes */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%', overflow: 'hidden' }}>
                  <Navigation onMenuClick={() => setSidebarOpen(true)} />
                  <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
                  <main style={{ flex: 1, width: '100%', overflow: 'auto' }}>
                    <Routes>
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/ingredients" element={<IngredientsPage />} />
                      <Route path="/expenses" element={<ExpensesPage />} />
                      <Route path="/menus" element={<MenusPage />} />
                      <Route path="/recipes" element={<RecipesPage />} />
                      <Route path="/estimations" element={<EstimationsPage />} />
                      <Route path="/reports" element={<ReportsPage />} />
                      <Route path="/profile" element={<ProfilePage />} />
                      <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    </Routes>
                  </main>
                </div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <AuthProvider>
        <CustomThemeProvider>
          <AppContent />
        </CustomThemeProvider>
      </AuthProvider>
    </I18nextProvider>
  );
}

export default App;
