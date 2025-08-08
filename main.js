import jsonfile from "jsonfile";
import moment from "moment";
import simpleGit from "simple-git";

const path = "./data.json";
const git = simpleGit();

// Array to keep track of used days
let usedDays = [];

// Function to generate random number between min and max (inclusive)
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Function to get a unique number of days
function getUniqueDays() {
  // If all possible days (1-30) are used, stop the process
  if (usedDays.length >= 50) {
    console.log("🏁 All possible days (1-30) have been used. Stopping automation.");
    clearInterval(intervalId); // Clear the interval
    process.exit(0); // Exit the process
  }

  let numberOfSubtractDays;
  do {
    numberOfSubtractDays = getRandomInt(200, 250);
  } while (usedDays.includes(numberOfSubtractDays));

  // Add the new number to usedDays
  usedDays.push(numberOfSubtractDays);
  return numberOfSubtractDays;
}

async function automateCommits() {
  try {
    // Generate random number of commits (10-20) and unique days to subtract (1-30)
    const numberOfCommits = getRandomInt(0, 20);
    const numberOfSubtractDays = getUniqueDays();
    
    console.log(`\n🚀 Starting new cycle: ${numberOfCommits} commits, ${numberOfSubtractDays} days back`);
    console.log(`📅 Used days history: [${usedDays.join(', ')}]`);

    // Perform the specified number of commits
    for (let i = 0; i < numberOfCommits; i++) {
      const date = moment().subtract(numberOfSubtractDays, 'days').format();

      const data = {
        date,
        timestamp: Date.now(),
        message: `Automated commit ${i + 1}/${numberOfCommits} at ${date}`
      };

      console.log(`\n🔄 Commit ${i + 1}/${numberOfCommits} for ${date}`);

      // Write data to file
      await new Promise((resolve, reject) => {
        jsonfile.writeFile(path, data, { spaces: 2 }, (err) => {
          if (err) {
            reject(err);
          } else {
            console.log("✅ Data written to file successfully");
            resolve();
          }
        });
      });

      // Add the file to git
      await git.add([path]);
      console.log("📁 File added to git");

      // Commit with timestamp
      const commitMessage = `Automated update ${i + 1}/${numberOfCommits}: ${date}`;
      await git.commit(commitMessage, { '--date': date });
      console.log("💾 Changes committed");
    }

    // Check if remote exists, if not add it
    try {
      const remotes = await git.getRemotes(true);
      const originExists = remotes.some(remote => remote.name === 'origin');
      
      if (!originExists) {
        await git.addRemote("origin", "https://github.com/AliBaig102/github-commit-generator-nodejs");
        console.log("🔗 Remote origin added");
      }
    } catch (error) {
      // Remote might already exist, continue
    }

    // Push to remote
    await git.push("origin", "master");
    console.log("🚀 All commits pushed to remote successfully!");
    console.log("⏰ Waiting for next cycle...\n");

  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

// Start the automation with setInterval
console.log("🔄 Starting continuous automation with random commits (10-20) and unique random days (1-30)...");
console.log("Press Ctrl+C to stop the automation manually, or it will stop after using all 30 days\n");

// Store intervalId to clear it later
const intervalId = setInterval(automateCommits, 5000);

// Run immediately first time
automateCommits();