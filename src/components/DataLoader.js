import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { loadPreflopData, loadPostflopData, getDataSummary, parseCSV } from '../utils/csvParser';

const DataLoaderContainer = styled.div`
  background: #2a2a2a;
  border-radius: 8px;
  padding: 20px;
  margin: 20px 0;
  border: 1px solid #444;
`;

const DataStatus = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
`;

const StatusIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
`;

const StatusDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${props => props.loaded ? '#4CAF50' : '#f44336'};
`;

const LoadButton = styled.button`
  background: #4CAF50;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  
  &:hover {
    background: #45a049;
  }
  
  &:disabled {
    background: #666;
    cursor: not-allowed;
  }
`;

const DataSummary = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-top: 15px;
`;

const SummaryCard = styled.div`
  background: #333;
  padding: 12px;
  border-radius: 6px;
  text-align: center;
`;

const SummaryNumber = styled.div`
  font-size: 24px;
  font-weight: bold;
  color: #4CAF50;
  margin-bottom: 4px;
`;

const SummaryLabel = styled.div`
  font-size: 12px;
  color: #ccc;
`;

const DataLoader = ({ onDataLoaded }) => {
  const [dataStatus, setDataStatus] = useState({
    preflop: false,
    postflop: false
  });
  const [summary, setSummary] = useState({
    preflopHands: 0,
    postflopHands: 0,
    totalHands: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      console.log('Loading CSV data chunks...');
      
      // Load preflop data chunks
      let preflopData = [];
      let preflopLoaded = false;
      
      // Try to load all preflop chunks (1-10)
      for (let i = 1; i <= 10; i++) {
        try {
          const response = await fetch(`/data/10_000_Preflop_Scenarios_with_Conditional_Actions_chunk_${i}.csv`);
          if (response.ok) {
            const content = await response.text();
            const chunkData = parseCSV(content);
            preflopData = preflopData.concat(chunkData);
            console.log(`✅ Loaded preflop chunk ${i} (${chunkData.length} hands)`);
            preflopLoaded = true;
          } else {
            console.log(`⚠️ Preflop chunk ${i} not found, stopping at chunk ${i-1}`);
            break;
          }
        } catch (error) {
          console.log(`⚠️ Error loading preflop chunk ${i}:`, error.message);
          break;
        }
      }
      
      if (preflopLoaded && preflopData.length > 0) {
        loadPreflopData(preflopData.map(row => Object.values(row).join(',')).join('\n'));
        setDataStatus(prev => ({ ...prev, preflop: true }));
        console.log(`✅ Loaded ${preflopData.length} preflop hands from chunks`);
      } else {
        // Fallback to sample data
        console.log('Falling back to sample preflop data...');
        const sampleResponse = await fetch('/data/sample_preflop.csv');
        if (sampleResponse.ok) {
          const sampleContent = await sampleResponse.text();
          loadPreflopData(sampleContent);
          setDataStatus(prev => ({ ...prev, preflop: true }));
          console.log('✅ Sample preflop data loaded as fallback');
        }
      }

      // Load postflop data chunks
      let postflopData = [];
      let postflopLoaded = false;
      
      // Try to load all postflop chunks (1-11)
      for (let i = 1; i <= 11; i++) {
        try {
          const response = await fetch(`/data/10_000_Postflop_Scenarios_with_Recommended_Actions_chunk_${i}.csv`);
          if (response.ok) {
            const content = await response.text();
            const chunkData = parseCSV(content);
            postflopData = postflopData.concat(chunkData);
            console.log(`✅ Loaded postflop chunk ${i} (${chunkData.length} hands)`);
            postflopLoaded = true;
          } else {
            console.log(`⚠️ Postflop chunk ${i} not found, stopping at chunk ${i-1}`);
            break;
          }
        } catch (error) {
          console.log(`⚠️ Error loading postflop chunk ${i}:`, error.message);
          break;
        }
      }
      
      if (postflopLoaded && postflopData.length > 0) {
        loadPostflopData(postflopData.map(row => Object.values(row).join(',')).join('\n'));
        setDataStatus(prev => ({ ...prev, postflop: true }));
        console.log(`✅ Loaded ${postflopData.length} postflop hands from chunks`);
      }

      // Update summary
      const dataSummary = getDataSummary();
      setSummary(dataSummary);
      console.log('Data summary:', dataSummary);

      // Notify parent component
      if (onDataLoaded) {
        onDataLoaded(dataSummary);
      }

    } catch (error) {
      console.error('❌ Error loading CSV data:', error);
    }
  };

  const reloadData = () => {
    setDataStatus({ preflop: false, postflop: false });
    setSummary({ preflopHands: 0, postflopHands: 0, totalHands: 0 });
    loadData();
  };

  return (
    <DataLoaderContainer>
      <DataStatus>
        <div>
          <h3 style={{ margin: '0 0 10px 0', color: '#fff' }}>📊 Hand Data Status</h3>
          <div style={{ display: 'flex', gap: '20px' }}>
            <StatusIndicator>
              <StatusDot loaded={dataStatus.preflop} />
              <span>Preflop Data</span>
            </StatusIndicator>
            <StatusIndicator>
              <StatusDot loaded={dataStatus.postflop} />
              <span>Postflop Data</span>
            </StatusIndicator>
          </div>
        </div>
        <LoadButton onClick={reloadData} disabled={dataStatus.preflop && dataStatus.postflop}>
          {dataStatus.preflop && dataStatus.postflop ? '✅ Loaded' : '🔄 Reload'}
        </LoadButton>
      </DataStatus>

      {(dataStatus.preflop || dataStatus.postflop) && (
        <DataSummary>
          <SummaryCard>
            <SummaryNumber>{summary.preflopHands.toLocaleString()}</SummaryNumber>
            <SummaryLabel>Preflop Hands</SummaryLabel>
          </SummaryCard>
          <SummaryCard>
            <SummaryNumber>{summary.postflopHands.toLocaleString()}</SummaryNumber>
            <SummaryLabel>Postflop Hands</SummaryLabel>
          </SummaryCard>
        </DataSummary>
      )}

      {dataStatus.preflop && dataStatus.postflop && (
        <div style={{ marginTop: '15px', padding: '10px', background: '#4CAF50', borderRadius: '4px', color: 'white', fontSize: '14px' }}>
          ✅ All data loaded successfully! Recommendations now include real hand outcomes.
        </div>
      )}
    </DataLoaderContainer>
  );
};

export default DataLoader; 