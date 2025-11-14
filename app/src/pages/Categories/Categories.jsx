import { useState } from 'react';
import { Link } from 'react-router-dom';
import './Categories.css';

const Categories = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);

  const categories = [
    {
      id: 'games',
      name: 'Игры',
      icon: '🎮',
      color: 'linear-gradient(135deg, #FF2D55 0%, #FF6B9D 100%)',
      count: 245,
      apps: [
        { id: 1, name: 'Racing Master', icon: '🏎️', rating: 4.8, downloads: '50M+' },
        { id: 2, name: 'Adventure Quest', icon: '⚔️', rating: 4.7, downloads: '30M+' },
        { id: 3, name: 'Puzzle Mania', icon: '🧩', rating: 4.9, downloads: '25M+' },
      ]
    },
    {
      id: 'social',
      name: 'Социальные',
      icon: '💬',
      color: 'linear-gradient(135deg, #5856D6 0%, #8E8FFA 100%)',
      count: 156,
      apps: [
        { id: 4, name: 'Chat Connect', icon: '💭', rating: 4.6, downloads: '100M+' },
        { id: 5, name: 'Social Hub', icon: '🌐', rating: 4.7, downloads: '80M+' },
      ]
    },
    {
      id: 'entertainment',
      name: 'Развлечения',
      icon: '🎬',
      color: 'linear-gradient(135deg, #FF9500 0%, #FFB84D 100%)',
      count: 189,
      apps: [
        { id: 6, name: 'Video Stream', icon: '📺', rating: 4.8, downloads: '200M+' },
        { id: 7, name: 'Movie Guide', icon: '🎥', rating: 4.5, downloads: '15M+' },
      ]
    },
    {
      id: 'productivity',
      name: 'Продуктивность',
      icon: '⚡',
      color: 'linear-gradient(135deg, #34C759 0%, #5EDB77 100%)',
      count: 312,
      apps: [
        { id: 8, name: 'Task Manager', icon: '✅', rating: 4.9, downloads: '40M+' },
        { id: 9, name: 'Cloud Notes', icon: '📝', rating: 4.8, downloads: '35M+' },
        { id: 10, name: 'Calendar Pro', icon: '📅', rating: 4.7, downloads: '28M+' },
      ]
    },
    {
      id: 'photo',
      name: 'Фото и видео',
      icon: '📸',
      color: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      count: 167,
      apps: [
        { id: 11, name: 'Photo Editor', icon: '🖼️', rating: 4.8, downloads: '45M+' },
      ]
    },
    {
      id: 'health',
      name: 'Здоровье',
      icon: '💪',
      color: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      count: 234,
      apps: [
        { id: 12, name: 'Fitness Tracker', icon: '🏃', rating: 4.9, downloads: '60M+' },
        { id: 13, name: 'Meditation', icon: '🧘', rating: 4.7, downloads: '22M+' },
      ]
    },
    {
      id: 'education',
      name: 'Образование',
      icon: '🌍',
      color: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      count: 278,
      apps: [
        { id: 14, name: 'Language Learn', icon: '📚', rating: 4.8, downloads: '70M+' },
      ]
    },
    {
      id: 'music',
      name: 'Музыка',
      icon: '🎵',
      color: 'linear-gradient(135deg, #FA709A 0%, #FEE140 100%)',
      count: 145,
      apps: [
        { id: 15, name: 'Music Streaming', icon: '🎧', rating: 4.9, downloads: '150M+' },
      ]
    },
  ];

  const handleCategoryClick = (categoryId) => {
    setSelectedCategory(selectedCategory === categoryId ? null : categoryId);
  };

  return (
    <div className="categories-page">
      <div className="categories-content">
        <section className="categories-intro glass-card">
          <h1>Категории приложений</h1>
          <p>Исследуйте тысячи приложений в разных категориях</p>
        </section>

        <div className="categories-grid">
          {categories.map((category) => (
            <div key={category.id} className="category-section">
              <div
                className="category-card glass-card"
                onClick={() => handleCategoryClick(category.id)}
              >
                <div className="category-header" style={{ background: category.color }}>
                  <span className="category-icon-large">{category.icon}</span>
                </div>
                <div className="category-body">
                  <h2 className="category-title">{category.name}</h2>
                  <p className="category-count">{category.count} приложений</p>
                  <button className="explore-btn">
                    {selectedCategory === category.id ? '△ Свернуть' : '▽ Показать'}
                  </button>
                </div>
              </div>

              {selectedCategory === category.id && (
                <div className="category-apps">
                  {category.apps.map((app) => (
                    <Link
                      to={`/app/${app.id}`}
                      key={app.id}
                      className="category-app-item glass-card"
                    >
                      <div className="category-app-icon">{app.icon}</div>
                      <div className="category-app-info">
                        <h4>{app.name}</h4>
                        <div className="category-app-meta">
                          <span>⭐ {app.rating}</span>
                          <span>📥 {app.downloads}</span>
                        </div>
                      </div>
                      <button className="mini-download-btn">Скачать</button>
                    </Link>
                  ))}
                  <Link to="/search" className="view-all-btn glass-card">
                    Показать все приложения →
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Categories;

