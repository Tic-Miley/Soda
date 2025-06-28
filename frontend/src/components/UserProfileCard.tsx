import { useState, useEffect, useCallback } from "react";
import apiRequest from "../utils/apiRequest.js";
import "../styles/UserCard.css";
import { getAvatarUrl } from "../utils/avatarUtils.js";

interface UserProfileProps {
  userId: number;
  onClose: () => void;
}

interface UserProfileData {
  id: number;
  username: string;
  email: string;
  avatar_url: string;
  bio: string | null;
  signature: string | null;
  habits: string | null;
  created_at: string;
}

const UserProfileCard = ({ userId, onClose }: UserProfileProps) => {
  const { get } = apiRequest();
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Use useCallback to memoize the fetch function
  const fetchUserProfile = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await get("user", `get_user_by_id/${userId}`);
      setUserProfile(data);
    } catch (err: any) {
      setError(err.message || "获取用户资料失败");
    } finally {
      setIsLoading(false);
    }
  }, [userId]); // Remove 'get' from dependencies, include only userId

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]); // Only depend on the memoized function

  // Prevent event bubbling on card click
  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  if (isLoading) {
    return (
      <div className="user-profile-overlay">
        <div className="user-profile-card" onClick={handleCardClick}>
          <div className="user-profile-loading">加载中...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="user-profile-overlay">
        <div className="user-profile-card" onClick={handleCardClick}>
          <div className="user-profile-error">{error}</div>
          <button className="button" onClick={onClose}>关闭</button>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="user-profile-overlay">
        <div className="user-profile-card" onClick={handleCardClick}>
          <div className="user-profile-error">未找到用户资料</div>
          <button className="button" onClick={onClose}>关闭</button>
        </div>
      </div>
    );
  }

  return (
    <div className="user-profile-overlay" onClick={(e) => {
      if (e.target === e.currentTarget) onClose();
    }}>
      <div className="user-profile-card" onClick={handleCardClick}>
        <div className="user-profile-header">
          <img 
            src={getAvatarUrl(userProfile.avatar_url)} 
            alt={`${userProfile.username}的头像`} 
            className="user-profile-avatar" 
          />
          <div className="user-profile-name">{userProfile.username}</div>
          {userProfile.signature && (
            <div className="user-profile-signature">"{userProfile.signature}"</div>
          )}
          <div className="user-profile-joined">
            加入时间: {new Date(userProfile.created_at).toLocaleDateString()}
          </div>
        </div>

        <div className="user-profile-content">
          {userProfile.bio && (
            <div className="user-profile-section">
              <h3>自我介绍</h3>
              <p>{userProfile.bio}</p>
            </div>
          )}

          {userProfile.habits && (
            <div className="user-profile-section">
              <h3>个人习惯</h3>
              <p>{userProfile.habits}</p>
            </div>
          )}

          <div className="user-profile-section">
            <h3>联系方式</h3>
            <p>邮箱: {userProfile.email}</p>
          </div>
        </div>

        <div className="user-profile-actions">
          <button className="button" onClick={onClose}>关闭</button>
        </div>
      </div>
    </div>
  );
};

export default UserProfileCard;