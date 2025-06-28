import "../styles/UserCard.css";
import { getAvatarUrl } from "../utils/avatarUtils.js";

interface UserCardProps {
  id: number;
  username: string;
  avatar_url: string;
  onClick?: () => void;
}

const UserCard = ({ id, username, avatar_url, onClick }: UserCardProps) => {
  return (
    <div className="user-card" onClick={onClick}>
      <img 
        src={getAvatarUrl(avatar_url)} 
        alt={`${username}的头像`} 
        className="user-avatar" 
      />
      <span className="user-name">{username}</span>
    </div>
  );
};

export default UserCard;