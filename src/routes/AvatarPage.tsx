import { useEffect, useRef, useState } from 'react';
import { AvatarEngine, EngineStatus, AnimationItem } from '../three/AvatarEngine';
import './AvatarPage.css';

function AvatarPage() {
    const hostRef = useRef<HTMLDivElement>(null);
    const engineRef = useRef<AvatarEngine | null>(null);
    const [status, setStatus] = useState<EngineStatus>('initializing');
    const [statusMessage, setStatusMessage] = useState<string>('');

    // Lista de animaciones del JSON
    const [animations, setAnimations] = useState<AnimationItem[]>([]);
    const [selectedAnim, setSelectedAnim] = useState<string>('');

    useEffect(() => {
        // 1. Cargar lista de animaciones
        fetch('/movements.json')
            .then(res => res.json())
            .then(data => setAnimations(data))
            .catch(err => console.warn('No movements.json found', err));

        // 2. Inicializar Engine
        if (!hostRef.current) return;

        const engine = new AvatarEngine({
            maxDPR: 1.5,
            onStatus: (st, msg) => {
                setStatus(st);
                setStatusMessage(msg || '');
            },
        });

        engineRef.current = engine;

        // Init async
        engine.init(hostRef.current).then(() => {
            engine.start();
        });

        return () => {
            engine.dispose();
            engineRef.current = null;
        };
    }, []); // Fin del efecto de montaje

    // Efecto para cargar automáticamente la primera animación una vez disponible la lista y el engine
    useEffect(() => {
        if (animations.length > 0 && engineRef.current && (status === 'ready' || status === 'rendering')) {
            // Si no tenemos ninguna seleccionada todavía, cogemos la primera
            if (!selectedAnim) {
                const firstAnim = animations[0];
                console.log('[AvatarPage] Auto-loading first animation:', firstAnim.name);
                setSelectedAnim(firstAnim.path);

                // Darle un pequeño respiro al render inicial
                setTimeout(() => {
                    engineRef.current?.loadAnimationFromUrl(firstAnim.path);
                }, 100);
            }
        }
    }, [animations, status, selectedAnim]);

    const handleWave = () => {
        engineRef.current?.triggerWave();
    };

    const handleAnimChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const path = e.target.value;
        setSelectedAnim(path);
        if (path && engineRef.current) {
            engineRef.current.loadAnimationFromUrl(path);
        }
    };

    const getStatusColor = (): string => {
        switch (status) {
            case 'ready':
            case 'rendering': return '#4ade80';
            case 'initializing':
            case 'loading_avatar': return '#fbbf24';
            case 'error': return '#ef4444';
            default: return '#ababab';
        }
    };

    return (
        <div className="avatar-page">
            <div className="avatar-container">

                {/* Header Status */}
                <div className="avatar-header">
                    <div className="status-indicator" style={{ borderColor: getStatusColor() }}>
                        <div className="status-dot" style={{ backgroundColor: getStatusColor() }} />
                        <span className="status-text">{status.toUpperCase()} {statusMessage && `- ${statusMessage}`}</span>
                    </div>
                </div>

                {/* 3D Canvas Host */}
                <div ref={hostRef} className="canvas-host" />

                {/* Controls Toolbar */}
                <div className="avatar-controls">

                    <button
                        className="control-btn wave-btn"
                        onClick={handleWave}
                        disabled={status !== 'rendering' && status !== 'ready'}
                    >
                        👋 Saludar
                    </button>

                    <div className="anim-selector-group">
                        <label>Animación:</label>
                        <select
                            value={selectedAnim}
                            onChange={handleAnimChange}
                            disabled={animations.length === 0}
                            className="anim-select"
                        >
                            <option value="">-- Seleccionar --</option>
                            {animations.map((anim, idx) => (
                                <option key={idx} value={anim.path}>
                                    {anim.name}
                                </option>
                            ))}
                        </select>
                    </div>

                </div>

            </div>
        </div>
    );
}

export default AvatarPage;
