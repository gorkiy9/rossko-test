import { Navigate, Route, Routes } from 'react-router-dom'
import { Cart } from './screens/Cart'
import { Checkout } from './screens/Checkout'
import { Rating } from './screens/Rating'
import { Tracking } from './screens/Tracking'

export default function App() {
  return (
    <Routes>
      <Route path="/cart" element={<Cart />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/tracking" element={<Tracking />} />
      <Route path="/rating" element={<Rating />} />
      {/* Старые шаги пошагового оформления собраны в одну страницу */}
      {['/address', '/slot', '/courier', '/payment'].map((p) => (
        <Route key={p} path={p} element={<Navigate to="/checkout" replace />} />
      ))}
      <Route path="*" element={<Navigate to="/cart" replace />} />
    </Routes>
  )
}
