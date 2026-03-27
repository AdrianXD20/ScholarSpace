import { Navigate, useSearchParams } from 'react-router-dom'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const next = `/forgot-password?step=reset${token ? `&token=${encodeURIComponent(token)}` : ''}`
  return <Navigate to={next} replace />
}
