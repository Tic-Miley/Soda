import { useNavigate } from "react-router-dom";

const NavBar = () => {
  const navigate = useNavigate()
  const goTo = (e: React.FormEvent, page: string) => {
    e.preventDefault();
    navigate(page);
  };
  return (
    <nav className="navbar">
      <div className="nav-links">
        <button type = "button" onClick={(e) => {goTo(e,"find-page")}} className="nav-link">🔍 发现</button>
        <button type = "button" onClick={(e) => {goTo(e,"post-activity-page")}} className="nav-link">➕ 创建</button>
        <button type = "button" onClick={(e) => {goTo(e,"my-activities-page")}} className="nav-link">👤 我的</button>
      </div>
    </nav>
  );
};

export default NavBar;