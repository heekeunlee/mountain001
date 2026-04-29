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
  MapPin,
  Sparkles,
  Flower2,
  Award,
  ArrowUpCircle
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

// Detailed Seasonal Recommendations
const seasonalData = {
  1: [
    { name: "태백산", reason: "환상적인 눈꽃 축제와 천년의 주목 군락지가 빚어내는 설경이 압권입니다.", rank: 1 },
    { name: "한라산", reason: "영실코스의 눈부신 설경과 백록담의 장엄한 겨울 풍경을 만날 수 있습니다.", rank: 2 },
    { name: "선자령", reason: "백두대간의 능선을 따라 펼쳐지는 끝없는 설원과 풍력발전기가 이국적입니다.", rank: 3 }
  ],
  2: [
    { name: "소백산", reason: "칼바람 속에서도 꿋꿋이 피어난 은빛 상고대와 눈꽃 터널이 환상적입니다.", rank: 1 },
    { name: "덕유산", reason: "곤돌라를 타고 편하게 올라 즐기는 향적봉의 설경은 가족 산행으로 최고입니다.", rank: 2 }
  ],
  3: [
    { name: "지리산", reason: "구례 산수유와 섬진강 매화가 필 무렵, 지리산의 봄 기운이 태동합니다.", rank: 1 },
    { name: "무등산", reason: "봄의 전령사 복수초와 얼레지가 피어나는 무등산의 생명력을 느껴보세요.", rank: 2 }
  ],
  4: [
    { name: "황매산", reason: "전국 최대 규모의 철쭉 군락지가 산 전체를 분홍빛으로 물들입니다.", rank: 1 },
    { name: "비슬산", reason: "참꽃(진달래) 군락지가 끝없이 펼쳐지는 능선은 4월의 백미입니다.", rank: 2 },
    { name: "가야산", reason: "벚꽃과 함께 어우러지는 해인사 소리길과 웅장한 암릉이 아름답습니다.", rank: 3 },
    { name: "관악산", reason: "진달래와 철쭉이 만개하며 도심 속에서 봄 정취를 만끽하기 가장 좋습니다.", rank: 4 }
  ],
  5: [
    { name: "바래봉", reason: "지리산 바래봉의 철쭉은 국내 최고 수준의 밀집도와 화려함을 자랑합니다.", rank: 1 },
    { name: "소백산", reason: "연분홍 철쭉이 능선을 따라 끝없이 이어지는 천상의 화원을 만날 수 있습니다.", rank: 2 }
  ],
  6: [
    { name: "설악산", reason: "신록이 우거진 공룡능선의 웅장함과 시원한 천불동 계곡이 매력적입니다.", rank: 1 },
    { name: "월출산", reason: "호남의 소금강이라 불리는 암릉과 구름다리에서 즐기는 시원한 바람이 일품입니다.", rank: 2 }
  ],
  7: [
    { name: "덕유산", reason: "무주 구천동 33경의 시원한 계곡물과 울창한 숲이 여름 산행지로 제격입니다.", rank: 1 },
    { name: "방태산", reason: "이단폭포의 시원한 물줄기와 원시림이 잘 보존된 힐링 산행지입니다.", rank: 2 }
  ],
  8: [
    { name: "오대산", reason: "울창한 전나무 숲길과 시원한 계곡이 있어 무더위를 피하기 가장 좋습니다.", rank: 1 },
    { name: "치악산", reason: "사다리병창 코스의 짜릿함과 함께 즐기는 구룡사의 시원한 계곡이 유명합니다.", rank: 2 }
  ],
  9: [
    { name: "설악산", reason: "대청봉에서 시작된 단풍이 공룡능선을 타고 내려오는 장관을 가장 먼저 봅니다.", rank: 1 },
    { name: "대둔산", reason: "금강구름다리와 삼선계단 주변으로 물드는 단풍과 기암괴석의 조화가 뛰어납니다.", rank: 2 }
  ],
  10: [
    { name: "내장산", reason: "단풍 터널과 아기단풍이 빚어내는 화려한 색채는 국내 가을 산행의 정점입니다.", rank: 1 },
    { name: "주왕산", reason: "기암절벽과 어우러진 계곡의 단풍이 마치 동양화 한 폭을 보는 듯합니다.", rank: 2 },
    { name: "북한산", reason: "화강암 암릉과 붉은 단풍이 어우러진 서울의 명산으로 가을 정취가 가득합니다.", rank: 3 }
  ],
  11: [
    { name: "민둥산", reason: "억새 꽃이 피어나는 은빛 물결의 능선이 가을 감성을 자극하는 최고의 명소입니다.", rank: 1 },
    { name: "화왕산", reason: "넓은 억새 평원과 가을 하늘이 어우러진 풍경이 사진가들에게 인기입니다.", rank: 2 }
  ],
  12: [
    { name: "마니산", reason: "한 해를 마무리하며 서해바다의 장엄한 낙조를 감상하기 가장 좋은 곳입니다.", rank: 1 },
    { name: "계방산", reason: "국내 최고의 적설량을 자랑하며, 환상적인 눈꽃 산행을 가장 먼저 즐길 수 있습니다.", rank: 2 }
  ]
};

const App = () => {
  const [activeTab, setActiveTab] = useState('home'); 
  const [selectedMountain, setSelectedMountain] = useState(null);
  const [hoveredMountain, setHoveredMountain] = useState(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [searchTerm, setSearchTerm] = useState('');

  const mountains = hikingData.mountains || [];
  const logs = hikingData.logs || [];

  const currentMonth = new Date().getMonth() + 1;
  const recommendations = seasonalData[currentMonth] || [];

  const stats = useMemo(() => {
    const completedList = mountains.filter(m => m.climb_date && m.climb_date !== 'null');
    const completed = completedList.length;
    const totalDistance = logs.reduce((acc, log) => acc + (parseFloat(log.distance) || 0), 0);
    const totalElevation = logs.reduce((acc, log) => acc + (parseFloat(log.elevation_gain) || 0), 0);
    
    // Find the highest peak among completed mountains
    const highestPeak = completedList.length > 0 
      ? completedList.reduce((max, m) => parseInt(m.height) > parseInt(max.height) ? m : max, completedList[0])
      : null;

    return {
      completed,
      total: mountains.length,
      distance: totalDistance.toFixed(1),
      elevation: Math.round(totalElevation).toLocaleString(),
      percent: Math.round((completed / mountains.length) * 100),
      highestPeak
    };
  }, [mountains, logs]);

  // Group logs by mountain and proximity in time
  const groupedLogs = useMemo(() => {
    if (!logs.length) return [];
    
    const sorted = [...logs].sort((a, b) => new Date(b.date) - new Date(a.date));
    const groups = [];
    
    sorted.forEach(log => {
      const lastGroup = groups[groups.length - 1];
      if (lastGroup && lastGroup.location === log.location) {
        const lastDate = new Date(lastGroup.date);
        const currDate = new Date(log.date);
        const diffDays = Math.abs(lastDate - currDate) / (1000 * 60 * 60 * 24);
        
        if (diffDays <= 2) {
          // Merge into last group
          lastGroup.isMerged = true;
          lastGroup.endDate = lastGroup.endDate || lastGroup.date;
          lastGroup.startDate = log.date;
          lastGroup.totalDistance = (parseFloat(lastGroup.totalDistance || lastGroup.distance) + parseFloat(log.distance)).toFixed(1);
          return;
        }
      }
      groups.push({ ...log, totalDistance: log.distance });
    });
    
    return groups;
  }, [logs]);

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
          <HomeSection key="home" stats={stats} recentLogs={groupedLogs.slice(0, 5)} />
        )}
        {activeTab === 'map' && (
          <MapSection 
            key="map" 
            mountains={mountains} 
            onSelect={setSelectedMountain} 
            onHover={setHoveredMountain}
            recommendations={recommendations}
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
        {activeTab === 'recommend' && (
          <RecommendSection 
            key="recommend" 
            recommendations={recommendations} 
            mountains={mountains} 
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
    <NavItem id="home" label="홈" icon={<Home size={18} />} isActive={activeTab === 'home'} onClick={() => setActiveTab('home')} />
    <NavItem id="map" label="지도" icon={<MapIcon size={18} />} isActive={activeTab === 'map'} onClick={() => setActiveTab('map')} />
    <NavItem id="list" label="목록" icon={<List size={18} />} isActive={activeTab === 'list'} onClick={() => setActiveTab('list')} />
    <NavItem id="recommend" label="추천" icon={<Sparkles size={18} />} isActive={activeTab === 'recommend'} onClick={() => setActiveTab('recommend')} />
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
      <h1>전국의 100대 명산 챌린지</h1>
    </header>

    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '1rem' }}>전체 달성률</h3>
        <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '1.2rem' }}>{stats.percent}%</span>
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
          <div className="stat-value">
            {stats.completed}<span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 400 }}> / {stats.total}</span>
          </div>
        </div>
        <div className="stat-item">
          <span className="stat-label">최고 고도 (기념)</span>
          <div className="stat-value" style={{ fontSize: '1.2rem' }}>
            {stats.highestPeak ? stats.highestPeak.name : '없음'}
            {stats.highestPeak && <span style={{ fontSize: '0.8rem', color: 'var(--success)', marginLeft: '4px' }}>{stats.highestPeak.height}m</span>}
          </div>
        </div>
      </div>
    </div>

    <h3 style={{ margin: '1.5rem 0 1rem' }}>최근 등반 기록</h3>
    {recentLogs.length > 0 ? recentLogs.map((log, i) => (
      <div key={i} className="card" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <div className="mountain-icon" style={{ borderRadius: '50%' }}>
          <Calendar size={18} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 600 }}>{log.location}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            {log.isMerged ? `${log.startDate.split('T')[0]} ~ ${log.date.split('T')[0]}` : log.date.split('T')[0]}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontWeight: 700, color: 'var(--primary)' }}>{log.totalDistance}km</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>누적 거리</div>
        </div>
      </div>
    )) : (
      <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>기록된 등반이 없습니다.</p>
    )}
  </motion.div>
);

const MapSection = ({ mountains, onSelect, onHover, recommendations }) => {
  const recommendNames = recommendations.map(r => r.name);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="map-page">
      <div className="map-full-container">
        <div className="map-svg-container">
          <ComposableMap
            projection="geoMercator"
            projectionConfig={{ rotate: [-127.5, -36.0, 0], scale: 9500 }} // Even more zoom
            style={{ width: "100%", height: "100%" }}
          >
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map((geo) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill="#ffffff"
                    stroke="#adb5bd" 
                    strokeWidth={0.6}
                    style={{ default: { outline: "none" }, hover: { fill: "#f8f9fa", outline: "none" } }}
                  />
                ))
              }
            </Geographies>

            {mountains.map((m, idx) => {
              const isCompleted = m.climb_date && m.climb_date !== 'null';
              const isRecommended = recommendNames.some(name => (m.name || "").includes(name));
              if (!m.lng || !m.lat) return null;
              
              return (
                <Marker key={idx} coordinates={[m.lng, m.lat]} onClick={() => onSelect(m)} onMouseEnter={() => onHover(m)} onMouseLeave={() => onHover(null)}>
                  <motion.g initial={{ scale: 0 }} animate={{ scale: 1 }} whileHover={{ scale: 1.5 }} className="marker">
                    {isRecommended ? (
                      <Flag size={18} fill="#ffcc00" stroke="#000" strokeWidth={0.5} style={{ transform: 'translate(-9px, -18px)' }} />
                    ) : isCompleted ? (
                      <Flag size={16} fill="var(--primary)" stroke="#fff" strokeWidth={0.5} style={{ transform: 'translate(-8px, -16px)' }} />
                    ) : (
                      <circle r={3.5} fill="#636366" opacity={0.8} />
                    )}
                  </motion.g>
                </Marker>
              );
            })}
          </ComposableMap>
        </div>

        {/* Map Legend */}
        <div className="map-legend" style={{ position: 'absolute', bottom: '20px', left: '20px', background: 'rgba(255,255,255,0.9)', padding: '12px', borderRadius: '12px', boxShadow: 'var(--shadow)', fontSize: '0.75rem', zIndex: 100 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Flag size={12} fill="var(--primary)" /> <span>등반 완료</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Flag size={12} fill="#ffcc00" /> <span>이달의 추천</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#636366' }}></div> <span>미답지</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const RecommendSection = ({ recommendations, mountains, onSelect }) => (
  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="content-section">
    <header className="recommend-header">
      <span className="season-badge">{new Date().getMonth() + 1}월 추천 산행지 Top {recommendations.length}</span>
      <h2>지금 꼭 가봐야 할 명산 🏆</h2>
    </header>
    {recommendations.map((rec, i) => {
      const detail = mountains.find(m => m.name.includes(rec.name));
      return (
        <div key={i} className="card" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', cursor: 'pointer' }} onClick={() => onSelect(detail)}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: i === 0 ? '#ffcc00' : '#f2f2f7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: i === 0 ? 'white' : 'var(--text-secondary)', fontWeight: 700 }}>{rec.rank}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{rec.name}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{rec.reason.substring(0, 40)}...</div>
          </div>
          <ChevronRight size={18} color="var(--border)" />
        </div>
      );
    })}
  </motion.div>
);

const ListSection = ({ mountains, searchTerm, setSearchTerm, onSelect }) => (
  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="content-section">
    <div className="list-header">
      <div style={{ position: 'relative' }}>
        <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
        <input className="search-input" placeholder="산 이름 검색" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
      </div>
    </div>
    {mountains.map((m, i) => (
      <div key={i} className={`mountain-row ${m.climb_date && m.climb_date !== 'null' ? 'completed' : ''}`} onClick={() => onSelect(m)}>
        <div className="mountain-icon">{m.climb_date && m.climb_date !== 'null' ? <Trophy size={18} /> : <MountainIcon size={18} />}</div>
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
  <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} className="map-tooltip" style={{ left: position.x + 20, top: position.y - 60 }}>
    <h4>{mountain.name}</h4>
    <div className="tooltip-meta">
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={12} /> {mountain.province}</div>
      <div>해발 {mountain.height}m</div>
    </div>
  </motion.div>
);

const BottomSheet = ({ mountain, onClose }) => {
  const isCompleted = mountain.climb_date && mountain.climb_date !== 'null';
  if (!mountain) return null;
  const currentMonth = new Date().getMonth() + 1;
  const rec = (seasonalData[currentMonth] || []).find(r => mountain.name.includes(r.name));
  return (
    <div className="overlay-backdrop" onClick={onClose}>
      <motion.div className="bottom-sheet" initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} onClick={e => e.stopPropagation()}>
        <div className="sheet-handle" />
        <button onClick={onClose} style={{ position: 'absolute', right: '24px', top: '24px', background: 'var(--bg-page)', border: 'none', borderRadius: '50%', padding: '8px' }}><X size={20} /></button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>{rec && <span className="season-badge">추천 랭킹 {rec.rank}위</span>} <span className="badge">{mountain.province}</span></div>
        <h2 className="sheet-title" style={{ marginBottom: '1.5rem' }}>{mountain.name}</h2>
        <div className="sheet-content">
          <div style={{ display: 'flex', gap: '8px' }}><span className="badge" style={{ padding: '4px 12px' }}>해발 {mountain.height}m</span> {isCompleted && <span className="badge" style={{ background: '#e8f7ed', color: 'var(--success)', padding: '4px 12px' }}>등반 완료</span>}</div>
          {rec && <div className="info-item" style={{ background: '#fff9db', padding: '1.2rem', borderRadius: '16px', border: '1px solid #ffe066' }}><Sparkles className="info-icon" size={24} color="#f08c00" /><div className="info-text"><h4 style={{ color: '#f08c00', fontSize: '0.9rem' }}>{new Date().getMonth() + 1}월 산행 테마</h4><p style={{ fontWeight: 700, fontSize: '1.1rem', marginTop: '4px' }}>{rec.reason}</p></div></div>}
          <div className="info-item"><Info className="info-icon" size={20} /><div className="info-text"><h4>명산 선정 사유</h4><p>{mountain.reason || '정보 없음'}</p></div></div>
          {isCompleted && <div style={{ background: '#f8f9fa', padding: '1.2rem', borderRadius: '16px' }}><div className="info-item" style={{ marginBottom: '1rem' }}><Calendar className="info-icon" size={20} /><div className="info-text"><h4>최근 등반일</h4><p>{mountain.climb_date.split('T')[0]}</p></div></div><div className="info-item"><Users className="info-icon" size={20} /><div className="info-text"><h4>함께한 사람</h4><p>{mountain.companions || '없음'}</p></div></div></div>}
          <motion.button whileTap={{ scale: 0.95 }} style={{ marginTop: '1rem', padding: '1.2rem', borderRadius: '20px', border: 'none', background: 'var(--primary)', color: 'white', fontWeight: 700, fontSize: '1.1rem', boxShadow: '0 8px 24px rgba(0, 122, 255, 0.25)' }} onClick={onClose}>확인</motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default App;
