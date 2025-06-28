import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import apiRequest from "../utils/apiRequest.js";
import PageTitle from "../components/PageTitle.js";
import AuthInfo from "../interface/AuthInfo.js";

const Login = () => {
    const navigate = useNavigate();
    const { post } = apiRequest();
    const [error, setError] = useState(""); 
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState<AuthInfo>({ email: "", password: "" });
    
    const submitLogin = async (e: React.FormEvent) => {
        setIsLoading(true)
        e.preventDefault();
        setError("");
        try {
            const data = await post("auth", "login", formData, e);
            localStorage.setItem("token", data.token);
            navigate("/find-page");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-page">
            <PageTitle pageTitle="登录" pageSubTitle="“在这里发现奇遇”" />
            <form className="form" onSubmit={submitLogin}>
                <div className="input-container">
                    {error && <p style={{ color: "red" }}>{error}</p>}
                    <input
                        className="input"
                        type="email"
                        placeholder="邮箱"
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                    />
                </div>
                <div className="input-container">
                    <input
                        className="input"
                        type="password"
                        placeholder="密码"
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                    />
                </div>
                <button type="submit" className="button">登录</button>
                <p className="mt-4 text-center">
                    没有账号？ <Link to="/register-page">去注册</Link>
                </p>
            </form>
            {isLoading?(<span>登录中，请稍后</span>):<></>}
        </div>
    );
};

export default Login;