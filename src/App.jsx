import { Navigate, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import { chapters } from './chapters/index.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      {chapters.map((chapter) => {
        const ChapterComponent = chapter.component;
        return <Route key={chapter.id} path={chapter.route} element={<ChapterComponent />} />;
      })}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
