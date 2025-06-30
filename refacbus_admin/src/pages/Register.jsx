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
  const navigate = useNavigate();

  const auth = getAuth(app);

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
      console.error("회원가입 실패:", error.message);
      alert("회원가입 중 오류 발생: " + error.message);
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
          placeholder="아이디 (예: admin01)"
          className="w-full mb-4 p-2 border rounded"
          value={id}
          onChange={(e) => setId(e.target.value)}
        />
        <input
          type="password"
          placeholder="비밀번호"
          className="w-full mb-4 p-2 border rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input
          type="text"
          placeholder="성명"
          className="w-full mb-4 p-2 border rounded"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="password"
          placeholder="관리자 코드"
          className="w-full mb-4 p-2 border rounded"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />

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
