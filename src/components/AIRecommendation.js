import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  min-height: 160px;
`;

const Message = styled.div`
  text-align: center;
  color: ${props => props.theme.textSecondary};
  padding: 28px 16px 12px;
  font-style: italic;
`;

const ActionDisplay = styled.div`
  text-align: center;
  margin-bottom: 14px;
`;

const ActionLabel = styled.div`
  display: inline-block;
  padding: 10px 40px;
  border-radius: 10px;
  font-family: ${props => props.theme.serif};
  font-size: 2rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #fff;

  &.fold { background: ${props => props.theme.error}; }
  &.call, &.check { background: ${props => props.theme.warning}; color: #1f2a22; }
  &.raise, &.bet { background: ${props => props.theme.primary}; }
`;

const Sizing = styled.div`
  margin-top: 10px;
  font-weight: 700;
  font-size: 1.15rem;
  color: ${props => props.theme.primary};

  span {
    display: block;
    font-weight: 400;
    font-size: 0.88rem;
    color: ${props => props.theme.textSecondary};
  }
`;

const Stats = styled.dl`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  gap: 10px;
  margin: 0 0 12px;
`;

const Stat = styled.div`
  background: ${props => props.theme.buttonSecondary};
  border-radius: 8px;
  padding: 10px 12px;
  text-align: center;

  dt {
    color: ${props => props.theme.textSecondary};
    font-size: 0.74rem;
    font-weight: 700;
    letter-spacing: 0.6px;
    text-transform: uppercase;
    margin-bottom: 4px;
  }

  dd {
    margin: 0;
    font-weight: 700;
    font-size: 1.15rem;
    color: ${props => props.theme.text};
  }
`;

const Why = styled.div`
  border-left: 3px solid ${props => props.theme.warning};
  background: ${props => props.theme.buttonSecondary};
  border-radius: 6px;
  padding: 10px 14px;
  line-height: 1.5;
  font-size: 0.95rem;

  strong {
    display: block;
    color: ${props => props.theme.primary};
    margin-bottom: 4px;
  }
`;

const Footnote = styled.p`
  color: ${props => props.theme.textSecondary};
  font-size: 0.8rem;
  margin: 8px 2px 0;
`;

const AnalyzeButton = styled.button`
  background: ${props => props.theme.buttonPrimary};
  color: ${props => props.theme.buttonText};
  border: none;
  padding: 12px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 700;
  width: 100%;
  margin-top: 14px;

  &:hover { background: ${props => props.theme.secondary}; }
  &:focus-visible { outline: 3px solid ${props => props.theme.warning}; outline-offset: 2px; }
`;

// A "call" with nothing to call is a check, and a "raise" with nothing to raise is a bet.
const actionLabel = (recommendation, isPreflop) => {
  const { action, facingBet } = recommendation;
  if (isPreflop || facingBet) return action;
  if (action === 'call') return 'check';
  if (action === 'raise') return 'bet';
  return action;
};

const AIRecommendation = ({ recommendation, loading, onAnalyze, canAnalyze, isPreflop }) => {
  if (loading) {
    return (
      <Container>
        <Message role="status">Analyzing your hand...</Message>
      </Container>
    );
  }

  if (!recommendation) {
    return (
      <Container>
        <Message>
          {canAnalyze
            ? 'Ready when you are.'
            : 'Select your two hole cards to get a recommendation.'}
        </Message>
        <AnalyzeButton onClick={onAnalyze} disabled={!canAnalyze} style={!canAnalyze ? { opacity: 0.5, cursor: 'not-allowed' } : undefined}>
          Get recommendation
        </AnalyzeButton>
      </Container>
    );
  }

  const { raiseAmount, handStrength, equity, requiredEquity, ev, reasoning, numOpponents, villainPct, draw, allIn } = recommendation;
  const label = actionLabel(recommendation, isPreflop);

  return (
    <Container>
      <ActionDisplay aria-live="polite">
        <ActionLabel className={label}>{label}</ActionLabel>
        {(label === 'raise' || label === 'bet') && raiseAmount && (
          <Sizing>
            {allIn ? 'All-in' : label === 'bet' ? 'Bet' : 'Raise to'} ${raiseAmount}
            {recommendation.bigBlind ? (
              <span>{(raiseAmount / recommendation.bigBlind).toFixed(1)} big blinds</span>
            ) : null}
          </Sizing>
        )}
      </ActionDisplay>

      <Stats>
        <Stat><dt>Hand</dt><dd>{handStrength}</dd></Stat>
        <Stat><dt>Equity</dt><dd>{equity}%</dd></Stat>
        {!isPreflop && requiredEquity != null && (
          <Stat><dt>Equity needed</dt><dd>{requiredEquity}%</dd></Stat>
        )}
        {draw && (
          <Stat><dt>Draw</dt><dd>{draw.outs} outs (~{draw.hitPct}%)</dd></Stat>
        )}
        <Stat title="Rough estimate. It assumes your bet or raise is called, so it flatters aggressive plays.">
          <dt>Rough EV</dt>
          <dd style={{ color: ev == null ? undefined : ev >= 0 ? '#1b5e3a' : '#b5483a' }}>{ev == null ? '\u2014' : `$${ev}`}</dd>
        </Stat>
      </Stats>

      <Why>
        <strong>Why</strong>
        {reasoning}
      </Why>

      {numOpponents ? (
        <Footnote>
          {villainPct
            ? `Equity is your win chance against a range that bets this size (about the top ${villainPct}% of hands)${numOpponents > 1 ? ` plus ${numOpponents - 1} random hand${numOpponents === 2 ? '' : 's'}` : ''}.`
            : `Equity is your win chance against ${numOpponents} random opponent hand${numOpponents === 1 ? '' : 's'}.`}
          {' '}Advice is a rule-of-thumb guide, not a solver.
        </Footnote>
      ) : null}

      <AnalyzeButton onClick={onAnalyze}>Re-analyze</AnalyzeButton>
    </Container>
  );
};

export default AIRecommendation;
