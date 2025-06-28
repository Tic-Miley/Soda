import { useState, useEffect, act } from "react";
import { useNavigate }  from "react-router-dom";
import apiRequest from "../utils/apiRequest.js";
import Select from 'react-select';
import TAG_OPTIONS from "../utils/TAG_OPTIONS.js";
import PageTitle from "../components/PageTitle.js";
import ActivityInfo from "../interface/ActivityInfo.js";

const STORAGE_KEY = "post_activity_draft"; // 本地存储草稿键名

const PostActivity = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false); // 控制加载信息的显示
  const [isSaveDraft, setIsSaveDraft] = useState(false); // 控制是否保存草稿
  const [error, setError] = useState("");
  const { post } = apiRequest();
  const [activityInfo, setActivityInfo] = useState<ActivityInfo>({
      title: "",
      time: "",
      location: "",
      tags: [""],
      description: "",
    }
  );

  const submitActivity = async (e: React.FormEvent) => {
    setIsLoading(true)
    e.preventDefault(); 
    const token = localStorage.getItem("token");
    const headers: Record<string, string> = {
      "Content-Type": "application/json"
    };
    if (token) {
      headers["Authorization"] = `${token}`;
    }
    try {
      await post("activity", "add_activity",activityInfo,e)
      localStorage.removeItem(STORAGE_KEY);
      navigate("/my-activities-page");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 动态调整文本框高度
  const adjustTextareaHeight = (e:any) => {
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  // 进入页面时加载草稿
  useEffect(() => {
    const savedDraft = localStorage.getItem(STORAGE_KEY);
    if (savedDraft) {
      setActivityInfo(JSON.parse(savedDraft));
    }
  }, []);

  // 输入时保存
  useEffect(() => {
    if (isSaveDraft) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(activityInfo));
    }
  }, [activityInfo]);
  
  return (
    <div className="post-activity-page">
      <PageTitle
        pageTitle="创建你的活动"
        pageSubTitle= "“空谷传声，自有回音”"
      />

      <form className="form" onSubmit={submitActivity}>
        <div className="input-container">
          <label className="label">活动标题</label>
          <br></br>
          <input 
            className="input"
            type="text"
            placeholder="例如：周五晚羽毛球局"
            value={activityInfo.title}
            required // HTML5原生必填验证
            onChange={(e) => {
              setActivityInfo({ ...activityInfo, title: e.target.value });
              setIsSaveDraft(true);
              }
            } 
          />
        </div>

        <div className="input-container">
          <label className="label">活动时间</label>
          <br></br>
          <input 
            className="time-select"
            type="datetime-local"
            value={activityInfo.time}
            required
            onChange={(e) => {
              setActivityInfo({ ...activityInfo, time: e.target.value });
              setIsSaveDraft(true);
            }
          }
          />
        </div>
        
        <div className="input-container">
          <label className="label">活动地点</label>
          <br></br>
          <input 
            className="input"
            type="text"
            placeholder="地点"
            value={activityInfo.location}
            required
            onChange={(e) => {
              setActivityInfo({ ...activityInfo, location: e.target.value });
              setIsSaveDraft(true);
            }
          }
          />
        </div>

        <div className="input-container">
          <label className="label">活动标签</label>
          <br></br>
          <Select 
            isMulti={true}
            classNamePrefix="react-select"
            placeholder="选择标签..."
            value={TAG_OPTIONS.filter((tag) => activityInfo.tags.includes(tag.value))}
            required
            options={TAG_OPTIONS}
            onChange={(selected) => {
              setActivityInfo({ ...activityInfo, tags: selected.map(tag => tag.value)});
              setIsSaveDraft(true);
            }
          }
          />
        </div>
        
        <div className="input-container">
          <label className="label">详细描述</label>
          <br></br>
          <textarea
            className="textarea"
            placeholder="请描述活动详情、要求等信息..."
            value={activityInfo.description}
            onChange={(e) => {
              setActivityInfo({ ...activityInfo, description: e.target.value });
              setIsSaveDraft(true);
              adjustTextareaHeight(e);
            }}
            rows={3} // 初始行数
          />
        </div>

        <button type="submit" className="button">发布活动</button>
        {isLoading && <span>发布中，请稍后</span>}
        {error && <p style={{ color: 'red' }} className="error">{error}</p>}
      </form>

    </div>
  );
};

export default PostActivity;
