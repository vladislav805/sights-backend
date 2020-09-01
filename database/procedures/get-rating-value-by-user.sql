create function `getRatedSightByUser`(`uid` int, `sid` int) returns bigint
begin
	declare `r` int;

	if `uid` = 0 then
		return 0;
	end if;

	select `rate` into `r` from `rating` where `rating`.`sightId` = `sid` and `rating`.`userId` = `uid`;

	if `r` is null then
		return 0;
	end if;

	return `r`;
end
