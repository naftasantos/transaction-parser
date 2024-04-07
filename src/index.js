const { JSDOM } = require('jsdom');

let inputData = '';

process.stdin.on('data', data => {
  inputData += data.toString();
});

process.stdin.on('end', () => {
  const bareText = stripHtml(inputData);
  const parsedData = parseText(bareText);
  console.log(parsedData);
});

function stripHtml(html) {
  const document = new JSDOM(html).window.document;
  const body = document.querySelector('body');
  return body.textContent;
}

function parseText(text) {
  const lines = text.split('\n');
  const noEmptyLines = lines.filter(line => line.trim() !== '');
  const data = {
    description: ''
  };
  let currentKey = null;

  for (const line of noEmptyLines) {
    const match = line.match(/([^:]+):$/);
    if (match) {
      currentKey = match[1].trim();
    } else if (currentKey) {
      normalizeValue(currentKey, line.trim(), data);
      currentKey = null;
    }
  }

  return data;
}

function normalizeValue(key, value, data) {
  const lowerCaseKey = key.toLowerCase();

  if (lowerCaseKey === 'account') {
    data[lowerCaseKey] = value.trim().replaceAll('\*', '');
  } else if(lowerCaseKey.endsWith('amount')) {
    data['amount'] = parseFloat(value.trim().replaceAll('\$', '').replaceAll(',', ''));
    if (lowerCaseKey.includes(' ')) {
      const [type, _] = lowerCaseKey.split(' ');
      data['type'] = type;
    } else {
      data['type'] = 'purchase';
    }
  } else if(lowerCaseKey.endsWith('date')) {
    data['date'] = new Date(value.trim()).toISOString();
  } else if(lowerCaseKey.endsWith('description')) {
    data['description'] = value.trim();
  }
}