create function `getRandomSightId`() returns bigint
begin
	declare `count` int;
	declare `lim` int;
	declare `sid` int;

	select count(*) into `count` from `sight`;

	set `lim` = floor(1 + rand() * `count`);

	select `sightId` into `sid` from `sight` limit `lim`, 1;
	return `sid`;
end
