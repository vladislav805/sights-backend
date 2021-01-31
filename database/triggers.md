# Triggers
## Collection
```mysql
create definer = `www`@`%` trigger `onAddCollection`
    after insert
    on `collection`
    for each row
begin
    insert into `feed` (`actorId`, `date`, `collectionId` ) values (`new`.`ownerId`, `new`.`dateCreated`, `new`.`collectionId`);
end;
```

## Comment
```mysql
create definer = `www`@`%` trigger `onAddComment`
    after insert
    on `comment`
    for each row
begin
	declare `oId` bigint;

	if (`new`.`sightId` is not null) then
        select `ownerId` into `oId` from `sight` where `sightId` = `new`.`sightId`;
    end if;

    if (`new`.`collectionId` is not null) then
        select `ownerId` into `oId` from `collection` where `collection`.`collectionId` = `new`.`collectionId`;
    end if;

    if (`oId` <> `new`.`userId`) then
        insert into `feed` (`actorId`, `date`, `commentId` ) values (`new`.`userId`, `new`.`date`, `new`.`commentId`);
    end if;
end;
```

## Photo
```mysql
create definer = `www`@`%` trigger `onPhotoAdd`
    after insert
    on `photo`
    for each row
begin
	insert into `feed` (`actorId`, `date`, `photoId`) values (`new`.`ownerId`, `new`.`date`, `new`.`photoId`);
end;


# ????
create definer = `www`@`%` trigger `onPhotoApproved`
    after update
    on `photo`
    for each row
BEGIN

    DECLARE `sightId` INTEGER;

    IF (`old`.`type` = 3 AND `new`.`type` <> `old`.`type`) THEN
        SELECT
            `sight`.`sightId` INTO `sightId`
        FROM
            `sight`, `sightPhoto`
        WHERE
            `sight`.`sightId` = `sightPhoto`.`sightId` AND `sightPhoto`.`photoId` = `old`.`photoId`;

        # INSERT INTO `event` (`date`, `type`, `ownerUserId`, `actionUserId`, `subjectId`) VALUES (UNIX_TIMESTAMP(NOW()), 17, `new`.`ownerId`, 0, `sightId`);
    END IF;
END;

# ????
create definer = `www`@`%` trigger `onPhotoRemoved`
    after delete
    on `photo`
    for each row
begin
    # INSERT INTO `trashPhoto` (`name`) VALUES (CONCAT(`OLD`.`path`, `OLD`.`photo200`))
end;
```

## Rating
```mysql
create definer = `www`@`%` trigger `onRatingDelete`
    after delete
    on `rating`
    for each row
begin
	call rebuildRating(`old`.`sightId`, `old`.`collectionId`);
end;


create definer = `www`@`%` trigger `onRatingInsert`
    after insert
    on `rating`
    for each row
begin
    call rebuildRating(`new`.`sightId`, `new`.`collectionId`);
end;


create definer = `www`@`%` trigger `onRatingUpdate`
    after update
    on `rating`
    for each row
begin
    call rebuildRating(`new`.`sightId`, `new`.`collectionId`);
end;
```

## Sight
```mysql
create definer = `www`@`%` trigger `onAddSight`
    after insert
    on `sight`
    for each row
begin
    insert into `feed` (`actorId`, `date`, `sightId`) values (`new`.`ownerId`, `new`.`dateCreated`, `new`.`sightId`);
end;
```

## Sight-Photo
```mysql
# FIXME
create definer = `www`@`%` trigger `onPhotoSuggested`
    after insert
    on `sightPhoto`
    for each row
BEGIN
    DECLARE `type` INTEGER;
    DECLARE `oid` INTEGER;
    DECLARE `aid` INTEGER;

    SELECT `photo`.`type` INTO `type` FROM `photo` WHERE `photo`.`photoId` = `new`.`photoId`;
    SELECT `photo`.`ownerId` INTO `aid` FROM `photo` WHERE `photo`.`photoId` = `new`.`photoId`;

    IF (`type` = 3) THEN
        SELECT `ownerId` INTO `oid` FROM `sight` WHERE `sightId` = `new`.`sightId`;
        # INSERT INTO `event` (`date`, `type`, `ownerUserId`, `actionUserId`, `subjectId`) VALUES (UNIX_TIMESTAMP(NOW()), 16, `oid`, `aid`, `new`.`sightId`);
    END IF;
END;
```
