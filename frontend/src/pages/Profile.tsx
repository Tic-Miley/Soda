import { useState, useEffect, useRef } from "react";
import PageTitle from "../components/PageTitle.js";
import { useNavigate } from "react-router-dom";
import apiRequest from "../utils/apiRequest.js";
import "../styles/Form.css";

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

// Helper function to get full avatar URL
const getAvatarUrl = (avatarPath: string | null | undefined): string => {
  if (!avatarPath) return "/icons/avatar_origin.png";
  if (avatarPath.startsWith('http')) return avatarPath;
  if (avatarPath.startsWith('/static')) {
    return `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}${avatarPath}`;
  }
  return avatarPath;
};

const Profile = () => {
  const navigate = useNavigate();
  const { get, put } = apiRequest();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [userProfile, setUserProfile] = useState<UserProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [formData, setFormData] = useState<{
    bio: string;
    signature: string;
    habits: string;
    avatar_url?: string;
  }>({
    bio: "",
    signature: "",
    habits: ""
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  
  // Fetch user profile data on component mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      setIsLoading(true);
      try {
        const data = await get("user", "get_user_profile");
        setUserProfile(data);
        setFormData({
          bio: data.bio || "",
          signature: data.signature || "",
          habits: data.habits || ""
        });
      } catch (err: any) {
        setError(err.message || "获取用户资料失败");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  // Handle avatar click to trigger file input
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  // Handle avatar file change
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Check file type
      if (!file.type.match('image/png')) {
        setError("只支持PNG格式图片");
        return;
      }

      // Check file size (limit to 1MB)
      if (file.size > 1024 * 1024) {
        setError("图片大小不能超过1MB");
        return;
      }

      setAvatarFile(file);
      
      // Create preview URL for the image
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle logout
  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login-page");
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    try {
      let updatedProfile = { ...formData };
      
      // If avatar file is selected, upload it first
      if (avatarFile) {
        const formData = new FormData();
        formData.append('avatar', avatarFile);
        
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/user/upload_avatar`, {
          method: 'POST',
          headers: {
            'Authorization': `${localStorage.getItem('token')}`  // Remove "Bearer " prefix
          },
          body: formData
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || '上传头像失败');
        }
        
        const data = await response.json();
        updatedProfile = { ...updatedProfile, avatar_url: data.avatar_url };
      }
      
      // Update profile with the form data
      const response = await put("user", "update_profile", updatedProfile);
      setSuccessMessage(response.message || "个人资料更新成功");
      setUserProfile(response.profile);
      setAvatarPreview(null);
      setAvatarFile(null);
      
      setTimeout(() => setSuccessMessage(""), 3000); // Clear success message after 3 seconds
    } catch (err: any) {
      setError(err.message || "更新个人资料失败");
      setTimeout(() => setError(""), 3000); // Clear error after 3 seconds
    }
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="profile-page">
        <PageTitle 
          pageTitle="个人主页" 
          pageSubTitle="“星河里有着你的回忆”" 
        />
        <div className="loading">加载中...</div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <PageTitle
        pageTitle="个人主页"
        pageSubTitle={userProfile?.signature || ""}
      />

      <div className="profile-container">
        <div className="profile-header">
          <div className="profile-avatar-container" onClick={handleAvatarClick}>
            <img 
              src={avatarPreview || getAvatarUrl(userProfile?.avatar_url)} 
              alt="头像" 
              className="profile-avatar" 
            />
            <div className="avatar-overlay">
              <span>更换头像</span>
            </div>
            <input 
              type="file" 
              ref={fileInputRef}
              accept="image/png"
              onChange={handleAvatarChange}
              style={{ display: 'none' }}
            />
          </div>
          <div className="profile-info">
            <h2>{userProfile?.username}</h2>
            <p className="profile-email">{userProfile?.email}</p>
            <p className="profile-join-date">
              注册时间: {userProfile?.created_at ? new Date(userProfile.created_at).toLocaleDateString() : "未知"}
            </p>
          </div>
        </div>

        <form className="form" onSubmit={handleSubmit}>
          <div className="input-container">
            <label className="label">个性签名</label>
            <input
              type="text"
              name="signature"
              value={formData.signature}
              onChange={handleInputChange}
              placeholder="你喜欢的一句话"
              className="input"
              maxLength={100}
            />
          </div>

          <div className="input-container">
            <label className="label">自我介绍</label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              placeholder="介绍一下自己..."
              className="textarea"
              rows={4}
            />
          </div>

          <div className="input-container">
            <label className="label">个人习惯</label>
            <textarea
              name="habits"
              value={formData.habits}
              onChange={handleInputChange}
              placeholder="你的习惯和喜好，例如：晨型人，喜欢安静的地方..."
              className="textarea"
              rows={4}
            />
          </div>

          {successMessage && <div className="success-message">{successMessage}</div>}
          {error && <div className="apply-error">{error}</div>}

          <div className="profile-actions">
            <button type="submit" className="button" style={{ marginRight: "20px" }}>保存个人资料</button>
            <button type="button" className="button logout-button" onClick={logout}>退出登录</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;