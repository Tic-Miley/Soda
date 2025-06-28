import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from 'react-router-dom';
import apiRequest from "../utils/apiRequest.js";
import PageTitle from "../components/PageTitle.js";

const Register = () => {
    const navigate = useNavigate();
    const { post } = apiRequest();
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        username: "",
        password: "",
    });

    const submitRegister = async (e: React.FormEvent) => {
        setIsLoading(true)
        e.preventDefault(); 
        setError("");
        try {
            const data = await post("auth", "register", formData, e);
            localStorage.setItem("token", data.token);
            navigate("/find-page");
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="register-page">
            <PageTitle
                pageTitle="注册"
                pageSubTitle= "“在这里发现奇遇”"
            />     
            {error && <p className="text-red-500">{error}</p>}
            <form className="form" onSubmit={submitRegister}>
                <div className="input-container">
                    <input
                        type="email"
                        className="input"                    
                        placeholder="邮箱"
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                    />
                </div>
                <div className="input-container">
                    <input
                        type="text"
                        className="input"
                        placeholder="用户名"
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        required
                    />
                </div>
                <div className="input-container">
                    <input
                        type="password"
                        className="input"
                        placeholder="密码"
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                    />
                </div>
                <button type="submit" className="button">注册</button>
                <p className="mt-4 text-center">
                    已有账号？ <Link to="/login-page">去登录</Link> 
                </p>
            </form>
            {isLoading?(<span>登陆中，请稍后</span>):<></>}
        </div>
    );
};

export default Register;