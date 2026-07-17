const { getStore } = require('@netlify/blobs');
const { jsonResponse } = require('./_lib');

exports.default = async (req) => {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get('id');
    if (!id) return jsonResponse(null, 400);

    const store = getStore('projects');
    const project = await store.get(`project:${id}`, { type: 'json' });
    return jsonResponse(project || null);
  } catch (err) {
    return jsonResponse({ error: String(err) }, 500);
  }
};

exports.config = { path: '/api/project' };
