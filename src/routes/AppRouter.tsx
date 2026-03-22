import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import {
  ProtectedRoute,
  PublicRoute,
  PermissionRoute,
  RoleRoute,
  StudentDashboardShell,
} from './guards'

// Auth pages
import Login from '../pages/auth/Login'
import Register from '../pages/auth/Register'
import ForgotPassword from '../pages/auth/ForgotPassword'
import ResetPassword from '../pages/auth/ResetPassword'
import Unauthorized from '../pages/Unauthorized'

// Dashboard (estudiante / admin)
import DashboardLayout from '../components/layout/DashboardLayout'
import Dashboard from '../pages/dashboard/Dashboard'
import Notes from '../pages/dashboard/Notes'
import Achievements from '../pages/dashboard/Achievements'
import Activities from '../pages/dashboard/Activities'
import Profile from '../pages/dashboard/Profile'
import Admin from '../pages/dashboard/Admin'

// Vista docente (carpeta dedicada)
import ProfesorLayout from '../pages/profesor/ProfesorLayout'
import PanelProfesor from '../pages/profesor/PanelProfesor'
import MisClases from '../pages/profesor/MisClases'
import DetalleClase from '../pages/profesor/DetalleClase'
import PortafolioEstudiante from '../pages/profesor/PortafolioEstudiante'

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <PublicRoute>
              <ForgotPassword />
            </PublicRoute>
          }
        />
        <Route
          path="/reset-password"
          element={
            <PublicRoute>
              <ResetPassword />
            </PublicRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <StudentDashboardShell>
                <DashboardLayout />
              </StudentDashboardShell>
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="notes" element={<Notes />} />
          <Route path="achievements" element={<Achievements />} />
          <Route path="activities" element={<Activities />} />
          <Route path="profile" element={<Profile />} />
          <Route
            path="admin"
            element={
              <PermissionRoute permission="admin:panel">
                <Admin />
              </PermissionRoute>
            }
          />
        </Route>

        <Route
          path="/profesor"
          element={
            <ProtectedRoute>
              <RoleRoute roles={['teacher']}>
                <ProfesorLayout />
              </RoleRoute>
            </ProtectedRoute>
          }
        >
          <Route index element={<PanelProfesor />} />
          <Route path="clases" element={<MisClases />} />
          <Route path="clases/:claseId" element={<DetalleClase />} />
          <Route
            path="clases/:claseId/estudiantes/:estudianteId"
            element={<PortafolioEstudiante />}
          />
        </Route>

        <Route
          path="/unauthorized"
          element={
            <ProtectedRoute>
              <Unauthorized />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
