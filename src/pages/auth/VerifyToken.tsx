import { Navigate, useSearchParams } from 'react-router-dom'

export default function VerifyToken() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const next = `/forgot-password?step=token${token ? `&token=${encodeURIComponent(token)}` : ''}`
  return <Navigate to={next} replace />
}