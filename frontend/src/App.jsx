import { Route, Routes, useLocation } from "react-router-dom";
import HomePage from './pages/HomePage';
import CreateCourse from './pages/CreateCourse';
import LandingPage from './pages/LandingPage';
import CoursePlayer from "./pages/CoursePlayer";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import Navbar from "./components/Navbar";

const App = () => {

  return (
    <div>
      <Navbar />
      <Routes>
        <Route path='/' element={<LandingPage />} />
        <Route path='/signup' element={<SignUp />} />
        <Route path='/login' element={<Login />} />
        <Route path='/create' element={<CreateCourse />} />
        <Route path='/courses' element={<HomePage />} />
        <Route path='/courses/:name/:id' element={<CoursePlayer />} />
      </Routes>
    </div>
  )
}

export default App