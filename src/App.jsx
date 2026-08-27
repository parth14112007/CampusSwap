import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { MarketplaceProvider } from './context/MarketplaceContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

// Public Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { SignupPage } from './pages/auth/SignupPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';

// Marketplace & Rental Pages
import { ExplorePage } from './pages/ExplorePage';
import { ActiveRentalPage } from './pages/ActiveRentalPage';
import { ItemDetailPage } from './pages/ItemDetailPage';
import { ListItemPage } from './pages/ListItemPage';
import { MyRentalsPage } from './pages/MyRentalsPage';
import { RentalsOverviewPage } from './pages/RentalsOverviewPage';
import { RequestsPage } from './pages/RequestsPage';

// Emergency & Campus Resource Pages
import { SosPage } from './pages/SosPage';
import { CampusInventoryPage } from './pages/CampusInventoryPage';
import { HandoverPage } from './pages/HandoverPage';

// AI Intelligence Pages
import { AiSmartMatchPage } from './pages/AiSmartMatchPage';
import { AiProjectAssistantPage } from './pages/AiProjectAssistantPage';
import { ProjectKitsPage } from './pages/ProjectKitsPage';

// Community & Sustainability Pages
import { PartnerFinderPage } from './pages/PartnerFinderPage';
import { KnowledgeHubPage } from './pages/KnowledgeHubPage';
import { DonatePage } from './pages/DonatePage';

import { ToastProvider } from './components/common/Toast';

// Profile & Account Pages
import { ProfilePage } from './pages/ProfilePage';
import { NotificationsPage } from './pages/NotificationsPage';
import { SettingsPage } from './pages/SettingsPage';

// Electronics Expert AI Assistant
import { ElectronicsAssistantChat } from './components/ai/ElectronicsAssistantChat';

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <MarketplaceProvider>
          <Routes>
          {/* Public Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />

          {/* Root / Explore / Marketplace */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Navigate to="/explore" replace />
              </ProtectedRoute>
            }
          />
          <Route
            path="/explore"
            element={
              <ProtectedRoute>
                <ExplorePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/marketplace"
            element={
              <ProtectedRoute>
                <Navigate to="/explore" replace />
              </ProtectedRoute>
            }
          />

          {/* Marketplace Listing & Details */}
          <Route
            path="/item/:id"
            element={
              <ProtectedRoute>
                <ItemDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/list-item"
            element={
              <ProtectedRoute>
                <ListItemPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/requests"
            element={
              <ProtectedRoute>
                <RequestsPage />
              </ProtectedRoute>
            }
          />

          {/* Rentals & Escrow Transactions */}
          <Route
            path="/rentals"
            element={
              <ProtectedRoute>
                <RentalsOverviewPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/active-rental"
            element={
              <ProtectedRoute>
                <ActiveRentalPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-rentals"
            element={
              <ProtectedRoute>
                <MyRentalsPage />
              </ProtectedRoute>
            }
          />

          {/* Campus Resource Network, SOS & QR Handover */}
          <Route
            path="/sos"
            element={
              <ProtectedRoute>
                <SosPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/handover"
            element={
              <ProtectedRoute>
                <HandoverPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/handover/:id"
            element={
              <ProtectedRoute>
                <HandoverPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/inventory"
            element={
              <ProtectedRoute>
                <CampusInventoryPage />
              </ProtectedRoute>
            }
          />

          {/* AI Features */}
          <Route
            path="/ai-match"
            element={
              <ProtectedRoute>
                <AiSmartMatchPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ai-assistant"
            element={
              <ProtectedRoute>
                <AiProjectAssistantPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/project-kits"
            element={
              <ProtectedRoute>
                <ProjectKitsPage />
              </ProtectedRoute>
            }
          />

          {/* Community & Sustainability */}
          <Route
            path="/partner-finder"
            element={
              <ProtectedRoute>
                <PartnerFinderPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/knowledge-hub"
            element={
              <ProtectedRoute>
                <KnowledgeHubPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/donate"
            element={
              <ProtectedRoute>
                <DonatePage />
              </ProtectedRoute>
            }
          />

          {/* Profile, Notifications & Settings */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <NotificationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/explore" replace />} />
        </Routes>
        <ElectronicsAssistantChat />
      </MarketplaceProvider>
    </AuthProvider>
    </ToastProvider>
  );
}
