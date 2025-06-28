import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsFinished(true);
    }, 3000);
    
    return () => clearTimeout(timer); // 组件卸载时清除定时器
  }, [navigate]);

  useEffect(() => {
    if (isFinished) {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate("/login-page"); // 若未登录进入登录页面
        }
        else navigate("/find-page") // 若登录进入发现页面
    }
}, [isFinished, navigate]);

  return (
    <div className="home-page">
      <img 
        className="home-logo" 
        src="/images/SodaLogo.png" 
        alt="Soda Logo"
      />
      <h1 className="home-title">“有趣的灵魂于此相遇”</h1>
    </div>
  );
};

export default Home;