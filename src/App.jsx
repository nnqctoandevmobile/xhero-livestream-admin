import './App.css'
import RouteComponent from './routes/routes'
import AuthProvider from './context/AuthProvider'

function App() {
  return (
    <AuthProvider>
      <RouteComponent />
    </AuthProvider>
  )
}

export default App
