// src/DownloadSection.jsx
import React from 'react';
import './DownloadSection.css';

function DownloadSection() {
  const programs = [
    { 
      name: 'Windows Version', 
      file: '/programs/windows.exe.txt',  // ← .txt для демо
      icon: '🪟',
      description: 'Для Windows 10/11'
    },
    { 
      name: 'MacOS Version', 
      file: '/programs/macos.dmg.txt',    // ← .txt для демо
      icon: '🍎',
      description: 'Для macOS 11+'
    },
    { 
      name: 'Linux Version', 
      file: '/programs/linux.deb.txt',    // ← .txt для демо
      icon: '🐧',
      description: 'Для Ubuntu/Debian'
    }
  ];

  return (
    <div className="download-section">
      <h2>📥 Скачать приложение</h2>
      <p style={{color: '#666', marginBottom: '2rem'}}>
        Демо-версия для хакатона. В реальном приложении здесь были бы настоящие программы.
      </p>
      <div className="programs-grid">
        {programs.map((program, index) => (
          <a 
            key={index}
            href={program.file} 
            download
            className="program-card"
          >
            <span className="program-icon">{program.icon}</span>
            <span className="program-name">{program.name}</span>
            <span style={{fontSize: '0.8rem', color: '#666'}}>
              {program.description}
            </span>
            <span className="download-arrow">⬇️</span>
          </a>
        ))}
      </div>
    </div>
  );
}

export default DownloadSection;