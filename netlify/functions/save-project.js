const { getStore } = require('@netlify/blobs');
const { buildSummary, jsonResponse } = require('./_lib');

exports.default = async (req) => {
  try {
    const project = await req.json();
    if (!project || !project.id) {
      return jsonResponse({ ok: false, error: 'missing project id' }, 400);
    }

    const store = getStore('projects');
    await store.setJSON(`project:${project.id}`, project);
    await store.setJSON(`summary:${project.id}`, buildSummary(project));

    return jsonResponse({ ok: true });
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err) }, 500);
  }
};

exports.config = { path: '/api/save-project' };
