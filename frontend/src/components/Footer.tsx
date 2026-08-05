import { Link } from 'react-router-dom'
import { Phone, MapPin, ArrowLeft } from 'lucide-react'
import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer__glow" />
      <div className="container footer__inner">
        {/* Brand */}
        <div className="footer__brand">
          <div className="footer__logo">
            <img src="/logo.png" alt="AqarCare" className="footer__logo-img" />
            <span className="footer__brand-name">Aqar Care</span>
          </div>
          <p className="footer__tagline">
            منصة عقارية متكاملة لتسويق الوحدات السكنية وخدمات التشطيب الفاخرة في مصر.
          </p>
        </div>

        {/* Links */}
        <div className="footer__col">
          <h4 className="footer__heading">روابط سريعة</h4>
          <ul className="footer__list">
            <li><Link to="/"><ArrowLeft size={13} />الرئيسية</Link></li>
            <li><Link to="/properties"><ArrowLeft size={13} />العقارات</Link></li>
            <li><Link to="/finishing-packages"><ArrowLeft size={13} />باقات التشطيب</Link></li>
          </ul>
        </div>

        {/* Contact */}
        <div className="footer__col">
          <h4 className="footer__heading">تواصل معنا</h4>
          <ul className="footer__list footer__list--contact">
            <li><MapPin size={14} />المحلة الكبرى، منشية البكري</li>
            <li className="footer__contact-row">
              <span className="footer__contact-badge footer__contact-badge--whatsapp">
                <Phone size={13} />واتساب
              </span>
              <a href="https://wa.me/201055937687" target="_blank" rel="noreferrer">01055937687</a>
            </li>
            <li className="footer__contact-row">
              <span className="footer__contact-badge footer__contact-badge--call">
                <Phone size={13} />اتصال
              </span>
              <a href="tel:+201554578486">01554578486</a>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer__bottom">
        <p>© {new Date().getFullYear()} AqarCare — جميع الحقوق محفوظة</p>
      </div>
    </footer>
  )
}
