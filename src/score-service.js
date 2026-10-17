import { houses, initialEvents, initialAdjustments } from './data';

export const REPOSITORY = 'PasinduDushangana/2027-BCG-Sportmeet';
export const SCORE_PATH = 'public/scores.json';
export const INITIAL_REVISION = 'initial-v1';
export const initialPublished = {
  schemaVersion: 1,
  revision: INITIAL_REVISION,
  publishedAt: null,
  isSample: true,
  events: initialEvents,
  adjustments: initialAdjustments,
};
const houseIds = new Set(houses.map(h => h.id));

export function validateScores(data) {
  if (!data || !Array.isArray(data.events) || data.events.length > 200 || !data.adjustments) throw new Error('Invalid score document.');
  const ids = new Set();
  for (const event of data.events) {
    if (typeof event.id !== 'string' || !event.id || ids.has(event.id)) throw new Error('Each event needs a unique ID.');
    ids.add(event.id);
    for (const field of ['name', 'division', 'time']) {
      if (typeof event[field] !== 'string' || !event[field].trim() || event[field].length > 160) throw new Error('Each event needs a name, division, and start time (up to 160 characters).');
    }
    if (!['Track','Field','Team'].includes(event.category) || !['Completed','Upcoming'].includes(event.status)) throw new Error('Check event categories and statuses.');
    if (!Array.isArray(event.results) || event.results.length > 100) throw new Error('An event can have up to 100 results.');
    for (const result of event.results) {
      if (!houseIds.has(result.houseId) || typeof result.athlete !== 'string' || result.athlete.length > 160 || !Number.isInteger(result.place) || result.place < 1 || result.place > 100 || !Number.isFinite(result.points) || result.points < 0 || result.points > 100000) throw new Error('Each result needs a valid house, position (1–100), and points (0–100,000).');
    }
  }
  for (const id of houseIds) {
    if (!Number.isFinite(data.adjustments[id]) || data.adjustments[id] < 0 || data.adjustments[id] > 1000000) throw new Error('House adjustments must be between 0 and 1,000,000 points.');
  }
  return data;
}
export function validatePublished(data) {
  validateScores(data);
  if (data.schemaVersion !== 1 || typeof data.revision !== 'string' || !data.revision || typeof data.isSample !== 'boolean' || (data.publishedAt !== null && (typeof data.publishedAt !== 'string' || !Number.isFinite(Date.parse(data.publishedAt))))) throw new Error('Unrecognized published score format.');
  return data;
}

export async function readPublishedScores(signal) {
  const suffix = `?refresh=${Date.now()}`;
  const sources = [
    `https://raw.githubusercontent.com/${REPOSITORY}/main/${SCORE_PATH}${suffix}`,
    `${import.meta.env.BASE_URL}scores.json${suffix}`,
  ];
  for (const source of sources) {
    try {
      const response = await fetch(source, { cache: 'no-store', signal: signal ? AbortSignal.any([signal, AbortSignal.timeout(8000)]) : AbortSignal.timeout(8000) });
      if (!response.ok) continue;
      return validatePublished(await response.json());
    } catch (error) {
      if (signal?.aborted) throw error;
    }
  }
  throw new Error('The published scoreboard is temporarily unavailable. Showing the last available scores.');
}

function encodeDocument(data) {
  const bytes = new TextEncoder().encode(JSON.stringify(data, null, 2) + '\n');
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}
function decodeDocument(content) {
  const bytes = Uint8Array.from(atob(content.replace(/\s/g,'')), char => char.charCodeAt(0));
  return JSON.parse(new TextDecoder().decode(bytes));
}
function apiError(status) {
  if (status === 401) return new Error('GitHub could not verify this token. Check the token or its expiry date.');
  if (status === 403 || status === 404) return new Error('This token needs access to this repository with Contents: Read and write permission.');
  if (status === 409 || status === 422) return new Error('The score file changed while publishing. Load the latest published scores and apply your changes again.');
  return new Error('GitHub could not publish the scores. Your draft is safe; try again later.');
}
export async function publishScores(draft, token) {
  validateScores(draft);
  if (!token.trim()) throw new Error('Enter a GitHub token to publish.');
  const endpoint = `https://api.github.com/repos/${REPOSITORY}/contents/${SCORE_PATH}`;
  const headers = { Accept: 'application/vnd.github+json', Authorization: `Bearer ${token.trim()}`, 'X-GitHub-Api-Version': '2022-11-28' };
  const options = { headers, cache: 'no-store', redirect: 'error', referrerPolicy: 'no-referrer', signal: AbortSignal.timeout(20000) };
  const response = await fetch(`${endpoint}?ref=main`, options);
  if (!response.ok) throw apiError(response.status);
  const file = await response.json();
  const current = validatePublished(decodeDocument(file.content));
  if (current.revision !== draft.baseRevision) throw new Error('Another editor has published newer scores. Export your draft, then load the latest published scores before publishing.');
  const document = {
    schemaVersion: 1, revision: crypto.randomUUID(), publishedAt: new Date().toISOString(), isSample: false,
    events: draft.events, adjustments: draft.adjustments,
  };
  const result = await fetch(endpoint, {
    ...options, signal: AbortSignal.timeout(20000), method: 'PUT', headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: 'Publish sports meet scores', content: encodeDocument(document), sha: file.sha, branch: 'main' }),
  });
  if (!result.ok) throw apiError(result.status);
  return document;
}
