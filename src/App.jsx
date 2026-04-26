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
          'BOHACK 2026',
          '5 月 22—31',
          '5.22—24 线下黑客松',
          '5.24—28 项目孵化辅导',
          '5.28—31 智博会线下展演',
          '天津 · 滨海',
          '100+ 选手',
          '42 小时',
          '¥50K+ 奖金',
          'WIE 2026 官方赛道',
        ]}
      />
      <About />
      <Ticker
        items={[
          '◆ 6 条赛道',
          '◆ 16 所高校',
          '◆ 40+ 位导师',
          '◆ 免费周边',
          '◆ 机库场地',
          '◆ 冷萃无限',
          '◆ 安静休息区',
        ]}
      />
      <Tracks />
      <Schedule />
      <Ticker
        dark
        items={[
          '¥25K 总冠军',
          '★ 赛道冠军',
          '★ 硬件朋克特别奖',
          '★ 人气奖',
          '★ 首秀黑客奖',
        ]}
      />
      <Prizes />
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
        <Route path="/user" element={<User />} />
        <Route path="/questionnaire" element={<Questionnaire />} />
        <Route path="/attendance-confirm" element={<AttendanceConfirm />} />
        <Route path="*" element={<Site />} />
      </Routes>
    </BrowserRouter>
  );
}
