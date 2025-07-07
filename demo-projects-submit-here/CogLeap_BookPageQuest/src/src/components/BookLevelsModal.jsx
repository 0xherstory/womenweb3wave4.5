import React, { useState } from 'react';

const BookLevelsModal = ({ book, onClose, onSelectLevel }) => {
  const [currentView, setCurrentView] = useState('chapters'); // 'chapters' or 'scenes'
  const [selectedChapter, setSelectedChapter] = useState(null);

  if (!book) return null;

  const handleChapterSelect = (chapter) => {
    setSelectedChapter(chapter);
    setCurrentView('scenes');
  };

  const handleBackToChapters = () => {
    setCurrentView('chapters');
    setSelectedChapter(null);
  };
  
  const handleSceneSelect = (scene) => {
    onSelectLevel(scene);
  };

  const renderChaptersView = () => (
    <>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-1">{book.title}</h2>
        <p className="text-gray-400">{book.description}</p>
      </div>
      <div className="space-y-3">
        {book.chapters.map((chapter) => (
          <button 
            key={chapter.id}
            onClick={() => handleChapterSelect(chapter)}
            className="w-full text-left p-4 bg-[#1E1E3F]/70 rounded-lg border-2 border-transparent hover:border-cyan-400 transition-all duration-300 flex justify-between items-center group"
          >
            <div>
              <p className="font-bold text-lg text-white">{chapter.title}</p>
              <p className="text-sm text-gray-400">{chapter.description}</p>
            </div>
            <i className="fa fa-arrow-right text-gray-500 group-hover:text-cyan-400 transition-colors"></i>
          </button>
        ))}
      </div>
    </>
  );

  const renderScenesView = () => (
    <>
      <div className="flex justify-between items-center mb-6">
        <button onClick={handleBackToChapters} className="flex items-center text-cyan-400 hover:text-cyan-300 transition-colors text-lg">
            <i className="fa fa-arrow-left mr-3"></i>
            返回章节
        </button>
      </div>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-1">{selectedChapter.title}</h2>
        <p className="text-gray-400">{selectedChapter.description}</p>
      </div>
      <div className="space-y-3">
        {selectedChapter.scenes.map((scene) => (
          <button
            key={scene.id}
            onClick={() => handleSceneSelect(scene)}
            className="w-full text-left p-4 bg-[#1E1E3F]/70 rounded-lg border-l-4 border-cyan-400 hover:bg-[#2a2a50] transition-all duration-300"
          >
            <p className="font-semibold text-lg text-white">{scene.title.replace(/"/g, '')}</p>
          </button>
        ))}
      </div>
    </>
  );


  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-lg flex justify-center items-center z-40 p-4 animate-fade-in" onClick={onClose}>
      <div 
        className="w-full max-w-2xl bg-[#14142B] rounded-2xl p-8 border border-cyan-500/20 shadow-xl shadow-cyan-500/10 text-white relative"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors text-2xl">
            <i className="fa fa-times-circle"></i>
        </button>
        
        {currentView === 'chapters' ? renderChaptersView() : renderScenesView()}

      </div>
    </div>
  );
};

export default BookLevelsModal; 