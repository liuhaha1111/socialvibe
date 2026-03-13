import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { BottomNav } from './components/BottomNav';
import { RequireAuth } from './components/RequireAuth';
import { Home } from './pages/Home';
import { Detail } from './pages/Detail';
import { Create } from './pages/Create';
import { Chat } from './pages/Chat';
import { ChatList } from './pages/ChatList';
import { Friends } from './pages/Friends';
import { Profile } from './pages/Profile';
import { Settings } from './pages/Settings';
import { Review } from './pages/Review';
import { CheckIn } from './pages/CheckIn';
import { Saved } from './pages/Saved';
import { Auth } from './pages/Auth';
import { AuthProvider } from './context/AuthContext';
import { UserProvider } from './context/UserContext';
import { ActivityProvider } from './context/ActivityContext';

// A simple wrapper to apply the max-w-md constraint
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen w-full flex justify-center bg-gray-100">
       <div className="w-full max-w-md bg-background-light min-h-screen relative shadow-2xl overflow-hidden flex flex-col">
          {children}
          <BottomNav />
       </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route
            path="/*"
            element={
              <RequireAuth>
                <UserProvider>
                  <ActivityProvider>
                    <Layout>
                      <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/detail" element={<Detail />} />
                        <Route path="/create" element={<Create />} />
                        <Route path="/chat" element={<Chat />} />
                        <Route path="/chat-list" element={<ChatList />} />
                        <Route path="/friends" element={<Friends />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="/review" element={<Review />} />
                        <Route path="/checkin" element={<CheckIn />} />
                        <Route path="/saved" element={<Saved />} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                      </Routes>
                    </Layout>
                  </ActivityProvider>
                </UserProvider>
              </RequireAuth>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
