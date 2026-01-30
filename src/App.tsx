import { Routes, Route, Link } from 'react-router-dom';
import AvatarPage from './routes/AvatarPage';
import './App.css';

function App() {
    return (
        <div className="app">
            <nav className="navbar">
                <div className="nav-container">
                    <Link to="/" className="nav-logo">
                        Avatar Demo
                    </Link>
                    <ul className="nav-menu">
                        <li className="nav-item">
                            <Link to="/avatar" className="nav-link">
                                Avatar
                            </Link>
                        </li>
                    </ul>
                </div>
            </nav>

            <main className="main-content">
                <Routes>
                    <Route path="/" element={<AvatarPage />} />
                    <Route path="/avatar" element={<AvatarPage />} />
                </Routes>
            </main>
        </div>
    );
}

export default App;
