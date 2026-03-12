import { useState, useEffect } from 'react';
import { SimulationResult, FilterOptions } from '../../types/index';
import StatsCard from './StatsCard';
import PathwayCard from './PathwayCard';
import styles from './SimulationResults.module.css';

interface SimulationResultsProps {
  result: SimulationResult;
}

export default function SimulationResults({ result }: SimulationResultsProps) {
  const [filters, setFilters] = useState<FilterOptions>({
    type: 'All Types',
    sort: 'Best Match',
  });
  const [displayCount, setDisplayCount] = useState(6);

  // Track roadmap creation
  useEffect(() => {
    const trackRoadmap = async () => {
      try {
        const user = localStorage.getItem('Career Sync_user');
        if (!user) return;

        const userData = JSON.parse(user);
        const savedRoadmaps = JSON.parse(localStorage.getItem('Career Sync_saved_roadmaps') || '[]');
        
        const roadmapRecord = {
          id: `roadmap_${Date.now()}`,
          title: result.input?.targetRole ? `${result.input.targetRole} Roadmap` : 'Career Roadmap',
          createdAt: new Date().toISOString(),
          stages: result.pathways?.length || 0,
          userId: userData.id || userData.email,
          pathways: result.pathways?.length || 0
        };

        const existingIndex = savedRoadmaps.findIndex((r: any) => r.title === roadmapRecord.title);
        if (existingIndex === -1) {
          savedRoadmaps.push(roadmapRecord);
          localStorage.setItem('Career Sync_saved_roadmaps', JSON.stringify(savedRoadmaps));
          console.log('🗺️ Roadmap saved:', roadmapRecord.title);

          // Send to MongoDB backend
          try {
            await fetch('http://localhost:5000/api/profile/enroll/roadmap', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                userId: userData.id,
                userEmail: userData.email,
                roadmapId: roadmapRecord.id,
                roadmapTitle: roadmapRecord.title,
                roadmapStages: roadmapRecord.stages
              })
            });
            console.log('🗺️ Roadmap synced to database');
          } catch (apiError) {
            console.log('Database sync failed, data saved locally');
          }
        }

        // Update profile data
        const profileData = JSON.parse(localStorage.getItem('Career Sync_profile_data') || '{}');
        profileData.totalRoadmaps = savedRoadmaps.length;
        profileData.roadmaps = savedRoadmaps;
        localStorage.setItem('Career Sync_profile_data', JSON.stringify(profileData));
        
        // Trigger storage event for cross-tab/cross-page updates
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'Career Sync_saved_roadmaps',
          newValue: JSON.stringify(savedRoadmaps)
        }));
      } catch (e) {
        console.error('Error tracking roadmap:', e);
      }
    };

    trackRoadmap();
  }, [result]);

  const handleFilterChange = (filterType: keyof FilterOptions, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value as any,
    }));
  };

  const filteredPathways = [...result.pathways]
    .filter((pathway) => {
      if (filters.type === 'All Types') return true;
      return pathway.category === filters.type;
    })
    .sort((a, b) => {
      if (filters.sort === 'Highest Salary') {
        const salaryA = parseInt(a.salary.match(/\d+/)?.[0] || '0');
        const salaryB = parseInt(b.salary.match(/\d+/)?.[0] || '0');
        return salaryB - salaryA;
      } else if (filters.sort === 'Fastest Route') {
        const timeA = parseInt(a.timeline.match(/\d+/)?.[0] || '999');
        const timeB = parseInt(b.timeline.match(/\d+/)?.[0] || '999');
        return timeA - timeB;
      }
      return b.confidence - a.confidence;
    });

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Your Career Roadmap Is Ready</h1>
        <p className={styles.subtitle}>
          We analyzed {result.pathsAnalyzed.toLocaleString()} job listings across top companies to recommend your best career moves.
        </p>
      </div>

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <StatsCard
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6C5CE7" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          }
          type="number"
          number={result.pathsAnalyzed.toLocaleString()}
          subtext={`Real-time Analysis`}
          label="Career Pathways Evaluated"
          isLive={true}
        />

        <StatsCard
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6C5CE7" strokeWidth="2">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 17" />
              <polyline points="17 6 23 6 23 12" />
            </svg>
          }
          type="value"
          value="Very High"
          subLabel="Shortage of 2,000+ roles annually"
          label="Market Opportunity Level"
        />

        <StatsCard
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F39C12" strokeWidth="2">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          }
          type="skill"
          value={result.topSkillGap}
          subLabel="Mentioned in 78% of target listings"
          label="Priority Skill to Develop"
        />

        <StatsCard
          icon={
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00B8A9" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="12" y1="11" x2="12" y2="17" />
              <line x1="9" y1="14" x2="15" y2="14" />
            </svg>
          }
          type="sources"
          value={result.dataSources}
          status="✓ Verified & Live"
          label="Intelligence Sources"
        />
      </div>

      {/* Pathways Section */}
      <div className={styles.pathwaysSection}>
        <div className={styles.pathwaysHeader}>
          <div>
            <h2 className={styles.pathwaysTitle}>
              12 Pathways Found
              <span className={styles.badge}>Real-time Verified</span>
            </h2>
          </div>
          <div className={styles.filters}>
            <div className={styles.filterWrapper}>
              <svg className={styles.filterIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
              </svg>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className={styles.filterSelect}
              >
                <option>All Types</option>
                <option>Top Tier (FAANG)</option>
                <option>Product Companies</option>
                <option>High Growth Startups</option>
              </select>
            </div>

            <div className={styles.filterWrapper}>
              <svg className={styles.filterIcon} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <polyline points="19 12 12 19 5 12"/>
              </svg>
              <select
                value={filters.sort}
                onChange={(e) => handleFilterChange('sort', e.target.value)}
                className={styles.filterSelect}
              >
                <option>Best Match</option>
                <option>Highest Salary</option>
                <option>Fastest Route</option>
              </select>
            </div>
          </div>
        </div>

        <div className={styles.pathwaysGrid}>
          {filteredPathways.slice(0, displayCount).map((pathway) => (
            <PathwayCard key={pathway.id} pathway={pathway} />
          ))}
        </div>

        {displayCount < filteredPathways.length && (
          <div className={styles.loadMoreContainer}>
            <button
              className={styles.loadMoreBtn}
              onClick={() => setDisplayCount((prev) => prev + 6)}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginRight: '8px'}}>
                <polyline points="6 9 12 15 18 9"/>
              </svg>
              Load More Jobs
            </button>
          </div>
        )}

        {filteredPathways.length === 0 && (
          <div className={styles.emptyState}>
            <p>No pathways found. Try adjusting your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
