import { useState } from "react";
import ActivityInfo from "../interface/ActivityInfo.js";
import apiRequest from "../utils/apiRequest.js";
import ActivityDetailCard from "./ActivityDetailCard.js";

const MatchCard = ({id, title, time, location, tags, creator_name, showApplyButton = true}: ActivityInfo & {showApplyButton?: boolean}) => {
  const { post } = apiRequest();
  const [isApplying, setIsApplying] = useState(false);
  const [applyMessage, setApplyMessage] = useState("");
  const [applyError, setApplyError] = useState("");
  const [showDetailCard, setShowDetailCard] = useState(false);

  // Helper function to format date
  const formatDateTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr; // Return original if invalid date
      
      // Get weekday in Chinese
      const weekdays = ["日", "一", "二", "三", "四", "五", "六"];
      const weekday = weekdays[date.getDay()];
      
      // Format: YYYY/MM/DD 星期X HH:MM
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      
      return `${year}/${month}/${day} 星期${weekday} ${hours}:${minutes}`;
    } catch (error) {
      return dateStr; // Return original if any error occurs
    }
  };

  const handleApply = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click event
    
    if (!id) {
      setApplyError("活动ID不存在");
      return;
    }

    setIsApplying(true);
    setApplyMessage("");
    setApplyError("");

    try {
      const response = await post("application", "apply_activity", {
        activity_id: id
      });

      setApplyMessage(response.message || "申请成功，等待审核");
      setTimeout(() => setApplyMessage(""), 3000); // Clear message after 3 seconds
    } catch (error: any) {
      setApplyError(error.message || "申请失败，请稍后重试");
      setTimeout(() => setApplyError(""), 3000); // Clear error after 3 seconds
    } finally {
      setIsApplying(false);
    }
  };

  const handleCardClick = () => {
    if (id) {
      setShowDetailCard(true);
    }
  };

  const closeDetailCard = () => {
    setShowDetailCard(false);
  };

  return (
    <>
      <div className="card" onClick={handleCardClick}>
        {/* 卡片头部 - 包含标题和标签 */}
        <div className="card-header">
          <h3 className="card-title">{title}</h3>
          <div className="card-tags">
            {tags && tags.length > 1 ? (
              tags.slice().map((tag, index) => (<span key={index} className="card-tag">{tag}</span>))
              ):(
                tags && <span className="card-tag">{tags}</span>
            )}
          </div>
        </div>
        
        {/* 活动详情 - 地点和时间 */}
        <div className="card-details">
            <div className="card-location">地点: {location}</div>
            <div className="card-time">时间: {formatDateTime(time)}</div>
        </div>

        {/* 申请结果提示 */}
        {applyMessage && <div className="apply-success">{applyMessage}</div>}
        {applyError && <div className="apply-error">{applyError}</div>}
        
        {/* 卡片底部 - 创建者信息和申请按钮 */}
        <div className="card-footer">
          <span className="card-creator">
            By: {creator_name}
          </span>
          {showApplyButton && (
            <button 
              className="button" 
              onClick={handleApply}
              disabled={isApplying}
            >
              {isApplying ? '申请中...' : '申请加入'}
            </button>
          )}
        </div>
      </div>

      {showDetailCard && id && (
        <ActivityDetailCard 
          activityId={id} 
          onClose={closeDetailCard} 
        />
      )}
    </>
  );
};

export default MatchCard;