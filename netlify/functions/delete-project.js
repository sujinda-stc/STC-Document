const { getStore } = require('@netlify/blobs');
const { jsonResponse } = require('./_lib');

exports.default = async (req) => {
  try {
    const body = await req.json();
    const id = body && body.id;
    if (!id) return jsonResponse({ ok: false, error: 'missing id' }, 400);

    const store = getStore('projects');
    await store.delete(`project:${id}`);
    await store.delete(`summary:${id}`);

    return jsonResponse({ ok: true });
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err) }, 500);
  }
};

exports.config = { path: '/api/delete-project' };
