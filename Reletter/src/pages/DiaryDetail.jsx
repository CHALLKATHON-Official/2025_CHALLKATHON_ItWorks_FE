import React, { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import axios from "axios";
import Header from "../components/Header";

// ✅ YYYY-MM-DD 형식으로 로컬 시간대를 문자열로 변환
const getLocalDateString = (dateObj) => {
  const offset = dateObj.getTimezoneOffset();
  const localDate = new Date(dateObj.getTime() - offset * 60000);
  return localDate.toISOString().slice(0, 10);
};

const DiaryDetail = () => {
  const { groupId } = useParams();
  const [searchParams] = useSearchParams();

  const [date, setDate] = useState(""); // 빈 초기값
  const [diaries, setDiaries] = useState([]);

  // ✅ 쿼리 파라미터로 전달된 날짜로만 설정
  useEffect(() => {
    const paramDate = searchParams.get("date");
    if (paramDate) {
      setDate(paramDate);
    } else {
      const today = getLocalDateString(new Date());
      setDate(today); // fallback (사실상 안 쓰일 예정)
    }
  }, [searchParams]);

  // ✅ 그룹ID + 날짜 기준으로 일기 불러오기
  useEffect(() => {
    const fetchGroupDiaries = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          alert("로그인이 필요합니다.");
          return;
        }

        const res = await axios.get(
          `http://localhost:4000/diaries/group/${groupId}?date=${date}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setDiaries(res.data);
      } catch (err) {
        console.error("❌ 그룹 일기 조회 실패:", err);
        alert("일기를 불러오는 데 실패했습니다.");
      }
    };

    if (groupId && date) {
      fetchGroupDiaries();
    }
  }, [groupId, date]);

  return (
    <div
      style={{
        backgroundColor: "#fff0f6",
        paddingBottom: "132px",
      }}
    >
      <div>
        <Header />
      </div>
    <div style={styles.wrapper}>
      <h1 style={styles.pageTitle}>📘 그룹 일기 목록 ({date})</h1>

        {diaries.length === 0 ? (
          <p style={styles.emptyMessage}>작성된 일기가 없습니다.</p>
        ) : (
          diaries.map((diary) => (
            <div key={diary._id} style={styles.diaryBox}>
              <h2 style={styles.title}>{diary.title}</h2>
              <p style={styles.meta}>
                {diary.date?.slice(0, 10)} | {diary.user?.name || "작성자 없음"}
              </p>

              {/* ✅ 이미지 출력 */}
              {diary.imageUrl && (
                <img
                  src={`http://localhost:4000${diary.imageUrl}`}
                  alt="diary-img"
                  style={styles.image}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = "/close.png"; // 이미지 깨질 때 대체 이미지
                  }}
                />
              )}

              <p style={styles.content}>{diary.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const styles = {
  wrapper: {
    maxWidth: "800px",
    margin: "40px auto",
    padding: "0 20px",
  },

  pageTitle: {
    fontSize: "28px",
    textAlign: "center",
    color: "#d94673",
    marginBottom: "30px",
  },
  emptyMessage: {
    textAlign: "center",
    color: "#777",
  },
  diaryBox: {
    marginBottom: "32px",
    padding: "24px",
    backgroundColor: "#fffdfc",
    borderRadius: "16px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  title: {
    fontSize: "22px",
    fontWeight: "bold",
    color: "#333",
    marginBottom: "8px",
  },
  meta: {
    fontSize: "14px",
    color: "#888",
    marginBottom: "12px",
  },
  image: {
    width: "100%",
    height: "auto",
    objectFit: "cover",
    borderRadius: "12px",
    marginBottom: "16px",
  },
  content: {
    fontSize: "16px",
    whiteSpace: "pre-wrap",
    color: "#444",
  },
};

export default DiaryDetail;
