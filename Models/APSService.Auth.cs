using System;
using System.Threading.Tasks;
using Autodesk.Authentication.Model;
using Autodesk.Forge;

public partial class APSService
{
	public string GetAuthorizationURL()
	{
        return _authClient.Authorize(_clientId, ResponseType.Code, _callbackUri, InternalTokenScopes);
		//return new ThreeLeggedApi().Authorize(_clientId, "code", _callbackUri, InternalTokenScopes);
	}

	public async Task<Tokens> GenerateTokens(string code)
	{
        ThreeLeggedToken internalAuth = await _authClient.GetThreeLeggedTokenAsync(_clientId, _clientSecret, code, _callbackUri);
        RefreshToken publicAuth = await _authClient.GetRefreshTokenAsync(_clientId, _clientSecret, internalAuth.RefreshToken, PublicTokenScopes);
		//dynamic internalAuth = await new ThreeLeggedApi().GettokenAsync(_clientId, _clientSecret, "authorization_code", code, _callbackUri);
		//dynamic publicAuth = await new ThreeLeggedApi().RefreshtokenAsync(_clientId, _clientSecret, "refresh_token", internalAuth.refresh_token, PublicTokenScopes);
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
        RefreshToken internalAuth = await _authClient.GetRefreshTokenAsync(_clientId, _clientSecret, tokens.RefreshToken, InternalTokenScopes);
        RefreshToken publicAuth = await _authClient.GetRefreshTokenAsync(_clientId, _clientSecret, internalAuth._RefreshToken, PublicTokenScopes);
        //dynamic internalAuth = await new ThreeLeggedApi().RefreshtokenAsync(_clientId, _clientSecret, "refresh_token", tokens.RefreshToken, InternalTokenScopes);
        //dynamic publicAuth = await new ThreeLeggedApi().RefreshtokenAsync(_clientId, _clientSecret, "refresh_token", internalAuth.refresh_token, PublicTokenScopes);
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