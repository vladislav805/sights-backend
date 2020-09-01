create function `getCountOfCommentsOnSight`(`p_sightId` int) returns int
begin
	declare `r` int;

	select count(*) into `r` from `comment` where `sightId` = `p_sightId`;

	return `r`;
end
