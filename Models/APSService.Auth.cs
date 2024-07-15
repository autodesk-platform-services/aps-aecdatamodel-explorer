using System;
using System.Threading.Tasks;
using Autodesk.Authentication.Model;
using Autodesk.Forge;
using System.Security.Cryptography;
using System.Text.RegularExpressions;
using Newtonsoft.Json.Linq;
using System.Text;
using System.Web;

public partial class APSService
{
	public string GetAuthorizationURL(string client_id = "", string client_secret = "")
	{
		if (string.IsNullOrEmpty(client_id) || string.IsNullOrEmpty(client_secret))
		{
			_customCredentials = false;
			return _authClient.Authorize(_clientId, ResponseType.Code, _callbackUri, InternalTokenScopes);
		}
		else
		{
			_customCredentials = true;
			_customclientId = client_id;
			_customclientSecret = client_secret;
			return _authClient.Authorize(client_id, ResponseType.Code, _callbackUri, InternalTokenScopes);
		}
	}

	public void RemoveCustomCredentials()
	{
		_customclientId = "";
		_customclientSecret = "";
		_customCredentials = false;
	}

	public async Task<Tokens> GenerateTokens(string code)
	{
		ThreeLeggedToken internalAuth;
		RefreshToken publicAuth;
		if (!_customCredentials)
		{
			internalAuth = await _authClient.GetThreeLeggedTokenAsync(_clientId, _clientSecret, code, _callbackUri);
			publicAuth = await _authClient.GetRefreshTokenAsync(_clientId, _clientSecret, internalAuth.RefreshToken, PublicTokenScopes);
		}
		else
		{
			internalAuth = await _authClient.GetThreeLeggedTokenAsync(_customclientId, _customclientSecret, code, _callbackUri);
			publicAuth = await _authClient.GetRefreshTokenAsync(_customclientId, _customclientSecret, internalAuth.RefreshToken, PublicTokenScopes);
		}
		return new Tokens
		{
			PublicToken = publicAuth.AccessToken,
			InternalToken = internalAuth.AccessToken,
			RefreshToken = publicAuth._RefreshToken,
			ExpiresAt = DateTime.Now.ToUniversalTime().AddSeconds((double)internalAuth.ExpiresIn)
		};
	}

	public async Task<Tokens> RefreshTokens(Tokens tokens)
	{
		RefreshToken internalAuth;
		RefreshToken publicAuth;
		if (_customCredentials)
		{
			internalAuth = await _authClient.GetRefreshTokenAsync(_clientId, _clientSecret, tokens.RefreshToken, InternalTokenScopes);
			publicAuth = await _authClient.GetRefreshTokenAsync(_clientId, _clientSecret, internalAuth._RefreshToken, PublicTokenScopes);
		}
		else
		{
			internalAuth = await _authClient.GetRefreshTokenAsync(_clientId, _clientSecret, tokens.RefreshToken, InternalTokenScopes);
			publicAuth = await _authClient.GetRefreshTokenAsync(_clientId, _clientSecret, internalAuth._RefreshToken, PublicTokenScopes);
		}
		return new Tokens
		{
			PublicToken = publicAuth.AccessToken,
			InternalToken = internalAuth.AccessToken,
			RefreshToken = publicAuth._RefreshToken,
			ExpiresAt = DateTime.Now.ToUniversalTime().AddSeconds((double)internalAuth.ExpiresIn).AddSeconds(-1700)
		};
	}

	public async Task<dynamic> GetUserProfile(Tokens tokens)
	{
		var api = new UserProfileApi();
		api.Configuration.AccessToken = tokens.InternalToken;
		dynamic profile = await api.GetUserProfileAsync();
		return profile;
	}
}