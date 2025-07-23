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
    # Get all players who participated (paid OR redeemed)
    all_participants = list(game_data['Name'].unique())
    
    if len(all_participants) == 0:
        continue
    
    # Get payments and redemptions
    payments = game_data[game_data['Type'] == 'payment']
    redemptions = game_data[game_data['Type'] == 'redeem']
    
    # Determine winners and split status
    winners = []
    is_split = False
    notes = ""
    
    if len(redemptions) > 0:
        winners_data = []
        for _, redemption in redemptions.iterrows():
            winner_name = redemption['Name']
            amount_won = abs(redemption['Amount'])
            winners_data.append((winner_name, amount_won))
        
        # Sort winners by amount won (highest first)
        winners_data.sort(key=lambda x: x[1], reverse=True)
        
        # Check for split pots
        if len(winners_data) > 1 and winners_data[0][1] == winners_data[1][1]:
            # Even split
            is_split = True
            split_winners = [w[0] for w in winners_data if w[1] == winners_data[0][1]]
            winners = split_winners
            notes = f"Split pot with {', '.join(split_winners)} (0.5 win each)"
        else:
            # Single winner or uneven split
            if len(winners_data) > 1:
                # Uneven split - technical winner
                technical_winner = winners_data[0][0]
                other_winners = [w[0] for w in winners_data[1:]]
                winners = [technical_winner]
                notes = f"Technical winner: {technical_winner}. Other winners: {', '.join(other_winners)}"
            else:
                # Single winner
                winners = [winners_data[0][0]]
    else:
        # No redemptions - game might be incomplete
        continue
    
    # Create row with all players
    row = {
        'date': date.strftime('%d/%m/%Y'),
        'winners': ', '.join(winners),
        'split': is_split,
        'notes': notes
    }
    
    # Add all players to separate columns
    for i, player in enumerate(all_participants, 1):
        row[f'player{i}'] = player
    
    # Fill remaining player columns with empty strings
    for i in range(len(all_participants) + 1, 9):  # Up to player8
        row[f'player{i}'] = ''
    
    poker_results.append(row)

# Create DataFrame and save
results_df = pd.DataFrame(poker_results)

print(f"\nConverted {len(results_df)} game results")
print(f"Date range: {results_df['date'].min()} to {results_df['date'].max()}")

# Save to CSV
results_df.to_csv('docs/data/historical_results.csv', index=False)
print(f"\nSaved to docs/data/historical_results.csv")

# Show sample of results
print("\nSample results:")
print(results_df.head(10)) 