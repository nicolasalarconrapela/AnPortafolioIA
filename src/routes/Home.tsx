import { Link } from 'react-router-dom';
import './Home.css';

function Home() {
    return (
        <div className="home-container">
            <div className="hero-section">
                <h1 className="hero-title">
                    Bienvenido a <span className="gradient-text">Avatar Demo</span>
                </h1>
                <p className="hero-subtitle">
                    Una demostración de integración correcta de Three.js con React
                </p>
                <p className="hero-description">
                    Este proyecto muestra cómo integrar una escena Three.js dentro de una
                    aplicación React con navegación entre páginas, garantizando la
                    liberación correcta de recursos GPU/CPU al desmontar el componente.
                </p>
                <div className="cta-buttons">
                    <Link to="/avatar" className="btn btn-primary">
                        Ver Avatar 3D
                    </Link>
                    <Link to="/about" className="btn btn-secondary">
                        Más Información
                    </Link>
                </div>
            </div>

            <div className="features-section">
                <h2 className="section-title">Características</h2>
                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon">🎮</div>
                        <h3>Gestión de Recursos</h3>
                        <p>
                            Limpieza automática de memoria GPU/CPU al navegar fuera de la
                            página del avatar
                        </p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">🔄</div>
                        <h3>Ciclo de Vida Correcto</h3>
                        <p>
                            Montaje y desmontaje limpio con cancelación de requestAnimationFrame
                        </p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">⚡</div>
                        <h3>Alto Rendimiento</h3>
                        <p>
                            Optimización de DPR y resize responsivo con ResizeObserver
                        </p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">🎨</div>
                        <h3>Three.js Encapsulado</h3>
                        <p>
                            Motor independiente de React para mejor separación de responsabilidades
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Home;
