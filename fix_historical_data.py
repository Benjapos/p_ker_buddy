import pandas as pd
from datetime import datetime

# Read the Excel file
df = pd.read_excel('docs/data/monopoly at mord_08-10-04_23-07-2025.xlsx')

# Convert date column to datetime if it's not already
if not pd.api.types.is_datetime64_any_dtype(df['date']):
    df['date'] = pd.to_datetime(df['date'])

print(f"Total rows: {len(df)}")
print(f"Date range: {df['date'].min()} to {df['date'].max()}")
print(f"Players: {sorted(df['Name'].unique())}")

# Group by date to identify games
df['date_only'] = df['date'].dt.date
game_groups = df.groupby('date_only')

poker_results = []

for date, game_data in game_groups:
    # Get all players who paid (participants)
    payments = game_data[game_data['Type'] == 'payment']
    redemptions = game_data[game_data['Type'] == 'redeem']
    
    if len(payments) == 0:
        continue
    
    # Get all participants
    participants = list(payments['Name'].unique())
    
    # Calculate total pot
    total_pot = payments['Amount'].sum()
    
    # Handle redemptions (winners)
    if len(redemptions) > 0:
        winners = []
        for _, redemption in redemptions.iterrows():
            winner_name = redemption['Name']
            amount_won = abs(redemption['Amount'])
            winners.append((winner_name, amount_won))
        
        # Sort winners by amount won (highest first)
        winners.sort(key=lambda x: x[1], reverse=True)
        
        # Check for split pots
        if len(winners) > 1 and winners[0][1] == winners[1][1]:
            # Even split - multiple winners with same amount
            split_winners = [w[0] for w in winners if w[1] == winners[0][1]]
            
            # Give 0.5 wins to each split winner
            for winner in split_winners:
                poker_results.append({
                    'Date': date.strftime('%d/%m/%Y'),
                    'Player': winner,
                    'Result': 'Win',
                    'Amount': winners[0][1],
                    'Notes': f'Split pot with {", ".join(split_winners)} (0.5 win each)'
                })
            
            # Add all other participants as losses
            for participant in participants:
                if participant not in split_winners:
                    poker_results.append({
                        'Date': date.strftime('%d/%m/%Y'),
                        'Player': participant,
                        'Result': 'Loss',
                        'Amount': 0,
                        'Notes': ''
                    })
        else:
            # Single winner or uneven split
            winner_name, amount_won = winners[0]
            
            # Check if there are multiple winners with different amounts
            if len(winners) > 1:
                # Uneven split - determine technical winner
                technical_winner = winner_name  # Highest amount
                other_winners = [w[0] for w in winners[1:]]
                
                # Add main winner
                poker_results.append({
                    'Date': date.strftime('%d/%m/%Y'),
                    'Player': winner_name,
                    'Result': 'Win',
                    'Amount': amount_won,
                    'Notes': f'Technical winner. Other winners: {", ".join(other_winners)}'
                })
                
                # Add other winners
                for other_winner, other_amount in winners[1:]:
                    poker_results.append({
                        'Date': date.strftime('%d/%m/%Y'),
                        'Player': other_winner,
                        'Result': 'Win',
                        'Amount': other_amount,
                        'Notes': f'Partial win. Technical winner: {technical_winner}'
                    })
            else:
                # Single winner
                poker_results.append({
                    'Date': date.strftime('%d/%m/%Y'),
                    'Player': winner_name,
                    'Result': 'Win',
                    'Amount': amount_won,
                    'Notes': ''
                })
            
            # Add all other participants as losses
            for participant in participants:
                if participant != winner_name:
                    poker_results.append({
                        'Date': date.strftime('%d/%m/%Y'),
                        'Player': participant,
                        'Result': 'Loss',
                        'Amount': 0,
                        'Notes': ''
                    })
    else:
        # No redemptions found - might be incomplete data
        continue

# Create DataFrame and save
results_df = pd.DataFrame(poker_results)

print(f"\nConverted {len(results_df)} game results")
print(f"Date range: {results_df['Date'].min()} to {results_df['Date'].max()}")

# Save to CSV
results_df.to_csv('docs/data/historical_results.csv', index=False)
print(f"\nSaved to docs/data/historical_results.csv")

# Show sample of results
print("\nSample results:")
print(results_df.head(20)) 