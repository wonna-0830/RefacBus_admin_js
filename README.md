## 프로젝트 개요
스쿨버스 예약 및 운행 관리를 한 곳에서 처리할 수 있는 **웹 관리자 대시보드**입니다.  
관리자는 노선, 정류장, 운행 시간, 기사 스케줄, 공지사항 등을 실시간으로 등록·수정·삭제할 수 있으며,  
예약 현황과 통계를 한눈에 확인할 수 있습니다.

---

## 개발 배경
기존 스쿨버스 운행 관리 방식은 체계가 잡혀있지 않았고, Firebase 내에서만 운행/예약 기록을 확인할 수 있었습니다. 
이에 따라, **실시간 데이터 반영·권한별 관리·시각화**를 통해  
운영 효율성과 데이터 정확성을 높이는 관리 시스템을 개발하게 되었습니다.

---

## 주요 기능
- **노선/정류장/시간 관리**
  - CRUD(생성, 읽기, 수정, 삭제)
  - 모달 기반 수정 및 고정 기능
- **기사 스케줄 관리**
  - 요일·시간·소요시간 선택 후 저장
  - 주간표 시각화(색상 표시, 병합 규칙 적용)
- **회원 관리(학생)**
  - 학생들의 기본 정보 관리(수정, 계정 정지, 메모, 경고, 비밀번호 찾기 기능)
- **공지사항 및 일정 관리**
  - 공지 등록/수정, 별표로 고정 여부 토글
  - 일정 등록/수정, 캘린더에 일정이 존재하면 하늘색으로 표시
  - 등록된 공지사항과 일정은 대시보드(홈)와 연동되어 확인 가능
- **예약 현황/통계**
  - 일별/월별 예약 건수 조회
  - 예약 취소/중복 현황 시각화
- **권한별 접근 제어**
  - 관리자별 기능 접근 여부 설정
- **회원가입 보안 기능**
  - 관리자 계정 생성 시 별도의 관리자 전용 암호 입력 필수
  - 올바른 관리자 암호 입력 시에만 회원가입 가능

---

## 기술 스택
| 구분 | 사용 기술 |
|------|----------|
| **Frontend** | React, Tailwind CSS, JavaScript |
| **Backend** | Firebase Realtime Database, Firebase Authentication |
| **Deployment** | Vercel |
| **Version Control** | Git, GitHub |
| **Tools** | VS Code |

---

## 프로젝트 구조
```
src/
├── components/ 각 페이지 별 폴더 내에 관련 컴포넌트들이 존재
├── pages/ 주요 페이지
├── utils/ 색상 유닛과 권한 제어 관련 유틸
└── context/ 관리자 권한을 위한 컨텍스트
```

---

## 설치 및 실행 방법

- 프로젝트 클론
`git clone https://github.com/username/project.git`

- 패키지 설치
`npm install`

- 개발 서버 실행
`npm run dev`

- 데모 계정
  - 슈퍼관리자: wjddnjs0830, opop8520
  - 기본관리자: SonDongYeol, opop8520 또는 ChoiDongWon, opop8520
 
---

## 주요 페이지별 스크린샷

### 1. 메인화면
- 로그인 시 노출되는 메인화면입니다.
- 다른 페이지에서 좌측 상단의 **DCU 스쿨버스 관리자** 버튼을 누르면 돌아갑니다. 
- 관리자가 등록한 공지사항과 일정을 볼 수 있습니다.
<a href="https://github.com/wonna-0830/home">
<<<<<<< HEAD
  <img src="images/홈.PNG" width="1800">
=======
  <img src="images/홈.jpg" width="180">
>>>>>>> c38a7b0 (스크린샷 추가)
</a>

### 2. 회원관리 탭
- 회원들 중 학생회원을 관리하는 기능입니다.
- 가입한 학생들의 UID, 아이디(이메일), 이름, 가입날짜, 경고 횟수, 정지 여부와 함께 서브 기능으로 회원관리가 가능하도록 했습니다.
<a href="https://github.com/wonna-0830/UserManagement">
<<<<<<< HEAD
  <img src="images/회원관리.PNG" width="1800">
</a>

=======
  <img src="images/홈.jpg" width="1800">
</a>

- [**회원관리 메뉴**](<img width="180" alt="회원관리 메뉴" src="https://github.com/user-attachments/assets/82cababf-14c8-4518-a3ce-56e684d6a505" />)

- [**정지 해제**](<img width="351" height="773" alt="계정 정지" src="https://github.com/user-attachments/assets/19263a27-4e55-4d0f-8e6d-ad8f25e7facd" />)
  -클릭 시 Firebase 내 데이터베이스에 isBanned가 true가 되면서 앱에서 로그인이 불가능해집니다.
  - [데이터베이스 보기](<img width="366" height="367" alt="계정정지 디비" src="https://github.com/user-attachments/assets/61e91e4e-5237-4ee3-9d61-71a55e9cd9f2" />)

- [**비밀번호 초기화**](<img width="180" alt="비밀번호 초기화" src="https://github.com/user-attachments/assets/d2dc7a46-7842-4196-ad4f-42a849edf612" />)

- [**회원 정보 수정**](<img width="180" alt="회원정보수정" src="https://github.com/user-attachments/assets/0fa9bf77-bc0b-4dc3-a0b6-b5dfb0ff5865" />)

-[** 회원 메모 이력**](<img width="180" alt="회원 메모 이력" src="https://github.com/user-attachments/assets/c1e5c9c3-1949-4c01-9e33-70d27f8e25d5" />)

- [**회원 메모 추가**](<img width="180" alt="회원 메모 추가" src="https://github.com/user-attachments/assets/e601c8f4-1a3a-4688-8041-25016f6c0946" />)
>>>>>>> c38a7b0 (스크린샷 추가)




