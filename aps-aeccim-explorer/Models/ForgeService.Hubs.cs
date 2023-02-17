using System.Collections.Generic;
using System.Threading.Tasks;
using Autodesk.Forge;
using Autodesk.Forge.Model;

public partial class ForgeService
{
	public async Task<IEnumerable<dynamic>> GetVersions(string projectId, string itemId, Tokens tokens)
	{
		var versions = new List<dynamic>();
		var api = new ItemsApi();
		api.Configuration.AccessToken = tokens.InternalToken;
		var response = await api.GetItemVersionsAsync(projectId, itemId);
		foreach (KeyValuePair<string, dynamic> version in new DynamicDictionaryItems(response.data))
		{
			versions.Add(version.Value);
		}
		return versions;
	}
}