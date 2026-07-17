const { getStore } = require('@netlify/blobs');
const { jsonResponse } = require('./_lib');

exports.default = async () => {
  try {
    const store = getStore('projects');
    const { blobs } = await store.list({ prefix: 'summary:' });
    const summaries = await Promise.all(
      blobs.map((b) => store.get(b.key, { type: 'json' }))
    );
    return jsonResponse(summaries.filter(Boolean));
  } catch (err) {
    return jsonResponse({ error: String(err) }, 500);
  }
};

exports.config = { path: '/api/overview' };
