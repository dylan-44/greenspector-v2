#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const dir = path.resolve(__dirname, '../content/en/pages/ressources/etudes-de-cas');
const actionMap = {
  'Demander une démo': 'Request a demo',
  'Découvrir\n                        Greenspector Studio': 'Discover\n                        Greenspector Studio'
};

for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.json') && f !== 'index.json')) {
  const filePath = path.join(dir, file);
  const page = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  if (page.hero?.label === 'Étude de cas') {
    page.hero.label = 'Case study';
  }
  if (page.hero?.actions) {
    page.hero.actions = page.hero.actions.map((action) => ({
      ...action,
      label: actionMap[action.label] || action.label
    }));
  }
  fs.writeFileSync(filePath, `${JSON.stringify(page, null, 2)}\n`, 'utf8');
  console.log('Fixed', file);
}
