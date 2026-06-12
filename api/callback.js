function parseCookies(cookieHeader = '') {
  return Object.fromEntries(
    cookieHeader
      .split(';')
      .map((cookie) => cookie.trim().split('='))
      .filter(([key, value]) => key && value)
  );
}

function renderHtml(status, content) {
  const payload = JSON.stringify(content || {});
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>Decap CMS OAuth</title>
  </head>
  <body>
    <script>
      const receiveMessage = (message) => {
        window.opener.postMessage(
          'authorization:github:${status}:${payload}',
          message.origin
        );
        window.removeEventListener('message', receiveMessage, false);
        window.close();
      };

      window.addEventListener('message', receiveMessage, false);
      window.opener.postMessage('authorizing:github', '*');
    </script>
    <p>Autenticazione completata. Puoi chiudere questa finestra.</p>
  </body>
</html>`;
}

module.exports = async function handler(req, res) {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    res.status(500).send('Missing GitHub OAuth environment variables.');
    return;
  }

  const { code, state } = req.query;
  const cookies = parseCookies(req.headers.cookie || '');
  const savedState = cookies.decap_oauth_state;

  res.setHeader(
    'Set-Cookie',
    'decap_oauth_state=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0'
  );

  if (!code) {
    res.status(400).send(renderHtml('error', { error: 'Missing authorization code.' }));
    return;
  }

  if (!state || !savedState || state !== savedState) {
    res.status(400).send(renderHtml('error', { error: 'Invalid OAuth state.' }));
    return;
  }

  try {
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        accept: 'application/json',
        'user-agent': 'robpac-publishing-decap-cms',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error || !tokenData.access_token) {
      res.status(400).send(renderHtml('error', tokenData));
      return;
    }

    res.status(200).send(
      renderHtml('success', {
        token: tokenData.access_token,
        provider: 'github',
      })
    );
  } catch (error) {
    res.status(500).send(renderHtml('error', { error: error.message }));
  }
};
