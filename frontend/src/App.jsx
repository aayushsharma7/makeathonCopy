import { Route, Routes } from "react-router-dom";
import HomePage from './pages/HomePage';
import CreateCourse from './pages/CreateCourse';
import LandingPage from './pages/LandingPage';
import CoursePlayer from "./pages/CoursePlayer";

const App = () => {


  return (
    <div>
      
      <Routes>
        <Route path='/' element={<LandingPage />} />
        <Route path='/create' element={<CreateCourse />} />
        <Route path='/courses' element={<HomePage />} />
        <Route path='/courses/:name/:id' element={<CoursePlayer />} />
      </Routes>
      
    </div>

    

    
  )
}

export default App