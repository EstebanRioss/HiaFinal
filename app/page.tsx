import Navbar from './components/Navbar';
import Link from 'next/link';

const steps = [
  { number: 1, title: 'Crea tu cuenta', text: 'Regístrate como jugador o dueño para acceder a todas las funcionalidades.' },
  { number: 2, title: 'Elige el deporte', text: 'Filtro inteligente para fútbol, básquet, tenis, pádel, vóley y más.' },
  { number: 3, title: 'Selecciona fecha y duración', text: 'Bloquea el día y el tiempo que necesitas en segundos.' },
  { number: 4, title: 'Define el horario', text: 'Selecciona el horario exacto desde nuestro calendario interactivo.' },
  { number: 5, title: 'Confirma tu reserva', text: 'Revisa los detalles y asegura la cancha ideal para tu equipo.' },
  { number: 6, title: 'Paga a tu manera', text: 'Transferencia, tarjeta o efectivo. Elegís si abonás ahora o al llegar.' },
  { number: 7, title: '¡Listo para jugar!', text: 'Recibe el comprobante digital y prepárate para disfrutar.' },
];

const stats = [
  { value: '50+', label: 'Complejos disponibles' },
  { value: '500+', label: 'Equipos felices' },
  { value: '4.8★', label: 'Promedio de calificaciones' },
  { value: '1.200+', label: 'Reservas confirmadas' },
];

const sports = [
  { icon: '⚽', name: 'Fútbol 5, 7 y 11' },
  { icon: '🏀', name: 'Básquet indoor y outdoor' },
  { icon: '🎾', name: 'Tenis y pickeball' },
  { icon: '🏐', name: 'Vóley playa e indoor' },
  { icon: '🥅', name: 'Hockey y deportes mixtos' },
  { icon: '🥋', name: 'Salas multiuso y artes' },
];

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="landing">
        <section className="hero">
          <div className="hero-overlay" />
          <div className="hero-content container">
            <p className="hero-tag">Reservas multideporte • 24/7</p>
            <h1>
              Reservá la cancha ideal
              <span> en solo 7 pasos</span>
            </h1>
            <p className="hero-subtitle">
              Sin llamadas, sin demoras. Gestiona tus reservas para cualquier deporte desde un único lugar
              y pagá como prefieras.
            </p>
            <div className="hero-cta">
              <Link href="/register" className="btn btn-primary">
                Registrarse ahora
              </Link>
              <Link href="/courts" className="btn btn-secondary">
                Ver canchas disponibles
              </Link>
            </div>
          </div>
        </section>

        <section className="sports container">
          {sports.map((sport) => (
            <div key={sport.name} className="sport-pill">
              <span className="sport-icon">{sport.icon}</span>
              <span>{sport.name}</span>
            </div>
          ))}
        </section>

        <section className="steps container">
          <h2>¿Cómo reservar una cancha?</h2>
          <p className="section-subtitle">
            Sigue estos pasos y asegurá tu cancha favorita en cualquier ciudad.
          </p>
          <div className="steps-grid">
            {steps.map((step) => (
              <div key={step.number} className="step-card">
                <div className="step-number">{step.number}</div>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="stats container">
          <h2>¿Por qué elegirnos?</h2>
          <p className="section-subtitle">
            Más de 5 años conectando jugadores con los mejores complejos deportivos multideporte.
          </p>
          <div className="stats-grid">
            {stats.map((stat) => (
              <div key={stat.label} className="stat-card">
                <h3>{stat.value}</h3>
                <p>{stat.label}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <div className="container footer-grid">
          <div>
            <h3>PlayFields</h3>
            <p>
              Reserva canchas de fútbol, básquet, tenis, vóley y más en minutos. Disfrutá del deporte con amigos
              sin complicaciones.
            </p>
          </div>
          <div>
            <h4>Enlaces rápidos</h4>
            <ul>
              <li><Link href="/">Inicio</Link></li>
              <li><Link href="/courts">Canchas</Link></li>
              <li><Link href="/login">Iniciar sesión</Link></li>
              <li><Link href="/register">Registrarse</Link></li>
            </ul>
          </div>
          <div>
            <h4>Contacto</h4>
            <p>Av. Deportes 123, Ciudad</p>
            <p>+54 11 5555 5555</p>
            <p>hola@playfields.com</p>
          </div>
        </div>
        <p className="footer-copy">© {new Date().getFullYear()} PlayFields. Todos los derechos reservados.</p>
      </footer>
    </>
  );
}


