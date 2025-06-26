import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Sidebar() {
  const [groups, setGroups] = useState([]);
  const [friends, setFriends] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [currentUserId, setCurrentUserId] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    console.log("🟡 currentUserId", currentUserId);
  }, [currentUserId]);
  
  useEffect(() => {
    console.log("🟣 selectedGroup", selectedGroup);
  }, [selectedGroup]);
  

  useEffect(() => {
    const token = localStorage.getItem("accessToken");

    const fetchCurrentUser = async () => {
      try {
        const res = await fetch("${process.env.REACT_APP_API_URL}/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setCurrentUserId(data.id || data._id);
      } catch (err) {
        console.error("❌ 사용자 정보 로드 실패:", err);
      }
    };

    const fetchFriends = async () => {
      try {
        const res = await fetch("${process.env.REACT_APP_API_URL}/users/friends/list", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("친구 목록 로드 실패");
        const data = await res.json();
        setFriends(data);
      } catch (err) {
        console.error("❌ 친구 목록 로드 실패:", err);
      }
    };

    const fetchGroups = async () => {
      try {
        const res = await fetch("${process.env.REACT_APP_API_URL}/users/groups/list", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("그룹 목록 로드 실패");
        const data = await res.json();
        setGroups(data);
      } catch (err) {
        console.error("❌ 그룹 목록 로드 실패:", err);
      }
    };

    fetchCurrentUser();
    fetchFriends();
    fetchGroups();
  }, []);

  const addGroup = () => navigate("/Group");
  const handleFindClick = () => navigate("/findfriend");

  const handleDeleteFriend = async (friendId) => {
    const confirm = window.confirm("정말로 이 친구를 삭제하시겠습니까?");
    if (!confirm) return;

    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${process.env.REACT_APP_API_URL}/users/friends/${friendId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("삭제 실패");

      setFriends(prev => prev.filter(f => f.id !== friendId));
      setSelectedFriend(null);
      alert("친구가 삭제되었습니다.");
    } catch (err) {
      console.error("❌ 친구 삭제 실패:", err);
      alert("친구 삭제 중 오류가 발생했습니다.");
    }
  };

  const handleRemoveMember = async (groupId, memberId) => {
    const confirm = window.confirm("정말로 이 구성원을 삭제하시겠습니까?");
    if (!confirm) return;

    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${process.env.REACT_APP_API_URL}/users/groups/${groupId}/members/${memberId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("구성원 삭제 실패");

      setSelectedGroup(prev => ({
        ...prev,
        members: prev.members.filter(m => String(m._id || m.id) !== String(memberId)),
      }));
      alert("구성원이 삭제되었습니다.");
    } catch (err) {
      console.error("❌ 구성원 삭제 실패:", err);
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  const handleDeleteGroup = async (groupId) => {
    const confirm = window.confirm("이 그룹을 정말로 삭제하시겠습니까?");
    if (!confirm) return;
    if (!window.confirm("정말로 이 그룹을 삭제하시겠습니까?\n\n❗ 그룹 내 작성된 일기도 모두 삭제됩니다.")) return;

    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${process.env.REACT_APP_API_URL}/users/groups/${groupId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("그룹 삭제 실패");

      setGroups(prev => prev.filter(g => g._id !== groupId));
      setSelectedGroup(null);
      alert("그룹이 삭제되었습니다.");
    } catch (err) {
      console.error("❌ 그룹 삭제 실패:", err);
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  return (
    <>
      <aside style={sidebarStyle}>
        <h3 style={sectionTitle}>📂 그룹</h3>
        <div style={sectionListStyle}>
          {groups.length === 0 ? (
            <p style={emptyTextStyle}>아직 생성된 그룹이 없습니다.</p>
          ) : (
            groups.map((group) => (
              <SidebarItem
                key={group._id}
                label={`💌 ${group.name}`}
                onClick={() => {
                  setSelectedFriend(null);
                  setSelectedGroup(group);
                  setShowPasswordForm(false);
                }}
              />
            ))
          )}
          <button onClick={addGroup} style={addButtonStyle}>+ 그룹 추가</button>
        </div>

        <h3 style={{ ...sectionTitle, marginTop: "24px" }}>👥 친구 목록</h3>
        <div style={{ ...sectionListStyle, flexGrow: 1 }}>
          {friends.length === 0 ? (
            <p style={emptyTextStyle}>아직 추가된 친구가 없습니다.</p>
          ) : (
            friends.map((friend) => (
              <SidebarItem
                key={friend.id}
                label={friend.name}
                onClick={() => {
                  setSelectedGroup(null);
                  setSelectedFriend(friend);
                }}
              />
            ))
          )}
          <button onClick={handleFindClick} style={addButtonStyle}>+ 친구 찾기</button>
        </div>
      </aside>

      {(selectedFriend || selectedGroup) && (
        <div style={popupStyle}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <strong>상세 정보</strong>
            <button
              onClick={() => {
                setSelectedFriend(null);
                setSelectedGroup(null);
                setShowPasswordForm(false);
                setNewPassword("");
              }}
              style={closeButtonStyle}
            >
              ✖︎
            </button>
            
          </div>

          {selectedFriend && (
            <div>
              <p><strong>이름:</strong> {selectedFriend.name}</p>
              <p><strong>이메일:</strong> {selectedFriend.email}</p>
              <button
                style={{ marginTop: "10px", padding: "6px 12px", backgroundColor: "#f87171", color: "white", border: "none", borderRadius: "6px", cursor: "pointer" }}
                onClick={() => handleDeleteFriend(selectedFriend.id)}
              >친구 삭제</button>
            </div>
          )}

          {selectedGroup && (
            <div>
              <p><strong>그룹 이름:</strong> {selectedGroup.name}</p>
              <p><strong>구성원:</strong></p>
              <ul>
                {selectedGroup.members?.map((m) => (
                  <li key={m._id || m.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                    <span>{m.name}</span>
                    {String(m._id || m.id) !== String(currentUserId) && (
                      <button
                        onClick={() => handleRemoveMember(selectedGroup._id, m._id || m.id)}
                        style={{ background: "#fca5a5", border: "none", borderRadius: "4px", color: "white", padding: "2px 6px", cursor: "pointer", fontSize: "12px" }}
                      >삭제</button>
                    )}
                  </li>
                ))}
              </ul>

              <p
                style={{
                  marginTop: "8px",
                  fontSize: "14px",
                  color: "#9d174d",
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
                onClick={() => setShowPasswordForm(true)}
              >
                🔐 비밀번호 설정
              </p>

              {showPasswordForm && (
                <div style={{ marginTop: "8px" }}>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="새 비밀번호"
                    style={{
                      padding: "6px",
                      width: "100%",
                      marginBottom: "6px",
                      gap: "10px"
                    }}
                  />
                  <button
                    onClick={async () => {
                      try {
                        const token = localStorage.getItem("accessToken");
                        const res = await fetch(
                          `${process.env.REACT_APP_API_URL}/users/groups/${selectedGroup._id}/password`,
                          {
                            method: "PATCH",
                            headers: {
                              "Content-Type": "application/json",
                              Authorization: `Bearer ${token}`,
                            },
                            body: JSON.stringify({ newPassword }),
                          }
                        );

                        if (!res.ok) throw new Error("비밀번호 변경 실패");

                        alert("✅ 비밀번호가 변경되었습니다!");
                        setShowPasswordForm(false);
                        setNewPassword("");
                      } catch (err) {
                        console.error(err);
                        alert("❌ 비밀번호 변경 실패");
                      }
                    }}
                    style={passwordButtonStyle}
                  >
                    확인
                  </button>
                  <button
                    onClick={() => {
                      setShowPasswordForm(false);
                      setNewPassword("");
                    }}
                    style ={passwordButtonStyle}
                  >
                    취소
                  </button>
                </div>
              )}
              <button
                onClick={() => handleDeleteGroup(selectedGroup._id)}
                style={{ marginTop: "12px", padding: "6px 12px", backgroundColor: "#f87171", color: "white", border: "none", borderRadius: "6px", cursor: "pointer", width: "100%" }}
              >그룹 삭제</button>
            </div>
          )}
        </div>
      )}
    </>
  );
}

function SidebarItem({ label, onClick }) {
  return (
    <div style={linkStyle} onClick={onClick}>
      {label}
    </div>
  );
}

// 스타일 정의
const sidebarStyle = {
  width: "220px",
  backgroundColor: "#fdf2f8",
  padding: "24px 16px",
  height: "100vh",
  display: "flex",
  flexDirection: "column",
  boxShadow: "2px 0 6px rgba(0, 0, 0, 0.05)",
};

const popupStyle = {
  position: "fixed",
  top: "220px",
  left: "240px",
  width: "260px",
  backgroundColor: "#fff0f5",
  padding: "16px",
  borderRadius: "10px",
  boxShadow: "0 0 10px rgba(0,0,0,0.1)",
  zIndex: 1000,
};

const sectionTitle = {
  fontSize: "16px",
  color: "#9d174d",
  marginBottom: "12px",
};

const linkStyle = {
  textDecoration: "none",
  color: "#374151",
  fontSize: "15px",
  padding: "8px 12px",
  borderRadius: "8px",
  transition: "background 0.2s",
  cursor: "pointer",
};

const emptyTextStyle = {
  fontSize: "13px",
  color: "#999",
  paddingLeft: "4px",
  marginBottom: "8px",
};

const sectionListStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "8px",
  paddingRight: "4px",
};

const addButtonStyle = {
  marginTop: "8px",
  padding: "6px 10px",
  fontSize: "14px",
  border: "1px solid #f9a8d4",
  borderRadius: "8px",
  backgroundColor: "#ffffff",
  color: "#9d174d",
  cursor: "pointer",
  width: "100%",
};

const passwordButtonStyle = {
  padding: "4px 10px",
  border: "2px solid #d94673",  // 릴레터 핑크 테두리
  borderRadius: "6px",
  backgroundColor: "#fff",      // 흰 배경
  color: "#9d174d",             // 릴레터 포인트 텍스트 색
  cursor: "pointer",
  fontSize: "13px",

};

const closeButtonStyle = {
  backgroundColor: "#fff",
  border: "2px solid #d94673",   // 릴레터 테두리
  color: "#d94673",              // 릴레터 텍스트 색
  borderRadius: "6px",
  fontSize: "16px",
  padding: "2px 8px",
  cursor: "pointer",
  lineHeight: "1",
};


export default Sidebar;
