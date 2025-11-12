import React, { useContext, useEffect, useState, useCallback } from "react";
import { UserData } from "./userDataContext.js";
import { AuthDataContext } from "./authDataContext.js";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { socket } from "./userDataContext.js";

function UserContext({ children }) {
  const [userData, setUserData] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [userPostData, setUserPostData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [edit, setEdit] = useState(false);
  const [post, setPost] = useState(false);
  const { SERVER_URL } = useContext(AuthDataContext);
  const navigate = useNavigate();

  // ✅ Fetch current user from API
  const fetchUserData = useCallback(async () => {
    try {
      const res = await axios.get(SERVER_URL + "/api/user/currentuser", {
        withCredentials: true,
      });
      setUserData(res.data);
    } catch (error) {
      console.error("User fetch error:", error.message);
      setUserData(null);
    }
  }, [SERVER_URL]);

  const getAllPost = useCallback(async () => {
    try {
      const res = await axios.get(SERVER_URL + "/api/post/get", {
        withCredentials: true,
      });
      setUserPostData(res.data);
    } catch (error) {
      console.error("Post fetch error:", error.message);
    }
  }, [SERVER_URL]);

  const getProfile = useCallback(
    async (username) => {
      try {
        const res = await axios.get(
          SERVER_URL + `/api/user/profile/${username}`,
          { withCredentials: true }
        );
        setProfileData(res.data.data);
        navigate("/profile");
      } catch (error) {
        console.error(error.message);
      }
    },
    [SERVER_URL, navigate]
  );

  // ✅ This ensures instant render — no waiting for API
  useEffect(() => {
    // Phase 1: Instantly set loading to false
    setLoading(false);

    // Phase 2: Background fetch user data
    if (SERVER_URL) {
      fetchUserData();
      getAllPost();
    }
  }, [SERVER_URL, fetchUserData, getAllPost]);

  return (
    <UserData.Provider
      value={{
        userData,
        setUserData,
        edit,
        socket,
        userPostData,
        getAllPost,
        setUserPostData,
        setEdit,
        post,
        getProfile,
        profileData,
        setProfileData,
        setPost,
        loading,
        refreshUserData: fetchUserData,
      }}
    >
      {children}
    </UserData.Provider>
  );
}

export default UserContext;
