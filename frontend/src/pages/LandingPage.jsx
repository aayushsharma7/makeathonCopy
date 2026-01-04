import  { useState, useEffect } from "react";
import { Link, matchPath, useLocation, useNavigate } from "react-router-dom";
import { 
  Menu, 
  X, 
  Search, 
  Bell, 
  Plus, 
  User, 
  ChevronDown,
  LayoutGrid,
  Zap,
  LogInIcon,
  LogOut
} from "lucide-react";
import axios from "axios";

const LandingPage = () => {

      const [isLoggedIn, setIsLoggedIn] = useState(false);
      const [infor, setInfor] = useState({});
  
      const navigate = useNavigate();
  
      const checkAuth = async () => {
          try {
          const responsePost = await axios.get(
              `http://localhost:3000/auth/check`, {withCredentials: true}
          );
          console.log(responsePost.data);
          if(responsePost.data.code === 200){
              setIsLoggedIn(true);
              setInfor(responsePost.data.info);
              navigate('/courses')
          }
          else{
            setIsLoggedIn(false);
          }
          } catch (error) {
          console.log(error);
          }
      }
  
    useEffect(() => {
      checkAuth();
    },[]);


  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0A0A] font-sans selection:bg-[#DEFF0A] selection:text-black overflow-hidden relative p-6">
      {/* <Navbar /> */}
      {/* Background Ambient Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-150 h-150 bg-[#DEFF0A] rounded-full blur-[180px] opacity-[0.15] pointer-events-none mix-blend-screen"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-125 h-125 bg-[#7000FF] rounded-full blur-[180px] opacity-[0.12] pointer-events-none mix-blend-screen"></div>
      <div className="absolute top-[40%] left-[60%] w-75 h-75 bg-[#00E0FF] rounded-full blur-[150px] opacity-[0.08] pointer-events-none mix-blend-screen"></div>
      {/* Noise Texture */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='6.29' numOctaves='6' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      ></div>
      <div className="w-full max-w-115 relative z-10">
        {/* Decorative Elements */}
        {/* Main Card */}
        {/* <div className="flex items-center justify-center">
          <Link to={"/courses"}>
            <button className="w-50 bg-[#DEFF0A] hover:bg-[#CBEA00] active:scale-[0.98] text-black font-black text-[16px] tracking-wide py-5 rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 overflow-hidden">
              <span className="relative z-10">LAUNCH COURSE</span>
              <svg
                className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M13 7L18 12L13 17"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M6 12H17"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </Link>
        </div> */}
      </div>
    </div>
  );
};

export default LandingPage;
