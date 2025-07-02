// src/pages/Login.jsx

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword} from "firebase/auth";
import { ref, get } from "firebase/database"
import { auth, realtimeDb } from "../firebase"

export default function Login() {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [rememberId, setRememberId] = useState(false);
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  let passwordTimeoutRef = useRef(null);
  
    const togglePasswordVisibility = () => {
    setShowPassword(true);
  
    // 이전 타이머 제거
    if (passwordTimeoutRef.current) {
      clearTimeout(passwordTimeoutRef.current);
    }
  
    // 1초 뒤에 다시 가리기
    passwordTimeoutRef.current = setTimeout(() => {
      setShowPassword(false);
    }, 1000);
  };
  

  useEffect(() => {
    const savedId = localStorage.getItem("savedId");
    if (savedId) {
      setId(savedId);
      setRememberId(true);
    }
  }, []);

  const handleLogin = async () => {
    if(!id || !password) {
        alert("이메일과 비밀번호를 입력해주세요.")
        return
    }
    

    const fullEmail = `${id}@example.com`

    try{
        const userCredential = await signInWithEmailAndPassword(auth, fullEmail, password)
        const uid = userCredential.user.uid;

        if (rememberId) {
             localStorage.setItem("savedId", id);
        } else {
            localStorage.removeItem("savedId");
        }
        
        const snapshot = await get(ref(realtimeDb, `admin/${uid}`))
        if (snapshot.exists()){
            const userData = snapshot.val()
            console.log("환영합니다,", userData.name)
            navigate("/Home");
        } else {
            alert("관리자 정보가 존재하지 않습니다.")
        }
    } catch (error) {
        if (error.code === "auth/user-not-found"){
            alert("존재하지 않는 계정입니다.")
        } else if (error.code === "auth/wrong-password"){
            alert("비밀번호를 다시 확인해주세요.")
        } else {
            alert("로그인에 실패했습니다.")
            console.error(error)
        }
    }
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

          type="text"
          placeholder="아이디"
          className="w-full mb-4 p-2 border rounded"
          value={id}
          onChange={(e) => setId(e.target.value)}
        />

        <div style={{ position: "relative" }}>
            <input
                type={showPassword ? "text" : "password"}
                value={password}
                className="w-full mb-4 p-2 border rounded"
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호"
            />
            <button
                type="button"
                onClick={togglePasswordVisibility}
                style={{
                position: "absolute",
                right: "10px",
                top: "35%",
                transform: "translateY(-50%)"
                }}
            >
                👁
            </button>
        </div>

        <button
          onClick={handleLogin}
          className="w-full bg-blue-500 text-white py-2 mb-4 rounded hover:bg-blue-600"
        >
          로그인
        </button>

        <button
          onClick={handleRegister}
          className="w-full bg-slate-400 text-white py-2 mb-4 rounded hover:bg-slate-500"
        >
          회원가입
        </button>
        <label style={{color: "black"}}>
             <input
                type="checkbox"
                checked={rememberId}
                onChange={(e) => setRememberId(e.target.checked)}
            />
          아이디 기억하기
        </label>
``
      </div>
    </div>
  );
}
