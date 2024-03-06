using Autodesk.DataManagement.Model;
using System.Collections.Generic;
using System.Threading.Tasks;

public partial class APSService
{
	public async Task<IEnumerable<dynamic>> GetVersions(string projectId, string itemId, Tokens tokens)
	{
		Versions versions = await _dataManagementClient.GetItemVersionsAsync(projectId, itemId);
		return versions.Data;
	}
}