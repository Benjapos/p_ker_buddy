const fs = require('fs-extra');
const path = require('path');

async function copyBuildToDocs() {
  try {
    const buildPath = path.join(__dirname, '..', 'build');
    const docsPath = path.join(__dirname, '..', 'docs');
    
    // Check if build folder exists
    if (!fs.existsSync(buildPath)) {
      console.log('❌ Build folder not found. Run "npm run build" first.');
      process.exit(1);
    }
    
    // Remove existing docs content
    if (fs.existsSync(docsPath)) {
      await fs.remove(docsPath);
    }
    
    // Copy build to docs
    await fs.copy(buildPath, docsPath);
    
    // Source maps are not needed on the live site and add ~700KB to every commit
    for (const file of await fs.readdir(path.join(docsPath, 'static', 'js'))) {
      if (file.endsWith('.map')) await fs.remove(path.join(docsPath, 'static', 'js', file));
    }
    
    console.log('✅ Build copied to docs folder successfully!');
    console.log(`📁 Source: ${buildPath}`);
    console.log(`📁 Destination: ${docsPath}`);
    
  } catch (error) {
    console.error('❌ Error copying build to docs:', error);
    process.exit(1);
  }
}

copyBuildToDocs(); 