import { useNavigate } from "react-router-dom";

const apiRequest = () => {
  const navigate = useNavigate();
  const post = async (prefix: string, endpoint: string, formData: any, e?: any) => {
    if (e) e.preventDefault();

    const token = localStorage.getItem("token");
    const headers: Record<string, string> = {
      "Content-Type": "application/json"
    };
    if (token) {
      headers["Authorization"] = `${token}`;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/${prefix}/${endpoint}`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "连接错误，请检查网络问题");
      }
      return await response.json();
    } catch (err: any) {
      if(err.message === "INVALIDTOKEN"){
        localStorage.removeItem("token")
        navigate('\login-page')
      }
      throw new Error(err.message);
    }
  };


  const get = async (prefix: string, endpoint: string) => {
    const token = localStorage.getItem("token");
    const headers: Record<string, string> = {
      "Content-Type": "application/json"
    };
    if (token) {
      headers["Authorization"] = `${token}`;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/${prefix}/${endpoint}`, {
        method: "GET",
        headers: headers,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "连接错误，请检查网络问题");
      }

      return await response.json();
    } catch (err: any) {
      if(err.message === "INVALIDTOKEN"){
        localStorage.removeItem("token")
        navigate('\login-page')
      }
      throw new Error(err.message);
    }
  };

  const put = async (prefix: string, endpoint: string, formData: any) => {
    const token = localStorage.getItem("token");
    const headers: Record<string, string> = {
      "Content-Type": "application/json"
    };
    if (token) {
      headers["Authorization"] = `${token}`;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/${prefix}/${endpoint}`, {
        method: "PUT",
        headers: headers,
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "连接错误，请检查网络问题");
      }
      return await response.json();
    } catch (err: any) {
      if(err.message === "INVALIDTOKEN"){
        localStorage.removeItem("token")
        navigate('\login-page')
      }
      throw new Error(err.message);
    }
  };

  return { post, get, put };
};

export default apiRequest;