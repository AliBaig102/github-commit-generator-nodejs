import jsonfile from "jsonfile";
import moment from "moment";
import simpleGit from "simple-git";

const path = "./data.json";
const git = simpleGit();

async function automateCommits() {
  try {
    const date = moment().subtract(2, 'd').format();

    const data = {
      date,
      timestamp: Date.now(),
      message: `Automated commit at ${date}`
    };

    console.log(`\n🚀 Starting automated process at ${date}`);

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
    const commitMessage = `Automated update: ${date}`;
    await git.commit(commitMessage, { '--date': date });
    console.log("💾 Changes committed");

    // Check if remote exists, if not add it
    try {
      const remotes = await git.getRemotes(true);
      const originExists = remotes.some(remote => remote.name === 'origin');
      
      if (!originExists) {
        await git.addRemote("origin", "https://github.com/Mirza-Ali-Baig/github-nodejs.git");
        console.log("🔗 Remote origin added");
      }
    } catch (error) {
      // Remote might already exist, continue
    }

    // Push to remote
    await git.push("origin", "main");
    console.log("🚀 Changes pushed to remote successfully!");
    console.log("⏰ Waiting for next cycle...\n");

  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

// Start the automation with setInterval - runs every 2 seconds
console.log("🔄 Starting continuous automation every 2 seconds...");
console.log("Press Ctrl+C to stop the automation\n");

// Run immediately first time
automateCommits();

// Then run every 5 seconds
setInterval(automateCommits, 5000);
