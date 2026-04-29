import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  MapPin, 
  TrendingUp, 
  Calendar, 
  ArrowUpRight, 
  Search, 
  CheckCircle2,
  Mountain,
  Users
} from 'lucide-react';
import hikingData from './data/hiking_data.json';
import './index.css';

const App = () => {
  const [activeTab, setActiveTab] = useState('all'); // all, completed, pending
  const [searchTerm, setSearchTerm] = useState('');

  const mountains = hikingData.mountains || [];
  const logs = hikingData.logs || [];

  const stats = useMemo(() => {
    const completed = mountains.filter(m => m.climb_date && m.climb_date !== 'nan').length;
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
    return mountains.filter(m => {
      const matchesSearch = m.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          m.province.toLowerCase().includes(searchTerm.toLowerCase());
      const isCompleted = m.climb_date && m.climb_date !== 'nan';
      
      if (activeTab === 'completed') return matchesSearch && isCompleted;
      if (activeTab === 'pending') return matchesSearch && !isCompleted;
      return matchesSearch;
    });
  }, [mountains, searchTerm, activeTab]);

  return (
    <div className="container">
      <header className="app-header">
        <div className="title-group">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Mountain Challenge
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            대한민국 100대 명산 정복 프로젝트
          </motion.p>
        </div>
        <div className="search-bar" style={{ position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
          <input 
            type="text" 
            placeholder="산 이름 또는 지역 검색"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: '0.75rem 1rem 0.75rem 2.5rem',
              borderRadius: '12px',
              border: '1px solid var(--border)',
              outline: 'none',
              width: '260px',
              fontFamily: 'var(--font-main)'
            }}
          />
        </div>
      </header>

      <div className="stats-grid">
        <StatCard 
          label="등반 완료" 
          value={stats.completed} 
          unit={`/ ${stats.total}`} 
          icon={<Trophy color="var(--primary)" />}
          progress={stats.percent}
        />
        <StatCard 
          label="총 누적 거리" 
          value={stats.distance} 
          unit="km" 
          icon={<TrendingUp color="#34c759" />}
        />
        <StatCard 
          label="총 획득 고도" 
          value={stats.elevation} 
          unit="m" 
          icon={<ArrowUpRight color="#af52de" />}
        />
      </div>

      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          전체
        </button>
        <button 
          className={`tab ${activeTab === 'completed' ? 'active' : ''}`}
          onClick={() => setActiveTab('completed')}
        >
          완료됨
        </button>
        <button 
          className={`tab ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          미답지
        </button>
      </div>

      <motion.div 
        layout
        className="mountain-grid"
      >
        <AnimatePresence mode='popLayout'>
          {filteredMountains.length > 0 ? (
            filteredMountains.map((m, idx) => (
              <MountainCard key={m.id || idx} mountain={m} />
            ))
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="empty-state"
              style={{ gridColumn: '1 / -1' }}
            >
              <Mountain size={48} style={{ marginBottom: '1rem', opacity: 0.2 }} />
              <p>검색 결과가 없습니다.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

const StatCard = ({ label, value, unit, icon, progress }) => (
  <motion.div 
    className="card stat-card"
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    whileHover={{ y: -5 }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span className="stat-label">{label}</span>
      {icon}
    </div>
    <div className="stat-value">
      {value}<span className="stat-unit">{unit}</span>
    </div>
    {progress !== undefined && (
      <div className="progress-container">
        <motion.div 
          className="progress-bar" 
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
        />
      </div>
    )}
  </motion.div>
);

const MountainCard = ({ mountain }) => {
  const isCompleted = mountain.climb_date && mountain.climb_date !== 'nan';
  
  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`card mountain-card ${isCompleted ? 'completed' : ''}`}
    >
      <div className="mountain-header">
        <div>
          <span className="badge badge-info">{mountain.province}</span>
          <h3 className="mountain-name">{mountain.name}</h3>
        </div>
        {isCompleted && <CheckCircle2 color="var(--success)" size={24} />}
      </div>
      
      <div className="mountain-info">
        <div className="badge">{mountain.height}m</div>
        {mountain.difficulty && <div className="badge">난이도: {mountain.difficulty}</div>}
      </div>

      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem', lineBreak: 'anywhere' }}>
        {mountain.reason || '정보 없음'}
      </p>

      <div className="mountain-footer">
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Calendar size={14} />
          {isCompleted ? mountain.climb_date.split('T')[0] : '미등정'}
        </div>
        {mountain.distance && mountain.distance !== 'nan' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <TrendingUp size={14} />
            {mountain.distance}km
          </div>
        )}
      </div>
      
      {mountain.companions && mountain.companions !== 'nan' && (
        <div style={{ marginTop: '12px', fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Users size={14} />
          {mountain.companions}
        </div>
      )}
    </motion.div>
  );
};

export default App;
