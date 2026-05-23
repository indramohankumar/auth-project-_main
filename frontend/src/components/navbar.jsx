import { Link, useLocation, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

function Navbar() {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    const isActive = (path) => location.pathname === path;

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500&display=swap');

                .vp-nav {
                    position: sticky;
                    top: 0;
                    z-index: 1000;
                    padding: 12px 20px;
                    background: transparent;
                }

                .vp-nav-glass {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 12px 22px;
                    background: rgba(6, 10, 22, 0.6);
                    backdrop-filter: blur(20px) saturate(160%);
                    -webkit-backdrop-filter: blur(20px) saturate(160%);
                    border: 1px solid rgba(255, 255, 255, 0.09);
                    border-radius: 18px;
                    box-shadow: 0 8px 32px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.08);
                    transition: box-shadow 0.3s ease;
                    gap: 16px;
                }

                .vp-logo {
                    font-family: 'Syne', sans-serif;
                    font-weight: 800;
                    font-size: 20px;
                    letter-spacing: -0.4px;
                    background: linear-gradient(135deg, #ffffff 0%, #a5b4fc 55%, #60a5fa 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    flex-shrink: 0;
                    user-select: none;
                    margin: 0;
                }

                .vp-logo-dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #818cf8, #38bdf8);
                    flex-shrink: 0;
                    animation: vp-pulse 2.5s ease-in-out infinite;
                    display: inline-block;
                }

                @keyframes vp-pulse {
                    0%, 100% { box-shadow: 0 0 6px rgba(129,140,248,0.6); }
                    50%       { box-shadow: 0 0 16px rgba(56,189,248,0.9); }
                }

                .vp-links {
                    display: flex;
                    align-items: center;
                    gap: 2px;
                }

                .vp-link {
                    font-family: 'DM Sans', sans-serif;
                    font-weight: 500;
                    font-size: 14px;
                    color: rgba(255, 255, 255, 0.6);
                    text-decoration: none;
                    padding: 8px 13px;
                    border-radius: 10px;
                    position: relative;
                    transition: color 0.22s ease, background 0.22s ease, transform 0.2s ease;
                    white-space: nowrap;
                }

                .vp-link:hover {
                    color: #ffffff;
                    background: rgba(255, 255, 255, 0.07);
                    transform: translateY(-1px);
                }

                .vp-link-active {
                    color: #ffffff !important;
                    background: rgba(99, 102, 241, 0.2) !important;
                }

                .vp-link-active::after {
                    content: '';
                    position: absolute;
                    bottom: 5px;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 16px;
                    height: 2px;
                    border-radius: 2px;
                    background: linear-gradient(90deg, #818cf8, #38bdf8);
                    box-shadow: 0 0 8px rgba(129,140,248,0.7);
                }

                .vp-logout {
                    font-family: 'DM Sans', sans-serif;
                    font-weight: 500;
                    font-size: 14px;
                    color: rgba(255, 155, 155, 0.9);
                    background: rgba(239, 68, 68, 0.12);
                    border: 1px solid rgba(239, 68, 68, 0.25);
                    border-radius: 10px;
                    padding: 8px 18px;
                    cursor: pointer;
                    white-space: nowrap;
                    flex-shrink: 0;
                    transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
                }

                .vp-logout:hover {
                    background: rgba(239, 68, 68, 0.22);
                    border-color: rgba(239, 68, 68, 0.5);
                    color: #fca5a5;
                    transform: translateY(-1px);
                    box-shadow: 0 4px 16px rgba(239, 68, 68, 0.2);
                }

                .vp-logout:active { transform: translateY(0); }

                @media (max-width: 768px) {
                    .vp-nav { padding: 10px 12px; }
                    .vp-link { font-size: 13px; padding: 7px 9px; }
                    .vp-logo { font-size: 18px; }
                }

                @media (max-width: 600px) {
                    .vp-links { gap: 0; }
                    .vp-link { padding: 7px 7px; font-size: 12px; }
                    .vp-logout { padding: 7px 12px; font-size: 13px; }
                }
            `}</style>

            <nav className="vp-nav">
                <div className="vp-nav-glass">
                    <h1 className="vp-logo">
                        <span className="vp-logo-dot" />
                        VisitorPass
                    </h1>

                    {user && (
                        <>
                            <div className="vp-links">
                                <Link to="/dashboard"    className={`vp-link${isActive("/dashboard")    ? " vp-link-active" : ""}`}>Dashboard</Link>
                                <Link to="/visitors"     className={`vp-link${isActive("/visitors")     ? " vp-link-active" : ""}`}>Visitors</Link>
                                <Link to="/appointments" className={`vp-link${isActive("/appointments") ? " vp-link-active" : ""}`}>Appointments</Link>
                                <Link to="/check"        className={`vp-link${isActive("/check")        ? " vp-link-active" : ""}`}>Check In/Out</Link>
                            </div>

                            <button className="vp-logout" onClick={handleLogout}>
                                Logout
                            </button>
                        </>
                    )}
                </div>
            </nav>
        </>
    );
}

export default Navbar;