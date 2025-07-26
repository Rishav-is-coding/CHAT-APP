import { Routes, Route , Navigate } from "react-router-dom"
import Navbar from "./components/Navbar.jsx"
import HomePage from "./pages/HomePage.jsx"
import SignUpPage from './pages/SignUpPage.jsx'
import LoginPage from "./pages/LoginPage.jsx"
import SettingsPage from "./pages/SettingsPage.jsx"
import ProfilePage from "./pages/ProfilePage.jsx"
import { useAuthStore } from "./store/useAuthStore.js"
import { useEffect } from "react"
import { Loader, MessageSquare } from "lucide-react"
import { Toaster } from "react-hot-toast"
import { useThemeStore } from "./store/useThemeStore.js"

function App() {
  const {authUser , checkAuth , isCheckingAuth} = useAuthStore()

  const {theme} = useThemeStore()

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  useEffect(() => {
    checkAuth()
  } , [checkAuth])

   useEffect(() => {
    const favicon = document.querySelector("link[rel='icon']");
    const svgString = `
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#7c3aed"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    `;
    const dataUri = `data:image/svg+xml,${encodeURIComponent(svgString)}`;
    favicon.href = dataUri;
  }, []);


  console.log({authUser})

  if(isCheckingAuth && !authUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className= "size-10 animate-spin"/>
      </div>
    )
  }
  return (
    <div className='bg-base-100'>
      <Navbar/>
      <Routes>
        <Route path = "/" element={authUser ? <HomePage/> : <Navigate to="/login"/>}/>
        <Route path = "/signup" element={!authUser ? <SignUpPage/> : <Navigate to="/"/>}/>
        <Route path = "/login" element={!authUser ? <LoginPage/> : <Navigate to="/"/>}/>
        <Route path = "/settings" element={<SettingsPage/>}/>
        <Route path = "/profile" element={authUser ? <ProfilePage/> : <Navigate to="/login"/>}/>
      </Routes>
      <Toaster/>
    </div>
  )
}

export default App
