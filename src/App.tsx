import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import { ToastContainer } from './components/common/ToastContainer'
import AppRouter from './routes/AppRouter'

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppRouter />
        <ToastContainer />
      </ToastProvider>
    </AuthProvider>
  )
}

export default App
