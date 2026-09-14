import React, { useState, useRef, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { MessageSquare, Sparkles, Send, X, RotateCcw, Building2, ExternalLink, MapPin, Phone } from 'lucide-react'
import { api } from '../../api'
import type { ChatMessage, PropertyListItem } from '../../types'
import './ChatBrokerWidget.css'

const INITIAL_MESSAGE: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  content: 'أهلاً بحضرتك يا فندم في عقار كير! 🏠\nمعك مستشارك العقاري.. بتدور على شقة، بيت، أو فرصة استثمارية في المحلة الكبرى؟\nقولي مواصفات طلبك والميزانية المناسبة، وهقترح عليك أفضل الفرص الحقيقية المتاحة حالياً!',
}

const QUICK_STARTERS = [
  '🏢 بدور على شقة في حدود 1.5 - 2 مليون',
  '💳 متاح شقق تقسيط في منشية البكري؟',
  '🔥 إيه أفضل الفرص الاستثمارية الحالية؟',
  '🏠 شقة مساحة 140م² جاهزة للسكن',
]

const WHATSAPP_NUMBER = '201055937687'

export const ChatBrokerWidget: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()

  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = sessionStorage.getItem('aqarcare_chat_messages')
      if (saved) return JSON.parse(saved)
    } catch {
      // ignore
    }
    return [INITIAL_MESSAGE]
  })
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Save conversation to sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem('aqarcare_chat_messages', JSON.stringify(messages))
    } catch {
      // ignore
    }
  }, [messages])

  // Scroll to bottom when messages change or chat is opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
        inputRef.current?.focus()
      }, 100)
    }
  }, [isOpen, messages, loading])

  // Hide on Admin pages
  if (location.pathname.startsWith('/admin')) {
    return null
  }

  // Detect if on Property Detail page to elevate floating button
  const isDetailPage = location.pathname.startsWith('/properties/')

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || input).trim()
    if (!text || loading) return

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
    }

    const updatedMessages = [...messages, userMsg]
    setMessages(updatedMessages)
    setInput('')
    setLoading(true)

    try {
      const apiMessages = updatedMessages.map(m => ({
        role: m.role,
        content: m.content,
      }))

      const response = await api.chatWithBroker(apiMessages)

      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.reply,
        recommendedProperties: response.recommendedProperties,
      }

      setMessages(prev => [...prev, assistantMsg])
    } catch (err) {
      console.error('Chat Broker error:', err)
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'عذراً يا فندم، حصل خطأ بسيط في الاتصال. تقدر تضغط على زرار الواتساب وهنرد على استفسارك مباشرة بأفضل العروض المتاحة!',
      }
      setMessages(prev => [...prev, errorMsg])
    } finally {
      setLoading(false)
    }
  }

  const handleResetChat = () => {
    setMessages([INITIAL_MESSAGE])
    try {
      sessionStorage.removeItem('aqarcare_chat_messages')
    } catch {
      // ignore
    }
  }

  const handleViewProperty = (id: number) => {
    navigate(`/properties/${id}`)
    // On mobile, close widget so user sees the page
    if (window.innerWidth <= 640) {
      setIsOpen(false)
    }
  }

  const getWhatsAppUrl = (p: PropertyListItem) => {
    const text = `السلام عليكم، مستشارك العقاري على موقع عقار كير رشحلي العقار رقم #${p.id} (${p.title || ''}) وأرغب في حجز ميعاد للمعاينة الميدانية والتفاصيل.`
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`
  }

  return (
    <>
      {/* Floating Launcher Button */}
      {!isOpen && (
        <button
          className={`broker-launcher ${isDetailPage ? 'broker-launcher--detail-page' : ''}`}
          onClick={() => setIsOpen(true)}
          aria-label="مستشارك العقاري"
        >
          <div className="broker-launcher__icon-wrap">
            <MessageSquare size={19} />
            <span className="broker-launcher__pulse-dot" />
          </div>
          <div className="broker-launcher__text">
            <span className="broker-launcher__title">
              مستشارك العقاري <Sparkles size={14} color="#d59a5d" />
            </span>
            <span className="broker-launcher__sub">رد فوري بالذكاء الاصطناعي</span>
          </div>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="broker-chat-window" role="dialog" aria-modal="true">
          {/* Header */}
          <div className="broker-chat-header">
            <div className="broker-chat-header__info">
              <div className="broker-chat-header__avatar">
                <Building2 size={20} />
                <span className="broker-chat-header__avatar-dot" />
              </div>
              <div>
                <h3 className="broker-chat-header__title">
                  مستشارك العقاري
                  <Sparkles size={14} color="#f1d4b4" />
                </h3>
                <p className="broker-chat-header__status">متصل الآن • خبير عقارات AqarCare</p>
              </div>
            </div>
            <div className="broker-chat-header__actions">
              <button
                className="broker-chat-header__btn"
                onClick={handleResetChat}
                title="محادثة جديدة"
                aria-label="محادثة جديدة"
              >
                <RotateCcw size={15} />
              </button>
              <button
                className="broker-chat-header__btn"
                onClick={() => setIsOpen(false)}
                title="إغلاق"
                aria-label="إغلاق"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Messages Body */}
          <div className="broker-chat-messages">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`broker-msg broker-msg--${msg.role}`}
              >
                {msg.role === 'assistant' && (
                  <div className="broker-msg__avatar">
                    <Sparkles size={15} />
                  </div>
                )}
                <div className="broker-msg__body">
                  <div className="broker-msg__bubble">{msg.content}</div>

                  {/* Recommended Properties Cards */}
                  {msg.recommendedProperties && msg.recommendedProperties.length > 0 && (
                    <div className="broker-recommendations">
                      {msg.recommendedProperties.map(prop => (
                        <div key={prop.id} className="broker-prop-card">
                          <div className="broker-prop-card__header">
                            <div className="broker-prop-card__img-wrap">
                              {prop.primaryImageUrl ? (
                                <img
                                  src={prop.primaryImageUrl}
                                  alt={prop.title || 'عقار'}
                                  className="broker-prop-card__img"
                                  loading="lazy"
                                />
                              ) : (
                                <div
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    height: '100%',
                                    color: '#8c958d',
                                  }}
                                >
                                  <Building2 size={24} />
                                </div>
                              )}
                            </div>
                            <div className="broker-prop-card__meta">
                              <h4 className="broker-prop-card__title" title={prop.title || ''}>
                                {prop.title || `عقار #${prop.id}`}
                              </h4>
                              <div className="broker-prop-card__location">
                                <MapPin size={12} />
                                <span>{prop.district || prop.city || 'المحلة الكبرى'}</span>
                                {prop.finishingStatus && (
                                  <span className="broker-prop-card__spec">{prop.finishingStatus}</span>
                                )}
                              </div>
                              <div className="broker-prop-card__price-row">
                                <span className="broker-prop-card__price">
                                  {prop.price ? `${prop.price.toLocaleString('ar-EG')} ج.م` : 'تواصل للسعر'}
                                </span>
                                {prop.areaSqm && (
                                  <span className="broker-prop-card__spec">{prop.areaSqm}م²</span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="broker-prop-card__actions">
                            <button
                              className="broker-prop-card__btn broker-prop-card__btn--view"
                              onClick={() => handleViewProperty(prop.id)}
                            >
                              <ExternalLink size={13} />
                              عرض العقار
                            </button>
                            <a
                              href={getWhatsAppUrl(prop)}
                              target="_blank"
                              rel="noreferrer"
                              className="broker-prop-card__btn broker-prop-card__btn--whatsapp"
                            >
                              <Phone size={13} />
                              حجز معاينة
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="broker-msg broker-msg--assistant">
                <div className="broker-msg__avatar">
                  <Sparkles size={15} />
                </div>
                <div className="broker-typing">
                  <span className="broker-typing__dot" />
                  <span className="broker-typing__dot" />
                  <span className="broker-typing__dot" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Starters (shown if only welcome message) */}
          {messages.length === 1 && (
            <div className="broker-chips-container">
              <span className="broker-chips-label">جرّب تسأل:</span>
              <div className="broker-chips-wrap">
                {QUICK_STARTERS.map((starter, i) => (
                  <button
                    key={i}
                    className="broker-chip"
                    onClick={() => handleSendMessage(starter)}
                  >
                    {starter}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Form */}
          <form
            className="broker-chat-input-form"
            onSubmit={e => {
              e.preventDefault()
              handleSendMessage()
            }}
          >
            <input
              ref={inputRef}
              type="text"
              className="broker-chat-input"
              placeholder="اكتب طلبك أو استفسارك هنا..."
              value={input}
              onChange={e => setInput(e.target.value)}
              disabled={loading}
            />
            <button
              type="submit"
              className="broker-chat-send-btn"
              disabled={!input.trim() || loading}
              aria-label="إرسال"
            >
              <Send size={18} style={{ transform: 'rotate(180deg)' }} />
            </button>
          </form>
        </div>
      )}
    </>
  )
}
