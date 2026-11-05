import React, { useState, useEffect, createContext, useContext } from 'react';
import styled, { ThemeProvider } from 'styled-components';
import CardSelector from './components/CardSelector';
import BoardSelector from './components/BoardSelector';
import GameInfo from './components/GameInfo';
import HandSituation from './components/HandSituation';
import AIRecommendation from './components/AIRecommendation';
import TestInterface from './components/TestInterface';
import HandHistory from './components/HandHistory';
import EquityCalculator from './components/EquityCalculator';

import { analyzeGTORange, getGTOAdvice } from './utils/pokerLogic';
import { mockAnalyzeHand } from './mockBackend';

// Theme context (kept so components can read the theme through useTheme)
const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Same palette as the leaderboard: forest green, ivory, restrained gold
const theme = {
  primary: '#124a2d',
  secondary: '#1b5e3a',
  background: '#faf5ea',
  surface: '#faf5ea',
  text: '#1f2a22',
  textSecondary: '#5f675f',
  border: '#e8dfca',
  shadow: 'rgba(60, 50, 20, 0.08)',
  success: '#1b5e3a',
  warning: '#c39a2e',
  error: '#b5483a',
  cardBackground: '#fffdf8',
  cardBorder: '#e8dfca',
  inputBackground: '#ffffff',
  inputBorder: '#d9cfb4',
  buttonPrimary: '#124a2d',
  buttonSecondary: '#f3ecd9',
  buttonText: '#ffffff',
  buttonTextSecondary: '#5f675f',
  serif: "Georgia, 'Times New Roman', serif"
};

// Settings that rarely change are remembered in the browser
const TABLE_KEY = 'pkb.tableSettings';
const DEFAULT_TABLE = { numPlayers: 6, smallBlind: 10, bigBlind: 20, stackSize: 1000 };

const loadTable = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(TABLE_KEY));
    if (saved && typeof saved === 'object') return { ...DEFAULT_TABLE, ...saved };
  } catch (e) {
    // storage unavailable or corrupted: use defaults
  }
  return DEFAULT_TABLE;
};

const focusRing = props => `
  &:focus-visible {
    outline: 3px solid ${props.theme.warning};
    outline-offset: 2px;
  }
`;

const AppContainer = styled.div`
  min-height: 100vh;
  background: ${props => props.theme.background};
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color: ${props => props.theme.text};
`;

const TopBar = styled.header`
  background: #0d3b24;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 22px;
  padding: 12px 20px;
  flex-wrap: wrap;
`;

const Brand = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;

  svg { width: 30px; height: 30px; fill: ${props => props.theme.warning}; }
`;

const BrandName = styled.h1`
  font-family: ${props => props.theme.serif};
  font-size: 1.6rem;
  font-weight: 700;
  margin: 0;
`;

const Tagline = styled.span`
  font-family: ${props => props.theme.serif};
  font-style: italic;
  color: #e9e2cf;
  font-size: 0.98rem;
  padding-left: 18px;
  border-left: 1px solid rgba(255, 255, 255, 0.2);

  @media (max-width: 900px) {
    display: none;
  }
`;

const Nav = styled.nav`
  margin-left: auto;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const TabButton = styled.button`
  background: ${props => props.$active ? props.theme.warning : 'transparent'};
  color: ${props => props.$active ? '#1f2a22' : '#fff'};
  border: 1.5px solid ${props => props.$active ? props.theme.warning : 'rgba(255, 255, 255, 0.35)'};
  padding: 7px 16px;
  border-radius: 999px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.92rem;

  &:hover {
    background: ${props => props.$active ? props.theme.warning : 'rgba(255, 255, 255, 0.12)'};
  }
  ${focusRing}
`;

const Page = styled.main`
  max-width: 1600px;
  margin: 0 auto;
  padding: 20px 16px 36px;

  @media (max-width: 768px) {
    padding: 14px 10px 28px;
  }
`;

const MainGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr);
  gap: 18px;
  align-items: start;

  @media (max-width: 960px) {
    grid-template-columns: 1fr;
  }
`;

const Column = styled.div`
  display: flex;
  flex-direction: column;
  gap: 18px;
  min-width: 0;
`;

const Section = styled.section`
  background: ${props => props.theme.cardBackground};
  border: 1px solid ${props => props.theme.cardBorder};
  border-radius: 12px;
  padding: 16px 18px;
  box-shadow: 0 2px 8px ${props => props.theme.shadow};

  h2 {
    font-family: ${props => props.theme.serif};
    color: ${props => props.theme.primary};
    font-size: 1.35rem;
    margin: 0 0 12px;
  }
`;

const SectionNote = styled.p`
  color: ${props => props.theme.textSecondary};
  font-size: 0.88rem;
  margin: -6px 0 12px;
`;

const ErrorBanner = styled.div`
  background: ${props => props.theme.error};
  color: white;
  padding: 12px 16px;
  border-radius: 10px;
  margin-bottom: 16px;
  text-align: center;
  font-weight: 600;
`;

const DevToggle = styled.button`
  position: fixed;
  bottom: 16px;
  right: 16px;
  background: #b5483a;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 25px;
  cursor: pointer;
  font-weight: 600;
  font-size: 12px;
  z-index: 1000;
`;

const SPADE_PATH = 'M12 1.5C12 1.5 3.5 8.6 3.5 14a4.3 4.3 0 0 0 7.2 3.2c-.2 2.2-1 3.7-2.6 4.8h7.8c-1.6-1.1-2.4-2.6-2.6-4.8A4.3 4.3 0 0 0 20.5 14C20.5 8.6 12 1.5 12 1.5z';

function App() {
  const [holeCards, setHoleCards] = useState([]);
  const [flop, setFlop] = useState([]);
  const [turn, setTurn] = useState(null);
  const [river, setRiver] = useState(null);
  const [table, setTable] = useState(loadTable);
  const [position, setPosition] = useState('middle');
  const [potSize, setPotSize] = useState(30);
  const [betSize, setBetSize] = useState(0);
  const [preflopAction, setPreflopAction] = useState('open');
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showTestInterface, setShowTestInterface] = useState(false);
  const [activeTab, setActiveTab] = useState('main');

  const { numPlayers, smallBlind, bigBlind, stackSize } = table;
  const updateTable = (patch) => setTable(prev => ({ ...prev, ...patch }));

  useEffect(() => {
    try {
      localStorage.setItem(TABLE_KEY, JSON.stringify(table));
    } catch (e) {
      // storage unavailable: settings just won't be remembered
    }
  }, [table]);

  // No flop means preflop: there is nothing to toggle.
  const isPreflop = flop.length < 3;

  const handleAnalyze = async () => {
    if (holeCards.length !== 2) {
      setErrorMessage('Please select exactly 2 hole cards.');
      return;
    }

    setErrorMessage('');
    setLoading(true);
    try {
      const result = await mockAnalyzeHand({
        holeCards,
        flop: isPreflop ? [] : flop,
        turn: isPreflop ? null : turn,
        river: isPreflop ? null : river,
        numPlayers,
        position,
        potSize,
        betSize,
        preflopAction,
        smallBlind,
        bigBlind,
        stackSize
      });

      // Add GTO range analysis from frontend
      const gtoRange = analyzeGTORange(holeCards, position);
      result.gtoRange = gtoRange;
      result.gtoAdvice = getGTOAdvice(gtoRange, position, isPreflop);

      setRecommendation(result);
    } catch (error) {
      console.error('Error analyzing hand:', error);
      setErrorMessage('Something went wrong analyzing this hand. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'main', label: 'Analysis' },
    { id: 'equity', label: 'Equity calculator' },
    { id: 'history', label: 'Hand history' }
  ];

  return (
    <ThemeContext.Provider value={{ isDarkMode: false, toggleTheme: () => {}, theme }}>
      <ThemeProvider theme={theme}>
        <AppContainer>
          <TopBar>
            <Brand>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d={SPADE_PATH} /></svg>
              <BrandName>P_Ker Buddy</BrandName>
            </Brand>
            <Tagline>Hand advice from GTO ranges and equity simulation</Tagline>
            <Nav aria-label="Sections">
              {tabs.map(tab => (
                <TabButton
                  key={tab.id}
                  $active={activeTab === tab.id}
                  aria-pressed={activeTab === tab.id}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </TabButton>
              ))}
              <TabButton
                key="leaderboard"
                $active={false}
                onClick={() => window.open(`${process.env.PUBLIC_URL || ''}/results.html`, '_blank', 'noopener')}
              >
                Leaderboard
              </TabButton>
            </Nav>
          </TopBar>

          {process.env.NODE_ENV === 'development' && (
            <DevToggle onClick={() => setShowTestInterface(!showTestInterface)}>
              {showTestInterface ? 'Hide tests' : 'Show tests'}
            </DevToggle>
          )}

          <Page>
            {errorMessage && <ErrorBanner role="alert">{errorMessage}</ErrorBanner>}

            {showTestInterface && <TestInterface />}

            {activeTab === 'main' && (
              <>
                <GameInfo
                  numPlayers={numPlayers}
                  smallBlind={smallBlind}
                  bigBlind={bigBlind}
                  stackSize={stackSize}
                  onNumPlayersChange={(v) => updateTable({ numPlayers: v })}
                  onSmallBlindChange={(v) => updateTable({ smallBlind: v })}
                  onBigBlindChange={(v) => updateTable({ bigBlind: v })}
                  onStackSizeChange={(v) => updateTable({ stackSize: v })}
                />

                <MainGrid>
                  <Column>
                    <Section>
                      <h2>Your Hole Cards</h2>
                      <CardSelector
                        selectedCards={holeCards}
                        onCardsChange={setHoleCards}
                        maxCards={2}
                        title=""
                        blockedCards={[...flop, turn, river].filter(Boolean)}
                      />
                    </Section>

                    <Section>
                      <h2>Community Cards</h2>
                      <SectionNote>
                        {isPreflop ? 'No flop yet, so this is a preflop hand. Add the flop to get postflop advice.' : 'Postflop: advice uses your real hand and the board.'}
                      </SectionNote>
                      <BoardSelector
                        flop={flop}
                        turn={turn}
                        river={river}
                        onFlopChange={setFlop}
                        onTurnChange={setTurn}
                        onRiverChange={setRiver}
                        blockedCards={holeCards}
                      />
                    </Section>
                  </Column>

                  <Column>
                    <Section>
                      <h2>This Hand</h2>
                      <HandSituation
                        position={position}
                        potSize={potSize}
                        betSize={betSize}
                        isPreflop={isPreflop}
                        preflopAction={preflopAction}
                        onPreflopActionChange={setPreflopAction}
                        onPositionChange={setPosition}
                        onPotSizeChange={setPotSize}
                        onBetSizeChange={setBetSize}
                      />
                    </Section>

                    <Section>
                      <h2>Recommendation</h2>
                      <AIRecommendation
                        recommendation={recommendation}
                        loading={loading}
                        onAnalyze={handleAnalyze}
                        canAnalyze={holeCards.length === 2}
                        isPreflop={isPreflop}
                      />
                    </Section>
                  </Column>
                </MainGrid>
              </>
            )}

            {activeTab === 'equity' && (
              <EquityCalculator />
            )}

            {activeTab === 'history' && (
              <HandHistory
                currentHand={recommendation}
                onLoadHand={(hand) => {
                  // Load hand data back into the main interface
                  setHoleCards(hand.holeCards || []);
                  setFlop(hand.flop || []);
                  setTurn(hand.turn || null);
                  setRiver(hand.river || null);
                  updateTable({ numPlayers: hand.numPlayers || numPlayers });
                  setPosition(hand.position || 'middle');
                  setPotSize(hand.potSize || 100);
                  setBetSize(hand.betSize || 0);
                  setActiveTab('main');
                }}
              />
            )}
          </Page>
        </AppContainer>
      </ThemeProvider>
    </ThemeContext.Provider>
  );
}

export default App;
