const login = document.getElementById('login');
try {
  const resp = await fetch('/api/auth/profile');
  if (resp.ok) {
    const user = await resp.json();
    let res = await fetch(`api/auth/token`);
    let resJSON = await res.json();
    accessToken = resJSON.access_token;
    login.innerText = `Logout (${user.name})`;
    login.onclick = () => window.location.replace('/api/auth/logout');
  } else {
    login.innerText = 'Login';
    login.onclick = () => window.location.replace('/api/auth/login');
  }
  login.style.visibility = 'visible';
} catch (err) {
  alert('Could not initialize the application. See console for more details.');
  console.error(err);
}