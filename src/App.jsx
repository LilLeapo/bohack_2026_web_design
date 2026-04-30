import { BrowserRouter, Route, Routes } from 'react-router-dom';

import Nav from './sections/Nav.jsx';
import Hero from './sections/Hero.jsx';
import Ticker from './sections/Ticker.jsx';
import About from './sections/About.jsx';
import Tracks from './sections/Tracks.jsx';
import Schedule from './sections/Schedule.jsx';
import Prizes from './sections/Prizes.jsx';
import Sponsors from './sections/Sponsors.jsx';
import FAQ from './sections/FAQ.jsx';
import Footer from './sections/Footer.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import User from './pages/User.jsx';
import Questionnaire from './pages/Questionnaire.jsx';
import AttendanceConfirm from './pages/AttendanceConfirm.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';

import { useReveal } from './hooks/useReveal.js';
import { useParallax } from './hooks/useParallax.js';
import { useMagnet } from './hooks/useMagnet.js';

function Site() {
  useReveal();
  useParallax();
  useMagnet();

  return (
    <>
      <Nav />
      <Hero />
      <Ticker
        dark
        items={[
          '2026世界智能产业博览会',
          '智能创新黑客松大赛',
          '5 月 22—31',
          '42 小时',
          '5 昼夜深度赋能',
          '世界智博会现场展演',
          '天津',
          '创造者开放报名',
        ]}
      />
      <About />
      <Ticker
        items={[
          '◆ 发现',
          '◆ 赋能',
          '◆ 绽放',
          '◆ 从想法到 Demo',
          '◆ 从作品到舞台',
          '◆ 让项目真实落地',
        ]}
      />
      <Tracks />
      <Prizes />
      <Ticker
        dark
        items={[
          '软件改变逻辑',
          '硬件改变现实',
          '基础硬件材料',
          '算力资源',
          '导师赋能',
          '产业资源对接',
        ]}
      />
      <Schedule />
      <Sponsors />
      <FAQ />
      <Footer />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Site />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/apply" element={<Questionnaire />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/user" element={<User />} />
        <Route path="/questionnaire" element={<Questionnaire />} />
        <Route path="/attendance-confirm" element={<AttendanceConfirm />} />
        <Route path="*" element={<Site />} />
      </Routes>
    </BrowserRouter>
  );
}
