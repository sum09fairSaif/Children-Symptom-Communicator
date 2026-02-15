import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useEffect } from "react";
import "./Dashboard.css";

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Check if user needs to set up their name
  useEffect(() => {
    if (user && user.name) {
      // If name looks like an email or is very short, redirect to name setup
      const hasProperName =
        !user.name.includes("@") && user.name.split(" ").length >= 1 && user.name.length > 2;

      // Check if it's just the email prefix (common pattern)
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        // If name is just email prefix, redirect to name setup
        if (
          parsed.email &&
          (parsed.name === parsed.email.split("@")[0] || !hasProperName)
        ) {
          navigate("/name-setup", { replace: true });
        }
      }
    }
  }, [user, navigate]);

  // Extract first name from full name or email
  const getFirstName = () => {
    if (!user?.name) return "User";

    let name = user.name;

    // If name contains @, it's likely an email - extract username part
    if (name.includes("@")) {
      name = name.split("@")[0];
    } else {
      // Otherwise, get first word (first name)
      name = name.split(" ")[0];
    }

    // Capitalize first letter
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  };

  const firstName = getFirstName();

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <h2 className="sidebar-username">{firstName}</h2>
        </div>
        <nav className="sidebar-nav">
          <ul className="sidebar-menu">
            <li className="sidebar-item active">
              <Link to="/your-profile" className="sidebar-link">
                <span className="sidebar-icon">📊</span>
                Dashboard
              </Link>
            </li>
            <li className="sidebar-item">
              <Link to="/find-a-provider" className="sidebar-link">
                <span className="sidebar-icon">👨‍⚕️</span>
                Find a Doctor
              </Link>
            </li>
            <li className="sidebar-item">
              <Link to="/symptom-checker" className="sidebar-link">
                <span className="sidebar-icon">📝</span>
                Symptom Checker
              </Link>
            </li>
          </ul>

          <button onClick={logout} className="logout-button">
            <span className="logout-icon">🚪</span>
            Log Out
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="dashboard-content">
          {/* User Greeting */}
          <div className="user-greeting-section">
            <div className="user-avatar">
              <span className="avatar-icon">👤</span>
            </div>
            <div className="user-info">
              <h1 className="greeting-title">Hello, {firstName}!</h1>
              <p className="user-detail">
                {user?.age && `Age: ${user.age}`}
                {user?.age && user?.location && " • "}
                {user?.location && `Location: ${user.location}`}
              </p>
            </div>
          </div>

          {/* Dashboard Cards */}
          <div className="dashboard-grid">
            {/* Favorites Container */}
            <div className="dashboard-card favorites-card">
              <h2 className="card-title">Favorite Videos</h2>
              <div className="favorites-container">
                <p className="favorites-empty">
                  Your favorite videos will appear here. Save videos from our health library to quick access.
                </p>
                {/* Placeholder for future video thumbnails from Gemini API */}
                <div className="favorites-grid">
                  {/* This will be populated with favorited videos from Gemini API */}
                </div>
              </div>
            </div>

            {user?.hasCompletedOnboarding && (
              <div className="dashboard-card">
                <h2 className="card-title">Your Profile</h2>
                <div className="profile-details">
                  {user?.dueDate && (
                    <p className="profile-item">
                      <strong>Due Date:</strong> {new Date(user.dueDate).toLocaleDateString()}
                    </p>
                  )}
                  {user?.weeksPregnant !== undefined && (
                    <p className="profile-item">
                      <strong>Weeks Pregnant:</strong> {user.weeksPregnant}
                    </p>
                  )}
                  {user?.height && (
                    <p className="profile-item">
                      <strong>Height:</strong> {user.height}
                    </p>
                  )}
                  {user?.weight && (
                    <p className="profile-item">
                      <strong>Weight:</strong> {user.weight}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
