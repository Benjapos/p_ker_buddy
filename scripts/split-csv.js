const fs = require('fs');
const path = require('path');

// Function to split CSV file into chunks
function splitCSV(inputFile, outputDir, chunkSize = 1000) {
  console.log(`Splitting ${inputFile} into chunks of ${chunkSize} lines...`);
  
  // Read the input file
  const content = fs.readFileSync(inputFile, 'utf8');
  const lines = content.split('\n');
  
  // Get header (first line)
  const header = lines[0];
  const dataLines = lines.slice(1);
  
  // Calculate number of chunks
  const numChunks = Math.ceil(dataLines.length / chunkSize);
  console.log(`Total lines: ${dataLines.length}, Creating ${numChunks} chunks...`);
  
  // Create output directory if it doesn't exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Split into chunks
  for (let i = 0; i < numChunks; i++) {
    const start = i * chunkSize;
    const end = Math.min(start + chunkSize, dataLines.length);
    const chunkLines = dataLines.slice(start, end);
    
    // Create chunk content with header
    const chunkContent = [header, ...chunkLines].join('\n');
    
    // Create filename
    const baseName = path.basename(inputFile, '.csv');
    const chunkFileName = `${baseName}_chunk_${i + 1}.csv`;
    const outputPath = path.join(outputDir, chunkFileName);
    
    // Write chunk file
    fs.writeFileSync(outputPath, chunkContent);
    console.log(`Created: ${chunkFileName} (${chunkLines.length} lines)`);
  }
  
  console.log(`✅ Split complete! Created ${numChunks} chunks in ${outputDir}`);
  return numChunks;
}

// Main execution
async function main() {
  try {
    const dataDir = path.join(__dirname, '..', 'data');
    const publicDataDir = path.join(__dirname, '..', 'public', 'data');
    const docsDataDir = path.join(__dirname, '..', 'docs', 'data');
    
    // Split preflop data
    const preflopFile = path.join(dataDir, '10_000_Preflop_Scenarios_with_Conditional_Actions.csv');
    if (fs.existsSync(preflopFile)) {
      console.log('\n📊 Splitting preflop data...');
      const preflopChunks = splitCSV(preflopFile, publicDataDir, 1000);
      
      // Copy chunks to docs folder
      for (let i = 1; i <= preflopChunks; i++) {
        const sourceFile = path.join(publicDataDir, `10_000_Preflop_Scenarios_with_Conditional_Actions_chunk_${i}.csv`);
        const destFile = path.join(docsDataDir, `10_000_Preflop_Scenarios_with_Conditional_Actions_chunk_${i}.csv`);
        fs.copyFileSync(sourceFile, destFile);
      }
    }
    
    // Split postflop data
    const postflopFile = path.join(dataDir, '10_000_Postflop_Scenarios_with_Recommended_Actions.csv');
    if (fs.existsSync(postflopFile)) {
      console.log('\n📊 Splitting postflop data...');
      const postflopChunks = splitCSV(postflopFile, publicDataDir, 1000);
      
      // Copy chunks to docs folder
      for (let i = 1; i <= postflopChunks; i++) {
        const sourceFile = path.join(publicDataDir, `10_000_Postflop_Scenarios_with_Recommended_Actions_chunk_${i}.csv`);
        const destFile = path.join(docsDataDir, `10_000_Postflop_Scenarios_with_Recommended_Actions_chunk_${i}.csv`);
        fs.copyFileSync(sourceFile, destFile);
      }
    }
    
    console.log('\n🎉 All CSV files split successfully!');
    console.log('📁 Files created in:');
    console.log(`   - ${publicDataDir}`);
    console.log(`   - ${docsDataDir}`);
    
  } catch (error) {
    console.error('❌ Error splitting CSV files:', error);
    process.exit(1);
  }
}

main(); 