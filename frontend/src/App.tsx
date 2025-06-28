import { BrowserRouter as Router, Routes, Route, useNavigate, Outlet, replace } from "react-router-dom";
import { useEffect } from "react";
import NavBar from "./components/NavBar.js";
import TopBar from "./components/TopBar.js";
import Home from "./pages/Home.js";
import Login from "./pages/Login.js";
import Register from "./pages/Register.js";
import Find from "./pages/Find.js";
import MyActivities from "./pages/MyActivities.js";
import Participate from "./pages/Participate.js";
import Applied from "./pages/Applied.js";
import PostActivity from "./pages/PostActivity.js";
import Profile from "./pages/Profile.js";
import "./App.css";

const AuthWrapper = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  useEffect(() => {
    if (!token) {
      navigate("/login-page",{replace: true});
    }
  }, []);

  return token ? (<Outlet />) : <></>;  
};

const App = () => {
  return (
    <Router>
      <TopBar />
      <div className="main">
        <Routes>
          {/* 公开页面：不需要 AuthGuard */}
          <Route path="/" element={<Home />} />
          <Route path="/login-page" element={<Login />} />
          <Route path="/register-page" element={<Register />} />

          {/* 受保护页面：包裹在 AuthGuard 中 */}
          <Route element={<AuthWrapper />}>
            <Route path="/find-page" element={<Find />} />
            <Route path="/my-activities-page" element={<MyActivities />} />
            <Route path="/post-activity-page" element={<PostActivity />} />
            <Route path="/apply-page" element={<Applied />} />
            <Route path="/participate-page" element={<Participate />} />
            <Route path="/profile-page" element={<Profile />} />
          </Route>
        </Routes>
      </div>
      <NavBar />
    </Router>
  );
};

export default App;
