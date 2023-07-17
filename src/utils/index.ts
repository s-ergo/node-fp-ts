import { filter, reduce } from "fp-ts/Array";
import * as E from "fp-ts/Either";
import { flow } from "fp-ts/lib/function";
import "../config/axios.config";
import { AlbumObject, PostObject, ResultObject, UserObject } from "../types";

export const handleResult = (res: any) => (result: E.Either<Error, any>) => {
    if (E.isLeft(result)) {
        res.status(500).send(result.left.message);
    } else {
        res.send(JSON.stringify(result.right));
    }
};

export const getObjectWithMaxId = <T extends { id: number; userId: number }>(id: number, arr: T[]): T =>
    flow(
        filter((obj: T) => id === obj.userId),
        reduce({ id: null } as T, (max, current) => (max.id > current.id ? max : current))
    )(arr);

export const processData = (users: UserObject[], posts: PostObject[], albums: AlbumObject[]): ResultObject[] =>
    users.map(({ id, name, email }) => ({
        id,
        name,
        email,
        post: getObjectWithMaxId(id, posts).title,
        album: getObjectWithMaxId(id, albums).title,
    }));
