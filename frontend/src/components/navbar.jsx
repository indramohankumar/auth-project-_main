import { Link, useLocation, useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import "./navbar.css";

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
        <nav className="vp-nav relative">
            <div className="vp-nav-glass">
                <h1 className="vp-logo">
                    <span className="vp-logo-dot" />
                    VisitorPass
                </h1>

                {user && (
                    <>
                        <button 
                            className={`vp-hamburger ${isMobileMenuOpen ? 'open' : ''}`} 
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            aria-label="Toggle menu"
                        >
                            <div className="vp-hamburger-line" />
                            <div className="vp-hamburger-line" />
                            <div className="vp-hamburger-line" />
                        </button>

                        <div className="vp-desktop-menu">
                            <div className="vp-links">
                                <Link to="/dashboard"    className={`vp-link${isActive("/dashboard")    ? " vp-link-active" : ""}`}>Dashboard</Link>
                                {canAccess(["admin", "security", "employee"]) && (
                                    <Link to="/visitors" className={`vp-link${isActive("/visitors") ? " vp-link-active" : ""}`}>Visitors</Link>
                                )}
                                {canAccess(["admin", "employee"]) && (
                                    <Link to="/appointments" className={`vp-link${isActive("/appointments") ? " vp-link-active" : ""}`}>Appointments</Link>
                                )}
                                {canAccess(["admin"]) && (
                                    <Link to="/check" className={`vp-link${isActive("/check") ? " vp-link-active" : ""}`}>Check In/Out</Link>
                                )}
                                {canAccess(["admin"]) && (
                                    <Link to="/users" className={`vp-link${isActive("/users") ? " vp-link-active" : ""}`}>Users</Link>
                                )}
                            </div>

                            <span className="vp-link" title={role || "user"}>
                                {role ? role.charAt(0).toUpperCase() + role.slice(1) : "User"}
                            </span>

                            <button className="vp-logout" onClick={handleLogout}>
                                Logout
                            </button>
                        </div>
                        
                        <div className={`vp-mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
                            <div className="vp-mobile-role">
                                Logged in as {role ? role.charAt(0).toUpperCase() + role.slice(1) : "User"}
                            </div>
                            
                            <Link to="/dashboard" onClick={closeMenu} className={`vp-link${isActive("/dashboard") ? " vp-link-active" : ""}`}>Dashboard</Link>
                            {canAccess(["admin", "security", "employee"]) && (
                                <Link to="/visitors" onClick={closeMenu} className={`vp-link${isActive("/visitors") ? " vp-link-active" : ""}`}>Visitors</Link>
                            )}
                            {canAccess(["admin", "employee"]) && (
                                <Link to="/appointments" onClick={closeMenu} className={`vp-link${isActive("/appointments") ? " vp-link-active" : ""}`}>Appointments</Link>
                            )}
                            {canAccess(["admin"]) && (
                                <Link to="/check" onClick={closeMenu} className={`vp-link${isActive("/check") ? " vp-link-active" : ""}`}>Check In/Out</Link>
                            )}
                            {canAccess(["admin"]) && (
                                <Link to="/users" onClick={closeMenu} className={`vp-link${isActive("/users") ? " vp-link-active" : ""}`}>Users</Link>
                            )}
                            
                            <button className="vp-logout" onClick={handleLogout}>
                                Logout
                            </button>
                        </div>
                    </>
                )}
            </div>
        </nav>
    );
}

export default Navbar;