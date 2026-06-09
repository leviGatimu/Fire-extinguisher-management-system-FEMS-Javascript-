import { Routes, Route } from 'react-router-dom';
import { Protected, PublicOnly } from '@/components/guards';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import Dashboard from '@/pages/Dashboard';
import Extinguishers from '@/pages/Extinguishers';
import ExtinguisherForm from '@/pages/ExtinguisherForm';
import Inspections from '@/pages/Inspections';
import Maintenance from '@/pages/Maintenance';
import Reports from '@/pages/Reports';
import UsersPage from '@/pages/Users';
import Profile from '@/pages/Profile';
import Settings from '@/pages/Settings';
import Notifications from '@/pages/Notifications';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<PublicOnly><Login /></PublicOnly>} />
      <Route path="/register" element={<PublicOnly><Register /></PublicOnly>} />
      <Route path="/forgot-password" element={<PublicOnly><ForgotPassword /></PublicOnly>} />
      <Route path="/reset-password" element={<PublicOnly><ResetPassword /></PublicOnly>} />

      <Route path="/" element={<Protected><Dashboard /></Protected>} />
      <Route path="/extinguishers" element={<Protected><Extinguishers /></Protected>} />
      <Route path="/extinguishers/new" element={<Protected roles={['ADMIN']}><ExtinguisherForm /></Protected>} />
      <Route path="/extinguishers/:id/edit" element={<Protected roles={['ADMIN']}><ExtinguisherForm /></Protected>} />
      <Route path="/inspections" element={<Protected><Inspections /></Protected>} />
      <Route path="/maintenance" element={<Protected roles={['ADMIN', 'INSPECTOR']}><Maintenance /></Protected>} />
      <Route path="/reports" element={<Protected roles={['ADMIN']}><Reports /></Protected>} />
      <Route path="/users" element={<Protected roles={['ADMIN']}><UsersPage /></Protected>} />
      <Route path="/profile" element={<Protected><Profile /></Protected>} />
      <Route path="/settings" element={<Protected><Settings /></Protected>} />
      <Route path="/notifications" element={<Protected><Notifications /></Protected>} />
    </Routes>
  );
}
