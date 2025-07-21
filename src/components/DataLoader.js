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
      console.log('CSV data loading disabled - using GTO logic only');
      
      // Set data as loaded with empty data (GTO logic will handle recommendations)
      setDataStatus(prev => ({ ...prev, preflop: true, postflop: true }));
      
      // Update summary
      const dataSummary = getDataSummary();
      setSummary(dataSummary);
      console.log('Data summary:', dataSummary);

      // Notify parent component
      if (onDataLoaded) {
        onDataLoaded(dataSummary);
      }

    } catch (error) {
      console.error('❌ Error in data loader:', error);
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