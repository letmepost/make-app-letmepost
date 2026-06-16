function lmpTargets(accountIds, bluesky) {
	return (accountIds || []).map(function (id) {
		var target = { accountId: id };
		if (bluesky && bluesky.replyToUri && bluesky.replyToCid) {
			target.options = {
				platform: 'bluesky',
				replyToUri: bluesky.replyToUri,
				replyToCid: bluesky.replyToCid
			};
			if (bluesky.replyRootUri && bluesky.replyRootCid) {
				target.options.replyRootUri = bluesky.replyRootUri;
				target.options.replyRootCid = bluesky.replyRootCid;
			}
		}
		return target;
	});
}
