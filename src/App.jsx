import './App.css'
import AuthProvider from './hook/AuthProvider'
import RouteComponent from './routes/routes'

function App() {
  return (
    <AuthProvider>
      <RouteComponent />
    </AuthProvider>
  )
}

export default App
