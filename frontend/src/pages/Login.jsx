import React, { useState } from 'react'
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Lock, ArrowRight, Github, Chrome } from "lucide-react";
import axios from 'axios';

const Login = () => {

    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [resp, setResp] = useState("")
    const navigate = useNavigate();

    const emailHandle = (e) => {
        setEmail(e.target.value)
    }
    const passHandle = (e) => {
        setPassword(e.target.value)
    }
    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            email,
            password
        }

        //withCredentials is imp to send cookies
        const apiRes = await axios.post('http://localhost:3000/auth/login',payload,{
            withCredentials: true
        });
        setResp(apiRes)
        // if(apiRes.data.code === 200){
        //     console.log(apiRes.message)
        // } 
        console.log(apiRes.data.code, apiRes.data.message);
        if(apiRes.data.code===200){
            const url = `/courses/${apiRes.data.info.username}`
            navigate(url)
        }
    }
    


  return (
    <div className="min-h-screen bg-[#0A0A0A] font-sans selection:bg-[#DEFF0A] selection:text-black overflow-hidden relative flex items-center justify-center p-4">
      
      {/* --- ATMOSPHERE LAYERS --- */}
      {/* 1. Ambient Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-150 h-150 bg-[#DEFF0A] rounded-full blur-[180px] opacity-[0.12] pointer-events-none mix-blend-screen"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-125 h-125 bg-[#7000FF] rounded-full blur-[180px] opacity-[0.1] pointer-events-none mix-blend-screen"></div>
      
      {/* 2. Noise Texture */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-[0.04] z-0" 
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='6.29' numOctaves='6' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
      ></div>

      {/* --- MAIN CARD --- */}
      <div className="w-full max-w-lg relative z-10">
        
        <div className="bg-[#141414]/90 backdrop-blur-2xl rounded-4xl shadow-[0_40px_80px_-20px_rgba(0,0,0,0.8)] border border-white/10 p-8 md:p-10 relative overflow-hidden group/card">
          
          {/* Subtle internal gradient glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-2 bg-linear-to-r from-transparent via-[#DEFF0A]/50 to-transparent blur-lg opacity-0 group-hover/card:opacity-100 transition-opacity duration-700"></div>

          {/* HEADER */}
          <div className="mb-10 text-center relative">
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-2">
              Login to our <br />
              <span className="text-transparent bg-clip-text bg-linear-to-r from-[#DEFF0A] via-white to-zinc-400">
                Platform.
              </span>
            </h1>
            <p className="text-zinc-500 font-medium text-sm">
              Start building your knowledge empire today.
            </p>
          </div>

          {/* FORM */}
          <form className="space-y-5" onSubmit={handleSubmit}>
            
            {/* 1. Name Input */}
            {/* <div className="group relative">
               <div className="absolute inset-0 bg-gradient-to-r from-[#DEFF0A] to-[#7000FF] rounded-2xl blur opacity-0 group-focus-within:opacity-20 transition-opacity duration-500"></div>
               <div className="relative flex items-center bg-[#1A1A1A] border border-zinc-800 rounded-2xl px-4 py-4 focus-within:border-[#DEFF0A] focus-within:bg-[#202020] transition-all duration-300">
                  <User size={20} className="text-zinc-500 mr-3 group-focus-within:text-[#DEFF0A] transition-colors" />
                  <input 
                    type="text" 
                    placeholder="Full Name"
                    className="bg-transparent w-full text-white font-medium placeholder:text-zinc-600 focus:outline-none"
                    required
                  />
               </div>
            </div> */}

            {/* 2. Email Input */}
            <div className="group relative">
               <div className="absolute inset-0 bg-linear-to-r from-[#DEFF0A] to-[#7000FF] rounded-2xl blur opacity-0 group-focus-within:opacity-20 transition-opacity duration-500"></div>
               <div className="relative flex items-center bg-[#1A1A1A] border border-zinc-800 rounded-2xl px-4 py-4 focus-within:border-[#DEFF0A] focus-within:bg-[#202020] transition-all duration-300">
                  <Mail size={20} className="text-zinc-500 mr-3 group-focus-within:text-[#DEFF0A] transition-colors" />
                  <input 
                    type="email" 
                    placeholder="Email Address"
                    className="bg-transparent w-full text-white font-medium placeholder:text-zinc-600 focus:outline-none"
                    required
                    value={email}
                    onChange={emailHandle}
                  />
               </div>
            </div>

            {/* 3. Password Input */}
            <div className="group relative">
               <div className="absolute inset-0 bg-linear-to-r from-[#DEFF0A] to-[#7000FF] rounded-2xl blur opacity-0 group-focus-within:opacity-20 transition-opacity duration-500"></div>
               <div className="relative flex items-center bg-[#1A1A1A] border border-zinc-800 rounded-2xl px-4 py-4 focus-within:border-[#DEFF0A] focus-within:bg-[#202020] transition-all duration-300">
                  <Lock size={20} className="text-zinc-500 mr-3 group-focus-within:text-[#DEFF0A] transition-colors" />
                  <input 
                    type="password" 
                    placeholder="Password"
                    className="bg-transparent w-full text-white font-medium placeholder:text-zinc-600 focus:outline-none"
                    required
                    value={password}
                    onChange={passHandle}
                  />
               </div>
            </div>

            {/* ACTION BUTTON */}
            <button className="w-full mt-6 bg-[#DEFF0A] hover:bg-[#CBEA00] text-black font-black text-lg py-4 rounded-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-2 group relative overflow-hidden">
               <span className="relative z-10">LOGIN</span>
               <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" strokeWidth={3} />
               
               {/* Button Shine Effect */}
               <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 skew-y-12"></div>
            </button>

          </form>
          {resp?.data?.code ? <div className="mt-4 text-center">
             <p className={`${resp?.data?.code === 200 ? 'text-green-500':'text-red-500'} text-sm font-medium`}>
               {resp?.data?.code === 200 ? '': `${resp?.data?.code}:`} {resp?.data?.message}
             </p>
          </div>: ''}

          {/* DIVIDER */}
          {/* <div className="my-8 flex items-center gap-4">
             <div className="h-[1px] bg-white/10 flex-1"></div>
             <span className="text-zinc-600 text-xs font-bold uppercase tracking-widest">or continue with</span>
             <div className="h-[1px] bg-white/10 flex-1"></div>
          </div>

          SOCIALS
          <div className="grid grid-cols-2 gap-4">
             <button className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 py-3 rounded-xl transition-all group">
                <Github size={18} className="text-zinc-400 group-hover:text-white" />
                <span className="text-sm font-bold text-zinc-400 group-hover:text-white">Github</span>
             </button>
             <button className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 py-3 rounded-xl transition-all group">
                <Chrome size={18} className="text-zinc-400 group-hover:text-white" />
                <span className="text-sm font-bold text-zinc-400 group-hover:text-white">Google</span>
             </button>
          </div> */}

          {/* FOOTER */}
          <div className="mt-8 text-center">
             <p className="text-zinc-500 text-sm font-medium">
                Don't have an account?{' '}
               <Link to="/signup" className="text-[#DEFF0A] font-bold hover:underline decoration-2 underline-offset-4">
                 Sign up here
               </Link>
             </p>
          </div>

        </div>
      </div>
    </div>
  )
}

export default Login