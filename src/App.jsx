import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  Map as MapIcon, 
  List, 
  Trophy, 
  TrendingUp, 
  Calendar, 
  ArrowUpRight, 
  Search, 
  CheckCircle2,
  Mountain as MountainIcon,
  Users,
  Flag,
  X,
  ChevronRight,
  Info,
  MapPin
} from 'lucide-react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker
} from "react-simple-maps";
import hikingData from './data/hiking_data.json';
import './index.css';

const geoUrl = "https://raw.githubusercontent.com/southkorea/southkorea-maps/master/kostat/2013/json/skorea_provinces_geo.json";

const App = () => {
  const [activeTab, setActiveTab] = useState('home'); 
  const [selectedMountain, setSelectedMountain] = useState(null);
  const [hoveredMountain, setHoveredMountain] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [searchTerm, setSearchTerm] = useState('');

  const mountains = hikingData.mountains || [];
  const logs = hikingData.logs || [];

  const stats = useMemo(() => {
    const completed = mountains.filter(m => m.climb_date && m.climb_date !== 'null').length;
    const totalDistance = logs.reduce((acc, log) => acc + (parseFloat(log.distance) || 0), 0);
    const totalElevation = logs.reduce((acc, log) => acc + (parseFloat(log.elevation_gain) || 0), 0);
    return {
      completed,
      total: mountains.length,
      distance: totalDistance.toFixed(1),
      elevation: Math.round(totalElevation).toLocaleString(),
      percent: Math.round((completed / mountains.length) * 100)
    };
  }, [mountains, logs]);

  const filteredMountains = useMemo(() => {
    return mountains.filter(m => 
      (m.name || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
      (m.province || "").toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [mountains, searchTerm]);

  const handleMouseMove = (e) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
  };

  return (
    <div className="app-container" onMouseMove={handleMouseMove}>
      <AnimatePresence mode="wait">
        {activeTab === 'home' && (
          <HomeSection key="home" stats={stats} recentLogs={logs.slice(0, 3)} />
        )}
        {activeTab === 'map' && (
          <MapSection 
            key="map" 
            mountains={mountains} 
            onSelect={setSelectedMountain} 
            onHover={setHoveredMountain}
          />
        )}
        {activeTab === 'list' && (
          <ListSection 
            key="list" 
            mountains={filteredMountains} 
            searchTerm={searchTerm} 
            setSearchTerm={setSearchTerm}
            onSelect={setSelectedMountain} 
          />
        )}
      </AnimatePresence>

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

      <AnimatePresence>
        {selectedMountain && (
          <BottomSheet 
            mountain={selectedMountain} 
            onClose={() => setSelectedMountain(null)} 
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {hoveredMountain && (
          <MapTooltip 
            mountain={hoveredMountain} 
            position={mousePosition} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const BottomNav = ({ activeTab, setActiveTab }) => (
  <nav className="bottom-nav">
    <NavItem 
      id="home" 
      label="홈" 
      icon={<Home size={20} />} 
      isActive={activeTab === 'home'} 
      onClick={() => setActiveTab('home')} 
    />
    <NavItem 
      id="map" 
      label="지도" 
      icon={<MapIcon size={20} />} 
      isActive={activeTab === 'map'} 
      onClick={() => setActiveTab('map')} 
    />
    <NavItem 
      id="list" 
      label="목록" 
      icon={<List size={20} />} 
      isActive={activeTab === 'list'} 
      onClick={() => setActiveTab('list')} 
    />
  </nav>
);

const NavItem = ({ label, icon, isActive, onClick }) => (
  <button className={`nav-item ${isActive ? 'active' : ''}`} onClick={onClick}>
    <div className="nav-icon-container">
      {icon}
    </div>
    <span>{label}</span>
  </button>
);

const HomeSection = ({ stats, recentLogs }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="content-section"
  >
    <header className="home-header">
      <h1>안녕하세요 👋</h1>
      <p>오늘도 건강한 하루 되세요.</p>
    </header>

    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '1rem' }}>전체 달성률</h3>
        <span style={{ fontWeight: 700, color: 'var(--primary)' }}>{stats.percent}%</span>
      </div>
      <div className="progress-container">
        <motion.div 
          className="progress-bar" 
          initial={{ width: 0 }}
          animate={{ width: `${stats.percent}%` }}
        />
      </div>
      <div className="stat-grid" style={{ marginTop: '1.5rem' }}>
        <div className="stat-item">
          <span className="stat-label">완료</span>
          <span className="stat-value">{stats.completed}</span>
        </div>
        <div className="stat-item">
          <span className="stat-label">누적 거리</span>
          <span className="stat-value">{stats.distance}km</span>
        </div>
      </div>
    </div>

    <h3 style={{ margin: '1.5rem 0 1rem' }}>최근 등반 기록</h3>
    {recentLogs.map((log, i) => (
      <div key={i} className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <div className="mountain-icon" style={{ borderRadius: '50%' }}>
          <Calendar size={18} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600 }}>{log.location}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{log.date ? log.date.split('T')[0] : '기록 없음'}</div>
        </div>
        <div style={{ fontWeight: 700, color: 'var(--primary)' }}>+{log.distance}km</div>
      </div>
    ))}
  </motion.div>
);

const MapSection = ({ mountains, onSelect, onHover }) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 1.05 }}
    className="map-page"
  >
    <div className="map-full-container">
      <div className="map-svg-container">
        <ComposableMap
          projection="geoMercator"
          projectionConfig={{ rotate: [-127.5, -36.0, 0], scale: 6500 }}
          style={{ width: "100%", height: "100%" }}
        >
          <Geographies geography={geoUrl}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="#fdfdfd"
                  stroke="#efeff4"
                  strokeWidth={0.5}
                  style={{ 
                    default: { outline: "none" }, 
                    hover: { fill: "#f2f2f7", outline: "none" } 
                  }}
                />
              ))
            }
          </Geographies>

          {mountains.map((m, idx) => {
            const isCompleted = m.climb_date && m.climb_date !== 'null';
            if (!m.lng || !m.lat) return null;
            return (
              <Marker 
                key={idx} 
                coordinates={[m.lng, m.lat]} 
                onClick={() => onSelect(m)}
                onMouseEnter={() => onHover(m)}
                onMouseLeave={() => onHover(null)}
              >
                <motion.g 
                  initial={{ scale: 0 }} 
                  animate={{ scale: 1 }} 
                  whileHover={{ scale: 1.5 }}
                  className="marker"
                >
                  {isCompleted ? (
                    <Flag size={14} className="marker-flag" style={{ transform: 'translate(-7px, -14px)' }} />
                  ) : (
                    <circle r={3} className="marker-dot" style={{ fill: '#d1d1d6', opacity: 0.6 }} />
                  )}
                </motion.g>
              </Marker>
            );
          })}
        </ComposableMap>
      </div>
    </div>
  </motion.div>
);

const ListSection = ({ mountains, searchTerm, setSearchTerm, onSelect }) => (
  <motion.div 
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    className="content-section"
  >
    <div className="list-header">
      <div style={{ position: 'relative' }}>
        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
        <input 
          className="search-input" 
          placeholder="산 이름 검색" 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
    </div>

    {mountains.map((m, i) => (
      <div 
        key={i} 
        className={`mountain-row ${m.climb_date && m.climb_date !== 'null' ? 'completed' : ''}`}
        onClick={() => onSelect(m)}
      >
        <div className="mountain-icon">
          {m.climb_date && m.climb_date !== 'null' ? <Trophy size={18} /> : <MountainIcon size={18} />}
        </div>
        <div className="mountain-row-info">
          <div className="mountain-row-name">{m.name}</div>
          <div className="mountain-row-meta">{m.province} • {m.height}m</div>
        </div>
        <ChevronRight size={18} color="var(--border)" />
      </div>
    ))}
  </motion.div>
);

const MapTooltip = ({ mountain, position }) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.8 }}
    className="map-tooltip"
    style={{ 
      left: position.x + 20, 
      top: position.y - 60 
    }}
  >
    <h4>{mountain.name}</h4>
    <div className="tooltip-meta">
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <MapPin size={12} /> {mountain.province}
      </div>
      <div>해발 {mountain.height}m</div>
      {mountain.climb_date && mountain.climb_date !== 'null' ? (
        <div className="badge" style={{ background: '#e8f7ed', color: 'var(--success)' }}>등반 완료</div>
      ) : (
        <div className="badge">미등정</div>
      )}
    </div>
  </motion.div>
);

const BottomSheet = ({ mountain, onClose }) => {
  const isCompleted = mountain.climb_date && mountain.climb_date !== 'null';
  
  return (
    <div className="overlay-backdrop" onClick={onClose}>
      <motion.div 
        className="bottom-sheet"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="sheet-handle" />
        <button onClick={onClose} style={{ position: 'absolute', right: '24px', top: '24px', background: 'var(--bg-page)', border: 'none', borderRadius: '50%', padding: '8px' }}>
          <X size={20} />
        </button>

        <h2 className="sheet-title">{mountain.name}</h2>
        
        <div className="sheet-content">
          <div style={{ display: 'flex', gap: '8px' }}>
            <span className="badge">{mountain.province}</span>
            <span className="badge">{mountain.height}m</span>
            {isCompleted && <span className="badge" style={{ background: '#e8f7ed', color: 'var(--success)' }}>등반 완료</span>}
          </div>

          <div className="info-item">
            <Info className="info-icon" size={20} />
            <div className="info-text">
              <h4>선정 사유</h4>
              <p>{mountain.reason || '정보 없음'}</p>
            </div>
          </div>

          {isCompleted && (
            <>
              <div className="info-item">
                <Calendar className="info-icon" size={20} />
                <div className="info-text">
                  <h4>등반일</h4>
                  <p>{mountain.climb_date.split('T')[0]}</p>
                </div>
              </div>
              <div className="info-item">
                <Users className="info-icon" size={20} />
                <div className="info-text">
                  <h4>동반자</h4>
                  <p>{mountain.companions || '없음'}</p>
                </div>
              </div>
            </>
          )}

          <motion.button 
            whileTap={{ scale: 0.95 }}
            style={{
              marginTop: '1rem',
              padding: '1rem',
              borderRadius: '16px',
              border: 'none',
              background: 'var(--primary)',
              color: 'white',
              fontWeight: 700,
              fontSize: '1rem'
            }}
            onClick={onClose}
          >
            확인
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default App;
