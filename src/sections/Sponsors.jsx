import { useEffect, useState } from 'react';

const CONTACT_EMAIL = 'contact@bohack.top';

const PARTNERS = [
  {
    title: '资源支持合作',
    desc: '欢迎提供基础硬件、开发工具、API、算力、云服务、设备材料、实验空间等资源，帮助团队把想法做出来。',
  },
  {
    title: '媒体传播合作',
    desc: '欢迎媒体平台、科技内容创作者、校园媒体参与报道，共同记录青年创造者从42小时开发到世界智博会舞台的成长过程。',
  },
  {
    title: '投资与孵化合作',
    desc: '欢迎投资机构、园区、孵化器和产业基金参与项目观察、终评评审和后续对接，为优秀项目提供持续支持。',
  },
];

function ContactEmailModal({ onClose }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="contact-email-overlay" onClick={onClose}>
      <div
        className="contact-email-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="contact-email-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="contact-email-close"
          aria-label="关闭邮箱弹窗"
          onClick={onClose}
        >
          x
        </button>
        <p className="contact-email-kicker">CONTACT EMAIL</p>
        <h3 id="contact-email-title">欢迎联系组委会</h3>
        <a className="contact-email-address" href={`mailto:${CONTACT_EMAIL}`}>
          {CONTACT_EMAIL}
        </a>
        <p className="contact-email-note">点击邮箱即可唤起邮件客户端，也可以复制后手动发送。</p>
      </div>
    </div>
  );
}

export default function Sponsors() {
  const [isContactOpen, setIsContactOpen] = useState(false);

  return (
    <section className="section light" id="sponsors">
      <div className="container">
        <div className="chapter-row reveal">
          <div>
            <div className="eyebrow">Chapter 05 / 合作邀约</div>
            <div className="chapter-num" data-parallax="0.08">05</div>
          </div>
          <div className="title-block" data-parallax="-0.04">
            <h2 className="title">合作邀约</h2>
            <p className="section-subtitle">
              无论你是媒体、企业、投资机构，还是有创意的合作伙伴，让我们一起携手共创。
            </p>
          </div>
        </div>
        <div className="partner-grid reveal" data-stagger="true">
          {PARTNERS.map((item, i) => (
            <article className="partner-card" key={item.title}>
              <span className="partner-index">{String(i + 1).padStart(2, '0')}</span>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </article>
          ))}
        </div>
        <div className="partner-cta reveal">
          <div className="partner-cta-copy">
            <p>如果你希望成为本次活动的合作伙伴，欢迎联系组委会。</p>
            <p>这一次，让创新被看见，也让更多价值被连接。</p>
          </div>
          <button
            type="button"
            className="btn btn-primary magnet"
            onClick={() => setIsContactOpen(true)}
          >
            联系合作 <span className="arrow">↗</span>
          </button>
        </div>
      </div>
      {isContactOpen && <ContactEmailModal onClose={() => setIsContactOpen(false)} />}
    </section>
  );
}
