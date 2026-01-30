import { Routes, Route, Link } from 'react-router-dom';
import Home from './routes/Home';
import AvatarPage from './routes/AvatarPage';
import About from './routes/About';
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
                            <Link to="/" className="nav-link">
                                Home
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/avatar" className="nav-link">
                                Avatar
                            </Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/about" className="nav-link">
                                About
                            </Link>
                        </li>
                    </ul>
                </div>
            </nav>

            <main className="main-content">
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/avatar" element={<AvatarPage />} />
                    <Route path="/about" element={<About />} />
                </Routes>
            </main>
        </div>
    );
}

export default App;
