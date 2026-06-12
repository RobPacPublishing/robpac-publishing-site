module.exports = function handler(req, res) {
  const clientId = process.env.GITHUB_CLIENT_ID;

  if (!clientId) {
    res.status(500).send('Missing GITHUB_CLIENT_ID environment variable.');
    return;
  }

  const host = req.headers['x-forwarded-host'] || req.headers.host;
  const proto = req.headers['x-forwarded-proto'] || 'https';
  const baseUrl = `${proto}://${host}`;

  const scope = req.query.scope || 'repo';
  const state = Math.random().toString(36).slice(2) + Date.now().toString(36);
  const redirectUri = `${baseUrl}/api/callback`;

  res.setHeader(
    'Set-Cookie',
    `decap_oauth_state=${state}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`
  );

  const githubUrl = new URL('https://github.com/login/oauth/authorize');
  githubUrl.searchParams.set('client_id', clientId);
  githubUrl.searchParams.set('redirect_uri', redirectUri);
  githubUrl.searchParams.set('scope', scope);
  githubUrl.searchParams.set('state', state);

  res.writeHead(302, { Location: githubUrl.toString() });
  res.end();
};
