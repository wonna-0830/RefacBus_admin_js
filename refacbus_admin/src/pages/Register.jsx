// src/pages/Register.jsx
import { useState } from "react";
import { firestoreDb, realtimeDb, app } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import { ref, set } from "firebase/database";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [isKoreanId, setIsKoreanId] = useState(false);
  const [isEnglishName, setIsEnglishName] = useState(false);
  const navigate = useNavigate();

  const auth = getAuth(app);

  const handlePasswordToggle = () => {
  setShowPassword(true);
  setTimeout(() => setShowPassword(false), 3000);
  };

  const handleCodeToggle = () => {
    setShowCode(true);
    setTimeout(() => setShowCode(false), 3000);
  };

  const handleIdChange = (e) => {
    const value = e.target.value;
    setId(value);

    const koreanRegex = /[ㄱ-ㅎㅏ-ㅣ가-힣]/;
    setIsKoreanId(koreanRegex.test(value));
  };

  const handleNameChange = (e) => {
    const value = e.target.value;
    setName(value);

    const englishRegex = /[a-zA-Z]/;
    setIsEnglishName(englishRegex.test(value));
  };

  const handleRegister = async () => {
    if (!id || !password || !name || !code) {
      alert("모든 항목을 입력해주세요!");
      
      return;
    }
    

    try {
      // 관리자 코드 확인 (Firestore)
      const docRef = doc(firestoreDb, "admin_code", "admin_key");
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        alert("관리자 코드 정보가 없습니다.");
        return;
      }

      const savedCode = docSnap.data().code;
      if (code !== savedCode) {
        alert("관리자 코드가 올바르지 않습니다.");
        return;
      }

      // ✅ 이메일 형식으로 변환
      const email = `${id}@example.com`;

      // Firebase Auth 회원가입
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      // Realtime Database에 관리자 정보 저장
      await set(ref(realtimeDb, `admin/${uid}`), {
        id,
        name,
        createdAt: new Date().toISOString(),
      });

      alert("회원가입 성공!");
      navigate("/");
    } catch (error) {
        if (error.code === "auth/email-already-in-use") {
        setErrorMessage("이미 등록된 이메일입니다. 로그인하거나 다른 이메일을 사용해주세요.");
      } else if (error.code === "auth/invalid-email") {
        setErrorMessage("이메일 형식이 올바르지 않습니다.");
      } else if (error.code === "auth/weak-password") {
        setErrorMessage("비밀번호는 최소 6자리 이상이어야 합니다.");
      } else {
        setErrorMessage("회원가입 중 오류가 발생했습니다.");
      }
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-10">
      <div className="bg-white shadow-md rounded p-9">
        <h2 className="text-2xl font-bold mb-3 text-black">관리자 회원가입</h2>
        <p className="text-sm font-thin mb-5 text-black">
          회원가입을 위해선 공용 비밀번호가 추가로 필요합니다.
        </p>

        <input
          type="text"
          placeholder="아이디 (영문 입력)"
          value={id}
          onChange={handleIdChange}
          className="w-full mb-4 p-2 border rounded"
        />
        {isKoreanId && (
          <p className="text-red-500 text-sm mb-3">
            한글입니다. 영문으로 작성해주세요.
          </p>
        )}


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
                onClick={handlePasswordToggle}
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
        <input
            type="text"
            placeholder="이름 (한글 입력)"
            value={name}
            onChange={handleNameChange}
            className="w-full mb-4 p-2 border rounded"
          />
          {isEnglishName && (
            <p className="text-red-500 text-sm mb-3">
              영문입니다. 한글로 작성해주세요.
            </p>
          )}

        <div style={{ position: "relative" }}>
            <input
                type={showCode ? "text" : "password"}
                value={code}
                className="w-full mb-4 p-2 border rounded"
                onChange={(e) => setCode(e.target.value)}
                placeholder="관리자 코드"
            />
            <button
                type="button"
                onClick={handleCodeToggle}
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
          onClick={handleRegister}
          className="w-full bg-slate-400 text-white py-2 rounded hover:bg-slate-500"
        >
          회원가입
        </button>
      </div>
    </div>
  );
}
