import './About.css';

function About() {
    return (
        <div className="about-container">
            <div className="about-header">
                <h1 className="about-title">Acerca de este Proyecto</h1>
                <p className="about-subtitle">
                    Implementación profesional de Three.js en React
                </p>
            </div>

            <div className="about-content">
                <section className="about-section">
                    <h2>🎯 Objetivo</h2>
                    <p>
                        Demostrar la integración correcta de una escena Three.js dentro de
                        una aplicación React con TypeScript, garantizando:
                    </p>
                    <ul>
                        <li>Gestión adecuada del ciclo de vida del componente</li>
                        <li>Liberación correcta de recursos GPU/CPU</li>
                        <li>Sin fugas de memoria al navegar entre páginas</li>
                        <li>Parada completa del render loop al desmontar</li>
                    </ul>
                </section>

                <section className="about-section">
                    <h2>🏗️ Arquitectura</h2>
                    <div className="architecture-grid">
                        <div className="arch-item">
                            <h3>AvatarEngine</h3>
                            <p>
                                Motor Three.js encapsulado e independiente de React. Maneja la
                                creación del canvas, renderer, escena, cámara y loop de
                                animación.
                            </p>
                        </div>
                        <div className="arch-item">
                            <h3>AvatarPage</h3>
                            <p>
                                Componente React que instancia el engine en useEffect y lo
                                destruye en cleanup, garantizando limpieza total.
                            </p>
                        </div>
                        <div className="arch-item">
                            <h3>dispose.ts</h3>
                            <p>
                                Utilidad para recorrer el árbol de escena y liberar geometrías,
                                materiales y texturas de forma segura.
                            </p>
                        </div>
                        <div className="arch-item">
                            <h3>React Router</h3>
                            <p>
                                Navegación SPA que monta/desmonta componentes, activando los
                                ciclos de vida necesarios.
                            </p>
                        </div>
                    </div>
                </section>

                <section className="about-section">
                    <h2>✅ Criterios de Aceptación</h2>
                    <div className="checklist">
                        <div className="checklist-item">
                            <span className="check-icon">✓</span>
                            <p>
                                El render loop se detiene completamente al salir de /avatar
                            </p>
                        </div>
                        <div className="checklist-item">
                            <span className="check-icon">✓</span>
                            <p>El canvas desaparece del DOM al desmontar el componente</p>
                        </div>
                        <div className="checklist-item">
                            <span className="check-icon">✓</span>
                            <p>
                                No hay fugas de memoria al navegar repetidamente entre páginas
                            </p>
                        </div>
                        <div className="checklist-item">
                            <span className="check-icon">✓</span>
                            <p>
                                Resize responsivo con ResizeObserver sobre el contenedor host
                            </p>
                        </div>
                        <div className="checklist-item">
                            <span className="check-icon">✓</span>
                            <p>DPR limitado para optimizar rendimiento</p>
                        </div>
                        <div className="checklist-item">
                            <span className="check-icon">✓</span>
                            <p>Código limpio, tipado y sin dependencias innecesarias</p>
                        </div>
                    </div>
                </section>

                <section className="about-section">
                    <h2>🛠️ Stack Tecnológico</h2>
                    <div className="tech-stack">
                        <span className="tech-badge">React 18</span>
                        <span className="tech-badge">TypeScript</span>
                        <span className="tech-badge">Vite</span>
                        <span className="tech-badge">React Router DOM</span>
                        <span className="tech-badge">Three.js</span>
                    </div>
                </section>
            </div>
        </div>
    );
}

export default About;
