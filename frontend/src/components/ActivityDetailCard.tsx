import { useState, useEffect, useCallback } from "react";
import apiRequest from "../utils/apiRequest.js";
import UserCard from "./UserCard.js";
import UserProfileCard from "./UserProfileCard.js";
import "../styles/ActivityDetailCard.css";
import { getAvatarUrl } from "../utils/avatarUtils.js";

interface ActivityDetailProps {
  activityId: number;
  onClose: () => void;
}

interface ActivityDetailData {
  id: number;
  title: string;
  time: string;
  location: string;
  tags: string[];
  description: string;
  creator_id: number;
  creator_name: string;
  created_at?: string;
  creator_avatar_url?: string;  // Added this field in case the API returns it
}

interface SimpleUserInfo {
  id: number;
  username: string;
  avatar_url: string;
}

const ActivityDetailCard = ({ activityId, onClose }: ActivityDetailProps) => {
  const { get, post } = apiRequest();
  const [activityDetail, setActivityDetail] = useState<ActivityDetailData | null>(null);
  const [participants, setParticipants] = useState<SimpleUserInfo[]>([]);
  const [creatorInfo, setCreatorInfo] = useState<SimpleUserInfo | null>(null); // 新增创建者详细信息状态
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [applyMessage, setApplyMessage] = useState("");
  const [applyError, setApplyError] = useState("");

  // 获取创建者详细信息的函数
  const fetchCreatorInfo = useCallback(async (creatorId: number) => {
    try {
      const userData = await get("user", `get_user_by_id/${creatorId}`);
      setCreatorInfo({
        id: userData.id,
        username: userData.username,
        avatar_url: userData.avatar_url || ""
      });
    } catch (err: any) {
      console.error("获取创建者信息失败:", err.message);
      // 获取创建者信息失败不影响整体展示，只记录错误
    }
  }, []);

  // Use useCallback to memoize the fetch function
  const fetchActivityData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Get activity details
      const activityData = await get("activity", `get_activity_by_id/${activityId}`);
      setActivityDetail(activityData);
      
      // 获取创建者详细信息，包括头像
      if (activityData && activityData.creator_id) {
        fetchCreatorInfo(activityData.creator_id);
      }
      
      // Get participants
      const participantsData = await get("user", `get_activity_participants/${activityId}`);
      setParticipants(participantsData);
    } catch (err: any) {
      setError(err.message || "获取活动详情失败");
    } finally {
      setIsLoading(false);
    }
  }, [activityId, fetchCreatorInfo]); // 添加fetchCreatorInfo作为依赖项

  useEffect(() => {
    fetchActivityData();
  }, [fetchActivityData]); // Only depend on the memoized function

  const handleApply = async () => {
    if (!activityId) {
      setApplyError("活动ID不存在");
      return;
    }

    setIsApplying(true);
    setApplyMessage("");
    setApplyError("");

    try {
      const response = await post("application", "apply_activity", {
        activity_id: activityId
      });

      setApplyMessage(response.message || "申请成功，等待审核");
      setTimeout(() => setApplyMessage(""), 3000);
    } catch (error: any) {
      setApplyError(error.message || "申请失败，请稍后重试");
      setTimeout(() => setApplyError(""), 3000);
    } finally {
      setIsApplying(false);
    }
  };

  const handleUserCardClick = (userId: number) => {
    setSelectedUserId(userId);
  };

  const handleCloseUserProfile = () => {
    setSelectedUserId(null);
  };

  // Prevent event bubbling on card click
  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  if (isLoading) {
    return (
      <div className="activity-detail-overlay">
        <div className="activity-detail-card" onClick={handleCardClick}>
          <div className="activity-detail-loading">加载中...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="activity-detail-overlay">
        <div className="activity-detail-card" onClick={handleCardClick}>
          <div className="activity-detail-error">{error}</div>
          <button className="button" onClick={onClose}>关闭</button>
        </div>
      </div>
    );
  }

  if (!activityDetail) {
    return (
      <div className="activity-detail-overlay">
        <div className="activity-detail-card" onClick={handleCardClick}>
          <div className="activity-detail-error">未找到活动详情</div>
          <button className="button" onClick={onClose}>关闭</button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="activity-detail-overlay" onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}>
        <div className="activity-detail-card" onClick={handleCardClick}>
          <div className="activity-detail-header">
            <h2>{activityDetail.title}</h2>
            <div className="activity-detail-tags">
              {activityDetail.tags && activityDetail.tags.map((tag, index) => (
                <span key={index} className="card-tag">{tag}</span>
              ))}
            </div>
          </div>

          <div className="activity-detail-content">
            <div className="activity-detail-section">
              <h3>活动时间</h3>
              <p>{new Date(activityDetail.time).toLocaleString()}</p>
            </div>

            <div className="activity-detail-section">
              <h3>活动地点</h3>
              <p>{activityDetail.location}</p>
            </div>

            <div className="activity-detail-section">
              <h3>活动描述</h3>
              <p className="activity-detail-description">{activityDetail.description}</p>
            </div>

            <div className="activity-detail-section">
              <h3>创建者</h3>
              <div className="activity-detail-creator">
                <UserCard 
                  id={activityDetail.creator_id}
                  username={activityDetail.creator_name}
                  avatar_url={creatorInfo ? creatorInfo.avatar_url : getAvatarUrl(activityDetail.creator_avatar_url)}
                  onClick={() => handleUserCardClick(activityDetail.creator_id)}
                />
              </div>
            </div>

            <div className="activity-detail-section">
              <h3>参与者 ({participants.length})</h3>
              {participants.length > 0 ? (
                <div className="activity-detail-participants">
                  {participants.map((participant) => (
                    <UserCard
                      key={participant.id}
                      id={participant.id}
                      username={participant.username}
                      avatar_url={participant.avatar_url}
                      onClick={() => handleUserCardClick(participant.id)}
                    />
                  ))}
                </div>
              ) : (
                <p>暂无参与者</p>
              )}
            </div>

            {activityDetail.created_at && (
              <div className="activity-detail-footer">
                <p>创建于: {new Date(activityDetail.created_at).toLocaleString()}</p>
              </div>
            )}
          </div>

          <div className="activity-detail-actions">
            <button 
              className="button apply-button" 
              onClick={handleApply}
              disabled={isApplying}
            >
              {isApplying ? '申请中...' : '申请加入'}
            </button>
            <button className="button" onClick={onClose}>关闭</button>
          </div>

          {applyMessage && <div className="apply-success">{applyMessage}</div>}
          {applyError && <div className="apply-error">{applyError}</div>}
        </div>
      </div>

      {selectedUserId && (
        <UserProfileCard 
          userId={selectedUserId} 
          onClose={handleCloseUserProfile} 
        />
      )}
    </>
  );
};

export default ActivityDetailCard;