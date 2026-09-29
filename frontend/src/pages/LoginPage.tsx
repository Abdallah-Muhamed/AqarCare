import { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { api, getStoredUser, clearAuth } from '../api'
import { LogIn, UserPlus, Lock, Mail, User, Phone, CheckCircle2, AlertCircle } from 'lucide-react'
import './LoginPage.css'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as any)?.from?.pathname || '/'

  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [currentUser, setCurrentUser] = useState(getStoredUser())

  // Login form state
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  // Register form state
  const [regUsername, setRegUsername] = useState('')
  const [regFullName, setRegFullName] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPhone, setRegPhone] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regRole, setRegRole] = useState<'Customer' | 'Agent'>('Customer')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  useEffect(() => {
    setCurrentUser(getStoredUser())
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMsg(null)
    setLoading(true)

    try {
      const auth = await api.login(username.trim(), password)
      setSuccessMsg(`أهلاً بك مجدداً، ${auth.fullName || auth.username}!`)
      setTimeout(() => {
        if (auth.role === 'Admin') {
          navigate('/admin')
        } else {
          navigate(from)
        }
      }, 700)
    } catch (err: any) {
      setError(err.message || 'فشل تسجيل الدخول. تحقق من اسم المستخدم وكلمة المرور.')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMsg(null)
    setLoading(true)

    try {
      const auth = await api.register({
        username: regUsername.trim(),
        fullName: regFullName.trim(),
        email: regEmail.trim(),
        phoneNumber: regPhone.trim() || undefined,
        password: regPassword,
        role: regRole,
      })

      setSuccessMsg(`تم إنشاء الحساب بنجاح! مرحباً بك، ${auth.fullName || auth.username}`)
      setTimeout(() => {
        if (auth.role === 'Admin') {
          navigate('/admin')
        } else {
          navigate(from)
        }
      }, 700)
    } catch (err: any) {
      setError(err.message || 'تعذر استكمال إنشاء الحساب. تأكد من صحة البيانات.')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    clearAuth()
    setCurrentUser(null)
    setSuccessMsg('تم تسجيل الخروج بنجاح')
  }

  if (currentUser) {
    return (
      <div className="login-page container section-sm">
        <div className="login-card">
          <div className="login-card__header">
            <span className="badge badge-green"><CheckCircle2 size={13} /> جلسة نشطة</span>
            <h1 className="login-card__title">أهلاً بك، {currentUser.fullName}</h1>
            <p className="login-card__subtitle">أنت مسجل الدخول حالياً بصلاحية ({currentUser.role === 'Admin' ? 'مدير النظام' : currentUser.role === 'Agent' ? 'وسيط عقاري' : 'عميل'}).</p>
          </div>

          <div className="login-card__actions" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', marginTop: 'var(--space-lg)' }}>
            {(currentUser.role === 'Admin' || currentUser.role === 'Agent') && (
              <Link to="/admin" className="btn btn-primary">
                {currentUser.role === 'Admin' ? 'الانتقال إلى لوحة الإدارة' : 'لوحة إدارة وإضافة العقارات'}
              </Link>
            )}
            <Link to="/my-inquiries" className="btn btn-outline">
              عرض استفساراتي ومتابعة الطلبات
            </Link>
            <Link to="/properties" className="btn btn-ghost">
              تصفح العقارات
            </Link>
            <button onClick={handleLogout} className="btn" style={{ background: '#f8d7da', color: '#842029', borderColor: '#f5c2c7' }}>
              تسجيل الخروج
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="login-page container section-sm">
      <div className="login-card">
        {/* Mode switcher tabs */}
        <div className="login-tabs">
          <button
            type="button"
            className={`login-tab ${mode === 'login' ? 'active' : ''}`}
            onClick={() => { setMode('login'); setError(null); setSuccessMsg(null); }}
          >
            <LogIn size={16} />
            تسجيل الدخول
          </button>
          <button
            type="button"
            className={`login-tab ${mode === 'register' ? 'active' : ''}`}
            onClick={() => { setMode('register'); setError(null); setSuccessMsg(null); }}
          >
            <UserPlus size={16} />
            حساب جديد
          </button>
        </div>

        {error && (
          <div className="auth-alert auth-alert--error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="auth-alert auth-alert--success">
            <CheckCircle2 size={18} />
            <span>{successMsg}</span>
          </div>
        )}

        {mode === 'login' ? (
          <form onSubmit={handleLogin} className="auth-form">
            <div className="login-card__header">
              <h1 className="login-card__title">تسجيل الدخول إلى عقار كير</h1>
              <p className="login-card__subtitle">سجل دخولك لمتابعة استفساراتك وإدارة العقارات</p>
            </div>

            <div className="form-group">
              <label>اسم المستخدم أو البريد الإلكتروني</label>
              <div className="input-with-icon">
                <User size={18} className="field-icon" />
                <input
                  type="text"
                  placeholder="مثال: ahmed أو user@example.com"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  required
                  autoFocus
                />
              </div>
            </div>

            <div className="form-group">
              <label>كلمة المرور</label>
              <div className="input-with-icon">
                <Lock size={18} className="field-icon" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary submit-btn" disabled={loading}>
              {loading ? <span className="spinner-sm" /> : <><LogIn size={16} /> دخول</>}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="auth-form">
            <div className="login-card__header">
              <h1 className="login-card__title">إنشاء حساب جديد</h1>
              <p className="login-card__subtitle">انضم لمنصة عقار كير للتواصل المباشر ومتابعة العقارات</p>
            </div>

            <div className="form-group">
              <label>نوع الحساب</label>
              <div className="role-selector">
                <label className={`role-pill ${regRole === 'Customer' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="role"
                    value="Customer"
                    checked={regRole === 'Customer'}
                    onChange={() => setRegRole('Customer')}
                  />
                  عميل باحث عن عقار / مالك
                </label>
                <label className={`role-pill ${regRole === 'Agent' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="role"
                    value="Agent"
                    checked={regRole === 'Agent'}
                    onChange={() => setRegRole('Agent')}
                  />
                  وسيط عقاري (إضافة وتسويق عقارات)
                </label>
              </div>
            </div>

            <div className="form-group">
              <label>الاسم بالكامل</label>
              <div className="input-with-icon">
                <User size={18} className="field-icon" />
                <input
                  type="text"
                  placeholder="مثال: أحمد محمد علي"
                  value={regFullName}
                  onChange={e => setRegFullName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>اسم المستخدم (بالإنجليزية)</label>
              <div className="input-with-icon">
                <User size={18} className="field-icon" />
                <input
                  type="text"
                  placeholder="مثال: ahmed_ali"
                  value={regUsername}
                  onChange={e => setRegUsername(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>البريد الإلكتروني</label>
              <div className="input-with-icon">
                <Mail size={18} className="field-icon" />
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={regEmail}
                  onChange={e => setRegEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>رقم الهاتف</label>
              <div className="input-with-icon">
                <Phone size={18} className="field-icon" />
                <input
                  type="tel"
                  placeholder="01012345678"
                  value={regPhone}
                  onChange={e => setRegPhone(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label>كلمة المرور (6 خانات على الأقل)</label>
              <div className="input-with-icon">
                <Lock size={18} className="field-icon" />
                <input
                  type="password"
                  placeholder="••••••••"
                  minLength={6}
                  value={regPassword}
                  onChange={e => setRegPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary submit-btn" disabled={loading}>
              {loading ? <span className="spinner-sm" /> : <><UserPlus size={16} /> تسجيل الحساب</>}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
