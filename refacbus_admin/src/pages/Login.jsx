// src/pages/Login.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = () => {
    // 나중에 Firebase 로그인 로직 여기에!
    alert(`이메일: ${email}\n비밀번호: ${password}`);
  };

  const handleRegister = () => {
    navigate("/Register");
  };

  return (
    <div className="max-w-2xl mx-auto p-10">
      <div className="bg-white shadow-md rounded p-9">
        <h2 className="text-2xl font-bold mb-3 text-balance text-black">관리자 로그인</h2>
        <p className="text-sm font-thin mb-5 text-black text-balance">관리자만 로그인 가능합니다.</p>

        <input
          type="id"
          placeholder="아이디"
          className="w-full mb-4 p-2 border rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="비밀번호"
          className="w-full mb-6 p-2 border rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          className="w-full bg-blue-500 text-white py-2 mb-4 rounded hover:bg-blue-600"
        >
          로그인
        </button>

        <button
          onClick={handleRegister}
          className="w-full bg-slate-400 text-white py-2 rounded hover:bg-slate-500"
        >
          회원가입
        </button>
      </div>
    </div>
  );
}
