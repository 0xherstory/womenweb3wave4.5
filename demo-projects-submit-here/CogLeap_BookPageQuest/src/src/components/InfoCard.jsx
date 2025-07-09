import React from 'react';

const InfoCard = () => {
  const links = [
    { name: '常见问题', icon: 'fa-question-circle' },
    { name: '关于项目', icon: 'fa-info-circle' },
    { name: '加入我们', icon: 'fa-users' },
    { name: 'DAO', icon: 'fa-cubes' },
    { name: '支持', icon: 'fa-heart' }
  ];

  return (
    <div className="bg-dark-800/60 backdrop-blur-md rounded-lg border border-neon-blue/20 p-5">
      <ul className="space-y-3">
        {links.map(link => (
          <li key={link.name}>
            <a 
              href="#" 
              className="flex items-center text-gray-300 hover:text-neon-blue transition-colors group"
            >
              <i className={`fa ${link.icon} w-6 text-center text-neon-blue/80 group-hover:text-neon-blue`}></i>
              <span className="ml-3 font-medium">{link.name}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default InfoCard; 