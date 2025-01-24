import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Lander from './pages/Lander'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Lander/>
    </>
  )
}

export default App
