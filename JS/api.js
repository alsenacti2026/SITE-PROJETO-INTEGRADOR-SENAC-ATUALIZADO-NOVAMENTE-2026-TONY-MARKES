var API_BASE = '/api';

function saveToken(token) {
  localStorage.setItem('jwt_token', token);
}

function getToken() {
  return localStorage.getItem('jwt_token');
}

function isAuthenticated() {
  return !!getToken();
}

function logout() {
  localStorage.removeItem('jwt_token');
  window.location.href = '/login.html';
}

async function authFetch(endpoint, options) {
  options = options || {};
  var token = getToken();
  var headers = Object.assign({ 'Content-Type': 'application/json' }, options.headers || {});
  if (token) headers['Authorization'] = 'Bearer ' + token;

  var response = await fetch(API_BASE + endpoint, Object.assign({}, options, { headers: headers }));

  if (response.status === 401) {
    logout();
    throw new Error('Sessão expirada');
  }

  return response;
}

async function apiFetch(endpoint, options) {
  var response = await authFetch(endpoint, options);
  var data;
  try { data = await response.json(); } catch (_) { data = null; }
  if (!response.ok) throw new Error((data && data.message) || 'Erro na requisição');
  return data;
}

async function uploadFile(endpoint, file) {
  var token = getToken();
  var formData = new FormData();
  formData.append('photo', file);

  var response = await fetch(API_BASE + endpoint, {
    method: 'POST',
    headers: token ? { 'Authorization': 'Bearer ' + token } : {},
    body: formData,
  });

  if (response.status === 401) {
    logout();
    throw new Error('Sessão expirada');
  }

  var data;
  try { data = await response.json(); } catch (_) { data = null; }
  if (!response.ok) throw new Error((data && data.message) || 'Erro no upload');
  return data;
}
