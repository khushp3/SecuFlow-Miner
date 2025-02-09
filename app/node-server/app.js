const express = require('express');
const { exec } = require("child_process");
const path = require('path');
const {spawn} = require('child_process');
const fs = require('fs').promises;
const app = express();
const port = 8089;


console.log(__dirname)

// Serve the static files from the React app
app.use(express.static(path.join(__dirname, 'client/build')));

let x


function getRepoName(repoUrl) {
    // Remove the .git at the end if it exists
    const trimmedUrl = repoUrl.endsWith('.git') ? repoUrl.slice(0, -4) : repoUrl;
  
    // Split the URL by '/' and get the last part
    const parts = trimmedUrl.split('/');
    return parts[parts.length - 1]; // This will be 'rosdistro'
  }
  
  // Route to run Python script with user input
  app.get("/run", (req, res) => {
    const userInput = req.query.link;
    repourl = userInput;
    x=userInput
    console.log(`Repository URL: ${repourl}`);

    const command = `python3 calculator.py "${repourl}"`;
    
    // Set the working directory to the 'miner' folder
    const options = { cwd: path.join(__dirname, "miner") };
  
    exec(command, options, (error, stdout, stderr) => {
      if (error) {
        console.error(`Execution error: ${error}`);
        return res.json({ error: "Python script failed", details: stderr });
      }
      console.log("Python script output:", stdout);
      res.json({ status: "ready", repo_name: repourl});
    });
  });
  
// Serve React app for all unknown routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

app.get('/api/Actual-Graph', (req, res) => {
    const jsonFilePath = path.join(__dirname, 'miner/cache/MC-Actual-Graph-' + x + '.json');
    res.sendFile(jsonFilePath);
  });

  app.get('/api/Requirements-Graph', (req, res) => {
    const secondJsonFilePath = path.join(__dirname, 'miner/cache/MC-Requirements-Graph-'+ x + '.json'); // Adjust the file name as needed
    res.sendFile(secondJsonFilePath);
});

app.get('/api/Bar-Graph-Data', async (req, res) => {  
    const thirdJsonFilePath = path.join(__dirname, 'miner/cache/mc-stc-' + x);  

    await fs.access(thirdJsonFilePath);  
    const data = await fs.readFile(thirdJsonFilePath, 'utf8');  
    const value = parseFloat(data.trim());  

    res.json({ name: 'Value', value: value });
});
  
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

