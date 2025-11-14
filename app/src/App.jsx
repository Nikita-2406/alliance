import { useState } from 'react'
import './App.css'
import MainPage from './MainPage/MainPage'
import HeaderPage from './HeaderPage/HeaderPage'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <HeaderPage />
      <MainPage/>
    </>
  )
}

export default App
