import axios from "axios";
import { sequenceT } from "fp-ts/Apply";
import { filter, reduce } from "fp-ts/Array";
import * as E from "fp-ts/Either";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import { flow } from "fp-ts/lib/function";
import "../config/axios.config";
import { Album, Post, Result, User } from "../types";

const getMaxIdObject = <T extends { id: number; userId: number }>(id: number, arr: T[]): T =>
    flow(
        filter((obj: T) => id === obj.userId),
        reduce({ id: null } as T, (max, current) => (max.id > current.id ? max : current))
    )(arr);

const processData = (users: User[], posts: Post[], albums: Album[]): Result[] =>
    users.map(({ id, name, email }) => ({
        id,
        name,
        email,
        post: getMaxIdObject(id, posts).title,
        album: getMaxIdObject(id, albums).title,
    }));

export const fetchData = (): TE.TaskEither<Error, Result[]> => {
    return pipe(
        sequenceT(TE.ApplyPar)(
            TE.tryCatch(
                () => axios.get("/users"),
                (error: unknown) => new Error(`Fetching users data. ${(error as Error).message}`)
            ),
            TE.tryCatch(
                () => axios.get("/posts"),
                (error: unknown) => new Error(`Fetching posts data. ${(error as Error).message}`)
            ),
            TE.tryCatch(
                () => axios.get("/albums"),
                (error: unknown) => new Error(`Fetching albums data. ${(error as Error).message}`)
            )
        ),
        TE.map(([usersRes, postsRes, albumsRes]) => processData(usersRes.data, postsRes.data, albumsRes.data))
    );
};

export const handleResult = (res: any) => (result: E.Either<Error, Result[]>) => {
    if (E.isLeft(result)) {
        res.status(500).send(result.left.message);
    } else {
        res.send(JSON.stringify(result.right));
    }
};
