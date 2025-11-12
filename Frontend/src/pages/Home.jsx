import React, { useContext, useEffect, useState, useCallback } from "react";
import Navbar from "../components/Navbar";
import EditProfile from "../components/EditProfile";
import ProfileEdit from "../components/ProfileEdit";
import PostEdit from "../components/PostEdit";
import dp from "../assets/dp.webp";
import { UserData } from "../context/userDataContext";
import CreatePost from "../components/CreatePost";
import UserPost from "../components/UserPost";
import { AuthDataContext } from "../context/authDataContext";
import axios from "axios";

const Home = () => {
  const { edit, post, userPostData, getProfile } = useContext(UserData);
  const { SERVER_URL } = useContext(AuthDataContext);

  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ✅ useCallback to prevent function recreation on each render
  const getSuggestedUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${SERVER_URL}/api/user/suggested`, {
        withCredentials: true,
      });
      setSuggestedUsers(res.data?.data || []);
    } catch (err) {
      console.error("Error fetching suggested users:", err);
      setError("Failed to load suggestions.");
    } finally {
      setLoading(false);
    }
  }, [SERVER_URL]);

  // ✅ useEffect runs only once (or when SERVER_URL changes)
  useEffect(() => {
    getSuggestedUsers();
  }, [getSuggestedUsers]);

  return (
    <>
      {/* Conditional popups/modals */}
      {edit && <ProfileEdit />}
      {post && <PostEdit />}

      <Navbar />

      <div className="w-full min-h-screen bg-[#f1f1ee] px-4 lg:px-10 flex flex-col lg:flex-row items-start justify-center gap-6">
        {/* ---------- Left Sidebar ---------- */}
        <aside className="w-full lg:w-1/4 bg-white rounded-md shadow-lg p-2 mt-2">
          <EditProfile />
        </aside>

        {/* ---------- Main Content ---------- */}
        <main className="w-full lg:w-1/2 flex flex-col gap-2 items-center justify-center pb-4 mt-2">
          <CreatePost />
          {userPostData?.data?.length > 0 ? (
            userPostData.data.map((post) => (
              <UserPost
                key={post._id}
                id={post._id}
                author={post.author}
                like={post.like}
                comment={post.comment}
                image={post.image}
                description={post.description}
                createdAt={post.createdAt}
              />
            ))
          ) : (
            <p className="text-gray-500 mt-4">No posts available.</p>
          )}
        </main>

        {/* ---------- Right Sidebar (Suggestions) ---------- */}
        <section className="w-full lg:w-1/4 bg-white rounded-md shadow-lg p-6 hidden lg:flex flex-col mt-2">
          <h2 className="text-xl font-semibold mb-4">Suggested Friends</h2>

          {loading ? (
            <p className="text-gray-500">Loading suggestions...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : suggestedUsers.length > 0 ? (
            suggestedUsers.map((user) => (
              <div
                key={user._id}
                className="flex items-center gap-4 p-3 hover:bg-gray-100 cursor-pointer border-b last:border-0 transition-all duration-150"
                onClick={() => getProfile(user.UserName)}
              >
                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-300">
                  <img
                    src={user.ProfilePic || dp}
                    alt={`${user.FirstName}'s profile`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {user.FirstName} {user.LastName}
                  </h3>
                  {user.headline && (
                    <p className="text-gray-600 text-sm truncate w-40">
                      {user.headline}
                    </p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No suggestions found.</p>
          )}
        </section>
      </div>
    </>
  );
};

export default Home;
