import { Route, Routes } from 'react-router-dom';
import { CustomerLayout } from './layouts/CustomerLayout';
import { AdminLayout, ArtistLayout } from './layouts/PanelLayout';
import { HomePage } from './pages/customer/HomePage';
import { SearchPage } from './pages/customer/SearchPage';
import { ArtistProfilePage } from './pages/customer/ArtistProfilePage';
import { BookingPage } from './pages/customer/BookingPage';
import { BookingStatusPage } from './pages/customer/BookingStatusPage';
import { InstantPage } from './pages/customer/InstantPage';
import { CustomerDashboardPage } from './pages/customer/CustomerDashboardPage';
import { ArtistOnboardingPage } from './pages/artist/ArtistOnboardingPage';
import { ArtistDashboardPage } from './pages/artist/ArtistDashboardPage';
import { ArtistRequestsPage } from './pages/artist/ArtistRequestsPage';
import { ArtistCalendarPage } from './pages/artist/ArtistCalendarPage';
import { ArtistProfileEditorPage } from './pages/artist/ArtistProfileEditorPage';
import { AdminBookingsPage, AdminDashboardPage, AdminReviewPage, AdminUsersPage } from './pages/admin/AdminPages';
import { NotFoundPage } from './pages/NotFoundPage';

export default function App() {
  return (
    <Routes>
      <Route element={<CustomerLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/buscar" element={<SearchPage />} />
        <Route path="/artista/:id" element={<ArtistProfilePage />} />
        <Route path="/reservar/:id" element={<BookingPage />} />
        <Route path="/reserva/:bookingId" element={<BookingStatusPage />} />
        <Route path="/ahora" element={<InstantPage />} />
        <Route path="/mis-eventos" element={<CustomerDashboardPage />} />
        <Route path="/favoritos" element={<CustomerDashboardPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>

      <Route path="/unete" element={<ArtistOnboardingPage />} />

      <Route element={<ArtistLayout />}>
        <Route path="/panel" element={<ArtistDashboardPage />} />
        <Route path="/panel/solicitudes" element={<ArtistRequestsPage />} />
        <Route path="/panel/calendario" element={<ArtistCalendarPage />} />
        <Route path="/panel/perfil" element={<ArtistProfileEditorPage />} />
      </Route>

      <Route element={<AdminLayout />}>
        <Route path="/admin" element={<AdminDashboardPage />} />
        <Route path="/admin/revision" element={<AdminReviewPage />} />
        <Route path="/admin/usuarios" element={<AdminUsersPage />} />
        <Route path="/admin/reservaciones" element={<AdminBookingsPage />} />
      </Route>
    </Routes>
  );
}
