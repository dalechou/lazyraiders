const axios = require('axios');
const Table = require('cli-table');

const url = 'https://raider.io/api/v1/characters/profile';
const region = 'us';
const locale = 'en';
const raid = 'castle-nathria';
const dungeon = 'plaguefall';
const daysAgo = 7;

const characters = [];
const table = new Table({
  head: ['Player', 'Realm', 'Key Level'],
  colWidths: [20, 20, 10],
});

// read player and realm information from the text file
const fs = require('fs');
const lines = fs.readFileSync('characters.txt', 'utf-8').split('\n');
for (const line of lines) {
  const [player, realm] = line.split('-');
  characters.push({ player, realm });
}

// function to format the dungeon name
function formatDungeonName(dungeonName) {
  return dungeonName.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
}

// function to get the mythic+ data for a character
async function getMythicData(character) {
  const params = {
    region,
    realm: character.realm,
    name: character.player,
    fields: 'mythic_plus_recent_runs',
  };
  const response = await axios.get(url, { params });
  const runs = response.data.mythic_plus_recent_runs;

  for (const run of runs) {
    const lastWeek = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
    const completedAt = new Date(run.completed_at);
    if (run.dungeon === dungeon && completedAt >= lastWeek) {
      return run.keystone_level;
    }
  }
  return '-';
}

// async function to get mythic+ data for all characters
async function getMythicDataForAll() {
  for (const character of characters) {
    const keyLevel = await getMythicData(character);
    table.push([character.player, character.realm, keyLevel]);
  }
  console.log(table.toString());
}

getMythicDataForAll();
