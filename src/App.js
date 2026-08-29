import React, { useState } from 'react';
import { Menu, X, ChevronRight, Star, Users, Zap, Send, MapPin, Phone, Mail, Instagram, Facebook, Twitter } from 'lucide-react';

const THEME = {
  primary: '#3b82f6',
  secondary: '#8b5cf6',
  accent: '#ec4899',
  dark: '#0f172a',
  darker: '#020617',
  text: '#f1f5f9',
  textSub: '#cbd5e1',
  card: 'rgba(30, 41, 59, 0.8)',
  border: '#334155',
  bg: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
  shadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
  blur: 'blur(10px)',
};

const PORTFOLIO_ITEMS = [
  { id: 1, title: "Custom Figure Anime", category: "Miniatur", image: "🎨", description: "Figure anime custom dengan detail tinggi, warna custom sesuai karakter favorit Anda", price: "Mulai dari Rp 150.000" },
  { id: 2, title: "Souvenir Pernikahan", category: "Souvenir", image: "💍", description: "Souvenir pernikahan custom dengan nama dan tanggal acara Anda", price: "Mulai dari Rp 50.000" },
  { id: 3, title: "Miniatur Rumah Custom", category: "Miniatur", image: "🏠", description: "Miniatur rumah impian Anda dalam detail akurat dengan material berkualitas", price: "Mulai dari Rp 500.000" },
  { id: 4, title: "Action Figure Custom", category: "Miniatur", image: "🤖", description: "Action figure custom dengan pose sesuai keinginan Anda", price: "Mulai dari Rp 200.000" },
  { id: 5, title: "Souvenir Corporate", category: "Souvenir", image: "🎁", description: "Souvenir perusahaan dengan logo dan branding custom", price: "Mulai dari Rp 75.000" },
  { id: 6, title: "Miniatur Kendaraan", category: "Miniatur", image: "🚗", description: "Miniatur mobil, motor, atau kendaraan impian Anda", price: "Mulai dari Rp 250.000" },
  { id: 7, title: "Figurin Lucu Custom", category: "Gift", image: "😊", description: "Figurin lucu custom dengan ekspresi dan pose unik", price: "Mulai dari Rp 100.000" },
  { id: 8, title: "Trophy & Medali Custom", category: "Souvenir", image: "🏆", description: "Trophy dan medali custom untuk kompetisi atau penghargaan", price: "Mulai dari Rp 80.000" },
  { id: 9, title: "Diorama Custom", category: "Miniatur", image: "🌆", description: "Diorama atau scene miniatur dengan latar belakang custom", price: "Mulai dari Rp 800.000" },
];

const SERVICES = [
  { icon: "🎨", title: "Design Custom", description: "Tim desainer kami siap mewujudkan ide Anda menjadi desain 3D yang sempurna" },
  { icon: "🖨️", title: "3D Printing", description: "Teknologi 3D printing terkini dengan material berkualitas tinggi" },
  { icon: "🎭", title: "Finishing & Coloring", description: "Finishing profesional dengan coating dan pewarnaan custom" },
  { icon: "📦", title: "Packaging Premium", description: "Packaging premium yang aman dan menarik untuk hadiah Anda" },
  { icon: "⚡", title: "Pengerjaan Cepat", description: "Proses produksi cepat tanpa mengorbankan kualitas hasil" },
  { icon: "🚚", title: "Pengiriman Aman", description: "Pengiriman ke seluruh Indonesia dengan asuransi penuh" },
];

const TESTIMONIALS = [
  { name: "Budi Santoso", role: "Pengantin", comment: "Souvenir pernikahan kami sangat indah dan teman-teman sangat terkesan. Highly recommended!", rating: 5 },
  { name: "Siti Rahma", role: "Pengusaha", comment: "Souvenir corporate kami menjadi highlight di acara launching produk. Kualitas terbaik!", rating: 5 },
  { name: "Ahmad Wijaya", role: "Kolektor", comment: "Figure custom anime saya terlihat sempurna seperti karakter aslinya. Kerja rapi!", rating: 5 },
];

function Navbar({ activeSection, setActiveSection }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      width: '100%',
      background: `rgba(15, 23, 42, 0.95)`,
      backdropFilter: THEME.blur,
      WebkitBackdropFilter: THEME.blur,
      borderBottom: `1px solid ${THEME.border}`,
      zIndex: 1000,
      padding: '1rem 1.25rem',
      boxSizing: 'border-box'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          cursor: 'pointer',
          minWidth: 0
        }} onClick={() => { setActiveSection('home'); setMobileOpen(false); }}>

  <img
    src="/revion.png"
    alt="Logo"
    style={{
      width: '40px',
      height: '40px',
      flexShrink: 0,
      objectFit: 'contain'
    }}
/>
   <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          justifyContent: 'center',
          lineHeight: '1.2',
          minWidth: 0
}}>

       <span style={{
          fontSize: 'clamp(16px, 4vw, 24px)',
          fontWeight: 'bold',
          whiteSpace: 'nowrap',
          background: `linear-gradient(135deg, ${THEME.primary}, ${THEME.secondary})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'  
}}>
          REVION 3D 
            </span>
        <span className="navbar-subtitle" style={{
          fontSize: 'clamp(11px, 3vw, 18px)',
          fontWeight: '500',
          whiteSpace: 'nowrap',
          background: `linear-gradient(135deg, ${THEME.primary}, ${THEME.secondary})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text' 
          }}>
            Manufacturing
              </span>
            </div>
          </div>

        <button
          className="mobile-toggle"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
          style={{
            display: 'none',
            background: 'none',
            border: 'none',
            color: THEME.text,
            cursor: 'pointer',
            padding: '6px',
            flexShrink: 0
          }}
        >
          {mobileOpen ? <X size={26} /> : <Menu size={26} />}
        </button>

        <div className={`nav-links${mobileOpen ? ' open' : ''}`} style={{ display: 'flex', gap: '1.75rem', alignItems: 'center' }}>
          {['home', 'services', 'portfolio', 'about', 'contact'].map(item => (
            <button
              key={item}
              onClick={() => {
                setActiveSection(item);
                setMobileOpen(false);
              }}
              style={{
                background: 'none',
                border: 'none',
                color: activeSection === item ? THEME.primary : THEME.textSub,
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: activeSection === item ? '600' : '400',
                textTransform: 'capitalize',
                padding: '8px 0',
                borderBottom: activeSection === item ? `2px solid ${THEME.primary}` : 'none'
              }}
            >
              {item}
            </button>
          ))}
          <button
            onClick={() => {
              setActiveSection('contact');
              setMobileOpen(false);
            }}
            style={{
              background: `linear-gradient(135deg, ${THEME.primary}, ${THEME.secondary})`,
              color: '#fff',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            Hubungi Kami
          </button>
        </div>
      </div>
    </nav>
  );
}

function HeroSection() {
  return (
    <div style={{
      minHeight: '100vh',
      background: THEME.bg,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
      paddingTop: '80px'
    }}>
      <div style={{
        position: 'absolute',
        inset: 0,
        background: `radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
                      radial-gradient(circle at 80% 80%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)`,
        pointerEvents: 'none'
      }} />
      
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 1.25rem',
        textAlign: 'center',
        position: 'relative',
        zIndex: 10,
        width: '100%',
        boxSizing: 'border-box'
      }}>
        <h1 style={{
          fontSize: 'clamp(28px, 7vw, 64px)',
          fontWeight: 'bold',
          marginBottom: '24px',
          background: `linear-gradient(135deg, ${THEME.primary}, ${THEME.secondary}, ${THEME.accent})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          lineHeight: 1.2
        }}>
          Wujudkan Ide Kreatif Anda Dengan Revion 3D Manufacturing
        </h1>
        
        <p style={{
          fontSize: '18px',
          color: THEME.textSub,
          marginBottom: '32px',
          maxWidth: '600px',
          margin: '0 auto 32px'
        }}>
          Spesialis pembuatan miniatur custom, souvenir 3D, dan gift eksklusif dengan teknologi 3D printing terkini
        </p>
        
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button style={{
            background: `linear-gradient(135deg, ${THEME.primary}, ${THEME.secondary})`,
            color: '#fff',
            border: 'none',
            padding: '16px 32px',
            borderRadius: '10px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            Pesan Sekarang <ChevronRight size={20} />
          </button>
          <button style={{
            background: `rgba(59, 130, 246, 0.1)`,
            color: THEME.primary,
            border: `1px solid ${THEME.primary}`,
            padding: '16px 32px',
            borderRadius: '10px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '600'
          }}>
            Lihat Portfolio
          </button>
        </div>
        
        <div style={{
          marginTop: '64px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: '32px',
          maxWidth: '600px',
          margin: '64px auto 0'
        }}>
          {[
            { label: '500+', desc: 'Project Selesai' },
            { label: '98%', desc: 'Kepuasan Klien' },
            { label: '3+', desc: 'Tahun Pengalaman' }
          ].map((stat, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{
                fontSize: '32px',
                fontWeight: 'bold',
                background: `linear-gradient(135deg, ${THEME.primary}, ${THEME.secondary})`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                marginBottom: '8px'
              }}>
                {stat.label}
              </div>
              <div style={{ color: THEME.textSub, fontSize: '14px' }}>
                {stat.desc}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ServicesSection() {
  return (
    <div style={{
      background: `linear-gradient(180deg, ${THEME.dark} 0%, ${THEME.darker} 100%)`,
      padding: 'clamp(48px, 10vw, 80px) 1.25rem',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{ maxWidth: '1200px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <h2 style={{
            fontSize: 'clamp(28px, 6vw, 48px)',
            fontWeight: 'bold',
            color: THEME.text,
            marginBottom: '16px'
          }}>
            Layanan Kami
          </h2>
          <p style={{
            fontSize: '18px',
            color: THEME.textSub,
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            Kami menyediakan solusi lengkap untuk kebutuhan 3D printing dan custom souvenir Anda
          </p>
        </div>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px'
        }}>
          {SERVICES.map((service, i) => (
            <div key={i} style={{
              background: THEME.card,
              border: `1px solid ${THEME.border}`,
              borderRadius: '16px',
              padding: '32px',
              backdropFilter: THEME.blur,
              WebkitBackdropFilter: THEME.blur,
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }} 
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px)';
              e.currentTarget.style.borderColor = THEME.primary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = THEME.border;
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>
                {service.icon}
              </div>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: THEME.text,
                marginBottom: '12px'
              }}>
                {service.title}
              </h3>
              <p style={{
                fontSize: '14px',
                color: THEME.textSub,
                lineHeight: 1.6
              }}>
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PortfolioSection() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const categories = ['All', 'Miniatur', 'Souvenir', 'Gift'];
  const filtered = selectedCategory === 'All' 
    ? PORTFOLIO_ITEMS 
    : PORTFOLIO_ITEMS.filter(item => item.category === selectedCategory);
  
  return (
    <div style={{
      background: THEME.bg,
      padding: 'clamp(48px, 10vw, 80px) 1.25rem',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{ maxWidth: '1200px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <h2 style={{
            fontSize: 'clamp(28px, 6vw, 48px)',
            fontWeight: 'bold',
            color: THEME.text,
            marginBottom: '16px'
          }}>
            Portfolio Kami
          </h2>
          <p style={{
            fontSize: '18px',
            color: THEME.textSub,
            marginBottom: '32px'
          }}>
            Lihat berbagai project yang telah kami selesaikan dengan sempurna
          </p>
          
          <div style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '10px 20px',
                  borderRadius: '8px',
                  border: selectedCategory === cat ? 'none' : `1px solid ${THEME.border}`,
                  background: selectedCategory === cat 
                    ? `linear-gradient(135deg, ${THEME.primary}, ${THEME.secondary})`
                    : 'transparent',
                  color: selectedCategory === cat ? '#fff' : THEME.text,
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all 0.3s ease'
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '24px'
        }}>
          {filtered.map(item => (
            <div key={item.id} style={{
              background: THEME.card,
              border: `1px solid ${THEME.border}`,
              borderRadius: '16px',
              overflow: 'hidden',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.borderColor = THEME.primary;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.borderColor = THEME.border;
            }}>
              <div style={{
                fontSize: '120px',
                textAlign: 'center',
                padding: '32px',
                background: `linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1))`
              }}>
                {item.image}
              </div>
              <div style={{ padding: '24px' }}>
                <div style={{
                  fontSize: '12px',
                  color: THEME.primary,
                  fontWeight: '600',
                  marginBottom: '8px',
                  textTransform: 'uppercase'
                }}>
                  {item.category}
                </div>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: '600',
                  color: THEME.text,
                  marginBottom: '12px'
                }}>
                  {item.title}
                </h3>
                <p style={{
                  fontSize: '14px',
                  color: THEME.textSub,
                  marginBottom: '16px',
                  minHeight: '40px'
                }}>
                  {item.description}
                </p>
                <div style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: THEME.secondary,
                  paddingTop: '12px',
                  borderTop: `1px solid ${THEME.border}`
                }}>
                  {item.price}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AboutSection() {
  return (
    <div style={{
      background: `linear-gradient(180deg, ${THEME.dark} 0%, ${THEME.darker} 100%)`,
      padding: 'clamp(48px, 10vw, 80px) 1.25rem',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{ maxWidth: '1200px', width: '100%' }}>
        <div className="about-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '48px',
          alignItems: 'center'
        }}>
          <div>
            <h2 style={{
              fontSize: 'clamp(28px, 6vw, 48px)',
              fontWeight: 'bold',
              color: THEME.text,
              marginBottom: '24px'
            }}>
              Tentang <span style={{ color: THEME.primary }}>Revion 3D Manufacturing</span>
            </h2>
            <p style={{
              fontSize: '16px',
              color: THEME.textSub,
              lineHeight: 1.8,
              marginBottom: '16px'
            }}>
              Revion 3D Manufacturing adalah Penyedia jasa spesialis dalam pembuatan miniatur custom, souvenir 3D printing, dan gift eksklusif. Dengan teknologi terkini dan tim profesional, kami siap mewujudkan ide kreatif Anda menjadi produk nyata yang memukau.
            </p>
            <p style={{
              fontSize: '16px',
              color: THEME.textSub,
              lineHeight: 1.8,
              marginBottom: '24px'
            }}>
              Sejak didirikan pada tahun 2026, kami telah melayani lebih dari 500 project dengan tingkat kepuasan klien mencapai 98%. Setiap project dikerjakan dengan detail dan dedikasi penuh untuk menghasilkan produk berkualitas terbaik.
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                '✓ Teknologi 3D Printer Terkini',
                '✓ Tim Desainer Berpengalaman',
                '✓ Material Berkualitas Premium',
                '✓ Garansi Kepuasan 100%'
              ].map((item, i) => (
                <div key={i} style={{
                  color: THEME.text,
                  fontSize: '16px'
                }}>
                  {item}
                </div>
              ))}
            </div>
          </div>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: '16px'
          }}>
            {[
              { icon: '👥', label: '500+', value: 'Project Selesai' },
              { icon: '⭐', label: '4.9', value: 'Rating' },
              { icon: '🏆', label: '15+', value: 'Award' },
              { icon: '🌍', label: '34', value: 'Provinsi' }
            ].map((stat, i) => (
              <div key={i} style={{
                background: THEME.card,
                border: `1px solid ${THEME.border}`,
                borderRadius: '16px',
                padding: 'clamp(16px, 4vw, 32px)',
                textAlign: 'center',
                backdropFilter: THEME.blur,
                WebkitBackdropFilter: THEME.blur
              }}>
                <div style={{ fontSize: 'clamp(28px, 6vw, 48px)', marginBottom: '12px' }}>
                  {stat.icon}
                </div>
                <div style={{
                  fontSize: '28px',
                  fontWeight: 'bold',
                  color: THEME.primary,
                  marginBottom: '8px'
                }}>
                  {stat.label}
                </div>
                <div style={{
                  fontSize: '14px',
                  color: THEME.textSub
                }}>
                  {stat.value}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div style={{
          marginTop: '80px',
          background: `linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1))`,
          border: `1px solid ${THEME.border}`,
          borderRadius: '16px',
          padding: '48px 32px',
          textAlign: 'center'
        }}>
          <h3 style={{
            fontSize: '32px',
            fontWeight: 'bold',
            color: THEME.text,
            marginBottom: '16px'
          }}>
            Testimoni Klien
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px',
            marginTop: '32px'
          }}>
            {TESTIMONIALS.map((testi, i) => (
              <div key={i} style={{
                background: THEME.card,
                border: `1px solid ${THEME.border}`,
                borderRadius: '12px',
                padding: '24px',
                backdropFilter: THEME.blur,
                WebkitBackdropFilter: THEME.blur
              }}>
                <div style={{
                  display: 'flex',
                  gap: '4px',
                  marginBottom: '12px',
                  justifyContent: 'center'
                }}>
                  {[...Array(testi.rating)].map((_, j) => (
                    <Star key={j} size={18} fill={THEME.primary} color={THEME.primary} />
                  ))}
                </div>
                <p style={{
                  color: THEME.textSub,
                  fontSize: '14px',
                  marginBottom: '16px',
                  fontStyle: 'italic',
                  lineHeight: 1.6
                }}>
                  "{testi.comment}"
                </p>
                <div style={{
                  borderTop: `1px solid ${THEME.border}`,
                  paddingTop: '12px'
                }}>
                  <div style={{
                    fontWeight: '600',
                    color: THEME.text,
                    marginBottom: '4px'
                  }}>
                    {testi.name}
                  </div>
                  <div style={{
                    fontSize: '12px',
                    color: THEME.textSub
                  }}>
                    {testi.role}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ContactSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  
  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Terima kasih! Kami akan segera menghubungi Anda.');
    setFormData({ name: '', email: '', phone: '', message: '' });
  };
  
  return (
    <div style={{
      background: THEME.bg,
      padding: 'clamp(48px, 10vw, 80px) 1.25rem',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{ maxWidth: '1000px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <h2 style={{
            fontSize: 'clamp(28px, 6vw, 48px)',
            fontWeight: 'bold',
            color: THEME.text,
            marginBottom: '16px'
          }}>
            Hubungi Kami
          </h2>
          <p style={{
            fontSize: '18px',
            color: THEME.textSub,
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            Siap membantu mewujudkan ide kreatif Anda. Hubungi kami sekarang!
          </p>
        </div>
        
        <div className="contact-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '40px',
          alignItems: 'start'
        }}>
          <div>
            <h3 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: THEME.text,
              marginBottom: '32px'
            }}>
              Kontak Langsung
            </h3>
            
            {[
              {
                icon: <MapPin size={24} />,
                label: 'Alamat',
                value: 'Jl. Inovasi No. 123, Jakarta Selatan, 12345'
              },
              {
                icon: <Phone size={24} />,
                label: 'Telepon',
                value: '+62 812-3456-7890'
              },
              {
                icon: <Mail size={24} />,
                label: 'Email',
                value: 'info@3dprintstudio.com'
              }
            ].map((contact, i) => (
              <div key={i} style={{
                display: 'flex',
                gap: '16px',
                marginBottom: '32px'
              }}>
                <div style={{
                  color: THEME.primary,
                  flexShrink: 0
                }}>
                  {contact.icon}
                </div>
                <div>
                  <div style={{
                    fontSize: '14px',
                    color: THEME.textSub,
                    marginBottom: '4px'
                  }}>
                    {contact.label}
                  </div>
                  <div style={{
                    fontSize: '16px',
                    color: THEME.text,
                    fontWeight: '500'
                  }}>
                    {contact.value}
                  </div>
                </div>
              </div>
            ))}
            
            <div style={{
              marginTop: '48px'
            }}>
              <h4 style={{
                fontSize: '16px',
                fontWeight: '600',
                color: THEME.text,
                marginBottom: '16px'
              }}>
                Ikuti Kami
              </h4>
              <div style={{
                display: 'flex',
                gap: '12px'
              }}>
                {[Instagram, Facebook, Twitter].map((Icon, i) => (
                  <button key={i} style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '8px',
                    background: `rgba(59, 130, 246, 0.1)`,
                    border: `1px solid ${THEME.border}`,
                    color: THEME.primary,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = `linear-gradient(135deg, ${THEME.primary}, ${THEME.secondary})`;
                    e.currentTarget.style.color = '#fff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = `rgba(59, 130, 246, 0.1)`;
                    e.currentTarget.style.color = THEME.primary;
                  }}>
                    <Icon size={20} />
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} style={{
            background: THEME.card,
            border: `1px solid ${THEME.border}`,
            borderRadius: '16px',
            padding: '32px',
            backdropFilter: THEME.blur,
            WebkitBackdropFilter: THEME.blur
          }}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: THEME.text,
                marginBottom: '8px'
              }}>
                Nama Lengkap
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Nama Anda"
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  background: `rgba(15, 23, 42, 0.8)`,
                  border: `1px solid ${THEME.border}`,
                  borderRadius: '8px',
                  color: THEME.text,
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: THEME.text,
                marginBottom: '8px'
              }}>
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="email@example.com"
                required
                style={{
                  width: '100%',
                  padding: '12px',
                  background: `rgba(15, 23, 42, 0.8)`,
                  border: `1px solid ${THEME.border}`,
                  borderRadius: '8px',
                  color: THEME.text,
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: THEME.text,
                marginBottom: '8px'
              }}>
                Nomor Telepon
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                placeholder="08xx xxxx xxxx"
                style={{
                  width: '100%',
                  padding: '12px',
                  background: `rgba(15, 23, 42, 0.8)`,
                  border: `1px solid ${THEME.border}`,
                  borderRadius: '8px',
                  color: THEME.text,
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
              />
            </div>
            
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: THEME.text,
                marginBottom: '8px'
              }}>
                Pesan
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                placeholder="Jelaskan kebutuhan Anda..."
                required
                rows="5"
                style={{
                  width: '100%',
                  padding: '12px',
                  background: `rgba(15, 23, 42, 0.8)`,
                  border: `1px solid ${THEME.border}`,
                  borderRadius: '8px',
                  color: THEME.text,
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box',
                  fontFamily: 'inherit',
                  resize: 'vertical'
                }}
              />
            </div>
            
            <button
              type="submit"
              style={{
                width: '100%',
                padding: '14px',
                background: `linear-gradient(135deg, ${THEME.primary}, ${THEME.secondary})`,
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              Kirim Pesan <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer style={{
      background: THEME.darker,
      border: `1px solid ${THEME.border}`,
      padding: '32px 2rem',
      textAlign: 'center',
      color: THEME.textSub
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '32px',
          marginBottom: '32px',
          textAlign: 'left'
        }}>
          <div>
            <div style={{
              fontSize: '20px',
              fontWeight: 'bold',
              background: `linear-gradient(135deg, ${THEME.primary}, ${THEME.secondary})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              marginBottom: '12px'
            }}>
              3D PrintStudio
            </div>
            <p style={{ fontSize: '14px', lineHeight: 1.6 }}>
              Spesialis pembuatan miniatur custom, souvenir 3D, dan gift eksklusif dengan teknologi terkini.
            </p>
          </div>
          <div>
            <h4 style={{ color: THEME.text, marginBottom: '12px', fontWeight: '600' }}>
              Layanan
            </h4>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {['3D Printing', 'Custom Design', 'Finishing', 'Packaging'].map((item, i) => (
                <li key={i} style={{ marginBottom: '8px' }}>
                  <a href="#" style={{ color: THEME.textSub, textDecoration: 'none' }}>
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 style={{ color: THEME.text, marginBottom: '12px', fontWeight: '600' }}>
              Perusahaan
            </h4>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {['Tentang Kami', 'Portfolio', 'Blog', 'Kontak'].map((item, i) => (
                <li key={i} style={{ marginBottom: '8px' }}>
                  <a href="#" style={{ color: THEME.textSub, textDecoration: 'none' }}>
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div style={{
          borderTop: `1px solid ${THEME.border}`,
          paddingTop: '24px'
        }}>
          <p style={{ marginBottom: '12px' }}>
            © 2026 Revion 3D Manufacturing . Semua hak dilindungi.
          </p>
          <p style={{ fontSize: '12px', color: THEME.textSub }}>
            Dibuat dengan oleh Revion 3D Manufacturing
          </p>
        </div>
      </div>
    </footer>
  );
}

function GlobalStyle() {
  return (
    <style>{`
      * { box-sizing: border-box; }
      html, body {
        margin: 0;
        overflow-x: hidden;
        max-width: 100%;
      }
      img, svg { max-width: 100%; }

      @media (max-width: 860px) {
        .mobile-toggle { display: flex !important; }
        .nav-links {
          position: fixed;
          top: 66px;
          left: 0;
          right: 0;
          flex-direction: column !important;
          align-items: flex-start !important;
          gap: 4px !important;
          background: rgba(15, 23, 42, 0.98);
          border-bottom: 1px solid ${THEME.border};
          padding: 12px 20px 20px;
          max-height: 0;
          overflow: hidden;
          opacity: 0;
          pointer-events: none;
          transition: max-height 0.25s ease, opacity 0.2s ease;
        }
        .nav-links.open {
          max-height: 400px;
          opacity: 1;
          pointer-events: auto;
        }
        .nav-links button { width: 100%; text-align: left; }
      }

      @media (max-width: 420px) {
        .navbar-subtitle { display: none; }
      }
    `}</style>
  );
}

export default function App() {
  const [activeSection, setActiveSection] = useState('home');
  
  return (
    <div style={{
      background: '#000',
      color: THEME.text,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      minHeight: '100vh',
      overflowX: 'hidden',
      width: '100%'
    }}>
      <GlobalStyle />
      <Navbar activeSection={activeSection} setActiveSection={setActiveSection} />
      
      {activeSection === 'home' && <HeroSection />}
      {activeSection === 'services' && <ServicesSection />}
      {activeSection === 'portfolio' && <PortfolioSection />}
      {activeSection === 'about' && <AboutSection />}
      {activeSection === 'contact' && <ContactSection />}
      
      <Footer />
    </div>
  );
}
