import { Link } from 'react-router-dom';
import { useEffect, useState, useRef } from "react";
import apiRequest from "../utils/apiRequest.js";
import MatchCard from "../components/MatchCard.js";
import PageTitle from "../components/PageTitle.js";
import UserCard from "../components/UserCard.js";
import UserProfileCard from "../components/UserProfileCard.js";
import ActivityInfo from "../interface/ActivityInfo.js";
import "../styles/Functions.css";

// Define interfaces for our different data structures
interface ApplicationInfo {
  application_id: string;
  activity_id: number;
  title: string;
  time: string;
  location: string;
  tags: string[];
  creator_name: string;
  status: string;
  created_at: string;
}

interface ReceivedApplicationInfo {
  application_id: string;
  activity_id: number;
  activity_title: string;
  user_id: number;
  username: string;
  status: string;
  created_at: string;
}

interface ParticipantInfo {
  user_id: number;
  username: string;
}

interface ParticipationInfo {
  activity_id: number;
  title: string;
  time: string;
  location: string;
  tags: string[];
  creator_name: string;
}

const MyActivities = () => {
  const { get, put } = apiRequest();
  const [createdActivities, setCreatedActivities] = useState<ActivityInfo[]>([]);
  const [myApplications, setMyApplications] = useState<ApplicationInfo[]>([]);
  const [receivedApplications, setReceivedApplications] = useState<ReceivedApplicationInfo[]>([]);
  const [participations, setParticipations] = useState<ParticipationInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [activeTab, setActiveTab] = useState("created");
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  
  // Refs for scrolling to sections
  const createdRef = useRef<HTMLDivElement>(null);
  const participationsRef = useRef<HTMLDivElement>(null);
  const applicationsRef = useRef<HTMLDivElement>(null);
  const receivedApplicationsRef = useRef<HTMLDivElement>(null);

  // Function to scroll to section
  const scrollToSection = (section: string) => {
    setActiveTab(section);
    switch (section) {
      case "created":
        createdRef.current?.scrollIntoView({ behavior: 'smooth' });
        break;
      case "participations":
        participationsRef.current?.scrollIntoView({ behavior: 'smooth' });
        break;
      case "applications":
        applicationsRef.current?.scrollIntoView({ behavior: 'smooth' });
        break;
      case "received":
        receivedApplicationsRef.current?.scrollIntoView({ behavior: 'smooth' });
        break;
    }
  };

  // Fetch activities created by the user
  const getCreatedActivities = async () => {
    setIsLoading(true);
    try {
      const data: ActivityInfo[] = await get("activity", "get_creator_activities");
      setCreatedActivities(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch applications made by the user
  const getMyApplications = async () => {
    try {
      const data: ApplicationInfo[] = await get("application", "get_my_applications");
      setMyApplications(data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Fetch applications received for user's activities
  const getReceivedApplications = async () => {
    try {
      const data: ReceivedApplicationInfo[] = await get("application", "get_activity_applications");
      setReceivedApplications(data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Fetch activities the user is participating in
  const getParticipations = async () => {
    try {
      const data: ParticipationInfo[] = await get("application", "get_my_participations");
      setParticipations(data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Handle accepting or rejecting an application
  const handleApplicationDecision = async (applicationId: string, status: 'accepted' | 'rejected') => {
    try {
      await put("application", "update_application_status", {
        application_id: applicationId,
        status
      });

      // Update the UI
      setReceivedApplications(prevApplications => 
        prevApplications.map(app => 
          app.application_id === applicationId 
            ? { ...app, status } 
            : app
        )
      );

      setActionMessage(`申请已${status === 'accepted' ? '接受' : '拒绝'}`);
      setTimeout(() => setActionMessage(""), 3000); // Clear message after 3 seconds
      
      // Refresh the data
      getReceivedApplications();
      
      // If accepted, also refresh participations
      if (status === 'accepted') {
        getParticipations();
      }
    } catch (err: any) {
      setError(err.message);
      setTimeout(() => setError(""), 3000); // Clear error after 3 seconds
    }
  };

  // Load all data when component mounts
  useEffect(() => {
    getCreatedActivities();
    getMyApplications();
    getReceivedApplications();
    getParticipations();
  }, []);

  // Helper function to get status text and class
  const getStatusDisplay = (status: string) => {
    switch(status) {
      case 'pending':
        return { text: '等待结果', className: 'status-pending' };
      case 'accepted':
        return { text: '已接受', className: 'status-accepted' };
      case 'rejected':
        return { text: '已拒绝', className: 'status-rejected' };
      default:
        return { text: status, className: '' };
    }
  };
  
  // 处理用户卡片点击
  const handleUserCardClick = (userId: number) => {
    setSelectedUserId(userId);
  };

  // 关闭用户资料卡片
  const handleCloseUserProfile = () => {
    setSelectedUserId(null);
  };

  return (
    <div className="my-activities-page">
      <PageTitle
          pageTitle="我的活动"
          pageSubTitle= "“最远处里，有最近的人”"
      />
      
      {/* Navigation Tabs */}
      <div className="tabs">
        <button className={`tab ${activeTab === "created" ? "active" : ""}`} onClick={() => scrollToSection("created")}>我创建的活动</button>
        <button className={`tab ${activeTab === "participations" ? "active" : ""}`} onClick={() => scrollToSection("participations")}>我参与的活动</button>
        <button className={`tab ${activeTab === "applications" ? "active" : ""}`} onClick={() => scrollToSection("applications")}>我申请的活动</button>
        <button className={`tab ${activeTab === "received" ? "active" : ""}`} onClick={() => scrollToSection("received")}>申请信息</button>
      </div>

      {/* 我创建的活动 */}
      <div className='list-container' ref={createdRef}>
        <h1>我创建的活动</h1>
        <div className='list'>
          {error && <p style={{ color: "red" }}>{error}</p>}
          {isLoading ? (
            <p className="loading">玩命加载中...</p>
          ) : createdActivities.length > 0 ? (
            createdActivities.slice().reverse().map((activity) => (
              <MatchCard
                key={activity.id}
                id={activity.id}
                title={activity.title}
                time={activity.time}
                location={activity.location}
                tags={activity.tags}
                creator_name={activity.creator_name}
                showApplyButton={false}
              />
            ))
          ) : (
            <p>暂无活动，快去创建吧！</p>
          )}
        </div>
      </div>

      {/* 我参与的活动 */}
      <div className='list-container' ref={participationsRef}>
        <h1>我参与的活动</h1>
        <div className='list'>
          {participations.length > 0 ? (
            participations.map((participation) => (
              <MatchCard
                key={participation.activity_id}
                id={participation.activity_id}
                title={participation.title}
                time={participation.time}
                location={participation.location}
                tags={participation.tags}
                creator_name={participation.creator_name}
                showApplyButton={false}
              />
            ))
          ) : (
            <p>暂无参与的活动</p>
          )}
        </div>
      </div>
      
      {/* 我申请的活动 */}
      <div className='list-container' ref={applicationsRef}>
        <h1>我申请的活动</h1>
        <div className='list'>
          {myApplications.length > 0 ? (
            myApplications.map((app) => (
              <div key={app.application_id} className="application-card">
                <div className="application-header">
                  <h3>{app.title}</h3>
                  <span className={`application-status ${getStatusDisplay(app.status).className}`}>
                    {getStatusDisplay(app.status).text}
                  </span>
                </div>
                <div className="application-details">
                  <p>地点: {app.location}</p>
                  <p>时间: {new Date(app.time).toLocaleString()}</p>
                  <p>创建者: {app.creator_name}</p>
                  <p>申请时间: {new Date(app.created_at).toLocaleString()}</p>
                </div>
                <div className="application-tags">
                  {app.tags.map((tag, index) => (
                    <span key={index} className="card-tag">{tag}</span>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <p>暂无申请的活动</p>
          )}
        </div>
      </div>

      {/* 申请信息 */}
      <div className='list-container' ref={receivedApplicationsRef}>
        <h1>申请信息</h1>
        {actionMessage && <div className="action-message success-message">{actionMessage}</div>}
        <div className='list'>
          {receivedApplications.length > 0 ? (
            receivedApplications.map((app) => (
              <div key={app.application_id} className="application-card">
                <div className="application-header">
                  <h3>{app.activity_title}</h3>
                  <span className={`application-status ${getStatusDisplay(app.status).className}`}>
                    {getStatusDisplay(app.status).text}
                  </span>
                </div>
                <div className="application-details">
                  <div className="application-user">
                    <p>申请者: <span className="applicant-username" onClick={() => handleUserCardClick(app.user_id)}>{app.username}</span></p>
                  </div>
                  <p>申请时间: {new Date(app.created_at).toLocaleString()}</p>
                </div>
                {app.status === 'pending' && (
                  <div className="application-actions">
                    <button 
                      className="button accept-button"
                      onClick={() => handleApplicationDecision(app.application_id, 'accepted')}
                    >
                      接受
                    </button>
                    <button 
                      className="button reject-button"
                      onClick={() => handleApplicationDecision(app.application_id, 'rejected')}
                    >
                      拒绝
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p>暂无申请</p>
          )}
        </div>
      </div>
      {selectedUserId && (
        <UserProfileCard
          userId={selectedUserId}
          onClose={handleCloseUserProfile}
        />
      )}
    </div>
  );
};

export default MyActivities;