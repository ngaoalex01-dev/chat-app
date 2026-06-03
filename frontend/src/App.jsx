import { Routes, Route , Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import ChatPage from './pages/ChatPage';
import { useAuthStore } from './store/useAuthStore.js';
import { useEffect } from 'react';
import PageLoader from './components/PageLoader';

import { Toaster } from 'react-hot-toast';
import EmailVerificationPage from './pages/EmailVerificationPage';
import FloatingShape from './components/FloatingShape';


function App () {
  const { isCheckingAuth, checkAuth, authUser } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  console.log(authUser);

  if(isCheckingAuth) return <PageLoader />;

  return (

    <div className="min-h-screen bg-slate-900 relative flex items-center justify-center overflow-hidden">
      {/* DECORATORS - GRID BG & GLOW SHAPES */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px]" />

      <FloatingShape color="bg-cyan-500" size="w-64 h-64" top="-5%" left="10%" delay={0} />
      <FloatingShape color="bg-purple-500" size="w-48 h-48" top="70%" left="80%" delay={5} />
      <FloatingShape color="bg-green-300" size="w-32 h-32" top="40%" left="-10%" delay={2} />


   <Routes>
      <Route path="/" element={authUser ? <ChatPage /> : <Navigate to={"/login" }/>} />
      <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to={"/"} />} />
      <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to={"/"} />} />
      <Route path="/verify-email" element={ <EmailVerificationPage /> } />
    </Routes>

    <Toaster />
    </div>
  );
}

export default App;
