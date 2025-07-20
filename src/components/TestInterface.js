import React, { useState } from 'react';
import styled from 'styled-components';
import { analyzeHand } from '../utils/pokerLogic';

const TestContainer = styled.div`
  background: #f8f9fa;
  border: 2px solid #dee2e6;
  border-radius: 10px;
  padding: 20px;
  margin: 20px 0;
`;

const TestSection = styled.div`
  margin-bottom: 20px;
`;

const TestButton = styled.button`
  background: #007bff;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 5px;
  margin: 5px;
  cursor: pointer;
  
  &:hover {
    background: #0056b3;
  }
`;

const ResultDisplay = styled.div`
  background: white;
  border: 1px solid #ddd;
  border-radius: 5px;
  padding: 15px;
  margin-top: 10px;
  font-family: monospace;
  white-space: pre-wrap;
`;

const TestInterface = () => {
  const [testResults, setTestResults] = useState([]);

  const runTest = async (testName, handData) => {
    try {
      const startTime = Date.now();
      const result = await analyzeHand(handData);
      const endTime = Date.now();
      
      const testResult = {
        name: testName,
        input: handData,
        output: result,
        duration: endTime - startTime,
        timestamp: new Date().toISOString()
      };
      
      setTestResults(prev => [testResult, ...prev.slice(0, 9)]); // Keep last 10 results
    } catch (error) {
      setTestResults(prev => [{
        name: testName,
        input: handData,
        error: error.message,
        timestamp: new Date().toISOString()
      }, ...prev.slice(0, 9)]);
    }
  };

  const predefinedTests = [
    {
      name: "Pocket Aces Pre-Flop",
      data: {
        holeCards: ['A♠', 'A♥'],
        flop: [],
        turn: null,
        river: null,
        numPlayers: 6,
        position: 'button',
        potSize: 100,
        betSize: 0
      }
    },
    {
      name: "AK Suited Pre-Flop",
      data: {
        holeCards: ['A♠', 'K♠'],
        flop: [],
        turn: null,
        river: null,
        numPlayers: 6,
        position: 'late',
        potSize: 100,
        betSize: 0
      }
    },
    {
      name: "Set on Flop",
      data: {
        holeCards: ['A♠', 'A♥'],
        flop: ['A♦', 'K♣', 'Q♠'],
        turn: null,
        river: null,
        numPlayers: 6,
        position: 'button',
        potSize: 100,
        betSize: 0
      }
    },
    {
      name: "Flush Draw",
      data: {
        holeCards: ['A♠', 'K♠'],
        flop: ['Q♠', 'J♠', '2♥'],
        turn: null,
        river: null,
        numPlayers: 6,
        position: 'middle',
        potSize: 100,
        betSize: 20
      }
    },
    {
      name: "Open-Ended Straight Draw",
      data: {
        holeCards: ['J♠', '10♥'],
        flop: ['9♦', '8♣', '2♠'],
        turn: null,
        river: null,
        numPlayers: 6,
        position: 'middle',
        potSize: 100,
        betSize: 15
      }
    },
    {
      name: "Weak Hand Early Position",
      data: {
        holeCards: ['2♠', '7♥'],
        flop: ['K♦', 'Q♣', 'J♠'],
        turn: null,
        river: null,
        numPlayers: 6,
        position: 'early',
        potSize: 100,
        betSize: 50
      }
    },
    {
      name: "Big Blind Defense",
      data: {
        holeCards: ['J♠', '10♥'],
        flop: ['K♦', 'Q♣', '2♠'],
        turn: null,
        river: null,
        numPlayers: 6,
        position: 'big_blind',
        potSize: 150,
        betSize: 50
      }
    },
    {
      name: "Heads Up Premium",
      data: {
        holeCards: ['A♠', 'K♥'],
        flop: ['Q♦', 'J♣', '10♠'],
        turn: null,
        river: null,
        numPlayers: 2,
        position: 'button',
        potSize: 100,
        betSize: 0
      }
    },
    {
      name: "Complete Board - Full House",
      data: {
        holeCards: ['A♠', 'A♥'],
        flop: ['K♦', 'K♣', 'J♠'],
        turn: '10♠',
        river: '9♠',
        numPlayers: 6,
        position: 'button',
        potSize: 100,
        betSize: 0
      }
    },
    {
      name: "River Decision - Top Pair",
      data: {
        holeCards: ['A♠', 'K♥'],
        flop: ['A♦', '7♣', '2♠'],
        turn: '10♠',
        river: 'Q♠',
        numPlayers: 6,
        position: 'middle',
        potSize: 200,
        betSize: 50
      }
    },
    {
      name: "Small Pocket Pair",
      data: {
        holeCards: ['5♠', '5♥'],
        flop: ['K♦', 'Q♣', 'J♠'],
        turn: null,
        river: null,
        numPlayers: 6,
        position: 'middle',
        potSize: 100,
        betSize: 0
      }
    },
    {
      name: "Suited Connectors",
      data: {
        holeCards: ['J♠', '10♠'],
        flop: ['9♦', '8♣', '2♠'],
        turn: null,
        river: null,
        numPlayers: 6,
        position: 'late',
        potSize: 100,
        betSize: 0
      }
    }
  ];

  const runAllTests = async () => {
    for (const test of predefinedTests) {
      await runTest(test.name, test.data);
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <TestContainer>
      <h3>🧪 Texas Hold'em Test Interface</h3>
      
      <TestSection>
        <h4>Texas Hold'em Test Scenarios</h4>
        <div>
          {predefinedTests.map((test, index) => (
            <TestButton
              key={index}
              onClick={() => runTest(test.name, test.data)}
            >
              {test.name}
            </TestButton>
          ))}
        </div>
        <div style={{ marginTop: '10px' }}>
          <TestButton onClick={runAllTests} style={{ background: '#28a745' }}>
            Run All Texas Hold'em Tests
          </TestButton>
          <TestButton onClick={clearResults} style={{ background: '#dc3545' }}>
            Clear Results
          </TestButton>
        </div>
      </TestSection>

      <TestSection>
        <h4>Test Results ({testResults.length})</h4>
        {testResults.map((result, index) => (
          <ResultDisplay key={index}>
            <strong>{result.name}</strong> - {result.timestamp}
            {result.duration && ` (${result.duration}ms)`}
            {result.error ? (
              <div style={{ color: 'red' }}>
                <strong>Error:</strong> {result.error}
              </div>
            ) : (
              <div>
                <strong>Input:</strong> {JSON.stringify(result.input, null, 2)}
                <strong>Output:</strong> {JSON.stringify(result.output, null, 2)}
              </div>
            )}
          </ResultDisplay>
        ))}
        {testResults.length === 0 && (
          <p style={{ color: '#666', fontStyle: 'italic' }}>
            No test results yet. Run a Texas Hold'em test scenario to see results here.
          </p>
        )}
      </TestSection>
    </TestContainer>
  );
};

export default TestInterface; 