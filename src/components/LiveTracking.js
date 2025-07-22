import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { liveTrackingAPI } from '../utils/liveTrackingAPI';

// Styled Components
const LiveTrackingContainer = styled.div`
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 12px;
  padding: 20px;
  margin: 20px 0;
  border: 2px solid #00d4ff;
  box-shadow: 0 8px 32px rgba(0, 212, 255, 0.3);
`;

const ExplanationSection = styled.div`
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  border-left: 4px solid #00d4ff;
`;

const ExplanationTitle = styled.h3`
  color: #00d4ff;
  margin: 0 0 15px 0;
  font-size: 1.3rem;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const ExplanationText = styled.p`
  color: #ccc;
  line-height: 1.6;
  margin: 10px 0;
  font-size: 0.95rem;
`;

const FeatureList = styled.ul`
  color: #ccc;
  margin: 15px 0;
  padding-left: 20px;
  
  li {
    margin: 8px 0;
    line-height: 1.5;
  }
`;

const UseCaseGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin: 20px 0;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const UseCaseCard = styled.div`
  background: rgba(0, 0, 0, 0.4);
  border-radius: 8px;
  padding: 15px;
  border: 1px solid #333;
  
  h4 {
    color: #00d4ff;
    margin: 0 0 10px 0;
    font-size: 1.1rem;
  }
  
  p {
    color: #ccc;
    font-size: 0.9rem;
    line-height: 1.5;
    margin: 8px 0;
  }
`;

const LiveHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const LiveTitle = styled.h3`
  color: #00d4ff;
  margin: 0;
  font-size: 1.4rem;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const LiveIndicator = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${props => props.isLive ? '#00ff88' : '#ff4444'};
  animation: ${props => props.isLive ? 'pulse 2s infinite' : 'none'};
  
  @keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.5; }
    100% { opacity: 1; }
  }
`;

const ConnectionStatus = styled.div`
  color: ${props => props.connected ? '#00ff88' : '#ff4444'};
  font-size: 0.9rem;
  font-weight: 500;
`;

const HandDisplay = styled.div`
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  padding: 15px;
  margin: 15px 0;
  border-left: 4px solid #00d4ff;
`;

const HandInfo = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-bottom: 15px;
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
`;

const InfoLabel = styled.span`
  color: #888;
  font-size: 0.8rem;
  margin-bottom: 4px;
`;

const InfoValue = styled.span`
  color: #fff;
  font-weight: 600;
  font-size: 1rem;
`;

const CardsContainer = styled.div`
  display: flex;
  gap: 10px;
  margin: 10px 0;
  flex-wrap: wrap;
`;

const Card = styled.div`
  width: 50px;
  height: 70px;
  background: linear-gradient(135deg, #fff 0%, #f0f0f0 100%);
  border: 2px solid #333;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.2rem;
  color: ${props => props.suit === '♥' || props.suit === '♦' ? '#ff4444' : '#000'};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  position: relative;
  
  &::after {
    content: '${props => props.suit}';
    position: absolute;
    bottom: 4px;
    right: 4px;
    font-size: 0.8rem;
  }
`;

const ActionButton = styled.button`
  background: linear-gradient(135deg, #00d4ff 0%, #0099cc 100%);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  margin: 5px;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 212, 255, 0.4);
  }
  
  &:disabled {
    background: #666;
    cursor: not-allowed;
    transform: none;
  }
`;

const LogContainer = styled.div`
  background: rgba(0, 0, 0, 0.5);
  border-radius: 8px;
  padding: 15px;
  margin-top: 15px;
  max-height: 200px;
  overflow-y: auto;
`;

const LogEntry = styled.div`
  color: #ccc;
  font-size: 0.85rem;
  margin: 5px 0;
  padding: 5px;
  border-left: 2px solid #00d4ff;
  
  &.error {
    color: #ff4444;
    border-left-color: #ff4444;
  }
  
  &.success {
    color: #00ff88;
    border-left-color: #00ff88;
  }
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 15px;
  margin: 15px 0;
`;

const StatCard = styled.div`
  background: rgba(0, 0, 0, 0.3);
  border-radius: 6px;
  padding: 10px;
  text-align: center;
`;

const StatValue = styled.div`
  color: #00d4ff;
  font-size: 1.5rem;
  font-weight: bold;
`;

const StatLabel = styled.div`
  color: #888;
  font-size: 0.8rem;
  margin-top: 4px;
`;

// Mock API endpoints for demonstration
const API_ENDPOINTS = {
  pokerStars: 'https://api.pokerstars.com/v1/hands/live',
  openHands: 'https://api.openhands.com/v1/stream',
  pokerTracker: 'https://api.pokertracker.com/v1/live-data',
  mockAPI: 'https://jsonplaceholder.typicode.com/posts' // For demo purposes
};

const LiveTracking = ({ 
  isTracking, 
  currentHand, 
  stats, 
  onStartTracking, 
  onStopTracking, 
  onHandDataReceived, 
  onLoadToAnalysis 
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionLog, setConnectionLog] = useState([]);
  const [selectedAPI, setSelectedAPI] = useState('mock');
  const trackingRef = useRef(null);

  // Add log entry
  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setConnectionLog(prev => [{
      id: Date.now(),
      message: `[${timestamp}] ${message}`,
      type
    }, ...prev.slice(0, 19)]); // Keep last 20 entries
  };

  // Connect to API using the live tracking service
  const connectToAPI = async () => {
    addLog(`Connecting to ${selectedAPI}...`, 'info');
    
    try {
      const result = await liveTrackingAPI.connect(selectedAPI);
      
      setIsConnected(true);
      addLog(result.message, 'success');
      
      // Start receiving live data
      startLiveDataStream();
      
      // Notify parent that tracking has started
      onStartTracking(selectedAPI);
      
    } catch (error) {
      addLog(`Failed to connect to ${selectedAPI}: ${error.message}`, 'error');
      setIsConnected(false);
    }
  };

  // Disconnect from API
  const disconnectFromAPI = () => {
    if (trackingRef.current) {
      trackingRef.current.stop();
      trackingRef.current = null;
    }
    
    const result = liveTrackingAPI.disconnect();
    
    setIsConnected(false);
    onStopTracking();
    addLog(result.message, 'info');
  };

  // Start live data stream
  const startLiveDataStream = () => {
    addLog('Starting live hand tracking...', 'info');
    
    try {
      trackingRef.current = liveTrackingAPI.startTracking(
        (handData) => {
          // Notify parent component
          if (onHandDataReceived) {
            onHandDataReceived(handData);
          }
          
          addLog(`New hand received: ${handData.holeCards.join(' ')} - ${handData.result}`, 'success');
        },
        (error) => {
          addLog(`Error receiving hand data: ${error.message}`, 'error');
        }
      );
    } catch (error) {
      addLog(`Failed to start tracking: ${error.message}`, 'error');
      onStopTracking();
    }
  };

  // Parse card for display
  const parseCard = (card) => {
    const rank = card.slice(0, -1);
    const suit = card.slice(-1);
    return { rank, suit };
  };

  useEffect(() => {
    return () => {
      if (trackingRef.current) {
        trackingRef.current.stop();
      }
    };
  }, []);

  return (
    <LiveTrackingContainer>
      {/* Explanation Section */}
      <ExplanationSection>
        <ExplanationTitle>📡 How Live Tracking Works</ExplanationTitle>
        
        <ExplanationText>
          <strong>Live tracking connects to online poker platforms</strong> to provide real-time analysis and advice while you play. It's like having a professional poker coach watching your games and giving instant recommendations.
        </ExplanationText>

        <UseCaseGrid>
          <UseCaseCard>
            <h4>🎮 Online Poker Integration</h4>
            <p><strong>Connect to your online poker sessions:</strong></p>
            <FeatureList>
              <li>Links to PokerStars, 888 Poker, PartyPoker</li>
              <li>Streams your hands in real-time</li>
              <li>Provides instant AI recommendations</li>
              <li>Tracks your performance automatically</li>
              <li>Monitors multiple online tables</li>
            </FeatureList>
            <p><em>Perfect for online cash games, tournaments, and sit & go's</em></p>
          </UseCaseCard>

          <UseCaseCard>
            <h4>📊 Manual Hand Analysis</h4>
            <p><strong>Use the tool for any poker situation:</strong></p>
            <FeatureList>
              <li>Input any hand manually</li>
              <li>Get AI analysis instantly</li>
              <li>Learn proper strategy</li>
              <li>Practice decision making</li>
              <li>Review past hands</li>
            </FeatureList>
            <p><em>Great for learning, practice, and live poker review</em></p>
          </UseCaseCard>
        </UseCaseGrid>

        <ExplanationText>
          <strong>💡 Pro Tip:</strong> Even if you're not playing online, you can use the main analysis tab to get professional advice on any hand. Just select your cards, position, and game situation for instant AI recommendations!
        </ExplanationText>
      </ExplanationSection>

      <LiveHeader>
        <LiveTitle>
          <LiveIndicator isLive={isTracking} />
          Live Hand Tracking
        </LiveTitle>
        <ConnectionStatus connected={isConnected}>
          {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
        </ConnectionStatus>
      </LiveHeader>

      {/* API Selection */}
      <div style={{ marginBottom: '15px' }}>
        <InfoLabel>Select API Provider:</InfoLabel>
        <select 
          value={selectedAPI} 
          onChange={(e) => setSelectedAPI(e.target.value)}
          style={{
            background: '#333',
            color: '#fff',
            border: '1px solid #555',
            borderRadius: '4px',
            padding: '8px',
            marginRight: '10px'
          }}
        >
          <option value="mock">Demo API (Mock Data)</option>
          <option value="pokerstars">PokerStars API</option>
          <option value="openhands">OpenHands API</option>
          <option value="pokertracker">PokerTracker API</option>
          <option value="pokerok">PokerOK API</option>
        </select>
      </div>

      {/* Connection Controls */}
      <div style={{ marginBottom: '15px' }}>
        {!isConnected ? (
          <ActionButton onClick={connectToAPI}>
            🔌 Connect to API
          </ActionButton>
        ) : (
          <>
            <ActionButton onClick={disconnectFromAPI} style={{ background: 'linear-gradient(135deg, #ff4444 0%, #cc0000 100%)' }}>
              🔌 Disconnect
            </ActionButton>
            {currentHand && (
              <ActionButton 
                onClick={() => onLoadToAnalysis(currentHand)}
                style={{ background: 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)' }}
              >
                📊 Load to Analysis
              </ActionButton>
            )}
          </>
        )}
      </div>

      {/* Current Hand Display */}
      {currentHand && (
        <HandDisplay>
          <h4 style={{ color: '#00d4ff', margin: '0 0 15px 0' }}>Current Hand</h4>
          
          <HandInfo>
            <InfoItem>
              <InfoLabel>Position</InfoLabel>
              <InfoValue>{currentHand.position}</InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>Pot Size</InfoLabel>
              <InfoValue>${currentHand.potSize}</InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>Action</InfoLabel>
              <InfoValue style={{ color: currentHand.action === 'raise' ? '#00ff88' : currentHand.action === 'call' ? '#ffaa00' : '#ff4444' }}>
                {currentHand.action.toUpperCase()}
              </InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>Result</InfoLabel>
              <InfoValue style={{ color: currentHand.result === 'win' ? '#00ff88' : currentHand.result === 'lose' ? '#ff4444' : '#888' }}>
                {currentHand.result.toUpperCase()}
              </InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>Equity</InfoLabel>
              <InfoValue>{currentHand.equity}%</InfoValue>
            </InfoItem>
            <InfoItem>
              <InfoLabel>Hand Strength</InfoLabel>
              <InfoValue>{currentHand.handStrength}</InfoValue>
            </InfoItem>
          </HandInfo>

          {/* Hole Cards */}
          <div>
            <InfoLabel>Hole Cards:</InfoLabel>
            <CardsContainer>
              {currentHand.holeCards.map((card, index) => {
                const { rank, suit } = parseCard(card);
                return (
                  <Card key={index} suit={suit}>
                    {rank}
                  </Card>
                );
              })}
            </CardsContainer>
          </div>

          {/* Community Cards */}
          {currentHand.communityCards.length > 0 && (
            <div>
              <InfoLabel>Community Cards:</InfoLabel>
              <CardsContainer>
                {currentHand.communityCards.map((card, index) => {
                  const { rank, suit } = parseCard(card);
                  return (
                    <Card key={index} suit={suit}>
                      {rank}
                    </Card>
                  );
                })}
              </CardsContainer>
            </div>
          )}
        </HandDisplay>
      )}

      {/* Statistics */}
      <StatsContainer>
        <StatCard>
          <StatValue>{stats.handsProcessed}</StatValue>
          <StatLabel>Hands Processed</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>${stats.totalWinnings}</StatValue>
          <StatLabel>Total Winnings</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{stats.winRate.toFixed(1)}%</StatValue>
          <StatLabel>Win Rate</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>${stats.avgPotSize}</StatValue>
          <StatLabel>Avg Pot Size</StatLabel>
        </StatCard>
      </StatsContainer>

      {/* Connection Log */}
      <LogContainer>
        <h4 style={{ color: '#00d4ff', margin: '0 0 10px 0' }}>Connection Log</h4>
        {connectionLog.map(entry => (
          <LogEntry key={entry.id} className={entry.type}>
            {entry.message}
          </LogEntry>
        ))}
        {connectionLog.length === 0 && (
          <LogEntry>No connection activity yet...</LogEntry>
        )}
      </LogContainer>
    </LiveTrackingContainer>
  );
};

export default LiveTracking; 