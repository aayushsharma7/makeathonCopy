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

const Navbar = () => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [infor, setInfor] = useState({});
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

    const navigate = useNavigate()

    const location = useLocation();

    
    const checkAuth = async () => {
        try {
        const responsePost = await axios.get(
            `http://localhost:3000/auth/check`, {withCredentials: true}
        );
        console.log(responsePost.data);
        if(responsePost.data.code === 200){
            setIsLoggedIn(true);
            setInfor(responsePost.data.info);
        }
        else{
          setIsLoggedIn(false);
        }
        } catch (error) {
        console.log(error);
        }
    }

    const paths = [
      {
        name: 'Home',path: '/'
      }, 
      {
        name: 'Courses',path: '/courses'
      }, 
      {
        name: 'Create',path: '/create'
      }
    ]

  useEffect(() => {
    checkAuth();
    console.log(location)
  },[location.pathname]);


  

  // Detect scroll to add background blur/border
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    if (isLoggedIn) {
      const apiRes = await axios.post(
        "http://localhost:3000/auth/logout",
        {},
        {
          withCredentials: true,
        }
      );
      console.log(apiRes);
      if (apiRes.data.code === 200) {
        setIsProfileMenuOpen(false)
        navigate("/login");
      } else {
        console.log(apiRes);
      }
    } else {
      setIsProfileMenuOpen(false)
      navigate("/login");
    }
  };

  return (
    <>
      <nav
        className={`${matchPath('/courses/:name/:id',location.pathname) ? 'hidden':''} fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b md:px-6  ${
          isScrolled
            ? "bg-[#0A0A0A]/80 backdrop-blur-xl border-white/10 py-3"
            : "bg-transparent border-transparent py-5"
        }`}
      >
        <div className="max-w-450 mx-auto px-6">
          <div className="flex items-center justify-between">
            
            {/* 1. LEFT: LOGO */}
            <div className="flex items-center gap-12">
              <Link to="/" className="group flex items-center gap-2">
                <div className="relative flex items-center justify-center w-10 h-10 bg-white/5 rounded-xl border border-white/10 group-hover:border-[#DEFF0A]/50 transition-colors">
                  <Zap size={20} className="text-white group-hover:text-[#DEFF0A] transition-colors" fill="currentColor" />
                  {/* Glowing Dot */}
                  <div className="absolute -top- -right-1 w-3 h-3 bg-[#DEFF0A] rounded-full border-2 border-[#0A0A0A] group-hover:animate-pulse"></div>
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-black text-white tracking-tight leading-none">
                    VAULT
                  </span>
                  <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-[0.2em] group-hover:text-[#DEFF0A] transition-colors">
                    System v2.0
                  </span>
                </div>
              </Link>

              {/* DESKTOP NAV LINKS */}
              <div className="hidden lg:flex items-center gap-8">
                
                {paths.map((item,idx) => (
                  <Link 
                    key={idx} 
                    to={item.path}
                    className={`text-sm ${!isLoggedIn  ? 'hidden' : ''} font-bold text-zinc-400 hover:text-white transition-colors tracking-wide relative group/link`}
                  >
                    {item.name}
                    <span className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-1 h-1 bg-[#DEFF0A] rounded-full opacity-0 group-hover/link:opacity-100 transition-opacity"></span>
                  </Link>
                ))}
              </div>
            </div>

            {/* 2. RIGHT: ACTIONS */}
            <div className="flex items-center gap-4 md:gap-6">
              
              {/* Search (Desktop) */}
              {/* <div className="hidden md:flex group relative">
                <input 
                  type="text" 
                  placeholder="Search..." 
                  className="bg-transparent border-b border-zinc-700 text-sm text-white px-0 py-1 w-0 group-hover:w-48 focus:w-48 focus:border-[#DEFF0A] transition-all duration-300 focus:outline-none placeholder:text-zinc-600"
                />
                <button className="text-zinc-400 group-hover:text-white transition-colors">
                  <Search size={20} />
                </button>
              </div> */}

              {/* Notification Bell */}
              {/* <button className="relative text-zinc-400 hover:text-white transition-colors">
                <Bell size={20} />
                <span className="absolute top-0 right-0 w-2 h-2 bg-[#7000FF] rounded-full ring-2 ring-[#0A0A0A]"></span>
              </button> */}

              {/* <div className="h-6 w-[1px] bg-zinc-800 hidden md:block"></div> */}

              {/* Create Button */}
              {isLoggedIn ? <Link to={`/create`} className="hidden md:flex">
                <button className="group relative px-5 py-2.5 bg-[#DEFF0A] hover:bg-[#CBEA00] text-black font-black text-xs uppercase tracking-wider rounded-lg transition-all active:scale-95 flex items-center gap-2">
                  <Plus size={16} strokeWidth={3} />
                  <span>Create</span>
                </button>
              </Link>
              : 
              <div className="flex gap-2">
              <Link to="/login" className="hidden md:flex">
                <button className="group cursor-pointer relative px-5 py-2.5 bg-zinc-900 border border-zinc-800 text-gray-200 font-black text-xs uppercase tracking-wider rounded-lg transition-all active:scale-95 flex items-center gap-2">
                  <LogInIcon size={16} strokeWidth={3} />
                  <span>Login</span>
                </button>
              </Link>
              <Link to="/signup" className="hidden md:flex">
                <button className="group cursor-pointer relative px-5 py-2.5 bg-[#DEFF0A] hover:bg-[#CBEA00] text-black font-black text-xs uppercase tracking-wider rounded-lg transition-all active:scale-95 flex items-center gap-2">
                  <LogInIcon size={16} strokeWidth={3} />
                  <span>Sign Up</span>
                </button>
              </Link>
              </div>
              }
              

              {/* Profile Avatar */}
              {/* Profile Avatar Section */}
              <div className={`flex ${isLoggedIn ? '': 'hidden'}  items-center gap-3 pl-2 relative`}>
                
                {/* 1. Avatar Image (Clickable) */}
                <div className="relative">
                  {/* 1. Trigger (Avatar) */}
                  <div 
                    onClick={() => {
                      setIsProfileMenuOpen(!isProfileMenuOpen)
                    }}
                    className={`w-10 h-10 rounded-full bg-zinc-900 border overflow-hidden cursor-pointer transition-all duration-200 ${
                      isProfileMenuOpen 
                        ? 'border-[#DEFF0A] shadow-[0_0_10px_rgba(222,255,10,0.2)]' // Added subtle neon glow when open
                        : 'border-white/10 hover:border-[#DEFF0A]'
                    }`}
                  >
                    <img 
                      src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" 
                      alt="User" 
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* 2. The Dropdown Menu */}
                  {isProfileMenuOpen && (
                    <div className="absolute top-full right-0 mt-4 w-52 bg-[#0A0A0A] border border-zinc-800 rounded-xl shadow-2xl py-2 z-50 overflow-hidden ring-1 ring-white/5">
                      
                      {/* Profile Link - Hover turns Neon Yellow */}
                      <Link 
                        to="/profile" 
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="group flex items-center gap-3 px-4 py-3 text-sm font-bold text-zinc-400 hover:text-[#DEFF0A] hover:bg-white/5 transition-all"
                      >
                        <User size={18} className="text-zinc-500 group-hover:text-[#DEFF0A] transition-colors" />
                        <span>Profile</span>
                      </Link>
                      
                      {/* Divider */}
                      <div className="h-px bg-zinc-900 my-1 mx-2"></div>
                      
                      {/* Logout Button - Hover turns Red */}
                      <button 
                        onClick={handleLogout}
                        className="w-full group flex items-center gap-3 px-4 py-3 text-sm font-bold text-zinc-400 hover:text-red-500 hover:bg-red-500/5 transition-all text-left"
                      >
                        <LogOut size={18} className="text-zinc-500 group-hover:text-red-500 transition-colors" />
                        <span>Logout</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* 3. Mobile Menu Toggle */}
                <button 
                  className="lg:hidden text-zinc-400"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                  {mobileMenuOpen ? <X /> : <Menu />}
                </button>
              </div>

            </div>
          </div>
        </div>
      </nav>

      {/* MOBILE MENU OVERLAY */}
      <div 
        className={`fixed inset-0 z-40 bg-[#0A0A0A] pt-24 px-6 transition-transform duration-500 ease-in-out ${
          mobileMenuOpen ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="flex flex-col gap-6">
           <Link to="/create" onClick={() => setMobileMenuOpen(false)} className="w-full py-4 bg-[#DEFF0A] text-black font-black text-center rounded-xl uppercase tracking-widest">
             + New Course
           </Link>
           {[{name: 'Home',path: '/'}, {name: 'Courses',path: '/courses'}, {name: 'Create',path: '/create'}].map((item,idx) => (
             <Link 
               key={idx} 
               to={item.path}
               onClick={() => setMobileMenuOpen(false)}
               className="text-2xl font-bold text-zinc-500 hover:text-white transition-colors border-b border-zinc-900 pb-4"
             >
               {item.name}
             </Link>
           ))}
        </div>
      </div>
    </>
  );
};

export default Navbar;