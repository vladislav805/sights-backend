create function `getUserFollowersCount`(`userId` bigint) returns int
begin
	declare `count` int;

	select count(*) into `count` from `subscribe` where `targetId` = `userId`;

	return `count`;
end
