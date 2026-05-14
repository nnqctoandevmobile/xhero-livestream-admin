import './App.css'
import UIProvider from './context/UiProvider'
import AuthProvider from './context/AuthProvider'
import RouteComponent from './routes/routes'

function App() {
  return (
    <UIProvider>
      <AuthProvider>
        <RouteComponent />
      </AuthProvider>
    </UIProvider>
  )
}

export default App
