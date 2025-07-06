import React from 'react';
import { Routes, Route, useParams } from 'react-router-dom';
import HomePage from './pages/HomePage';
import CreateCampPage from './pages/CreateCampPage';
import CampDetailPage from './pages/CampDetailPage';
import CreateLevelPage from './pages/CreateLevelPage';
import LevelDetailPage from './pages/LevelDetailPage';
import CampsPage from './pages/CampsPage';
import PersonalPage from './pages/PersonalPage';

// 包装CampDetailPage以添加key属性
const CampDetailWrapper = () => {
  const { campId } = useParams();
  return <CampDetailPage key={campId} />;
};

// 包装CreateLevelPage以添加key属性
const CreateLevelWrapper = () => {
  const { campId } = useParams();
  return <CreateLevelPage key={campId} />;
};

// 包装LevelDetailPage以添加key属性
const LevelDetailWrapper = () => {
  const { campId } = useParams();
  return <LevelDetailPage key={campId} />;
};

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      {/* 未来将会添加更多路由 */}
      <Route path="/create-camp" element={<CreateCampPage />} />
      <Route path="/camps" element={<CampsPage />} />
      <Route path="/camp/:campId" element={<CampDetailWrapper />} />
      <Route path="/create-level/:campId" element={<CreateLevelWrapper />} />
      <Route path="/level/:campId" element={<LevelDetailWrapper />} />
      <Route path="/personal" element={<PersonalPage />} />
      <Route path="*" element={<div>404 页面未找到</div>} />
    </Routes>
  );
};

export default App; 