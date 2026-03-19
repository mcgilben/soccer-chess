import { DEFAULT_PROFILE_ID, RULE_PROFILES } from '../rules/profiles.js';

const byId = (id) => document.getElementById(id);

const selector = byId('profile-selector');
const description = byId('profile-description');
const highlights = byId('profile-highlights');
const startGameButton = byId('start-game');
const resetButton = byId('reset-game');
const pregamePanel = byId('pregame-panel');
const matchPanel = byId('match-panel');
const matchTitle = byId('match-title');
const kickoffState = byId('kickoff-state');
const passShotState = byId('pass-shot');
const movementState = byId('movement');
const scoringState = byId('scoring');

for (const profile of RULE_PROFILES) {
  const option = document.createElement('option');
  option.value = profile.id;
  option.textContent = profile.label;
  selector.append(option);
}

selector.value = DEFAULT_PROFILE_ID;

function currentProfile() {
  return RULE_PROFILES.find((profile) => profile.id === selector.value) ?? RULE_PROFILES[0];
}

function renderProfilePreview() {
  const profile = currentProfile();
  description.textContent = `${profile.description} Source: ${profile.sourcePage}`;

  highlights.innerHTML = '';
  const items = [
    `Kickoff: ${
      profile.kickoff.mode === 'center-spot'
        ? 'Ball starts at center spot with no owner'
        : `Goalkeeper starts with possession (${profile.kickoff.owner})`
    }`,
    `Pass/shot: ${profile.passShotBehavior.passesPerTurn} pass(es) per turn; shot after pass ${
      profile.passShotBehavior.canShootAfterPass ? 'allowed' : 'blocked'
    }; shot without pass ${profile.passShotBehavior.canShootWithoutPass ? 'allowed' : 'blocked'}`,
    `Scoring: +${profile.scoring.goalPoints} goal, ${profile.scoring.ownGoalPenalty} own goal; ${profile.scoring.winCondition}`,
  ];

  for (const item of items) {
    const li = document.createElement('li');
    li.textContent = item;
    highlights.append(li);
  }
}

function startMatch() {
  const profile = currentProfile();
  pregamePanel.hidden = true;
  matchPanel.hidden = false;

  matchTitle.textContent = `Live match (${profile.label})`;
  kickoffState.textContent = `Initial ball state: ${
    profile.kickoff.mode === 'center-spot'
      ? 'center spot, neutral possession'
      : `goalkeeper possession (${profile.kickoff.owner})`
  }`;
  passShotState.textContent = `Pass/shot behavior: ${profile.passShotBehavior.passesPerTurn} pass(es)/turn; shoot-after-pass ${
    profile.passShotBehavior.canShootAfterPass ? 'yes' : 'no'
  }; shoot-without-pass ${profile.passShotBehavior.canShootWithoutPass ? 'yes' : 'no'}.`;
  movementState.textContent = `Special movement restrictions: ${profile.movementRestrictions.join(' ')}`;
  scoringState.textContent = `Scoring/win: ${profile.scoring.winCondition}`;
}

function resetMatch() {
  pregamePanel.hidden = false;
  matchPanel.hidden = true;
}

selector.addEventListener('change', renderProfilePreview);
startGameButton.addEventListener('click', startMatch);
resetButton.addEventListener('click', resetMatch);

renderProfilePreview();
