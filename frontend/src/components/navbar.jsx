import { Link, useLocation, useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";

function Navbar() {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const role = user?.role;

    const canAccess = (allowedRoles) => {
        if (!role) return false;
        if (!Array.isArray(allowedRoles) || allowedRoles.length === 0) return true;
        return allowedRoles.includes(role);
    };

    const handleLogout = () => {
        logout();
        setIsMobileMenuOpen(false);
        navigate("/");
    };

    const isActive = (path) => location.pathname === path;
    const closeMenu = () => setIsMobileMenuOpen(false);

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

                .vp-desktop-menu {
                    display: flex;
                    align-items: center;
                    gap: 12px;
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

                /* Mobile Menu Toggle Button */
                .vp-hamburger {
                    display: none;
                    flex-direction: column;
                    justify-content: space-around;
                    width: 24px;
                    height: 20px;
                    background: transparent;
                    border: none;
                    cursor: pointer;
                    padding: 0;
                    z-index: 1001;
                }

                .vp-hamburger-line {
                    width: 24px;
                    height: 2px;
                    background: #ffffff;
                    border-radius: 2px;
                    transition: all 0.3s linear;
                    transform-origin: 1px;
                }

                .vp-hamburger.open .vp-hamburger-line:first-child { transform: rotate(45deg); }
                .vp-hamburger.open .vp-hamburger-line:nth-child(2) { opacity: 0; }
                .vp-hamburger.open .vp-hamburger-line:nth-child(3) { transform: rotate(-45deg); }

                /* Mobile Menu Styles */
                .vp-mobile-menu {
                    display: none;
                    flex-direction: column;
                    gap: 8px;
                    position: absolute;
                    top: 100%;
                    left: 20px;
                    right: 20px;
                    margin-top: 8px;
                    padding: 16px;
                    background: rgba(6, 10, 22, 0.95);
                    backdrop-filter: blur(25px) saturate(200%);
                    -webkit-backdrop-filter: blur(25px) saturate(200%);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 16px;
                    box-shadow: 0 20px 40px rgba(0,0,0,0.5);
                    animation: vp-slideDown 0.3s ease forwards;
                    z-index: 999;
                }

                @keyframes vp-slideDown {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                /* Responsive Logic */
                @media (max-width: 900px) {
                    .vp-desktop-menu { display: none; }
                    .vp-hamburger { display: flex; }
                    .vp-mobile-menu.open { display: flex; }
                    .vp-nav { padding: 12px 16px; }
                    .vp-mobile-menu .vp-link { 
                        font-size: 16px; 
                        padding: 12px; 
                        text-align: center;
                        background: rgba(255, 255, 255, 0.03);
                    }
                    .vp-mobile-menu .vp-link-active {
                        background: rgba(99, 102, 241, 0.2) !important;
                    }
                    .vp-mobile-menu .vp-link-active::after { display: none; }
                    .vp-mobile-menu .vp-logout {
                        width: 100%;
                        padding: 12px;
                        font-size: 16px;
                        margin-top: 8px;
                    }
                    .vp-mobile-role {
                        text-align: center;
                        font-size: 12px;
                        color: rgba(255, 255, 255, 0.4);
                        padding: 8px 0;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                        margin-bottom: 8px;
                    }
                }
            `}</style>

            <nav className="vp-nav relative">
                <div className="vp-nav-glass">
                    <h1 className="vp-logo">
                        <span className="vp-logo-dot" />
                        VisitorPass
                    </h1>

                    {user && (
                        <>
                            {/* Hamburger Menu Toggle (Mobile Only) */}
                            <button 
                                className={\`vp-hamburger \${isMobileMenuOpen ? 'open' : ''}\`} 
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                aria-label="Toggle menu"
                            >
                                <div className="vp-hamburger-line" />
                                <div className="vp-hamburger-line" />
                                <div className="vp-hamburger-line" />
                            </button>

                            {/* Desktop Menu */}
                            <div className="vp-desktop-menu">
                                <div className="vp-links">
                                    <Link to="/dashboard"    className={\`vp-link\${isActive("/dashboard")    ? " vp-link-active" : ""}\`}>Dashboard</Link>
                                    {canAccess(["admin", "security"]) && (
                                        <Link to="/visitors" className={\`vp-link\${isActive("/visitors") ? " vp-link-active" : ""}\`}>Visitors</Link>
                                    )}
                                    {canAccess(["admin", "employee"]) && (
                                        <Link to="/appointments" className={\`vp-link\${isActive("/appointments") ? " vp-link-active" : ""}\`}>Appointments</Link>
                                    )}
                                    {canAccess(["admin", "security"]) && (
                                        <Link to="/check" className={\`vp-link\${isActive("/check") ? " vp-link-active" : ""}\`}>Check In/Out</Link>
                                    )}
                                    {canAccess(["admin"]) && (
                                        <Link to="/users" className={\`vp-link\${isActive("/users") ? " vp-link-active" : ""}\`}>Users</Link>
                                    )}
                                </div>

                                <span className="vp-link" title={role || "user"}>
                                    {role ? role.charAt(0).toUpperCase() + role.slice(1) : "User"}
                                </span>

                                <button className="vp-logout" onClick={handleLogout}>
                                    Logout
                                </button>
                            </div>
                            
                            {/* Mobile Menu Dropdown */}
                            <div className={\`vp-mobile-menu \${isMobileMenuOpen ? 'open' : ''}\`}>
                                <div className="vp-mobile-role">
                                    Logged in as {role ? role.charAt(0).toUpperCase() + role.slice(1) : "User"}
                                </div>
                                
                                <Link to="/dashboard" onClick={closeMenu} className={\`vp-link\${isActive("/dashboard") ? " vp-link-active" : ""}\`}>Dashboard</Link>
                                {canAccess(["admin", "security"]) && (
                                    <Link to="/visitors" onClick={closeMenu} className={\`vp-link\${isActive("/visitors") ? " vp-link-active" : ""}\`}>Visitors</Link>
                                )}
                                {canAccess(["admin", "employee"]) && (
                                    <Link to="/appointments" onClick={closeMenu} className={\`vp-link\${isActive("/appointments") ? " vp-link-active" : ""}\`}>Appointments</Link>
                                )}
                                {canAccess(["admin", "security"]) && (
                                    <Link to="/check" onClick={closeMenu} className={\`vp-link\${isActive("/check") ? " vp-link-active" : ""}\`}>Check In/Out</Link>
                                )}
                                {canAccess(["admin"]) && (
                                    <Link to="/users" onClick={closeMenu} className={\`vp-link\${isActive("/users") ? " vp-link-active" : ""}\`}>Users</Link>
                                )}
                                
                                <button className="vp-logout" onClick={handleLogout}>
                                    Logout
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </nav>
        </>
    );
}

export default Navbar;