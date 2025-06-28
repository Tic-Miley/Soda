import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import apiRequest from "../utils/apiRequest.js";
import { getAvatarUrl } from "../utils/avatarUtils.js";
import "../styles/TopBar.css";

interface UserData {
  avatar_url: string;
}

const TopBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { get } = apiRequest();
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // Check if current page is login or register
  const isAuthPage = location.pathname === "/login-page" || location.pathname === "/register-page";
  
  // Use this effect to check login status and fetch profile on mount and when location changes
  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
    
    if (token) {
      fetchUserProfile();
    }
  }, [location.pathname]);
  
  // Separate function to fetch user profile
  const fetchUserProfile = async () => {
    try {
      const data = await get("user", "get_user_profile");
      if (data && data.avatar_url) {
        setUserAvatar(data.avatar_url);
      }
    } catch (err) {
      console.error("Failed to fetch user avatar:", err);
      // Keep using default avatar on error
    }
  };
  
  const goTo = (e: React.FormEvent, page: string) => {
    e.preventDefault();
    navigate(page);
  };
  
  return (
    <div className="top-bar">
      <div className="top-bar-content">
        <div className="logo-container">
            <img src="/images/SodaLogo.png" className="logo" />
            <span className="top-bar-title">速搭</span>
        </div>

        <div className="search-container">
            <img src="/icons/search.png" className="search-icon" />
            <input 
                type="text" 
                className="search-bar"
                placeholder="搜索..."
            />
        </div>

        {/* Only show avatar and profile link if logged in and not on auth pages */}
        {isLoggedIn && !isAuthPage && (
          <>
            <img
              src={getAvatarUrl(userAvatar)}
              className="avatar"
              onClick={(e) => goTo(e, "/profile-page")}
            /> 
            <button 
              type="button" 
              onClick={(e) => goTo(e, "/profile-page")} 
              className="profile-link"
            > 
              个人主页
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default TopBar;